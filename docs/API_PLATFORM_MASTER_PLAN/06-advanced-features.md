# Ozzyl API Platform — Part 6: Advanced Features
> Source: API_PLATFORM_MASTER_PLAN.md v6.0 | Sections 14-17

## 14. AI Recommendations (Vectorize)

> **Stack**: Cloudflare Workers AI (`@cf/baai/bge-base-en-v1.5`) + Vectorize index

### Embedding Pipeline

```typescript
// apps/web/server/services/embedding-pipeline.ts
export async function upsertProductEmbedding(env: Env, product: {
  id: number; storeId: number; name: string; description?: string; category?: string
}): Promise<void> {
  const text = [product.name, product.description, product.category].filter(Boolean).join(' ')

  const { data } = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [text],
  }) as { data: number[][] }

  // CRITICAL: always include storeId in metadata for multi-tenant filtering
  await env.VECTORIZE.upsert([{
    id: `store:${product.storeId}:product:${product.id}`,
    values: data[0],
    metadata: {
      storeId: product.storeId,
      productId: product.id,
      name: product.name,
      category: product.category ?? '',
    },
  }])
}
```

### Recommendations Endpoint

```typescript
// GET /v1/recommendations?productId=123&limit=8
export async function getRecommendations(c: Context) {
  const { storeId } = c.var.apiKey
  const productId = c.req.query('productId')
  const limit = Math.min(parseInt(c.req.query('limit') ?? '8'), 20)

  if (!productId) {
    return c.json({ error: { code: 'MISSING_PARAM', message: 'productId required' } }, 400)
  }

  const vectorId = `store:${storeId}:product:${productId}`
  const existing = await c.env.VECTORIZE.getByIds([vectorId])

  if (!existing.length) {
    // Fallback: return newest products
    const db = drizzle(c.env.DB)
    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.status, 'active')))
      .orderBy(desc(productsTable.createdAt)).limit(limit)
    return c.json({ data: products, source: 'fallback' })
  }

  // Query similar — MUST filter by storeId (multi-tenancy)
  const results = await c.env.VECTORIZE.query(existing[0].values, {
    topK: limit + 1,
    filter: { storeId: { $eq: storeId } },
    returnMetadata: 'all',
  })

  const productIds = results.matches
    .filter(m => m.metadata?.productId !== parseInt(productId))
    .slice(0, limit)
    .map(m => m.metadata?.productId as number)

  if (!productIds.length) return c.json({ data: [], source: 'ai' })

  const db = drizzle(c.env.DB)
  const products = await db.select({
    id: productsTable.id, name: productsTable.name,
    price: productsTable.price, images: productsTable.images,
    handle: productsTable.handle,
  }).from(productsTable)
    .where(and(
      eq(productsTable.storeId, storeId),
      inArray(productsTable.id, productIds),
      eq(productsTable.status, 'active')
    ))

  return c.json({ data: products, source: 'ai' })
}
```

### wrangler.toml (Vectorize)

```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "ozzyl-recommendations"
# Create: wrangler vectorize create ozzyl-recommendations --dimensions=768 --metric=cosine
```

---

## 15. Shopify App

> ⚠️ **CSRF Protection (Shopify App Store Requirement)**:
> OAuth `state` parameter MUST be verified before exchanging the code for an access token.
> ```php
> // During OAuth initiation — store state
> $state = bin2hex(random_bytes(16));
> set_transient('ozzyl_shopify_oauth_' . md5($shop), $state, 600);
>
> // During OAuth callback — verify state
> $state = $_GET['state'] ?? '';
> $stored = get_transient('ozzyl_shopify_oauth_' . md5($shop));
> if (!$stored || !hash_equals($stored, $state)) {
>     wp_die('CSRF validation failed', 403);
> }
> delete_transient('ozzyl_shopify_oauth_' . md5($shop));
> ```
> Missing this check = **Shopify App Store rejection** + security vulnerability.


> **Timeline Warning**: Shopify App Store review takes **4-8 weeks** — submit early!
> **Pattern**: Shopify App Bridge 3.x + OAuth 2.0 + HMAC verification

### OAuth Install Flow

```typescript
// apps/web/app/routes/shopify.install.tsx
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const shop = url.searchParams.get('shop')
  if (!shop || !/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(shop)) {
    throw new Response('Invalid shop', { status: 400 })
  }

  const state = crypto.randomUUID()
  const scopes = 'read_products,read_orders,write_script_tags'
  const redirectUri = 'https://app.ozzyl.com/shopify/callback'

  // Store state in KV for CSRF protection (5 min TTL)
  await context.cloudflare.env.KV.put(`shopify:oauth:${state}`, shop, { expirationTtl: 300 })

  const authUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${context.cloudflare.env.SHOPIFY_CLIENT_ID}` +
    `&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`

  return redirect(authUrl)
}

// apps/web/app/routes/shopify.callback.tsx
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const { code, shop, state } = Object.fromEntries(url.searchParams)
  const env = context.cloudflare.env

  // 1. Verify HMAC (protects against forged callbacks)
  const isValid = await verifyShopifyHmac(url.searchParams, env.SHOPIFY_CLIENT_SECRET)
  if (!isValid) throw new Response('Invalid HMAC', { status: 401 })

  // 2. Verify state (CSRF protection)
  const storedShop = await env.KV.get(`shopify:oauth:${state}`)
  if (storedShop !== shop) throw new Response('Invalid state', { status: 401 })
  await env.KV.delete(`shopify:oauth:${state}`)

  // 3. Exchange code for permanent access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  })
  const { access_token } = await tokenRes.json() as { access_token: string }

  // 4. Store token encrypted in KV (never plaintext in D1)
  // ✅ CORRECT: access_token is encrypted before storage (never stored plaintext)
  // encryptSecret uses AES-GCM with env.ENCRYPTION_KEY (set via Cloudflare secret)
  // AES-GCM encrypt helper (add to server/lib/crypto.ts):
  // export async function encryptSecret(value: string, keyHex: string): Promise<string> {
  //   const key = await crypto.subtle.importKey('raw', hexToBytes(keyHex), 'AES-GCM', false, ['encrypt'])
  //   const iv  = crypto.getRandomValues(new Uint8Array(12))
  //   const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(value))
  //   return btoa(String.fromCharCode(...iv)) + '.' + btoa(String.fromCharCode(...new Uint8Array(enc)))
  // }
  // Store encrypted value in KV (not D1) for better security isolation:
  const encrypted = await encryptSecret(access_token, env.ENCRYPTION_KEY)
  // Store in KV with shopId key — KV has better secret isolation than D1
  await env.KV.put('shopify_token:' + shop, encrypted, { expirationTtl: 60 * 60 * 24 * 365 })
  await env.KV.put(`shopify:token:${shop}`, encrypted, { expirationTtl: 60 * 60 * 24 * 365 })

  // 5. Generate Ozzyl API key for this Shopify store
  const { raw, hash, prefix } = await generateApiKey('live')
  // Save api_key to D1, associate with store...

  return redirect(`https://${shop}/admin/apps/ozzyl?setup=complete`)
}

async function verifyShopifyHmac(params: URLSearchParams, secret: string): Promise<boolean> {
  const hmac = params.get('hmac') ?? ''
  const message = [...params.entries()]
    .filter(([k]) => k !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('')

  // Timing-safe compare
  const enc = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
    crypto.subtle.digest('SHA-256', enc.encode(hmac)),
  ])
  return crypto.subtle.timingSafeEqual(a, b)
}
```

### Shopify App Store Checklist

```
□ GDPR webhooks implemented (required):
  □ POST /shopify/webhooks/customers/redact
  □ POST /shopify/webhooks/shop/redact
  □ POST /shopify/webhooks/customers/data_request
□ App Bridge 3.x used (not legacy embedded-app-sdk)
□ All API calls use versioned endpoints (2024-04+)
□ Shopify Billing API used for subscriptions
□ Privacy policy at https://ozzyl.com/privacy
□ Support email configured in Partners dashboard
□ App listing: screenshots, description in English + Bengali
□ Demo video recorded (required for review)
□ Submit via Shopify Partners → allow 4-8 weeks
```

---


> **Rate Limiting implementation**: See Section 5.
> This section covers **usage data storage** — Analytics Engine (real-time) + D1 (audit).

### Cloudflare Analytics Engine (Recommended for High Traffic)

```typescript
// apps/web/server/middleware/usage-tracker.ts
// Cloudflare Analytics Engine — unlimited writes, sub-ms latency, no D1 bottleneck
// Docs: https://developers.cloudflare.com/analytics/analytics-engine/

import { createMiddleware } from 'hono/factory'

export function usageTracker() {
  return createMiddleware(async (c, next) => {
    const start = Date.now()
    await next()
    const latencyMs = Date.now() - start

    const apiKey = c.var.apiKey
    if (!apiKey) return

    // ✅ Analytics Engine write — non-blocking, unlimited throughput
    c.executionCtx.waitUntil(
      (async () => {
        // Analytics Engine: structured event data
        c.env.ANALYTICS.writeDataPoint({
          blobs: [
            apiKey.keyId,           // blob1: key ID
            apiKey.plan,            // blob2: plan
            c.req.path,             // blob3: endpoint
            c.req.method,           // blob4: method
            String(c.res.status),   // blob5: status code
          ],
          doubles: [
            latencyMs,              // double1: latency ms
            1,                      // double2: request count
          ],
          indexes: [String(apiKey.storeId)],  // index: store ID (for filtering)
        })

        // D1 audit log — batched, only for important events (errors, billing)
        if (c.res.status >= 400) {
          await c.env.DB.prepare(
            `INSERT INTO api_usage_logs
             (key_id, store_id, endpoint, method, status_code, latency_ms, request_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            apiKey.keyId, apiKey.storeId, c.req.path,
            c.req.method, c.res.status, latencyMs,
            c.var.requestId
          ).run()
        }
      })()
    )
  })
}
```

### Analytics Engine wrangler.toml binding

```toml
[[analytics_engine_datasets]]
binding = "ANALYTICS"
dataset = "ozzyl_api_usage"
```

### Querying Analytics Engine (Cloudflare SQL API)

```sql
-- Total requests per store last 24h
SELECT
  index1 as store_id,
  blob2 as plan,
  SUM(_sample_interval * double2) as total_requests,
  AVG(double1) as avg_latency_ms
FROM ozzyl_api_usage
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY store_id, plan
ORDER BY total_requests DESC
``` & Usage Tracking

> **Implementation**: Full code in Section 4b. This section covers the usage tracking middleware.

### Usage Tracker Middleware

```typescript
// apps/web/server/middleware/usage-tracker.ts
// Non-blocking — uses waitUntil so it never delays API response

import { createMiddleware } from 'hono/factory'

export function usageTracker() {
  return createMiddleware(async (c, next) => {
    const start = Date.now()
    await next()
    const latency = Date.now() - start

    const apiKey = c.var.apiKey
    if (!apiKey) return

    // Non-blocking D1 write via waitUntil
    c.executionCtx.waitUntil(
      c.env.DB.prepare(`
        INSERT INTO api_usage_logs
          (key_id, store_id, endpoint, method, status_code, latency_ms, ip_address, request_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        apiKey.keyId,
        apiKey.storeId,
        new URL(c.req.url).pathname,
        c.req.method,
        c.res.status,
        latency,
        c.req.header('CF-Connecting-IP') ?? '',
        c.var.requestId ?? '',
      ).run()
    )
  })
}
```

### Usage Aggregation Cron

```toml
# wrangler.toml
[triggers]
crons = ["0 * * * *"]   # Aggregate raw logs → hourly buckets every hour
```

```typescript
// Cron handler in main worker
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(aggregateHourlyUsage(env))
  }
}
```

---

## 16. Developer Experience (DX)

### Quick Start (Target: < 5 minutes)

```bash
# 1. Install SDK
npm install @ozzyl/sdk

# 2. Get API key from dashboard
# dashboard.ozzyl.com → Settings → Developer → New API Key

# 3. First API call
```

```typescript
import { Ozzyl } from '@ozzyl/sdk'

const ozzyl = new Ozzyl('sk_live_your_key_here')

const stats = await ozzyl.analytics.getSummary({ period: '7d' })
console.log(`${stats.pageViews} views, ${stats.orders} orders`)
```

### Error Codes Reference

| Code | HTTP | Meaning | Fix |
|------|------|---------|-----|
| `AUTH_MISSING` | 401 | No API key provided | Add `Authorization: Bearer sk_...` header |
| `AUTH_INVALID` | 401 | API key wrong/revoked | Check key in dashboard |
| `AUTH_EXPIRED` | 401 | Key expired | Generate new key |
| `FORBIDDEN_DOMAIN` | 403 | Domain not in allowlist | Add domain in dashboard |
| `RATE_LIMITED` | 429 | Too many requests | Wait `Retry-After` seconds |
| `PLAN_LIMIT` | 429 | Monthly limit reached | Upgrade plan |
| `NOT_FOUND` | 404 | Resource not found | Check ID |
| `VALIDATION_ERROR` | 422 | Invalid request body | Check error.details |
| `INTERNAL_ERROR` | 500 | Server error | Retry with backoff |

### API Versioning Strategy

```
/v1/...  — Current stable (support until 2027-01-01)
/v2/...  — Future (when breaking changes needed)

Headers:
  Ozzyl-API-Version: 2025-01-01   (date-based like Stripe)
  Deprecation: Tue, 01 Jan 2027 00:00:00 GMT
  Sunset: Tue, 01 Jan 2028 00:00:00 GMT
```

### OpenAPI Spec (`openapi.yaml` addition)

```yaml
openapi: 3.1.0
info:
  title: Ozzyl Commerce API
  version: 1.0.0
  description: |
    The Ozzyl Commerce API lets you embed advanced e-commerce features
    into any website or app. Use your API key to authenticate all requests.

servers:
  - url: https://api.ozzyl.com/v1
    description: Production

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: "sk_live_..."

  schemas:
    Error:
      type: object
      required: [code, message, requestId]
      properties:
        code: { type: string, example: "RATE_LIMITED" }
        message: { type: string }
        requestId: { type: string, format: uuid }

    AnalyticsSummary:
      type: object
      properties:
        pageViews: { type: integer }
        uniqueVisitors: { type: integer }
        orders: { type: integer }
        revenue: { type: number }
        conversionRate: { type: number }
        period: { type: string, enum: ["1d","7d","30d","90d"] }
```

---

## 17. Usage Tracking & Analytics Engine

## 18. Infrastructure & wrangler.toml

### Cloudflare Setup (Production)

```toml
# wrangler.toml additions for API platform

[[d1_databases]]
binding = "DB"
database_name = "ozzyl-prod"
database_id = "your-db-id"

[[kv_namespaces]]
binding = "API_KEYS_KV"        # API key cache
id = "your-api-keys-kv-id"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"      # Rate limit counters
id = "your-rate-limit-kv-id"

[[kv_namespaces]]
binding = "USAGE_KV"           # Usage tracking
id = "your-usage-kv-id"

[[queues.producers]]
binding = "WEBHOOK_QUEUE"
queue = "ozzyl-webhook-queue"

[[queues.consumers]]
queue = "ozzyl-webhook-queue"
max_batch_size = 10
max_batch_timeout = 5
max_retries = 3
dead_letter_queue = "ozzyl-webhook-dlq"
```

### Monitoring & Alerting

```typescript
// Health check endpoint
app.get('/v1/health', (c) => {
  return c.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    region: c.req.raw.cf?.colo ?? 'unknown',
  })
})

// SLA Targets
// p50 latency: < 20ms
// p95 latency: < 100ms
// p99 latency: < 500ms
// Uptime: 99.9% (8.7 hours downtime/year max)
// Error rate: < 0.1%
```

### Custom Domain (CNAME Setup)

```
Customer's DNS:
  api.mystore.com  CNAME  ozzyl-api.mystore.workers.dev

Cloudflare Workers for Platforms:
  Dispatch namespace routes each CNAME → correct tenant
```

---



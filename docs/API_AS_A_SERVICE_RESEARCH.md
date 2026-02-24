# API-as-a-Service Platform Research
> Cloudflare Workers + Hono — Concrete Patterns & Architecture
> Verified: Context7 MCP (Cloudflare Docs, Hono, Drizzle ORM) — 2026

---

## Table of Contents

1. [Hono REST API Structure on Cloudflare Workers](#1-hono-rest-api-structure)
2. [API Versioning Strategies](#2-api-versioning-strategies)
3. [Webhook Outbound Delivery & Retry Logic](#3-webhook-outbound-delivery--retry-logic)
4. [Usage Tracking & Metering with D1](#4-usage-tracking--metering-with-d1)
5. [Workers AI + Vectorize for Recommendations](#5-workers-ai--vectorize-for-recommendations)
6. [KV Namespace Design for API Keys & Rate Limiting](#6-kv-namespace-design)
7. [Industry Best Practices (Stripe/Twilio Patterns)](#7-industry-best-practices)
8. [Complete Architecture Diagram](#8-complete-architecture-diagram)

---

## 1. Hono REST API Structure

### Core Principle: Type-Safe Bindings First

Every Cloudflare Workers + Hono app starts with a strict `Bindings` type. This is non-negotiable for multi-tenant SaaS — it prevents runtime surprises and gives full IntelliSense.

```typescript
// worker/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

// ── Type Definitions ──────────────────────────────────────────────────────────
type Bindings = {
  DB:          D1Database
  KV:          KVNamespace
  R2:          R2Bucket
  AI:          Ai
  VECTORIZE:   VectorizeIndex
  QUEUE:       Queue
  RATE_LIMITER: DurableObjectNamespace
  JWT_SECRET:  string
  ENVIRONMENT: 'production' | 'staging' | 'development'
}

type Variables = {
  apiKey:   string
  tenantId: string
  plan:     'free' | 'starter' | 'pro' | 'enterprise'
  rateLimit: { limit: number; remaining: number; reset: number }
}

// ── App Factory ───────────────────────────────────────────────────────────────
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ── Global Middleware (order matters!) ────────────────────────────────────────
app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Authorization', 'Content-Type', 'X-API-Key'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-Id',
  ],
}))

// ── Request ID Middleware ─────────────────────────────────────────────────────
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID()
  c.header('X-Request-Id', requestId)
  await next()
})

// ── Health Check (unauthenticated) ────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// ── Mount versioned routers ───────────────────────────────────────────────────
import { v1Router } from './routes/v1'
import { v2Router } from './routes/v2'

app.route('/v1', v1Router)
app.route('/v2', v2Router)

// ── Global Error Handler ──────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error(JSON.stringify({
    level: 'error',
    message: err.message,
    stack: err.stack,
    requestId: c.res.headers.get('X-Request-Id'),
    timestamp: new Date().toISOString(),
  }))

  if (err.message === 'Unauthorized') {
    return c.json({ error: 'Unauthorized', code: 'AUTH_FAILED' }, 401)
  }

  return c.json({
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    requestId: c.res.headers.get('X-Request-Id'),
  }, 500)
})

app.notFound((c) => c.json({
  error: 'Not Found',
  code: 'NOT_FOUND',
  path: c.req.path,
}, 404))

export default app
```

### API Key Authentication Middleware

```typescript
// middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { apiKeysTable } from '../db/schema'

export const apiKeyAuth = createMiddleware<{
  Bindings: Bindings
  Variables: Variables
}>(async (c, next) => {
  // Support both header styles (Stripe uses Authorization Bearer,
  // Twilio uses custom header — we support both)
  const authHeader = c.req.header('Authorization')
  const rawKeyHeader = c.req.header('X-API-Key')

  let rawKey: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    rawKey = authHeader.slice(7)
  } else if (rawKeyHeader) {
    rawKey = rawKeyHeader
  }

  if (!rawKey) {
    return c.json({ error: 'Missing API key', code: 'AUTH_MISSING' }, 401)
  }

  // ── L1: KV cache lookup (fast path — ~1ms) ────────────────────────────────
  const cacheKey = `apikey:${rawKey}`
  const cached = await c.env.KV.get(cacheKey, 'json') as {
    tenantId: string
    plan: string
    rateLimit: number
  } | null

  if (cached) {
    c.set('apiKey', rawKey)
    c.set('tenantId', cached.tenantId)
    c.set('plan', cached.plan as Variables['plan'])
    await next()
    return
  }

  // ── L2: D1 database lookup (slow path — ~10ms) ────────────────────────────
  const db = drizzle(c.env.DB)
  const keyRecord = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.keyHash, await hashKey(rawKey)))
    .limit(1)

  if (!keyRecord[0] || !keyRecord[0].isActive) {
    return c.json({ error: 'Invalid API key', code: 'AUTH_INVALID' }, 401)
  }

  const { tenantId, plan, rateLimit } = keyRecord[0]

  // ── Backfill KV cache (TTL: 5 minutes) ───────────────────────────────────
  await c.env.KV.put(cacheKey, JSON.stringify({ tenantId, plan, rateLimit }), {
    expirationTtl: 300,
  })

  c.set('apiKey', rawKey)
  c.set('tenantId', tenantId)
  c.set('plan', plan as Variables['plan'])
  await next()
})

// Constant-time SHA-256 hash — never store raw API keys
async function hashKey(key: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
```

### Resource Router Structure

```typescript
// routes/v1/products.ts — example resource router
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const products = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const CreateProductSchema = z.object({
  name:        z.string().min(1).max(255),
  price:       z.number().positive(),
  description: z.string().max(5000).optional(),
  sku:         z.string().max(100).optional(),
})

// GET /v1/products
products.get('/', async (c) => {
  const tenantId = c.get('tenantId')
  const db = drizzle(c.env.DB)
  const { page = '1', limit = '20' } = c.req.query()

  const offset = (parseInt(page) - 1) * parseInt(limit)

  const items = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.tenantId, tenantId))
    .limit(parseInt(limit))
    .offset(offset)

  return c.json({ data: items, meta: { page: parseInt(page), limit: parseInt(limit) } })
})

// POST /v1/products
products.post('/', zValidator('json', CreateProductSchema), async (c) => {
  const tenantId = c.get('tenantId')
  const body = c.req.valid('json')
  const db = drizzle(c.env.DB)

  const [product] = await db
    .insert(productsTable)
    .values({ ...body, tenantId })
    .returning()

  return c.json({ data: product }, 201)
})

export { products }
```

---

## 2. API Versioning Strategies

### Strategy: Hono Sub-App Mounting (Recommended)

The cleanest approach on Cloudflare Workers is **path-based versioning** using Hono's `app.route()`. Each version is a fully isolated Hono sub-app. This maps exactly to how Stripe (`/v1/`) and Twilio (`/2010-04-01/`) do it.

```
/v1/products     → v1 router handles
/v2/products     → v2 router handles (new response shape, new features)
```

```typescript
// routes/v1/index.ts
import { Hono } from 'hono'
import { apiKeyAuth }    from '../../middleware/auth'
import { rateLimiter }   from '../../middleware/rate-limiter'
import { usageTracker }  from '../../middleware/usage-tracker'
import { products }      from './products'
import { orders }        from './orders'
import { webhooks }      from './webhooks'

export const v1Router = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ── Version-level middleware chain ────────────────────────────────────────────
v1Router.use('*', apiKeyAuth)       // 1. Auth (sets tenantId, plan)
v1Router.use('*', rateLimiter)      // 2. Rate limit (reads plan from Variables)
v1Router.use('*', usageTracker)     // 3. Async usage tracking (ctx.waitUntil)

// ── Deprecation header for v1 ─────────────────────────────────────────────────
v1Router.use('*', async (c, next) => {
  await next()
  c.header('Sunset', 'Sat, 31 Dec 2027 23:59:59 GMT')
  c.header('Deprecation', 'true')
  c.header('Link', '</v2/docs>; rel="successor-version"')
})

// ── Resource routers ──────────────────────────────────────────────────────────
v1Router.route('/products',  products)
v1Router.route('/orders',    orders)
v1Router.route('/webhooks',  webhooks)

// routes/v2/index.ts
export const v2Router = new Hono<{ Bindings: Bindings; Variables: Variables }>()

v2Router.use('*', apiKeyAuth)
v2Router.use('*', rateLimiter)
v2Router.use('*', usageTracker)

// v2 has new features — cursor-based pagination, expanded resources
v2Router.route('/products', v2Products)
v2Router.route('/orders',   v2Orders)
// new in v2:
v2Router.route('/recommendations', recommendations)
v2Router.route('/analytics',       analytics)
```

### Versioning Decision Matrix

| Strategy | Example | Pros | Cons | Verdict |
|---|---|---|---|---|
| **Path versioning** | `/v1/products` | Explicit, cacheable, easy routing | URL "ugliness" | ✅ **Use this** |
| Header versioning | `API-Version: 2024-01-01` | Clean URLs | Hard to cache, hard to test in browser | ⚠️ Use as supplement |
| Date-based (Stripe 2024-01) | `Stripe-Version: 2024-11-20` | Fine-grained control | Complex version registry | For v3+ maturity |

### Version Negotiation + Date Sub-versioning (Stripe Pattern)

```typescript
// For v2+, support Stripe-style date sub-versioning alongside path versioning
// /v2/products + header "API-Version: 2026-01-15" = use Jan 2026 behavior

const VERSION_DATES = ['2025-06-01', '2026-01-15', '2026-06-01'] as const
type VersionDate = typeof VERSION_DATES[number]

v2Router.use('*', async (c, next) => {
  const requestedVersion = c.req.header('API-Version') as VersionDate | undefined

  // Default to latest stable if not specified
  const resolvedVersion: VersionDate = VERSION_DATES.includes(requestedVersion as VersionDate)
    ? requestedVersion!
    : VERSION_DATES[VERSION_DATES.length - 1]

  c.set('apiVersion', resolvedVersion)
  c.header('API-Version', resolvedVersion)
  await next()
})
```

### wrangler.toml for Multi-Version Worker

```toml
name = "ozzyl-api"
compatibility_date = "2025-04-14"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "ozzyl-api-prod"
database_id = "YOUR_DB_ID"

[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID"

[[queues.producers]]
binding = "WEBHOOK_QUEUE"
queue = "webhook-delivery"

[[queues.consumers]]
queue = "webhook-delivery"
max_batch_size = 10
max_batch_timeout = 30
max_retries = 5
dead_letter_queue = "webhook-dlq"

[durable_objects]
bindings = [
  { name = "RATE_LIMITER", class_name = "RateLimiter" }
]

[[migrations]]
tag = "v1"
new_classes = ["RateLimiter"]
```

---

## 3. Webhook Outbound Delivery & Retry Logic

### Architecture: Two-Tier Approach

Use **Cloudflare Queues** as the primary delivery engine (simple, managed retries), with **Cloudflare Workflows** for complex multi-step delivery orchestration requiring durable state.

```
API Action Happens
       │
       ▼
  Enqueue to           ←── Producer Worker (fast, ~1ms)
  WEBHOOK_QUEUE
       │
       ▼
  Consumer Worker      ←── Attempts HTTP delivery to customer endpoint
       │
   ┌───┴───────┐
   │ SUCCESS   │ FAIL (network error, 5xx, timeout)
   │           │
   ▼           ▼
  msg.ack()  msg.retry({ delaySeconds: exponentialBackoff })
                │
                ▼ (after max_retries exceeded)
           Dead Letter Queue  ←── Store for inspection/replay
```

### Producer: Enqueue Webhook Event

```typescript
// In your API action handler (e.g., after order is created)
async function emitWebhookEvent(
  env: Bindings,
  tenantId: string,
  eventType: string,
  payload: unknown
) {
  const event = {
    id:        crypto.randomUUID(),
    tenantId,
    eventType, // e.g. "order.created", "product.updated"
    payload,
    createdAt: new Date().toISOString(),
  }

  // Fire-and-forget — does NOT block the API response
  await env.WEBHOOK_QUEUE.send(event, {
    contentType: 'json',
  })
}

// Usage in a route handler:
products.post('/', zValidator('json', CreateProductSchema), async (c) => {
  const product = await createProduct(c)

  // Non-blocking — response goes out immediately
  c.executionCtx.waitUntil(
    emitWebhookEvent(c.env, c.get('tenantId'), 'product.created', product)
  )

  return c.json({ data: product }, 201)
})
```

### Consumer: Exponential Backoff Delivery

```typescript
// worker/webhook-consumer.ts
import type { MessageBatch, Message } from '@cloudflare/workers-types'

interface WebhookEvent {
  id:        string
  tenantId:  string
  eventType: string
  payload:   unknown
  createdAt: string
}

interface WebhookEndpoint {
  url:    string
  secret: string
}

const BASE_DELAY_SECONDS = 30  // 30s, 60s, 120s, 240s, 480s … up to 12h cap

export default {
  async queue(batch: MessageBatch<WebhookEvent>, env: Bindings): Promise<void> {
    for (const msg of batch.messages) {
      try {
        await deliverWebhook(msg, env)
        msg.ack()
      } catch (err) {
        const delay = Math.min(BASE_DELAY_SECONDS * (2 ** msg.attempts), 43200)
        console.error(JSON.stringify({
          level: 'warn',
          message: 'Webhook delivery failed, retrying',
          webhookId: msg.body.id,
          attempts:  msg.attempts,
          nextRetryIn: delay,
          error: String(err),
        }))
        msg.retry({ delaySeconds: delay })
      }
    }
  },
}

async function deliverWebhook(
  msg: Message<WebhookEvent>,
  env: Bindings
): Promise<void> {
  const { tenantId, eventType, payload, id, createdAt } = msg.body

  // 1. Look up customer's registered webhook endpoint
  const endpoint = await getWebhookEndpoint(env, tenantId, eventType)
  if (!endpoint) {
    msg.ack() // No endpoint registered — silently drop
    return
  }

  // 2. Build signed payload (Stripe-style HMAC signature)
  const timestamp = Math.floor(Date.now() / 1000)
  const body = JSON.stringify({
    id,
    type: eventType,
    created: timestamp,
    data: { object: payload },
  })

  const signature = await signPayload(body, timestamp, endpoint.secret)

  // 3. HTTP delivery with 30s timeout
  const response = await fetch(endpoint.url, {
    method:  'POST',
    headers: {
      'Content-Type':          'application/json',
      'User-Agent':            'OzzylAPI/1.0',
      'X-Ozzyl-Signature':     signature,
      'X-Ozzyl-Event':         eventType,
      'X-Ozzyl-Delivery-Id':  id,
      'X-Ozzyl-Timestamp':     String(timestamp),
    },
    body,
    signal: AbortSignal.timeout(30_000),
  })

  // 4. Only 2xx is success — anything else triggers retry
  if (!response.ok) {
    throw new Error(`Endpoint returned ${response.status}: ${await response.text()}`)
  }

  // 5. Log successful delivery to D1 for dashboard visibility
  await logDelivery(env, {
    webhookId:  id,
    tenantId,
    eventType,
    statusCode: response.status,
    attempts:   msg.attempts + 1,
    deliveredAt: new Date().toISOString(),
  })
}

// HMAC-SHA256 signature — customers verify this on their end
async function signPayload(body: string, timestamp: number, secret: string): Promise<string> {
  const message = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return `v1=${Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')}`
}
```

### Dead Letter Queue Consumer

```typescript
// worker/webhook-dlq-consumer.ts
// Messages land here after max_retries (5) are exhausted

export default {
  async queue(batch: MessageBatch<WebhookEvent>, env: Bindings): Promise<void> {
    for (const msg of batch.messages) {
      // Persist to KV for customer inspection via dashboard
      await env.KV.put(
        `dlq:${msg.body.tenantId}:${msg.body.id}`,
        JSON.stringify({
          ...msg.body,
          failedAt: new Date().toISOString(),
          attempts: msg.attempts,
        }),
        { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
      )

      // Alert via D1 so admin dashboard shows failure
      await env.DB.prepare(
        `INSERT INTO webhook_failures (id, tenant_id, event_type, payload, failed_at, attempts)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        msg.body.id,
        msg.body.tenantId,
        msg.body.eventType,
        JSON.stringify(msg.body.payload),
        new Date().toISOString(),
        msg.attempts
      ).run()

      msg.ack()
    }
  },
}
```

### Cloudflare Workflows Alternative (for complex multi-step delivery)

Use Workflows when you need durable execution across multiple external systems:

```typescript
// workflows/webhook-delivery.ts
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers'

export class WebhookDeliveryWorkflow extends WorkflowEntrypoint<Bindings, WebhookEvent> {
  async run(event: WorkflowEvent<WebhookEvent>, step: WorkflowStep) {

    // Step 1: Validate and enrich payload
    const enriched = await step.do('enrich-payload', async () => {
      return { ...event.payload, enrichedAt: new Date().toISOString() }
    })

    // Step 2: Deliver with per-step exponential backoff
    await step.do('deliver-webhook', {
      retries: {
        limit: 10,
        delay: '30 seconds',
        backoff: 'exponential', // 'constant' | 'linear' | 'exponential'
      },
      timeout: '30 minutes',
    }, async () => {
      const response = await fetch(enriched.endpoint, {
        method: 'POST',
        body:   JSON.stringify(enriched),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
    })

    // Step 3: Log success (runs only if step 2 succeeded)
    await step.do('log-delivery', async () => {
      await env.DB.prepare('UPDATE webhook_events SET status = ? WHERE id = ?')
        .bind('delivered', event.payload.id)
        .run()
    })
  }
}
```

### Queue Configuration (wrangler.toml)

```toml
# Main delivery queue
[[queues.producers]]
binding = "WEBHOOK_QUEUE"
queue   = "webhook-delivery"

[[queues.consumers]]
queue             = "webhook-delivery"
max_batch_size    = 10       # Process 10 webhooks per invocation
max_batch_timeout = 30       # Wait up to 30s to fill a batch
max_retries       = 5        # Attempts before DLQ
dead_letter_queue = "webhook-dlq"

# Dead letter queue
[[queues.consumers]]
queue          = "webhook-dlq"
max_batch_size = 100
max_retries    = 0           # No retries on DLQ — just store
```

---

## 4. Usage Tracking & Metering with D1

### Database Schema (Drizzle ORM)

```typescript
// packages/database/src/schema-api.ts
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ── API Keys ──────────────────────────────────────────────────────────────────
export const apiKeysTable = sqliteTable('api_keys', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  tenantId:  text('tenant_id').notNull(),
  keyHash:   text('key_hash').notNull().unique(),  // SHA-256 of raw key
  keyPrefix: text('key_prefix').notNull(),         // e.g. "oz_live_abc1" (shown in UI)
  name:      text('name').notNull(),               // "Production Key"
  plan:      text('plan').notNull().default('free'), // free | starter | pro | enterprise
  rateLimit: integer('rate_limit').notNull().default(100), // req/min
  isActive:  integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  lastUsedAt:text('last_used_at'),
}, (t) => ({
  tenantIdx: index('idx_api_keys_tenant').on(t.tenantId),
}))

// ── Per-request Usage Log (append-only, high volume) ────────────────────────
export const apiUsageLogsTable = sqliteTable('api_usage_logs', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  tenantId:    text('tenant_id').notNull(),
  apiKeyId:    integer('api_key_id').notNull(),
  endpoint:    text('endpoint').notNull(),          // '/v1/products'
  method:      text('method').notNull(),            // 'GET'
  statusCode:  integer('status_code').notNull(),
  latencyMs:   integer('latency_ms'),
  requestBytes:integer('request_bytes'),
  responseBytes:integer('response_bytes'),
  ipAddress:   text('ip_address'),
  userAgent:   text('user_agent'),
  billingUnits:real('billing_units').notNull().default(1), // for compute-weighted billing
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  tenantTimeIdx: index('idx_usage_tenant_time').on(t.tenantId, t.createdAt),
  keyTimeIdx:    index('idx_usage_key_time').on(t.apiKeyId, t.createdAt),
}))

// ── Hourly Aggregates (pre-computed for billing dashboard) ───────────────────
export const apiUsageHourlyTable = sqliteTable('api_usage_hourly', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  tenantId:     text('tenant_id').notNull(),
  hourBucket:   text('hour_bucket').notNull(), // '2026-02-18T14:00:00Z'
  totalRequests:integer('total_requests').notNull().default(0),
  successCount: integer('success_count').notNull().default(0),
  errorCount:   integer('error_count').notNull().default(0),
  totalLatencyMs:integer('total_latency_ms').notNull().default(0),
  totalBillingUnits:real('total_billing_units').notNull().default(0),
}, (t) => ({
  tenantHourIdx: index('idx_hourly_tenant_hour').on(t.tenantId, t.hourBucket),
}))

// ── Plan Limits ───────────────────────────────────────────────────────────────
export const PLAN_LIMITS = {
  free:       { requestsPerMin: 20,   requestsPerMonth: 10_000,   price: 0 },
  starter:    { requestsPerMin: 100,  requestsPerMonth: 100_000,  price: 29 },
  pro:        { requestsPerMin: 500,  requestsPerMonth: 1_000_000, price: 99 },
  enterprise: { requestsPerMin: 5000, requestsPerMonth: Infinity,  price: -1 }, // custom
} as const
```

### Usage Tracker Middleware (Non-Blocking)

The key insight from Stripe/Twilio: **never let metering slow down the API response**. Use `ctx.waitUntil()` to write usage data asynchronously after the response is sent.

```typescript
// middleware/usage-tracker.ts
import { createMiddleware } from 'hono/factory'
import { drizzle } from 'drizzle-orm/d1'

export const usageTracker = createMiddleware<{
  Bindings: Bindings
  Variables: Variables
}>(async (c, next) => {
  const startTime = Date.now()

  await next()

  const latencyMs = Date.now() - startTime
  const tenantId  = c.get('tenantId')
  const apiKey    = c.get('apiKey')

  // Fire-and-forget — response already sent, this runs in background
  c.executionCtx.waitUntil(
    trackUsage(c.env, {
      tenantId,
      endpoint:  c.req.path,
      method:    c.req.method,
      statusCode: c.res.status,
      latencyMs,
      userAgent: c.req.header('User-Agent') ?? '',
      ipAddress: c.req.header('CF-Connecting-IP') ?? '',
    })
  )
})

async function trackUsage(env: Bindings, data: {
  tenantId:   string
  endpoint:   string
  method:     string
  statusCode: number
  latencyMs:  number
  userAgent:  string
  ipAddress:  string
}) {
  const db = drizzle(env.DB)
  const hourBucket = new Date().toISOString().slice(0, 13) + ':00:00Z'

  // Use D1 batch — single round-trip for both log + aggregate update
  await env.DB.batch([
    // 1. Append raw log
    env.DB.prepare(
      `INSERT INTO api_usage_logs
         (tenant_id, endpoint, method, status_code, latency_ms, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.tenantId, data.endpoint, data.method,
      data.statusCode, data.latencyMs, data.ipAddress, data.userAgent
    ),

    // 2. Upsert hourly aggregate (atomic increment)
    env.DB.prepare(
      `INSERT INTO api_usage_hourly
         (tenant_id, hour_bucket, total_requests, success_count, error_count, total_latency_ms)
       VALUES (?, ?, 1, ?, ?, ?)
       ON CONFLICT(tenant_id, hour_bucket) DO UPDATE SET
         total_requests  = total_requests + 1,
         success_count   = success_count + excluded.success_count,
         error_count     = error_count + excluded.error_count,
         total_latency_ms = total_latency_ms + excluded.total_latency_ms`
    ).bind(
      data.tenantId,
      hourBucket,
      data.statusCode < 400 ? 1 : 0,
      data.statusCode >= 400 ? 1 : 0,
      data.latencyMs
    ),
  ])
}
```

### Usage Query API (Billing Dashboard)

```typescript
// routes/v1/analytics.ts
analytics.get('/usage', async (c) => {
  const tenantId = c.get('tenantId')
  const { start, end, granularity = 'hour' } = c.req.query()

  const db = drizzle(c.env.DB)

  // Monthly summary
  const [summary] = await db
    .select({
      totalRequests: sql<number>`SUM(total_requests)`,
      successCount:  sql<number>`SUM(success_count)`,
      errorCount:    sql<number>`SUM(error_count)`,
      avgLatencyMs:  sql<number>`SUM(total_latency_ms) / SUM(total_requests)`,
    })
    .from(apiUsageHourlyTable)
    .where(
      and(
        eq(apiUsageHourlyTable.tenantId, tenantId),
        gte(apiUsageHourlyTable.hourBucket, start),
        lte(apiUsageHourlyTable.hourBucket, end)
      )
    )

  // Time-series breakdown
  const timeSeries = await db
    .select()
    .from(apiUsageHourlyTable)
    .where(
      and(
        eq(apiUsageHourlyTable.tenantId, tenantId),
        gte(apiUsageHourlyTable.hourBucket, start)
      )
    )
    .orderBy(asc(apiUsageHourlyTable.hourBucket))

  return c.json({ summary, timeSeries })
})
```

### Analytics Engine Alternative (High-Volume)

For very high volume (>1M req/day), use **Cloudflare Analytics Engine** instead of D1 raw logs — it's purpose-built for time-series:

```typescript
// Write a data point per API call — zero latency impact
env.ANALYTICS.writeDataPoint({
  blobs:   [c.req.path, c.req.method, String(statusCode), plan],
  doubles: [1, billingUnits, responseBytes, latencyMs],
  indexes: [tenantId], // partition key for querying
})

// Query via Workers Analytics Engine SQL API:
// SELECT index1 AS tenant_id,
//        SUM(double1) AS total_requests,
//        SUM(double2) AS compute_units,
//        AVG(double4) AS avg_latency_ms
// FROM ANALYTICS_DATASET
// WHERE timestamp >= NOW() - INTERVAL '30' DAY
// GROUP BY index1
// ORDER BY total_requests DESC
```

---

## 5. Workers AI + Vectorize for Recommendations

### Architecture Overview

```
Product Created/Updated
        │
        ▼
  Generate Embedding          ← Workers AI: @cf/baai/bge-base-en-v1.5
  (name + desc + category)
        │
        ▼
  Upsert into Vectorize       ← Namespace = "tenant-{tenantId}" (isolation)
  with metadata
        │
  ┌─────┴──────────────────┐
  │  Query at request time  │
  │  GET /v2/recommendations│
  └─────┬──────────────────┘
        │
        ▼
  Generate query embedding    ← from product being viewed / search term
        │
        ▼
  Vectorize.query()           ← topK=10, namespace filter
        │
        ▼
  Fetch full product data     ← D1 batch lookup by IDs
  from D1 by matched IDs
        │
        ▼
  Return recommendations
```

### Embedding Ingestion Pipeline

```typescript
// worker/embedding-ingestion.ts
// Called via Queue after product create/update

interface ProductEmbeddingJob {
  productId: string
  tenantId:  string
  action:    'upsert' | 'delete'
}

export async function ingestProductEmbedding(
  job: ProductEmbeddingJob,
  env: Bindings
): Promise<void> {
  const { productId, tenantId, action } = job

  if (action === 'delete') {
    await env.VECTORIZE.deleteByIds([`${tenantId}:${productId}`])
    return
  }

  // Fetch product from D1
  const product = await env.DB
    .prepare('SELECT name, description, category, tags FROM products WHERE id = ? AND tenant_id = ?')
    .bind(productId, tenantId)
    .first<{ name: string; description: string; category: string; tags: string }>()

  if (!product) return

  // Build rich text for embedding — more context = better recommendations
  const embeddingText = [
    product.name,
    product.category,
    product.description?.slice(0, 500) ?? '',
    product.tags ?? '',
  ].join(' | ')

  // Generate embedding — @cf/baai/bge-base-en-v1.5 is the recommended model
  const result = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [embeddingText],
  })

  // Upsert into Vectorize
  // Two isolation strategies:
  //   - namespace (up to ~50k tenants): tenant-level isolation, faster
  //   - metadata filter (50k+ tenants): field-level isolation, more flexible

  await env.VECTORIZE.upsert([{
    id:        `${tenantId}:${productId}`,
    values:    result.data[0],
    namespace: `tenant-${tenantId}`,    // Strategy A: namespace isolation
    metadata: {
      tenantId,
      productId,
      category: product.category,
      // Store lightweight data in metadata to avoid D1 roundtrip for filters
    },
  }])
}
```

### Recommendation Endpoint (v2)

```typescript
// routes/v2/recommendations.ts
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'

const recommendations = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /v2/recommendations?productId=xxx&limit=10
recommendations.get('/', async (c) => {
  const tenantId  = c.get('tenantId')
  const productId = c.req.query('productId')
  const category  = c.req.query('category')
  const limit     = Math.min(parseInt(c.req.query('limit') ?? '10'), 50)

  if (!productId && !category) {
    return c.json({ error: 'Provide productId or category', code: 'VALIDATION_ERROR' }, 400)
  }

  // 1. Build query text from product or search term
  let queryText: string

  if (productId) {
    const product = await c.env.DB
      .prepare('SELECT name, category, description FROM products WHERE id = ? AND tenant_id = ?')
      .bind(productId, tenantId)
      .first<{ name: string; category: string; description: string }>()

    if (!product) return c.json({ error: 'Product not found' }, 404)
    queryText = `${product.name} ${product.category} ${product.description?.slice(0, 200) ?? ''}`
  } else {
    queryText = category!
  }

  // 2. Generate query embedding
  const embedding = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [queryText],
  })

  // 3. Query Vectorize with tenant namespace isolation
  const vectorResults = await c.env.VECTORIZE.query(embedding.data[0], {
    topK:           limit + 1, // +1 to exclude the queried product itself
    namespace:      `tenant-${tenantId}`,
    returnMetadata: 'indexed',
    // Optional metadata filter for category scoping:
    // filter: { category: 'Electronics' }
  })

  // 4. Extract product IDs, exclude the queried product itself
  const recommendedIds = vectorResults.matches
    .map(m => m.metadata?.productId as string)
    .filter(id => id !== productId)
    .slice(0, limit)

  if (recommendedIds.length === 0) {
    return c.json({ data: [], meta: { source: 'vectorize' } })
  }

  // 5. Batch-fetch full product records from D1 (single round-trip)
  const placeholders = recommendedIds.map(() => '?').join(',')
  const { results: products } = await c.env.DB
    .prepare(`SELECT id, name, price, image_url, category
              FROM products
              WHERE id IN (${placeholders})
                AND tenant_id = ?
                AND status = 'active'`)
    .bind(...recommendedIds, tenantId)
    .all()

  // 6. Re-sort by Vectorize score (D1 doesn't preserve order)
  const scoreMap = new Map(vectorResults.matches.map(m => [m.metadata?.productId, m.score]))
  const sorted = (products as any[]).sort((a, b) =>
    (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0)
  )

  return c.json({
    data: sorted,
    meta: {
      source:     'vectorize',
      model:      '@cf/baai/bge-base-en-v1.5',
      totalFound: vectorResults.count,
    },
  })
})

export { recommendations }
```

### AI-Powered Search (Semantic Search Endpoint)

```typescript
// GET /v2/products/search?q=comfortable+summer+shoes
products.get('/search', async (c) => {
  const tenantId = c.get('tenantId')
  const query    = c.req.query('q')

  if (!query) return c.json({ error: 'Query required' }, 400)

  // For short, keyword-like queries — also run a D1 LIKE for hybrid results
  const [vectorSearch, keywordSearch] = await Promise.all([
    // Semantic search via Vectorize
    c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [query] })
      .then(emb => c.env.VECTORIZE.query(emb.data[0], {
        topK:      20,
        namespace: `tenant-${tenantId}`,
        returnMetadata: 'indexed',
      })),

    // Keyword search via D1
    c.env.DB
      .prepare(`SELECT id, name, price, image_url FROM products
                WHERE tenant_id = ?
                  AND status = 'active'
                  AND (name LIKE ? OR description LIKE ?)
                LIMIT 10`)
      .bind(tenantId, `%${query}%`, `%${query}%`)
      .all(),
  ])

  // Merge and deduplicate results (semantic ranked first)
  const semanticIds = new Set(vectorSearch.matches.map(m => m.metadata?.productId))
  const keywordOnly = (keywordSearch.results as any[]).filter(p => !semanticIds.has(p.id))

  return c.json({
    data: [
      ...vectorSearch.matches.map(m => ({ id: m.metadata?.productId, score: m.score })),
      ...keywordOnly.map(p => ({ ...p, score: 0 })),
    ],
    meta: { query, semanticResults: vectorSearch.count, keywordResults: keywordSearch.results.length },
  })
})
```

### Vectorize Index Setup Commands

```bash
# Create main product index (768 dimensions for bge-base-en-v1.5)
wrangler vectorize create product-embeddings \
  --dimensions=768 \
  --metric=cosine

# Create metadata index for category filtering
wrangler vectorize create-metadata-index product-embeddings \
  --property-name=category \
  --type=string

# Create metadata index for tenantId (for metadata-filter strategy with 50k+ tenants)
wrangler vectorize create-metadata-index product-embeddings \
  --property-name=tenantId \
  --type=string
```

---

## 6. KV Namespace Design

### Namespace Strategy: One KV, Key Prefixes

Cloudflare recommends using **a single KV namespace with structured key prefixes** rather than multiple namespaces — this simplifies bindings and reduces management overhead.

```
KV Key Schema
├── apikey:{hash}                     → { tenantId, plan, rateLimit }       TTL: 300s
├── ratelimit:{tenantId}:{windowMin}  → "42"  (request count)               TTL: 60s
├── store:{tenantId}:config           → { storeName, theme, ... }           TTL: 3600s
├── store:{tenantId}:products:page:1  → [...products]                       TTL: 120s
├── dlq:{tenantId}:{webhookId}        → { failed webhook payload }          TTL: 30 days
├── webhook:{tenantId}:endpoints      → [{ url, secret, events[] }]         TTL: 600s
└── session:{sessionId}              → { userId, tenantId, expiresAt }     TTL: 86400s
```

### Multi-Tier Rate Limiter

Two options — choose based on accuracy requirements:

**Option A: KV-Based (Eventually Consistent, ~1ms, good for most cases)**

```typescript
// middleware/rate-limiter.ts — KV sliding window
import { createMiddleware } from 'hono/factory'

const PLAN_LIMITS = {
  free:       20,
  starter:    100,
  pro:        500,
  enterprise: 5000,
} as const

export const rateLimiter = createMiddleware<{
  Bindings: Bindings
  Variables: Variables
}>(async (c, next) => {
  const tenantId  = c.get('tenantId')
  const plan      = c.get('plan')
  const limit     = PLAN_LIMITS[plan] ?? 20

  // 1-minute fixed window key
  const windowMin = Math.floor(Date.now() / 60_000)
  const kvKey     = `ratelimit:${tenantId}:${windowMin}`

  // Atomic read-increment-write (KV is eventually consistent — acceptable for rate limiting)
  const current = parseInt(await c.env.KV.get(kvKey) ?? '0')

  if (current >= limit) {
    const resetAt = (windowMin + 1) * 60
    return c.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED', retryAfter: resetAt - Math.floor(Date.now() / 1000) },
      { status: 429, headers: {
        'X-RateLimit-Limit':     String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset':     String(resetAt),
        'Retry-After':           String(resetAt - Math.floor(Date.now() / 1000)),
      }}
    )
  }

  // Increment count, set TTL to expire 90s after window (buffer)
  await c.env.KV.put(kvKey, String(current + 1), { expirationTtl: 90 })

  const remaining = limit - current - 1
  const resetAt   = (windowMin + 1) * 60

  c.header('X-RateLimit-Limit',     String(limit))
  c.header('X-RateLimit-Remaining', String(remaining))
  c.header('X-RateLimit-Reset',     String(resetAt))

  await next()
})
```

**Option B: Durable Objects Token Bucket (Strongly Consistent, ~5ms, for strict enforcement)**

```typescript
// durable-objects/RateLimiter.ts
import { DurableObject } from 'cloudflare:workers'

interface TokenBucketState {
  tokens:     number
  lastRefill: number
}

export class RateLimiter extends DurableObject {
  private readonly capacity:             number
  private readonly tokensPerSecond:      number
  private readonly millisecondsPerToken: number

  constructor(state: DurableObjectState, env: Bindings) {
    super(state, env)
    this.capacity            = 100
    this.tokensPerSecond     = 100 / 60     // 100 req/min
    this.millisecondsPerToken = 1000 / this.tokensPerSecond
  }

  async fetch(request: Request): Promise<Response> {
    const { limit } = await request.json<{ limit: number }>()

    // Override capacity from plan
    const effectiveCapacity = limit

    const state = await this.ctx.storage.get<TokenBucketState>('bucket') ?? {
      tokens:     effectiveCapacity,
      lastRefill: Date.now(),
    }

    const now = Date.now()
    const tokensToAdd = Math.floor((now - state.lastRefill) / this.millisecondsPerToken)
    const newTokens   = Math.min(effectiveCapacity, state.tokens + tokensToAdd)

    if (newTokens < 1) {
      return Response.json({ allowed: false, remaining: 0 }, { status: 429 })
    }

    await this.ctx.storage.put<TokenBucketState>('bucket', {
      tokens:     newTokens - 1,
      lastRefill: now,
    })

    // Schedule alarm to wake up DO for token refill
    await this.ctx.storage.setAlarm(now + this.millisecondsPerToken)

    return Response.json({ allowed: true, remaining: newTokens - 1 })
  }

  async alarm(): Promise<void> {
    // DO wakes up to handle pending refill — no-op needed, refill happens on next fetch
    console.log('RateLimiter alarm triggered for token refill')
  }
}

// Usage in middleware — route per-tenant to dedicated DO instance
export const doRateLimiter = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    const tenantId = c.get('tenantId')
    const plan     = c.get('plan')
    const limit    = PLAN_LIMITS[plan]

    const id     = c.env.RATE_LIMITER.idFromName(tenantId)
    const stub   = c.env.RATE_LIMITER.get(id)
    const result = await stub.fetch('http://internal/check', {
      method: 'POST',
      body:   JSON.stringify({ limit }),
    })

    if (result.status === 429) {
      return c.json({ error: 'Rate limit exceeded', code: 'RATE_LIMITED' }, 429)
    }

    await next()
  }
)
```

### KV Cache Invalidation Pattern

```typescript
// Invalidate all store-related cache keys on settings update
async function invalidateStoreCache(kv: KVNamespace, tenantId: string) {
  // KV doesn't support prefix deletion natively — list then delete
  const keys = await kv.list({ prefix: `store:${tenantId}:` })

  await Promise.all(
    keys.keys.map(({ name }) => kv.delete(name))
  )
}

// Three-tier caching hierarchy
async function getCached<T>(
  kv: KVNamespace,
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  // L1: Worker instance in-memory (free, ~0ms, lost on cold start)
  // L2: KV (~1ms, global, persisted)
  // L3: D1 (~10ms, authoritative)

  const cached = await kv.get<T>(key, 'json')
  if (cached) return cached

  const data = await fetcher()
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl })
  return data
}
```

---

## 7. Industry Best Practices (Stripe / Twilio Patterns)

### How Stripe Structures Their API Platform

Stripe's API is the gold standard. Every decision is deliberate and worth studying:

#### 1. Idempotency Keys
Every mutating request (POST, DELETE) accepts an `Idempotency-Key` header. If the same key is sent twice, the second call returns the cached response of the first — no duplicate charges, no double orders.

```typescript
// middleware/idempotency.ts
export const idempotencyMiddleware = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) {
      await next()
      return
    }

    const idempotencyKey = c.req.header('Idempotency-Key')
    if (!idempotencyKey) {
      await next()
      return
    }

    const tenantId  = c.get('tenantId')
    const cacheKey  = `idempotency:${tenantId}:${idempotencyKey}`

    // Check if we've seen this key before
    const cached = await c.env.KV.get(cacheKey, 'json') as {
      status: number
      body:   unknown
      headers: Record<string, string>
    } | null

    if (cached) {
      // Return the exact same response as before
      return c.json(cached.body, cached.status as any)
    }

    await next()

    // Store response for 24 hours (Stripe uses 24h window)
    const responseBody = await c.res.clone().json().catch(() => null)
    if (responseBody && c.res.status < 500) {
      await c.env.KV.put(cacheKey, JSON.stringify({
        status: c.res.status,
        body:   responseBody,
      }), { expirationTtl: 86400 })
    }
  }
)
```

#### 2. Structured Error Responses (Stripe-Style)

Never return bare strings. Every error has a machine-readable `code`, a human `message`, and a `param` pointing to the bad field.

```typescript
// lib/errors.ts
export type ApiErrorCode =
  | 'AUTH_MISSING'
  | 'AUTH_INVALID'
  | 'AUTH_EXPIRED'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'PAYMENT_FAILED'

export interface ApiError {
  error: {
    code:      ApiErrorCode
    message:   string
    param?:    string       // which field caused the error
    docUrl?:   string       // link to docs page explaining the error
    requestId: string
  }
}

// Usage in route handlers:
// return c.json<ApiError>({
//   error: {
//     code:    'VALIDATION_ERROR',
//     message: 'The price field must be a positive number.',
//     param:   'price',
//     docUrl:  'https://docs.ozzyl.com/errors/validation',
//     requestId: c.res.headers.get('X-Request-Id') ?? '',
//   }
// }, 422)
```

#### 3. Consistent Pagination (Cursor-Based, Stripe Style)

Never use page numbers for large datasets — they break under concurrent inserts. Use cursor-based pagination.

```typescript
// lib/pagination.ts
interface PaginationResult<T> {
  data:     T[]
  has_more: boolean
  next_cursor?: string
  url:      string
}

async function paginateCursor<T extends { id: string }>(
  db: D1Database,
  query: string,
  params: unknown[],
  limit: number,
  afterCursor?: string
): Promise<PaginationResult<T>> {
  // Fetch limit+1 to determine has_more
  const { results } = await db
    .prepare(query)
    .bind(...params, afterCursor ?? '', limit + 1)
    .all<T>()

  const hasMore = results.length > limit
  const items   = hasMore ? results.slice(0, limit) : results
  const lastId  = items[items.length - 1]?.id

  return {
    data:        items,
    has_more:    hasMore,
    next_cursor: hasMore ? Buffer.from(lastId).toString('base64') : undefined,
    url:         '',
  }
}

// Example response shape:
// {
//   "data": [...],
//   "has_more": true,
//   "next_cursor": "cHJvZF8xMjM=",
//   "url": "/v1/products"
// }
```

#### 4. API Key Prefix Strategy (Stripe-Style Visual Identification)

```typescript
// lib/api-keys.ts
// Keys are prefixed so users can instantly know the key type:
//   oz_live_xxxxxxxxxxxxxxxxxxxx  →  Production key
//   oz_test_xxxxxxxxxxxxxxxxxxxx  →  Test/sandbox key
//   oz_rk_xxxxxxxxxxxxxxxxxxxx   →  Restricted key (scoped permissions)

async function generateApiKey(
  env: Bindings,
  tenantId: string,
  type: 'live' | 'test' | 'restricted',
  name: string
): Promise<{ key: string; keyId: string }> {
  const prefix  = `oz_${type}_`
  const random  = crypto.randomUUID().replace(/-/g, '')
  const rawKey  = `${prefix}${random}`
  const keyHash = await hashKey(rawKey)
  const keyPrefix = rawKey.slice(0, 12) + '...' // Display in UI safely

  await env.DB
    .prepare(`INSERT INTO api_keys (tenant_id, key_hash, key_prefix, name)
              VALUES (?, ?, ?, ?)`)
    .bind(tenantId, keyHash, keyPrefix, name)
    .run()

  // Raw key is returned ONCE and never stored — like Stripe
  return { key: rawKey, keyId: keyHash.slice(0, 8) }
}
```

### How Twilio Structures Their API Platform

#### 1. Date-Scoped API Versions (Twilio Pattern)
Twilio uses date-based versioning (`/2010-04-01/`) which locks a tenant to a specific API snapshot. Their SDK always sends the correct date.

```typescript
// For a more mature v3 product — auto-negotiate version
const TWILIO_STYLE_VERSIONS: Record<string, string> = {
  '2024-01-01': 'v1',
  '2025-06-01': 'v2',
  '2026-01-01': 'v3',
}

// The customer's API key embeds their pinned version
// They never break unless they explicitly upgrade
```

#### 2. Sub-Account / Sub-Resource Isolation (Twilio Pattern)
Twilio allows creating sub-accounts per customer. Maps to our multi-tenant model:

```
Main Account (tenantId: "tenant_abc")
  ├── API Key 1 (Production)
  ├── API Key 2 (Test)
  └── Sub-Store / Sub-Project (storeId: "store_123")
        ├── Products scoped to store
        └── Orders scoped to store
```

### Universal API Platform Checklist

| Concern | Pattern | Implementation |
|---|---|---|
| **Authentication** | API Key (Bearer or custom header) | SHA-256 hash in D1, KV cache |
| **Authorization** | Scoped permissions per key | `permissions` JSON column in `api_keys` |
| **Rate Limiting** | Per-tenant, per-plan token bucket | KV (fast) or DO (strict) |
| **Idempotency** | 24h window keyed by `Idempotency-Key` | KV with 86400s TTL |
| **Versioning** | Path-based + optional date header | Hono `app.route('/v1', ...)` |
| **Error Responses** | Structured JSON with machine codes | `ApiError` type |
| **Pagination** | Cursor-based, never page numbers | `after` cursor param |
| **Webhooks** | HMAC-signed, queued, retried | Cloudflare Queues + DLQ |
| **Usage Metering** | Async, non-blocking | `ctx.waitUntil()` + D1 batch |
| **Audit Log** | Immutable append-only table | `api_usage_logs` table |
| **Key Rotation** | Revoke old + issue new atomically | D1 transaction |
| **Sandbox Mode** | `oz_test_` prefix keys → test data | Separate test D1 database |
| **Documentation** | OpenAPI 3.1 spec auto-generated | Hono OpenAPI middleware |
| **SDKs** | Type-safe RPC via Hono client | `hono/client` package |

### OpenAPI Auto-Generation with Hono

```typescript
// Hono can auto-generate OpenAPI specs — Stripe exposes theirs publicly
import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

const ProductSchema = z.object({
  id:    z.string(),
  name:  z.string(),
  price: z.number(),
}).openapi('Product')

const getProductRoute = createRoute({
  method:  'get',
  path:    '/products/{id}',
  tags:    ['Products'],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: ProductSchema } },
      description: 'Product retrieved successfully',
    },
    404: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Product not found',
    },
  },
})

app.openapi(getProductRoute, async (c) => {
  const { id } = c.req.valid('param')
  // handler...
  return c.json({ id, name: 'Test', price: 100 })
})

// Serve spec at /openapi.json
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: { title: 'Ozzyl API', version: '1.0.0' },
})

// Serve interactive docs at /docs (SwaggerUI)
app.get('/docs', swaggerUI({ url: '/openapi.json' }))
```

---

## 8. Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        API-AS-A-SERVICE PLATFORM                                │
│                  Cloudflare Workers + Hono + D1 + KV + Queues                   │
└─────────────────────────────────────────────────────────────────────────────────┘

CLIENT REQUEST FLOW
═══════════════════

  SDK / curl / Browser
         │
         │  Authorization: Bearer oz_live_xxxx
         │  Idempotency-Key: uuid
         │  API-Version: 2026-01-15
         ▼
┌─────────────────────┐
│   Cloudflare CDN    │  ← TLS termination, DDoS protection
│   Global Edge       │    ~150 PoPs worldwide
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         HONO WORKER (Main Router)                               │
│                                                                                 │
│  Middleware Chain (executes in order per request):                              │
│                                                                                 │
│  1. logger()          → Structured request logging                             │
│  2. secureHeaders()   → CSP, HSTS, X-Frame-Options                            │
│  3. cors()            → Expose X-RateLimit-* headers                          │
│  4. requestId()       → X-Request-Id: uuid                                    │
│  5. apiKeyAuth()      → KV lookup (fast) → D1 lookup (fallback)               │
│                          Sets: tenantId, plan, apiKey in Variables             │
│  6. idempotency()     → Check/store Idempotency-Key in KV                     │
│  7. rateLimiter()     → KV sliding window OR Durable Object token bucket      │
│                          Returns 429 if exceeded                               │
│  8. usageTracker()    → ctx.waitUntil() async D1 batch write (non-blocking)   │
│                                                                                 │
│  Route Tree:                                                                    │
│  ├── GET  /health          (unauthenticated)                                   │
│  ├── GET  /openapi.json    (unauthenticated)                                   │
│  ├── /v1/*  → v1Router                                                         │
│  │    ├── /products  (CRUD + cursor pagination)                                │
│  │    ├── /orders                                                               │
│  │    └── /webhooks  (register endpoints, list events)                         │
│  └── /v2/*  → v2Router                                                         │
│       ├── /products        (enhanced, new fields)                              │
│       ├── /orders                                                               │
│       ├── /recommendations (NEW — Vectorize powered)                           │
│       └── /analytics       (NEW — usage dashboard)                             │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼───────────────────────┐
              │                    │                        │
              ▼                    ▼                        ▼
   ┌──────────────────┐  ┌─────────────────┐   ┌──────────────────────┐
   │   Cloudflare D1  │  │  Cloudflare KV  │   │  Cloudflare Queues   │
   │   (SQLite SQL)   │  │  (Global Cache) │   │  (Async Processing)  │
   │                  │  │                 │   │                      │
   │ Tables:          │  │ Key patterns:   │   │ webhook-delivery     │
   │ • api_keys       │  │ apikey:{hash}   │   │  └─ max_retries: 5   │
   │ • api_usage_logs │  │ ratelimit:{tid} │   │  └─ backoff: exp.    │
   │ • api_usage_hrly │  │ store:{tid}:*   │   │  └─ DLQ → webhook-  │
   │ • products       │  │ idempotency:*   │   │       dlq            │
   │ • orders         │  │ session:*       │   │                      │
   │ • webhooks       │  │ dlq:{tid}:*     │   │ embedding-jobs       │
   │ • webhook_fails  │  │ webhook:{tid}:* │   │  └─ product upsert   │
   └──────────────────┘  └─────────────────┘   └──────────┬───────────┘
                                                           │
                                              ┌────────────┴────────────┐
                                              │                         │
                                              ▼                         ▼
                                   ┌──────────────────┐   ┌────────────────────┐
                                   │ Webhook Consumer │   │ Embedding Consumer │
                                   │    Worker        │   │     Worker         │
                                   │                  │   │                    │
                                   │ 1. Load endpoint │   │ 1. Fetch product   │
                                   │ 2. Sign payload  │   │    from D1         │
                                   │ 3. HTTP POST     │   │ 2. Run AI model    │
                                   │ 4. 429→retry     │   │    bge-base-en     │
                                   │ 5. 5xx→retry     │   │ 3. Upsert vector   │
                                   │    exp. backoff  │   │    + namespace     │
                                   │ 6. ack() or DLQ  │   └──────────┬─────────┘
                                   └──────────────────┘              │
                                                                      ▼
                                                         ┌────────────────────────┐
                                                         │   Cloudflare Vectorize │
                                                         │                        │
                                                         │ Index: product-embeds  │
                                                         │ Dim: 768 (bge-base)    │
                                                         │ Metric: cosine         │
                                                         │ Namespace: tenant-{id} │
                                                         │                        │
                                                         │ Used for:              │
                                                         │ • /v2/recommendations  │
                                                         │ • /v2/products/search  │
                                                         └────────────────────────┘

RATE LIMITING DECISION TREE
════════════════════════════

  Request arrives
       │
       ▼
  plan === 'enterprise'?
  ├── YES → Durable Object token bucket (strongly consistent)
  └── NO  → KV sliding window (eventually consistent, ~1ms)
                  │
                  ▼
            count >= limit?
            ├── YES → 429 + Retry-After header
            └── NO  → continue, set X-RateLimit-* headers

WEBHOOK DELIVERY STATE MACHINE
════════════════════════════════

  QUEUED → ATTEMPTING (attempt 1)
               │
           success? ──YES──→ DELIVERED ✓
               │
              NO
               │
           attempts < 5?
           ├── YES → RETRYING (30s → 60s → 120s → 240s → 480s)
           └── NO  → FAILED → Dead Letter Queue → dashboard alert

DATA RETENTION POLICY
══════════════════════

  api_usage_logs    → keep 90 days → archive to R2
  api_usage_hourly  → keep 2 years (small, aggregated)
  webhook_failures  → keep 30 days
  KV idempotency    → 24 hours (auto-expire)
  KV rate limits    → 90 seconds (auto-expire)
  KV api key cache  → 5 minutes (auto-expire)
  Vectorize vectors → indefinite (delete on product delete)
```

---

## Quick Reference: Key Decisions Summary

| Topic | Decision | Rationale |
|---|---|---|
| **API Framework** | Hono with typed Bindings + Variables | Type-safe, ultrafast, edge-native |
| **Versioning** | Path-based `/v1/`, `/v2/` + `API-Version` header | Explicit, cacheable, easy debugging |
| **Auth** | API key → SHA-256 hash → KV cache → D1 fallback | 300s KV cache = 0 D1 reads for hot keys |
| **Rate Limiting** | KV fixed window (default) + DO token bucket (enterprise) | Balance speed vs. accuracy |
| **Webhooks** | Cloudflare Queues + exponential backoff + DLQ | Managed, scalable, no infra |
| **Webhook Signing** | HMAC-SHA256 `v1={sig}` header (Stripe pattern) | Industry standard, easy to verify |
| **Idempotency** | `Idempotency-Key` header + KV 24h cache | Prevents duplicate mutations |
| **Usage Tracking** | `ctx.waitUntil()` + D1 batch (log + hourly agg) | Non-blocking, atomic, cheap |
| **High-Volume Metering** | Analytics Engine `writeDataPoint()` | Purpose-built, zero latency |
| **Recommendations** | Workers AI `bge-base-en-v1.5` + Vectorize | Fully edge-native, no external API |
| **Multi-tenant Vectors** | Vectorize namespace per tenant (≤50k tenants) | Native isolation, fast filtering |
| **Pagination** | Cursor-based `after` param | Stable under concurrent inserts |
| **Error Format** | `{ error: { code, message, param, docUrl } }` | Machine-readable (Stripe pattern) |
| **OpenAPI** | `@hono/zod-openapi` auto-generation | Living docs, type-safe SDK generation |

---

## Package Dependencies

```json
{
  "dependencies": {
    "hono":                "^4.x",
    "@hono/zod-openapi":   "^0.x",
    "@hono/zod-validator": "^0.x",
    "drizzle-orm":         "^0.x",
    "zod":                 "^3.x"
  },
  "devDependencies": {
    "drizzle-kit":                  "^0.x",
    "@cloudflare/workers-types":    "^4.x",
    "wrangler":                     "^3.x"
  }
}
```

---

*Research completed: 2026-02-18*
*Sources: Context7 MCP — Cloudflare Docs (24,388 snippets), Hono (2,765 snippets), Drizzle ORM (1,993 snippets), Cloudflare Durable Objects (2,872 snippets), Cloudflare Workflows (399 snippets)*

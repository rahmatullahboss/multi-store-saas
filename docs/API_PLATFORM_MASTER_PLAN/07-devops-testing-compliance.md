# Ozzyl API Platform — Part 7: DevOps, Testing, Compliance & Standards
> Source: API_PLATFORM_MASTER_PLAN.md v6.0 | Sections 18-22 + Checklist

## ✅ Pre-Implementation Checklist

Before writing ANY code:

- [ ] Database migration reviewed by team
- [ ] Security model reviewed (timing attacks, replay attacks)
- [ ] Rate limits agreed upon per plan
- [ ] OpenAPI spec drafted
- [ ] Error codes documented
- [ ] Webhook payload format finalized
- [ ] SDK API surface agreed (breaking changes are expensive)
- [ ] WordPress plugin structure follows WP coding standards
- [ ] Shopify app OAuth flow designed
- [ ] Monitoring/alerting setup plan ready

---

## 🎯 Summary: Why This Will Work

| Dimension | Assessment |
|-----------|------------|
| **Technical Feasibility** | ✅ 100% — Cloudflare Workers is perfect for this |
| **Market Fit** | ✅ High — BD market has no equivalent |
| **Complexity** | 🟡 Medium-High — 28 weeks total, but phased |
| **Revenue Potential** | 🔥 ৳10L+/month by Month 12 |
| **Competitive Moat** | ✅ First mover + BD-specific (bKash, Bangla) |
| **Risk** | 🟡 Shopify App Store review can take months |

**Bottom line**: এটা একটা **proven business model** (Stripe, Algolia, Clerk সবাই এভাবে করেছে) — শুধু **BD commerce context** এ apply করা হচ্ছে। Phase 1 শুরু করলেই momentum আসবে।

---

---

## 19. OpenAPI Specification

> **Generate automatically** using Hono's `@hono/zod-openapi` — never write OpenAPI YAML manually.

### Setup with Hono OpenAPI

```typescript
// apps/web/server/api/v1/openapi.ts
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

// Define route with OpenAPI schema
const listProductsRoute = createRoute({
  method: 'get',
  path: '/products',
  tags: ['Products'],
  security: [{ ApiKeyAuth: [] }],
  request: {
    query: z.object({
      limit:  z.coerce.number().min(1).max(100).default(20).openapi({ example: 20 }),
      after:  z.string().optional().openapi({ example: 'eyJpZCI6MTIzfQ==' }),
      search: z.string().optional().openapi({ example: 'শার্ট' }),
      status: z.enum(['active','draft','archived']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of products',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(z.object({
              id:             z.number(),
              handle:         z.string(),
              name:           z.string(),
              price:          z.number(),
              compareAtPrice: z.number().nullable(),
              status:         z.enum(['active','draft','archived']),
              inventory:      z.number(),
              createdAt:      z.string().datetime(),
            })),
            pagination: z.object({
              hasMore:    z.boolean(),
              nextCursor: z.string().nullable(),
              limit:      z.number(),
            }),
          }),
        },
      },
    },
    401: { description: 'Invalid API key' },
    429: { description: 'Rate limit exceeded' },
  },
})

app.openapi(listProductsRoute, listProducts)

// Serve OpenAPI spec at /api/v1/spec.json
app.doc('/spec.json', {
  openapi: '3.1.0',
  info: {
    title: 'Ozzyl Commerce API',
    version: '1.0.0',
    description: 'Commerce infrastructure API for Bangladesh',
    contact: { email: 'api@ozzyl.com', url: 'https://docs.ozzyl.com' },
    license: { name: 'Commercial' },
  },
  servers: [
    { url: 'https://api.ozzyl.com/v1', description: 'Production' },
    { url: 'https://api.staging.ozzyl.com/v1', description: 'Staging' },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
  },
})

// Serve Swagger UI at /api/v1/docs
app.get('/docs', swaggerUI({ url: '/api/v1/spec.json' }))
```

### OpenAPI Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/spec.json` | Raw OpenAPI 3.1 JSON spec |
| `GET /api/v1/docs` | Interactive Swagger UI |
| `GET /api/v1/docs/postman` | Postman collection export |

---

## 20. Testing Strategy

> **Rule**: No feature ships without tests. Enterprise grade = tested grade.

### Test Stack

| Type | Tool | Location | Run Command |
|------|------|----------|-------------|
| Unit | Vitest | `apps/web/tests/` | `npm run test` |
| Integration | Vitest + miniflare | `apps/web/tests/integration/` | `npm run test:integration` |
| E2E | Playwright | `apps/web/e2e/` | `npm run e2e` |
| Load | k6 | `apps/web/load-tests/` | `k6 run load-tests/api.js` |

### Unit Tests — API Key System

```typescript
// apps/web/tests/api-key-generator.test.ts
import { describe, it, expect } from 'vitest'
import { generateApiKey, hashApiKey } from '../server/services/api-key-generator'

describe('generateApiKey', () => {
  it('generates key with correct format', async () => {
    const { raw, hash, prefix } = await generateApiKey('live')
    expect(raw).toMatch(/^oz_live_[0-9a-f]{64}$/)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(prefix).toBe(raw.substring(0, 12))
  })

  it('generates unique keys on each call', async () => {
    const [a, b] = await Promise.all([generateApiKey(), generateApiKey()])
    expect(a.raw).not.toBe(b.raw)
    expect(a.hash).not.toBe(b.hash)
  })

  it('hash is consistent', async () => {
    const { raw } = await generateApiKey()
    const hash1 = await hashApiKey(raw)
    const hash2 = await hashApiKey(raw)
    expect(hash1).toBe(hash2)
  })

  it('test env prefix works', async () => {
    const { raw } = await generateApiKey('test')
    expect(raw).toMatch(/^oz_test_/)
  })
})
```

### Integration Tests — Auth Middleware

```typescript
// apps/web/tests/integration/api-auth.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { Miniflare } from 'miniflare'

describe('API Key Auth Middleware', () => {
  let mf: Miniflare

  beforeAll(async () => {
    mf = new Miniflare({
      scriptPath: './build/worker.js',
      d1Databases: ['DB'],
      kvNamespaces: ['KV'],
    })
  })

  it('rejects requests without API key', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/v1/products')
    expect(res.status).toBe(401)
    const body = await res.json() as any
    expect(body.error.code).toBe('MISSING_API_KEY')
  })

  it('rejects revoked keys', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/v1/products', {
      headers: { 'X-API-Key': 'oz_live_revokedkey123' },
    })
    expect(res.status).toBe(401)
    expect((await res.json() as any).error.code).toBe('INVALID_API_KEY')
  })

  it('rejects keys with insufficient scope', async () => {
    // Key with read-only scope trying to POST
    const res = await mf.dispatchFetch('http://localhost/api/v1/products', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.TEST_READ_ONLY_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Test' }),
    })
    expect(res.status).toBe(403)
    expect((await res.json() as any).error.code).toBe('INSUFFICIENT_SCOPE')
  })

  it('accepts valid key and returns products', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/v1/products', {
      headers: { 'X-API-Key': process.env.TEST_VALID_KEY! },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('X-RateLimit-Limit')).toBeTruthy()
    const body = await res.json() as any
    expect(Array.isArray(body.data)).toBe(true)
  })
})
```

### Webhook Tests

```typescript
// apps/web/tests/webhook-dispatcher.test.ts
import { describe, it, expect, vi } from 'vitest'
import { signWebhook, verifyWebhookSignature } from '../server/services/webhook-dispatcher'

describe('Webhook Signing', () => {
  it('verifies valid signature', async () => {
    const secret = 'test_secret_123'
    const body = JSON.stringify({ type: 'order.created', data: {} })
    const timestamp = Math.floor(Date.now() / 1000)
    const sig = await signWebhook(body, secret)
    const signature = `t=${timestamp},v1=${sig}`

    const isValid = await verifyWebhookSignature(body, signature, secret)
    expect(isValid).toBe(true)
  })

  it('rejects replayed signatures (>5 min old)', async () => {
    const secret = 'test_secret_123'
    const body = JSON.stringify({ type: 'order.created' })
    const oldTimestamp = Math.floor(Date.now() / 1000) - 400 // 6+ min ago
    const sig = await signWebhook(body, secret)
    const signature = `t=${oldTimestamp},v1=${sig}`

    const isValid = await verifyWebhookSignature(body, signature, secret)
    expect(isValid).toBe(false)
  })

  it('rejects tampered body', async () => {
    const secret = 'test_secret_123'
    const body = JSON.stringify({ type: 'order.created' })
    const timestamp = Math.floor(Date.now() / 1000)
    const sig = await signWebhook(body, secret)
    const signature = `t=${timestamp},v1=${sig}`

    const tamperedBody = JSON.stringify({ type: 'order.created', injected: true })
    const isValid = await verifyWebhookSignature(tamperedBody, signature, secret)
    expect(isValid).toBe(false)
  })
})
```

### Load Test (k6)

```javascript
// apps/web/load-tests/api.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // ramp up
    { duration: '1m',  target: 1000 },  // sustained load
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'],   // 99% under 500ms
    http_req_failed:   ['rate<0.01'],   // <1% error rate
  },
}

export default function () {
  const res = http.get('https://api.ozzyl.com/v1/products', {
    headers: {
      'X-API-Key':  __ENV.TEST_API_KEY,
      'X-Store-Id': __ENV.TEST_STORE_ID, // required for multi-tenant routing
    },
  })
  check(res, {
    'status 200': (r) => r.status === 200,
    'has data':   (r) => JSON.parse(r.body).data !== undefined,
    'under 300ms':(r) => r.timings.duration < 300,
  })
  sleep(0.1)
}
```

### Test Coverage Requirements

| Area | Min Coverage |
|------|-------------|
| API Key generation & hashing | 100% |
| Auth middleware | 95% |
| Rate limiting | 90% |
| Webhook signing/verification | 100% |
| Scope hierarchy logic | 100% |
| Business logic (orders, products) | 80% |

---

## 21. GDPR / PDPA Compliance

> **Why**: EU visitors → GDPR. Bangladesh PDPA coming 2026. Build compliant from day 1.

### Data Classification

| Data Type | Examples | Retention | Deletion |
|-----------|----------|-----------|---------|
| **API Usage Logs** | endpoint, status, IP | 90 days → auto-delete | On account delete |
| **Customer Analytics** | behavior events, page views | 2 years | On customer request |
| **Webhook Payloads** | order data in deliveries | 30 days | On account delete |
| **API Keys** | hash only (not raw) | Until revoked | On account delete |

### Shopify GDPR Webhooks (Required for App Store)

```typescript
// apps/web/app/routes/shopify.gdpr.tsx
// Shopify requires these 3 endpoints for App Store approval

// 1. customers/redact — delete customer data
app.post('/shopify/webhooks/customers/redact', async (c) => {
  const body = await c.req.json()
  await verifyShopifyWebhook(/* ... */)
  // Delete all customer analytics events for this customer
  await c.env.DB.prepare(
    `DELETE FROM analytics_events WHERE store_id = ? AND customer_id = ?`
  ).bind(body.shop_id, body.customer.id).run()
  return c.json({ received: true })
})

// 2. shop/redact — delete all shop data (30 days after uninstall)
app.post('/shopify/webhooks/shop/redact', async (c) => {
  const body = await c.req.json()
  await verifyShopifyWebhook(/* ... */)
  // Cascade delete via FK constraints: api_keys, api_usage_logs, webhooks
  await c.env.DB.prepare(
    `DELETE FROM stores WHERE shopify_shop_id = ?`
  ).bind(body.shop_id).run()
  return c.json({ received: true })
})

// 3. customers/data_request — export customer data
app.post('/shopify/webhooks/customers/data_request', async (c) => {
  const body = await c.req.json()
  await verifyShopifyWebhook(/* ... */)
  // Compile all data for this customer and email to shop owner
  const events = await c.env.DB.prepare(
    `SELECT * FROM analytics_events WHERE store_id = ? AND customer_id = ?`
  ).bind(body.shop_id, body.customer.id).all()
  // Email data export to body.shop.email...
  return c.json({ received: true })
})
```

### Data Processing Agreement (DPA)

- Publish DPA at `https://ozzyl.com/dpa`
- Required for EU B2B customers (GDPR Article 28)
- Template: use standard Cloudflare DPA as base (Cloudflare is our sub-processor)

### Cookie & Tracking Policy

```typescript
// Widget tracking — always check consent first
ozzyl.events.track = function(event) {
  // Check for consent before tracking
  if (!window.__OZZYL_CONSENT__ && navigator.doNotTrack === '1') {
    return Promise.resolve() // silently skip
  }
  // proceed with tracking...
}
```

### Right to Deletion API

```typescript
// DELETE /api/v1/customers/:id/data
// Deletes all analytics data for a customer (GDPR right to erasure)
v1.delete('/customers/:id/data', requireScopes('customers:write'), async (c) => {
  const { storeId } = c.var.apiKey
  const customerId = c.req.param('id')

  await c.env.DB.batch([
    c.env.DB.prepare(
      `DELETE FROM analytics_events WHERE store_id = ? AND customer_id = ?`
    ).bind(storeId, customerId),
    c.env.DB.prepare(
      `DELETE FROM api_usage_logs WHERE store_id = ? AND customer_id = ?`
    ).bind(storeId, customerId),
  ])

  return c.json({ deleted: true, customerId })
})
```

---

## 22. Coding Standards & Non-Negotiable Rules

### 8 Absolute Rules

1. **NEVER store raw API keys** — always SHA-256 hash before saving to D1
2. **ALWAYS filter by storeId** — every DB query must be scoped to the authenticated store
3. **ALWAYS validate input with Zod** — no raw user data passes through unvalidated
4. **NEVER use `===` for secret comparison** — always `crypto.subtle.timingSafeEqual`
5. **ALWAYS use `waitUntil` for non-critical writes** — tracking, logging never block response
6. **ALWAYS version APIs** — `/v1/`, `/v2/` — never break existing integrations silently
7. **NEVER expose internal IDs in errors** — error messages must not leak DB structure
8. **ALWAYS verify webhook signatures** — reject unverified payloads immediately

### File Naming Conventions

```
server/api/v1/        → endpoint handlers (nouns: products.ts, orders.ts)
server/middleware/     → middleware (verb-noun: api-key-auth.ts, rate-limit.ts)
server/services/       → business logic (noun-noun: api-key-generator.ts)
app/routes/           → Remix routes (dot-notation: app.developer.api-keys.tsx)
packages/sdk/src/     → SDK files (camelCase: resources/analytics.ts)
tests/                → unit tests (*.test.ts)
tests/integration/    → integration tests (*.integration.test.ts)
```

### TypeScript Rules

```typescript
// ✅ Always explicit return types on public functions
export async function generateApiKey(env: ApiKeyEnvironment): Promise<GeneratedApiKey> { ... }

// ✅ Never use 'any' — use 'unknown' and narrow
function processRow(row: unknown): ApiKeyRecord {
  if (!row || typeof row !== 'object') throw new Error('Invalid row')
  return row as ApiKeyRecord
}

// ✅ Use satisfies for config objects
const PLAN_LIMITS = {
  free: { perMinute: 60, perDay: 1000 },
} satisfies Record<string, RateLimitConfig>

// ❌ Never
const data: any = await fetch(...)
```

### Pre-Implementation Checklist

Before writing any code:
- [ ] DB migration file created and numbered correctly
- [ ] Rate Limiting bindings added to wrangler.toml (RL_FREE, RL_STARTER, RL_PRO, RL_AGENCY — one per plan)
- [ ] Analytics Engine binding added: `[[analytics_engine_datasets]] binding = "ANALYTICS"`
- [ ] ENCRYPTION_KEY secret set: `wrangler secret put ENCRYPTION_KEY`
- [ ] Webhook Queue created: `wrangler queues create ozzyl-webhook-queue`
- [ ] WEBHOOK_QUEUE binding added to wrangler.toml
- [ ] Zod schema defined for all inputs
- [ ] TypeScript types defined for all outputs
- [ ] Unit test file created (TDD)
- [ ] storeId scoping verified in all queries
- [ ] Rate limiting considered
- [ ] Error codes documented in error table
- [ ] OpenAPI route defined

---

*Last Updated: 2026-02-24*
*Version: 6.0 — All 17 adversarial review issues resolved*
*Status: ✅ Production Ready Plan*

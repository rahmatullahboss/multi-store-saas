# Ozzyl API Platform — Part 3: API Routes & Webhooks
> Source: API_PLATFORM_MASTER_PLAN.md v6.0 | Sections 7-8

## 7. Public API Routes

### Full API v1 Router

```typescript
// apps/web/server/api/v1/index.ts
// All imports use tsconfig path aliases: ~ → apps/web/app/, ~server → apps/web/server/
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { apiKeyAuth } from '../../middleware/api-key-auth'
import { rateLimitMiddleware } from '../../middleware/rate-limit'
import { usageTracker } from '../../middleware/usage-tracker'
import { idempotencyMiddleware } from '../../middleware/idempotency'

// requestIdMiddleware — injects unique X-Request-Id on every request
function requestIdMiddleware() {
  return createMiddleware(async (c, next) => {
    const id = c.req.header('x-request-id') ?? crypto.randomUUID()
    c.set('requestId', id)
    c.header('X-Request-Id', id)
    await next()
  })
}


/**
 * requireScopes — convenience wrapper around apiKeyAuth
 * Usage: v1.get('/products', requireScopes('products:read'), handler)
 */
function requireScopes(...scopes: ApiKeyScope[]) {
  return apiKeyAuth(scopes)
}

const v1 = new Hono()

// Global middleware stack (order matters!)
v1.use('*', logger())
v1.use('*', secureHeaders())
v1.use('*', prettyJSON())
v1.use('*', requestIdMiddleware())  // X-Request-Id header
v1.use('*', cors({ /* config above */ }))
v1.use('*', apiKeyAuth())           // validates key, sets c.var.apiKey
v1.use('*', rateLimitMiddleware())  // checks limits, sets X-RateLimit-* headers
v1.use('*', usageTracker())         // non-blocking D1 write via waitUntil
// ✅ CORRECT Hono method filtering — use v1.on() not v1.use() with comma-separated methods
v1.on(['POST', 'PUT', 'PATCH'], '*', idempotencyMiddleware())

// Error handler — structured Stripe-style errors
v1.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  const requestId = c.var.requestId ?? crypto.randomUUID()
  console.error(JSON.stringify({ level: 'error', requestId, error: err.message }))
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
      docs: 'https://docs.ozzyl.com/errors',
    }
  }, 500)
})

// ── Products ──────────────────────────────────────────────
v1.get('/products',        requireScopes('products:read'),   listProducts)
v1.get('/products/:handle', requireScopes('products:read'),  getProduct)
v1.post('/products',       requireScopes('products:write'),  createProduct)
v1.put('/products/:id',    requireScopes('products:write'),  updateProduct)
v1.delete('/products/:id', requireScopes('products:delete'), deleteProduct)

// ── Orders ────────────────────────────────────────────────
v1.get('/orders',          requireScopes('orders:read'),     listOrders)
v1.get('/orders/:id',      requireScopes('orders:read'),     getOrder)
v1.post('/orders',         requireScopes('orders:write'),    createOrder)
v1.put('/orders/:id',      requireScopes('orders:write'),    updateOrder)
v1.post('/orders/:id/refund', requireScopes('orders:refund'), issueRefund)

// ── Customers ─────────────────────────────────────────────
v1.get('/customers',       requireScopes('customers:read'),  listCustomers)
v1.get('/customers/:id',   requireScopes('customers:read'),  getCustomer)

// ── Analytics ─────────────────────────────────────────────
v1.get('/analytics/summary',   requireScopes('analytics:read'), getAnalyticsSummary)
v1.get('/analytics/products',  requireScopes('analytics:read'), getProductAnalytics)
v1.get('/analytics/customers', requireScopes('analytics:read'), getCustomerAnalytics)

// ── Recommendations (AI) ──────────────────────────────────
v1.get('/recommendations', requireScopes('products:read'), getRecommendations)

// ── Webhooks ──────────────────────────────────────────────
v1.get('/webhooks',        requireScopes('webhooks:manage'), listWebhooks)
v1.post('/webhooks',       requireScopes('webhooks:manage'), createWebhook)
v1.delete('/webhooks/:id', requireScopes('webhooks:manage'), deleteWebhook)
v1.post('/webhooks/:id/test', requireScopes('webhooks:manage'), testWebhook)

export default v1
```

### Products Endpoint (Complete Example)

```typescript
// apps/web/server/api/v1/products.ts
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and, like, desc, asc, lt, gt } from 'drizzle-orm'
import { products as productsTable } from '../../../../packages/database/src/schema'
import type { Context } from 'hono'

const ListProductsSchema = z.object({
  limit:  z.coerce.number().min(1).max(100).default(20),
  after:  z.string().optional(),   // cursor pagination
  search: z.string().optional(),
  status: z.enum(['active','draft','archived']).optional(),
  sort:   z.enum(['created_at','name','price']).default('created_at'), // ✅ safe whitelist — no dynamic key access
  order:  z.enum(['asc','desc']).default('desc'),
})

export async function listProducts(c: Context) {
  const { storeId } = c.var.apiKey
  const query = ListProductsSchema.parse(c.req.query())
  const db = drizzle(c.env.DB)

  const conditions = [eq(productsTable.storeId, storeId)]
  if (query.status) conditions.push(eq(productsTable.status, query.status))
  if (query.search) conditions.push(like(productsTable.name, `%${query.search}%`))
  // Cursor pagination: decode base64 cursor → get id, filter rows after it
  if (query.after) {
    try {
      const cursorId = parseInt(atob(query.after))
      if (!isNaN(cursorId)) {
        if (query.order === 'desc') {
          conditions.push(lt(productsTable.id, cursorId))
        } else {
          conditions.push(gt(productsTable.id, cursorId))
        }
      }
    } catch {
      // Invalid cursor — ignore, return from beginning
    }
  }

  const products = await db.select({
    id: productsTable.id,
    handle: productsTable.handle,
    name: productsTable.name,
    price: productsTable.price,
    compareAtPrice: productsTable.compareAtPrice,
    status: productsTable.status,
    inventory: productsTable.inventory,
    images: productsTable.images,
    createdAt: productsTable.createdAt,
  })
  .from(productsTable)
  .where(and(...conditions))
  .limit(query.limit + 1)  // fetch +1 to detect hasMore
  .orderBy(query.order === 'asc'
    ? asc(productsTable[query.sort])
    : desc(productsTable[query.sort]))

  const hasMore = products.length > query.limit
  const data = hasMore ? products.slice(0, -1) : products
  const nextCursor = hasMore ? btoa(data[data.length - 1].id.toString()) : null

  return c.json({
    data,
    pagination: {
      hasMore,
      nextCursor,
      limit: query.limit,
    }
  })
}
```

---

## 8. Webhook System

### Outbound Dispatcher (Cloudflare Queues)

```typescript
// apps/web/server/services/webhook-dispatcher.ts
// Source: Cloudflare Queues docs (Context7 verified)
// Retry schedule: 30s → 60s → 120s → 240s → 480s (exponential backoff)

export type WebhookEvent =
  | 'order.created' | 'order.updated' | 'order.fulfilled' | 'order.cancelled'
  | 'product.created' | 'product.updated' | 'product.deleted'
  | 'customer.created' | 'customer.updated'

export interface WebhookPayload {
  id: string          // unique event ID
  type: WebhookEvent
  created: number     // unix timestamp
  storeId: number
  data: Record<string, unknown>
}

/**
 * Dispatch an event to all registered webhooks for a store.
 * Call this after any state-changing operation.
 *
 * Usage:
 *   await dispatchWebhookEvent(env, 'order.created', storeId, orderData)
 */
export async function dispatchWebhookEvent(
  env: Env,
  event: WebhookEvent,
  storeId: number,
  data: Record<string, unknown>
): Promise<void> {
  // Get all active endpoints for this event
  const endpoints = await env.DB.prepare(
    `SELECT we.id, we.url, we.secret
     FROM webhook_endpoints we, json_each(we.events) je
     WHERE we.store_id = ? AND we.status = 'active'
     AND je.value = ?`
  ).bind(storeId, event).all()

  if (!endpoints.results.length) return

  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    type: event,
    created: Math.floor(Date.now() / 1000),
    storeId,
    data,
  }

  // Send to Cloudflare Queue — one message per endpoint
  await env.WEBHOOK_QUEUE.sendBatch(
    endpoints.results.map(ep => ({
      body: { endpoint: ep, payload },
      contentType: 'json',
    }))
  )
}

/**
 * Queue consumer — runs as separate Worker
 * Handles delivery with exponential backoff retry
 */
export default {
  async queue(batch: MessageBatch<{ endpoint: any; payload: WebhookPayload }>, env: Env) {
    for (const msg of batch.messages) {
      const { endpoint, payload } = msg.body

      try {
        const body = JSON.stringify(payload)
        const signature = await signWebhook(body, endpoint.secret)
        const timestamp = Math.floor(Date.now() / 1000)

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Ozzyl-Signature': `t=${timestamp},v1=${signature}`,
            'X-Ozzyl-Event': payload.type,
            'X-Ozzyl-Delivery': payload.id,
            'User-Agent': 'Ozzyl-Webhook/1.0',
          },
          body,
          signal: AbortSignal.timeout(10000),  // 10s timeout
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        // Success — log to D1
        await env.DB.prepare(
          `UPDATE webhook_deliveries SET status='delivered', delivered_at=unixepoch(),
           response_status=? WHERE id=?`
        ).bind(response.status, payload.id).run()

        msg.ack()

      } catch (err) {
        const attempt = msg.attempts  // Cloudflare tracks this automatically
        const maxAttempts = 5

        if (attempt >= maxAttempts) {
          // Dead letter — abandon after 5 failures
          await env.DB.prepare(
            `UPDATE webhook_deliveries SET status='abandoned', attempt_count=? WHERE id=?`
          ).bind(attempt, payload.id).run()
          msg.ack()  // ack to remove from queue
        } else {
          // Exponential backoff: 30s, 60s, 120s, 240s, 480s
          const delaySeconds = Math.min(30 * Math.pow(2, attempt - 1), 43200)
          msg.retry({ delaySeconds })
        }
      }
    }
  }
}

/**
 * HMAC-SHA256 webhook signing (Stripe-compatible format)
 */
async function signWebhook(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}
```

### Webhook Receiver (For Incoming — e.g., bKash callback)

```typescript
// Verify incoming webhook signature
export async function verifyWebhookSignature(
  body: string,
  signature: string,    // "t=1708790460,v1=abc123..."
  secret: string
): Promise<boolean> {
  const parts = Object.fromEntries(signature.split(',').map(p => p.split('=')))
  const timestamp = parseInt(parts.t)
  const sig = parts.v1

  // Replay attack prevention: reject if > 5 minutes old
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false

  const expected = await signWebhook(`${timestamp}.${body}`, secret)

  // Timing-safe comparison
  const encoder = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
    crypto.subtle.digest('SHA-256', encoder.encode(sig)),
  ])
  return crypto.subtle.timingSafeEqual(a, b)
}
```


---


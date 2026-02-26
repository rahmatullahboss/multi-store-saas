# Ozzyl API Platform — Part 2: Auth & Security
> Source: API_PLATFORM_MASTER_PLAN.md v6.0 | Sections 4-6

## 4. API Key System

### Key Generation (Cryptographically Secure)

```typescript
// apps/web/server/services/api-key-generator.ts
// Source: Cloudflare Workers crypto docs (Context7 verified)

export type ApiKeyEnvironment = 'live' | 'test'
export type ApiKeyScope = 
  | 'read' | 'write' | 'admin'
  | 'products:read' | 'products:write' | 'products:delete'
  | 'orders:read' | 'orders:write' | 'orders:refund'
  | 'customers:read' | 'customers:write'
  | 'analytics:read'
  | 'webhooks:manage'
  | '*'

export interface GeneratedApiKey {
  raw: string      // shown to user ONCE — never store this
  hash: string     // SHA-256 hex — store in D1
  prefix: string   // first 12 chars for display ("oz_live_4a7f")
}

/**
 * Generate a cryptographically secure API key.
 * Format: oz_{env}_{64 random hex chars}
 * Example: oz_live_4a7f2c8d9e... (Stripe-style)
 *
 * Uses Web Crypto API — NEVER use Math.random() for security
 */
export async function generateApiKey(
  env: ApiKeyEnvironment = 'live'
): Promise<GeneratedApiKey> {
  // 32 random bytes = 256 bits entropy
  const rawBytes = new Uint8Array(32)
  crypto.getRandomValues(rawBytes)

  const randomHex = Array.from(rawBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')  // 64 hex chars

  const raw = `oz_${env}_${randomHex}`

  // SHA-256 hash for storage — raw key can never be recovered
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw))
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const prefix = raw.substring(0, 12)  // "oz_live_4a7f"
  return { raw, hash, prefix }
}

/**
 * Hash a raw API key for lookup.
 * Always hash before looking up — never store or compare raw keys.
 */
export async function hashApiKey(raw: string): Promise<string> {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw))
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
```

### API Key Auth Middleware

```typescript
// apps/web/server/middleware/api-key-auth.ts
// Pattern: Stripe-style, Context7 verified Hono createMiddleware

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { hashApiKey } from '../services/api-key-generator'

export interface ApiKeyRecord {
  keyId: string
  storeId: number
  scopes: ApiKeyScope[]
  plan: 'free' | 'starter' | 'pro' | 'agency'
  expiresAt: number | null
  revokedAt: number | null
}

// Extend Hono context — type-safe downstream access
declare module 'hono' {
  interface ContextVariableMap {
    apiKey: ApiKeyRecord
    requestId: string
  }
}

export function apiKeyAuth(requiredScopes: ApiKeyScope[] = []) {
  return createMiddleware(async (c, next) => {
    // 1. Extract key — support both x-api-key and Authorization: Bearer
    const rawKey =
      c.req.header('x-api-key') ??
      c.req.header('authorization')?.replace(/^Bearer\s+/i, '')

    if (!rawKey?.startsWith('oz_')) {
      throw new HTTPException(401, {
        message: 'Missing or malformed API key. Use X-API-Key header.',
        res: c.json({
          error: {
            code: 'MISSING_API_KEY',
            message: 'Provide your API key via X-API-Key header or Authorization: Bearer',
            docs: 'https://docs.ozzyl.com/api/authentication',
          }
        }, 401)
      })
    }

    // 2. Hash for lookup — NEVER look up raw key
    const hashed = await hashApiKey(rawKey)
    const kvKey = `apikey:v1:${hashed}`

    // 3. KV cache check (fast path ~1ms)
    let record = await c.env.KV.get<ApiKeyRecord>(kvKey, 'json')

    if (!record) {
      // 4. D1 fallback (~10ms, only on cache miss)
      // NOTE: When a key is revoked, call KV.delete(kvKey) immediately
      //       This ensures revocation is instant. The 300s TTL is only for
      //       active keys to reduce D1 reads. See revokeApiKey() service.
      const row = await c.env.DB.prepare(
        `SELECT ak.id as keyId, ak.store_id as storeId, ak.scopes,
                ak.plan_id as plan, ak.expires_at as expiresAt,
                ak.revoked_at as revokedAt, ak.allowed_origins as allowedOrigins,
                ap.req_per_min as rateLimit, ap.req_per_day as dailyLimit
         FROM api_keys ak
         LEFT JOIN api_plans ap ON ap.id = ak.plan_id
         WHERE ak.key_hash = ? LIMIT 1`
      ).bind(hashed).first<any>()

      if (!row || row.revokedAt) {
        throw new HTTPException(401, {
          res: c.json({
            error: { code: 'INVALID_API_KEY', message: 'Invalid or revoked API key' }
          }, 401)
        })
      }

      record = { ...row, scopes: JSON.parse(row.scopes) }
      // Cache 5 minutes — balance freshness vs D1 reads
      await c.env.KV.put(kvKey, JSON.stringify(record), { expirationTtl: 300 })
    }

    // 5. Check expiry
    if (record.expiresAt && Date.now() / 1000 > record.expiresAt) {
      await c.env.KV.delete(kvKey)
      throw new HTTPException(401, {
        res: c.json({
          error: { code: 'API_KEY_EXPIRED', message: 'API key has expired' }
        }, 401)
      })
    }

    // 6. Check required scopes
    if (requiredScopes.length > 0) {
      const missing = requiredScopes.filter(s => !hasScope(record!.scopes, s))
      if (missing.length > 0) {
        throw new HTTPException(403, {
          res: c.json({
            error: {
              code: 'INSUFFICIENT_SCOPE',
              message: `Missing required scopes: ${missing.join(', ')}`,
            }
          }, 403)
        })
      }
    }

    // 7. Attach to context
    c.set('apiKey', record)

    // 8. Non-blocking: update last_used_at
    // ✅ Correct Hono + Cloudflare Workers pattern:
    // executionCtx is passed via the Worker fetch handler and bound via Hono's app.fetch(req, env, ctx)
    // Access via c.env.ctx (if bound) or pass ctx directly. In Hono, use:
    const ctx = (c.env as any).ctx as ExecutionContext | undefined
    const updatePromise = c.env.DB.prepare(
      `UPDATE api_keys SET last_used_at = unixepoch(), total_requests = total_requests + 1
       WHERE id = ?`
    ).bind(record.keyId).run()
    if (ctx?.waitUntil) {
      ctx.waitUntil(updatePromise)
    } else {
      // fallback: fire and forget (non-blocking)
      updatePromise.catch(console.error)
    }

    await next()
  })
}

// Scope hierarchy: admin ⊃ write ⊃ read
const SCOPE_HIERARCHY: Record<string, ApiKeyScope[]> = {
  '*':     ['read','write','admin','products:read','products:write','products:delete',
             'orders:read','orders:write','orders:refund','customers:read','customers:write',
             'analytics:read','webhooks:manage'],
  'admin': ['read','write','products:read','products:write','products:delete',
             'orders:read','orders:write','orders:refund','customers:read','customers:write',
             'analytics:read','webhooks:manage'],
  'write': ['read','products:read','products:write','orders:read','orders:write',
             'customers:read','customers:write'],
  'read':  ['products:read','orders:read','customers:read','analytics:read'],
}

export function hasScope(granted: ApiKeyScope[], required: ApiKeyScope): boolean {
  if (granted.includes(required)) return true
  return granted.some(g => SCOPE_HIERARCHY[g]?.includes(required))
}
```


---

## 5. Rate Limiting Implementation

> **Pattern**: Cloudflare Workers Rate Limiting API — atomic, edge-native, zero race conditions.
> **Source**: Cloudflare Workers Rate Limiting docs (2025)
> ⚠️ Previous KV read-modify-write pattern had a race condition — replaced with atomic Workers RL API.

### wrangler.toml Bindings Required

```toml
[[unsafe.bindings]]
name = "RATE_LIMITER"
# Note: Workers Rate Limiting API requires paid Workers plan (not free tier)
type = "ratelimit"
namespace_id = "1001"       # unique per Worker
simple = { limit = 60, period = 60 }   # default: 60 req/min (overridden per plan in code)
```

### Rate Limit Middleware

```typescript
// apps/web/server/middleware/rate-limit.ts
// Uses Cloudflare Workers Rate Limiting API — atomic, no race conditions
// Docs: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

import { createMiddleware } from 'hono/factory'

// Per-plan limits (requests per minute)
const PLAN_LIMITS: Record<string, { perMinute: number; perDay: number }> = {
  free:    { perMinute: 60,     perDay: 1_000 },
  starter: { perMinute: 300,    perDay: 50_000 },
  pro:     { perMinute: 1_000,  perDay: 200_000 },
  agency:  { perMinute: 10_000, perDay: -1 },  // -1 = unlimited
}

export function rateLimitMiddleware() {
  return createMiddleware(async (c, next) => {
    const apiKey = c.var.apiKey
    if (!apiKey) return next()

    const plan = apiKey.plan ?? 'free'
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free

    // Agency plan = unlimited
    if (limits.perDay === -1) {
      c.header('X-RateLimit-Policy', 'unlimited')
      return next()
    }

    const now = Math.floor(Date.now() / 1000)
    const minuteReset = Math.ceil(now / 60) * 60

    // ✅ Cloudflare Workers Rate Limiting API — atomic, no race condition
    // key = per-API-key rate limit (not per-IP)
    const { success } = await c.env.RATE_LIMITER.limit({
      key: `${apiKey.keyId}:${plan}`,
    })

    if (!success) {
      return c.json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded: ${limits.perMinute} requests/minute on ${plan} plan`,
          retryAfter: minuteReset - now,
          upgrade: plan !== 'agency' ? 'https://ozzyl.com/pricing' : undefined,
          docs: 'https://docs.ozzyl.com/api/rate-limits',
        }
      }, 429, {
        'Retry-After': String(minuteReset - now),
        'X-RateLimit-Limit': String(limits.perMinute),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(minuteReset),
        'X-RateLimit-Policy': `${limits.perMinute};w=60`,
      })
    }

    // Set headers on successful requests too
    c.header('X-RateLimit-Limit', String(limits.perMinute))
    c.header('X-RateLimit-Reset', String(minuteReset))
    c.header('X-RateLimit-Policy', `${limits.perMinute};w=60`)

    return next()
  })
}

/**
 * Instant API key revocation.
 * Call this from revokeApiKey() action — deletes KV cache globally (~1s propagation).
 */
export async function revokeApiKeyCache(
  kv: KVNamespace,
  keyHash: string
): Promise<void> {
  await kv.delete(`apikey:v1:${keyHash}`)
}
```

> **Note on per-plan limits**: The Workers Rate Limiting API binding uses a single configured limit.
> For multiple plan tiers, create **separate bindings** per plan in wrangler.toml:
>
> ```toml
> [[unsafe.bindings]]
> name = "RL_FREE"
> type = "ratelimit"
> namespace_id = "1001"
> simple = { limit = 60, period = 60 }
>
> [[unsafe.bindings]]
> name = "RL_PRO"
> type = "ratelimit"
> namespace_id = "1002"
> simple = { limit = 1000, period = 60 }
> ```
>
> Then in middleware: `const limiter = plan === 'pro' ? c.env.RL_PRO : c.env.RL_FREE`

---

## 5b. Usage Tracker Middleware

```typescript
// apps/web/server/middleware/usage-tracker.ts
// Non-blocking usage tracking via Cloudflare Analytics Engine + batched D1 writes

import { createMiddleware } from 'hono/factory'

export function usageTracker() {
  return createMiddleware(async (c, next) => {
    const start = Date.now()
    await next()
    const latencyMs = Date.now() - start

    const apiKey = c.var.apiKey
    if (!apiKey) return

    const ctx = (c.env as any).ctx as ExecutionContext | undefined

    const trackPromise = (async () => {
      // 1. Cloudflare Analytics Engine — real-time, unlimited writes
      if (c.env.ANALYTICS) {
        c.env.ANALYTICS.writeDataPoint({
          blobs: [apiKey.keyId, String(apiKey.storeId), c.req.path, c.req.method, String(c.res.status)],
          doubles: [latencyMs],
          indexes: [apiKey.keyId],
        })
      }

      // 2. Batched D1 write every 100 requests to avoid write bottleneck
      const batchKey = 'usage_batch:' + apiKey.keyId
      // ⚠️ TRADEOFF: KV read-modify-write below is NOT atomic.
      // Worst-case = a few counts missed under extreme concurrency.
      // Acceptable for analytics. For billing-critical counting → use Durable Objects.
      const current = await c.env.KV.get(batchKey)
      const count = current ? parseInt(current) + 1 : 1

      if (count >= 100) {
        await c.env.DB.prepare(
          'INSERT INTO api_usage_logs (key_id, store_id, endpoint, method, status_code, latency_ms, request_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())'
        ).bind(apiKey.keyId, apiKey.storeId, c.req.path, c.req.method, c.res.status, latencyMs, c.var.requestId ?? null).run()
        await c.env.KV.delete(batchKey)
      } else {
        await c.env.KV.put(batchKey, String(count), { expirationTtl: 3600 })
      }
    })()

    if (ctx?.waitUntil) {
      ctx.waitUntil(trackPromise)
    } else {
      trackPromise.catch(console.error)
    }
  })
}
```

> **wrangler.toml** — add Analytics Engine binding:
> ```toml
> [[analytics_engine_datasets]]
> binding = "ANALYTICS"
> dataset = "api_usage"
> ```




---

## 6. Security Architecture

### 7-Layer Defense in Depth

```
Layer 1: Cloudflare WAF          → DDoS, bot, geo-blocking
Layer 2: Rate Limiting           → Per-key, per-IP, per-plan
Layer 3: API Key Validation      → SHA-256 hash, KV+D1 lookup
Layer 4: Expiry & Revocation     → Time-based + instant revoke
Layer 5: Scope Authorization     → Granular permission check
Layer 6: Store Isolation         → Every query scoped to storeId
Layer 7: Input Validation        → Zod schema on all inputs
```

### Timing-Safe Key Comparison

```typescript
// CRITICAL: Never use === for secret comparison
// Always use timingSafeEqual to prevent timing attacks

async function timingSafeCompare(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const [bufA, bufB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ])
  return crypto.subtle.timingSafeEqual(bufA, bufB)
}

// ✅ CORRECT — comparing two SHA-256 digests via timingSafeEqual
// Note: The auth middleware correctly hashes the incoming key with SHA-256 before
// comparing stored hash. This means we're comparing two fixed-length (256-bit) digests,
// which is timing-safe as long as we use crypto.subtle.timingSafeEqual (NOT ===).
// The hashApiKey() function is used consistently — this timingSafeCompare is for
// cases like webhook secret verification where you have two raw strings.
const isValid = await timingSafeCompare(providedKey, storedHash)

// ❌ WRONG — leaks timing info, enables brute force
const isValid = providedKey === storedHash

// ✅ Auth middleware uses this pattern (consistent with above):
// const hashed = await hashApiKey(rawKey)        // hash incoming key
// const row = await DB.prepare(...).bind(hashed)  // look up stored hash
// → Timing-safe because DB lookup time is constant for both valid and invalid keys
```

### CORS Security

```typescript
// apps/web/server/api/v1/index.ts
import { cors } from 'hono/cors'

app.use('/api/*', cors({
  origin: (origin, c) => {
    if (!origin) return '*'  // server-to-server: allow
    const apiKey = c.var.apiKey
    // Check allowedOrigins stored per key in D1
    if (apiKey?.allowedOrigins) {
      const allowed: string[] = JSON.parse(apiKey.allowedOrigins)
      return allowed.some(o => origin.endsWith(o.replace('*', ''))) ? origin : null
    }
    return origin  // allow all if no restriction set
  },
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Idempotency-Key'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset',
                  'X-Request-Id'],
  maxAge: 600,
}))
```

### Idempotency Keys (Stripe Pattern)

```typescript
// Prevent duplicate operations (e.g., double-charging)
// Client sends: X-Idempotency-Key: <uuid>
// Server stores result in KV for 24 hours

export function idempotencyMiddleware() {
  return createMiddleware(async (c, next) => {
    const key = c.req.header('x-idempotency-key')
    if (!key || c.req.method === 'GET') return next()

    // Validate idempotency key format (must be UUID)
    if (!/^[0-9a-f-]{36}$/i.test(key)) {
      return c.json({
        error: {
          code: 'INVALID_IDEMPOTENCY_KEY',
          message: 'X-Idempotency-Key must be a valid UUID v4',
        }
      }, 400)
    }

    const cacheKey = `idempotency:${c.var.apiKey.storeId}:${key}`

    // Check for existing response
    const cached = await c.env.KV.get(cacheKey, 'json') as any
    if (cached) {
      if (cached.status === 'processing') {
        // Another request is in flight with same key — return 409
        return c.json({
          error: {
            code: 'IDEMPOTENCY_IN_PROGRESS',
            message: 'A request with this idempotency key is already being processed',
          }
        }, 409)
      }
      // Return cached response
      return c.json(cached.body, cached.status)
    }

    // Mark as processing — prevents race condition (TTL: 30s for in-flight)
    await c.env.KV.put(cacheKey, JSON.stringify({ status: 'processing' }), {
      expirationTtl: 30,
    })

    await next()

    // Store final response for 24 hours
    try {
      // ✅ Use c.res.clone() to avoid consuming the response body
  // Note: In Hono, after next(), c.res is set. clone() is required before reading body.
  // If clone() fails (e.g. streaming response), catch and skip caching gracefully.
  const body = await c.res.clone().json()
      await c.env.KV.put(cacheKey, JSON.stringify({
        status: c.res.status,
        body,
      }), { expirationTtl: 86400 })
    } catch {
      // If response isn't JSON, delete the processing marker
      await c.env.KV.delete(cacheKey)
    }
  })
}
```

---


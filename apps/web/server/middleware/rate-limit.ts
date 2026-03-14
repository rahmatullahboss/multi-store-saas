/**
 * rate-limit.ts — Ozzyl API Platform
 * Hono middleware: sliding-window rate limiting via Cloudflare KV
 *
 * PRIMARY implementation: KV sliding window (works on free plan, always available).
 * OPTIONAL upgrade: Cloudflare Workers Rate Limiting API (atomic, paid plan only).
 *   Requires a [[rate_limiting]] section in wrangler.toml AND a paid Workers plan.
 *   When the RATE_LIMITER binding is present it is preferred because it is atomic
 *   (no KV read-modify-write race condition).
 *
 * Decision flow:
 *   1. RATE_LIMITER binding present (paid plan)? → use Workers RL API (atomic). REQUIRED in production.
 *   2. KV namespace present (STORE_CACHE or RATE_LIMIT_KV)? → use KV sliding window (dev/staging only).
 *   3. Neither available? → fail CLOSED in production (503), allow through in dev/test only.
 *
 * KV bindings checked (in order):
 *   - STORE_CACHE   (already wired in most deployments)
 *   - RATE_LIMIT_KV (dedicated namespace if preferred)
 *
 * ⚠️  TOCTOU RACE CONDITION (KV path):
 *   The KV sliding-window implementation has an inherent read-modify-write race:
 *   two concurrent requests may both read count=N, both write N+1, and one extra
 *   request slips through. This is acceptable for MVP / low-traffic but NOT for
 *   production at scale. Mitigation:
 *     - Use the RATE_LIMITER Workers RL binding (atomic, no race) in production.
 *       Add to wrangler.toml (requires Cloudflare paid plan):
 *         [[rate_limiting]]
 *         binding = "RATE_LIMITER"
 *         namespace_id = "<your-namespace-id>"
 *         simple = { limit = 100, period = 60 }
 *     - Set ENVIRONMENT = "production" in wrangler.toml [vars] to enforce the
 *       RATE_LIMITER binding requirement and fail closed when KV is unavailable.
 *     - For free-plan deployments, accept the approximate KV behaviour and monitor
 *       for abuse via Analytics Engine / usage tracking middleware.
 */

import type { MiddlewareHandler } from 'hono';
import type { ValidatedApiKey } from '~/services/api.server';

// ─── Per-plan rate limits ─────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<string, { requestsPerMinute: number; requestsPerDay: number }> = {
  free:    { requestsPerMinute: 30,   requestsPerDay: 1_000 },
  starter: { requestsPerMinute: 100,  requestsPerDay: 10_000 },
  pro:     { requestsPerMinute: 500,  requestsPerDay: 100_000 },
  agency:  { requestsPerMinute: 2000, requestsPerDay: 1_000_000 },
};

const DEFAULT_PLAN = 'free';

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * rateLimitMiddleware
 * Must run AFTER apiKeyAuth (needs c.var.apiKey)
 *
 * @example
 * v1.use('*', apiKeyAuth(), rateLimitMiddleware())
 */
export function rateLimitMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const apiKey: ValidatedApiKey | undefined = c.var.apiKey;
    if (!apiKey) {
      // No API key = unauthenticated, skip rate limiting (auth middleware handles rejection)
      await next();
      return;
    }

    const planName = resolvePlanName(apiKey.planId);
    const limits = PLAN_LIMITS[planName] ?? PLAN_LIMITS[DEFAULT_PLAN];
    const rateLimitKey = `store:${apiKey.storeId}:key:${apiKey.id}`;

    const env = c.env as unknown as Record<string, unknown>;
    const isProduction = env['ENVIRONMENT'] === 'production';
    const windowMs = 60_000;

    // ── Option A: Workers Rate Limiting API (atomic, paid plan only) ──
    // This binding requires [[rate_limiting]] in wrangler.toml and a paid Workers
    // plan. It is NOT available on the free plan or in local `wrangler dev`.
    // When present it is EXCLUSIVELY used — no KV fallback — because it is atomic
    // (no TOCTOU race condition). REQUIRED in production environments.
    const rateLimiter = env['RATE_LIMITER'] as RateLimiter | undefined;
    if (rateLimiter) {
      const { success } = await rateLimiter.limit({ key: rateLimitKey });
      if (!success) {
        return rateLimitResponse(c, planName, limits.requestsPerMinute);
      }
      await next();
      return;
    }

    // ── Option A2: Durable Object rate limiter service (atomic) ──
    // Existing deployment binding in wrangler.toml:
    // [[services]]
    // binding = "RATE_LIMITER_SERVICE"
    const rateLimiterService = env['RATE_LIMITER_SERVICE'] as Fetcher | undefined;
    if (rateLimiterService) {
      const result = await consumeWithRateLimiterService(
        rateLimiterService,
        rateLimitKey,
        limits.requestsPerMinute,
        windowMs
      );

      if (result.ok) {
        if (!result.allowed) {
          return rateLimitResponse(c, planName, limits.requestsPerMinute);
        }

        c.res.headers.set('X-RateLimit-Limit', String(limits.requestsPerMinute));
        c.res.headers.set('X-RateLimit-Remaining', String(Math.max(0, result.remaining ?? 0)));
        c.res.headers.set('X-RateLimit-Reset', String(result.resetEpochSeconds ?? nextMinuteReset()));
        c.res.headers.set('X-RateLimit-Plan', planName);
        await next();
        return;
      }

      // Fail closed in production when atomic limiter service is configured but unavailable.
      if (isProduction) {
        console.error('[RateLimit] CRITICAL: RATE_LIMITER_SERVICE call failed in production — rejecting request.');
        return c.json(
          { success: false, error: 'service_unavailable', message: 'Service temporarily unavailable' },
          503
        );
      }
    }

    // ── Production guard: RATE_LIMITER binding is required in production ──
    // If we reach here in production, an atomic rate limiter is missing.
    // Fail CLOSED to prevent an unprotected production API surface.
    if (isProduction) {
      console.error('[RateLimit] CRITICAL: Atomic rate limiter missing in production (RATE_LIMITER or RATE_LIMITER_SERVICE) — rejecting request.');
      return c.json(
        { success: false, error: 'service_unavailable', message: 'Service temporarily unavailable' },
        503
      );
    }

    // ── Option B: KV sliding window (dev/staging only) ──
    // ⚠️  TOCTOU race: concurrent requests may both read count=N and both write
    // N+1, allowing one extra request through per race window. Acceptable for
    // development and staging; use RATE_LIMITER binding in production instead.
    const kv = env['STORE_CACHE'] as KVNamespace | undefined
      ?? env['RATE_LIMIT_KV'] as KVNamespace | undefined;
    if (!kv) {
      // No rate limiter available in dev/test — fail open with a warning.
      // To fix: wire STORE_CACHE or RATE_LIMIT_KV in wrangler.toml, or add
      // [[rate_limiting]] for production (paid Workers plan required).
      console.warn('[RateLimit] No rate limiter available (RATE_LIMITER binding missing, no KV namespace found) — allowing request through in non-production environment');
      await next();
      return;
    }
    const windowKey = `rl:${rateLimitKey}:${currentMinuteWindow()}`;

    const raw = await kv.get(windowKey).catch(() => null);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= limits.requestsPerMinute) {
      return rateLimitResponse(c, planName, limits.requestsPerMinute);
    }

    // Increment (approximate — not atomic in KV)
    // Wrapped in try-catch: if KV write limit is exhausted, allow request through
    try {
      await kv.put(windowKey, String(count + 1), { expirationTtl: 120 });
    } catch (err) {
      // KV put() limit exceeded — degrade gracefully, don't crash the request
      console.warn('[RateLimit] KV put failed (likely daily limit exceeded), allowing request through:', err instanceof Error ? err.message : err);
    }

    // Set rate limit headers
    c.res.headers.set('X-RateLimit-Limit', String(limits.requestsPerMinute));
    c.res.headers.set('X-RateLimit-Remaining', String(Math.max(0, limits.requestsPerMinute - count - 1)));
    c.res.headers.set('X-RateLimit-Reset', String(nextMinuteReset()));
    c.res.headers.set('X-RateLimit-Plan', planName);

    await next();
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolvePlanName(planId: number | null): string {
  if (!planId) return DEFAULT_PLAN;
  // Map planId → plan name (extend as plans are added to DB)
  const planMap: Record<number, string> = {
    1: 'free',
    2: 'starter',
    3: 'pro',
    4: 'agency',
  };
  return planMap[planId] ?? DEFAULT_PLAN;
}

function currentMinuteWindow(): number {
  return Math.floor(Date.now() / 60_000);
}

function nextMinuteReset(): number {
  return Math.ceil(Date.now() / 60_000) * 60;
}

function rateLimitResponse(c: Parameters<MiddlewareHandler>[0], plan: string, limit: number) {
  return c.json(
    {
      success: false,
      error: 'rate_limit_exceeded',
      message: `Rate limit exceeded for plan '${plan}'. Limit: ${limit} requests/minute.`,
      docs: 'https://docs.ozzyl.com/api/rate-limiting',
    },
    429,
    {
      'Retry-After': '60',
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(nextMinuteReset()),
      'X-RateLimit-Plan': plan,
    }
  );
}

// ─── Route-specific rate limiters ────────────────────────────────────────────

/**
 * Creates a simple KV-based rate limiter middleware for a fixed request limit per minute.
 * Used for route-specific limits (checkout, cart, auth, orders, etc.)
 */
function createSimpleRateLimit(limitPerMinute: number, label: string): () => MiddlewareHandler {
  return () => async (c, next) => {
    const kv =
      (c.env as unknown as Record<string, unknown>)['STORE_CACHE'] as KVNamespace | undefined ??
      (c.env as unknown as Record<string, unknown>)['RATE_LIMIT_KV'] as KVNamespace | undefined;

    if (!kv) {
      await next();
      return;
    }

    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';
    const windowKey = `rl:${label}:${ip}:${currentMinuteWindow()}`;

    const raw = await kv.get(windowKey).catch(() => null);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= limitPerMinute) {
      return c.json(
        {
          success: false,
          error: 'rate_limit_exceeded',
          message: `Too many requests. Limit: ${limitPerMinute} requests/minute.`,
        },
        429,
        { 'Retry-After': '60' }
      );
    }

    // Wrapped in try-catch: if KV write limit is exhausted, allow request through
    try {
      await kv.put(windowKey, String(count + 1), { expirationTtl: 120 });
    } catch (err) {
      console.warn(`[RateLimit:${label}] KV put failed, allowing through:`, err instanceof Error ? err.message : err);
    }
    await next();
  };
}

/** 30 req/min — standard public API routes */
export const standardApiLimit = createSimpleRateLimit(30, 'api');

/** 10 req/min — auth routes (login, register, password reset) */
export const authLimit = createSimpleRateLimit(10, 'auth');

/** 30 req/min — order creation / management */
export const orderLimit = createSimpleRateLimit(30, 'order');

/** 10 req/min — AI chat / assistant */
export const aiChatLimit = createSimpleRateLimit(10, 'ai-chat');

/** 30 req/min — checkout page & checkout API */
export const checkoutLimit = createSimpleRateLimit(30, 'checkout');

/** 50 req/min — cart operations */
export const cartLimit = createSimpleRateLimit(50, 'cart');

/** 60 req/min — image proxy */
export const proxyImageLimit = createSimpleRateLimit(60, 'proxy-image');

// ─── TypeScript: Workers Rate Limiting API type ───────────────────────────────

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface RateLimiterServiceResponse {
  allowed: boolean;
  remaining?: number;
  resetAt?: number;
}

interface RateLimiterServiceConsumeResult {
  ok: boolean;
  allowed?: boolean;
  remaining?: number;
  resetEpochSeconds?: number;
}

async function consumeWithRateLimiterService(
  service: Fetcher,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimiterServiceConsumeResult> {
  try {
    const identifier = key.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const url = `http://internal/do/${identifier}/consume?limit=${limit}&window=${windowMs}`;
    const res = await service.fetch(url, { method: 'POST' });

    if (!res.ok && res.status !== 429) {
      return { ok: false };
    }

    const body = await res.json() as RateLimiterServiceResponse;
    return {
      ok: true,
      allowed: body.allowed,
      remaining: body.remaining,
      resetEpochSeconds: body.resetAt ? Math.ceil(body.resetAt / 1000) : undefined,
    };
  } catch {
    return { ok: false };
  }
}

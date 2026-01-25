/**
 * Rate Limiter DO Service - Helper functions for per-store/IP rate limiting
 * 
 * Prevents spam and abuse:
 * Spammer ──► 1000 requests/second ──► BLOCKED! ✅
 * 
 * Usage:
 * ```ts
 * import { checkRateLimit, rateLimitMiddleware } from '~/services/rate-limiter-do.server';
 * 
 * // In loader/action
 * const result = await checkRateLimit(env, storeId, clientIP, 'api');
 * if (!result.allowed) {
 *   throw new Response('Too many requests', { status: 429 });
 * }
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  windowMs: number;
  resetAt: number;
  retryAfterMs?: number;
}

export type RateLimitPreset = 'api' | 'auth' | 'checkout' | 'upload' | 'search';

interface Env {
  RATE_LIMITER_SERVICE: Fetcher;
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

export const RATE_LIMIT_PRESETS: Record<RateLimitPreset, { limit: number; windowMs: number }> = {
  api: { limit: 100, windowMs: 60000 },      // 100 req/min
  auth: { limit: 10, windowMs: 60000 },      // 10 req/min (login/register)
  checkout: { limit: 5, windowMs: 60000 },   // 5 req/min (payment)
  upload: { limit: 20, windowMs: 60000 },    // 20 req/min (file upload)
  search: { limit: 50, windowMs: 60000 },    // 50 req/min (search)
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check and consume rate limit
 */
export async function checkRateLimit(
  env: Env,
  storeId: number | string,
  clientIP: string,
  preset: RateLimitPreset = 'api',
  cost = 1
): Promise<RateLimitResult> {
  try {
    // Sanitize IP for use in DO ID
    const sanitizedIP = clientIP.replace(/[^a-zA-Z0-9.-]/g, '_');
    const identifier = `${storeId}-${sanitizedIP}`;
    
    const response = await env.RATE_LIMITER_SERVICE.fetch(
      `http://internal/do/${identifier}/consume?preset=${preset}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset, cost }),
      }
    );
    
    return await response.json() as RateLimitResult;
  } catch (error) {
    console.error('checkRateLimit error:', error);
    // Fail open on errors (allow request)
    return {
      allowed: true,
      remaining: 999,
      limit: 100,
      windowMs: 60000,
      resetAt: Date.now() + 60000,
    };
  }
}

/**
 * Check rate limit without consuming (dry run)
 */
export async function peekRateLimit(
  env: Env,
  storeId: number | string,
  clientIP: string,
  preset: RateLimitPreset = 'api'
): Promise<RateLimitResult> {
  try {
    const sanitizedIP = clientIP.replace(/[^a-zA-Z0-9.-]/g, '_');
    const identifier = `${storeId}-${sanitizedIP}`;
    
    const response = await env.RATE_LIMITER_SERVICE.fetch(
      `http://internal/do/${identifier}/check?preset=${preset}`,
      { method: 'GET' }
    );
    
    return await response.json() as RateLimitResult;
  } catch (error) {
    console.error('peekRateLimit error:', error);
    return {
      allowed: true,
      remaining: 999,
      limit: 100,
      windowMs: 60000,
      resetAt: Date.now() + 60000,
    };
  }
}

/**
 * Reset rate limit for an identifier (admin only)
 */
export async function resetRateLimit(
  env: Env,
  storeId: number | string,
  clientIP: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitizedIP = clientIP.replace(/[^a-zA-Z0-9.-]/g, '_');
    const identifier = `${storeId}-${sanitizedIP}`;
    
    const response = await env.RATE_LIMITER_SERVICE.fetch(
      `http://internal/do/${identifier}/reset`,
      { method: 'POST' }
    );
    
    return await response.json() as { success: boolean; message?: string };
  } catch (error) {
    console.error('resetRateLimit error:', error);
    return { success: false };
  }
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    '0.0.0.0'
  );
}

/**
 * Rate limit middleware for Remix loaders/actions
 * Throws 429 response if rate limit exceeded
 */
export async function rateLimitMiddleware(
  env: Env,
  request: Request,
  storeId: number | string,
  preset: RateLimitPreset = 'api'
): Promise<void> {
  const clientIP = getClientIP(request);
  const result = await checkRateLimit(env, storeId, clientIP, preset);
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.retryAfterMs || 60000) / 1000);
    
    throw new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfterSeconds: retryAfter,
        resetAt: new Date(result.resetAt).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

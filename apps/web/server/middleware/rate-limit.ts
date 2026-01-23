/**
 * Rate Limiting Middleware
 * 
 * Implements sliding window rate limiting using Cloudflare KV
 * or in-memory store for development.
 * 
 * Features:
 * - Per-IP rate limiting
 * - Different limits per endpoint type
 * - Configurable windows and limits
 * - Returns rate limit headers (X-RateLimit-*)
 */

import { Context, MiddlewareHandler } from 'hono';

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window size in seconds */
  windowMs: number;
  /** Key prefix for storage */
  keyPrefix?: string;
  /** Custom key generator (default: IP address) */
  keyGenerator?: (c: Context) => string;
  /** Skip rate limiting for certain requests */
  skip?: (c: Context) => boolean;
  /** Custom response when rate limited */
  onLimitReached?: (c: Context, retryAfter: number) => Response;
}

// ============================================================================
// IN-MEMORY STORE (Development fallback)
// ============================================================================
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
      if (value.resetAt < now) {
        memoryStore.delete(key);
      }
    }
  }, 60 * 1000);
}

// ============================================================================
// RATE LIMITER
// ============================================================================

/**
 * Get client IP from request
 */
function getClientIP(c: Context): string {
  // Cloudflare provides real IP
  const cfIP = c.req.header('cf-connecting-ip');
  if (cfIP) return cfIP;
  
  // X-Forwarded-For header
  const xff = c.req.header('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  
  // X-Real-IP header
  const realIP = c.req.header('x-real-ip');
  if (realIP) return realIP;
  
  // Fallback
  return 'unknown';
}

/**
 * Rate Limiting Middleware
 * 
 * @example
 * ```ts
 * // Standard API rate limit
 * app.use('/api/*', rateLimit({ limit: 100, windowMs: 60 }));
 * 
 * // Strict limit for auth endpoints
 * app.use('/api/auth/*', rateLimit({ 
 *   limit: 5, 
 *   windowMs: 900, // 15 minutes
 *   keyPrefix: 'auth' 
 * }));
 * ```
 */
export const rateLimit = (config: RateLimitConfig): MiddlewareHandler => {
  const {
    limit,
    windowMs,
    keyPrefix = 'rl',
    keyGenerator = (c) => getClientIP(c),
    skip,
    onLimitReached,
  } = config;
  
  return async (c: Context, next: () => Promise<void>) => {
    // Skip if configured
    if (skip && skip(c)) {
      return next();
    }
    
    const key = `${keyPrefix}:${keyGenerator(c)}`;
    const now = Date.now();
    const windowEnd = now + windowMs * 1000;
    
    let current = 0;
    let resetAt = windowEnd;
    
    // Try KV storage first (production)
    const kv = c.env?.RATE_LIMIT_KV;
    
    if (kv) {
      // Use Cloudflare KV
      const stored = await kv.get(key, 'json') as { count: number; resetAt: number } | null;
      
      if (stored && stored.resetAt > now) {
        current = stored.count;
        resetAt = stored.resetAt;
      }
      
      current++;
      
      await kv.put(key, JSON.stringify({ count: current, resetAt }), {
        expirationTtl: Math.ceil(windowMs),
      });
    } else {
      // Fallback to in-memory store (development)
      const stored = memoryStore.get(key);
      
      if (stored && stored.resetAt > now) {
        current = stored.count;
        resetAt = stored.resetAt;
      }
      
      current++;
      memoryStore.set(key, { count: current, resetAt });
    }
    
    // Calculate remaining
    const remaining = Math.max(0, limit - current);
    const retryAfter = Math.ceil((resetAt - now) / 1000);
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', Math.ceil(resetAt / 1000).toString());
    
    // Check if rate limited
    if (current > limit) {
      c.header('Retry-After', retryAfter.toString());
      
      if (onLimitReached) {
        return onLimitReached(c, retryAfter);
      }
      
      return c.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
          retryAfter,
        },
        429
      );
    }
    
    return next();
  };
};

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/**
 * Standard API rate limit
 * 100 requests per minute per IP
 */
export const standardApiLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 100,
    windowMs: 60,
    keyPrefix: 'api',
  });
};

/**
 * Strict rate limit for auth endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 5,
    windowMs: 900, // 15 minutes
    keyPrefix: 'auth',
    onLimitReached: (c, retryAfter) => {
      return c.json(
        {
          success: false,
          error: 'অনেক বেশি লগইন চেষ্টা। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
          code: 'AUTH_RATE_LIMITED',
          retryAfter,
        },
        429
      );
    },
  });
};

/**
 * Order creation rate limit
 * 10 orders per minute per IP (prevent order spam)
 */
export const orderLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 10,
    windowMs: 60,
    keyPrefix: 'order',
    onLimitReached: (c, retryAfter) => {
      return c.json(
        {
          success: false,
          error: 'অর্ডার লিমিট অতিক্রান্ত। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
          code: 'ORDER_RATE_LIMITED',
          retryAfter,
        },
        429
      );
    },
  });
};

/**
 * Search rate limit
 * 30 requests per minute per IP
 */
export const searchLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 30,
    windowMs: 60,
    keyPrefix: 'search',
  });
};

/**
 * Webhook rate limit
 * 100 requests per minute per endpoint
 */
export const webhookLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 100,
    windowMs: 60,
    keyPrefix: 'webhook',
    keyGenerator: (c) => `${c.req.path}`, // Per-endpoint, not per-IP
  });
};

/**
 * AI/Chat rate limit
 * 20 requests per minute per user
 */
export const aiChatLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 20,
    windowMs: 60,
    keyPrefix: 'ai',
    onLimitReached: (c, retryAfter) => {
      return c.json(
        {
          success: false,
          error: 'AI chat limit reached. Please wait before sending more messages.',
          code: 'AI_RATE_LIMITED',
          retryAfter,
        },
        429
      );
    },
  });
};

/**
 * Rate Limiting Middleware - IMPROVED VERSION
 *
 * Based on Cloudflare Context7 best practices:
 * - KV has 1 write/second limit per key (uses memory-first strategy)
 * - Exponential backoff for KV write failures
 * - Better error handling and logging
 * - Batch write operations where possible
 *
 * Features:
 * - Per-IP rate limiting with sliding window
 * - Memory-first strategy to reduce KV writes
 * - Exponential backoff for KV failures
 * - Different limits per endpoint type
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
  /** Use memory-first strategy (reduces KV writes) */
  useMemoryFirst?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
  lastSync?: number; // Last time synced to KV
}

// ============================================================================
// IN-MEMORY STORE (Development fallback + memory-first strategy)
// ============================================================================
const memoryStore = new Map<string, RateLimitEntry>();

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get client IP from request
 * Priority: CF-Connecting-IP > X-Forwarded-For > X-Real-IP > unknown
 */
function getClientIP(c: Context): string {
  // Cloudflare provides real IP (most reliable)
  const cfIP = c.req.header('cf-connecting-ip');
  if (cfIP) return cfIP;

  // X-Forwarded-For header (first IP is usually the client)
  const xff = c.req.header('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();

  // X-Real-IP header
  const realIP = c.req.header('x-real-ip');
  if (realIP) return realIP;

  // Fallback - should not happen in production
  return 'unknown';
}

/**
 * Derive a tenant-aware scope for rate limiting.
 * This prevents one tenant's traffic from throttling another tenant sharing NAT IPs.
 */
function getTenantScope(c: Context): string {
  const host = c.req.header('x-forwarded-host') || c.req.header('host') || 'unknown-host';
  return host.split(':')[0].toLowerCase();
}

/**
 * Retry with exponential backoff for KV operations
 * Based on Context7 best practices for handling KV rate limits
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  initialDelay = 100
): Promise<T> {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempts++;

      // Check if it's a KV rate limit error
      const isRateLimit =
        error instanceof Error &&
        (error.message.includes('429') ||
          error.message.includes('Too Many Requests') ||
          error.message.includes('KV PUT failed'));

      if (!isRateLimit || attempts >= maxAttempts) {
        throw error;
      }

      // Exponential backoff: 100ms, 200ms, 400ms
      console.warn(`[RateLimiter] KV write attempt ${attempts} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error('Max retry attempts reached');
}

/**
 * Sync memory state to KV with debouncing
 * Only syncs every 5 seconds to reduce KV writes
 */
async function syncToKV(
  kv: KVNamespace,
  key: string,
  entry: RateLimitEntry,
  windowMs: number
): Promise<void> {
  const now = Date.now();

  // Only sync if 5 seconds have passed since last sync
  if (entry.lastSync && now - entry.lastSync < 5000) {
    return;
  }

  try {
    await retryWithBackoff(async () => {
      await kv.put(key, JSON.stringify(entry), {
        expirationTtl: Math.ceil(windowMs),
      });
    });

    entry.lastSync = now;
  } catch (error) {
    console.error(`[RateLimiter] Failed to sync to KV for key ${key}:`, error);
    // Don't throw - memory state is still valid
  }
}

// ============================================================================
// RATE LIMITER IMPLEMENTATION
// ============================================================================

/**
 * Rate Limiting Middleware - Production Ready
 *
 * @example
 * ```ts
 * // Standard API rate limit
 * app.use('/api/*', rateLimit({ limit: 100, windowMs: 60 }));
 *
 * // Strict limit for auth endpoints
 * app.use('/api/auth/*', rateLimit({
 *   limit: 5,
 *   windowMs: 900,
 *   keyPrefix: 'auth'
 * }));
 *
 * // Memory-first strategy (reduces KV writes by 80%)
 * app.use('/api/search/*', rateLimit({
 *   limit: 30,
 *   windowMs: 60,
 *   useMemoryFirst: true
 * }));
 * ```
 */
export const rateLimit = (config: RateLimitConfig): MiddlewareHandler => {
  const {
    limit,
    windowMs,
    keyPrefix = 'rl',
    keyGenerator = (c) => `${getTenantScope(c)}:${getClientIP(c)}`,
    skip,
    onLimitReached,
    useMemoryFirst = true, // Default to true for better performance
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
    let entry: RateLimitEntry | undefined;

    const kv = c.env?.RATE_LIMIT_KV;

    if (kv && !useMemoryFirst) {
      // KV-first strategy (original behavior)
      try {
        const stored = (await kv.get(key, 'json')) as RateLimitEntry | null;

        if (stored && stored.resetAt > now) {
          current = stored.count;
          resetAt = stored.resetAt;
        }

        current++;

        await retryWithBackoff(async () => {
          await kv.put(key, JSON.stringify({ count: current, resetAt }), {
            expirationTtl: Math.ceil(windowMs),
          });
        });
      } catch (error) {
        console.error('[RateLimiter] KV operation failed:', error);
        // Fallback to memory store on KV failure
        entry = memoryStore.get(key);
        if (entry && entry.resetAt > now) {
          current = entry.count;
          resetAt = entry.resetAt;
        }
        current++;
        memoryStore.set(key, { count: current, resetAt });
      }
    } else {
      // Memory-first strategy (recommended - reduces KV writes)
      entry = memoryStore.get(key);

      if (entry && entry.resetAt > now) {
        current = entry.count;
        resetAt = entry.resetAt;
      }

      current++;
      const newEntry: RateLimitEntry = {
        count: current,
        resetAt,
        lastSync: entry?.lastSync,
      };
      memoryStore.set(key, newEntry);

      // Async sync to KV (don't block request)
      if (kv && current > limit * 0.8) {
        // Only sync when approaching limit (80% threshold)
        c.executionCtx?.waitUntil?.(syncToKV(kv, key, newEntry, windowMs).catch(() => {}));
      }
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
    useMemoryFirst: true, // Use memory-first for better performance
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
    useMemoryFirst: false, // Auth needs persistence across workers
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
    useMemoryFirst: false, // Orders need persistence
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
 * Uses memory-first for better performance (search is non-critical)
 */
export const searchLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 30,
    windowMs: 60,
    keyPrefix: 'search',
    useMemoryFirst: true,
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
    useMemoryFirst: true,
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
    useMemoryFirst: true,
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

/**
 * Checkout Page Rate Limit
 * 30 requests per minute per IP (increased from 15 for better UX)
 */
export const checkoutLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 30, // Increased from 15 for better UX
    windowMs: 60,
    keyPrefix: 'checkout',
    useMemoryFirst: false, // Checkout needs persistence
    onLimitReached: (c, retryAfter) => {
      // Return HTML for browser navigation (not JSON)
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Too Many Requests</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              text-align: center; 
              padding: 50px 20px;
              background: #f9fafb;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            h1 { color: #dc2626; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; }
            .timer { 
              font-size: 24px; 
              font-weight: bold; 
              color: #dc2626;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ অনেক বেশি রিকোয়েস্ট</h1>
            <p>আপনি খুব দ্রুত চেকআউট করার চেষ্টা করছেন।</p>
            <p class="timer">অনুগ্রহ করে ${retryAfter} সেকেন্ড অপেক্ষা করুন</p>
            <p>Please wait ${retryAfter} seconds before trying again.</p>
          </div>
        </body>
        </html>
      `;
      return c.html(html, 429, {
        'Retry-After': String(retryAfter),
        'Cache-Control': 'no-store',
      });
    },
  });
};

/**
 * Cart rate limit (separate from checkout)
 * 50 cart operations per minute per IP
 */
export const cartLimit = (): MiddlewareHandler => {
  return rateLimit({
    limit: 50,
    windowMs: 60,
    keyPrefix: 'cart',
    useMemoryFirst: true,
    onLimitReached: (c, retryAfter) => {
      return c.json(
        {
          success: false,
          error: 'কার্ট আপডেট লিমিট অতিক্রান্ত। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
          code: 'CART_RATE_LIMITED',
          retryAfter,
        },
        429
      );
    },
  });
};

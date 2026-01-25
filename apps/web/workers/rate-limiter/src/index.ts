/**
 * Rate Limiter Worker - Durable Objects for Per-Store/IP Rate Limiting
 * 
 * Solves the spam/abuse problem:
 * Spammer ──► 1000 requests/second ──► BLOCKED! ✅
 * 
 * ============================================================================
 * ARCHITECTURE
 * ============================================================================
 * 
 * DO ID Pattern: ratelimit-{storeId}-{ip} or ratelimit-{identifier}
 * - One DO per rate limit bucket
 * - Sliding window algorithm
 * - Configurable limits per endpoint
 * - No SQLite needed (in-memory timestamps)
 * 
 * FREE TIER COMPATIBLE:
 * - Minimal memory usage
 * - Auto-cleanup of old timestamps
 */

import { DurableObject } from "cloudflare:workers";

// ============================================================================
// CONSTANTS
// ============================================================================

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const CONFIG = {
  // Default rate limit settings
  DEFAULT_LIMIT: 100,           // 100 requests
  DEFAULT_WINDOW_MS: 60 * SECONDS, // per minute
  
  // Max requests to track (memory safety)
  MAX_TRACKED_REQUESTS: 10000,
  
  // Cleanup interval
  CLEANUP_INTERVAL_MS: 5 * MINUTES,
  
  // Preset limits for different endpoints
  PRESETS: {
    api: { limit: 100, windowMs: 60 * SECONDS },
    auth: { limit: 10, windowMs: 60 * SECONDS },
    checkout: { limit: 5, windowMs: 60 * SECONDS },
    upload: { limit: 20, windowMs: 60 * SECONDS },
    search: { limit: 50, windowMs: 60 * SECONDS },
  } as Record<string, { limit: number; windowMs: number }>,
};

type PresetKey = keyof typeof CONFIG.PRESETS;

// ============================================================================
// TYPES
// ============================================================================

interface RateLimitRequest {
  limit?: number;
  windowMs?: number;
  preset?: string;
  cost?: number;  // Some requests might "cost" more (e.g., expensive operations)
}

interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  limit: number;
  windowMs: number;
  resetAt: number;
  retryAfterMs?: number;
}

interface Env {
  RATE_LIMITER: DurableObjectNamespace;
}

// ============================================================================
// RATE LIMITER DURABLE OBJECT
// ============================================================================

export class RateLimiter extends DurableObject<Env> {
  // Sliding window: array of request timestamps
  private requests: number[] = [];
  
  // Last cleanup time
  private lastCleanup: number = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  /**
   * Clean old requests outside the window
   */
  private cleanOldRequests(windowMs: number): void {
    const now = Date.now();
    const cutoff = now - windowMs;
    
    // Remove requests older than the window
    this.requests = this.requests.filter(t => t > cutoff);
    
    // Safety: if too many requests accumulated, trim oldest
    if (this.requests.length > CONFIG.MAX_TRACKED_REQUESTS) {
      this.requests = this.requests.slice(-CONFIG.MAX_TRACKED_REQUESTS);
    }
    
    this.lastCleanup = now;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/check':
          // Check without consuming (dry run)
          return this.checkLimit(url.searchParams, false);
          
        case '/consume':
          // Check and consume if allowed
          if (request.method !== 'POST') {
            const params = url.searchParams;
            return this.checkLimit(params, true);
          }
          return this.checkLimit(url.searchParams, true, await request.json() as RateLimitRequest);
          
        case '/reset':
          // Reset rate limit (admin only)
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.resetLimit();
          
        case '/status':
          return this.getStatus(url.searchParams);
          
        case '/health':
          return Response.json({ 
            status: 'ok', 
            requestCount: this.requests.length,
          });
          
        default:
          return Response.json({ error: 'Not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('RateLimiter error:', error);
      return Response.json({ 
        error: 'Internal error', 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
  }

  /**
   * Check rate limit (and optionally consume)
   * ✅ Atomic - no race condition in DO
   */
  private checkLimit(
    params: URLSearchParams, 
    consume: boolean,
    body?: RateLimitRequest
  ): Response {
    const now = Date.now();
    
    // Get limit settings
    let limit: number = CONFIG.DEFAULT_LIMIT;
    let windowMs: number = CONFIG.DEFAULT_WINDOW_MS;
    
    // Check for preset
    const preset = body?.preset || params.get('preset');
    if (preset && CONFIG.PRESETS[preset]) {
      limit = CONFIG.PRESETS[preset].limit;
      windowMs = CONFIG.PRESETS[preset].windowMs;
    }
    
    // Override with explicit values
    const limitParam = body?.limit || params.get('limit');
    const windowParam = body?.windowMs || params.get('window');
    
    if (limitParam) {
      limit = Math.max(1, Math.min(parseInt(String(limitParam), 10) || limit, 10000));
    }
    if (windowParam) {
      windowMs = Math.max(1000, Math.min(parseInt(String(windowParam), 10) || windowMs, 24 * 60 * MINUTES));
    }
    
    // Cost multiplier (some operations cost more)
    const cost = Math.max(1, Math.min(body?.cost || 1, 100));
    
    // Clean old requests
    this.cleanOldRequests(windowMs);
    
    const currentCount = this.requests.length;
    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount + cost <= limit;
    
    // Calculate reset time (when oldest request expires)
    const resetAt = this.requests.length > 0 
      ? this.requests[0] + windowMs 
      : now + windowMs;
    
    const response: RateLimitResponse = {
      allowed,
      remaining: allowed ? remaining - cost : 0,
      limit,
      windowMs,
      resetAt,
    };
    
    // If not allowed, add retry-after
    if (!allowed) {
      response.retryAfterMs = Math.max(0, resetAt - now);
    }
    
    // Consume if allowed and requested
    if (consume && allowed) {
      // Add request(s) based on cost
      for (let i = 0; i < cost; i++) {
        this.requests.push(now);
      }
    }
    
    // Set appropriate status code
    const status = allowed ? 200 : 429;
    
    // Add rate limit headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(response.remaining),
      'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    });
    
    if (!allowed) {
      headers.set('Retry-After', String(Math.ceil((response.retryAfterMs || 0) / 1000)));
    }
    
    return new Response(JSON.stringify(response), { status, headers });
  }

  /**
   * Reset rate limit (clear all requests)
   */
  private resetLimit(): Response {
    this.requests = [];
    this.lastCleanup = Date.now();
    
    return Response.json({ 
      success: true, 
      message: 'Rate limit reset',
    });
  }

  /**
   * Get current status
   */
  private getStatus(params: URLSearchParams): Response {
    const now = Date.now();
    
    // Get window for calculation
    const preset = params.get('preset');
    let windowMs: number = CONFIG.DEFAULT_WINDOW_MS;
    let limit: number = CONFIG.DEFAULT_LIMIT;
    
    if (preset && CONFIG.PRESETS[preset as keyof typeof CONFIG.PRESETS]) {
      windowMs = CONFIG.PRESETS[preset as keyof typeof CONFIG.PRESETS].windowMs;
      limit = CONFIG.PRESETS[preset as keyof typeof CONFIG.PRESETS].limit;
    }
    
    const windowParam = params.get('window');
    const limitParam = params.get('limit');
    
    if (windowParam) {
      windowMs = parseInt(windowParam, 10) || windowMs;
    }
    if (limitParam) {
      limit = parseInt(limitParam, 10) || limit;
    }
    
    // Clean and count
    this.cleanOldRequests(windowMs);
    
    const currentCount = this.requests.length;
    const remaining = Math.max(0, limit - currentCount);
    const resetAt = this.requests.length > 0 
      ? this.requests[0] + windowMs 
      : now + windowMs;
    
    return Response.json({
      currentCount,
      remaining,
      limit,
      windowMs,
      resetAt,
      lastCleanup: this.lastCleanup,
      presets: CONFIG.PRESETS,
    });
  }
}

// ============================================================================
// WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Route: /do/:identifier/* - Forward to Durable Object
    // identifier format: storeId-ip or custom identifier
    const match = url.pathname.match(/^\/do\/([a-zA-Z0-9_.-]+)(\/.*)$/);
    if (match) {
      const identifier = match[1];
      const doPath = match[2] || '/';
      
      const id = env.RATE_LIMITER.idFromName(`ratelimit-${identifier}`);
      const stub = env.RATE_LIMITER.get(id);
      
      // Forward request to DO with modified URL
      const doUrl = new URL(request.url);
      doUrl.pathname = doPath;
      
      return stub.fetch(new Request(doUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }));
    }
    
    // Convenience route: /limit/:storeId/:ip/:preset
    const limitMatch = url.pathname.match(/^\/limit\/(\d+)\/([^/]+)(?:\/([a-z]+))?$/);
    if (limitMatch) {
      const storeId = limitMatch[1];
      const ip = limitMatch[2];
      const preset = limitMatch[3] || 'api';
      
      const identifier = `${storeId}-${ip}`;
      const id = env.RATE_LIMITER.idFromName(`ratelimit-${identifier}`);
      const stub = env.RATE_LIMITER.get(id);
      
      // Use GET method for consume route (no body needed)
      return stub.fetch(new Request(`http://internal/consume?preset=${preset}`, {
        method: 'GET',
      }));
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ 
        status: 'ok', 
        service: 'rate-limiter',
        presets: Object.keys(CONFIG.PRESETS),
      });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};

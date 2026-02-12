import { Context, MiddlewareHandler } from 'hono';

/**
 * Request Tracker Middleware
 * 
 * Tracks specific suspicious patterns (like repetitive coupon attempts)
 * and logs them to KV/Console for emergency debugging.
 */
export const requestTracker = (): MiddlewareHandler => {
  return async (c: Context, next) => {
    const start = Date.now();
    const url = new URL(c.req.url);
    const path = url.pathname;
    
    // Check for "sus" patterns
    const isSuspicious = 
      path.includes('/checkout') && url.searchParams.has('discount') || 
      path.includes('/cart') && c.req.method === 'POST';

    await next();

    // Log suspicious activity
    if (isSuspicious) {
      const duration = Date.now() - start;
      const status = c.res.status;
      const ip = c.req.header('cf-connecting-ip') || 'unknown';
      const maskedIp = maskIp(ip);
      
      console.warn(`[TRACKER] SUSPICIOUS: ${c.req.method} ${path} - Status: ${status} - IP: ${maskedIp} - Duration: ${duration}ms`);
      
      // Optional: Store in KV for dashboard (fire and forget)
      /*
      if (c.env.RATE_LIMIT_KV) {
        const key = `log:${Date.now()}:${ip}`;
        const logData = {
          path,
          method: c.req.method,
          query: url.search,
          status,
          ip,
          timestamp: Date.now()
        };
        c.executionCtx.waitUntil(
          c.env.RATE_LIMIT_KV.put(key, JSON.stringify(logData), { expirationTtl: 3600 }) // Keep for 1 hour
        );
      }
      */
    }
  };
};

function maskIp(ip: string): string {
  if (!ip || ip === 'unknown') return 'unknown';
  if (ip.includes(':')) {
    // IPv6 masked representation
    const parts = ip.split(':');
    return `${parts[0] || ''}:${parts[1] || ''}:****`;
  }
  const parts = ip.split('.');
  if (parts.length !== 4) return 'masked';
  return `${parts[0]}.${parts[1]}.x.x`;
}

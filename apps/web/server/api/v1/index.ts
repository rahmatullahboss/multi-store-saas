/**
 * server/api/v1/index.ts — Ozzyl Public API v1
 * Main Hono router for the public API platform
 *
 * Mount in server/index.ts:
 *   import { v1Router } from './api/v1';
 *   app.route('/api/v1', v1Router)
 *
 * All routes require valid API key (Bearer token)
 * Rate limiting + usage tracking applied globally
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { requestId } from 'hono/request-id';
import { ZodError } from 'zod';
import { apiKeyAuth } from '../../middleware/api-key-auth';
import { rateLimitMiddleware } from '../../middleware/rate-limit';
import { usageTracker } from '../../middleware/usage-tracker';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { analyticsRouter } from './routes/analytics';
import { webhooksRouter } from './routes/webhooks';
import { storeRouter } from './routes/store';
// WooCommerce Power Layer routes
import { fraudRouter } from './routes/fraud';
import { trackingWcRouter } from './routes/tracking-wc';
import { courierWcRouter } from './routes/courier-wc';
import { smsWcRouter } from './routes/sms-wc';
import { cartWcRouter } from './routes/cart-wc';
import { wcWebhookRouter } from './routes/wc-webhook';
import { storeDataRouter } from './routes/store-data';

// ─── Router ───────────────────────────────────────────────────────────────────

export const v1Router = new Hono<{ Bindings: Env }>();

// ─── Global Middleware ────────────────────────────────────────────────────────

// 1. Request ID (for tracing)
v1Router.use('*', requestId());

// 2. Timing headers (X-Response-Time)
v1Router.use('*', timing());

// 3. Secure headers
v1Router.use('*', secureHeaders());

// 4. CORS — allow any origin with API key auth
v1Router.use('*', cors({
  origin: '*', // API key is the auth mechanism — CORS origin is open
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type', 'X-Idempotency-Key'],
  exposeHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-RateLimit-Plan',
    'X-Request-Id',
    'X-Response-Time',
    'X-Store-Id',
    'X-Api-Key-Mode',
  ],
  maxAge: 86400,
}));

// 5. API Key authentication (KV-first, D1 fallback)
v1Router.use('*', apiKeyAuth());

// 6. Rate limiting (Workers RL API → KV fallback)
v1Router.use('*', rateLimitMiddleware());

// 7. Usage tracking (non-blocking, Analytics Engine → KV fallback)
v1Router.use('*', usageTracker());

// ─── Health Check (no auth required — mount before auth middleware) ────────────

// NOTE: health is mounted at the app level, not here
// GET /api/v1/ping → quick connectivity check (authenticated)
// SECURITY: Do NOT include store_id or scopes — they leak internal identifiers
// and enumerable permission data to anyone who intercepts the response.
v1Router.get('/ping', (c) => {
  const apiKey = c.var.apiKey;
  return c.json({
    success: true,
    message: 'pong',
    mode: apiKey.mode,
    timestamp: new Date().toISOString(),
  });
});

// ─── Route Groups ─────────────────────────────────────────────────────────────

v1Router.route('/store',     storeRouter);
v1Router.route('/products',  productsRouter);
v1Router.route('/orders',    ordersRouter);
v1Router.route('/analytics', analyticsRouter);
v1Router.route('/webhooks',  webhooksRouter);
// ─── WooCommerce Power Layer ──────────────────────────────────────────────────
v1Router.route('/fraud',       fraudRouter);
v1Router.route('/tracking',    trackingWcRouter);
v1Router.route('/courier-wc',  courierWcRouter);
v1Router.route('/sms',         smsWcRouter);
v1Router.route('/cart',        cartWcRouter);
v1Router.route('/wc',          wcWebhookRouter);
v1Router.route('/store-data',  storeDataRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

v1Router.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'not_found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
      docs: 'https://docs.ozzyl.com/api/reference',
    },
    404
  );
});

// ─── Error Handler ────────────────────────────────────────────────────────────

v1Router.onError((err, c) => {
  const reqId = c.res.headers.get('X-Request-Id') ?? 'unknown';

  // ─── Zod validation errors → 400 ───────────────────────────────────────────
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'validation_error',
        message: 'Invalid request parameters',
        details: err.flatten().fieldErrors,
        request_id: reqId,
        docs: 'https://docs.ozzyl.com/api/errors',
      },
      400
    );
  }

  // ─── HTTPException (from Hono) ──────────────────────────────────────────────
  if ('status' in err && typeof (err as { status: number }).status === 'number') {
    const httpErr = err as { status: number; message: string };
    return c.json(
      {
        success: false,
        error: 'http_error',
        message: httpErr.message,
        request_id: reqId,
      },
      httpErr.status as 400 | 401 | 403 | 404 | 429 | 500
    );
  }

  console.error(`[API v1 Error] requestId=${reqId}`, err);
  return c.json(
    {
      success: false,
      error: 'internal_error',
      message: 'An unexpected error occurred. Please try again.',
      request_id: reqId,
      docs: 'https://docs.ozzyl.com/api/errors',
    },
    500
  );
});

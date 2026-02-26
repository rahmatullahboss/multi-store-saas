/**
 * server/api/shopify-app/index.ts — Shopify App Hono Router
 *
 * Mounts all Shopify App sub-routers under /api/shopify-app:
 *   GET  /api/shopify-app/install    — OAuth install initiation
 *   GET  /api/shopify-app/callback   — OAuth callback + token exchange
 *   GET  /api/shopify-app/session    — App Bridge session token verification
 *   POST /api/shopify-app/webhooks   — Shopify webhook receiver
 *
 * Mount in server/index.ts:
 *   import { shopifyAppRouter } from './api/shopify-app';
 *   app.route('/api/shopify-app', shopifyAppRouter);
 *
 * Environment variables required:
 *   SHOPIFY_CLIENT_ID        — App client ID from Shopify Partners
 *   SHOPIFY_CLIENT_SECRET    — App client secret (Cloudflare secret)
 *   SHOPIFY_REDIRECT_URI     — OAuth callback URL (e.g. https://app.ozzyl.com/api/shopify-app/callback)
 *   SHOPIFY_ENCRYPTION_KEY   — 32-byte hex key for AES-GCM token encryption (Cloudflare secret)
 *   SHOPIFY_APP_HANDLE       — App handle for post-install redirect (default: "ozzyl")
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { requestId } from 'hono/request-id';
import { ZodError } from 'zod';
import { oauthRouter } from './oauth';
import { bridgeRouter } from './bridge';
import { webhooksRouter } from './webhooks';

// ─── Router ───────────────────────────────────────────────────────────────────

export const shopifyAppRouter = new Hono<{ Bindings: Env }>();

// ─── Global Middleware ────────────────────────────────────────────────────────

// 1. Request ID (for tracing)
shopifyAppRouter.use('*', requestId());

// 2. Timing headers (X-Response-Time)
shopifyAppRouter.use('*', timing());

// 3. Secure headers
shopifyAppRouter.use('*', secureHeaders());

// 4. CORS — Shopify Admin iframe needs permissive CORS on session endpoint
//    Webhook endpoint uses HMAC auth, not CORS
shopifyAppRouter.use('*', cors({
  origin: [
    'https://admin.shopify.com',
    'https://*.myshopify.com',
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type', 'X-Shopify-Hmac-Sha256', 'X-Shopify-Topic', 'X-Shopify-Shop-Domain'],
  exposeHeaders: ['X-Request-Id', 'X-Response-Time'],
  maxAge: 86400,
  credentials: true,
}));

// ─── Sub-routers ──────────────────────────────────────────────────────────────

// OAuth flow: install + callback
shopifyAppRouter.route('/', oauthRouter);

// App Bridge session verification
shopifyAppRouter.route('/', bridgeRouter);

// Shopify webhook receiver
shopifyAppRouter.route('/webhooks', webhooksRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

shopifyAppRouter.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'not_found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
      docs: 'https://docs.ozzyl.com/shopify-app',
    },
    404
  );
});

// ─── Error Handler ────────────────────────────────────────────────────────────

shopifyAppRouter.onError((err, c) => {
  const reqId = c.res.headers.get('X-Request-Id') ?? 'unknown';

  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'validation_error',
        message: 'Invalid request parameters',
        details: err.flatten().fieldErrors,
        request_id: reqId,
      },
      400
    );
  }

  if ('status' in err && typeof (err as { status: number }).status === 'number') {
    const httpErr = err as { status: number; message: string };
    return c.json(
      {
        success: false,
        error: 'http_error',
        message: httpErr.message,
        request_id: reqId,
      },
      httpErr.status as 400 | 401 | 403 | 404 | 500
    );
  }

  console.error(`[Shopify App Error] requestId=${reqId}`, err);
  return c.json(
    {
      success: false,
      error: 'internal_error',
      message: 'An unexpected error occurred.',
      request_id: reqId,
    },
    500
  );
});

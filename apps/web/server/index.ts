/**
 * Hono Server Entry Point
 *
 * Main entry for Cloudflare Workers. Combines:
 * - Security headers middleware
 * - Rate limiting middleware
 * - Multi-tenancy middleware
 * - API routes (Hono)
 * - Remix SSR (forwarded requests)
 */

import { Hono, Context } from 'hono';
import { logger } from 'hono/logger';
import { cache } from 'hono/cache';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores } from '@db/schema';
import { tenantMiddleware, type TenantEnv, type TenantContext } from './middleware/tenant';
import { workerTelemetryMiddleware } from './middleware/worker-telemetry';
import { botControlMiddleware } from './middleware/bot-control';
import { securityHeaders, apiSecurityHeaders } from './middleware/security';
import { csrfOriginGuard } from './middleware/csrf';
import {
  standardApiLimit,
  authLimit,
  orderLimit,
  aiChatLimit,
  checkoutLimit,
  cartLimit,
} from './middleware/rate-limit';
import { requestTracker } from './lib/debug/request-tracker';
import { productsApi } from './api/products';
import { ordersApi } from './api/orders';
import { storesApi } from './api/stores';
import { graphqlApi } from './api/graphql';
import { oauthApi } from './api/oauth';
import customersApi from './api/routes/customers';

// Forward all other requests to Remix (via Vite build output)
import { ServerBuild, createRequestHandler } from '@remix-run/cloudflare';
// IMPORTANT: Lazy-load the Remix build so unit tests can import this module
// without executing the compiled server bundle (which can be heavy/fragile in Vitest).
const getRemixBuild = () => import('../build/server/index.js') as Promise<ServerBuild>;

// Type definitions for Cloudflare bindings
interface Env extends TenantEnv {
  ASSETS: Fetcher;
  RATE_LIMIT_KV?: KVNamespace;
  ENVIRONMENT?: 'development' | 'production' | 'staging';
  
  // Bindings
  AI: Ai;
  VECTORIZE: VectorizeIndex;

  // Variables
  R2_PUBLIC_URL: string;
  SUPER_ADMIN_EMAIL: string;
  CLOUDFLARE_ZONE_ID: string;
  AI_MODEL: string;
  AI_BASE_URL: string;
  PAGE_BUILDER_URL: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_SUBJECT: string;
  SENTRY_DSN: string;
  MASTER_FACEBOOK_PIXEL_ID: string;
  GOOGLE_CLIENT_ID: string;

  // Secrets
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
  VAPID_PRIVATE_KEY: string;
  OPENROUTER_API_KEY: string;
  CLOUDFLARE_API_TOKEN: string;
  GOOGLE_CLIENT_SECRET: string;
  AXION_TOKEN: string;
}

type AppContext = {
  Bindings: Env;
  Variables: TenantContext;
};

// Create Hono app with typed context
const app = new Hono<AppContext>();

// Error and Not Found Handlers
app.onError((err, c) => {
  const requestId = c.get('requestId') || c.req.header('x-request-id') || 'unknown';
  const storeId = c.get('storeId') || 0;
  console.error('[SERVER ERROR]', { requestId, storeId, err });
  return c.json(
    {
      error: err.message || 'Internal Server Error',
      requestId,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    500
  );
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

// Request ID: propagate client-provided x-request-id or generate one.
// Used for tracing across logs and to help support debug a single request.
app.use('*', async (c, next) => {
  const incoming = c.req.header('x-request-id');
  const requestId =
    incoming && incoming.length <= 128 ? incoming : crypto.randomUUID();

  c.set('requestId', requestId);
  await next();
  c.header('x-request-id', requestId);
});

// Logger middleware is useful during development, but expensive/noisy in production.
// Keep production logs focused on business/API paths via requestTracker + explicit errors.
const honoLogger = logger();
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT === 'production') {
    return next();
  }
  return honoLogger(c, next);
});

// Skip noisy logging for static assets
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const isAssetRequest =
    url.pathname === '/__manifest' ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|map)$/);

  if (isAssetRequest) {
    return next();
  }

  return requestTracker()(c, next);
});

// Security Headers for all routes
app.use('*', securityHeaders());
// SEO-safe bot control: allow verified search crawlers, block non-essential scraping bots
app.use('*', botControlMiddleware());

// API-specific security headers (stricter CSP)
app.use('/api/*', apiSecurityHeaders());

// Admin mutation guard (CSRF hard gate)
// Applies only to authenticated/admin routes to avoid breaking public checkout flows.
app.use('/app/*', csrfOriginGuard());


// ============================================================================
// DYNAMIC CORS - Supports merchant custom domains from database
// ============================================================================

// Static trusted origins (always allowed)
const staticAllowedOrigins = [
  'https://ozzyl.com',
  'http://localhost:5173',
  'http://localhost:8787',
];

// Trusted domain patterns
const trustedPatterns = [
  /^https:\/\/.*\.ozzyl\.com$/, // *.ozzyl.com subdomains
  /^https:\/\/.*\.digitalcare\.site$/, // Temporary - ozzyl.com
];

/**
 * Dynamic CORS origin validator
 * Checks:
 * 1. Static trusted origins
 * 2. Subdomain patterns (ozzyl.com)
 * 3. Database approved custom domains
 */
async function validateOrigin(
  origin: string | undefined,
  c: Context<AppContext>
): Promise<string | null> {
  // No origin = same-origin request
  if (!origin) return 'https://ozzyl.com';

  // 1. Check static allowed origins
  if (staticAllowedOrigins.includes(origin)) return origin;

  // 2. Check trusted patterns
  for (const pattern of trustedPatterns) {
    if (pattern.test(origin)) return origin;
  }

  // 3. Check ozzyl.com subdomains
  if (origin.endsWith('.ozzyl.com')) return origin;

  // 4. Check database for approved custom domains
  try {
    const db = drizzle(c.env.DB);
    const originHost = new URL(origin).hostname;

    // Query database for this custom domain
    const store = await db
      .select({ id: stores.id })
      .from(stores)
      .where(
        and(
          eq(stores.customDomain, originHost),
          eq(stores.customDomainStatus, 'approved'),
          eq(stores.isActive, true)
        )
      )
      .limit(1);

    if (store.length > 0) {
      return origin; // Valid custom domain
    }
  } catch (error) {
    console.error('CORS DB check error:', error);
    // Fail closed - deny on error
  }

  // 5. Deny unknown origins
  return null;
}

// Apply dynamic CORS middleware
app.use('/api/*', async (c, next) => {
  const origin = c.req.header('origin');
  const allowedOrigin = await validateOrigin(origin, c);

  // Set CORS headers manually for dynamic validation
  if (allowedOrigin) {
    c.header('Access-Control-Allow-Origin', allowedOrigin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    c.header(
      'Access-Control-Expose-Headers',
      'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
    );
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Max-Age', '86400');
  }

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    // Use Hono response helpers so CORS headers set above are preserved
    return c.body(null, 204);
  }

  return next();
});

// Standard API rate limiting (100 req/min)
app.use('/api/*', standardApiLimit());

// Stricter rate limits for sensitive endpoints
app.use('/api/auth/*', authLimit()); // 5 req/15min
app.use('/api/create-order', orderLimit()); // 10 req/min
app.use('/api/ai/*', aiChatLimit()); // 20 req/min
app.use('/api/chat', aiChatLimit());
app.use('/api/ai-orchestrator', aiChatLimit());

// Rate limiting for billing and cart operations
app.use('/checkout', checkoutLimit()); // 30 req/min - Page loads
app.use('/checkout/*', checkoutLimit()); // 30 req/min - All checkout routes
app.use('/cart', cartLimit()); // 50 req/min - Cart operations (separate limit)

// Apply tenant middleware to all routes except platform health checks.
// This keeps /api/health usable on workers.dev even when hostname→store mapping doesn't exist.
const tenantMw = tenantMiddleware<AppContext>();
app.use('*', async (c, next) => {
  // Keep health + staging-only Sentry debug page usable even when hostname→store mapping doesn't exist.
  if (c.req.path === '/api/health') return next();
  if (c.env.ENVIRONMENT === 'staging' && c.req.path === '/sentry-test') return next();
  return tenantMw(c, next);
});

// Cost monitoring telemetry (sampled) to detect abnormal request amplification.
// Skip /api/health to reduce noise and avoid relying on tenant context.
const telemetryMw = workerTelemetryMiddleware<AppContext>();
app.use('*', async (c, next) => {
  if (c.req.path === '/api/health') return next();
  return telemetryMw(c, next);
});

// Structured request logs (JSON) for ops/debugging.
// Goal: include store_id, request_id, and (when available) order_id.
app.use('*', async (c, next) => {
  const start = Date.now();
  const url = new URL(c.req.url);

  // Avoid logging static assets / framework internals (high volume, low value).
  const isFrameworkInternal =
    url.pathname === '/__manifest' || url.pathname.startsWith('/__manifest?');
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|map)$/.test(url.pathname);
  if (isFrameworkInternal || isStaticAsset) {
    return next();
  }

  // Avoid noisy health checks.
  if (url.pathname === '/api/health') {
    return next();
  }

  await next();

  const durationMs = Date.now() - start;
  const requestId = c.get('requestId') || c.req.header('x-request-id') || 'unknown';
  const storeId = (c.get('storeId') as number | undefined) || 0;
  const cfRay = c.req.header('cf-ray') || undefined;

  // Prefer explicit header from app code; fall back to path/query parsing.
  // Public API uses x-order-number (safe), admin routes still use x-order-id (internal).
  const orderNumberHeader = c.res.headers.get('x-order-number') || undefined;
  const orderIdHeader = c.res.headers.get('x-order-id') || undefined;
  const orderIdQuery = url.searchParams.get('orderId') || undefined;
  const orderIdPathMatch = url.pathname.match(/\/orders\/(\d+)(?:\/|$)/);
  const orderIdPath = orderIdPathMatch?.[1];
  const orderId = orderNumberHeader || orderIdHeader || orderIdQuery || orderIdPath || undefined;

  // Keep logs machine-readable and low-PII (no cookies, no query strings).
  // Use waitUntil to defer log emission so it doesn't block the response.
  const log = {
    ts: new Date().toISOString(),
    level: 'info',
    msg: 'request',
    environment: c.env.ENVIRONMENT || 'unknown',
    request_id: requestId,
    store_id: storeId,
    order_id: orderId,
    method: c.req.method,
    path: url.pathname,
    status: c.res.status,
    duration_ms: durationMs,
    cf_ray: cfRay,
  };

  c.executionCtx.waitUntil(
    Promise.resolve().then(() => console.warn(JSON.stringify(log)))
  );
});

// ============================================================================
// API ROUTES - Hono handles these directly
// ============================================================================

// Health check (no tenant required)
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    store: c.get('store')?.name || 'unknown',
  });
});

// Store info endpoint
app.get('/api/store', (c) => {
  const store = c.get('store');
  return c.json({
    id: store.id,
    name: store.name,
    subdomain: store.subdomain,
    theme: store.theme,
    currency: store.currency,
    logo: store.logo,
  });
});

// Mount API routers
app.route('/api/products', productsApi);
app.route('/api/orders', ordersApi);
app.route('/api/stores', storesApi);
app.route('/api/graphql', graphqlApi);
app.route('/api/oauth', oauthApi);
app.route('/api/customers', customersApi);

// ============================================================================
// CACHING - For public product pages
// ============================================================================

// Cache product listing pages at the edge
app.get(
  '/products',
  cache({
    cacheName: 'product-pages',
    cacheControl: 'public, max-age=60, stale-while-revalidate=300',
  })
);

// Cache individual product pages
app.get(
  '/products/:id',
  cache({
    cacheName: 'product-detail',
    cacheControl: 'public, max-age=60, stale-while-revalidate=300',
  })
);

// ============================================================================
// STATIC ASSETS & REMIX SSR
// ============================================================================

// Forward all other requests to Remix (via Vite build output)
app.all('*', async (c) => {
  const url = new URL(c.req.url);
  
  // 2. Try to fetch from ASSETS binding first
  // According to Cloudflare docs: https://developers.cloudflare.com/workers/static-assets/binding
  // When run_worker_first = true, we must forward requests to ASSETS binding
  // Avoid consuming request bodies for API/non-GET requests (ReadableStream can only be read once)
  if (url.pathname.startsWith('/api/') || (c.req.method !== 'GET' && c.req.method !== 'HEAD')) {
    const build = await getRemixBuild();
    const handler = createRequestHandler(build, c.env.ENVIRONMENT);

    return handler(c.req.raw, {
      cloudflare: {
        env: c.env,
        ctx: c.executionCtx,
      },
      storeId: c.get('storeId'),
      store: c.get('store'),
      isCustomDomain: c.get('isCustomDomain'),
    });
  }

  const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
  
  // 3. If asset found (200), return it with optimized cache headers
  if (assetResponse.status === 200) {
    const response = new Response(assetResponse.body, assetResponse);
    
    // Immutable assets (hashed filenames) - aggressive caching
    if (url.pathname.match(/\.[a-f0-9]{8,}\.(js|css|woff2?|ttf|eot)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Images and fonts - moderate caching
    else if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=86400');
    }
    // Other assets - short caching
    else if (url.pathname.startsWith('/assets/')) {
      response.headers.set('Cache-Control', 'public, max-age=3600');
    }
    
    return response;
  }
  
  // 4. If explicit asset request failed (404), don't fall through to Remix
  // This prevents Remix from trying to handle missing JS/CSS files
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|map)$/)) {
    console.warn(`[ASSETS] 404 Not Found: ${url.pathname}`);
    return new Response('Asset not found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // 5. Not an asset - run Remix SSR for application routes
  // This handles all page routes (/auth/login, /dashboard, /store.home, etc.)
  const build = await getRemixBuild();
  const handler = createRequestHandler(build, c.env.ENVIRONMENT);

  const isCacheablePath =
    url.pathname === '/' ||
    url.pathname.startsWith('/products') ||
    url.pathname.startsWith('/collections') ||
    url.pathname.startsWith('/p/') ||
    url.pathname.startsWith('/offers/');
  const isSensitivePath =
    url.pathname.startsWith('/cart') ||
    url.pathname.startsWith('/checkout') ||
    url.pathname.startsWith('/account') ||
    url.pathname.startsWith('/admin');
  const hasAuthHeaders = Boolean(c.req.header('authorization') || c.req.header('cookie'));

  if (c.req.method === 'GET' && isCacheablePath && !isSensitivePath && !hasAuthHeaders) {
    const cache = (caches as unknown as { default: Cache }).default;
    const cacheKey = new Request(c.req.raw.url, c.req.raw);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await handler(c.req.raw, {
      cloudflare: {
        env: c.env,
        ctx: c.executionCtx,
      },
      storeId: c.get('storeId'),
      store: c.get('store'),
      isCustomDomain: c.get('isCustomDomain'),
    });

    const cacheableResponse = new Response(response.body, response);
    cacheableResponse.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    c.executionCtx.waitUntil(cache.put(cacheKey, cacheableResponse.clone()));

    return cacheableResponse;
  }

  // Pass Cloudflare Environment and Hono Context to Remix
  // This makes `context.cloudflare.env` available in Loaders/Actions
  return handler(c.req.raw, {
    cloudflare: {
      env: c.env,
      ctx: c.executionCtx,
    },
    storeId: c.get('storeId'),
    store: c.get('store'),
    isCustomDomain: c.get('isCustomDomain'),
  });
});

export default app;

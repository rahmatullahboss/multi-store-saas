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
import { securityHeaders, apiSecurityHeaders } from './middleware/security';
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

// Type definitions for Cloudflare bindings
interface Env extends TenantEnv {
  ASSETS: Fetcher;
  RATE_LIMIT_KV?: KVNamespace;
  ENVIRONMENT?: string;
}

type AppContext = {
  Bindings: Env;
  Variables: TenantContext;
};

// Create Hono app with typed context
const app = new Hono<AppContext>();

// Error and Not Found Handlers
app.onError((err, c) => {
  console.error('[SERVER ERROR]', err);
  return c.json(
    {
      error: err.message || 'Internal Server Error',
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

// Logger for development
app.use('*', logger());
app.use('*', requestTracker());

// Security Headers for all routes
app.use('*', securityHeaders());

// API-specific security headers (stricter CSP)
app.use('/api/*', apiSecurityHeaders());

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
    return new Response(null, { status: 204 });
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

// Rate limiting for billing and cart operations
app.use('/checkout', checkoutLimit()); // 30 req/min - Page loads
app.use('/checkout/*', checkoutLimit()); // 30 req/min - All checkout routes
app.use('/cart', cartLimit()); // 50 req/min - Cart operations (separate limit)

// Apply tenant middleware to all routes
app.use('*', tenantMiddleware());

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
// Forward all other requests to Remix (via Vite build output)
app.all('*', async (c) => {
  // Try to serve static asset first
  const response = await c.env.ASSETS.fetch(c.req.raw);
  
  // If not found (404), fallback to index.html to support SPA routing
  // This is crucial for paths like /auth/login that don't match a physical file
  if (response.status === 404) {
    const url = new URL(c.req.url);
    // Maintain the original URL but fetch index.html content
    return c.env.ASSETS.fetch(new Request(new URL('/index.html', url.origin), c.req.raw));
  }
  
  return response;
});

export default app;

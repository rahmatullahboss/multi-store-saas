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

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { cache } from 'hono/cache';
import { tenantMiddleware, type TenantEnv, type TenantContext } from './middleware/tenant';
import { securityHeaders, apiSecurityHeaders } from './middleware/security';
import { standardApiLimit, authLimit, orderLimit, aiChatLimit } from './middleware/rate-limit';
import { productsApi } from './api/products';
import { ordersApi } from './api/orders';
import { storesApi } from './api/stores';

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

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

// Logger for development
app.use('*', logger());

// Security Headers for all routes
app.use('*', securityHeaders());

// API-specific security headers (stricter CSP)
app.use('/api/*', apiSecurityHeaders());

// CORS for API routes (restrictive - allow only same-origin and trusted domains)
const allowedOrigins = [
  'https://ozzyl.com',
  'https://*.ozzyl.com',
  /^https:\/\/.*\.ozzyl\.com$/,
  // Development
  'http://localhost:5173',
  'http://localhost:8787',
];

app.use('/api/*', cors({
  origin: (origin) => {
    if (!origin) return 'https://ozzyl.com'; // No origin = same-origin
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) return origin;
    
    // Check regex patterns
    for (const pattern of allowedOrigins) {
      if (pattern instanceof RegExp && pattern.test(origin)) {
        return origin;
      }
    }
    
    // Allow subdomain wildcard
    if (origin.endsWith('.ozzyl.com')) return origin;
    
    // Deny unknown origins
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// Standard API rate limiting (100 req/min)
app.use('/api/*', standardApiLimit());

// Stricter rate limits for sensitive endpoints
app.use('/api/auth/*', authLimit()); // 5 req/15min
app.use('/api/create-order', orderLimit()); // 10 req/min
app.use('/api/ai/*', aiChatLimit()); // 20 req/min
app.use('/api/chat', aiChatLimit());

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
  // In production, serve from built assets
  // The Remix Vite plugin handles SSR
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;

/**
 * Hono Server Entry Point
 * 
 * Main entry for Cloudflare Workers. Combines:
 * - Multi-tenancy middleware
 * - API routes (Hono)
 * - Remix SSR (forwarded requests)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { cache } from 'hono/cache';
import { tenantMiddleware, type TenantEnv, type TenantContext } from './middleware/tenant';
import { productsApi } from './api/products';
import { ordersApi } from './api/orders';
import { storesApi } from './api/stores';

// Type definitions for Cloudflare bindings
interface Env extends TenantEnv {
  ASSETS: Fetcher;
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

// CORS for API routes
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

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

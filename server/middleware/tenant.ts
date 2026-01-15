/**
 * Multi-tenancy Middleware
 * 
 * Resolves the current store based on the request hostname.
 * Supports both subdomains (store1.mysaas.com) and custom domains (custom-shop.com).
 */

import { Context, MiddlewareHandler } from 'hono';
import { eq } from 'drizzle-orm';
import { stores, type Store } from '@db/schema';
import { D1Cache } from '../../app/services/cache-layer.server';
import { createDb } from '../../app/lib/db.server';
import { KVCache, CACHE_KEYS, CACHE_TTL } from '../../app/services/kv-cache.server';

// Extend Hono context with tenant information
export interface TenantContext {
  storeId: number;
  store: Store;
  isCustomDomain: boolean;
}

export interface TenantEnv {
  DB: D1Database;
  R2: R2Bucket;
  SAAS_DOMAIN: string;
  STORE_CACHE?: KVNamespace; // KV for fast caching
}

/**
 * Extract store identifier from hostname
 * 
 * Logic:
 * 1. If hostname ends with SAAS_DOMAIN -> extract subdomain
 * 2. Otherwise -> treat as custom domain
 */
function parseHostname(hostname: string, saasDomain: string): { type: 'subdomain' | 'custom'; value: string } {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // Check if it's a subdomain of the main SaaS domain
  if (cleanHostname.endsWith(`.${saasDomain}`)) {
    const subdomain = cleanHostname.replace(`.${saasDomain}`, '');
    return { type: 'subdomain', value: subdomain };
  }
  
  // Check if it's the main SaaS domain itself (www or naked)
  if (cleanHostname === saasDomain || cleanHostname === `www.${saasDomain}`) {
    return { type: 'subdomain', value: 'www' };
  }
  
  // Otherwise, treat as custom domain
  return { type: 'custom', value: cleanHostname };
}

/**
 * Tenant Resolution Middleware
 * 
 * Resolves the store from the request hostname and injects it into the context.
 * Returns 404 if store is not found.
 */
export const tenantMiddleware = (): MiddlewareHandler<{ Bindings: TenantEnv; Variables: TenantContext }> => {
  return async (c, next) => {
    // Check X-Forwarded-Host first (set by wildcard proxy worker)
    // This preserves the original subdomain when proxied through Pages
    const hostname = c.req.header('x-forwarded-host') || c.req.header('host') || '';
    const saasDomain = c.env.SAAS_DOMAIN || 'mysaas.com';
    const requestPath = c.req.path;
    
    console.log(`[TENANT] ============================================`);
    console.log(`[TENANT] Request: ${c.req.method} ${requestPath}`);
    console.log(`[TENANT] Hostname: ${hostname}`);
    console.log(`[TENANT] SAAS_DOMAIN: ${saasDomain}`);
    
    // Handle localhost development
    if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
      console.log(`[TENANT] Mode: Development (localhost)`);
      // In development, use query param or default to first store
      const storeParam = c.req.query('store');
      console.log(`[TENANT] Store param: ${storeParam || 'none'}`);
      
      const db = createDb(c.env.DB);
      
      let store: Store | undefined;
      
      try {
        if (storeParam) {
          // Try to find by subdomain or ID
          console.log(`[TENANT] Looking up store by subdomain: ${storeParam}`);
          const storeResult = await db
            .select()
            .from(stores)
            .where(eq(stores.subdomain, storeParam))
            .limit(1);
          store = storeResult[0];
          console.log(`[TENANT] Subdomain lookup result: ${store ? `Found (ID: ${store.id})` : 'Not found'}`);
          
          if (!store) {
            const idParam = parseInt(storeParam, 10);
            if (!isNaN(idParam)) {
              console.log(`[TENANT] Looking up store by ID: ${idParam}`);
              const storeById = await db
                .select()
                .from(stores)
                .where(eq(stores.id, idParam))
                .limit(1);
              store = storeById[0];
              console.log(`[TENANT] ID lookup result: ${store ? `Found (ID: ${store.id})` : 'Not found'}`);
            }
          }
        } else {
          // Default to first active store in development
          console.log(`[TENANT] No store param, fetching first active store`);
          const defaultStore = await db
            .select()
            .from(stores)
            .where(eq(stores.isActive, true))
            .limit(1);
          store = defaultStore[0];
          console.log(`[TENANT] Default store result: ${store ? `Found (ID: ${store.id}, Name: ${store.name})` : 'Not found'}`);
        }
      } catch (dbError) {
        console.error(`[TENANT] Database error during development store lookup:`, dbError);
        console.error(`[TENANT] Error message:`, dbError instanceof Error ? dbError.message : String(dbError));
        console.error(`[TENANT] Error stack:`, dbError instanceof Error ? dbError.stack : 'No stack');
        return c.json({ 
          error: 'Database error',
          message: 'Failed to query store database',
          debug: dbError instanceof Error ? dbError.message : String(dbError),
        }, 500);
      }
      
      if (!store) {
        console.warn(`[TENANT] No store found in development mode`);
        return c.json({ error: 'Store not found' }, 404);
      }
      
      console.log(`[TENANT] Resolved store: ID=${store.id}, Name=${store.name}, Active=${store.isActive}`);
      c.set('storeId', store.id);
      c.set('store', store);
      c.set('isCustomDomain', false);
      
      return next();
    }
    
    // Production: Parse hostname
    const { type, value } = parseHostname(hostname, saasDomain);
    console.log(`[TENANT] Mode: Production`);
    console.log(`[TENANT] Parsed: type=${type}, value=${value}`);
    
    // Initialize DB and Cache
    const db = createDb(c.env.DB);
    const d1Cache = new D1Cache(db);
    
    // Initialize KV cache (faster than D1)
    const kvCache = c.env.STORE_CACHE ? new KVCache(c.env.STORE_CACHE) : null;
    
    const kvKey = type === 'subdomain' 
      ? `${CACHE_KEYS.TENANT_SUBDOMAIN}${value}`
      : `${CACHE_KEYS.TENANT_DOMAIN}${value}`;
    
    let isCustomDomain = type === 'custom';
    
    // Try KV cache first (fastest ~10ms)
    if (kvCache) {
      const kvCached = await kvCache.get<Store>(kvKey);
      if (kvCached) {
        console.log(`[TENANT] ✓ KV Cache Hit: ID=${kvCached.id}, Name=${kvCached.name}`);
        c.set('storeId', kvCached.id);
        c.set('store', kvCached);
        c.set('isCustomDomain', isCustomDomain);
        return next();
      }
    }
    
    // Try D1 cache (slower fallback ~50ms)
    const d1CacheKey = `tenant:${type}:${value}`;
    let store = await d1Cache.get<Store>(d1CacheKey);
    
    if (store) {
      console.log(`[TENANT] ✓ D1 Cache Hit: ID=${store.id}, Name=${store.name}`);
      // Warm KV cache for next request
      if (kvCache) {
        kvCache.set(kvKey, store, CACHE_TTL.TENANT).catch(() => {});
      }
      c.set('storeId', store.id);
      c.set('store', store);
      c.set('isCustomDomain', isCustomDomain);
      return next();
    }
    
    try {
      if (type === 'subdomain') {
        // Lookup by subdomain
        console.log(`[TENANT] Looking up store by subdomain: ${value}`);
        const result = await db
          .select()
          .from(stores)
          .where(eq(stores.subdomain, value))
          .limit(1);
        store = result[0];
        console.log(`[TENANT] Subdomain lookup result: ${store ? `Found (ID: ${store.id}, Name: ${store.name})` : 'Not found'}`);
      } else {
        // Lookup by custom domain
        console.log(`[TENANT] Looking up store by custom domain: ${value}`);
        const result = await db
          .select()
          .from(stores)
          .where(eq(stores.customDomain, value))
          .limit(1);
        store = result[0];
        console.log(`[TENANT] Custom domain lookup result: ${store ? `Found (ID: ${store.id}, Name: ${store.name})` : 'Not found'}`);
      }
      
      // Cache the result in both KV and D1
      if (store) {
        // KV cache (fast, fire-and-forget)
        if (kvCache) {
          kvCache.set(kvKey, store, CACHE_TTL.TENANT).catch(() => {});
        }
        // D1 cache (persistent fallback)
        await d1Cache.set(d1CacheKey, store, 3600);
      }
    } catch (dbError) {
      console.error(`[TENANT] Database error during store lookup:`);
      // ... existing error logging
      return c.json(
        { 
          error: 'Database error',
          message: 'Failed to query store database',
          debug: {
            errorType: dbError?.constructor?.name,
            errorMessage: dbError instanceof Error ? dbError.message : String(dbError),
            hostname,
            type,
            value,
          },
        },
        500
      );
    }
    
    // Store not found
    if (!store) {
      console.warn(`[TENANT] Store not found for ${type}: ${value}`);
      return c.json(
        { 
          error: 'Store not found',
          message: `No store found for ${type === 'subdomain' ? 'subdomain' : 'domain'}: ${value}`,
          debug: {
            hostname,
            saasDomain,
            type,
            value,
          },
        },
        404
      );
    }
    
    // Store is not active
    if (!store.isActive) {
      console.warn(`[TENANT] Store is inactive: ID=${store.id}, Name=${store.name}`);
      return c.json(
        { 
          error: 'Store unavailable',
          message: 'This store is currently unavailable.',
          debug: {
            storeId: store.id,
            storeName: store.name,
            isActive: store.isActive,
          },
        },
        503
      );
    }
    
    // Inject store context
    console.log(`[TENANT] ✓ Store resolved successfully: ID=${store.id}, Name=${store.name}`);
    c.set('storeId', store.id);
    c.set('store', store);
    c.set('isCustomDomain', isCustomDomain);
    
    return next();
  };
};

/**
 * Helper to get store context from Hono context
 */
export function getStore(c: Context<{ Variables: TenantContext }>): Store {
  return c.get('store');
}

export function getStoreId(c: Context<{ Variables: TenantContext }>): number {
  return c.get('storeId');
}

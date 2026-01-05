/**
 * Multi-tenancy Middleware
 * 
 * Resolves the current store based on the request hostname.
 * Supports both subdomains (store1.mysaas.com) and custom domains (custom-shop.com).
 */

import { Context, MiddlewareHandler } from 'hono';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, type Store } from '@db/schema';

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
    const hostname = c.req.header('host') || '';
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
      
      const db = drizzle(c.env.DB);
      
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
    
    const db = drizzle(c.env.DB);
    
    let store: Store | undefined;
    let isCustomDomain = false;
    
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
        isCustomDomain = true;
        console.log(`[TENANT] Looking up store by custom domain: ${value}`);
        const result = await db
          .select()
          .from(stores)
          .where(eq(stores.customDomain, value))
          .limit(1);
        store = result[0];
        console.log(`[TENANT] Custom domain lookup result: ${store ? `Found (ID: ${store.id}, Name: ${store.name})` : 'Not found'}`);
      }
    } catch (dbError) {
      console.error(`[TENANT] Database error during store lookup:`);
      console.error(`[TENANT] Error type:`, dbError?.constructor?.name);
      console.error(`[TENANT] Error message:`, dbError instanceof Error ? dbError.message : String(dbError));
      console.error(`[TENANT] Error stack:`, dbError instanceof Error ? dbError.stack : 'No stack');
      if (dbError && typeof dbError === 'object' && 'cause' in dbError) {
        console.error(`[TENANT] Error cause:`, (dbError as { cause?: unknown }).cause);
      }
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

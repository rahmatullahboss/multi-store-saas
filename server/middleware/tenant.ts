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
    
    // Handle localhost development
    if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
      // In development, use query param or default to first store
      const storeParam = c.req.query('store');
      const db = drizzle(c.env.DB);
      
      let store: Store | undefined;
      
      if (storeParam) {
        // Try to find by subdomain or ID
        const storeResult = await db
          .select()
          .from(stores)
          .where(eq(stores.subdomain, storeParam))
          .limit(1);
        store = storeResult[0];
        
        if (!store) {
          const idParam = parseInt(storeParam, 10);
          if (!isNaN(idParam)) {
            const storeById = await db
              .select()
              .from(stores)
              .where(eq(stores.id, idParam))
              .limit(1);
            store = storeById[0];
          }
        }
      } else {
        // Default to first active store in development
        const defaultStore = await db
          .select()
          .from(stores)
          .where(eq(stores.isActive, true))
          .limit(1);
        store = defaultStore[0];
      }
      
      if (!store) {
        return c.json({ error: 'Store not found' }, 404);
      }
      
      c.set('storeId', store.id);
      c.set('store', store);
      c.set('isCustomDomain', false);
      
      return next();
    }
    
    // Production: Parse hostname
    const { type, value } = parseHostname(hostname, saasDomain);
    const db = drizzle(c.env.DB);
    
    let store: Store | undefined;
    let isCustomDomain = false;
    
    if (type === 'subdomain') {
      // Lookup by subdomain
      const result = await db
        .select()
        .from(stores)
        .where(eq(stores.subdomain, value))
        .limit(1);
      store = result[0];
    } else {
      // Lookup by custom domain
      isCustomDomain = true;
      const result = await db
        .select()
        .from(stores)
        .where(eq(stores.customDomain, value))
        .limit(1);
      store = result[0];
    }
    
    // Store not found
    if (!store) {
      return c.json(
        { 
          error: 'Store not found',
          message: `No store found for ${type === 'subdomain' ? 'subdomain' : 'domain'}: ${value}`,
        },
        404
      );
    }
    
    // Store is not active
    if (!store.isActive) {
      return c.json(
        { 
          error: 'Store unavailable',
          message: 'This store is currently unavailable.',
        },
        503
      );
    }
    
    // Inject store context
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

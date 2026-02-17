/**
 * Multi-tenancy Middleware
 *
 * Resolves the current store based on the request hostname.
 * Supports both subdomains (store1.mysaas.com) and custom domains (custom-shop.com).
 */

import { Context, MiddlewareHandler } from 'hono';
import { eq, and, isNull, asc } from 'drizzle-orm';
import { stores, type Store } from '@db/schema';
import { D1Cache } from '../../app/services/cache-layer.server';
import { createDb } from '../../app/lib/db.server';
import { KVCache, CACHE_KEYS, CACHE_TTL } from '../../app/services/kv-cache.server';
// DO-backed store config cache (fastest - in-memory with stale-while-revalidate)
import { getStoreConfig, type StoreConfig } from '../../app/services/store-config-do.server';

// Extend Hono context with tenant information
export interface TenantContext {
  storeId: number;
  store: Store;
  isCustomDomain: boolean;
  // Set by request-id middleware in server entry (optional for backward compatibility).
  requestId?: string;
}

export interface TenantEnv {
  DB: D1Database;
  R2: R2Bucket;
  SAAS_DOMAIN: string;
  // Optional environment tag (production|staging|development). Used for safe staging fallbacks.
  ENVIRONMENT?: string;
  STORE_CACHE?: KVNamespace; // KV for fast caching
  STORE_CONFIG_SERVICE?: Fetcher; // DO-backed store config cache (fastest)
  WEBHOOK_QUEUE: Queue;
}

/**
 * Extract store identifier from hostname
 *
 * Logic:
 * 1. If hostname ends with SAAS_DOMAIN -> extract subdomain
 * 2. Otherwise -> treat as custom domain
 */
function parseHostname(
  hostname: string,
  saasDomain: string
): { type: 'subdomain' | 'custom'; value: string } {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];

  // Local development subdomains:
  // Playwright/E2E and Vite dev commonly use `store.localhost` to simulate tenants.
  // Treat `*.localhost` as a subdomain and resolve by `stores.subdomain`.
  if (cleanHostname.endsWith('.localhost')) {
    const subdomain = cleanHostname.replace(/\.localhost$/, '');
    return { type: 'subdomain', value: subdomain };
  }

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
export const tenantMiddleware = <
  TContext extends { Bindings: TenantEnv; Variables: TenantContext },
>(): MiddlewareHandler<TContext> => {
  return async (c: Context<TContext>, next) => {
    const requestPath = c.req.path;
    const isFrameworkInternalRequest =
      requestPath === '/__manifest' || requestPath.startsWith('/__manifest?');
    const isStaticAssetRequest =
      requestPath.startsWith('/assets/') ||
      /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|map)$/.test(requestPath);

    // Skip tenant resolution for framework internals/static assets.
    // These requests are store-agnostic and don't need DB/KV lookups.
    if (isFrameworkInternalRequest || isStaticAssetRequest) {
      return next();
    }

    // Check X-Forwarded-Host first (set by wildcard proxy worker)
    // This preserves the original subdomain when proxied through Pages
    const hostname = c.req.header('x-forwarded-host') || c.req.header('host') || '';
    const cleanHostname = hostname.split(':')[0];
    const saasDomain = c.env.SAAS_DOMAIN || 'mysaas.com';
    const envName = (c.env as TenantEnv).ENVIRONMENT || 'production';
    const isVerboseTenantLogging = envName !== 'production';
    const tenantLog = (...args: unknown[]) => {
      if (isVerboseTenantLogging) {
        console.warn(...args);
      }
    };

    tenantLog(`[TENANT] ============================================`);
    tenantLog(`[TENANT] Request: ${c.req.method} ${requestPath}`);
    tenantLog(`[TENANT] Hostname: ${hostname}`);
    tenantLog(`[TENANT] Clean Hostname: ${cleanHostname}`);
    tenantLog(`[TENANT] SAAS_DOMAIN: ${saasDomain}`);
    tenantLog(`[TENANT] ENVIRONMENT: ${envName}`);

    // Handle localhost development
    if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
      tenantLog(`[TENANT] Mode: Development (localhost)`);
      // In development, use query param or default to first store
      const storeParam = c.req.query('store');
      tenantLog(`[TENANT] Store param: ${storeParam || 'none'}`);

      const db = createDb(c.env.DB);

      let store: Store | undefined;

      try {
        if (storeParam) {
          // Try to find by subdomain or ID (exclude soft-deleted stores)
          tenantLog(`[TENANT] Looking up store by subdomain: ${storeParam}`);
          const storeResult = await db
            .select()
            .from(stores)
            .where(and(eq(stores.subdomain, storeParam), isNull(stores.deletedAt)))
            .limit(1);
          store = storeResult[0];
          tenantLog(
            `[TENANT] Subdomain lookup result: ${store ? `Found (ID: ${store.id})` : 'Not found'}`
          );

          if (!store) {
            const idParam = parseInt(storeParam, 10);
            if (!isNaN(idParam)) {
              tenantLog(`[TENANT] Looking up store by ID: ${idParam}`);
              const storeById = await db
                .select()
                .from(stores)
                .where(and(eq(stores.id, idParam), isNull(stores.deletedAt)))
                .limit(1);
              store = storeById[0];
              tenantLog(
                `[TENANT] ID lookup result: ${store ? `Found (ID: ${store.id})` : 'Not found'}`
              );
            }
          }
        } else {
          // Default to first active store in development (exclude soft-deleted)
          tenantLog(`[TENANT] No store param, fetching first active store`);
          const defaultStore = await db
            .select()
            .from(stores)
            .where(and(eq(stores.isActive, true), isNull(stores.deletedAt)))
            .limit(1);
          store = defaultStore[0];
          tenantLog(
            `[TENANT] Default store result: ${store ? `Found (ID: ${store.id}, Name: ${store.name})` : 'Not found'}`
          );
        }
      } catch (dbError) {
        console.error(`[TENANT] Database error during development store lookup:`, dbError);
        console.error(
          `[TENANT] Error message:`,
          dbError instanceof Error ? dbError.message : String(dbError)
        );
        console.error(
          `[TENANT] Error stack:`,
          dbError instanceof Error ? dbError.stack : 'No stack'
        );
        return c.json(
          {
            error: 'Database error',
            message: 'Failed to query store database',
            debug: dbError instanceof Error ? dbError.message : String(dbError),
          },
          500
        );
      }

      if (!store) {
        tenantLog(`[TENANT] No store found in development mode`);
        return c.json({ error: 'Store not found' }, 404);
      }

      tenantLog(
        `[TENANT] Resolved store: ID=${store.id}, Name=${store.name}, Active=${store.isActive}`
      );
      c.set('storeId', store.id);
      c.set('store', store);
      c.set('isCustomDomain', false);

      return next();
    }

    // STAGING SAFETY FALLBACK:
    // When deployed to workers.dev (no custom domain), the hostname will be:
    //   <script>.<account>.workers.dev
    // which tenant parsing treats as a custom domain. Unless we seed `stores.custom_domain`,
    // tenant resolution will 404 with "Store not found".
    //
    // To keep staging usable out-of-the-box (smoke tests, Sentry wiring, etc.),
    // default to the first active store for workers.dev hostnames.
    //
    // NOTE: Prefer configuring a staging custom domain (e.g. staging.<store>.ozzyl.com)
    // or setting `stores.custom_domain` in the staging DB for deterministic routing.
    if (envName === 'staging' && cleanHostname.endsWith('.workers.dev')) {
      tenantLog(`[TENANT] Staging workers.dev fallback: selecting first active store`);
      const db = createDb(c.env.DB);
      const defaultStore = await db
        .select()
        .from(stores)
        .where(and(eq(stores.isActive, true), isNull(stores.deletedAt)))
        .orderBy(asc(stores.id))
        .limit(1);

      const store = defaultStore[0];
      if (store) {
        tenantLog(
          `[TENANT] Staging fallback resolved store: ID=${store.id}, Name=${store.name}`
        );
        c.set('storeId', store.id);
        c.set('store', store);
        c.set('isCustomDomain', true);
        return next();
      }
      tenantLog(`[TENANT] Staging fallback failed: no active stores in DB`);
      // Continue normal tenant resolution to return a helpful "Store not found" error.
    }

    // Production: Parse hostname
    const { type, value } = parseHostname(cleanHostname, saasDomain);
    tenantLog(`[TENANT] Mode: Production`);
    tenantLog(`[TENANT] Parsed: type=${type}, value=${value}`);

    // ADMIN APP EXEMPTION:
    // If subdomain is 'app', this is the Admin Panel / Platform Dashboard.
    // We skip store lookup and allow the request to proceed (handled by admin routes).
    if (type === 'subdomain' && value === 'app') {
      tenantLog(`[TENANT] Routing to Admin App (app.${saasDomain})`);
      return next();
    }

    // Initialize DB and Cache
    const db = createDb(c.env.DB);
    const d1Cache = new D1Cache(db);

    // Initialize KV cache (faster than D1)
    const kvCache = c.env.STORE_CACHE ? new KVCache(c.env.STORE_CACHE) : null;

    const kvKey =
      type === 'subdomain'
        ? `${CACHE_KEYS.TENANT_SUBDOMAIN}${value}`
        : `${CACHE_KEYS.TENANT_DOMAIN}${value}`;

    const isCustomDomain = type === 'custom';

    // ========================================================================
    // CACHE LAYER 1: DO Store Config Cache (fastest ~5-10ms, in-memory)
    // Uses stale-while-revalidate pattern for optimal performance
    // ========================================================================
    const hasStoreConfigDO = 'STORE_CONFIG_SERVICE' in c.env && c.env.STORE_CONFIG_SERVICE;

    // For subdomain lookup, we need to first find the store ID
    // DO cache is indexed by store ID, so we'll use it after initial resolution
    // and store the result for subsequent requests

    // ========================================================================
    // CACHE LAYER 2: KV Cache (~10-20ms)
    // ========================================================================
    if (kvCache) {
      const kvCached = await kvCache.get<Store>(kvKey);
      if (kvCached) {
        tenantLog(`[TENANT] ✓ KV Cache Hit: ID=${kvCached.id}, Name=${kvCached.name}`);
        c.set('storeId', kvCached.id);
        c.set('store', kvCached);
        c.set('isCustomDomain', isCustomDomain);
        return next();
      }
    }

    // ========================================================================
    // CACHE LAYER 3: D1 Cache (~50ms)
    // ========================================================================
    const d1CacheKey = `tenant:${type}:${value}`;
    let store = await d1Cache.get<Store>(d1CacheKey);

    if (store) {
      tenantLog(`[TENANT] ✓ D1 Cache Hit: ID=${store.id}, Name=${store.name}`);
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
        // Lookup by subdomain (exclude soft-deleted stores)
        tenantLog(`[TENANT] Looking up store by subdomain: ${value}`);
        const result = await db
          .select()
          .from(stores)
          .where(and(eq(stores.subdomain, value), isNull(stores.deletedAt)))
          .limit(1);
        store = result[0];
        tenantLog(
          `[TENANT] Subdomain lookup result: ${store ? `Found (ID: ${store.id}, Name: ${store.name})` : 'Not found'}`
        );
      } else {
        // Lookup by custom domain (exclude soft-deleted stores)
        tenantLog(`[TENANT] Looking up store by custom domain: ${value}`);
        const result = await db
          .select()
          .from(stores)
          .where(and(eq(stores.customDomain, value), isNull(stores.deletedAt)))
          .limit(1);
        store = result[0];
        tenantLog(
          `[TENANT] Custom domain lookup result: ${store ? `Found (ID: ${store.id}, Name: ${store.name})` : 'Not found'}`
        );
      }

      // Cache the result in KV and D1 (DO cache is self-managing)
      if (store) {
        // KV cache (fast, fire-and-forget)
        if (kvCache) {
          kvCache.set(kvKey, store, CACHE_TTL.TENANT).catch(() => {});
        }
        // D1 cache (persistent fallback)
        await d1Cache.set(d1CacheKey, store, 3600);

        // Warm DO cache by fetching config (fire-and-forget)
        // This pre-populates the DO cache for subsequent requests
        if (hasStoreConfigDO) {
          getStoreConfig({ STORE_CONFIG_SERVICE: c.env.STORE_CONFIG_SERVICE! }, store.id).catch(() => {
            // Ignore errors - DO cache warming is best-effort
          });
        }

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
      // FIX: Allow Google Auth callback and other auth routes to bypass store resolution
      // The callback route handles store resolution internally via the state parameter
      if (requestPath.startsWith('/store/auth/') || requestPath.startsWith('/api/oauth/')) {
        tenantLog(`[TENANT] Bypassing store check for auth route: ${requestPath}`);
        return next();
      }

      tenantLog(`[TENANT] Store not found for ${type}: ${value}`);
      
      // Redirect invalid subdomains to main landing page
      // But keep localhost/dev environments working normally
      const isLocalDev = 
        hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.includes('localhost:');
      
      if (!isLocalDev && type === 'subdomain') {
        // Redirect to main landing page for invalid subdomains
        return c.redirect('https://ozzyl.com', 302);
      }
      
      // For API routes or localhost, return JSON error
      return c.json(
        {
          error: 'Store not found',
          message: `No store found for ${type === 'subdomain' ? 'subdomain' : 'domain'}: ${value}`,
          debug: {
            envName,
            hostname,
            cleanHostname,
            saasDomain,
            type,
            value,
            workersDevFallbackEligible: envName === 'staging' && cleanHostname.endsWith('.workers.dev'),
          },
        },
        404
      );
    }

    // Store is not active
    if (!store.isActive) {
      tenantLog(`[TENANT] Store is inactive: ID=${store.id}, Name=${store.name}`);
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
    tenantLog(`[TENANT] ✓ Store resolved successfully: ID=${store.id}, Name=${store.name}`);
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

/**
 * Get store config from DO cache (for use in loaders/actions)
 *
 * This provides:
 * - In-memory caching (~5ms response)
 * - Stale-while-revalidate pattern
 * - Automatic fallback to D1
 *
 * Usage in Remix loaders:
 * ```ts
 * const config = await getCachedStoreConfig(context.cloudflare.env, storeId);
 * ```
 */
export async function getCachedStoreConfig(
  env: TenantEnv,
  storeId: number
): Promise<StoreConfig | null> {
  // Check if DO service is available
  if (!('STORE_CONFIG_SERVICE' in env) || !env.STORE_CONFIG_SERVICE) {
    return null;
  }

  try {
    const result = await getStoreConfig({ STORE_CONFIG_SERVICE: env.STORE_CONFIG_SERVICE as Fetcher }, storeId);
    if (result.success && result.config) {

      return result.config;
    }
    return null;
  } catch (error) {
    console.error('[TENANT] Failed to get cached store config:', error);
    return null;
  }
}

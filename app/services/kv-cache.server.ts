/**
 * KV-Based Cache Layer (Fast Edge Caching)
 * 
 * Uses Cloudflare Workers KV for ultra-fast edge caching.
 * KV provides ~10ms latency for hot keys vs ~50-100ms for D1 queries.
 * 
 * Best practices from Cloudflare docs:
 * - KV is eventually consistent (writes propagate in ~60s)
 * - Ideal for high read, low write scenarios
 * - TTL minimum is 60 seconds
 * 
 * Use cases:
 * - Tenant/store resolution (most frequent)
 * - Store configuration caching
 * - Product catalog caching
 * - Landing page config caching
 */

// Cache key prefixes for different data types
export const CACHE_KEYS = {
  TENANT_SUBDOMAIN: 'tenant:sub:', // tenant:sub:mystore
  TENANT_DOMAIN: 'tenant:dom:',     // tenant:dom:custom.com
  STORE_CONFIG: 'store:config:',    // store:config:123
  LANDING_CONFIG: 'landing:',       // landing:123
  PRODUCTS: 'products:',            // products:123
  PRODUCT: 'product:',              // product:123:456
  PAGE: 'page:',                    // page:123:landing
} as const;

// TTL values in seconds
export const CACHE_TTL = {
  TENANT: 3600,       // 1 hour - store resolution rarely changes
  STORE_CONFIG: 300,  // 5 minutes - config may update
  LANDING: 300,       // 5 minutes - landing page config
  PRODUCTS: 120,      // 2 minutes - products update frequently
  PRODUCT: 180,       // 3 minutes - single product
  PAGE: 600,          // 10 minutes - rendered page cache
} as const;

/**
 * KV Cache Class
 * 
 * Wraps Cloudflare KV namespace with typed methods
 */
export class KVCache {
  private kv: KVNamespace;
  
  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.kv.get(key, 'json');
      return value as T | null;
    } catch (error) {
      console.error(`[KV_CACHE] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = CACHE_TTL.STORE_CONFIG): Promise<void> {
    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: Math.max(60, ttlSeconds), // KV minimum TTL is 60s
      });
    } catch (error) {
      console.error(`[KV_CACHE] Error setting key ${key}:`, error);
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error(`[KV_CACHE] Error deleting key ${key}:`, error);
    }
  }

  /**
   * Invalidate multiple keys by prefix
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    try {
      const list = await this.kv.list({ prefix });
      await Promise.all(list.keys.map(k => this.kv.delete(k.name)));
    } catch (error) {
      console.error(`[KV_CACHE] Error invalidating prefix ${prefix}:`, error);
    }
  }

  // ========================================
  // Helper methods for common cache patterns
  // ========================================

  /**
   * Get or fetch with automatic caching
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T | null>,
    ttlSeconds: number = CACHE_TTL.STORE_CONFIG
  ): Promise<T | null> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await fetcher();
    
    // Cache if value exists
    if (value !== null) {
      await this.set(key, value, ttlSeconds);
    }

    return value;
  }

  /**
   * Cache tenant/store by subdomain
   */
  async cacheTenantBySubdomain<T>(subdomain: string, store: T): Promise<void> {
    const key = `${CACHE_KEYS.TENANT_SUBDOMAIN}${subdomain}`;
    await this.set(key, store, CACHE_TTL.TENANT);
  }

  /**
   * Get cached tenant by subdomain
   */
  async getTenantBySubdomain<T>(subdomain: string): Promise<T | null> {
    const key = `${CACHE_KEYS.TENANT_SUBDOMAIN}${subdomain}`;
    return this.get<T>(key);
  }

  /**
   * Cache tenant/store by custom domain
   */
  async cacheTenantByDomain<T>(domain: string, store: T): Promise<void> {
    const key = `${CACHE_KEYS.TENANT_DOMAIN}${domain}`;
    await this.set(key, store, CACHE_TTL.TENANT);
  }

  /**
   * Get cached tenant by custom domain
   */
  async getTenantByDomain<T>(domain: string): Promise<T | null> {
    const key = `${CACHE_KEYS.TENANT_DOMAIN}${domain}`;
    return this.get<T>(key);
  }

  /**
   * Invalidate all cache for a store
   */
  async invalidateStore(storeId: number): Promise<void> {
    // Invalidate store-related caches
    await Promise.all([
      this.invalidateByPrefix(`${CACHE_KEYS.STORE_CONFIG}${storeId}`),
      this.invalidateByPrefix(`${CACHE_KEYS.LANDING_CONFIG}${storeId}`),
      this.invalidateByPrefix(`${CACHE_KEYS.PRODUCTS}${storeId}`),
      this.invalidateByPrefix(`${CACHE_KEYS.PAGE}${storeId}`),
    ]);
  }
}

/**
 * Create KV cache instance from environment
 */
export function createKVCache(kv: KVNamespace | undefined): KVCache | null {
  if (!kv) {
    console.warn('[KV_CACHE] KV namespace not available, caching disabled');
    return null;
  }
  return new KVCache(kv);
}

/**
 * Hybrid cache: Try KV first, fallback to D1
 * 
 * This provides best of both worlds:
 * - KV for ultra-fast reads (hot cache)
 * - D1 for persistence when KV miss
 */
export async function hybridGet<T>(
  kvCache: KVCache | null,
  d1Fallback: () => Promise<T | null>,
  key: string,
  ttlSeconds: number = CACHE_TTL.STORE_CONFIG
): Promise<T | null> {
  // Try KV first (fastest)
  if (kvCache) {
    const cached = await kvCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // Fallback to D1/source
  const value = await d1Fallback();

  // Warm KV cache for next request
  if (value !== null && kvCache) {
    // Don't await - fire and forget for faster response
    kvCache.set(key, value, ttlSeconds).catch(() => {});
  }

  return value;
}

/**
 * Cloudflare Cache API Helpers
 * 
 * Utilities for caching at the edge using Cloudflare's Cache API.
 */

/**
 * Cache keys for different data types
 */
export const cacheKeys = {
  products: (storeId: number) => `store:${storeId}:products`,
  product: (storeId: number, productId: number) => `store:${storeId}:product:${productId}`,
  store: (storeId: number) => `store:${storeId}:info`,
};

/**
 * Get cached response or execute handler
 */
export async function withCache<T>(
  request: Request,
  cacheKey: string,
  handler: () => Promise<T>,
  options: {
    ttl?: number; // seconds
    staleWhileRevalidate?: number; // seconds
  } = {}
): Promise<T> {
  const { ttl = 60, staleWhileRevalidate = 300 } = options;
  
  // Create a cache-specific request URL
  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = `/__cache/${cacheKey}`;
  const cacheRequest = new Request(cacheUrl.toString());
  
  const cache = (caches as unknown as { default: Cache }).default;
  
  // Try to get from cache
  const cachedResponse = await cache.match(cacheRequest);
  if (cachedResponse) {
    const data = await cachedResponse.json();
    return data as T;
  }
  
  // Execute handler
  const data = await handler();
  
  // Store in cache
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
  
  // Don't await - let it happen in the background
  cache.put(cacheRequest, response.clone());
  
  return data;
}

/**
 * Invalidate cache for a specific key
 */
export async function invalidateCache(request: Request, cacheKey: string): Promise<boolean> {
  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = `/__cache/${cacheKey}`;
  const cacheRequest = new Request(cacheUrl.toString());
  
  const cache = (caches as unknown as { default: Cache }).default;
  return cache.delete(cacheRequest);
}

/**
 * Invalidate all cache for a store
 */
export async function invalidateStoreCache(request: Request, storeId: number): Promise<void> {
  // Note: Full cache invalidation by prefix is not directly supported
  // This is a simplified version - in production, consider using KV for cache invalidation tracking
  await Promise.all([
    invalidateCache(request, cacheKeys.products(storeId)),
    invalidateCache(request, cacheKeys.store(storeId)),
  ]);
}

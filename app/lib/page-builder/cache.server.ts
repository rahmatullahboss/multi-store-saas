/**
 * Page Builder v2 - KV Cache Utilities
 * 
 * Caching layer for published pages using Cloudflare KV.
 * Provides near-instant page loads from edge cache.
 */

import type { BuilderPage } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface CachedPageData {
  page: {
    id: string;
    slug: string;
    title: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    ogImage?: string | null;
    status: string;
    publishedAt?: Date | null;
  };
  sections: Array<{
    id: string;
    type: string;
    enabled: boolean;
    sortOrder: number;
    props: Record<string, unknown>;
  }>;
  cachedAt: number;
}

// ============================================================================
// CACHE KEY
// ============================================================================

/**
 * Generate cache key for a page.
 * Format: page:{storeId}:{slug}
 */
function getCacheKey(storeId: number, slug: string): string {
  return `page:${storeId}:${slug}`;
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

/**
 * Get page data from KV cache.
 * Returns null if not cached or expired.
 */
export async function getPageFromCache(
  kv: KVNamespace | undefined,
  storeId: number,
  slug: string
): Promise<CachedPageData | null> {
  if (!kv) return null;
  
  try {
    const key = getCacheKey(storeId, slug);
    const cached = await kv.get(key, 'json');
    return cached as CachedPageData | null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Cache page data to KV with TTL.
 * Default TTL: 5 minutes (300 seconds)
 */
export async function cachePageData(
  kv: KVNamespace | undefined,
  storeId: number,
  slug: string,
  data: BuilderPage,
  ttlSeconds: number = 300
): Promise<void> {
  if (!kv) return;
  
  try {
    const key = getCacheKey(storeId, slug);
    
    const cacheData: CachedPageData = {
      page: {
        id: data.id,
        slug: data.slug,
        title: data.title,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        status: data.status,
        publishedAt: data.publishedAt,
      },
      sections: data.sections.map(s => ({
        id: s.id,
        type: s.type,
        enabled: s.enabled,
        sortOrder: s.sortOrder,
        props: s.props,
      })),
      cachedAt: Date.now(),
    };
    
    await kv.put(key, JSON.stringify(cacheData), {
      expirationTtl: ttlSeconds,
    });
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * Invalidate cache when page is edited or unpublished.
 */
export async function invalidatePageCache(
  kv: KVNamespace | undefined,
  storeId: number,
  slug: string
): Promise<void> {
  if (!kv) return;
  
  try {
    const key = getCacheKey(storeId, slug);
    await kv.delete(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Warm cache after publishing a page.
 * Fetches from DB and populates cache.
 */
export async function warmPageCache(
  db: D1Database,
  kv: KVNamespace | undefined,
  pageId: string,
  storeId: number
): Promise<void> {
  if (!kv) return;
  
  try {
    // Dynamic import to avoid circular dependency
    const { getPageWithSections } = await import('./actions.server');
    
    const page = await getPageWithSections(db, pageId, storeId);
    
    if (page && page.status === 'published') {
      await cachePageData(kv, storeId, page.slug, page);
    }
  } catch (error) {
    console.error('Cache warm error:', error);
  }
}

/**
 * Invalidate all pages for a store (when store is deleted).
 * Note: KV doesn't support prefix deletion, so we'd need to track keys.
 * For now, pages will expire naturally via TTL.
 */
export async function invalidateStoreCache(
  kv: KVNamespace | undefined,
  storeId: number,
  slugs: string[]
): Promise<void> {
  if (!kv) return;
  
  try {
    await Promise.all(
      slugs.map(slug => invalidatePageCache(kv, storeId, slug))
    );
  } catch (error) {
    console.error('Store cache invalidation error:', error);
  }
}

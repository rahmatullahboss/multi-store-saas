/**
 * Page Cache Service
 * 
 * Manages pre-rendered HTML cache for landing pages to improve performance.
 * Uses the published_pages table for storage.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { publishedPages, type NewPublishedPage } from '@db/schema';
import type { LandingConfig } from '@db/types';

// Use D1Database type from Cloudflare
type D1Database = import('@cloudflare/workers-types').D1Database;

/**
 * Generate a hash from landing config for cache invalidation
 */
export function generateConfigHash(config: LandingConfig): string {
  const configString = JSON.stringify(config);
  // Simple hash function - good enough for cache invalidation
  let hash = 0;
  for (let i = 0; i < configString.length; i++) {
    const char = configString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached page HTML if available
 */
export async function getCachedPage(
  db: D1Database,
  storeId: number,
  configHash: string
): Promise<{ htmlContent: string; cssContent: string | null } | null> {
  const drizzleDb = drizzle(db);
  
  const [cached] = await drizzleDb
    .select({
      htmlContent: publishedPages.htmlContent,
      cssContent: publishedPages.cssContent,
    })
    .from(publishedPages)
    .where(
      and(
        eq(publishedPages.storeId, storeId),
        eq(publishedPages.configHash, configHash)
      )
    )
    .limit(1);

  return cached ?? null;
}

/**
 * Save rendered page to cache
 */
export async function setCachedPage(
  db: D1Database,
  storeId: number,
  data: {
    htmlContent: string;
    cssContent?: string;
    templateId?: string;
    configHash: string;
    metaTags?: { title?: string; description?: string; ogImage?: string };
    productId?: number;
    pageType?: 'landing' | 'product';
  }
): Promise<void> {
  const drizzleDb = drizzle(db);

  // Upsert: delete existing cache for this store, then insert new
  await drizzleDb
    .delete(publishedPages)
    .where(
      and(
        eq(publishedPages.storeId, storeId),
        eq(publishedPages.pageType, data.pageType ?? 'landing'),
        data.productId ? eq(publishedPages.productId, data.productId) : undefined
      )
    );

  const newRecord: NewPublishedPage = {
    storeId,
    pageType: data.pageType ?? 'landing',
    productId: data.productId,
    htmlContent: data.htmlContent,
    cssContent: data.cssContent,
    templateId: data.templateId,
    configHash: data.configHash,
    metaTags: data.metaTags ? JSON.stringify(data.metaTags) : undefined,
  };

  await drizzleDb.insert(publishedPages).values(newRecord);
}

/**
 * Invalidate cache for a store
 */
export async function invalidateCache(
  db: D1Database,
  storeId: number,
  productId?: number
): Promise<void> {
  const drizzleDb = drizzle(db);

  if (productId) {
    await drizzleDb
      .delete(publishedPages)
      .where(
        and(
          eq(publishedPages.storeId, storeId),
          eq(publishedPages.productId, productId)
        )
      );
  } else {
    await drizzleDb
      .delete(publishedPages)
      .where(eq(publishedPages.storeId, storeId));
  }
}

/**
 * Check if cache exists for a config hash
 */
export async function hasCachedPage(
  db: D1Database,
  storeId: number,
  configHash: string
): Promise<boolean> {
  const cached = await getCachedPage(db, storeId, configHash);
  return cached !== null;
}

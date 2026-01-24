/**
 * Store Configuration Service
 * 
 * Provides high-performance access to store settings using D1Cache.
 */

import { stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import type { Database } from '~/lib/db.server';
import type { D1Cache } from './cache-layer.server';

/**
 * Get store configuration with caching
 */
export async function getStoreConfig(db: Database, cache: D1Cache, storeId: number) {
  const cacheKey = `store:${storeId}:config`;
  
  // 1. Try cache first
  const cached = await cache.get<any>(cacheKey);
  if (cached) return cached;
  
  // 2. Fallback to D1
  const store = await db.query.stores.findFirst({
    where: (s, { eq }) => eq(s.id, storeId),
    columns: {
      themeConfig: true,
      businessInfo: true,
      shippingConfig: true,
      landingConfig: true,
      footerConfig: true,
    }
  });
  
  if (!store) return null;
  
  // Parse JSON strings to objects for cleaner usage
  const config = {
    ...store,
    themeConfig: store.themeConfig ? JSON.parse(store.themeConfig) : null,
    businessInfo: store.businessInfo ? JSON.parse(store.businessInfo) : null,
    shippingConfig: store.shippingConfig ? JSON.parse(store.shippingConfig) : null,
    landingConfig: store.landingConfig ? JSON.parse(store.landingConfig) : null,
    footerConfig: store.footerConfig ? JSON.parse(store.footerConfig) : null,
  };
  
  // 3. Cache the result (5 minutes)
  await cache.set(cacheKey, config, 300);
  
  return config;
}

/**
 * Invalidate store config cache (call after updates)
 */
export async function invalidateStoreConfig(cache: D1Cache, storeId: number) {
  await cache.delete(`store:${storeId}:config`);
  // Optionally invalidate all store-related cache
  await cache.invalidatePattern(`store:${storeId}:`);
}

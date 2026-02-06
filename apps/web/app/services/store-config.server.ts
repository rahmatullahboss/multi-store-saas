/**
 * Store Configuration Service
 * 
 * Provides high-performance access to store settings using D1Cache.
 */

import { stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import type { Database } from '~/lib/db.server';
import type { D1Cache } from './cache-layer.server';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Normalize ThemeConfig for MVP correctness:
 * - Empty `sections: []` should behave like "unset" so templates can fall back to defaults.
 * - Floating button flags defaulted to `false` in older configs; treat `false` as "unset"
 *   unless the merchant explicitly provided a floating number (meaning they likely toggled it).
 */
function normalizeThemeConfig(themeConfig: any | null): any | null {
  if (!themeConfig || typeof themeConfig !== 'object') return themeConfig;

  // If the editor saved empty arrays, treat them as unset so storefront doesn't go blank.
  if (Array.isArray(themeConfig.sections) && themeConfig.sections.length === 0) {
    delete themeConfig.sections;
  }

  // Clean up empty string fields.
  if (themeConfig.floatingWhatsappNumber === '') delete themeConfig.floatingWhatsappNumber;
  if (themeConfig.floatingCallNumber === '') delete themeConfig.floatingCallNumber;
  if (themeConfig.floatingWhatsappMessage === '') delete themeConfig.floatingWhatsappMessage;

  // Backward-compat: old configs defaulted enabled flags to false even when merchant
  // only set socialLinks/businessInfo. If no explicit floating number is set, treat false as unset.
  if (themeConfig.floatingWhatsappEnabled === false && !themeConfig.floatingWhatsappNumber) {
    delete themeConfig.floatingWhatsappEnabled;
  }
  if (themeConfig.floatingCallEnabled === false && !themeConfig.floatingCallNumber) {
    delete themeConfig.floatingCallEnabled;
  }

  return themeConfig;
}

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
    themeConfig: normalizeThemeConfig(safeJsonParse<any>(store.themeConfig)),
    businessInfo: safeJsonParse<any>(store.businessInfo),
    shippingConfig: safeJsonParse<any>(store.shippingConfig),
    landingConfig: safeJsonParse<any>(store.landingConfig),
    footerConfig: safeJsonParse<any>(store.footerConfig),
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

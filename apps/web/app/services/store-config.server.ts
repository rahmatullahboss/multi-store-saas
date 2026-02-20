/**
 * Store Configuration Service
 *
 * Provides high-performance access to store settings using D1Cache.
 */

import type { Database } from '~/lib/db.server';
import type { D1Cache } from './cache-layer.server';
import { getUnifiedStorefrontSettings } from './unified-storefront-settings.server';

/**
 * Get store configuration with caching
 */
export async function getStoreConfig(
  db: Database,
  cache: D1Cache,
  storeId: number,
  env?: { KV: KVNamespace }
) {
  const cacheKey = `store:${storeId}:config`;

  // 1. Try cache first
  const cached = await cache.get<any>(cacheKey);
  if (cached) return cached;

  // 2. Use unified settings as single source of truth
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, { env });

  // Build config from unified settings
  const config = {
    themeConfig: null,
    socialLinks: {
      facebook: unifiedSettings.social.facebook,
      instagram: unifiedSettings.social.instagram,
      whatsapp: unifiedSettings.social.whatsapp,
      twitter: unifiedSettings.social.twitter,
      youtube: unifiedSettings.social.youtube,
      linkedin: unifiedSettings.social.linkedin,
    },
    businessInfo: {
      phone: unifiedSettings.business.phone,
      email: unifiedSettings.business.email,
      address: unifiedSettings.business.address,
    },
    shippingConfig: unifiedSettings.shippingConfig,
    landingConfig: null,
    footerConfig: {
      showPoweredBy: true,
      columns: unifiedSettings.navigation?.footerColumns || [],
      description: unifiedSettings.navigation?.footerDescription,
    },
  };

  // 3. Cache the result (60 seconds — aligned with all other cache layers)
  await cache.set(cacheKey, config, 60);

  return config;
}

/**
 * Invalidate store config cache (call after updates)
 */
export async function invalidateStoreConfig(cache: D1Cache, storeId: number) {
  await cache.delete(`store:${storeId}:config`);
  await cache.invalidatePattern(`store:${storeId}:`);
}


import {
  DEFAULT_SHIPPING_CONFIG,
  parseShippingConfig,
  type ShippingConfig,
} from '~/utils/shipping';
import {
  getUnifiedStorefrontSettings,
  getShippingConfigFromUnified,
} from './unified-storefront-settings.server';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

/**
 * Resolve shipping config for a store.
 *
 * Priority:
 * 1) Unified storefront settings (single source of truth)
 * 2) stores.shippingConfig (legacy fallback)
 * 3) shipping_zones table (legacy UI)
 * 4) DEFAULT_SHIPPING_CONFIG
 */
export async function resolveShippingConfig(
  db: D1Database | DrizzleD1Database<Record<string, unknown>>,
  storeId: number,
  rawConfig?: string | null | undefined
): Promise<ShippingConfig> {
  // 1) Try unified settings first (single source of truth)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unifiedSettings = await getUnifiedStorefrontSettings(db as any, storeId, {
      enableFallback: true,
    });
    const unifiedShipping = getShippingConfigFromUnified(unifiedSettings);
    return {
      insideDhaka: unifiedShipping.insideDhaka,
      outsideDhaka: unifiedShipping.outsideDhaka,
      freeShippingAbove: unifiedShipping.freeShippingAbove,
      enabled: unifiedShipping.enabled,
    };
  } catch {
    // Fall through to legacy sources
  }

  // 2) Store-level config (legacy)
  if (rawConfig) {
    return parseShippingConfig(rawConfig);
  }

  // 3) Try to infer from shipping zones
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawDb = db as any;
    const zones = await rawDb
      .prepare('SELECT name, rate, free_above, is_active FROM shipping_zones WHERE store_id = ?')
      .bind(storeId)
      .all();

    const activeZones = (
      zones.results as Array<{
        name: string;
        rate: number;
        free_above: number | null;
        is_active: number;
      }>
    ).filter((z) => z.is_active !== 0);

    if (activeZones.length > 0) {
      const isDhaka = (name: string) => /dhaka|ঢাকা/i.test(name);
      const isOutside = (name: string) => /outside|বাইরে|other|non/i.test(name);

      const dhakaZone = activeZones.find((z) => isDhaka(z.name)) || activeZones[0];
      const outsideZone =
        activeZones.find((z) => isOutside(z.name) && !isDhaka(z.name)) ||
        activeZones.find((z) => !isDhaka(z.name)) ||
        dhakaZone;

      const freeAboveCandidates = activeZones.map((z) => z.free_above ?? 0).filter((v) => v > 0);

      const freeShippingAbove =
        freeAboveCandidates.length > 0 ? Math.min(...freeAboveCandidates) : 0;

      return {
        insideDhaka: Number(dhakaZone.rate || DEFAULT_SHIPPING_CONFIG.insideDhaka),
        outsideDhaka: Number(outsideZone.rate || DEFAULT_SHIPPING_CONFIG.outsideDhaka),
        freeShippingAbove,
        enabled: true,
      };
    }
  } catch {
    // ignore and fall back
  }

  // 4) Default
  return DEFAULT_SHIPPING_CONFIG;
}

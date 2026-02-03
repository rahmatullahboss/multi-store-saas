import { eq, and } from 'drizzle-orm';
import { shippingZones } from '@db/schema';
import { DEFAULT_SHIPPING_CONFIG, parseShippingConfig, type ShippingConfig } from '~/utils/shipping';

/**
 * Resolve shipping config for a store.
 *
 * Priority:
 * 1) stores.shippingConfig (single-source of truth)
 * 2) shipping_zones table (legacy UI)
 * 3) DEFAULT_SHIPPING_CONFIG
 */
export async function resolveShippingConfig(
  db: D1Database,
  storeId: number,
  rawConfig: string | null | undefined
): Promise<ShippingConfig> {
  // 1) Store-level config
  if (rawConfig) {
    return parseShippingConfig(rawConfig);
  }

  // 2) Try to infer from shipping zones
  try {
    const zones = await db
      .prepare('SELECT name, rate, free_above, is_active FROM shipping_zones WHERE store_id = ?')
      .bind(storeId)
      .all();

    const activeZones = (zones.results as Array<{
      name: string;
      rate: number;
      free_above: number | null;
      is_active: number;
    }>).filter((z) => z.is_active !== 0);

    if (activeZones.length > 0) {
      const isDhaka = (name: string) =>
        /dhaka|ঢাকা/i.test(name);
      const isOutside = (name: string) =>
        /outside|বাইরে|other|non/i.test(name);

      const dhakaZone =
        activeZones.find((z) => isDhaka(z.name)) || activeZones[0];
      const outsideZone =
        activeZones.find((z) => isOutside(z.name) && !isDhaka(z.name)) ||
        activeZones.find((z) => !isDhaka(z.name)) ||
        dhakaZone;

      const freeAboveCandidates = activeZones
        .map((z) => (z.free_above ?? 0))
        .filter((v) => v > 0);

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

  // 3) Default
  return DEFAULT_SHIPPING_CONFIG;
}

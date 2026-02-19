
import { DEFAULT_SHIPPING_CONFIG, type ShippingConfig } from '~/utils/shipping';
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
 * 2) DEFAULT_SHIPPING_CONFIG (safety fallback only)
 */
export async function resolveShippingConfig(
  db: D1Database | DrizzleD1Database<Record<string, unknown>>,
  storeId: number,
  rawConfig?: string | null | undefined
): Promise<ShippingConfig> {
  void rawConfig;
  // 1) Unified settings only (single source of truth)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unifiedSettings = await getUnifiedStorefrontSettings(db as any, storeId);
    const unifiedShipping = getShippingConfigFromUnified(unifiedSettings);
    return {
      insideDhaka: unifiedShipping.insideDhaka,
      outsideDhaka: unifiedShipping.outsideDhaka,
      freeShippingAbove: unifiedShipping.freeShippingAbove,
      enabled: unifiedShipping.enabled,
    };
  } catch {
    // Fall through to default safety config
  }
  // 2) Default
  return DEFAULT_SHIPPING_CONFIG;
}

/**
 * courier-weight.server.ts
 *
 * Utility for calculating parcel weight for courier bookings.
 *
 * Product weight is stored as a string metafield (e.g. "500g", "1kg", "0.5")
 * in the `metafields` table under namespace="product_details" key="weight".
 *
 * This module parses those strings to numeric kg values and computes the
 * total order weight from order items × product weights.
 *
 * Minimum weight enforced: 0.5 kg (Pathao minimum for standard shipping)
 */

import { and, eq, inArray } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/d1';
import { metafields } from '@db/schema_metafields';

const MIN_WEIGHT_KG = 0.5; // Pathao minimum

/**
 * Parse a weight string to kilograms (numeric).
 *
 * Supported formats:
 *   "500g"   → 0.5
 *   "500 g"  → 0.5
 *   "1kg"    → 1.0
 *   "1.5 kg" → 1.5
 *   "0.5"    → 0.5   (assumed kg if no unit)
 *   "500"    → 0.5   (assumed grams if >= 100 and no unit)
 *
 * Returns null if unparseable.
 */
export function parseWeightToKg(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const str = raw.trim().toLowerCase();

  // Match: optional digits, optional dot, digits, optional whitespace, optional unit
  const match = str.match(/^(\d+(?:\.\d+)?)\s*(kg|g)?$/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2];

  if (isNaN(value) || value <= 0) return null;

  if (unit === 'kg') return value;
  if (unit === 'g') return value / 1000;

  // No unit — heuristic: if >= 100 treat as grams, else as kg
  return value >= 100 ? value / 1000 : value;
}

/**
 * Fetch product weights (in kg) from metafields for a set of product IDs.
 * Returns a Map<productId, weightKg>.
 */
export async function fetchProductWeights(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  productIds: number[]
): Promise<Map<number, number>> {
  const weightMap = new Map<number, number>();

  if (productIds.length === 0) return weightMap;

  const rows = await db
    .select({ ownerId: metafields.ownerId, value: metafields.value })
    .from(metafields)
    .where(
      and(
        eq(metafields.storeId, storeId),
        eq(metafields.ownerType, 'product'),
        eq(metafields.namespace, 'product_details'),
        eq(metafields.key, 'weight'),
        inArray(
          metafields.ownerId,
          productIds.map((id) => String(id))
        )
      )
    );

  for (const row of rows) {
    const productId = parseInt(row.ownerId);
    if (isNaN(productId)) continue;
    const kg = parseWeightToKg(row.value);
    if (kg !== null) {
      weightMap.set(productId, kg);
    }
  }

  return weightMap;
}

/**
 * Calculate total parcel weight (kg) for an order.
 *
 * Each order item contributes: item.quantity × productWeight.
 * Falls back to MIN_WEIGHT_KG (0.5 kg) if no weight data found or
 * if the calculated weight is below the minimum.
 */
export async function calculateOrderWeight(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  items: Array<{ productId: number | null; quantity: number }>
): Promise<number> {
  const validProductIds = items
    .map((i) => i.productId)
    .filter((id): id is number => id !== null && id > 0);

  const weightMap = await fetchProductWeights(db, storeId, validProductIds);

  let totalKg = 0;
  let hasAnyWeight = false;

  for (const item of items) {
    if (!item.productId) continue;
    const productWeight = weightMap.get(item.productId);
    if (productWeight) {
      totalKg += productWeight * item.quantity;
      hasAnyWeight = true;
    }
  }

  // Apply minimum weight
  const finalWeight = hasAnyWeight ? Math.max(totalKg, MIN_WEIGHT_KG) : MIN_WEIGHT_KG;

  // Round to 2 decimal places
  return Math.round(finalWeight * 100) / 100;
}

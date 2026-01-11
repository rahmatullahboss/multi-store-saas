import type { Database } from "../lib/db.server";
import { productRecommendations, products, orders } from "../../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * PRODUCT RECOMMENDATION ENGINE
 * Generates and retrieves product recommendations.
 */

export async function getRecommendedProducts(db: Database, storeId: number, productId: number, limit = 4) {
  // 1. Try to get cached recommendations
  const cached = await db.query.productRecommendations.findMany({
    where: and(
      eq(productRecommendations.storeId, storeId),
      eq(productRecommendations.sourceProductId, productId)
    ),
    orderBy: [desc(productRecommendations.score)],
    limit: limit,
    with: {
      recommendedProduct: true
    }
  });

  if (cached.length >= limit) {
    return cached.map(c => c.recommendedProduct);
  }

  // 2. Fallback: Find products in same category
  const sourceProduct = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { category: true }
  });

  if (!sourceProduct || !sourceProduct.category) return [];

  const similar = await db.query.products.findMany({
    where: and(
      eq(products.storeId, storeId),
      eq(products.category, sourceProduct.category),
      sql`id != ${productId}`
    ),
    limit: limit - cached.length,
    orderBy: [desc(products.createdAt)]
  });

  // Combine cached and similar
  const combined = [
    ...cached.map(c => c.recommendedProduct),
    ...similar
  ];

  return combined;
}

/**
 * GENI (Generate) Recommendations
 * Run this periodically or after orders to update affinity scores.
 * Currently implements "Bought Together" logic.
 */
export async function generateRecommendations(db: Database, storeId: number) {
  // 1. Find pairs of products bought in same order
  // This is a simplified "frequent pattern mining" query
  
  // Get all order items for this store from last 1000 orders to avoid heavy load
  const recentOrders = await db.query.orders.findMany({
    where: eq(orders.storeId, storeId),
    limit: 1000,
    orderBy: [desc(orders.createdAt)],
    with: {
      items: true
    }
  });

  const pairCounts = new Map<string, number>();

  for (const order of recentOrders) {
    if (order.items.length < 2) continue;
    
    // Create pairs
    for (let i = 0; i < order.items.length; i++) {
      for (let j = i + 1; j < order.items.length; j++) {
        const p1 = order.items[i].productId;
        const p2 = order.items[j].productId;
        if (!p1 || !p2) continue;

        // Ensure consistent key (min_id:max_id)
        const key = p1 < p2 ? `${p1}:${p2}` : `${p2}:${p1}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  }

  // 2. Update database
  const validPairs = Array.from(pairCounts.entries())
    .filter(([_, count]) => count > 1) // Only pairs bought together > 1 time
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 50); // Top 50 associations

  for (const [key, count] of validPairs) {
    const [id1Str, id2Str] = key.split(':');
    const id1 = parseInt(id1Str);
    const id2 = parseInt(id2Str);
    const score = Math.min(count * 0.1, 1.0); // Normalize score roughly

    // Insert both directions
    await db.insert(productRecommendations).values([
      {
        storeId,
        sourceProductId: id1,
        recommendedProductId: id2,
        score,
        reason: 'bought_together'
      },
      {
        storeId,
        sourceProductId: id2,
        recommendedProductId: id1,
        score,
        reason: 'bought_together'
      }
    ]).onConflictDoUpdate({
      target: [productRecommendations.storeId, productRecommendations.sourceProductId, productRecommendations.recommendedProductId],
      set: { score, reason: 'bought_together' }
    });
  }
}

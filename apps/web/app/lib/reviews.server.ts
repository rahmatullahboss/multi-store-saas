/**
 * Review Stats Utility
 *
 * Shared functions for fetching product review statistics.
 * Used by storefront routes to display aggregate ratings on product cards.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, inArray, and } from 'drizzle-orm';
import { reviews } from '@db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Minimum comment length for reviews */
export const REVIEW_MIN_LENGTH = 10;

/** Maximum comment length for reviews */
export const REVIEW_MAX_LENGTH = 1000;

/** Reviews cache TTL in seconds (5 minutes) */
export const REVIEW_STATS_CACHE_TTL = 300;

// ============================================================================
// TYPES
// ============================================================================

export interface ReviewStats {
  avgRating: number;
  reviewCount: number;
}

export type ReviewStatsMap = Record<number, ReviewStats>;

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Fetch aggregate review statistics for multiple products.
 * Only fetches approved reviews.
 *
 * @param db - Drizzle database instance
 * @param storeId - Store ID for tenant isolation
 * @param productIds - Array of product IDs to fetch stats for
 * @returns Map of productId -> { avgRating, reviewCount }
 */
export async function getProductReviewStats(
  db: any,
  storeId: number,
  productIds: number[]
): Promise<ReviewStatsMap> {
  // Early return if no products
  if (productIds.length === 0) {
    return {};
  }

  try {
    // Use Drizzle's inArray for proper SQL IN clause
    const ratingResults = await db
      .select({
        productId: reviews.productId,
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
        reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.storeId, storeId),
          eq(reviews.status, 'approved'),
          inArray(reviews.productId, productIds)
        )
      )
      .groupBy(reviews.productId);

    // Process results
    const stats: ReviewStatsMap = {};
    for (const r of ratingResults) {
      stats[r.productId] = {
        avgRating: Math.round(Number(r.avgRating) * 10) / 10,
        reviewCount: Number(r.reviewCount),
      };
    }
    return stats;
  } catch (error) {
    // Log error but don't crash the page
    console.error('Failed to fetch review stats:', error);
    return {};
  }
}

/**
 * Add review stats to products array.
 *
 * @param products - Array of products
 * @param reviewStats - Review stats map from getProductReviewStats
 * @returns Products with avgRating and reviewCount fields added
 */
export function addReviewStatsToProducts<T extends { id: number }>(
  products: T[],
  reviewStats: ReviewStatsMap
): (T & { avgRating: number | null; reviewCount: number })[] {
  return products.map((product) => ({
    ...product,
    avgRating: reviewStats[product.id]?.avgRating ?? null,
    reviewCount: reviewStats[product.id]?.reviewCount ?? 0,
  }));
}

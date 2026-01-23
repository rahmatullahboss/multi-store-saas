/**
 * SaaS Coupon Validation Service
 * 
 * Handles validation and discount calculation for platform subscription coupons.
 * These coupons are for SaaS plan fees, NOT for products inside user stores.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { saasCoupons } from '@db/schema';
import type { SaasCoupon } from '@db/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface CouponValidationResult {
  valid: boolean;
  coupon?: SaasCoupon;
  error?: string;
  errorCode?: 'INVALID' | 'EXPIRED' | 'MAX_USES' | 'INACTIVE';
}

export interface DiscountResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountLabel: string; // e.g., "50% off" or "৳500 off"
}

// ============================================================================
// VALIDATE COUPON
// ============================================================================

/**
 * Validates a coupon code and returns the coupon if valid
 */
export async function validateSaasCoupon(
  dbBinding: D1Database,
  code: string
): Promise<CouponValidationResult> {
  if (!code || code.trim() === '') {
    return { valid: false, error: 'Please enter a coupon code', errorCode: 'INVALID' };
  }

  const db = drizzle(dbBinding);
  const normalizedCode = code.trim().toUpperCase();

  // Find coupon by code
  const result = await db
    .select()
    .from(saasCoupons)
    .where(eq(saasCoupons.code, normalizedCode))
    .limit(1);

  const coupon = result[0];

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code', errorCode: 'INVALID' };
  }

  // Check if active
  if (!coupon.isActive) {
    return { valid: false, error: 'This coupon is no longer active', errorCode: 'INACTIVE' };
  }

  // Check expiry
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'This coupon has expired', errorCode: 'EXPIRED' };
  }

  // Check max uses
  if (coupon.maxUses !== null && (coupon.usedCount ?? 0) >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its usage limit', errorCode: 'MAX_USES' };
  }

  return { valid: true, coupon };
}

// ============================================================================
// CALCULATE DISCOUNT
// ============================================================================

/**
 * Calculates the discounted price based on coupon
 */
export function applyCouponDiscount(
  planPrice: number,
  coupon: SaasCoupon
): DiscountResult {
  let discountAmount: number;
  let discountLabel: string;

  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round(planPrice * (coupon.discountAmount / 100));
    discountLabel = `${coupon.discountAmount}% off`;
  } else {
    // Fixed discount
    discountAmount = Math.min(coupon.discountAmount, planPrice);
    discountLabel = `৳${coupon.discountAmount} off`;
  }

  const finalPrice = Math.max(0, planPrice - discountAmount);

  return {
    originalPrice: planPrice,
    discountAmount,
    finalPrice,
    discountLabel,
  };
}

// ============================================================================
// INCREMENT USAGE
// ============================================================================

/**
 * Increments the used count of a coupon after successful payment
 */
export async function incrementCouponUsage(
  dbBinding: D1Database,
  couponId: number
): Promise<void> {
  const db = drizzle(dbBinding);

  const result = await db
    .select({ usedCount: saasCoupons.usedCount })
    .from(saasCoupons)
    .where(eq(saasCoupons.id, couponId))
    .limit(1);

  const currentCount = result[0]?.usedCount ?? 0;

  await db
    .update(saasCoupons)
    .set({ usedCount: currentCount + 1 })
    .where(eq(saasCoupons.id, couponId));
}

// ============================================================================
// GET ALL COUPONS (Admin)
// ============================================================================

/**
 * Get all coupons for admin management
 */
export async function getAllSaasCoupons(
  dbBinding: D1Database
): Promise<SaasCoupon[]> {
  const db = drizzle(dbBinding);

  const coupons = await db
    .select()
    .from(saasCoupons)
    .orderBy(saasCoupons.createdAt);

  return coupons;
}

// ============================================================================
// CREATE COUPON (Admin)
// ============================================================================

export interface CreateCouponInput {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
}

/**
 * Create a new SaaS coupon
 */
export async function createSaasCoupon(
  dbBinding: D1Database,
  input: CreateCouponInput
): Promise<{ success: boolean; coupon?: SaasCoupon; error?: string }> {
  const db = drizzle(dbBinding);
  const normalizedCode = input.code.trim().toUpperCase();

  // Check if code already exists
  const existing = await db
    .select({ id: saasCoupons.id })
    .from(saasCoupons)
    .where(eq(saasCoupons.code, normalizedCode))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: 'Coupon code already exists' };
  }

  // Validate discount amount
  if (input.discountType === 'percentage' && (input.discountAmount < 1 || input.discountAmount > 100)) {
    return { success: false, error: 'Percentage discount must be between 1 and 100' };
  }

  if (input.discountAmount <= 0) {
    return { success: false, error: 'Discount amount must be greater than 0' };
  }

  // Insert coupon
  const result = await db
    .insert(saasCoupons)
    .values({
      code: normalizedCode,
      discountType: input.discountType,
      discountAmount: input.discountAmount,
      maxUses: input.maxUses ?? null,
      expiresAt: input.expiresAt ?? null,
      isActive: true,
      usedCount: 0,
    })
    .returning();

  return { success: true, coupon: result[0] };
}

// ============================================================================
// DELETE COUPON (Admin)
// ============================================================================

/**
 * Delete a coupon by ID
 */
export async function deleteSaasCoupon(
  dbBinding: D1Database,
  couponId: number
): Promise<{ success: boolean; error?: string }> {
  const db = drizzle(dbBinding);

  await db
    .delete(saasCoupons)
    .where(eq(saasCoupons.id, couponId));

  return { success: true };
}

// ============================================================================
// TOGGLE COUPON STATUS (Admin)
// ============================================================================

/**
 * Toggle a coupon's active status
 */
export async function toggleCouponStatus(
  dbBinding: D1Database,
  couponId: number
): Promise<{ success: boolean; isActive?: boolean }> {
  const db = drizzle(dbBinding);

  const result = await db
    .select({ isActive: saasCoupons.isActive })
    .from(saasCoupons)
    .where(eq(saasCoupons.id, couponId))
    .limit(1);

  if (result.length === 0) {
    return { success: false };
  }

  const newStatus = !result[0].isActive;

  await db
    .update(saasCoupons)
    .set({ isActive: newStatus })
    .where(eq(saasCoupons.id, couponId));

  return { success: true, isActive: newStatus };
}

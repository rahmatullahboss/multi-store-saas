import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gt, lt, isNull, or, desc } from 'drizzle-orm';
import { discounts } from '@db/schema';

export type DiscountResult = {
  isValid: boolean;
  error?: string;
  discount?: {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    amount: number; // Calculated discount amount
  };
};

export async function getActiveFlashSale(
  db: ReturnType<typeof drizzle>,
  storeId: number
) {
  const now = new Date();
  
  return db
    .select()
    .from(discounts)
    .where(
      and(
        eq(discounts.storeId, storeId),
        eq(discounts.isActive, true),
        eq(discounts.isFlashSale, true),
        lt(discounts.startsAt, now),
        gt(discounts.flashSaleEndTime, now)
      )
    )
    .orderBy(desc(discounts.value)) // Best discount first
    .limit(1)
    .get();
}

export async function validateDiscount(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  code: string,
  cartTotal: number,
  customerEmail?: string
): Promise<DiscountResult> {
  const discount = await db
    .select()
    .from(discounts)
    .where(
      and(
        eq(discounts.storeId, storeId),
        eq(discounts.code, code),
        eq(discounts.isActive, true)
      )
    )
    .get();

  if (!discount) {
    return { isValid: false, error: 'Invalid discount code' };
  }

  const now = new Date();

  // 1. Check Expiry
  if (discount.startsAt && discount.startsAt > now) {
    return { isValid: false, error: 'Discount not yet active' };
  }
  if (discount.expiresAt && discount.expiresAt < now) {
    return { isValid: false, error: 'Discount expired' };
  }

  // 2. Check Usage Limits (Global)
  if (discount.maxUses && (discount.usedCount || 0) >= discount.maxUses) {
    return { isValid: false, error: 'Discount usage limit reached' };
  }

  // 3. Check Minimum Order Amount
  if (discount.minOrderAmount && cartTotal < discount.minOrderAmount) {
    return { isValid: false, error: `Minimum order amount ${discount.minOrderAmount} required` };
  }

  // 4. Calculate Amount
  let amount = 0;
  if (discount.type === 'percentage') {
    amount = (cartTotal * discount.value) / 100;
    if (discount.maxDiscountAmount && amount > discount.maxDiscountAmount) {
      amount = discount.maxDiscountAmount;
    }
  } else {
    amount = discount.value;
  }

  // Ensure discount doesn't exceed total
  if (amount > cartTotal) {
    amount = cartTotal;
  }

  return {
    isValid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discount.type as 'percentage' | 'fixed',
      value: discount.value,
      amount: Math.floor(amount), // Round down for simplicity (or use 2 decimals)
    },
  };
}

export async function incrementDiscountUsage(
  db: ReturnType<typeof drizzle>,
  discountId: number
) {
  // Simple increment, concurrency might be an issue but acceptable for this scale
  const discount = await db.select().from(discounts).where(eq(discounts.id, discountId)).get();
  if (discount) {
    await db.update(discounts)
      .set({ usedCount: (discount.usedCount || 0) + 1 })
      .where(eq(discounts.id, discountId));
  }
}

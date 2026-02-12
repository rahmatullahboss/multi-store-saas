import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gt, lt, desc, or, sql } from 'drizzle-orm';
import { discounts, orders } from '@db/schema';

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
  customerContact?: string
): Promise<DiscountResult> {
  const normalizedCode = code.trim().toUpperCase();

  const discount = await db
    .select()
    .from(discounts)
    .where(
      and(
        eq(discounts.storeId, storeId),
        eq(discounts.code, normalizedCode),
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

  // 4. Check Per-Customer Limit
  if (discount.perCustomerLimit && discount.perCustomerLimit > 0 && customerContact) {
    const usage = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          or(eq(orders.customerPhone, customerContact), eq(orders.customerEmail, customerContact)),
          sql`json_extract(${orders.pricingJson}, '$.couponCode') = ${discount.code}`
        )
      )
      .get();

    if ((usage?.count ?? 0) >= discount.perCustomerLimit) {
      return { isValid: false, error: 'Per-customer usage limit reached' };
    }
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
  storeId: number,
  discountId: number
) {
  const result = await db
    .update(discounts)
    .set({
      usedCount: sql`coalesce(${discounts.usedCount}, 0) + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(discounts.id, discountId),
        eq(discounts.storeId, storeId),
        eq(discounts.isActive, true),
        sql`(${discounts.maxUses} is null or coalesce(${discounts.usedCount}, 0) < ${discounts.maxUses})`
      )
    )
    .returning({ id: discounts.id });

  return result.length > 0;
}

export async function decrementDiscountUsage(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  discountId: number
) {
  await db
    .update(discounts)
    .set({
      usedCount: sql`max(coalesce(${discounts.usedCount}, 0) - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(and(eq(discounts.id, discountId), eq(discounts.storeId, storeId)));
}

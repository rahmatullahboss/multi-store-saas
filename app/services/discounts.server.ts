import type { Database } from "../lib/db.server";
import { discounts, customers } from "../../db/schema";
import { eq, and, gte, lt, or, isNull } from "drizzle-orm";

export type ValidationResult = 
  | { valid: true; discountAmount: number; discountType: 'percentage' | 'fixed'; appliedCode: string }
  | { valid: false; error: string };

export async function validateDiscount(
  db: Database,
  storeId: number, 
  code: string, 
  subtotal: number,
  userId?: number
): Promise<ValidationResult> {
  const normalizedCode = code.toUpperCase().trim();
  
  const discount = await db.query.discounts.findFirst({
    where: and(
        eq(discounts.storeId, storeId),
        eq(discounts.code, normalizedCode),
        eq(discounts.isActive, true)
    )
  });
// ... rest of function ...
  if (!discount) {
    return { valid: false, error: 'invalidCode' };
  }

  // 1. Expiry Check
  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    return { valid: false, error: 'codeExpired' };
  }

  // 2. Usage Limit Check
  if (discount.maxUses && (discount.usedCount || 0) >= discount.maxUses) {
    return { valid: false, error: 'codeUsageLimitReached' };
  }

  // 3. Minimum Order Check
  if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
    return { valid: false, error: 'minOrderAmountNotMet' };
  }

  // 3.5 Smart Discount Logic (Segment Based)
  if (discount.ruleType === 'segment') {
      if (!userId) return { valid: false, error: 'loginRequiredForVip' };
      
      const customer = await db.query.customers.findFirst({
          where: eq(customers.id, userId),
          columns: { segment: true, loyaltyTier: true }
      });

      // Assumption: Segment rules apply to VIPs or Gold/Platinum members
      const isEligible = customer?.segment === 'vip' || 
                         customer?.loyaltyTier === 'gold' || 
                         customer?.loyaltyTier === 'platinum';
                         
      if (!isEligible) {
          return { valid: false, error: 'customerNotEligible' };
      }
  }

  // 4. Calculate Amount
  let amount = 0;
  if (discount.type === 'percentage') {
    amount = subtotal * (discount.value / 100);
    if (discount.maxDiscountAmount && amount > discount.maxDiscountAmount) {
      amount = discount.maxDiscountAmount;
    }
  } else {
    amount = discount.value;
  }

  // Ensure we don't discount more than subtotal
  amount = Math.min(amount, subtotal);

  return {
    valid: true,
    discountAmount: amount,
    discountType: discount.type as 'percentage' | 'fixed',
    appliedCode: discount.code
  };
}

export async function incrementDiscountUsage(db: Database, storeId: number, code: string) {
    const discount = await db.query.discounts.findFirst({
        where: and(eq(discounts.storeId, storeId), eq(discounts.code, code))
    });

    if (discount) {
        await db.update(discounts)
            .set({ 
                usedCount: (discount.usedCount || 0) + 1,
                updatedAt: new Date()
            })
            .where(eq(discounts.id, discount.id));
    }
}

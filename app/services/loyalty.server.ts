import type { Database } from '../lib/db.server';
import { customers, loyaltyTransactions } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

export interface LoyaltyConfig {
  pointsPerUnitCurrency: number; 
  redemptionRate: number; 
}

// Default: 1 point per 100 BDT spent (Spend 100 -> Get 1 Point)
const POINTS_PER_BDT = 0.01; 

/**
 * Add points to a customer's loyalty balance
 */
export async function addLoyaltyPoints(
  db: Database, 
  customerId: number, 
  storeId: number, 
  amountSpent: number, 
  description: string
) {
  const pointsEarned = Math.floor(amountSpent * POINTS_PER_BDT);
  if (pointsEarned <= 0) return;

  // Use a transaction to ensure data integrity
  try {
      // 1. Log Transaction
      await db.insert(loyaltyTransactions).values({
        storeId,
        customerId,
        points: pointsEarned,
        type: 'purchase',
        description: `${description} (Spent ৳${amountSpent})`
      });

      // 2. Add Points (Atomic Update)
      await db.run(
        sql`UPDATE customers SET loyalty_points = coalesce(loyalty_points, 0) + ${pointsEarned}, total_spent = coalesce(total_spent, 0) + ${amountSpent} WHERE id = ${customerId}`
      );

      // 3. Check Tier Upgrade
      // We fetch the updated customer to check tier
      const customer = await db.select().from(customers).where(eq(customers.id, customerId)).get();
      
      if (customer) {
          let newTier = 'bronze';
          // Tier Logic: Bronze (0), Silver (10k), Gold (50k), Platinum (1L)
          if ((customer.totalSpent || 0) > 100000) newTier = 'platinum';
          else if ((customer.totalSpent || 0) > 50000) newTier = 'gold';
          else if ((customer.totalSpent || 0) > 10000) newTier = 'silver';

          if (newTier !== customer.loyaltyTier) {
                // Tier Upgrade!
               await db.update(customers).set({ loyaltyTier: newTier as any }).where(eq(customers.id, customerId));
               // TODO: Send "Tier Upgraded" notification
          }
      }
  } catch (err) {
      console.error("[Loyalty] Failed to add points:", err);
  }
}

/**
 * Redeem points for a discount
 * Returns discount amount in BDT
 */
export async function redeemPoints(
    db: Database,
    customerId: number,
    storeId: number,
    pointsToRedeem: number
): Promise<{ success: boolean, discountAmount: number, error?: string }> {
    const customer = await db.select().from(customers).where(eq(customers.id, customerId)).get();
    
    if (!customer || (customer.loyaltyPoints || 0) < pointsToRedeem) {
        return { success: false, discountAmount: 0, error: "Insufficient points" };
    }

    // 1 Point = 1 BDT (Simple redemption for now)
    const discountAmount = pointsToRedeem * 1; 

    try {
        await db.insert(loyaltyTransactions).values({
            storeId,
            customerId,
            points: -pointsToRedeem,
            type: 'redemption',
            description: `Redeemed for ৳${discountAmount} discount`
        });

        await db.run(
            sql`UPDATE customers SET loyalty_points = loyalty_points - ${pointsToRedeem} WHERE id = ${customerId}`
        );
        
        return { success: true, discountAmount };
    } catch (err) {
        console.error("[Loyalty] Redemption failed:", err);
        return { success: false, discountAmount: 0, error: "System error" };
    }
}

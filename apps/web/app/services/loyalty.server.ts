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
 * TIER MULTIPLIERS
 * Bronze: 1x
 * Silver: 1.2x (Spend > 10,000)
 * Gold: 1.5x (Spend > 50,000)
 * Platinum: 2x (Spend > 100,000)
 */
const TIER_MULTIPLIERS = {
  bronze: 1,
  silver: 1.2,
  gold: 1.5,
  platinum: 2
};

/**
 * Add points to a customer's loyalty balance with Tier Multiplier
 */
export async function addLoyaltyPoints(
  db: Database, 
  customerId: number, 
  storeId: number, 
  amountSpent: number, 
  description: string
) {
  // 1. Get Customer for Tier
  const customer = await db.select().from(customers).where(eq(customers.id, customerId)).get();
  if (!customer) return;

  // 2. Calculate Points with Multiplier
  const currentTier = (customer.loyaltyTier || 'bronze') as keyof typeof TIER_MULTIPLIERS;
  const multiplier = TIER_MULTIPLIERS[currentTier] || 1;
  const basePoints = Math.floor(amountSpent * POINTS_PER_BDT);
  const pointsEarned = Math.floor(basePoints * multiplier);

  if (pointsEarned <= 0) return;

  try {
      // 3. Log Transaction
      await db.insert(loyaltyTransactions).values({
        storeId,
        customerId,
        points: pointsEarned,
        type: 'purchase',
        description: `${description} (Spent ৳${amountSpent} @ ${multiplier}x)`
      });

      // 4. Add Points & Update Spend (Atomic Update)
      await db.run(
        sql`UPDATE customers SET loyalty_points = coalesce(loyalty_points, 0) + ${pointsEarned}, total_spent = coalesce(total_spent, 0) + ${amountSpent} WHERE id = ${customerId}`
      );

      // 5. Check and Process Tier Upgrade
      await checkAndProcessTierUpgrade(db, customerId, (customer.totalSpent || 0) + amountSpent);

      // 6. Process Referral Bonus (if applicable)
      // Check if this is their FIRST order (totalOrders was 0 before this transaction, theoretically)
      // Since we just updated totalSpent but not totalOrders yet (usually done in order creation), we check strictly
      if (customer.referredBy && (customer.totalOrders || 0) === 0) {
          // First order bonus for referrer
          await addReferralBonus(db, customer.referredBy, storeId, pointsEarned);
      }

  } catch (err) {
      console.error("[Loyalty] Failed to add points:", err);
  }
}

/**
 * Check if customer qualifies for a higher tier
 */
async function checkAndProcessTierUpgrade(db: Database, customerId: number, newTotalSpent: number) {
    let newTier = 'bronze';
    // Research Paper Thresholds:
    // Platinum: 10000+
    // Gold: 5000-9999
    // Silver: 1000-4999
    // Bronze: 0-999
    if (newTotalSpent >= 10000) newTier = 'platinum';
    else if (newTotalSpent >= 5000) newTier = 'gold';
    else if (newTotalSpent >= 1000) newTier = 'silver';

    // We need to re-fetch to compare with current stored tier
    const customer = await db.select({ loyaltyTier: customers.loyaltyTier }).from(customers).where(eq(customers.id, customerId)).get();
    
    if (customer && customer.loyaltyTier !== newTier) {
        await db.update(customers).set({ loyaltyTier: newTier as any }).where(eq(customers.id, customerId));
        // TODO: Trigger Notification: "You reached Gold Tier!"
        // [SKIPPED] Complex: requires a notification system/table
        console.log(`[Loyalty] Customer ${customerId} upgraded to ${newTier}`);
    }
}

/**
 * Award Bonus Points to Referrer
 */
async function addReferralBonus(db: Database, referrerId: number, storeId: number, refereePointsEarned: number) {
    // Referrer gets 50% of referee's first earning (example rule)
    const bonusPoints = Math.floor(refereePointsEarned * 0.5); 
    if (bonusPoints <= 0) return;

    try {
        await db.insert(loyaltyTransactions).values({
            storeId,
            customerId: referrerId,
            points: bonusPoints,
            type: 'referral', // Corrected from 'referral_bonus'
            description: `Referral Bonus for new friend purchase`
        });

        await db.run(
             sql`UPDATE customers SET loyalty_points = coalesce(loyalty_points, 0) + ${bonusPoints} WHERE id = ${referrerId}`
        );
    } catch (err) {
        console.error("[Loyalty] Failed to add referral bonus:", err);
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

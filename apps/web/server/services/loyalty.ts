import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql } from 'drizzle-orm';
import { customers, loyaltyTransactions, stores } from '@db/schema';

export type LoyaltyConfig = {
  pointsRate: number; // e.g., 0.01 for 1 point per 100 BDT
  tiers: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  referralReward: number; // Points for referrer
};

const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  pointsRate: 0.01,
  tiers: {
    bronze: 0,
    silver: 10000,
    gold: 50000,
    platinum: 100000,
  },
  referralReward: 50,
};

export async function getLoyaltyConfig(
  db: ReturnType<typeof drizzle>,
  storeId: number
): Promise<LoyaltyConfig> {
  const store = await db
    .select({ loyaltyConfig: stores.loyaltyConfig })
    .from(stores)
    .where(eq(stores.id, storeId))
    .get();

  if (store?.loyaltyConfig) {
    try {
      return { ...DEFAULT_LOYALTY_CONFIG, ...JSON.parse(store.loyaltyConfig) };
    } catch (e) {
      console.error('Failed to parse loyalty config', e);
    }
  }
  return DEFAULT_LOYALTY_CONFIG;
}

export async function awardPoints(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  customerId: number,
  points: number,
  type: typeof loyaltyTransactions.$inferSelect['type'],
  referenceId: string | undefined,
  description: string
) {
  if (points === 0) return;

  await db.transaction(async (tx) => {
    // 1. Create Transaction Record
    await tx.insert(loyaltyTransactions).values({
      storeId,
      customerId,
      points,
      type,
      referenceId,
      description,
      createdAt: new Date(),
    });

    // 2. Update Customer Balance
    await tx
      .update(customers)
      .set({
        loyaltyPoints: sql`COALESCE(${customers.loyaltyPoints}, 0) + ${points}`,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));

    // 3. Check Tier Upgrade
    await checkAndUpgradeTier(tx, storeId, customerId);
  });
}

// Accepts transaction or main db instance. Using standard Drizzle type for flexibility.
export async function checkAndUpgradeTier(
  db: any, 
  storeId: number,
  customerId: number
) {
  const customer = await db
    .select({ totalSpent: customers.totalSpent, loyaltyTier: customers.loyaltyTier })
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
    .get();

  if (!customer) return;

  const config = await getLoyaltyConfig(db as any, storeId); // careful with tx casting if nested
  const spent = customer.totalSpent || 0;
  let newTier = 'bronze';

  if (spent >= config.tiers.platinum) newTier = 'platinum';
  else if (spent >= config.tiers.gold) newTier = 'gold';
  else if (spent >= config.tiers.silver) newTier = 'silver';

  if (newTier !== customer.loyaltyTier) {
    await db
      .update(customers)
      .set({ loyaltyTier: newTier as any, updatedAt: new Date() })
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));
    
    // TODO: Send tier upgrade notification via MessagingService
    console.warn(`[Loyalty] Customer ${customerId} upgraded to ${newTier}`);
  }
}

export async function processOrderLoyalty(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  orderId: number,
  amount: number,
  customerId: number
) {
  const config = await getLoyaltyConfig(db, storeId);
  const points = Math.floor(amount * config.pointsRate);

  if (points > 0) {
    await awardPoints(
      db,
      storeId,
      customerId,
      points,
      'purchase',
      orderId.toString(),
      `Points calculated on order #${orderId}`
    );
  }
}

export async function processReferralReward(
    db: ReturnType<typeof drizzle>,
    storeId: number,
    newCustomerId: number,
    referrerId: number
) {
    const config = await getLoyaltyConfig(db, storeId);
    
    // Avoid duplicate reward
    const existing = await db.select().from(loyaltyTransactions).where(
        and(
            eq(loyaltyTransactions.storeId, storeId),
            eq(loyaltyTransactions.type, 'referral'),
            eq(loyaltyTransactions.referenceId, newCustomerId.toString()) // Ref ID is new customer
        )
    ).get();

    if (existing) return;

    await awardPoints(
        db,
        storeId,
        referrerId,
        config.referralReward,
        'referral',
        newCustomerId.toString(),
        `Reward for referring customer #${newCustomerId}`
    );
}

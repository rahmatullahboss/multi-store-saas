import { eq, sql, desc } from 'drizzle-orm';
import { stores, creditUsageLogs } from '@db/schema';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

// Credit costs for various AI actions
export const CREDIT_COSTS = {
  SETUP_STORE: 30, // Lower barrier to entry
  GENERATE_PAGE: 15,
  GENERATE_FULL_PAGE: 20,
  EDIT_SECTION: 5,
  ENHANCE_TEXT: 1, // Cheap for quick edits
  AI_CHAT_MESSAGE: 1, // Cheapest (High volume)
  GENERATE_ELEMENTOR_PAGE: 20,
  EDIT_ELEMENTOR_SECTION: 5,
  GENERATE_GRAPESJS_PAGE: 20,
  DESIGN_CUSTOM_SECTION: 8,
  DESIGN_STORE_THEME: 15,
  CHAT_COMMAND: 2,
  STORE_EDITOR_COMMAND: 5,
};

export type AIFeatureName = keyof typeof CREDIT_COSTS;

/**
 * Check if a store has enough credits for a feature
 */
export async function checkCredits(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  cost: number
): Promise<{ allowed: boolean; currentBalance: number; error?: string }> {
  try {
    const results = await db
      .select({ aiCredits: stores.aiCredits })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    const result = results[0];

    if (!result) {
      return { allowed: false, currentBalance: 0, error: 'Store not found' };
    }

    const currentBalance = result.aiCredits || 0;

    if (currentBalance < cost) {
      return {
        allowed: false,
        currentBalance,
        error: `Insufficient credits. Required: ${cost}, Available: ${currentBalance}`,
      };
    }

    return { allowed: true, currentBalance };
  } catch (error) {
    console.error('[Credit Check] Error:', error);
    return { allowed: false, currentBalance: 0, error: 'Failed to check credits' };
  }
}

/**
 * Deduct credits from a store and log usage
 */
export async function deductCredits(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  cost: number,
  description: string = 'AI Feature Usage',
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const result = await db
      .update(stores)
      .set({
        aiCredits: sql`${stores.aiCredits} - ${cost}`,
        updatedAt: new Date(),
      })
      .where(sql`${stores.id} = ${storeId} AND ${stores.aiCredits} >= ${cost}`)
      .run();

    if (result.meta.changes === 0) {
      const currentResults = await db
        .select({ aiCredits: stores.aiCredits })
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);
      const current = currentResults[0];
        
      if (!current) {
        return { success: false, newBalance: 0, error: 'Store not found' };
      }
      return { success: false, newBalance: current.aiCredits || 0, error: 'Insufficient credits or update failed' };
    }

    // Log Usage
    await db.insert(creditUsageLogs).values({
      storeId,
      amount: -cost,
      type: 'usage',
      description,
      metadata: JSON.stringify(metadata),
    });

    const updatedResults = await db
      .select({ aiCredits: stores.aiCredits })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);
    const updated = updatedResults[0];

    return { success: true, newBalance: updated?.aiCredits || 0 };
  } catch (error) {
    console.error('[Deduct Credits] Error:', error);
    return { success: false, newBalance: 0, error: 'Failed to deduct credits' };
  }
}

/**
 * Add credits to a store and log transaction
 */
export async function addCredits(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund' | 'adjustment' = 'purchase',
  description: string = 'Added credits'
): Promise<{ success: boolean; newBalance: number }> {
  try {
    await db
      .update(stores)
      .set({
        aiCredits: sql`${stores.aiCredits} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId))
      .run();

    // Log Transaction
    await db.insert(creditUsageLogs).values({
      storeId,
      amount: amount,
      type,
      description,
    });

    const updatedResults = await db
      .select({ aiCredits: stores.aiCredits })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);
    const updated = updatedResults[0];

    return { success: true, newBalance: updated?.aiCredits || 0 };
  } catch (error) {
    console.error('[Add Credits] Error:', error);
    return { success: false, newBalance: 0 };
  }
}

export async function getCreditHistory(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  limit: number = 20
) {
  return await db
    .select()
    .from(creditUsageLogs)
    .where(eq(creditUsageLogs.storeId, storeId))
    .orderBy(desc(creditUsageLogs.createdAt))
    .limit(limit);
}

import { redirect } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import type { AppLoadContext } from 'react-router';
import { isSubscriptionExpired } from '~/lib/plan-gate.server';
import type { PlanType } from '~/utils/plans.server';

/**
 * Check if store has storeEnabled=true
 * If not, redirect to Homepage Settings with a prompt to enable store
 * 
 * Usage in loader:
 * await requireStoreEnabled(storeId, context);
 */
export async function requireStoreEnabled(
  storeId: number,
  context: AppLoadContext,
  redirectTo = '/app/settings/homepage?enable_store=1'
): Promise<void> {
  const db = drizzle(context.cloudflare.env.DB);
  
  const result = await db
    .select({ storeEnabled: stores.storeEnabled })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = result[0];
  
  if (!store || store.storeEnabled === false) {
    throw redirect(redirectTo);
  }
}

/**
 * Get store's storeEnabled status
 * Useful for components that need to conditionally render based on store status
 */
export async function getStoreEnabled(
  storeId: number,
  context: AppLoadContext
): Promise<boolean> {
  const db = drizzle(context.cloudflare.env.DB);
  
  const result = await db
    .select({ storeEnabled: stores.storeEnabled })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return result[0]?.storeEnabled ?? true;
}

/**
 * requireActiveSubscription — throws a redirect to /app/upgrade if the
 * store's paid subscription has expired.
 *
 * Reads `planType` and `subscriptionEndDate` from the DB in one query.
 * Free plans are always considered active and never redirect.
 *
 * Usage in loader:
 *   await requireActiveSubscription(storeId, context);
 */
export async function requireActiveSubscription(
  storeId: number,
  context: AppLoadContext,
  upgradeRedirect = '/app/upgrade'
): Promise<void> {
  const db = drizzle(context.cloudflare.env.DB);

  const result = await db
    .select({
      planType: stores.planType,
      subscriptionEndDate: stores.subscriptionEndDate,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = result[0];
  if (!store) return; // store not found — let other guards handle it

  const planType = (store.planType as PlanType) || 'free';

  if (isSubscriptionExpired(planType, store.subscriptionEndDate ?? null)) {
    throw redirect(`${upgradeRedirect}?reason=expired&plan=${planType}`);
  }
}

/**
 * Plan Gate Helpers
 *
 * Throwing helpers that enforce plan limits and feature flags inside
 * Remix loaders and actions.  All functions throw a Remix redirect or
 * a 402 Response on failure — they never return on error.
 *
 * Design principles:
 *   - Fail-closed: unknown plan → treated as 'free'
 *   - One import path: always use these helpers instead of ad-hoc plan checks
 *   - Composable: combine with requireTenant from tenant-guard.server.ts
 *
 * Usage examples:
 *
 *   import { requirePlanFeature, requireMinPlan, assertWithinLimit } from '~/lib/plan-gate.server';
 *
 *   // Inside a loader/action after requireTenant:
 *   requirePlanFeature(planType, 'allow_custom_domain');          // custom domain page
 *   requireMinPlan(planType, 'starter');                          // starter+ only
 *   await assertWithinLimit(db, storeId, planType, 'product');   // product count gate
 */

import { redirect } from '@remix-run/cloudflare';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import {
  PLAN_LIMITS,
  PLAN_LIMITS_LEGACY,
  getPlanLimitsSafe,
  checkUsageLimit,
  type PlanType,
  type PlanLimits,
} from '~/utils/plans.server';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Boolean feature flags on PlanLimits that can be gated. */
export type PlanFeatureFlag = keyof Pick<
  PlanLimits,
  'allow_store_mode' | 'allow_custom_domain' | 'allow_capi' | 'allow_priority_support'
>;

/** Usage-count resource types checked against monthly/total limits. */
export type LimitedResource = 'product' | 'order';

/** Plan tier ordering — higher is better. */
const PLAN_TIER: Record<PlanType, number> = {
  free: 0,
  starter: 1,
  premium: 2,
  business: 3,
};

// ─── Feature flag gate ────────────────────────────────────────────────────────

/**
 * requirePlanFeature — throws a 402 Response if the store's plan does not
 * include the requested feature flag.
 *
 * @param planType       Current store plan (from requireTenant result)
 * @param feature        Feature flag key on PlanLimits
 * @param upgradeUrl     Where to send the merchant (default: /app/upgrade)
 *
 * @example
 * requirePlanFeature(planType, 'allow_custom_domain');
 */
export function requirePlanFeature(
  planType: PlanType | string,
  feature: PlanFeatureFlag,
  upgradeUrl = '/app/upgrade'
): void {
  const limits = getPlanLimitsSafe(planType);
  if (!limits[feature]) {
    throw redirect(`${upgradeUrl}?reason=feature_required&feature=${feature}&current=${planType}`);
  }
}

// ─── Minimum plan gate ────────────────────────────────────────────────────────

/**
 * requireMinPlan — throws a redirect to the upgrade page if the store's
 * plan is below the required minimum tier.
 *
 * Tier order: free < starter < premium < business
 *
 * @example
 * requireMinPlan(planType, 'starter');  // starter, premium, or business pass
 */
export function requireMinPlan(
  currentPlan: PlanType | string,
  minimumPlan: PlanType,
  upgradeUrl = '/app/upgrade'
): void {
  const current = PLAN_TIER[currentPlan as PlanType] ?? 0;
  const required = PLAN_TIER[minimumPlan] ?? 0;
  if (current < required) {
    throw redirect(
      `${upgradeUrl}?reason=plan_required&required=${minimumPlan}&current=${currentPlan}`
    );
  }
}

// ─── Usage-count limit gate ───────────────────────────────────────────────────

/**
 * assertWithinLimit — throws a 429 Response if the store has hit its
 * plan's monthly/total usage limit for the given resource type.
 *
 * Wraps `checkUsageLimit` from plans.server.ts and converts the result into
 * a throwable Response so loaders/actions don't need try/catch boilerplate.
 *
 * @example
 * // In app.products.new.tsx action, before inserting:
 * await assertWithinLimit(env.DB, storeId, planType, 'product');
 */
export async function assertWithinLimit(
  db: D1Database,
  storeId: number,
  _planType: PlanType | string, // kept for logging; checkUsageLimit re-reads plan from DB
  resource: LimitedResource
): Promise<void> {
  const result = await checkUsageLimit(db, storeId, resource);
  if (!result.allowed) {
    const err = result.error!;
    throw new Response(
      JSON.stringify({
        error: 'Limit reached',
        code: err.code,
        message: err.message,
        limit: err.limit,
        current: err.current,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ─── Subscription expiry check ────────────────────────────────────────────────

/**
 * isSubscriptionExpired — pure boolean, no side effects.
 * Returns true when a paid plan's subscriptionEndDate is in the past.
 * Always returns false for the free plan (no expiry concept).
 */
export function isSubscriptionExpired(
  planType: PlanType | string,
  subscriptionEndDate: Date | null | undefined
): boolean {
  if (planType === 'free') return false;
  if (!subscriptionEndDate) return false;
  return new Date(subscriptionEndDate) < new Date();
}

/**
 * requireActiveSubscription — throws a redirect to upgrade page if a paid
 * plan's subscription has expired.
 *
 * Free plans are always considered active (they don't expire).
 *
 * @example
 * requireActiveSubscription(planType, store.subscriptionEndDate);
 */
export function requireActiveSubscription(
  planType: PlanType | string,
  subscriptionEndDate: Date | null | undefined,
  upgradeUrl = '/app/upgrade'
): void {
  if (isSubscriptionExpired(planType, subscriptionEndDate)) {
    throw redirect(`${upgradeUrl}?reason=expired&plan=${planType}`);
  }
}

// ─── Limits introspection (non-throwing) ─────────────────────────────────────

/**
 * getPlanLimits — returns the PlanLimits for a given plan type.
 * Handles legacy 'custom' alias and unknown plans (falls back to free).
 * Use this when you need to read limits without throwing.
 */
export function getPlanLimits(planType: PlanType | string): PlanLimits {
  return getPlanLimitsSafe(planType);
}

/**
 * getStaffLimit — returns the maximum number of staff members allowed on a plan.
 * Convenience wrapper; avoids importing PLAN_LIMITS directly in route files.
 */
export function getStaffLimit(planType: PlanType | string): number {
  return getPlanLimitsSafe(planType).max_staff;
}

/**
 * canAddStaff — returns true if the store has not yet reached its staff seat limit.
 *
 * @param planType       Current plan
 * @param currentCount   Number of currently active staff members (excluding owner)
 */
export function canAddStaff(planType: PlanType | string, currentCount: number): boolean {
  const limit = getStaffLimit(planType);
  return currentCount < limit;
}

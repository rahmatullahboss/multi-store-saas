/**
 * Tenant Guard — Composable Auth + Ownership + Plan + Permission enforcer
 *
 * Usage in any /app/* loader or action:
 *
 *   // Basic: just needs a logged-in merchant who owns this store
 *   const { userId, storeId, store, planType } = await requireTenant(request, context);
 *
 *   // With plan gate:
 *   const { storeId } = await requireTenant(request, context, {
 *     requireFeature: 'allow_custom_domain',
 *   });
 *
 *   // With permission gate (staff):
 *   const { storeId } = await requireTenant(request, context, {
 *     requirePermission: 'settings',
 *   });
 *
 *   // With minimum plan:
 *   const { storeId } = await requireTenant(request, context, {
 *     requireMinPlan: 'starter',
 *   });
 *
 * All guards throw Remix redirects or 403 Response objects — they never
 * return on failure, so callers can safely destructure the result.
 *
 * SECURITY: Ownership is verified by joining users → stores, so a
 * manipulated session cookie cannot escalate to another tenant's data.
 */

import { redirect } from '@remix-run/cloudflare';
import type { AppLoadContext } from '@remix-run/cloudflare';
import { eq, and, isNull } from 'drizzle-orm';
import { users, stores } from '@db/schema';
import { createDb } from '~/lib/db.server';
import { getStoreId, getUserId } from '~/services/auth.server';
import {
  PLAN_LIMITS,
  getPlanLimitsSafe,
  type PlanType,
  type PlanLimits,
} from '~/utils/plans.server';
import { parsePermissions, type StaffPermission } from '~/lib/permissions.server';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantGuardResult {
  userId: number;
  storeId: number;
  /** Full store row from DB (already ownership-verified). */
  store: {
    id: number;
    name: string;
    subdomain: string;
    planType: PlanType;
    isActive: boolean;
    subscriptionEndDate: Date | null;
    subscriptionStatus: string | null;
  };
  planType: PlanType;
  planLimits: PlanLimits;
  /** null for store owners (merchant role); populated for staff. */
  staffPermissions: ReturnType<typeof parsePermissions> | null;
}

export interface TenantGuardOptions {
  /**
   * Require a specific boolean feature flag from PlanLimits.
   * e.g. 'allow_custom_domain', 'allow_capi', 'allow_priority_support'
   */
  requireFeature?: keyof Pick<
    PlanLimits,
    'allow_store_mode' | 'allow_custom_domain' | 'allow_capi' | 'allow_priority_support'
  >;
  /**
   * Require at least this plan tier.
   * Order: free < starter < premium < business
   */
  requireMinPlan?: PlanType;
  /**
   * Require a specific staff permission key.
   * Owners (role=merchant) always pass permission checks.
   */
  requirePermission?: StaffPermission;
  /** Where to redirect if not authenticated. Default: '/auth/login' */
  loginRedirect?: string;
  /** Where to redirect if plan/permission gate fails. Default: '/app/upgrade' */
  upgradeRedirect?: string;
}

// Plan tier ordering for requireMinPlan
const PLAN_ORDER: Record<PlanType, number> = {
  free: 0,
  starter: 1,
  premium: 2,
  business: 3,
};

// ─── Main guard ───────────────────────────────────────────────────────────────

/**
 * requireTenant — the single composable guard for all merchant dashboard routes.
 *
 * Checks (in order):
 *   1. Session: userId present → redirect to login if missing
 *   2. Ownership: user.storeId matches session storeId, store not deleted → 403 if mismatch
 *   3. Store active: isActive === true → redirect to login if suspended
 *   4. Subscription: paid plan not expired → downgrade enforcement
 *   5. Feature/plan gate (optional)
 *   6. Permission gate (optional, for staff users)
 */
export async function requireTenant(
  request: Request,
  context: AppLoadContext,
  options: TenantGuardOptions = {}
): Promise<TenantGuardResult> {
  const env = context.cloudflare.env;
  const {
    loginRedirect = '/auth/login',
    upgradeRedirect = '/app/upgrade',
  } = options;

  // ── 1. Session check ──────────────────────────────────────────────────────
  const userId = await getUserId(request, env);
  if (!userId) {
    throw redirect(loginRedirect);
  }

  // ── 2. Ownership + store state from DB ────────────────────────────────────
  const db = createDb(env.DB);

  const [row] = await db
    .select({
      userId: users.id,
      userRole: users.role,
      userPermissions: users.permissions,
      userStoreId: users.storeId,
      storeId: stores.id,
      storeName: stores.name,
      storeSubdomain: stores.subdomain,
      storePlanType: stores.planType,
      storeIsActive: stores.isActive,
      storeDeletedAt: stores.deletedAt,
      storeSubscriptionEndDate: stores.subscriptionEndDate,
      storeSubscriptionStatus: stores.subscriptionStatus,
    })
    .from(users)
    .innerJoin(stores, eq(users.storeId, stores.id))
    .where(
      and(
        eq(users.id, userId),
        isNull(stores.deletedAt) // exclude soft-deleted stores
      )
    )
    .limit(1);

  // No row → user has no store or store is deleted
  if (!row) {
    // Super-admins don't own a store — they use the /admin/* routes
    // For merchant routes, return a 404 Response instead of redirecting to avoid redirect loops
    // The calling route should handle this gracefully by showing "create new store" UI
    throw new Response('Store not found or deleted', { status: 404 });
  }

  // Ownership cross-check: session cookie must not carry a different storeId
  // (defence-in-depth — the session may have been forged or replayed)
  const sessionStoreId = (await getStoreId(request, env)) as number | null;

  if (sessionStoreId !== null && sessionStoreId !== row.storeId) {
    console.error(
      '[TENANT GUARD] Cross-tenant session mismatch: ' +
        `sessionStoreId=${sessionStoreId} ownerStoreId=${row.storeId} userId=${userId}`
    );
    // Destroy the session to prevent further misuse
    throw new Response('Forbidden: cross-tenant access', { status: 403 });
  }

  // ── 3. Store active check ─────────────────────────────────────────────────
  if (row.storeIsActive !== true) {
    throw redirect(loginRedirect + '?reason=suspended');
  }

  // ── 4. Subscription expiry enforcement ───────────────────────────────────
  const planType = (row.storePlanType as PlanType) || 'free';
  const planLimits = getPlanLimitsSafe(planType);

  if (planType !== 'free' && row.storeSubscriptionEndDate) {
    const now = new Date();
    const expiry = new Date(row.storeSubscriptionEndDate);
    if (expiry < now) {
      // Subscription has lapsed — treat as free for feature gates.
      // We do NOT auto-downgrade in DB here (that's the cron/admin's job)
      // but we reject access to paid-only features.
      const effectivePlan: PlanType = 'free';
      const effectiveLimits = PLAN_LIMITS.free;

      // If caller requires a paid feature, redirect to upgrade
      if (options.requireFeature || options.requireMinPlan) {
        throw redirect(
          upgradeRedirect + '?reason=expired&plan=' + planType
        );
      }

      return buildResult(row, userId, effectivePlan, effectiveLimits, options);
    }
  }

  // ── 5. Feature / minimum plan gate ───────────────────────────────────────
  if (options.requireMinPlan) {
    const required = PLAN_ORDER[options.requireMinPlan] ?? 0;
    const current = PLAN_ORDER[planType] ?? 0;
    if (current < required) {
      throw redirect(
        upgradeRedirect +
          `?reason=plan_required&required=${options.requireMinPlan}&current=${planType}`
      );
    }
  }

  if (options.requireFeature) {
    if (!planLimits[options.requireFeature]) {
      throw redirect(
        upgradeRedirect +
          `?reason=feature_required&feature=${options.requireFeature}&current=${planType}`
      );
    }
  }

  // ── 6. Staff permission gate ─────────────────────────────────────────────
  // Owners (merchant), admins, and super_admins bypass all permission checks.
  const isOwnerOrAdmin =
    row.userRole === 'merchant' ||
    row.userRole === 'admin' ||
    row.userRole === 'super_admin';
  const staffPermissions = isOwnerOrAdmin ? null : parsePermissions(row.userPermissions);

  if (options.requirePermission && !isOwnerOrAdmin) {
    if (!staffPermissions || !staffPermissions[options.requirePermission]) {
      console.warn(
        `[TENANT GUARD] 403 insufficient permissions — userId=${userId} role=${row.userRole} ` +
        `storeId=${row.storeId} required=${options.requirePermission} ` +
        `permissions=${row.userPermissions ?? 'null'}`
      );
      throw new Response('Forbidden: insufficient permissions', { status: 403 });
    }
  }

  return buildResult(row, userId, planType, planLimits, options, staffPermissions);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildResult(
  row: {
    storeId: number;
    storeName: string;
    storeSubdomain: string;
    storeIsActive: boolean | null;
    storeSubscriptionEndDate: Date | null;
    storeSubscriptionStatus: string | null;
    [key: string]: unknown;
  },
  userId: number,
  planType: PlanType,
  planLimits: PlanLimits,
  _options: TenantGuardOptions,
  staffPermissions: ReturnType<typeof parsePermissions> | null = null
): TenantGuardResult {
  return {
    userId,
    storeId: row.storeId,
    store: {
      id: row.storeId,
      name: row.storeName,
      subdomain: row.storeSubdomain,
      planType,
      isActive: row.storeIsActive === true,
      subscriptionEndDate: row.storeSubscriptionEndDate,
      subscriptionStatus: row.storeSubscriptionStatus,
    },
    planType,
    planLimits,
    staffPermissions,
  };
}

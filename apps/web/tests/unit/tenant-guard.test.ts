/**
 * Unit tests for requireTenant (tenant-guard.server.ts)
 * and assertWithinLimit (plan-gate.server.ts)
 *
 * Strategy:
 *  - Mock auth helpers (getUserId, getStoreId) and DB calls (createDb)
 *  - Mock checkUsageLimit for assertWithinLimit
 *  - All guards throw on failure — we assert on thrown value
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Module mocks (hoisted before imports) ────────────────────────────────────

vi.mock('~/services/auth.server', () => ({
  getUserId: vi.fn(),
  getStoreId: vi.fn(),
}));

vi.mock('~/lib/db.server', () => ({
  createDb: vi.fn(),
}));

vi.mock('~/utils/plans.server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/utils/plans.server')>();
  return {
    ...actual,
    checkUsageLimit: vi.fn(),
  };
});

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { requireTenant } from '~/lib/tenant-guard.server';
import { assertWithinLimit } from '~/lib/plan-gate.server';
import { getUserId, getStoreId } from '~/services/auth.server';
import { createDb } from '~/lib/db.server';
import { checkUsageLimit } from '~/utils/plans.server';

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Minimal AppLoadContext shape expected by requireTenant */
function makeContext(dbOverride?: object) {
  return {
    cloudflare: {
      env: {
        DB: dbOverride ?? {},
      },
    },
  } as any;
}

function makeRequest(url = 'http://localhost/app/dashboard') {
  return new Request(url);
}

/** A valid active store row returned by the inner DB query */
const ACTIVE_ROW = {
  userId: 1,
  userRole: 'merchant',
  userPermissions: null,
  userStoreId: 10,
  storeId: 10,
  storeName: 'Test Store',
  storeSubdomain: 'test',
  storePlanType: 'starter',
  storeIsActive: true,
  storeDeletedAt: null,
  storeSubscriptionEndDate: null,
  storeSubscriptionStatus: 'active',
};

/** Build a Drizzle-like mock that returns `rows` from the chained query */
function makeMockDb(rows: object[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(rows),
  };
  return { select: vi.fn().mockReturnValue(chain) };
}

// ─────────────────────────────────────────────────────────────────────────────
// requireTenant
// ─────────────────────────────────────────────────────────────────────────────

describe('requireTenant', () => {
  beforeEach(() => {
    vi.mocked(getUserId).mockResolvedValue(null);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(makeMockDb([]) as any);
  });

  // ── 1. Auth ──────────────────────────────────────────────────────────────

  it('redirects to /auth/login when no session userId', async () => {
    vi.mocked(getUserId).mockResolvedValue(null);

    const thrown = await requireTenant(makeRequest(), makeContext()).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toBe('/auth/login');
  });

  it('respects custom loginRedirect option', async () => {
    vi.mocked(getUserId).mockResolvedValue(null);

    const thrown = await requireTenant(makeRequest(), makeContext(), {
      loginRedirect: '/custom/login',
    }).catch((e) => e);

    expect((thrown as Response).headers.get('Location')).toBe('/custom/login');
  });

  // ── 2. Ownership / missing store ─────────────────────────────────────────

  it('redirects to login when user has no store (empty DB row)', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(createDb).mockReturnValue(makeMockDb([]) as any); // no row

    const thrown = await requireTenant(makeRequest(), makeContext()).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toBe('/auth/login');
  });

  it('throws 403 on cross-tenant session mismatch', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(99); // different from row.storeId (10)
    vi.mocked(createDb).mockReturnValue(makeMockDb([ACTIVE_ROW]) as any);

    const thrown = await requireTenant(makeRequest(), makeContext()).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(403);
  });

  // ── 3. Store active check ─────────────────────────────────────────────────

  it('redirects with ?reason=suspended when store is inactive', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(
      makeMockDb([{ ...ACTIVE_ROW, storeIsActive: false }]) as any
    );

    const thrown = await requireTenant(makeRequest(), makeContext()).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toContain('reason=suspended');
  });

  // ── 4. Subscription expiry ────────────────────────────────────────────────

  it('redirects to upgrade when paid plan subscription is expired and feature is required', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(
      makeMockDb([
        {
          ...ACTIVE_ROW,
          storePlanType: 'premium',
          storeSubscriptionEndDate: new Date('2000-01-01'), // past
        },
      ]) as any
    );

    const thrown = await requireTenant(makeRequest(), makeContext(), {
      requireFeature: 'allow_custom_domain',
    }).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toContain('reason=expired');
  });

  it('returns effective free plan when paid plan is expired and no feature required', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(
      makeMockDb([
        {
          ...ACTIVE_ROW,
          storePlanType: 'premium',
          storeSubscriptionEndDate: new Date('2000-01-01'),
        },
      ]) as any
    );

    const result = await requireTenant(makeRequest(), makeContext());

    expect(result.planType).toBe('free');
  });

  // ── 5. Plan / feature gates ───────────────────────────────────────────────

  it('redirects to upgrade when current plan is below requireMinPlan', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(
      makeMockDb([{ ...ACTIVE_ROW, storePlanType: 'free' }]) as any
    );

    const thrown = await requireTenant(makeRequest(), makeContext(), {
      requireMinPlan: 'starter',
    }).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toContain('plan_required');
  });

  it('passes when current plan meets requireMinPlan', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(
      makeMockDb([{ ...ACTIVE_ROW, storePlanType: 'premium' }]) as any
    );

    const result = await requireTenant(makeRequest(), makeContext(), {
      requireMinPlan: 'starter',
    });

    expect(result.planType).toBe('premium');
    expect(result.storeId).toBe(10);
  });

  // ── 6. Permission gate ────────────────────────────────────────────────────

  it('allows merchant owner regardless of requirePermission', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(
      makeMockDb([{ ...ACTIVE_ROW, userRole: 'merchant' }]) as any
    );

    const result = await requireTenant(makeRequest(), makeContext(), {
      requirePermission: 'settings',
    });

    expect(result.staffPermissions).toBeNull();
  });

  it('throws 403 when staff lacks required permission', async () => {
    vi.mocked(getUserId).mockResolvedValue(2);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(
      makeMockDb([
        {
          ...ACTIVE_ROW,
          userId: 2,
          userRole: 'staff',
          userPermissions: '{}', // no permissions granted
        },
      ]) as any
    );

    const thrown = await requireTenant(makeRequest(), makeContext(), {
      requirePermission: 'settings',
    }).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(403);
  });

  // ── 7. Happy path ─────────────────────────────────────────────────────────

  it('returns full TenantGuardResult on success', async () => {
    vi.mocked(getUserId).mockResolvedValue(1);
    vi.mocked(getStoreId).mockResolvedValue(null);
    vi.mocked(createDb).mockReturnValue(makeMockDb([ACTIVE_ROW]) as any);

    const result = await requireTenant(makeRequest(), makeContext());

    expect(result.userId).toBe(1);
    expect(result.storeId).toBe(10);
    expect(result.planType).toBe('starter');
    expect(result.store.name).toBe('Test Store');
    expect(result.staffPermissions).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// assertWithinLimit
// ─────────────────────────────────────────────────────────────────────────────

describe('assertWithinLimit', () => {
  const mockD1 = {} as D1Database;

  it('does not throw when usage is within limit', async () => {
    vi.mocked(checkUsageLimit).mockResolvedValue({ allowed: true });

    await expect(assertWithinLimit(mockD1, 10, 'starter', 'product')).resolves.toBeUndefined();
  });

  it('throws a 429 Response when limit is reached', async () => {
    vi.mocked(checkUsageLimit).mockResolvedValue({
      allowed: false,
      error: {
        code: 'PRODUCT_LIMIT_REACHED',
        message: 'Product limit reached',
        limit: 50,
        current: 50,
      },
    });

    const thrown = await assertWithinLimit(mockD1, 10, 'free', 'product').catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(429);

    const body = await (thrown as Response).json();
    expect(body.code).toBe('PRODUCT_LIMIT_REACHED');
    expect(body.limit).toBe(50);
    expect(body.current).toBe(50);
  });

  it('includes correct Content-Type header on 429', async () => {
    vi.mocked(checkUsageLimit).mockResolvedValue({
      allowed: false,
      error: { code: 'ORDER_LIMIT_REACHED', message: 'Order limit reached', limit: 100, current: 100 },
    });

    const thrown = await assertWithinLimit(mockD1, 10, 'free', 'order').catch((e) => e);

    expect((thrown as Response).headers.get('Content-Type')).toBe('application/json');
  });

  it('ignores planTypeHint — delegates to checkUsageLimit', async () => {
    vi.mocked(checkUsageLimit).mockResolvedValue({ allowed: true });

    // Even with a nonsense planTypeHint, should not throw
    await expect(assertWithinLimit(mockD1, 10, 'unknown_plan' as any, 'staff')).resolves.toBeUndefined();
    expect(checkUsageLimit).toHaveBeenCalledWith(mockD1, 10, 'staff');
  });
});

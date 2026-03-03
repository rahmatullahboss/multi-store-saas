/**
 * Staff Permission Helpers
 *
 * Parses and enforces granular permissions stored in `users.permissions` (JSON).
 *
 * Schema (matches existing migration 0007_user_permissions.sql):
 * {
 *   products: boolean,
 *   orders: boolean,
 *   customers: boolean,
 *   analytics: boolean,
 *   settings: boolean,
 *   team: boolean,
 *   billing: boolean,
 *   coupons: boolean,
 * }
 *
 * Owners (role=merchant) always have all permissions — this module is only
 * invoked for staff/admin role users.
 *
 * Usage:
 *   import { parsePermissions, requirePermission } from '~/lib/permissions.server';
 *
 *   // Parse
 *   const perms = parsePermissions(user.permissions);
 *   if (!perms.orders) throw new Response('Forbidden', { status: 403 });
 *
 *   // Or use the throwing helper directly
 *   requirePermission(perms, 'settings');
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type StaffPermission =
  | 'products'
  | 'orders'
  | 'customers'
  | 'analytics'
  | 'settings'
  | 'team'
  | 'billing'
  | 'coupons';

export type StaffPermissions = Record<StaffPermission, boolean>;

const ALL_PERMISSIONS: StaffPermission[] = [
  'products',
  'orders',
  'customers',
  'analytics',
  'settings',
  'team',
  'billing',
  'coupons',
];

/** Permissions granted to store owners (role=merchant). Never persisted — computed. */
export const OWNER_PERMISSIONS: StaffPermissions = Object.fromEntries(
  ALL_PERMISSIONS.map((p) => [p, true])
) as StaffPermissions;

/** Safe default: deny everything (fail-closed for corrupted JSON). */
export const DENY_ALL_PERMISSIONS: StaffPermissions = Object.fromEntries(
  ALL_PERMISSIONS.map((p) => [p, false])
) as StaffPermissions;

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * parsePermissions — deserialise the `users.permissions` JSON column.
 *
 * Fails closed: any unknown key or parse error → false for that key.
 * Unknown keys in the JSON are silently ignored.
 */
export function parsePermissions(raw: string | null | undefined): StaffPermissions {
  if (!raw) return { ...DENY_ALL_PERMISSIONS };

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn('[permissions] Failed to parse permissions JSON — denying all');
    return { ...DENY_ALL_PERMISSIONS };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ...DENY_ALL_PERMISSIONS };
  }

  const result = { ...DENY_ALL_PERMISSIONS };
  for (const key of ALL_PERMISSIONS) {
    // Only accept explicit `true` — anything else (undefined, null, string) → false
    result[key] = parsed[key] === true;
  }
  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * hasPermission — pure boolean check, no side effects.
 *
 * @param permissions  Parsed permissions (from parsePermissions or OWNER_PERMISSIONS)
 * @param permission   The key to check
 * @param isOwner      When true, always returns true (owners bypass all checks)
 */
export function hasPermission(
  permissions: StaffPermissions | null,
  permission: StaffPermission,
  isOwner = false
): boolean {
  if (isOwner) return true;
  if (!permissions) return false;
  return permissions[permission] === true;
}

/**
 * requirePermission — throws a 403 Response if permission is denied.
 *
 * Use inside Remix loaders/actions after calling parsePermissions.
 * Owners (role=merchant) always pass — pass `isOwner=true` to skip the check.
 *
 * @example
 * const perms = parsePermissions(user.permissions);
 * requirePermission(perms, 'settings', role === 'merchant');
 */
export function requirePermission(
  permissions: StaffPermissions | null,
  permission: StaffPermission,
  isOwner = false
): void {
  if (hasPermission(permissions, permission, isOwner)) return;
  throw new Response(
    JSON.stringify({ error: 'Forbidden', reason: `missing_permission:${permission}` }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * filterNavByPermissions — utility to build sidebar nav based on what the
 * current user can see. Pass OWNER_PERMISSIONS for merchant users.
 *
 * @example
 * const nav = filterNavByPermissions(perms, [
 *   { label: 'Orders', href: '/app/orders', permission: 'orders' },
 *   { label: 'Settings', href: '/app/settings', permission: 'settings' },
 * ]);
 */
export function filterNavByPermissions<
  T extends { permission?: StaffPermission | null },
>(
  permissions: StaffPermissions,
  items: T[],
  isOwner = false
): T[] {
  return items.filter((item) => {
    if (!item.permission) return true; // No permission required → always show
    return hasPermission(permissions, item.permission, isOwner);
  });
}

/**
 * serializePermissions — convert a StaffPermissions object back to the JSON
 * string stored in `users.permissions`. Use in team management actions.
 */
export function serializePermissions(permissions: StaffPermissions): string {
  return JSON.stringify(permissions);
}

/**
 * Team Management Page
 * 
 * Route: /app/settings/team
 * 
 * Features:
 * - List current team members with roles
 * - Invite new staff (email + role selection)
 * - Pending invitations list
 * - Revoke invitations
 * - Remove team members
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, isNull, desc, gt } from 'drizzle-orm';
import { users, stores, staffInvites } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { assertWithinLimit } from '~/lib/plan-gate.server';
import { createEmailService } from '~/services/email.server';
import { logActivity } from '~/lib/activity.server';
import { 
  Users, UserPlus, Mail, Shield, Trash2, Clock, 
  Loader2, CheckCircle, AlertCircle, X, Copy, Settings,
  ArrowLeft
} from 'lucide-react';
import { Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

const INVITE_ROLES = ['admin', 'staff'] as const;
type InviteRole = (typeof INVITE_ROLES)[number];

export const meta: MetaFunction = () => {
  return [{ title: 'Team Management - Ozzyl' }];
};

// ============================================================================
// LOADER - Fetch team members and pending invites
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { userId, storeId } = await requireTenant(request, context, {
    requirePermission: 'team',
  });

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch current user to check role
  const currentUser = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.storeId, storeId)))
    .limit(1);

  const allowedRoles = ['admin', 'merchant', 'super_admin'];
  if (!currentUser[0] || !allowedRoles.includes(currentUser[0].role || '')) {
    throw new Response('Unauthorized', { status: 403 });
  }

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) throw new Response('Store not found', { status: 404 });

  // Fetch all team members
  const teamMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      permissions: users.permissions,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.storeId, storeId))
    .orderBy(desc(users.createdAt));

  // Fetch pending invites (not accepted, not expired) - filter at DB level
  const pendingInvites = await db
    .select({
      id: staffInvites.id,
      email: staffInvites.email,
      role: staffInvites.role,
      token: staffInvites.token,
      expiresAt: staffInvites.expiresAt,
      createdAt: staffInvites.createdAt,
    })
    .from(staffInvites)
    .where(
      and(
        eq(staffInvites.storeId, storeId),
        isNull(staffInvites.acceptedAt),
        gt(staffInvites.expiresAt, new Date()),
      )
    )
    .orderBy(desc(staffInvites.createdAt));

  const validInvites = pendingInvites;

  return json({
    store,
    currentUserId: userId,
    teamMembers,
    pendingInvites: validInvites,
    baseUrl: new URL(request.url).origin,
  });
}

// ============================================================================
// ACTION - Handle invite, revoke, remove
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { userId, storeId, planType } = await requireTenant(request, context, {
    requirePermission: 'team',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // Fetch current user to check role AND verify storeId ownership
  const currentUser = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.storeId, storeId)))
    .limit(1);

  if (!currentUser[0] || currentUser[0].storeId !== storeId) {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  const allowedRolesAction = ['admin', 'merchant', 'super_admin'];
  if (!allowedRolesAction.includes(currentUser[0].role || '')) {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Handle different actions
  switch (intent) {
    case 'invite': {
      const email = formData.get('email') as string;
      const roleInput = formData.get('role') as string;
      const role: InviteRole = INVITE_ROLES.includes(roleInput as InviteRole)
        ? (roleInput as InviteRole)
        : 'staff';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'invalidEmail' }, { status: 400 });
      }

      // Check if user already exists with this email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser[0] && existingUser[0].storeId === storeId) {
        return json({ error: 'userAlreadyMember' }, { status: 400 });
      }
      if (existingUser[0] && existingUser[0].storeId && existingUser[0].storeId !== storeId) {
        return json({ error: 'userBelongsToAnotherStore' }, { status: 409 });
      }

      // Only merchant/owner can invite another admin.
      if (role === 'admin' && currentUser[0].role !== 'merchant' && currentUser[0].role !== 'super_admin') {
        return json({ error: 'onlyOwnerCanInviteAdmin' }, { status: 403 });
      }

      // Check if invite already pending
      const existingInvite = await db
        .select()
        .from(staffInvites)
        .where(
          and(
            eq(staffInvites.storeId, storeId),
            eq(staffInvites.email, email.toLowerCase()),
            isNull(staffInvites.acceptedAt),
          )
        )
        .limit(1);

      if (existingInvite[0]) {
        return json({ error: 'invitePending' }, { status: 400 });
      }

      await assertWithinLimit(context.cloudflare.env.DB, storeId, planType, 'staff');

      // Generate token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invite
      await db.insert(staffInvites).values({
        storeId,
        email: email.toLowerCase(),
        role,
        token,
        invitedBy: userId,
        expiresAt,
      });

      // Send invite email
      const resendApiKey = context.cloudflare.env.RESEND_API_KEY;
      if (resendApiKey) {
        const emailService = createEmailService(resendApiKey);
        const baseUrl = new URL(request.url).origin;
        await emailService.sendStaffInvite({
          email: email.toLowerCase(),
          inviteLink: `${baseUrl}/invite/${token}`,
          storeName: store.name,
          invitedBy: currentUser[0].name || currentUser[0].email,
        });
      }

      // Log activity
      await logActivity(db, {
        storeId,
        userId,
        action: 'staff_invited',
        entityType: 'invite',
        details: { email, role },
      });

      return json({ success: true, message: 'inviteSent' });
    }

    case 'revoke': {
      const inviteId = parseInt(formData.get('inviteId') as string, 10);

      if (!inviteId) {
        return json({ error: 'invalidInviteId' }, { status: 400 });
      }

      // Get invite details for logging
      const invite = await db
        .select()
        .from(staffInvites)
        .where(and(eq(staffInvites.id, inviteId), eq(staffInvites.storeId, storeId)))
        .limit(1);

      if (!invite[0]) {
        return json({ error: 'inviteNotFound' }, { status: 404 });
      }

      await db.delete(staffInvites).where(
        and(eq(staffInvites.id, inviteId), eq(staffInvites.storeId, storeId))
      );

      // Log activity
      await logActivity(db, {
        storeId,
        userId,
        action: 'invite_revoked',
        entityType: 'invite',
        details: { email: invite[0].email },
      });

      return json({ success: true, message: 'inviteRevoked' });
    }

    case 'remove': {
      const memberId = parseInt(formData.get('memberId') as string, 10);

      if (!memberId) {
        return json({ error: 'invalidMemberId' }, { status: 400 });
      }

      // Can't remove yourself
      if (memberId === userId) {
        return json({ error: 'cannotRemoveSelf' }, { status: 400 });
      }

      // Get member details for logging
      const member = await db
        .select()
        .from(users)
        .where(and(eq(users.id, memberId), eq(users.storeId, storeId)))
        .limit(1);

      if (!member[0]) {
        return json({ error: 'memberNotFound' }, { status: 404 });
      }

      // Can't remove the store owner (merchant)
      if (member[0].role === 'merchant') {
        return json({ error: 'cannotRemoveOwner' }, { status: 400 });
      }

      await db.update(users)
        .set({ storeId: null, role: 'staff' })
        .where(and(eq(users.id, memberId), eq(users.storeId, storeId)));

      // Log activity
      await logActivity(db, {
        storeId,
        userId,
        action: 'staff_removed',
        entityType: 'staff',
        entityId: memberId,
        details: { email: member[0].email, name: member[0].name },
      });

      return json({ success: true, message: 'memberRemoved' });
    }

    case 'updatePermissions': {
      const memberId = parseInt(formData.get('memberId') as string, 10);
      const permissionsJson = formData.get('permissions') as string;

      if (!memberId) {
        return json({ error: 'invalidMemberId' }, { status: 400 });
      }

      // Verify member belongs to this store
      const member = await db
        .select()
        .from(users)
        .where(and(eq(users.id, memberId), eq(users.storeId, storeId)))
        .limit(1);

      if (!member[0]) {
        return json({ error: 'memberNotFound' }, { status: 404 });
      }

      // Can't change owner permissions
      if (member[0].role === 'merchant') {
        return json({ error: 'cannotEditOwner' }, { status: 400 });
      }

      // Update permissions
      await db.update(users)
        .set({ permissions: permissionsJson })
        .where(and(eq(users.id, memberId), eq(users.storeId, storeId)));

      // Log activity
      await logActivity(db, {
        storeId,
        userId,
        action: 'settings_updated',
        entityType: 'staff',
        entityId: memberId,
        details: { email: member[0].email, type: 'permissions_changed' },
      });

      return json({ success: true, message: 'permissionsUpdated' });
    }

    default:
      return json({ error: 'invalidAction' }, { status: 400 });
  }
}

// ============================================================================
// PERMISSION CATEGORIES
// ============================================================================
const PERMISSION_CATEGORIES = [
  { key: 'products', labelBn: 'প্রোডাক্ট', labelEn: 'Products', icon: '📦' },
  { key: 'orders', labelBn: 'অর্ডার', labelEn: 'Orders', icon: '📋' },
  { key: 'customers', labelBn: 'কাস্টমার', labelEn: 'Customers', icon: '👥' },
  { key: 'analytics', labelBn: 'রিপোর্ট', labelEn: 'Analytics', icon: '📊' },
  { key: 'settings', labelBn: 'সেটিংস', labelEn: 'Settings', icon: '⚙️' },
  { key: 'team', labelBn: 'টিম', labelEn: 'Team', icon: '👤' },
  { key: 'billing', labelBn: 'বিলিং', labelEn: 'Billing', icon: '💳' },
  { key: 'coupons', labelBn: 'কুপন', labelEn: 'Coupons', icon: '🎟️' },
];

type PermissionKey = 'products' | 'orders' | 'customers' | 'analytics' | 'settings' | 'team' | 'billing' | 'coupons';
type Permissions = Record<PermissionKey, boolean>;

const DEFAULT_PERMISSIONS: Permissions = {
  products: true,
  orders: true,
  customers: true,
  analytics: true,
  settings: false,
  team: false,
  billing: false,
  coupons: true,
};

function parsePermissions(permStr: string | null): Permissions {
  if (!permStr) return DEFAULT_PERMISSIONS;
  try {
    return { ...DEFAULT_PERMISSIONS, ...JSON.parse(permStr) };
  } catch {
    return DEFAULT_PERMISSIONS;
  }
}

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================
const roles = [
  { value: 'admin', label: 'adminRole', description: 'adminRoleDesc' },
  { value: 'staff', label: 'staffRole', description: 'staffRoleDesc' },
];

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'merchant': return 'bg-emerald-100 text-emerald-700';
    case 'admin': return 'bg-purple-100 text-purple-700';
    case 'staff': return 'bg-blue-100 text-blue-700';
    case 'viewer': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

/** Maps a DB role value to the i18n key for its display label */
function getRoleLabel(role: string | null, t: (key: string) => string): string {
  switch (role) {
    case 'merchant': return t('settings:team.roleOwner');
    case 'admin':    return t('settings:team.roleAdmin');
    case 'manager':  return t('settings:team.roleManager');
    case 'staff':    return t('settings:team.roleStaff');
    default:         return t('settings:team.roleStaff');
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TeamManagementPage() {
  const { store, currentUserId, teamMembers, pendingInvites, baseUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  const permFetcher = useFetcher();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Errors that belong inline on the invite form (not a global toast)
  const INVITE_FORM_ERRORS = new Set([
    'invalidEmail',
    'userAlreadyMember',
    'userBelongsToAnotherStore',
    'invitePending',
    'onlyOwnerCanInviteAdmin',
  ]);

  const inviteError =
    actionData && 'error' in actionData && actionData.error && INVITE_FORM_ERRORS.has(actionData.error)
      ? actionData.error
      : null;

  const globalError =
    actionData && 'error' in actionData && actionData.error && !INVITE_FORM_ERRORS.has(actionData.error)
      ? actionData.error
      : null;

  /** Maps a server error code to a human-readable translation key */
  function getInviteErrorKey(code: string): string {
    switch (code) {
      case 'invalidEmail':              return 'settings:team.emailError';
      case 'userAlreadyMember':         return 'settings:team.emailAlreadyMember';
      case 'userBelongsToAnotherStore': return 'settings:team.emailBelongsAnotherStore';
      case 'invitePending':             return 'settings:team.inviteAlreadyPending';
      case 'onlyOwnerCanInviteAdmin':   return 'settings:team.onlyOwnerCanInviteAdmin';
      default:                          return code;
    }
  }
  
  // Permission editing state
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editPerms, setEditPerms] = useState<Permissions>(DEFAULT_PERMISSIONS);

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  // Surface permFetcher success/error feedback
  useEffect(() => {
    const data = permFetcher.data as Record<string, unknown> | undefined;
    if (data && typeof data === 'object' && data['success'] === true) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [permFetcher.data]);

  const copyInviteLink = (token: string) => {
    navigator.clipboard.writeText(`${baseUrl}/invite/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <>
      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 h-[60px]">
            <Link to="/app/settings" className="p-2 -ml-2 text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{t('teamSettings')}</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex flex-col gap-5 p-4 pb-32">
          {/* Success Message */}
          {showSuccess && actionData && 'message' in actionData && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t(actionData.message as any)}
            </div>
          )}

          {/* Error Message (global / non-form errors only) */}
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t(globalError as string)}
            </div>
          )}

          {/* Invite Team Member Card */}
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{t('inviteTeamMember')}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 -mt-3">
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="invite" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailAddress')}</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="colleague@example.com"
                  aria-describedby={inviteError ? 'mobile-invite-email-error' : undefined}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${inviteError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {inviteError && (
                  <p id="mobile-invite-email-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {t(getInviteErrorKey(inviteError))}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('role')}</label>
                <select
                  name="role"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {t(role.label as string)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('sending')}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {t('sendInvitation')}
                  </>
                )}
              </button>
            </Form>
          </div>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{t('pendingInvitations')}</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100 -mt-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{invite.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(invite.role || 'staff')}`}>
                          {getRoleLabel(invite.role, t)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyInviteLink(invite.token)}
                        aria-label={t('settings:team.copyInviteLink')}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition"
                      >
                        {copiedToken === invite.token ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <Form method="post">
                        <input type="hidden" name="intent" value="revoke" />
                        <input type="hidden" name="inviteId" value={invite.id} />
                        <button type="submit" aria-label={t('settings:team.revokeInvite')} className="p-2 text-red-500 hover:text-red-700 rounded-lg transition">
                          <X className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Team Members */}
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{t('teamMembers')}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100 -mt-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {member.name || 'No name'}
                        {member.id === currentUserId && <span className="ml-1 text-xs text-gray-500">(You)</span>}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role || 'staff')}`}>
                        {getRoleLabel(member.role, t)}
                      </span>
                    </div>
                  </div>
                  {member.id !== currentUserId && member.role !== 'merchant' && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={t('settings:team.editMember')}
                        onClick={() => {
                          if (editingMemberId === member.id) {
                            setEditingMemberId(null);
                          } else {
                            setEditingMemberId(member.id);
                            setEditPerms(parsePermissions(member.permissions));
                          }
                        }}
                        className="p-2 text-blue-500 hover:text-blue-700 rounded-lg transition"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <Form method="post" onSubmit={(e) => {
                        if (!confirm(`${t('removeTeamMember')} ${member.name || member.email}?`)) {
                          e.preventDefault();
                        }
                      }}>
                        <input type="hidden" name="intent" value="remove" />
                        <input type="hidden" name="memberId" value={member.id} />
                        <button type="submit" aria-label={t('settings:team.removeMember')} className="p-2 text-red-500 hover:text-red-700 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  )}
                </div>
                {/* Inline Permissions Editor (Mobile) */}
                {editingMemberId === member.id && member.role !== 'merchant' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {lang === 'bn' ? 'পারমিশন সেট করুন' : 'Set Permissions'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {PERMISSION_CATEGORIES.map((perm) => (
                        <label key={perm.key} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-100 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={editPerms[perm.key as PermissionKey]}
                            onChange={(e) => setEditPerms(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>{perm.icon} {lang === 'bn' ? perm.labelBn : perm.labelEn}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button type="button" onClick={() => setEditingMemberId(null)} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          permFetcher.submit({ intent: 'updatePermissions', memberId: String(member.id), permissions: JSON.stringify(editPerms) }, { method: 'post' });
                          setEditingMemberId(null);
                        }}
                        disabled={permFetcher.state !== 'idle'}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {permFetcher.state !== 'idle' ? <Loader2 className="w-3 h-3 animate-spin" /> : lang === 'bn' ? 'সেভ করুন' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('teamSettings')}</h1>
          <p className="text-gray-600">{t('teamSettingsDesc')}</p>
        </div>

        {/* Success Message */}
        {showSuccess && actionData && 'message' in actionData && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {t(actionData.message as any)}
          </div>
        )}

        {/* Error Message (global / non-form errors only) */}
        {globalError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t(globalError as string)}
          </div>
        )}

      {/* Invite Staff Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('inviteTeamMember')}</h2>
            <p className="text-sm text-gray-500">{t('sendInviteToJoin')} {store.name}</p>
          </div>
        </div>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="invite" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="colleague@example.com"
                aria-describedby={inviteError ? 'desktop-invite-email-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${inviteError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {inviteError && (
                <p id="desktop-invite-email-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {t(getInviteErrorKey(inviteError))}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                {t('role')}
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {t(role.label as any)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {t('sendInvitation')}
                </>
              )}
            </button>
          </div>
        </Form>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('pendingInvitations')}</h2>
              <p className="text-sm text-gray-500">{pendingInvites.length} {t('invitationsWaiting')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(invite.role || 'staff')}`}>
                        {getRoleLabel(invite.role, t)}
                      </span>
                      {invite.expiresAt && (
                        <span>{t('expires')} {new Date(invite.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyInviteLink(invite.token)}
                    aria-label={t('settings:team.copyInviteLink')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
                  >
                    {copiedToken === invite.token ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <Form method="post">
                    <input type="hidden" name="intent" value="revoke" />
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <button
                      type="submit"
                      aria-label={t('settings:team.revokeInvite')}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('teamMembers')}</h2>
            <p className="text-sm text-gray-500">{teamMembers.length} {t('membersCount')}</p>
          </div>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {member.name || 'No name'}
                    {member.id === currentUserId && (
                      <span className="ml-2 text-xs text-gray-500">(You)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{member.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role || 'staff')}`}>
                      {getRoleLabel(member.role, t)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons - only show for non-owners and non-self */}
              {member.id !== currentUserId && member.role !== 'merchant' && (
                <div className="flex items-center gap-2">
                  {/* Edit Permissions Button */}
                  <button
                    type="button"
                    aria-label={t('settings:team.editMember')}
                    onClick={() => {
                      if (editingMemberId === member.id) {
                        setEditingMemberId(null);
                      } else {
                        setEditingMemberId(member.id);
                        setEditPerms(parsePermissions(member.permissions));
                      }
                    }}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  {/* Remove Button */}
                  <Form method="post" onSubmit={(e) => {
                    if (!confirm(`${t('removeTeamMember')} ${member.name || member.email}?`)) {
                      e.preventDefault();
                    }
                  }}>
                    <input type="hidden" name="intent" value="remove" />
                    <input type="hidden" name="memberId" value={member.id} />
                    <button
                      type="submit"
                      aria-label={t('settings:team.removeMember')}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Form>
                </div>
              )}
            </div>
            
            {/* Inline Permissions Editor */}
            {editingMemberId === member.id && member.role !== 'merchant' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {lang === 'bn' ? 'পারমিশন সেট করুন' : 'Set Permissions'}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PERMISSION_CATEGORIES.map((perm) => (
                    <label 
                      key={perm.key}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={editPerms[perm.key as PermissionKey]}
                        onChange={(e) => setEditPerms(prev => ({
                          ...prev,
                          [perm.key]: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">
                        {perm.icon} {lang === 'bn' ? perm.labelBn : perm.labelEn}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingMemberId(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      permFetcher.submit(
                        {
                          intent: 'updatePermissions',
                          memberId: String(member.id),
                          permissions: JSON.stringify(editPerms),
                        },
                        { method: 'post' }
                      );
                      setEditingMemberId(null);
                    }}
                    disabled={permFetcher.state !== 'idle'}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {permFetcher.state !== 'idle' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      lang === 'bn' ? 'সেভ করুন' : 'Save'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          ))}
        </div>
      </div>

      {/* Role Permissions Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('rolePermissions')}</h2>
            <p className="text-sm text-gray-500">{t('rolePermissionsDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-900 mb-2">{t('ownerRole')} / Admin</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• {t('manageProductsOrders')}</li>
              <li>• {t('inviteTeamMembers')}</li>
              <li>• {t('changeSettings')}</li>
              <li>• {t('viewAnalytics')}</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Staff</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('manageProductsOrders')}</li>
              <li>• {t('viewAnalytics')}</li>
              <li>• {t('cannotChangeSettings')}</li>
              <li>• {t('cannotInviteOthers')}</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Viewer</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• {t('viewProductsOrders')}</li>
              <li>• {t('viewAnalytics')}</li>
              <li>• {t('cannotMakeChanges')}</li>
              <li>• {t('readOnlyAccess')}</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

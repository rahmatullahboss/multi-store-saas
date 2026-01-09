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
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { users, stores, staffInvites } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { createEmailService } from '~/services/email.server';
import { logActivity } from '~/lib/activity.server';
import { 
  Users, UserPlus, Mail, Shield, Trash2, Clock, 
  Loader2, CheckCircle, AlertCircle, X, Copy
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Team Management - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER - Fetch team members and pending invites
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch current user to check role
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser[0] || (currentUser[0].role !== 'admin' && currentUser[0].role !== 'merchant')) {
    throw new Response('Unauthorized', { status: 403 });
  }

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  // Fetch all team members
  const teamMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.storeId, storeId))
    .orderBy(desc(users.createdAt));

  // Fetch pending invites (not accepted, not expired)
  const now = new Date();
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
      )
    )
    .orderBy(desc(staffInvites.createdAt));

  // Filter out expired invites
  const validInvites = pendingInvites.filter(
    invite => !invite.expiresAt || new Date(invite.expiresAt) > now
  );

  return json({
    store: storeResult[0],
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
  const userId = await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // Fetch current user to check role
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser[0] || (currentUser[0].role !== 'admin' && currentUser[0].role !== 'merchant')) {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];

  // Handle different actions
  switch (intent) {
    case 'invite': {
      const email = formData.get('email') as string;
      const role = formData.get('role') as 'admin' | 'staff' | 'viewer';

      if (!email || !email.includes('@')) {
        return json({ error: 'Please enter a valid email address' }, { status: 400 });
      }

      // Check if user already exists with this email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser[0] && existingUser[0].storeId === storeId) {
        return json({ error: 'This user is already a team member' }, { status: 400 });
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
        return json({ error: 'An invitation is already pending for this email' }, { status: 400 });
      }

      // Generate token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invite
      await db.insert(staffInvites).values({
        storeId,
        email: email.toLowerCase(),
        role: role || 'staff',
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
          inviterName: currentUser[0].name || currentUser[0].email,
          storeName: store.name,
          role: role || 'staff',
          inviteUrl: `${baseUrl}/invite/${token}`,
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

      return json({ success: true, message: 'Invitation sent successfully!' });
    }

    case 'revoke': {
      const inviteId = parseInt(formData.get('inviteId') as string, 10);

      if (!inviteId) {
        return json({ error: 'Invalid invite ID' }, { status: 400 });
      }

      // Get invite details for logging
      const invite = await db
        .select()
        .from(staffInvites)
        .where(and(eq(staffInvites.id, inviteId), eq(staffInvites.storeId, storeId)))
        .limit(1);

      if (!invite[0]) {
        return json({ error: 'Invitation not found' }, { status: 404 });
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

      return json({ success: true, message: 'Invitation revoked' });
    }

    case 'remove': {
      const memberId = parseInt(formData.get('memberId') as string, 10);

      if (!memberId) {
        return json({ error: 'Invalid member ID' }, { status: 400 });
      }

      // Can't remove yourself
      if (memberId === userId) {
        return json({ error: 'You cannot remove yourself from the team' }, { status: 400 });
      }

      // Get member details for logging
      const member = await db
        .select()
        .from(users)
        .where(and(eq(users.id, memberId), eq(users.storeId, storeId)))
        .limit(1);

      if (!member[0]) {
        return json({ error: 'Team member not found' }, { status: 404 });
      }

      // Can't remove the store owner (merchant)
      if (member[0].role === 'merchant') {
        return json({ error: 'Cannot remove the store owner' }, { status: 400 });
      }

      await db.delete(users).where(
        and(eq(users.id, memberId), eq(users.storeId, storeId))
      );

      // Log activity
      await logActivity(db, {
        storeId,
        userId,
        action: 'staff_removed',
        entityType: 'staff',
        entityId: memberId,
        details: { email: member[0].email, name: member[0].name },
      });

      return json({ success: true, message: 'Team member removed' });
    }

    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
}

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================
const roles = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'staff', label: 'Staff', description: 'Manage products and orders' },
  { value: 'viewer', label: 'Viewer', description: 'View-only access' },
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TeamManagementPage() {
  const { store, currentUserId, teamMembers, pendingInvites, baseUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const copyInviteLink = (token: string) => {
    navigator.clipboard.writeText(`${baseUrl}/invite/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('teamSettings')}</h1>
        <p className="text-gray-600">{lang === 'bn' ? 'আপনার টিম মেম্বারদের ইনভাইট এবং ম্যানেজ করুন' : 'Invite and manage your team members'}</p>
      </div>

      {/* Success Message */}
      {showSuccess && actionData && 'message' in actionData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {actionData.message}
        </div>
      )}

      {/* Error Message */}
      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {actionData.error}
        </div>
      )}

      {/* Invite Staff Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
            <p className="text-sm text-gray-500">Send an invitation to join {store.name}</p>
          </div>
        </div>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="invite" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="colleague@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
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
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Invitation
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
              <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
              <p className="text-sm text-gray-500">{pendingInvites.length} invitation(s) waiting</p>
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
                        {invite.role || 'staff'}
                      </span>
                      {invite.expiresAt && (
                        <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyInviteLink(invite.token)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
                    title="Copy invite link"
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
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Revoke invitation"
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
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500">{teamMembers.length} member(s)</p>
          </div>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
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
                      {member.role === 'merchant' ? 'Owner' : member.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remove button - only show for non-owners and non-self */}
              {member.id !== currentUserId && member.role !== 'merchant' && (
                <Form method="post" onSubmit={(e) => {
                  if (!confirm(`Remove ${member.name || member.email} from the team?`)) {
                    e.preventDefault();
                  }
                }}>
                  <input type="hidden" name="intent" value="remove" />
                  <input type="hidden" name="memberId" value={member.id} />
                  <button
                    type="submit"
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Remove team member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Form>
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
            <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
            <p className="text-sm text-gray-500">Understanding what each role can do</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-900 mb-2">Admin</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Manage products & orders</li>
              <li>• Invite team members</li>
              <li>• Change settings</li>
              <li>• View analytics</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Staff</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Manage products & orders</li>
              <li>• View analytics</li>
              <li>• Cannot change settings</li>
              <li>• Cannot invite others</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Viewer</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• View products & orders</li>
              <li>• View analytics</li>
              <li>• Cannot make changes</li>
              <li>• Read-only access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

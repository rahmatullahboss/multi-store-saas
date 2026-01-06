/**
 * Accept Invite Page
 * 
 * Route: /invite/:token
 * 
 * Public page for accepting staff invitations.
 * Creates a new user account and links it to the store.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { users, stores, staffInvites } from '@db/schema';
import { hashPassword } from '~/services/auth.server';
import { logActivity } from '~/lib/activity.server';
import { Store, Loader2, CheckCircle, AlertCircle, Lock, User } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const storeName = data && 'storeName' in data ? data.storeName : null;
  return [{ 
    title: storeName 
      ? `Join ${storeName} - Multi-Store SaaS` 
      : 'Accept Invitation - Multi-Store SaaS' 
  }];
};

// ============================================================================
// LOADER - Validate token and fetch invite details
// ============================================================================
export async function loader({ params, context }: LoaderFunctionArgs) {
  const { token } = params;
  
  if (!token) {
    return json({ error: 'Invalid invitation link' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Find invite
  const invite = await db
    .select({
      id: staffInvites.id,
      email: staffInvites.email,
      role: staffInvites.role,
      storeId: staffInvites.storeId,
      expiresAt: staffInvites.expiresAt,
      acceptedAt: staffInvites.acceptedAt,
    })
    .from(staffInvites)
    .where(eq(staffInvites.token, token))
    .limit(1);

  if (!invite[0]) {
    return json({ 
      error: 'This invitation link is invalid or has been revoked.',
      showLoginLink: true,
    }, { status: 404 });
  }

  // Check if already accepted
  if (invite[0].acceptedAt) {
    return json({ 
      error: 'This invitation has already been accepted. Please log in to access the store.',
      showLoginLink: true,
    }, { status: 400 });
  }

  // Check if expired
  if (invite[0].expiresAt && new Date(invite[0].expiresAt) < new Date()) {
    return json({ 
      error: 'This invitation has expired. Please ask the store owner for a new invitation.',
      showLoginLink: false,
    }, { status: 400 });
  }

  // Fetch store info
  const store = await db
    .select({ id: stores.id, name: stores.name })
    .from(stores)
    .where(eq(stores.id, invite[0].storeId))
    .limit(1);

  if (!store[0]) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Check if user already exists with this email
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, invite[0].email))
    .limit(1);

  if (existingUser[0]) {
    // User exists - just link them to the store
    return json({
      storeName: store[0].name,
      email: invite[0].email,
      role: invite[0].role,
      userExists: true,
    });
  }

  return json({
    storeName: store[0].name,
    email: invite[0].email,
    role: invite[0].role,
    userExists: false,
  });
}

// ============================================================================
// ACTION - Create account and accept invite
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const { token } = params;
  
  if (!token) {
    return json({ error: 'Invalid invitation link' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Find invite
  const invite = await db
    .select()
    .from(staffInvites)
    .where(eq(staffInvites.token, token))
    .limit(1);

  if (!invite[0]) {
    return json({ error: 'Invalid invitation link' }, { status: 404 });
  }

  if (invite[0].acceptedAt) {
    return json({ error: 'This invitation has already been accepted' }, { status: 400 });
  }

  if (invite[0].expiresAt && new Date(invite[0].expiresAt) < new Date()) {
    return json({ error: 'This invitation has expired' }, { status: 400 });
  }

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, invite[0].email))
    .limit(1);

  if (existingUser[0]) {
    // User exists - just update their store association
    await db.update(users)
      .set({
        storeId: invite[0].storeId,
        role: invite[0].role as 'admin' | 'merchant' | 'staff',
      })
      .where(eq(users.id, existingUser[0].id));

    // Mark invite as accepted
    await db.update(staffInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(staffInvites.id, invite[0].id));

    // Log activity
    await logActivity(db, {
      storeId: invite[0].storeId,
      userId: existingUser[0].id,
      action: 'invite_accepted',
      entityType: 'staff',
      entityId: existingUser[0].id,
      details: { email: invite[0].email, role: invite[0].role },
    });

    return redirect('/auth/login?message=You have joined the team! Please log in.');
  }

  // New user - validate inputs
  if (!name || name.trim().length < 2) {
    return json({ error: 'Name must be at least 2 characters' }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match' }, { status: 400 });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const newUser = await db.insert(users).values({
    email: invite[0].email,
    passwordHash,
    name: name.trim(),
    storeId: invite[0].storeId,
    role: invite[0].role as 'admin' | 'merchant' | 'staff',
  }).returning({ id: users.id });

  // Mark invite as accepted
  await db.update(staffInvites)
    .set({ acceptedAt: new Date() })
    .where(eq(staffInvites.id, invite[0].id));

  // Log activity
  await logActivity(db, {
    storeId: invite[0].storeId,
    userId: newUser[0].id,
    action: 'invite_accepted',
    entityType: 'staff',
    entityId: newUser[0].id,
    details: { email: invite[0].email, role: invite[0].role, name: name.trim() },
  });

  return redirect('/auth/login?message=Account created! Please log in to access the store.');
}

// ============================================================================
// ROLE LABELS
// ============================================================================
const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  staff: 'Staff Member',
  viewer: 'Viewer',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AcceptInvitePage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Error state
  if ('error' in data && data.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Error</h1>
          <p className="text-gray-600 mb-6">{String(data.error)}</p>
          {'showLoginLink' in data && Boolean(data.showLoginLink) && (
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Existing user - just need to confirm
  if ('userExists' in data && data.userExists) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join {data.storeName}</h1>
            <p className="text-purple-100">You've been invited as a {roleLabels[data.role || 'staff'] || data.role}</p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                An account with <strong>{data.email}</strong> already exists. Click below to join this store with your existing account.
              </p>
            </div>

            <Form method="post">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Join {data.storeName}
                  </>
                )}
              </button>
            </Form>
          </div>
        </div>
      </div>
    );
  }

  // New user - need to create account
  // At this point, we know data is the success type (not error, not userExists)
  const { storeName, email, role } = data as { storeName: string; email: string; role: string | null; userExists: boolean };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 px-8 py-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join {storeName}</h1>
          <p className="text-purple-100">Create your account to get started as a {roleLabels[role || 'staff'] || role}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Error Message */}
          {actionData && 'error' in actionData && actionData.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Join'
              )}
            </button>
          </Form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-purple-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

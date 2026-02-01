/**
 * Google OAuth Callback Route
 * 
 * Route: /auth/google/callback
 * 
 * Handles the callback from Google, verifies the user, and creates a session.
 * For new users: auto-creates account and redirects to /complete-profile
 * For existing users without store: redirects to /complete-profile
 * For existing users with store: redirects to dashboard
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '@db/schema';
import { getAuthenticator, createUserSession, createGoogleUser } from '~/services/auth.server';
import { logAuditAction } from '~/services/audit.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  // Pass request.url to enable dynamic callback URL detection
  // This ensures the callback URL matches the origin that initiated the OAuth flow
  const authenticator = getAuthenticator(context.cloudflare.env, request.url);

  // 1. Get the user profile from Google (via authenticator)
  const authUser = await authenticator.authenticate('google', request, {
    failureRedirect: '/auth/login?error=google_auth_failed',
  });

  const email = authUser.email.toLowerCase();
  const drizzleDb = drizzle(db);

  // 2. Check if user exists in our DB
  let user = await drizzleDb
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  // 3. If user doesn't exist, auto-create them (Google OAuth signup)
  if (!user) {
    console.log('[auth.google.callback] New Google user, creating account:', email);
    
    // Get name from Google profile (available in authUser from our strategy)
    const name = authUser.email.split('@')[0]; // Fallback to email prefix
    
    const result = await createGoogleUser(email, name, db);
    
    if (result.error || !result.user) {
      console.error('[auth.google.callback] Failed to create Google user:', result.error);
      return redirect('/auth/login?error=account_creation_failed');
    }
    
    user = result.user;
    
    // Log the registration
    try {
      await logAuditAction(context.cloudflare.env, {
        storeId: 0,
        actorId: user.id,
        action: 'register',
        resource: 'user',
        resourceId: user.id,
        diff: { method: 'google_oauth' },
        ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
        userAgent: request.headers.get('User-Agent') || undefined,
      });
    } catch (e) {
      console.error('Failed to log audit for Google registration:', e);
    }
    
    // Redirect new user to complete profile
    return createUserSession(user.id, 0, '/complete-profile', context.cloudflare.env);
  }

  // 4. Existing user - check if they have a store
  if (!user.storeId) {
    // User exists but hasn't completed profile (no store)
    console.log('[auth.google.callback] Existing user without store, redirecting to complete-profile:', email);
    return createUserSession(user.id, 0, '/complete-profile', context.cloudflare.env);
  }
  
  // 5. Log the Login Action
  try {
    await logAuditAction(context.cloudflare.env, {
      storeId: user.storeId,
      actorId: user.id,
      action: 'login',
      resource: 'user',
      resourceId: user.id,
      diff: { method: 'google_oauth' },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
  } catch (e) {
    console.error('Failed to log audit for SSO login:', e);
  }

  // 6. Create Session and Redirect
  let redirectTo = '/app/dashboard';
  const isAdminRole = user.role === 'super_admin' || user.role === 'admin';
  if (isAdminRole) {
    redirectTo = '/admin';
  }

  return createUserSession(user.id, user.storeId, redirectTo, context.cloudflare.env);
}


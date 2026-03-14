/**
 * Google OAuth Callback Route
 *
 * Route: /auth/google/callback
 *
 * Handles the callback from Google, verifies the user, and creates a session.
 * Supports two intents:
 * - signup: New users signing up via Google → redirect to /onboarding?mode=google
 * - login: Existing users signing in via Google → redirect to dashboard
 *
 * For signup intent:
 * - Auto-links existing email/password accounts (no duplicate creation)
 * - Creates minimal merchant user (storeId null) for new Google users
 * - Redirects to onboarding to complete profile (phone, store, subdomain)
 */

import { LoaderFunctionArgs, redirect } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '@db/schema';
import {
  getAuthenticator,
  createUserSession,
  createGoogleUser,
  getSession,
  commitSession,
} from '~/services/auth.server';
import { logAuditAction } from '~/services/audit.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const url = new URL(request.url);

  // Pass request.url to enable dynamic callback URL detection
  // This ensures the callback URL matches the origin that initiated the OAuth flow
  const authenticator = getAuthenticator(context.cloudflare.env, request.url);

  // 1. Get the user profile from Google (via authenticator)
  // We use a try/catch to log the actual error before remix-auth swallows it
  let authUser;
  try {
    authUser = await authenticator.authenticate('google', request);
  } catch (authError) {
    // Re-throw redirects — these are normal OAuth flow responses (Google redirecting user back)
    if (authError instanceof Response && authError.status >= 300 && authError.status < 400) {
      throw authError;
    }

    // Read error details from Response or Error object
    let errorMessage = 'Unknown error';
    let errorCode = 'google_auth_failed';

    // SECURITY: errorMessage contains raw OAuth provider error text (may include infrastructure
    // details like redirect URIs). It must NEVER be sent to the client — only used for
    // server-side classification and logging. Only errorCode reaches the browser via URL.
    if (authError instanceof Response) {
      // remix-auth throws Response objects for auth failures — read the body for real message
      try {
        const rawBody = await authError.clone().text();
        // Cap at 500 chars — Google can return large HTML error pages
        errorMessage = rawBody.length > 500 ? rawBody.slice(0, 500) + '...' : rawBody;
      } catch {
        errorMessage = `HTTP ${authError.status} ${authError.statusText}`;
      }
      console.error('[auth.google.callback] Auth failed with Response:', authError.status, errorMessage);
    } else if (authError instanceof Error) {
      errorMessage = authError.message;
      console.error('[auth.google.callback] Auth failed with Error:', errorMessage);
      if (authError.stack) console.error('[auth.google.callback] Stack:', authError.stack);
    } else {
      errorMessage = String(authError);
      console.error('[auth.google.callback] Auth failed with unknown:', errorMessage);
    }

    // Detect specific failure reasons to return more actionable error codes
    const msgLower = errorMessage.toLowerCase();
    if (msgLower.includes('redirect_uri') || msgLower.includes('redirect uri') || msgLower.includes('callback')) {
      errorCode = 'google_redirect_mismatch';
    } else if (msgLower.includes('access_denied') || msgLower.includes('denied')) {
      errorCode = 'google_access_denied';
    } else if (msgLower.includes('token') || msgLower.includes('code')) {
      errorCode = 'google_token_invalid';
    } else if (msgLower.includes('email') || msgLower.includes('scope')) {
      errorCode = 'google_scope_error';
    }

    console.error('[auth.google.callback] Request URL:', request.url);

    return redirect(`/auth/login?error=${encodeURIComponent(errorCode)}`);
  }

  // 2. Get oauth intent from session
  const session = await getSession(request, context.cloudflare.env);
  const oauthIntent = session.get('oauthIntent') || 'login';

  // Clear the intent from session after reading
  session.unset('oauthIntent');
  const sessionCookie = await commitSession(session, context.cloudflare.env);

  const email = authUser.email.toLowerCase();
  const drizzleDb = drizzle(db);

  // 3. Check if Google email is verified
  // Note: Google OAuth strategy already verifies email, but we double-check
  const emailVerified = authUser.emailVerified ?? true;

  if (!emailVerified) {
    console.warn('[auth.google.callback] Unverified Google email:', email);
    return redirect('/auth/login?error=google_email_not_verified', {
      headers: { 'Set-Cookie': sessionCookie },
    });
  }

  // 4. Check if user exists in our DB
  let user = await drizzleDb.select().from(users).where(eq(users.email, email)).get();

  // =========================================================================
  // SIGNUP INTENT FLOW
  // =========================================================================
  if (oauthIntent === 'signup') {
    if (!user) {
      // New user - create minimal merchant user (no store yet)
      console.log('[auth.google.callback] New Google user (signup intent):', email);

      // Get name from Google profile
      const name = authUser.name || authUser.email.split('@')[0];

      const result = await createGoogleUser(email, name, db);

      if (result.error || !result.user) {
        console.error('[auth.google.callback] Failed to create Google user:', result.error);
        return redirect('/auth/login?error=account_creation_failed', {
          headers: { 'Set-Cookie': sessionCookie },
        });
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
          diff: { method: 'google_oauth_signup' },
          ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
          userAgent: request.headers.get('User-Agent') || undefined,
        });
      } catch (e) {
        console.error('Failed to log audit for Google signup:', e);
      }

      // Redirect new user to onboarding with google mode
      console.log('[auth.google.callback] Redirecting to /onboarding?mode=google');
      return createUserSession(user.id, 0, '/onboarding?mode=google', context.cloudflare.env);
    }

    // User exists - check if they have a store
    if (!user.storeId) {
      // User exists but hasn't completed profile (no store) - auto-link
      console.log(
        '[auth.google.callback] Existing user without store (signup intent), auto-linking:',
        email
      );

      // Log the auto-link
      try {
        await logAuditAction(context.cloudflare.env, {
          storeId: 0,
          actorId: user.id,
          action: 'link',
          resource: 'user',
          resourceId: user.id,
          diff: { method: 'google_oauth_signup', action: 'auto_link_existing_account' },
          ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
          userAgent: request.headers.get('User-Agent') || undefined,
        });
      } catch (e) {
        console.error('Failed to log audit for Google auto-link:', e);
      }

      // Redirect to onboarding with google mode to complete store creation
      return createUserSession(user.id, 0, '/onboarding?mode=google', context.cloudflare.env);
    }

    // User exists with store - this is an auto-link scenario
    // User already has an account with this email (email/password or previous OAuth)
    // Just log them in and redirect to dashboard
    console.log(
      '[auth.google.callback] Existing user with store (signup intent), auto-linking to existing account:',
      email
    );

    // Log the login with auto-link note
    try {
      await logAuditAction(context.cloudflare.env, {
        storeId: user.storeId,
        actorId: user.id,
        action: 'login',
        resource: 'user',
        resourceId: user.id,
        diff: { method: 'google_oauth_signup', action: 'auto_link_existing_account_with_store' },
        ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
        userAgent: request.headers.get('User-Agent') || undefined,
      });
    } catch (e) {
      console.error('Failed to log audit for Google signup auto-link:', e);
    }

    // Redirect to dashboard
    let redirectTo = '/app/orders';
    const isAdminRole = user.role === 'super_admin' || user.role === 'admin';
    if (isAdminRole) {
      redirectTo = '/admin';
    }

    return createUserSession(user.id, user.storeId, redirectTo, context.cloudflare.env);
  }

  // =========================================================================
  // LOGIN INTENT FLOW (existing behavior)
  // =========================================================================

  // 5. If user doesn't exist (shouldn't happen for login intent), redirect to signup
  if (!user) {
    console.warn(
      '[auth.google.callback] User not found for login intent, redirecting to signup:',
      email
    );
    return redirect('/onboarding?error=no_account_found', {
      headers: { 'Set-Cookie': sessionCookie },
    });
  }

  // 6. Existing user - check if they have a store
  if (!user.storeId) {
    // User exists but hasn't completed profile (no store)
    console.warn('[auth.google.callback] Existing user without store (login intent):', email);
    return createUserSession(user.id, 0, '/onboarding?mode=google', context.cloudflare.env);
  }

  // 7. Log the Login Action
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

  // 8. Create Session and Redirect
  let redirectTo = '/app/orders';
  const isAdminRole = user.role === 'super_admin' || user.role === 'admin';
  if (isAdminRole) {
    redirectTo = '/admin';
  }

  return createUserSession(user.id, user.storeId, redirectTo, context.cloudflare.env);
}

export default function () {}

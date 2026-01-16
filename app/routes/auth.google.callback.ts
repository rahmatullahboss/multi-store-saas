/**
 * Google OAuth Callback Route
 * 
 * Route: /auth/google/callback
 * 
 * Handles the callback from Google, verifies the user, and creates a session.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users, stores } from '@db/schema';
import { getAuthenticator, createUserSession } from '~/services/auth.server';
import { logAuditAction } from '~/services/audit.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const authenticator = getAuthenticator(context.cloudflare.env);

  // 1. Get the user profile from Google (via authenticator)
  // The strategy returns a basic profile object (see auth.server.ts)
  const authUser = await authenticator.authenticate('google', request, {
    failureRedirect: '/auth/login',
  });

  const email = authUser.email.toLowerCase();
  const drizzleDb = drizzle(db);

  // 2. Check if user exists in our DB
  let user = await drizzleDb
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  // 3. If user doesn't exist, we might want to:
  //    a) Auto-register them (if we want open signups via Google)
  //    b) Reject them (if we require invitation or manual signup first)
  //    c) For now, let's REJECT if not found to prevent unauthorized access until we decide on a policy.
  //    Wait, typical SaaS flow is "Sign up with Google". 
  //    If we auto-register, we need to create a Store for them too? 
  //    If they are just a staff member, they should be invited first.
  
  // POLICY: Only allow login if email exists. 
  // RATIONALE: Merchants define specific emails. We don't want random people creating accounts without a store flow.
  // EXCEPTION: If we want "Sign Up with Google" on the landing page, we'd need a different flow that asks for Store Name afterwards.
  // For this "Enterprise" phase, let's assume "Login with Google" for existing users.
  
  if (!user) {
    // Optional: Auto-create user if we want to allow new signups?
    // For now, redirect with error
    // We can use session flash for error? Or query param.
    // Let's redirect to login with error.
    return redirect('/auth/login?error=account_not_found'); 
  }

  // 4. Verify Store Association (if merchant)
  if (user.role === 'merchant' && !user.storeId) {
     return redirect('/auth/login?error=store_not_found');
  }
  
  // 5. Log the Login Action
  try {
      await logAuditAction(context.cloudflare.env, {
        storeId: user.storeId || 0,
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
  // Determine redirect URL based on role
  let redirectTo = '/app/dashboard';
  const isAdminRole = user.role === 'super_admin' || user.role === 'admin';
  if (isAdminRole) {
      redirectTo = '/admin/dashboard';
  } else if (!user.storeId) {
      // Non-admin without store (edge case)
      redirectTo = '/'; 
  }

  return createUserSession(user.id, user.storeId || 0, redirectTo, context.cloudflare.env);
}

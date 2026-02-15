/**
 * Lead Gen Google OAuth Callback Route
 * 
 * Route: /lead-gen/auth/google/callback
 * 
 * Handles Google OAuth callback, creates/finds customer, asks for phone if needed.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { customers, stores } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import {
  getCustomerSession,
  commitCustomerSession,
  createTransferToken,
  validateOAuthStateToken,
} from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  if (error) {
    console.error('[lead-gen.auth.google.callback] OAuth error:', error);
    return redirect('/lead-gen/auth/login?error=oauth_failed');
  }
  
  if (!code || !state) {
    return redirect('/lead-gen/auth/login?error=missing_params');
  }

  const stateData = await validateOAuthStateToken(state, context.cloudflare.env);
  if (!stateData) {
    return redirect('/lead-gen/auth/login?error=invalid_state');
  }

  const { storeId, origin: safeOrigin } = stateData;
  
  const env = context.cloudflare.env;
  const db = drizzle(env.DB);
  
  // Get store to reconstruct the redirect URI that was used in auth initiation
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  if (!store) {
    return redirect('/lead-gen/auth/login?error=store_not_found');
  }
  
  // Use the SAME redirect URI that was used in auth initiation
  // Must match what is in lead-gen.auth.google.ts and Google Console
  const authDomain = 'https://app.ozzyl.com';
  const redirectUri = `${authDomain}/lead-gen/auth/google/callback`;
  
  const googleClientId = env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return redirect('/lead-gen/auth/login?error=oauth_not_configured');
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    const tokens = await tokenResponse.json() as { access_token?: string; id_token?: string; error?: string };
    
    if (!tokens.access_token) {
      console.error('[lead-gen.auth.google.callback] Token exchange failed:', tokens);
      return redirect('/lead-gen/auth/login?error=token_exchange_failed');
    }
    
    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const userInfo = await userInfoResponse.json() as { 
      email?: string; 
      name?: string; 
      picture?: string;
      sub?: string;
    };
    
    if (!userInfo.email) {
      return redirect('/lead-gen/auth/login?error=no_email');
    }
    
    // Check if customer exists
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, userInfo.email), eq(customers.storeId, storeId)))
      .limit(1);
    
    let customer = existingCustomer[0];
    
    if (!customer) {
      // Create new customer with Google info
      const [newCustomer] = await db
        .insert(customers)
        .values({
          storeId,
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
          phone: '', // Will need to verify phone
          passwordHash: `google_oauth_${userInfo.sub}`,
          authProvider: 'google',
          googleId: userInfo.sub,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      customer = newCustomer;
    }
    
    // Check if phone is missing - redirect to phone verification
    if (!customer.phone || customer.phone === '') {
      // Redirect to phone verification
      return redirect(`/lead-gen/auth/phone-verify?email=${encodeURIComponent(customer.email || '')}`);
    }
    
    // Update last login
    await db
      .update(customers)
      .set({ lastLoginAt: new Date() })
      .where(eq(customers.id, customer.id));
    
    const currentHost = url.hostname;
    const targetHost = new URL(safeOrigin).hostname;
    const needsTransfer = currentHost !== targetHost;

    if (needsTransfer) {
      const token = await createTransferToken(customer.id, storeId, env);
      const cleanOrigin = safeOrigin.endsWith('/') ? safeOrigin.slice(0, -1) : safeOrigin;
      const transferUrl = `${cleanOrigin}/lead-gen/auth/session-transfer?token=${token}`;
      return redirect(transferUrl);
    }

    // Create session and redirect to dashboard
    const session = await getCustomerSession(new Request('http://localhost'), env);
    session.set('customerId', customer.id);
    session.set('storeId', storeId);

    return redirect('/lead-dashboard', {
      headers: {
        'Set-Cookie': await commitCustomerSession(session, env),
      },
    });
    
  } catch (err) {
    console.error('[lead-gen.auth.google.callback] Error:', err);
    return redirect('/lead-gen/auth/login?error=oauth_exception');
  }
}

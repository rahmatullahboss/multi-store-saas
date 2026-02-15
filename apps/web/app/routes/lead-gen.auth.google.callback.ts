/**
 * Lead Gen Google OAuth Callback Route
 * 
 * Route: /lead-gen/auth/google/callback
 * 
 * Handles Google OAuth callback, creates/finds customer, asks for phone if needed.
 * Critical: Handles multi-tenant session transfer to correct store domain.
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
  consumePkceVerifier,
} from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  if (error) {
    console.error('[lead-gen.auth.google.callback] OAuth error:', error);
    return redirect('/lead-gen/auth/login?error=oauth_failed&details=' + encodeURIComponent(error));
  }
  
  if (!code || !state) {
    return redirect('/lead-gen/auth/login?error=missing_params');
  }

  const stateData = await validateOAuthStateToken(state, context.cloudflare.env);
  if (!stateData) {
    return redirect('/lead-gen/auth/login?error=invalid_state');
  }

  const { storeId, origin: safeOrigin, transactionId } = stateData;
  
  // Retrieve PKCE code verifier
  const codeVerifier = await consumePkceVerifier(transactionId, context.cloudflare.env);
  if (!codeVerifier) {
    console.error('[lead-gen.auth.google.callback] Missing PKCE verifier for transaction:', transactionId);
    return redirect('/lead-gen/auth/login?error=invalid_state&details=missing_pkce');
  }

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
        code_verifier: codeVerifier,
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
    
    // Update last login
    await db
      .update(customers)
      .set({ lastLoginAt: new Date() })
      .where(eq(customers.id, customer.id));

    // ========================================================================
    // MULTI-TENANCY REDIRECTION LOGIC
    // ========================================================================

    // 1. Determine redirect path (Dashboard or Phone Verification?)
    let redirectPath = '/lead-dashboard';
    
    if (!customer.phone || customer.phone === '') {
      // If phone missing, send to verification page
      redirectPath = '/lead-gen/auth/phone-verify';
    }

    // 2. Determine if we need to transfer session to a different domain
    const currentHost = url.hostname; // e.g., app.ozzyl.com
    const targetHost = new URL(safeOrigin).hostname; // e.g., store-abc.ozzyl.com or custom-domain.com
    const needsTransfer = currentHost !== targetHost;

    if (needsTransfer) {
      // Generate transfer token
      const token = await createTransferToken(customer.id, storeId, env);
      
      // Clean up target origin (remove trailing slash)
      const cleanOrigin = safeOrigin.endsWith('/') ? safeOrigin.slice(0, -1) : safeOrigin;
      
      // Redirect to target domain's transfer endpoint with token and final destination
      const transferUrl = `${cleanOrigin}/lead-gen/auth/session-transfer?token=${token}&redirectTo=${encodeURIComponent(redirectPath)}`;
      
      return redirect(transferUrl);
    }

    // 3. Same Domain - Create session locally and redirect
    const session = await getCustomerSession(new Request('http://localhost'), env);
    session.set('customerId', customer.id);
    session.set('storeId', storeId);

    return redirect(redirectPath, {
      headers: {
        'Set-Cookie': await commitCustomerSession(session, env),
      },
    });
    
  } catch (err) {
    console.error('[lead-gen.auth.google.callback] Error:', err);
    return redirect('/lead-gen/auth/login?error=oauth_exception');
  }
}

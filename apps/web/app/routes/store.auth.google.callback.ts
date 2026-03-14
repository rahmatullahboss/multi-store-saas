/**
 * Customer Google OAuth Callback Route
 *
 * Route: /store/auth/google/callback
 *
 * Handles Google OAuth callback for storefront customers.
 * Exchanges authorization code for tokens, creates/updates customer, establishes session.
 * Supports custom domains via state parameter.
 */

import { LoaderFunctionArgs, redirect } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import {
  createCustomerSession,
  consumePkceVerifierForOAuth,
  findOrCreateGoogleCustomer,
  getStoreAllowedOrigins,
  resolveSafeStoreOrigin,
  validateOAuthStateToken,
} from '~/services/customer-auth.server';

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  sub: string; // Google ID
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;
  const url = new URL(request.url);

  // Get authorization code from Google
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle OAuth errors from Google
  if (error) {
    console.warn('[store.auth.google.callback] OAuth error from Google:', error);
    return redirect('/?error=oauth_denied');
  }

  if (!code || !stateParam) {
    console.warn('[store.auth.google.callback] Missing code or state');
    return redirect('/?error=oauth_invalid');
  }

  // Validate signed state parameter (contains storeId and target origin URL)
  const stateData = await validateOAuthStateToken(stateParam, env);
  if (!stateData) {
    console.warn('[store.auth.google.callback] Invalid or replayed state parameter');
    return redirect('/?error=oauth_invalid');
  }
  const storeIdNum = stateData.storeId;
  const codeVerifier = await consumePkceVerifierForOAuth(stateData.transactionId, env);
  if (!codeVerifier) {
    console.warn('[store.auth.google.callback] Missing or expired PKCE verifier');
    return redirect('/?error=oauth_invalid');
  }

  // Get store details
  const drizzleDb = drizzle(db);
  const storeResult = await drizzleDb
    .select({
      id: stores.id,
      subdomain: stores.subdomain,
      customDomain: stores.customDomain,
      planType: stores.planType,
      customGoogleClientId: stores.customGoogleClientId,
      customGoogleClientSecret: stores.customGoogleClientSecret,
    })
    .from(stores)
    .where(eq(stores.id, storeIdNum))
    .limit(1);

  if (!storeResult || storeResult.length === 0) {
    return redirect('/?error=store_not_found');
  }

  const store = storeResult[0];
  const allowedOrigins = getStoreAllowedOrigins(store, env);
  const safeOrigin = resolveSafeStoreOrigin(stateData.origin, allowedOrigins, allowedOrigins[0] || url.origin);

  // Determine OAuth credentials
  const isPremium = ['premium', 'business', 'custom'].includes(store.planType || '');
  const hasCustomOAuth = isPremium && store.customGoogleClientId && store.customGoogleClientSecret;

  const googleClientId = hasCustomOAuth ? store.customGoogleClientId! : env.GOOGLE_CLIENT_ID;

  const googleClientSecret = hasCustomOAuth
    ? store.customGoogleClientSecret!
    : env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return redirect(`${safeOrigin}?error=oauth_not_configured`);
  }

  // Callback URL (must match what was registered)
  // Callback URL (must match what was registered)
  // FIX: Use app.ozzyl.com because ozzyl.com points to Vercel
  const authDomain = 'https://app.ozzyl.com';
  const callbackUrl = `${authDomain}/store/auth/google/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[store.auth.google.callback] Token exchange failed:', errorData);
      return redirect(`${safeOrigin}?error=oauth_token_failed`);
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('[store.auth.google.callback] Failed to get user info');
      return redirect(`${safeOrigin}?error=oauth_userinfo_failed`);
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // Find or create the customer
    const { customer, isNew } = await findOrCreateGoogleCustomer(
      storeIdNum,
      userInfo.sub, // Google ID
      userInfo.email,
      userInfo.name || null,
      db
    );

    console.warn(
      `[store.auth.google.callback] Customer ${isNew ? 'created' : 'logged in'}:`,
      customer.id,
      'for store:',
      storeIdNum
    );

    // ========================================================================
    // CHECK IF PHONE NUMBER IS REQUIRED
    // ========================================================================
    // For Bangladesh market, phone number is essential for delivery
    // Redirect to profile completion if phone is missing
    if (!customer.phone || customer.phone.trim().length === 0) {
      console.warn(`[store.auth.google.callback] Customer ${customer.id} needs phone number`);

      // Check if we need cross-domain transfer
      const currentHost = new URL(request.url).hostname;
      const targetHost = new URL(safeOrigin).hostname;

      const needsTransfer = currentHost !== targetHost;

      if (needsTransfer) {
        // Create transfer token and redirect to target domain's profile completion
        const { createTransferToken } = await import('~/services/customer-auth.server');
        const token = await createTransferToken(customer.id, storeIdNum, env);
        const cleanOrigin = safeOrigin.endsWith('/') ? safeOrigin.slice(0, -1) : safeOrigin;
        const transferUrl = `${cleanOrigin}/store/auth/session-transfer?token=${token}&redirectTo=/account/complete-profile`;
        return redirect(transferUrl);
      }

      // Same domain - create session and redirect to profile completion
      return createCustomerSession(customer.id, storeIdNum, '/account/complete-profile', env);
    }

    // ========================================================================
    // CROSS-DOMAIN SESSION HANDLING
    // ========================================================================

    // Check if we need to transfer session to a different domain
    // originUrl is where the user came from (e.g. https://mystore.com)
    // current request.url is the callback (e.g. https://ozzyl.com/store/auth/...)

    const currentHost = new URL(request.url).hostname;
    const targetHost = new URL(safeOrigin).hostname;

    const needsTransfer = currentHost !== targetHost;

    if (needsTransfer) {
      console.warn(`[GoogleCallback] Transferring session from ${currentHost} to ${targetHost}`);

      const { createTransferToken } = await import('~/services/customer-auth.server');

      const token = await createTransferToken(customer.id, storeIdNum, env);

      // Redirect to the target domain's transfer endpoint
      // This will set the cookie on the target domain
      const cleanOrigin = safeOrigin.endsWith('/') ? safeOrigin.slice(0, -1) : safeOrigin;
      const transferUrl = `${cleanOrigin}/store/auth/session-transfer?token=${token}`;

      return redirect(transferUrl);
    }

    // Same-domain handling.
    const redirectUrl = `${safeOrigin}/account`;

    // Create customer session and redirect
    return createCustomerSession(customer.id, storeIdNum, redirectUrl, env);
  } catch (error) {
    console.error('[store.auth.google.callback] OAuth error:', error);
    return redirect(`${safeOrigin}?error=oauth_failed`);
  }
}


export default function() {}

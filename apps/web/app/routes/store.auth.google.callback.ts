/**
 * Customer Google OAuth Callback Route
 *
 * Route: /store/auth/google/callback
 *
 * Handles Google OAuth callback for storefront customers.
 * Exchanges authorization code for tokens, creates/updates customer, establishes session.
 * Supports custom domains via state parameter.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import {
  createCustomerSession,
  findOrCreateGoogleCustomer,
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
    console.error('[store.auth.google.callback] OAuth error from Google:', error);
    return redirect('/?error=oauth_denied');
  }

  if (!code || !stateParam) {
    console.error('[store.auth.google.callback] Missing code or state');
    return redirect('/?error=oauth_invalid');
  }

  // Decode state parameter (contains storeId and origin URL)
  let storeIdNum: number;
  let originUrl: string;

  try {
    const stateData = JSON.parse(atob(stateParam));
    storeIdNum = stateData.storeId;
    originUrl = stateData.origin || '/';
  } catch (e) {
    console.error('[store.auth.google.callback] Invalid state parameter');
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
    return redirect(`${originUrl}?error=store_not_found`);
  }

  const store = storeResult[0];

  // Determine OAuth credentials
  const isPremium = ['premium', 'business', 'custom'].includes(store.planType || '');
  const hasCustomOAuth = isPremium && store.customGoogleClientId && store.customGoogleClientSecret;

  const googleClientId = hasCustomOAuth
    ? store.customGoogleClientId!
    : env.GOOGLE_CLIENT_ID;

  const googleClientSecret = hasCustomOAuth
    ? store.customGoogleClientSecret!
    : env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return redirect(`${originUrl}?error=oauth_not_configured`);
  }

  // Callback URL (must match what was registered)
  const saasDomain = env.SAAS_DOMAIN?.startsWith('http') 
    ? env.SAAS_DOMAIN 
    : `https://${env.SAAS_DOMAIN}`;
  const callbackUrl = `${saasDomain}/store/auth/google/callback`;

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
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[store.auth.google.callback] Token exchange failed:', errorData);
      return redirect(`${originUrl}?error=oauth_token_failed`);
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('[store.auth.google.callback] Failed to get user info');
      return redirect(`${originUrl}?error=oauth_userinfo_failed`);
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

    console.log(
      `[store.auth.google.callback] Customer ${isNew ? 'created' : 'logged in'}:`,
      customer.id,
      'for store:',
      storeIdNum
    );

    // Build redirect URL - use origin from state (supports custom domains)
    const redirectUrl = originUrl.startsWith('http') ? originUrl : '/';

    // Create customer session and redirect
    return createCustomerSession(customer.id, storeIdNum, redirectUrl, env);
  } catch (error) {
    console.error('[store.auth.google.callback] OAuth error:', error);
    return redirect(`${originUrl}?error=oauth_failed`);
  }
}

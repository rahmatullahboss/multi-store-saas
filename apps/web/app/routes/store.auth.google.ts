/**
 * Customer Google OAuth Initiation Route
 *
 * Route: /store/auth/google
 *
 * Initiates Google OAuth for storefront customers.
 * Uses store's custom OAuth if configured (Premium), otherwise shared platform OAuth.
 * Supports custom domains by encoding origin URL in OAuth state parameter.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { canStoreUseGoogleAuth } from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;
  const url = new URL(request.url);

  // Get storeId from query param
  const storeId = url.searchParams.get('storeId');
  if (!storeId) {
    console.error('[store.auth.google] Missing storeId');
    return redirect('/?error=missing_store');
  }

  const storeIdNum = parseInt(storeId);

  // Get the origin domain for redirect after OAuth (supports custom domains)
  // Passed from frontend: /store/auth/google?storeId=123&origin=https://custom-domain.com
  const originUrl = url.searchParams.get('origin') || url.origin;

  // Check if store can use Google Auth
  const canUse = await canStoreUseGoogleAuth(storeIdNum, db);
  if (!canUse) {
    console.error('[store.auth.google] Store cannot use Google Auth:', storeIdNum);
    return redirect(`${originUrl}?error=oauth_not_available`);
  }

  // Get store details to check for custom OAuth
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
  // Premium/Business with custom OAuth configured → use their credentials
  // Otherwise → use shared platform credentials
  const isPremium = ['premium', 'business', 'custom'].includes(store.planType || '');
  const hasCustomOAuth = isPremium && store.customGoogleClientId && store.customGoogleClientSecret;

  const googleClientId = hasCustomOAuth
    ? store.customGoogleClientId!
    : env.GOOGLE_CLIENT_ID;

  const googleClientSecret = hasCustomOAuth
    ? store.customGoogleClientSecret!
    : env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    console.error('[store.auth.google] Google OAuth not configured');
    return redirect(`${originUrl}?error=oauth_not_configured`);
  }

  // IMPORTANT: Callback URL must be on the main SAAS domain (registered in Google Console)
  const saasDomain = env.SAAS_DOMAIN?.startsWith('http') 
    ? env.SAAS_DOMAIN 
    : `https://${env.SAAS_DOMAIN}`;
  const callbackUrl = `${saasDomain}/store/auth/google/callback`;

  // Build state parameter with storeId and origin (for redirect after OAuth)
  // This is passed through OAuth and returned in callback
  const stateData = { storeId: storeIdNum, origin: originUrl };
  const state = btoa(JSON.stringify(stateData));

  // Build Google OAuth authorization URL with state
  const scopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', googleClientId);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', scopes.join(' '));
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'online');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  console.log('[store.auth.google] Redirecting to Google OAuth for store:', storeIdNum);

  // Redirect to Google
  return redirect(googleAuthUrl.toString());
}

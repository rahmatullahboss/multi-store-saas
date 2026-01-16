/**
 * Customer Google OAuth Initiation Route
 *
 * Route: /store/auth/google
 *
 * Initiates Google OAuth for storefront customers.
 * Uses store's custom OAuth if configured (Premium), otherwise shared platform OAuth.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import { getCustomerSessionStorage, canStoreUseGoogleAuth } from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;
  const url = new URL(request.url);

  // Get storeId from query param or header (set by tenant middleware)
  const storeId = url.searchParams.get('storeId');
  if (!storeId) {
    console.error('[store.auth.google] Missing storeId');
    return redirect('/?error=missing_store');
  }

  const storeIdNum = parseInt(storeId);

  // Check if store can use Google Auth
  const canUse = await canStoreUseGoogleAuth(storeIdNum, db);
  if (!canUse) {
    console.error('[store.auth.google] Store cannot use Google Auth:', storeIdNum);
    return redirect('/?error=oauth_not_available');
  }

  // Get store details to check for custom OAuth
  const drizzleDb = drizzle(db);
  const storeResult = await drizzleDb
    .select({
      id: stores.id,
      subdomain: stores.subdomain,
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
    return redirect('/?error=oauth_not_configured');
  }

  // Build callback URL
  const callbackUrl = `${env.SAAS_DOMAIN}/store/auth/google/callback?storeId=${storeIdNum}`;

  // Create authenticator with appropriate credentials
  const sessionStorage = getCustomerSessionStorage(env);
  const authenticator = new Authenticator<{ email: string; name: string | null; googleId: string }>();

  const googleStrategy = new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: callbackUrl,
    },
    async ({ profile }) => ({
      email: profile.emails[0].value,
      name: profile.displayName || null,
      googleId: profile.id,
    })
  );

  authenticator.use(googleStrategy);

  // Store storeId in session for callback
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  session.set('pendingStoreId' as any, storeIdNum);

  // Redirect to Google
  return await authenticator.authenticate('google', request, {
    successRedirect: callbackUrl,
    failureRedirect: `/?error=oauth_failed&storeId=${storeIdNum}`,
  });
}

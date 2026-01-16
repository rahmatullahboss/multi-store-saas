/**
 * Customer Google OAuth Callback Route
 *
 * Route: /store/auth/google/callback
 *
 * Handles Google OAuth callback for storefront customers.
 * Creates/updates customer record and establishes session.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import {
  getCustomerSessionStorage,
  createCustomerSession,
  findOrCreateGoogleCustomer,
} from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;
  const url = new URL(request.url);

  // Get storeId from query param
  const storeId = url.searchParams.get('storeId');
  if (!storeId) {
    console.error('[store.auth.google.callback] Missing storeId');
    return redirect('/?error=missing_store');
  }

  const storeIdNum = parseInt(storeId);

  // Get store details
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

  // Determine OAuth credentials (same logic as initiation)
  const isPremium = ['premium', 'business', 'custom'].includes(store.planType || '');
  const hasCustomOAuth = isPremium && store.customGoogleClientId && store.customGoogleClientSecret;

  const googleClientId = hasCustomOAuth
    ? store.customGoogleClientId!
    : env.GOOGLE_CLIENT_ID;

  const googleClientSecret = hasCustomOAuth
    ? store.customGoogleClientSecret!
    : env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return redirect('/?error=oauth_not_configured');
  }

  // Build callback URL (must match what was used in initiation)
  const callbackUrl = `${env.SAAS_DOMAIN}/store/auth/google/callback?storeId=${storeIdNum}`;

  // Create authenticator
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

  try {
    // Authenticate the callback
    const authResult = await authenticator.authenticate('google', request, {
      failureRedirect: `/?error=oauth_failed&storeId=${storeIdNum}`,
    });

    // Find or create the customer
    const { customer, isNew } = await findOrCreateGoogleCustomer(
      storeIdNum,
      authResult.googleId,
      authResult.email,
      authResult.name,
      db
    );

    console.log(
      `[store.auth.google.callback] Customer ${isNew ? 'created' : 'logged in'}:`,
      customer.id,
      'for store:',
      storeIdNum
    );

    // Build store URL for redirect
    const storeUrl = store.subdomain
      ? `https://${store.subdomain}.${env.SAAS_DOMAIN?.replace('https://', '')}`
      : '/';

    // Create customer session and redirect to store
    return createCustomerSession(customer.id, storeIdNum, storeUrl, env);
  } catch (error) {
    console.error('[store.auth.google.callback] OAuth error:', error);
    return redirect(`/?error=oauth_failed&storeId=${storeIdNum}`);
  }
}

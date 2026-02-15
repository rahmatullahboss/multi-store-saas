/**
 * Lead Gen Google OAuth Initiation Route
 * 
 * Route: /lead-gen/auth/google
 * 
 * Simple Google OAuth for lead gen customers.
 * After login, redirects to lead-dashboard.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { resolveStore } from '~/lib/store.server';
import {
  createOAuthAuthorizationRequest,
  getStoreAllowedOrigins,
  resolveSafeStoreOrigin,
} from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const env = context.cloudflare.env;
  const storeContext = await resolveStore(context, request);
  
  if (!storeContext) {
    return redirect('/lead-gen/auth/login?error=no_store');
  }
  
  const storeId = storeContext.storeId;
  const store = storeContext.store;

  // Check for Google Client ID
  const googleClientId = env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    console.error('[lead-gen.auth.google] Missing GOOGLE_CLIENT_ID');
    return redirect('/lead-gen/auth/login?error=oauth_not_configured');
  }

  const requestedOrigin = url.searchParams.get('origin');
  const allowedOrigins = getStoreAllowedOrigins(store, env);
  const fallbackOrigin = allowedOrigins[0] || url.origin;
  const safeOrigin = resolveSafeStoreOrigin(requestedOrigin ?? url.origin, allowedOrigins, fallbackOrigin);

  const oauthRequest = await createOAuthAuthorizationRequest(storeId, safeOrigin, env);

  // Use the main app domain for auth callbacks to avoid redirect_uri_mismatch
  // This domain is whitelisted in Google Console
  const authDomain = 'https://app.ozzyl.com';
  const redirectUri = `${authDomain}/lead-gen/auth/google/callback`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', googleClientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', oauthRequest.state);
  googleAuthUrl.searchParams.set('code_challenge', oauthRequest.codeChallenge);
  googleAuthUrl.searchParams.set('code_challenge_method', oauthRequest.codeChallengeMethod);
  googleAuthUrl.searchParams.set('access_type', 'online');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return redirect(googleAuthUrl.toString());
}

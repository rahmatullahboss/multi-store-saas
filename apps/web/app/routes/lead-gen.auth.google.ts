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

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const env = context.cloudflare.env as { GOOGLE_CLIENT_ID?: string };
  const storeContext = await resolveStore(context, request);
  
  if (!storeContext) {
    return redirect('/lead-gen/auth/login?error=no_store');
  }
  
  const storeId = storeContext.storeId;
  
  // Check for Google Client ID
  const googleClientId = env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    console.error('[lead-gen.auth.google] Missing GOOGLE_CLIENT_ID');
    return redirect('/lead-gen/auth/login?error=oauth_not_configured');
  }
  
  const baseUrl = url.origin;
  const redirectUri = `${baseUrl}/lead-gen/auth/google/callback`;
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', googleClientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', String(storeId));
  googleAuthUrl.searchParams.set('access_type', 'online');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  
  return redirect(googleAuthUrl.toString());
}

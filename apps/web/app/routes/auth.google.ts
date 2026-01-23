/**
 * Google OAuth Initiation Route
 * 
 * Route: /auth/google
 * 
 * Redirects user to Google's OAuth login page.
 */

import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from '@remix-run/cloudflare';
import { getAuthenticator } from '~/services/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context.cloudflare.env);
  
  // Check if Google OAuth is configured
  if (!context.cloudflare.env.GOOGLE_CLIENT_ID || !context.cloudflare.env.GOOGLE_CLIENT_SECRET) {
    console.error('[auth.google] Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return redirect('/auth/login?error=oauth_not_configured');
  }
  
  // Authenticate using the "google" strategy
  // This will redirect the user to Google
  return await authenticator.authenticate('google', request);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const authenticator = getAuthenticator(context.cloudflare.env);
  
  // Authenticate using the "google" strategy
  // This will redirect the user to Google
  return await authenticator.authenticate('google', request);
}

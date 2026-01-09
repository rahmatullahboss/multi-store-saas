/**
 * Google OAuth Initiation Route
 * 
 * Route: /auth/google
 * 
 * Redirects user to Google's OAuth login page.
 */

import { ActionFunctionArgs, redirect } from '@remix-run/cloudflare';
import { getAuthenticator } from '~/services/auth.server';

export async function loader() {
  return redirect('/auth/login');
}

export async function action({ request, context }: ActionFunctionArgs) {
  const authenticator = getAuthenticator(context.cloudflare.env);
  
  // Authenticate using the "google" strategy
  // This will redirect the user to Google
  return await authenticator.authenticate('google', request);
}

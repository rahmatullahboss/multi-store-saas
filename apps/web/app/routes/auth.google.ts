/**
 * Google OAuth Initiation Route
 *
 * Route: /auth/google
 *
 * Redirects user to Google's OAuth login page.
 * Supports optional `intent` parameter:
 * - intent=signup: For new users signing up via Google
 * - intent=login: Default, for existing users signing in
 *
 * The intent is persisted in the session cookie for tamper-safe handling in callback.
 */

import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from '@remix-run/cloudflare';
import { getAuthenticator, getSession, commitSession } from '~/services/auth.server';

function mergeSessionCookie(existingCookieHeader: string | null, newSessionCookiePair: string): string {
  if (!existingCookieHeader || existingCookieHeader.trim().length === 0) {
    return newSessionCookiePair;
  }

  const nextCookies = existingCookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !part.startsWith('__session='));

  nextCookies.push(newSessionCookiePair);
  return nextCookies.join('; ');
}

async function authenticateWithIntent(request: Request, env: Env, intent: 'signup' | 'login') {
  const session = await getSession(request, env);
  session.set('oauthIntent', intent);

  // commitSession returns Set-Cookie; Cookie header must only contain key=value pairs.
  const committed = await commitSession(session, env);
  const sessionCookiePair = committed.split(';')[0];
  const mergedCookie = mergeSessionCookie(request.headers.get('Cookie'), sessionCookiePair);

  const headers = new Headers(request.headers);
  headers.set('Cookie', mergedCookie);

  const authRequest = new Request(request.url, {
    method: 'GET',
    headers,
  });

  const authenticator = getAuthenticator(env, request.url);
  return authenticator.authenticate('google', authRequest);
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Check if Google OAuth is configured
  if (!context.cloudflare.env.GOOGLE_CLIENT_ID || !context.cloudflare.env.GOOGLE_CLIENT_SECRET) {
    console.error(
      '[auth.google] Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET'
    );
    return redirect('/auth/login?error=oauth_not_configured');
  }

  // Parse intent from query params
  const url = new URL(request.url);
  const intent = url.searchParams.get('intent')?.toLowerCase();

  // Only allow 'signup' or 'login' - default to 'login' for invalid values
  const validIntent = intent === 'signup' ? 'signup' : 'login';

  console.log('[auth.google] OAuth intent:', validIntent);

  return authenticateWithIntent(request, context.cloudflare.env, validIntent);
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Check if Google OAuth is configured
  if (!context.cloudflare.env.GOOGLE_CLIENT_ID || !context.cloudflare.env.GOOGLE_CLIENT_SECRET) {
    console.error('[auth.google] Google OAuth not configured');
    return redirect('/auth/login?error=oauth_not_configured');
  }

  // Parse intent from form data
  const formData = await request.formData();
  const intent = formData.get('intent')?.toString()?.toLowerCase();

  // Only allow 'signup' or 'login' - default to 'login'
  const validIntent = intent === 'signup' ? 'signup' : 'login';

  return authenticateWithIntent(request, context.cloudflare.env, validIntent);
}

export default function () {}

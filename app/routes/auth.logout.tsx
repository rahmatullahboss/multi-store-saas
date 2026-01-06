/**
 * Logout Route
 * 
 * POST: Destroy session, redirect to home
 * GET: Destroy session, redirect to login (for direct navigation)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { logout, getSession, destroySession } from '~/services/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

// Handle GET requests - clear session and redirect to login
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect') || '/auth/login';
  
  const session = await getSession(request.headers.get('Cookie'));
  
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

/**
 * Logout Route
 * 
 * POST: Destroy session, redirect to home
 * GET: Destroy session, redirect to login (for direct navigation)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { logout, getSession, destroySession } from '~/services/auth.server';

export async function action({ request, context }: ActionFunctionArgs) {
  return logout(request, context.cloudflare.env);
}

// Handle GET requests - clear session and redirect to login
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect') || '/auth/login';
  
  const session = await getSession(request, context.cloudflare.env);
  
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await destroySession(session, context.cloudflare.env),
    },
  });
}


export default function() {}

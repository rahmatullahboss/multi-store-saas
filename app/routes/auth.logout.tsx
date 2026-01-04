/**
 * Logout Route
 * 
 * POST: Destroy session, redirect to home
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { logout } from '~/services/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

// Redirect GET requests to home
export async function loader() {
  return redirect('/');
}

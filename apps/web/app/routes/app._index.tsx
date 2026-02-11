/**
 * App Index Route
 * 
 * Redirects /app to /app/dashboard
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect('/app/dashboard');
}


export default function() {}

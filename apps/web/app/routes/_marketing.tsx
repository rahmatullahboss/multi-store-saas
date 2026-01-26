/**
 * Root Marketing Route - REDIRECT TO LANDING
 *
 * Landing page moved to Next.js app on Vercel
 * Redirect all marketing traffic to ozzyl.com
 */

import { redirect } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // If accessing app.ozzyl.com - show auth/dashboard
  if (url.hostname.startsWith('app.')) {
    return redirect('/auth/login');
  }

  // All other traffic - redirect to main landing
  return redirect('https://ozzyl.com', 301);
}

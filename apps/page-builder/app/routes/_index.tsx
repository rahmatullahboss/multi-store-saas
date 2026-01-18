/**
 * Index route - redirects to main app
 */

import { redirect } from '@remix-run/cloudflare';

export async function loader({ context }: any) {
  const mainAppUrl = context.cloudflare.env.MAIN_APP_URL || 'https://ozzyl.com';
  return redirect(`${mainAppUrl}/app/page-builder`);
}

export default function Index() {
  return null;
}

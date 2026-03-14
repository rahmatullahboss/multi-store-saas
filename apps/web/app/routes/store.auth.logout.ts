/**
 * Customer Logout Route
 *
 * Route: /store/auth/logout
 *
 * Destroys customer session and redirects to store homepage.
 */

import { LoaderFunctionArgs } from 'react-router';
import { logoutCustomer, getCustomerStoreId } from '~/services/customer-auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;

  // Get store from session
  const storeId = await getCustomerStoreId(request, env);

  let redirectUrl = '/';

  if (storeId) {
    const drizzleDb = drizzle(db);
    const storeResult = await drizzleDb
      .select({ subdomain: stores.subdomain })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (storeResult.length > 0 && storeResult[0].subdomain) {
      // Redirect to store's homepage
      const baseDomain = env.SAAS_DOMAIN?.replace('https://', '') || 'localhost:5173';
      redirectUrl = `https://${storeResult[0].subdomain}.${baseDomain}`;
    }
  }

  return logoutCustomer(request, redirectUrl, env);
}


export default function() {}

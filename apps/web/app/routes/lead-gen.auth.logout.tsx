/**
 * Lead Gen Logout
 */

import { redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { destroyCustomerSession } from '~/services/customer-auth.server';

export async function action({ context }: ActionFunctionArgs) {
  return destroyCustomerSession('/lead-gen/auth/login', context.cloudflare.env);
}

export async function loader() {
  return redirect('/lead-gen/auth/login');
}

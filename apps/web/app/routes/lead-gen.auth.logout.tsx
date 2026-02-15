/**
 * Lead Gen Logout
 */

import { redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { logoutCustomer } from '~/services/customer-auth.server';

export async function action({ request, context }: ActionFunctionArgs) {
  return logoutCustomer(request, '/lead-gen/auth/login', context.cloudflare.env);
}

export async function loader() {
  return redirect('/lead-gen/auth/login');
}

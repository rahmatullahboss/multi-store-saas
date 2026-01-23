import { ActionFunctionArgs, redirect } from '@remix-run/cloudflare';
import { getSession, commitSession } from '~/services/auth.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await getSession(request, context.cloudflare.env);
  const originalAdminId = session.get('originalAdminId');
  
  if (!originalAdminId) {
    // Not impersonating
    return redirect('/auth/login');
  }
  
  // Restore admin session
  session.set('userId', originalAdminId);
  
  // Remove impersonation context
  session.unset('storeId');
  session.unset('originalAdminId');
  
  return redirect('/admin/stores', {
    headers: {
      'Set-Cookie': await commitSession(session, context.cloudflare.env),
    },
  });
}

export async function loader() {
  return redirect('/admin');
}

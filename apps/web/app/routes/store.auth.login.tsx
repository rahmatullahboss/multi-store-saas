/**
 * Store Customer Login Route
 *
 * Route: /store/auth/login
 *
 * Allows customers to sign in to a specific store using Email/Password
 * or Google OAuth (if enabled).
 */

import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useActionData, Form, Link, useNavigation, useSearchParams } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import {
  getCustomerId,
  loginCustomer,
  createCustomerSession,
  canStoreUseGoogleAuth,
} from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  // 1. Resolve store context
  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const env = context.cloudflare.env;

  // 2. Check if already logged in
  const existingCustomerId = await getCustomerId(request, env);
  if (existingCustomerId) {
    // Redirect to account or home
    return redirect('/account');
  }

  // 3. Check Google Auth availability
  const canUseGoogle = await canStoreUseGoogleAuth(storeId, env.DB);
  
  // 4. Get template theme
  const templateId = (store.themeConfig as any)?.storeTemplateId || 
                     (store.theme as string) || 
                     'starter-store';

  return json({
    store: {
      id: store.id,
      name: store.name,
      logo: store.logo,
      templateId,
      subdomain: store.subdomain,
      currency: store.currency,
      planType: store.planType,
    },
    canUseGoogle,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const formData = await request.formData();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/account';

  if (!email || !password) {
    return json({ error: 'Please provide both email and password' }, { status: 400 });
  }

  const result = await loginCustomer({
    storeId,
    email,
    password,
    db: env.DB,
  });

  if (result.error || !result.customer) {
    return json({ error: result.error }, { status: 400 });
  }

  return createCustomerSession(result.customer.id, storeId, redirectTo, env);
}

export default function StoreLogin() {
  const { store, canUseGoogle } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  
  const theme = getStoreTemplateTheme(store.templateId);
  const isSubmitting = navigation.state === 'submitting';
  
  // Get dynamic redirect URL
  const redirectTo = searchParams.get('redirectTo') || '/account';

  return (
    <StorePageWrapper
      storeName={store.name}
      storeId={store.id}
      logo={store.logo}
      templateId={store.templateId}
      theme={theme}
      currency={store.currency || 'BDT'}
      planType={store.planType}
      // Hide header/footer if needed, but usually we want them
    >
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
              Welcome back
            </h2>
            <p className="mt-2 text-gray-500">
              Sign in to your account
            </p>
          </div>

          <Form method="post" className="mt-8 space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            
            {actionData?.error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {actionData.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-shadow"
                    style={{ '--tw-ring-color': theme.primary } as any}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-shadow"
                    style={{ '--tw-ring-color': theme.primary } as any}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  style={{ color: theme.primary }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium hover:opacity-80 transition-opacity" style={{ color: theme.primary }}>
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: theme.primary, '--tw-ring-color': theme.primary } as any}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {canUseGoogle && (
                <a
                  href={`/store/auth/google?storeId=${store.id}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </a>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/store/auth/register" 
                className="font-medium hover:underline transition-all"
                style={{ color: theme.primary }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </StorePageWrapper>
  );
}

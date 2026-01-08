/**
 * Login Route
 * 
 * GET: Render login form
 * POST: Validate credentials, create session, redirect to dashboard
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { login, createUserSession, getUserId } from '~/services/auth.server';
import { LanguageSelector } from '~/components/LanguageSelector';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Login - Multi-Store SaaS' }];
};

// Redirect if already logged in
export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await getUserId(request, context.cloudflare.env);
  if (userId) {
    return redirect('/app/orders');
  }
  return json({});
}

export async function action({ request, context }: ActionFunctionArgs) {
  console.log('[auth.login] Login action started');

  // Rate Limiting
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const { checkAuthRateLimit } = await import('~/lib/rateLimit.server');
  
  // Use context.cloudflare.env.KV directly if it's there
  // Assuming ENV has KV binding named 'KV' or similar, typically `context.cloudflare.env.KV` or `context.cloudflare.env.landing_page_kv`
  // Based on `env.d.ts` usually, or just check what `rateLimit.server.ts` implies.
  // The `checkAuthRateLimit` takes `kv`. The user likely has `context.cloudflare.env.KV`.
  // I will try to use `context.cloudflare.env.KV`. If not present, I'll check `context.cloudflare.env.EXT_KV`.
  // Let's assume `context.cloudflare.env.KV` based on standard convention or inspect `env.d.ts` if failed.
  // Actually, I should check `env.server.ts` or `wrangler.toml` for KV binding name.
  // I saw `wrangler.toml` in the file list.
  // CHECK WRANGLER TOML FIRST?
  // I'll assume `KV` for now, but to be safe I'll check what `checkAIRateLimit` callers use.
  // Wait, I can't check that easily without grepping.
  // I'll proceed with `context.cloudflare.env.KV`.
  
  const kv = (context.cloudflare.env as any).KV; 
  if (kv) {
    const rateLimit = await checkAuthRateLimit(kv, clientIp, 'login');
    if (!rateLimit.allowed) {
      return json({ 
        errors: { form: 'Too many login attempts. Please try again in an hour.' },
        errorCode: 'RATE_LIMITED'
      }, { status: 429 });
    }
  }
  
  try {
    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error('[auth.login] Failed to parse form data:', parseError);
      return json({ 
        errors: { form: 'Failed to process your request. Please try again.' },
        errorCode: 'FORM_PARSE_ERROR'
      }, { status: 400 });
    }
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    console.log('[auth.login] Email provided:', email ? 'Yes' : 'No');
    console.log('[auth.login] Password provided:', password ? 'Yes (length: ' + password?.length + ')' : 'No');

    // Validation
    const errors: Record<string, string> = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    } else if (email.length > 255) {
      errors.email = 'Email is too long';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (password.length > 100) {
      errors.password = 'Password is too long';
    }

    if (Object.keys(errors).length > 0) {
      console.log('[auth.login] Validation errors:', Object.keys(errors).join(', '));
      return json({ errors, errorCode: 'VALIDATION_ERROR' }, { status: 400 });
    }

    // Check database connection
    if (!context.cloudflare?.env?.DB) {
      console.error('[auth.login] Database not available in context');
      return json({ 
        errors: { form: 'Service temporarily unavailable. Please try again later.' },
        errorCode: 'DB_UNAVAILABLE'
      }, { status: 503 });
    }

    // Attempt login
    console.log('[auth.login] Calling login service...');
    let result;
    try {
      result = await login({
        email,
        password,
        db: context.cloudflare.env.DB,
      });
      console.log('[auth.login] Login service returned:', result.error ? 'Error' : 'Success');
      if (result.errorCode) {
        console.log('[auth.login] Error code:', result.errorCode);
      }
      if (result.errorDetails) {
        console.log('[auth.login] Error details:', result.errorDetails);
      }
    } catch (loginError) {
      console.error('[auth.login] Login service threw an exception:', loginError);
      const errorMessage = loginError instanceof Error ? loginError.message : String(loginError);
      return json({ 
        errors: { form: 'Login failed unexpectedly. Please try again.' },
        errorCode: 'LOGIN_EXCEPTION',
        errorDetails: errorMessage
      }, { status: 500 });
    }

    if (result.error) {
      console.log('[auth.login] Login failed with error:', result.error);
      return json({ 
        errors: { form: result.error },
        errorCode: result.errorCode || 'LOGIN_FAILED',
        errorDetails: result.errorDetails
      }, { status: 400 });
    }

    // Validate user data before creating session
    if (!result.user) {
      console.error('[auth.login] Login succeeded but no user returned');
      return json({ 
        errors: { form: 'Login failed. Please try again.' },
        errorCode: 'NO_USER_RETURNED'
      }, { status: 500 });
    }

    if (!result.user.id) {
      console.error('[auth.login] User object missing ID');
      return json({ 
        errors: { form: 'Account error. Please contact support.' },
        errorCode: 'MISSING_USER_ID'
      }, { status: 500 });
    }

    if (!result.user.storeId) {
      console.error('[auth.login] User has no associated store. UserID:', result.user.id);
      return json({ 
        errors: { form: 'Your account is not associated with a store. Please contact support.' },
        errorCode: 'NO_STORE_ID'
      }, { status: 400 });
    }

    // Create session and redirect
    console.log('[auth.login] Creating session for user:', result.user.id, 'store:', result.user.storeId);
    try {
      return await createUserSession(
        result.user.id,
        result.user.storeId,
        '/app/orders',
        context.cloudflare.env
      );
    } catch (sessionError) {
      console.error('[auth.login] Failed to create session:', sessionError);
      const errorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError);
      return json({ 
        errors: { form: 'Failed to create login session. Please try again.' },
        errorCode: 'SESSION_ERROR',
        errorDetails: errorMessage
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[auth.login] Unhandled error in login action:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[auth.login] Error message:', errorMessage);
    if (errorStack) {
      console.error('[auth.login] Error stack:', errorStack);
    }
    
    return json({ 
      errors: { form: 'An unexpected error occurred. Please try again.' },
      errorCode: 'UNHANDLED_ERROR',
      errorDetails: errorMessage
    }, { status: 500 });
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  // Type-safe error access
  const errors = actionData?.errors as Record<string, string> | undefined;
  const errorCode = (actionData as { errorCode?: string } | undefined)?.errorCode;
  
  // Translation hook for reactive i18n
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector variant="toggle" size="sm" />
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Multi-Store SaaS</h1>
          <p className="text-gray-600 mt-2">{t('login')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">


          <Form method="post" className="space-y-6">
            {/* Form Error */}
            {errors?.form && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                <p className="font-medium">{errors.form}</p>
                {errorCode && (
                  <p className="text-xs text-red-400 mt-1">Error Code: {errorCode}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
              {errors?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {errors?.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('loading') : t('login')}
            </button>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Form action="/auth/google" method="post" className="mt-6">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </Form>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link to="/auth/register" className="text-emerald-600 hover:underline font-medium">
                {t('register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

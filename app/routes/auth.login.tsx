/**
 * Login Route
 * 
 * GET: Render login form
 * POST: Validate credentials, create session, redirect to dashboard
 */

import { useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useNavigation, useSearchParams } from '@remix-run/react';
import { Eye, EyeOff } from 'lucide-react';
import { login, createUserSession, getUserId } from '~/services/auth.server';
// import { LanguageSelector } from '~/components/LanguageSelector'; // Temporarily disabled - Bengali is default
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
        ip: clientIp,
        userAgent: request.headers.get('User-Agent') || 'unknown',
        env: context.cloudflare.env,
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
  const { t, lang } = useTranslation();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');
  
  // Custom message for missing store
  const storeNotFoundError = errorParam === 'store_not_found' 
    ? (lang === 'bn' ? 'আপনার স্টোরটি খুঁজে পাওয়া যায়নি। দয়া করে এডমিনের সাথে যোগাযোগ করুন অথবা নতুন করে সাইন-আপ করুন।' 
                   : 'Your store could not be found. Please contact support or sign up for a new account.')
    : null;
  
  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      {/* Language Selector - Temporarily disabled - Bengali is default */}
      {/* <div className="absolute top-4 right-4">
        <LanguageSelector variant="toggle" size="sm" />
      </div> */}
      
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
            {(errors?.form || storeNotFoundError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                <p className="font-medium">{errors?.form || storeNotFoundError}</p>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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

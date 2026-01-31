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
import i18next from '~/services/i18n.server';
import { checkMigrationStatus } from '~/lib/db-migration-check';

export const meta: MetaFunction = () => {
  return [{ title: 'Login - Ozzyl' }];
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
  const t = await i18next.getFixedT(request);

  // Rate Limiting
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const { checkAuthRateLimit } = await import('~/lib/rateLimit.server');

  const kv = (context.cloudflare.env as any).KV;
  if (kv) {
    const rateLimit = await checkAuthRateLimit(kv, clientIp, 'login');
    if (!rateLimit.allowed) {
      return json(
        {
          errors: { form: 'Too many login attempts. Please try again in an hour.' },
          errorCode: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }
  }

  try {
    // Parse form data
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = t('emailRequired');
    } else if (!email.includes('@')) {
      errors.email = t('validEmailRequired');
    }

    if (!password) {
      errors.password = t('passwordRequired');
    }

    if (Object.keys(errors).length > 0) {
      return json({ errors, errorCode: 'VALIDATION_ERROR' }, { status: 400 });
    }

    // Attempt login
    const result = await login({
      email,
      password,
      db: context.cloudflare.env.DB,
      ip: clientIp,
      userAgent: request.headers.get('User-Agent') || 'unknown',
      env: context.cloudflare.env,
    });

    if (result.error) {
      // Use translated generic error if it's a credentials issue
      const formError =
        result.errorCode === 'USER_NOT_FOUND' || result.errorCode === 'INVALID_PASSWORD'
          ? t('invalidCredentials')
          : result.error;

      return json(
        {
          errors: { form: formError },
          errorCode: result.errorCode || 'LOGIN_FAILED',
          errorDetails: result.errorDetails,
        },
        { status: 400 }
      );
    }

    // Validate user data before creating session
    if (!result.user) {
      console.error('[auth.login] Login succeeded but no user returned');
      return json(
        {
          errors: { form: 'Login failed. Please try again.' },
          errorCode: 'NO_USER_RETURNED',
        },
        { status: 500 }
      );
    }

    if (!result.user.id) {
      console.error('[auth.login] User object missing ID');
      return json(
        {
          errors: { form: 'Account error. Please contact support.' },
          errorCode: 'MISSING_USER_ID',
        },
        { status: 500 }
      );
    }

    if (!result.user.storeId) {
      console.error('[auth.login] User has no associated store. UserID:', result.user.id);
      return json(
        {
          errors: { form: 'Your account is not associated with a store. Please contact support.' },
          errorCode: 'NO_STORE_ID',
        },
        { status: 400 }
      );
    }

    // Create session and redirect
    console.log(
      '[auth.login] Creating session for user:',
      result.user.id,
      'store:',
      result.user.storeId
    );
    try {
      return await createUserSession(
        result.user.id,
        result.user.storeId,
        '/app/orders',
        context.cloudflare.env
      );
    } catch (sessionError) {
      console.error('[auth.login] Failed to create session:', sessionError);
      const errorMessage =
        sessionError instanceof Error ? sessionError.message : String(sessionError);
      return json(
        {
          errors: { form: 'Failed to create login session. Please try again.' },
          errorCode: 'SESSION_ERROR',
          errorDetails: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[auth.login] Unhandled error in login action:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[auth.login] Error message:', errorMessage);
    if (errorStack) {
      console.error('[auth.login] Error stack:', errorStack);
    }

    return json(
      {
        errors: { form: 'An unexpected error occurred. Please try again.' },
        errorCode: 'UNHANDLED_ERROR',
        errorDetails: errorMessage,
      },
      { status: 500 }
    );
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Type-safe error access
  const errors = actionData?.errors as Record<string, string> | undefined;
  const errorCode = (actionData as { errorCode?: string } | undefined)?.errorCode;
  const errorDetails = (actionData as { errorDetails?: string } | undefined)?.errorDetails;

  // Translation hook for reactive i18n
  const { t, lang } = useTranslation();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  // Custom message for missing store
  const storeNotFoundError = errorParam === 'store_not_found' ? t('storeNotFound') : null;

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
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <img src="/brand/logo-green.webp" alt="Ozzyl" className="h-12 w-auto" />
          <h1 className="sr-only">Ozzyl</h1>
          <p className="text-gray-600 font-medium">{t('login')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Form method="post" className="space-y-6">
            {/* Form Error */}
            {(errors?.form || storeNotFoundError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                <p className="font-medium">{errors?.form || storeNotFoundError}</p>
                {errorCode && <p className="text-xs text-red-400 mt-1">Error Code: {errorCode}</p>}
                {errorDetails && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-400 cursor-pointer hover:text-red-500">
                      Debug Details
                    </summary>
                    <pre className="mt-1 text-xs text-red-400 bg-red-100/50 p-2 rounded overflow-auto">
                      {errorDetails}
                    </pre>
                  </details>
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
              {errors?.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {t('forgotPassword') || 'Forgot Password?'}
                </Link>
              </div>
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
              {errors?.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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

          {/* Google OAuth Button */}
          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
              onClick={() => {
                // Future Google OAuth logic
                window.location.href = '/auth/google';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('continueWithGoogle')}
            </button>
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

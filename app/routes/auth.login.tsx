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

export const meta: MetaFunction = () => {
  return [{ title: 'Login - Multi-Store SaaS' }];
};

// Redirect if already logged in
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/app/orders');
  }
  return json({});
}

export async function action({ request, context }: ActionFunctionArgs) {
  console.log('[auth.login] Login action started');
  
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
        '/app/orders'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Multi-Store SaaS</h1>
          <p className="text-gray-600 mt-2">Merchant Login</p>
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
                Email Address
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
                Password
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
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-emerald-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

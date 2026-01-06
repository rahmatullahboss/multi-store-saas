/**
 * Register Route
 * 
 * GET: Render registration form
 * POST: Create user + store, create session, redirect to dashboard
 */

import { useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { Store, Globe } from 'lucide-react';
import { register, createUserSession, getUserId } from '~/services/auth.server';

// Define ActionData type for proper TypeScript inference
interface ActionData {
  errors?: {
    form?: string;
    name?: string;
    email?: string;
    password?: string;
    storeName?: string;
    subdomain?: string;
  };
  subdomain?: string;
  errorCode?: string;
  errorDetails?: string;
}

export const meta: MetaFunction = () => {
  return [{ title: 'Register - Multi-Store SaaS' }];
};

// Redirect if already logged in, otherwise redirect to new onboarding wizard
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/app/orders');
  }
  // Redirect to new Shopify-style onboarding wizard
  return redirect('/onboarding');
}

export async function action({ request, context }: ActionFunctionArgs) {
  console.log('[auth.register] Registration action started');
  
  try {
    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error('[auth.register] Failed to parse form data:', parseError);
      return json<ActionData>({
        errors: { form: 'Failed to process your request. Please try again.' },
        errorCode: 'FORM_PARSE_ERROR'
      }, { status: 400 });
    }
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const storeName = formData.get('storeName') as string;
    const subdomain = formData.get('subdomain') as string;
    
    console.log('[auth.register] Form data received - Name:', name ? 'Yes' : 'No', ', Email:', email ? 'Yes' : 'No', ', StoreName:', storeName ? 'Yes' : 'No');

    // Validation
    const errors: ActionData['errors'] = {};
    if (!name || name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!email || !email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!storeName || storeName.length < 2) {
      errors.storeName = 'Store name must be at least 2 characters';
    }
    
    // Subdomain validation
    const cleanSubdomain = subdomain
      ? subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30)
      : storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
    
    if (!cleanSubdomain || cleanSubdomain.length < 2) {
      errors.subdomain = 'Subdomain must be at least 2 characters';
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(cleanSubdomain)) {
      errors.subdomain = 'Subdomain must start and end with a letter or number';
    }

    if (Object.keys(errors).length > 0) {
      console.log('[auth.register] Validation errors:', Object.keys(errors).join(', '));
      return json<ActionData>({ errors, subdomain: cleanSubdomain, errorCode: 'VALIDATION_ERROR' }, { status: 400 });
    }

    // Check database connection
    if (!context.cloudflare?.env?.DB) {
      console.error('[auth.register] Database not available in context');
      return json<ActionData>({
        errors: { form: 'Service temporarily unavailable. Please try again later.' },
        subdomain: cleanSubdomain,
        errorCode: 'DB_UNAVAILABLE'
      }, { status: 503 });
    }

    // Attempt registration with custom subdomain
    console.log('[auth.register] Calling register service...');
    let result;
    try {
      result = await register({
        email,
        password,
        name,
        storeName,
        subdomain: cleanSubdomain,
        db: context.cloudflare.env.DB,
      });
      console.log('[auth.register] Register service returned:', result.error ? 'Error' : 'Success');
    } catch (registerError) {
      console.error('[auth.register] Register service threw an exception:', registerError);
      const errorMessage = registerError instanceof Error ? registerError.message : String(registerError);
      return json<ActionData>({
        errors: { form: 'Registration failed unexpectedly. Please try again.' },
        subdomain: cleanSubdomain,
        errorCode: 'REGISTER_EXCEPTION',
        errorDetails: errorMessage
      }, { status: 500 });
    }

    if (result.error) {
      console.log('[auth.register] Registration failed with error:', result.error);
      return json<ActionData>({
        errors: { form: result.error },
        subdomain: cleanSubdomain,
        errorCode: 'REGISTER_FAILED'
      }, { status: 400 });
    }

    // Validate user data before creating session
    if (!result.user) {
      console.error('[auth.register] Registration succeeded but no user returned');
      return json<ActionData>({
        errors: { form: 'Registration failed. Please try again.' },
        subdomain: cleanSubdomain,
        errorCode: 'NO_USER_RETURNED'
      }, { status: 500 });
    }

    if (!result.storeId) {
      console.error('[auth.register] Registration succeeded but no store ID returned');
      return json<ActionData>({
        errors: { form: 'Store creation failed. Please try again.' },
        subdomain: cleanSubdomain,
        errorCode: 'NO_STORE_RETURNED'
      }, { status: 500 });
    }

    // Create session and redirect
    console.log('[auth.register] Creating session for user:', result.user.id, 'store:', result.storeId);
    try {
      return await createUserSession(
        result.user.id,
        result.storeId,
        '/app/orders'
      );
    } catch (sessionError) {
      console.error('[auth.register] Failed to create session:', sessionError);
      const errorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError);
      return json<ActionData>({
        errors: { form: 'Account created but login failed. Please try logging in.' },
        subdomain: cleanSubdomain,
        errorCode: 'SESSION_ERROR',
        errorDetails: errorMessage
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[auth.register] Unhandled error in register action:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[auth.register] Error message:', errorMessage);
    if (errorStack) {
      console.error('[auth.register] Error stack:', errorStack);
    }
    
    return json<ActionData>({
      errors: { form: 'An unexpected error occurred. Please try again.' },
      errorCode: 'UNHANDLED_ERROR',
      errorDetails: errorMessage
    }, { status: 500 });
  }
}

export default function RegisterPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  // State for live subdomain preview
  const [storeName, setStoreName] = useState('');
  const [customSubdomain, setCustomSubdomain] = useState('');
  const [useCustomSubdomain, setUseCustomSubdomain] = useState(false);
  
  // Generate subdomain from store name
  const autoSubdomain = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
  
  // Clean custom subdomain
  const cleanCustomSubdomain = customSubdomain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30);
  
  const displaySubdomain = useCustomSubdomain ? cleanCustomSubdomain : autoSubdomain;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Store SaaS</h1>
          <p className="text-gray-600 mt-2">Create your store in 30 seconds</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Form method="post" className="space-y-5">
            {/* Form Error */}
            {actionData?.errors?.form && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                <p className="font-medium">{actionData.errors.form}</p>
                {actionData.errorCode && (
                  <p className="text-xs text-red-400 mt-1">Error Code: {actionData.errorCode}</p>
                )}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="John Doe"
              />
              {actionData?.errors?.name && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.name}</p>
              )}
            </div>

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
              {actionData?.errors?.email && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.email}</p>
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
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {actionData?.errors?.password && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.password}</p>
              )}
            </div>

            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="My Awesome Store"
              />
              {actionData?.errors?.storeName && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.storeName}</p>
              )}
            </div>

            {/* Subdomain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store URL
              </label>
              
              {/* Auto-generated subdomain preview */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                <Globe className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-gray-600">
                  <span className="font-semibold text-emerald-600">
                    {displaySubdomain || 'yourstore'}
                  </span>
                  <span className="text-gray-500">.digitalcare.site</span>
                </span>
              </div>
              
              {/* Custom subdomain toggle */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="useCustomSubdomain"
                  checked={useCustomSubdomain}
                  onChange={(e) => setUseCustomSubdomain(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="useCustomSubdomain" className="text-sm text-gray-600">
                  Use custom subdomain
                </label>
              </div>
              
              {/* Custom subdomain input */}
              {useCustomSubdomain && (
                <div className="relative">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={customSubdomain}
                    onChange={(e) => setCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pr-36"
                    placeholder="yourstore"
                    maxLength={30}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    .digitalcare.site
                  </span>
                </div>
              )}
              
              {/* Hidden input for auto-generated subdomain */}
              {!useCustomSubdomain && (
                <input type="hidden" name="subdomain" value={autoSubdomain} />
              )}
              
              {actionData?.errors?.subdomain && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.subdomain}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Only lowercase letters, numbers, and hyphens allowed. This will be your store's URL.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating your store...' : 'Create Store'}
            </button>
          </Form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-emerald-600 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
        
        {/* Features */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>✓ Free to start · ✓ No credit card required · ✓ Setup in 30 seconds</p>
        </div>
      </div>
    </div>
  );
}

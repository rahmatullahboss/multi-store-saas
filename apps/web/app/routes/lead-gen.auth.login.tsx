/**
 * Lead Gen Login Page
 * Simple standalone login without e-commerce template
 */

import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/cloudflare';
import { useLoaderData, Form, Link, useNavigation, useActionData } from '@remix-run/react';
import { createDb } from '~/lib/db.server';
import { customers } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { getCustomerId, createCustomerSession } from '~/services/customer-auth.server';
import { resolveStore } from '~/lib/store.server';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  const customerId = await getCustomerId(request, env);
  if (customerId) {
    return redirect('/lead-dashboard');
  }

  const storeContext = await resolveStore(context, request);
  const storeName = storeContext?.store.name || 'Our Service';
  
  // Get theme colors from lead gen settings for consistent branding
  let primaryColor = '#4F46E5';
  let accentColor = '#8B5CF6';

  if (storeContext?.store.leadGenConfig) {
    try {
      const config = JSON.parse(storeContext.store.leadGenConfig as string);
      if (config.primaryColor) primaryColor = config.primaryColor;
      if (config.accentColor) accentColor = config.accentColor;
    } catch {}
  }

  return json({ storeName, primaryColor, accentColor });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const db = createDb(env.DB);

  const formData = await request.formData();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    // Find customer by email in this store
    const storeContext = await resolveStore(context, request);
    if (!storeContext) {
      return json({ error: 'Store not found' }, { status: 404 });
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, email), eq(customers.storeId, storeContext.storeId)))
      .limit(1);

    if (!customer) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify store match
    if (customer.storeId !== storeContext.storeId) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password - support both old SHA-256 and new PBKDF2 format
    const storedHash = customer.passwordHash || '';
    let isValid = false;

    if (!storedHash) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    try {
      // Try new PBKDF2 format (JSON with salt)
      const hashData = JSON.parse(storedHash);
      if (hashData.salt && hashData.hash) {
        isValid = await verifyPassword(password, hashData.hash, hashData.salt);
      }
    } catch {
      // Fallback: try old SHA-256 format (plain hex string)
      const oldHash = await hashPassword(password);
      isValid = storedHash === oldHash.hash;
    }

    if (!isValid) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (customer.status && ['inactive', 'banned', 'archived'].includes(customer.status)) {
      return json({ error: 'Account is disabled' }, { status: 401 });
    }

    return createCustomerSession(customer.id, customer.storeId, '/lead-dashboard', env);
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

async function hashPassword(
  password: string,
  salt?: string
): Promise<{ hash: string; salt: string }> {
  const useSalt = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(useSalt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(bits));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { hash, salt: useSalt };
}

async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}

export default function LeadGenLogin() {
  const { storeName, primaryColor, accentColor } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Theme Header */}
      <header className="shadow-md" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">
              {storeName}
            </span>
          </Link>
          <Link to="/lead-gen/auth/register" className="text-sm text-white/80 hover:text-white">
            Don't have an account?{' '}
            <span className="font-medium text-white">Sign up</span>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
            <Form method="post" className="space-y-6">
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {actionData.error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </Form>

            {/* Google OAuth Button */}
            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                onClick={() => {
                  window.location.href = '/lead-gen/auth/google';
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
                Continue with Google
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Theme Footer */}
      <footer className="py-6 text-center text-white/80 text-sm" style={{ backgroundColor: primaryColor }}>
        <p>© 2026 {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}

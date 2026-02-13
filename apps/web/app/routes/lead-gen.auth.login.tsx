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
  const storeLogo = storeContext?.store.logo || null;

  // Try to get theme colors from lead gen config
  let primaryColor = '#2563EB';
  let accentColor = '#F59E0B';

  if (storeContext?.store.leadGenConfig) {
    try {
      const config = JSON.parse(storeContext.store.leadGenConfig as string);
      // Try to get from theme settings
      // For now use defaults
    } catch {}
  }

  return json({ storeName, storeLogo, primaryColor, accentColor });
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
  const { storeName, storeLogo, primaryColor } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="h-10 w-auto" />
            ) : (
              <span className="text-xl font-bold" style={{ color: primaryColor }}>
                {storeName}
              </span>
            )}
          </Link>
          <Link to="/lead-gen/auth/register" className="text-sm text-gray-600 hover:text-gray-900">
            Don't have an account?{' '}
            <span style={{ color: primaryColor }} className="font-medium">
              Sign up
            </span>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4">
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
          </div>

          <div className="text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

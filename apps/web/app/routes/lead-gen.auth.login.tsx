/**
 * Lead Gen Login Page
 * Simple standalone login without e-commerce template
 * Uses SAME header/footer as homepage for consistency
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
  let logo: string | undefined;
  
  // For destinations, services, etc - to match homepage header
  let showDestinations = false;
  let showServices = false;
  let showProcess = false;
  let showTeam = false;

  if (storeContext?.store.leadGenConfig) {
    try {
      const config = JSON.parse(storeContext.store.leadGenConfig as string);
      if (config.primaryColor) primaryColor = config.primaryColor;
      if (config.logo) logo = config.logo;
      // Get section visibility
      showDestinations = config.destinations?.length > 0;
      showServices = config.showServices && config.services?.length > 0;
      showProcess = config.processSteps?.length > 0;
      showTeam = config.showTeam && config.teamMembers?.length > 0;
    } catch { /* ignore parse errors */ }
  }

  return json({ storeName, primaryColor, logo, showDestinations, showServices, showProcess, showTeam });
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
    const storeContext = await resolveStore(context, request);
    if (!storeContext) {
      return json({ error: 'Store not found' }, { status: 404 });
    }

    // Find customer in THIS STORE ONLY
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, email), eq(customers.storeId, storeContext.storeId)))
      .limit(1);

    if (!customer) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Parse stored password hash
    let storedHash: string;
    let salt: string;
    try {
      const parsed = JSON.parse(customer.passwordHash as string);
      storedHash = parsed.hash;
      salt = parsed.salt;
    } catch {
      return json({ error: 'Invalid account. Please reset your password.' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, storedHash, salt);
    if (!isValid) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return createCustomerSession(customer.id, customer.storeId, '/lead-dashboard', env);
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(bits));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hash === storedHash;
}

type ActionData = { error?: string };

export default function LeadGenLogin() {
  const { storeName, primaryColor, logo, showDestinations, showServices, showProcess, showTeam } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - SAME AS HOMEPAGE */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            {logo ? (
              <img className="h-10 w-auto" src={logo} alt={storeName} />
            ) : (
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                {storeName}
              </span>
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            {showDestinations && (
              <a href="#destinations" className="text-gray-700 hover:opacity-80 font-medium transition">
                Destinations
              </a>
            )}
            {showServices && (
              <a href="#services" className="text-gray-700 hover:opacity-80 font-medium transition">
                Services
              </a>
            )}
            {showProcess && (
              <a href="#process" className="text-gray-700 hover:opacity-80 font-medium transition">
                Process
              </a>
            )}
            {showTeam && (
              <a href="#team" className="text-gray-700 hover:opacity-80 font-medium transition">
                Team
              </a>
            )}
            <a href="#contact" className="text-gray-700 hover:opacity-80 font-medium transition">
              Contact
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/lead-gen/auth/login"
              className="px-4 py-2 font-medium hover:opacity-80 transition"
              style={{ color: primaryColor }}
            >
              Login
            </Link>
            <Link
              to="/lead-gen/auth/register"
              className="px-5 py-2.5 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              style={{ backgroundColor: primaryColor }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
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
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/lead-gen/auth/register" className="font-medium hover:opacity-80" style={{ color: primaryColor }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer - SAME AS HOMEPAGE */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                {storeName}
              </h3>
              <p className="text-gray-400 text-sm">
                Your trusted partner for quality education abroad.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                {showDestinations && <li><a href="#destinations" className="hover:text-white transition">Destinations</a></li>}
                {showServices && <li><a href="#services" className="hover:text-white transition">Services</a></li>}
                {showProcess && <li><a href="#process" className="hover:text-white transition">Process</a></li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">Get in touch for free consultation</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2026 {storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

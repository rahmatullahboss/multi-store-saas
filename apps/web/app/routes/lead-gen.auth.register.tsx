/**
 * Lead Gen Register Page
 * Simple standalone registration without e-commerce template
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
import { Lock, Mail, User, ArrowRight, Loader2, Phone } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  const customerId = await getCustomerId(request, env);
  if (customerId) {
    return redirect('/lead-dashboard');
  }

  const storeContext = await resolveStore(context, request);
  const storeName = storeContext?.store.name || 'Our Service';
  
  // Get theme colors from lead gen settings
  let primaryColor = '#4F46E5';
  let logo: string | undefined;
  
  // Business settings for footer
  let footerDescription = '';
  let businessPhone = '';
  let businessEmail = '';
  let businessAddress = '';
  
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
      // Business settings
      if (config.footerDescription) footerDescription = config.footerDescription;
      if (config.phone) businessPhone = config.phone;
      if (config.email) businessEmail = config.email;
      if (config.address) businessAddress = config.address;
      // Get section visibility
      showDestinations = config.destinations?.length > 0;
      showServices = config.showServices && config.services?.length > 0;
      showProcess = config.processSteps?.length > 0;
      showTeam = config.showTeam && config.teamMembers?.length > 0;
    } catch { /* ignore parse errors */ }
  }

  return json({ 
    storeName, 
    primaryColor, 
    logo, 
    footerDescription,
    businessPhone,
    businessEmail,
    businessAddress,
    showDestinations, 
    showServices, 
    showProcess, 
    showTeam 
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const db = createDb(env.DB);

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!name || !email || !password) {
    return json({ error: 'Name, email and password are required' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match' }, { status: 400 });
  }

  if (password.length < 6) {
    return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  try {
    const storeContext = await resolveStore(context, request);
    if (!storeContext) {
      return json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if email already exists in THIS STORE ONLY
    const [existing] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, email), eq(customers.storeId, storeContext.storeId)))
      .limit(1);

    if (existing) {
      return json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Hash password with PBKDF2
    const { hash, salt } = await hashPassword(password);
    const passwordHash = JSON.stringify({ hash, salt });

    // Create customer
    const [customer] = await db
      .insert(customers)
      .values({
        storeId: storeContext.storeId,
        name,
        email,
        phone: phone || null,
        passwordHash,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return createCustomerSession(customer.id, customer.storeId, '/lead-dashboard', env);
  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: 'Registration failed. Please try again.' }, { status: 500 });
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

type ActionData = { error?: string };

export default function LeadGenRegister() {
  const { 
    storeName, 
    primaryColor, 
    logo, 
    footerDescription,
    businessPhone,
    businessEmail,
    businessAddress,
    showDestinations, 
    showServices, 
    showProcess, 
    showTeam 
  } = useLoaderData<typeof loader>();
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
              <a href="/destinations" className="text-gray-700 hover:opacity-80 font-medium transition">
                Destinations
              </a>
            )}
            {showServices && (
              <a href="/services" className="text-gray-700 hover:opacity-80 font-medium transition">
                Services
              </a>
            )}
            {showProcess && (
              <a href="/process" className="text-gray-700 hover:opacity-80 font-medium transition">
                Process
              </a>
            )}
            {showTeam && (
              <a href="/team" className="text-gray-700 hover:opacity-80 font-medium transition">
                Team
              </a>
            )}
            <a href="/contact" className="text-gray-700 hover:opacity-80 font-medium transition">
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
              Create Account
            </h2>
            <p className="mt-2 text-gray-600">Sign up to track your application</p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
            <Form method="post" className="space-y-5">
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {actionData.error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="Your full name"
                  />
                </div>
              </div>

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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="+880 1XXXXXXXXX"
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
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
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
                Sign up with Google
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

      {/* Footer - SAME AS HOMEPAGE */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">{storeName}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {footerDescription || 'Your trusted partner for quality education abroad.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                {showDestinations && <li><a href="/destinations" className="hover:text-white">Destinations</a></li>}
                {showServices && <li><a href="/services" className="hover:text-white">Services</a></li>}
                {showProcess && <li><a href="/process" className="hover:text-white">Process</a></li>}
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Destinations</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/destinations?country=usa" className="hover:text-white">USA</a></li>
                <li><a href="/destinations?country=uk" className="hover:text-white">UK</a></li>
                <li><a href="/destinations?country=canada" className="hover:text-white">Canada</a></li>
                <li><a href="/destinations?country=australia" className="hover:text-white">Australia</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Contact</h3>
              <div className="text-gray-400 space-y-2">
                {businessPhone && <p>📞 {businessPhone}</p>}
                {businessEmail && <p>✉️ {businessEmail}</p>}
                {businessAddress && <p>📍 {businessAddress}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

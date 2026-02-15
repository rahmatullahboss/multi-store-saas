/**
 * Lead Gen Phone Verification Route
 * 
 * Route: /lead-gen/auth/phone-verify
 * 
 * Required for Google OAuth users to provide phone number.
 * Uses the same header/footer as Login/Home for consistency (Education Abroad Theme).
 */

import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { customers } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { Loader2, ArrowRight } from 'lucide-react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId, getCustomerStoreId } from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);
  const sessionStoreId = await getCustomerStoreId(request, env);
  if (!customerId || !sessionStoreId) {
    return redirect('/lead-gen/auth/login');
  }

  const storeContext = await resolveStore(context, request);
  if (!storeContext || storeContext.storeId !== sessionStoreId) {
    return redirect('/lead-gen/auth/login?error=invalid_store_session');
  }

  const db = drizzle(env.DB);
  const [customer] = await db
    .select({ email: customers.email })
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, sessionStoreId)))
    .limit(1);

  if (!customer) {
    return redirect('/lead-gen/auth/login');
  }

  const storeName = storeContext?.store.name || 'Our Service';
  
  // Get theme colors from lead gen settings for consistent branding
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
    email: customer.email || '', 
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
  const formData = await request.formData();
  const phone = formData.get('phone') as string;
  
  if (!phone) {
    return json({ error: 'Phone number is required' }, { status: 400 });
  }
  
  // Clean phone number: remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s-()]/g, '');
  
  // Validate format (Flexible check + specific BD format check)
  // Ensure it has at least 10 digits
  if (cleanPhone.length < 10) {
     return json({ error: 'Please enter a valid phone number (at least 10 digits)' }, { status: 400 });
  }

  // 01712345678 (11 digits).
  // 01[3-9] (3 digits) + \d{8} (8 digits) = 11 digits
  const bdRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  
  if (!bdRegex.test(cleanPhone)) {
       return json({ error: 'Please enter a valid phone number (e.g., 01712345678)' }, { status: 400 });
  }
  
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);
  const sessionStoreId = await getCustomerStoreId(request, env);
  if (!customerId || !sessionStoreId) {
    return redirect('/lead-gen/auth/login');
  }

  const storeContext = await resolveStore(context, request);
  if (!storeContext || storeContext.storeId !== sessionStoreId) {
    return redirect('/lead-gen/auth/login?error=invalid_store_session');
  }

  const db = drizzle(env.DB);

  const result = await db
    .update(customers)
    .set({ 
      phone: cleanPhone,
      lastLoginAt: new Date()
    })
    .where(and(eq(customers.id, customerId), eq(customers.storeId, sessionStoreId)))
    .returning({ id: customers.id });

  if (result[0]) {
    return redirect('/lead-dashboard');
  }
  
  return json({ error: 'User not found' }, { status: 404 });
}

export default function PhoneVerify() {
  const { 
    email, 
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
  
  const actionData = useActionData<typeof action>();
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
              Complete Profile
            </h2>
            <p className="mt-2 text-gray-600">Please provide your phone number</p>
             <p className="text-sm text-gray-500 mt-1">
              Signed in as: <span className="font-medium">{email}</span>
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
            <Form method="post" className="space-y-6">
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {actionData.error}
                </div>
              )}

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">+88</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="appearance-none block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="01712345678"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your 11-digit mobile number
                </p>
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
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </Form>
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

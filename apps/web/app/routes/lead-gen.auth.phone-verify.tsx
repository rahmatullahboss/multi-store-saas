/**
 * Lead Gen Phone Verification Route
 * 
 * Route: /lead-gen/auth/phone-verify
 * 
 * Required for Google OAuth users to provide phone number.
 */

import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { customers } from '@db/schema';
import { eq } from 'drizzle-orm';
import { Loader2 } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  
  if (!email) {
    return redirect('/lead-gen/auth/login');
  }
  
  // Get theme colors
  const storeContext = (context as any).storeContext;
  let primaryColor = '#4F46E5';
  
  if (storeContext?.store?.leadGenConfig) {
    try {
      const config = JSON.parse(storeContext.store.leadGenConfig as string);
      if (config.primaryColor) primaryColor = config.primaryColor;
    } catch {}
  }
  
  return json({ email, primaryColor });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  
  if (!email || !phone) {
    return json({ error: 'Phone number is required' }, { status: 400 });
  }
  
  // Validate phone format (Bangladesh format)
  const phoneRegex = /^(\+88)?01[3-9]\d{9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return json({ error: 'Please enter a valid Bangladeshi phone number (e.g., 01712345678)' }, { status: 400 });
  }
  
  const env = context.cloudflare.env;
  const db = drizzle(env.DB);
  
  // Update customer phone
  await db
    .update(customers)
    .set({ 
      phone: cleanPhone,
      lastLoginAt: new Date()
    })
    .where(eq(customers.email, email));
  
  // Get customer and create session
  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);
  
  if (customer[0]) {
    const { getCustomerSession, commitCustomerSession } = await import('~/services/customer-auth.server');
    const session = await getCustomerSession(new Request('http://localhost'), env);
    session.set('customerId', customer[0].id);
    session.set('storeId', customer[0].storeId);
    
    return redirect('/lead-dashboard', {
      headers: {
        'Set-Cookie': await commitCustomerSession(session, env),
      },
    });
  }
  
  return json({ error: 'User not found' }, { status: 404 });
}

export default function PhoneVerify() {
  const { email, primaryColor } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Theme Header */}
      <header className="shadow-md" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-white">
            Complete Your Profile
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div 
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
              Phone Number Required
            </h2>
            <p className="mt-2 text-gray-600">
              Please provide your phone number to continue
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Signed in as: <span className="font-medium">{email}</span>
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
            <Form method="post" className="space-y-5">
              <input type="hidden" name="email" value={email} />
              
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
                    <span className="text-gray-500">+88</span>
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
                  Enter your Bangladesh mobile number (11 digits starting with 01)
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
                  'Continue'
                )}
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Theme Footer */}
      <footer className="py-6 text-center text-white/80 text-sm" style={{ backgroundColor: primaryColor }}>
        <p>© 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}

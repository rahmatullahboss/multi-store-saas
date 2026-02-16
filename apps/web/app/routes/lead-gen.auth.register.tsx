/**
 * Lead Gen Register Page
 * Pro Max Design: Split Layout + Premium UI
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
import { hashPassword } from '~/services/auth.server';
import { resolveStore } from '~/lib/store.server';
import { Lock, Mail, User, ArrowRight, Loader2, Phone, CheckCircle, GraduationCap } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  const customerId = await getCustomerId(request, env);
  if (customerId) {
    return redirect('/lead-dashboard');
  }

  const storeContext = await resolveStore(context, request);
  const storeName = storeContext?.store.name || 'Our Service';

  // Get theme colors from lead gen settings OR fallback to store settings
  let primaryColor = '#4F46E5';
  let logo: string | undefined;

  // Try lead gen config first
  if (storeContext?.store.leadGenConfig) {
    try {
      const config = JSON.parse(storeContext.store.leadGenConfig as string);
      if (config.primaryColor) primaryColor = config.primaryColor;
      if (config.logo) logo = config.logo;
    } catch { /* ignore */ }
  }

  // Fallback to store theme config (if not set by lead gen)
  if (primaryColor === '#4F46E5' && storeContext?.store.themeConfig) {
    try {
      const themeConfig = JSON.parse(storeContext.store.themeConfig as string);
      if (themeConfig.primaryColor) {
        primaryColor = themeConfig.primaryColor;
      }
      if (!logo && themeConfig.logo) {
         logo = themeConfig.logo;
      }
      if (!logo && storeContext.store.logo) {
         logo = storeContext.store.logo;
      }
    } catch { /* ignore */ }
  }

  return json({
    storeName,
    primaryColor,
    logo,
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

    // Hash password using unified PBKDF2 hasher from auth.server
    const passwordHash = await hashPassword(password);

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

// Local hashPassword removed — now using unified hashPassword from auth.server.ts

type ActionData = { error?: string };

export default function LeadGenRegister() {
  const { storeName, primaryColor, logo } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Hero/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gray-900 text-white order-2">
        {/* Background Pattern/Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-20"
             style={{
                backgroundImage: `radial-gradient(circle at 70% 20%, ${primaryColor} 0%, transparent 40%), radial-gradient(circle at 20% 80%, ${primaryColor} 0%, transparent 40%)`
             }}
          />
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
            alt="Students Studying"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="inline-block">
             {logo ? (
                <img className="h-10 w-auto brightness-0 invert" src={logo} alt={storeName} />
             ) : (
                <span className="text-2xl font-bold">{storeName}</span>
             )}
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
           <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm">
              <GraduationCap className="w-6 h-6 text-white" />
           </div>
           <h1 className="text-4xl font-bold mb-6">Unlock Your Global Potential</h1>
           <p className="text-lg text-gray-300 mb-8 leading-relaxed">
             Join thousands of students who have successfully pursued their dreams abroad. Create your account to get personalized guidance and track your application.
           </p>

           <div className="grid grid-cols-2 gap-4">
              {[
                'Expert Consulation',
                'Scholarship Assistance',
                'Visa Guidance',
                'Pre-departure Briefing'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-200 text-sm">
                   <CheckCircle className="w-4 h-4 text-white/80" />
                   {item}
                </div>
              ))}
           </div>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
           © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form (Order 1 on desktop to be on left, or order-1 to be on left) -> wait, standard is form on right or left. Let's put form on Left this time for variety? No, keep consistant.
          Actually, for Register, let's keep form on LEFT side and Image on RIGHT side to differentiate from Login.
          
          Wait, the designs usually have form on right. Let's stick to standard split.
          Actually, I set `order-2` on the image div above. So Image is on Right. Form is on Left.
      */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-gray-50/50 order-1">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center lg:text-left">
             <div className="lg:hidden mb-6 flex justify-center">
                {logo ? (
                   <img className="h-10 w-auto" src={logo} alt={storeName} />
                ) : (
                   <span className="text-2xl font-bold" style={{ color: primaryColor }}>{storeName}</span>
                )}
             </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-500">Sign up to track your application journey</p>
          </div>

          <Form method="post" className="space-y-5">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                 <div className="mt-0.5 min-w-[16px]">⚠️</div>
                {actionData.error}
              </div>
            )}

            <div className="space-y-4">
               {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="+880 1XXXXXXXXX"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        placeholder="••••••••"
                      />
                    </div>
                 </div>

                 <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        placeholder="••••••••"
                      />
                    </div>
                 </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
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
            Google
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/lead-gen/auth/login" className="font-semibold hover:underline" style={{ color: primaryColor }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

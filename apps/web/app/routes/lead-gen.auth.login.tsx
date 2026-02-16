import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/cloudflare';
import { useLoaderData, Form, Link, useNavigation, useActionData } from '@remix-run/react';
import { getCustomerId, createCustomerSession, loginCustomer } from '~/services/customer-auth.server';
import { resolveStore } from '~/lib/store.server';
import { Lock, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  const customerId = await getCustomerId(request, env);
  if (customerId) {
    return redirect('/lead-dashboard');
  }

  const storeContext = await resolveStore(context, request);
  const storeName = storeContext?.store.name || 'Our Service';

  // Get theme colors from lead gen settings OR fallback to store settings
  // This fixes the "default blue" issue
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

    // Use unified loginCustomer — handles both legacy JSON and base64url hash formats
    const loginResult = await loginCustomer({
      storeId: storeContext.storeId,
      email,
      password,
      db: env.DB,
    });

    if (loginResult.error || !loginResult.customer) {
      return json({ error: loginResult.error || 'Invalid credentials' }, { status: 401 });
    }

    return createCustomerSession(loginResult.customer.id, loginResult.customer.storeId, '/lead-dashboard', env);
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

// Local verifyPassword removed — now using unified loginCustomer from customer-auth.server.ts

type ActionData = { error?: string };

export default function LeadGenLogin() {
  const { storeName, primaryColor, logo } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gray-900 text-white">
        {/* Background Pattern/Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-20"
             style={{
                backgroundImage: `radial-gradient(circle at 30% 20%, ${primaryColor} 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${primaryColor} 0%, transparent 40%)`
             }}
          />
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop"
            alt="Students"
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
           <h1 className="text-4xl font-bold mb-6">Start Your Journey Today</h1>
           <p className="text-lg text-gray-300 mb-8 leading-relaxed">
             Track your application progress, upload documents securely, and get real-time updates from our team. We're here to guide you every step of the way.
           </p>

           <div className="space-y-4">
              {[
                'Real-time Application Tracking',
                'Secure Document Upload',
                'Direct Communication with Experts'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-200">
                   <div className="bg-white/10 p-1 rounded-full">
                     <CheckCircle className="w-4 h-4 text-white" />
                   </div>
                   {item}
                </div>
              ))}
           </div>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
           © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-gray-50/50">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center lg:text-left">
             <div className="lg:hidden mb-6 flex justify-center">
                {logo ? (
                   <img className="h-10 w-auto" src={logo} alt={storeName} />
                ) : (
                   <span className="text-2xl font-bold" style={{ color: primaryColor }}>{storeName}</span>
                )}
             </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-500">Sign in to access your student dashboard</p>
          </div>

          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                 <div className="mt-0.5 min-w-[16px]">⚠️</div>
                {actionData.error}
              </div>
            )}

            <div className="space-y-5">
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                   <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                     Password
                   </label>
                   <a href="#" className="text-sm font-medium hover:underline" style={{ color: primaryColor }}>
                      Forgot password?
                   </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="••••••••"
                  />
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
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
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
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
            Don't have an account?{' '}
            <Link to="/lead-gen/auth/register" className="font-semibold hover:underline" style={{ color: primaryColor }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

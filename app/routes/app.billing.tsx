/**
 * Billing & Subscription Page
 * 
 * Route: /app/billing
 * 
 * Features:
 * - View current plan and subscription status
 * - Usage progress bars (orders/products)
 * - Pricing table with 4 tiers
 * - Upgrade CTAs
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getUsageStats, PLAN_LIMITS, type PlanType } from '~/utils/plans.server';
import { 
  Check, 
  X, 
  Zap, 
  Crown, 
  Building2, 
  Rocket,
  TrendingUp,
  Package,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Billing & Plans - Multi-Store SaaS' }];
};

// ============================================================================
// PLAN DISPLAY CONFIG
// ============================================================================
const PLAN_DISPLAY = {
  free: {
    name: 'Free',
    description: 'Perfect for testing and getting started',
    price: '৳0',
    period: '/forever',
    icon: Rocket,
    color: 'gray',
    features: [
      { text: '1 product', included: true },
      { text: '50 orders/month', included: true },
      { text: 'Landing page only', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Full store mode', included: false },
      { text: 'Custom domain', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  starter: {
    name: 'Starter',
    description: 'For growing businesses',
    price: '৳999',
    period: '/month',
    icon: Zap,
    color: 'emerald',
    popular: true,
    features: [
      { text: '50 products', included: true },
      { text: '500 orders/month', included: true },
      { text: 'Full store mode', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Email campaigns', included: true },
      { text: 'Priority support', included: false },
    ],
  },
  premium: {
    name: 'Premium',
    description: 'For established stores',
    price: '৳2,999',
    period: '/month',
    icon: Crown,
    color: 'purple',
    features: [
      { text: '500 products', included: true },
      { text: '5,000 orders/month', included: true },
      { text: 'Full store mode', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Email campaigns', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  custom: {
    name: 'Custom',
    description: 'For enterprise needs',
    price: 'Custom',
    period: '',
    icon: Building2,
    color: 'blue',
    features: [
      { text: 'Unlimited products', included: true },
      { text: 'Unlimited orders', included: true },
      { text: 'Full store mode', included: true },
      { text: 'Custom analytics', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Custom integrations', included: true },
    ],
  },
} as const;

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store info
  const storeResult = await db
    .select({
      planType: stores.planType,
      subscriptionStatus: stores.subscriptionStatus,
      name: stores.name,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  const planType = (store?.planType as PlanType) || 'free';
  const subscriptionStatus = store?.subscriptionStatus || 'active';

  // Get usage stats
  const usage = await getUsageStats(context.cloudflare.env.DB, storeId);

  return json({
    storeName: store?.name || 'Your Store',
    planType,
    subscriptionStatus,
    usage,
    limits: PLAN_LIMITS[planType],
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BillingPage() {
  const { storeName, planType, subscriptionStatus, usage } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  const success = searchParams.get('success');
  const upgradedPlan = searchParams.get('plan');
  const trxID = searchParams.get('trxID');
  const error = searchParams.get('error');
  
  const currentPlan = PLAN_DISPLAY[planType as keyof typeof PLAN_DISPLAY];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-semibold">🎉 Plan Upgraded Successfully!</p>
          <p className="text-green-700 text-sm mt-1">
            Your plan has been upgraded to {upgradedPlan}. Transaction ID: {trxID}
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-semibold">Payment Failed</p>
          <p className="text-red-700 text-sm mt-1">
            {error === 'payment_cancelled' && 'Payment was cancelled. Please try again.'}
            {error === 'payment_failed' && 'Payment failed. Please try again or use a different method.'}
            {error === 'payment_incomplete' && 'Payment could not be completed. Please try again.'}
            {error === 'execution_failed' && 'There was an error processing your payment. Please contact support.'}
          </p>
        </div>
      )}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your plan and monitor usage</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${currentPlan.color}-100`}>
              <currentPlan.icon className={`w-6 h-6 text-${currentPlan.color}-600`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{currentPlan.name} Plan</h2>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  subscriptionStatus === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : subscriptionStatus === 'past_due'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {subscriptionStatus === 'active' ? 'Active' : subscriptionStatus === 'past_due' ? 'Past Due' : 'Canceled'}
                </span>
              </div>
              <p className="text-gray-500">{currentPlan.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {currentPlan.price}
              <span className="text-sm font-normal text-gray-500">{currentPlan.period}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders Usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Monthly Orders</h3>
              <p className="text-sm text-gray-500">Resets on the 1st of each month</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium text-gray-900">
                {usage.orders.current.toLocaleString()} / {usage.orders.limit === Infinity ? '∞' : usage.orders.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  usage.orders.percentage >= 90 ? 'bg-red-500' : 
                  usage.orders.percentage >= 70 ? 'bg-yellow-500' : 
                  'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usage.orders.percentage, 100)}%` }}
              />
            </div>
            {usage.orders.percentage >= 80 && planType === 'free' && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ You're approaching your monthly limit. Upgrade to continue accepting orders.
              </p>
            )}
          </div>
        </div>

        {/* Products Usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Active Products</h3>
              <p className="text-sm text-gray-500">Published products in your store</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium text-gray-900">
                {usage.products.current.toLocaleString()} / {usage.products.limit === Infinity ? '∞' : usage.products.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  usage.products.percentage >= 90 ? 'bg-red-500' : 
                  usage.products.percentage >= 70 ? 'bg-yellow-500' : 
                  'bg-purple-500'
                }`}
                style={{ width: `${Math.min(usage.products.percentage, 100)}%` }}
              />
            </div>
            {planType === 'free' && usage.products.current >= 1 && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ Free plan is limited to 1 product. Upgrade to add more.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade CTA for Free Users */}
      {planType === 'free' && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Ready to Grow?</h3>
                <p className="text-emerald-100">
                  Upgrade to Starter for full store access, 50 products, and 500 orders/month.
                </p>
              </div>
            </div>
            <Link 
              to="/app/upgrade"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition"
            >
              Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Pricing Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Compare Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.entries(PLAN_DISPLAY) as [PlanType, typeof PLAN_DISPLAY['free']][]).map(([key, plan]) => {
            const isCurrentPlan = key === planType;
            const Icon = plan.icon;
            
            return (
              <div 
                key={key}
                className={`relative bg-white rounded-xl border-2 p-6 transition ${
                  isCurrentPlan 
                    ? 'border-emerald-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {(plan as { popular?: boolean }).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-${plan.color}-100`}>
                    <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-4">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">{plan.period}</span>
                  </p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {isCurrentPlan ? (
                  <div className="w-full py-2.5 text-center text-emerald-600 font-medium border border-emerald-200 rounded-lg bg-emerald-50">
                    Current Plan
                  </div>
                ) : key === 'custom' ? (
                  <a 
                    href="mailto:support@example.com?subject=Custom Plan Inquiry"
                    className="block w-full py-2.5 text-center text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Contact Sales
                  </a>
                ) : (
                  <Link 
                    to="/app/upgrade"
                    className={`block w-full py-2.5 text-center text-white font-medium rounded-lg transition ${
                      key === 'starter' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      key === 'premium' ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ or Help */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600">
          Contact our support team at{' '}
          <a href="mailto:support@example.com" className="text-emerald-600 hover:underline">
            support@example.com
          </a>
          {' '}for billing questions or custom plan requests.
        </p>
      </div>
    </div>
  );
}

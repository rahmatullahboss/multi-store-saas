/**
 * Plan Upgrade Page
 * 
 * Route: /app/upgrade
 * 
 * MVP Version: Shows plans but payment coming soon
 * TODO: Re-enable bKash payment after MVP launch
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import type { PlanType } from '~/utils/plans.server';
import { 
  Zap, 
  Crown, 
  Check, 
  ArrowLeft,
  MessageCircle
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Upgrade Plan - Multi-Store SaaS' }];
};

// ============================================================================
// PLAN CONFIG
// ============================================================================
const UPGRADE_PLANS = {
  starter: {
    name: 'Starter',
    price: 999,
    description: 'For growing businesses',
    icon: Zap,
    color: 'emerald',
    features: [
      '50 products',
      '500 orders/month',
      'Full store mode',
      'Custom domain',
      'Email campaigns',
    ],
  },
  premium: {
    name: 'Premium',
    price: 2999,
    description: 'For established stores',
    icon: Crown,
    color: 'purple',
    features: [
      '500 products',
      '5,000 orders/month',
      'Full store mode',
      'Custom domain',
      'Priority support',
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

  const storeResult = await db
    .select({
      planType: stores.planType,
      name: stores.name,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  const currentPlan = (store?.planType as PlanType) || 'free';

  return json({
    storeName: store?.name || 'Your Store',
    currentPlan,
    storeId,
  });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function UpgradePage() {
  const { currentPlan } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/app/billing" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h1>
        <p className="text-gray-500 mt-1">Choose a plan to unlock more features</p>
      </div>

      {/* Coming Soon Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 font-medium">🚀 Online Payment Coming Soon!</p>
        <p className="text-blue-700 text-sm mt-1">
          We're working on integrating bKash and other payment methods. 
          For now, please contact us on WhatsApp to upgrade your plan manually.
        </p>
        <a 
          href="https://wa.me/8801739416661?text=Hi!%20I%20want%20to%20upgrade%20my%20plan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
        >
          <MessageCircle className="w-4 h-4" />
          Contact on WhatsApp
        </a>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.entries(UPGRADE_PLANS) as [keyof typeof UPGRADE_PLANS, typeof UPGRADE_PLANS['starter']][]).map(([key, plan]) => {
          const isCurrentPlan = key === currentPlan;
          const isDowngrade = 
            (currentPlan === 'premium' && key === 'starter') ||
            (currentPlan === 'custom');
          const Icon = plan.icon;
          
          return (
            <div 
              key={key}
              className={`relative bg-white rounded-2xl border-2 p-6 ${
                key === 'starter' ? 'border-emerald-200' : 'border-purple-200'
              }`}
            >
              {/* Popular Badge */}
              {key === 'starter' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                  key === 'starter' ? 'bg-emerald-100' : 'bg-purple-100'
                }`}>
                  <Icon className={`w-7 h-7 ${
                    key === 'starter' ? 'text-emerald-600' : 'text-purple-600'
                  }`} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                <p className="text-4xl font-bold text-gray-900 mt-4">
                  ৳{plan.price.toLocaleString()}
                  <span className="text-base font-normal text-gray-500">/month</span>
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <Check className={`w-5 h-5 flex-shrink-0 ${
                      key === 'starter' ? 'text-emerald-500' : 'text-purple-500'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {isCurrentPlan ? (
                <div className="w-full py-3 text-center text-gray-500 font-medium border border-gray-200 rounded-xl bg-gray-50">
                  Current Plan
                </div>
              ) : isDowngrade ? (
                <div className="w-full py-3 text-center text-gray-400 font-medium border border-gray-200 rounded-xl bg-gray-50">
                  Not Available
                </div>
              ) : (
                <a
                  href={`https://wa.me/8801739416661?text=Hi!%20I%20want%20to%20upgrade%20to%20${plan.name}%20plan%20(৳${plan.price}/month)`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
                    key === 'starter' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact to Upgrade
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
        <div className="space-y-3">
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How does billing work?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              You'll be charged monthly. Your subscription renews automatically 
              unless you cancel before the renewal date.
            </p>
          </details>
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              Can I upgrade later?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              Yes! You can upgrade to a higher plan anytime. You'll only pay the 
              difference for the remaining billing period.
            </p>
          </details>
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              What happens to my data if I downgrade?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              Your data is safe. However, if you exceed the new plan's limits, 
              you may need to remove some products or wait for the next billing cycle for orders.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

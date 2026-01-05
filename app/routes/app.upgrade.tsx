/**
 * Plan Upgrade Page
 * 
 * Route: /app/upgrade
 * 
 * Features:
 * - Plan selection (Starter, Premium)
 * - bKash payment integration
 * - Redirect to bKash for payment
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { BkashService } from '~/services/bkash.server';
import { PLAN_LIMITS, type PlanType } from '~/utils/plans.server';
import { 
  Zap, 
  Crown, 
  Check, 
  ArrowLeft,
  Loader2,
  CreditCard
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

  // Check if bKash is configured
  const bkashAvailable = Boolean(
    context.cloudflare.env.BKASH_APP_KEY &&
    context.cloudflare.env.BKASH_APP_SECRET
  );

  return json({
    storeName: store?.name || 'Your Store',
    currentPlan,
    storeId,
    bkashAvailable,
  });
}

// ============================================================================
// ACTION - Create bKash Payment
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  
  if (!storeId) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const selectedPlan = formData.get('plan') as 'starter' | 'premium';

  if (!selectedPlan || !UPGRADE_PLANS[selectedPlan]) {
    return json({ error: 'Invalid plan selected' }, { status: 400 });
  }

  const plan = UPGRADE_PLANS[selectedPlan];
  const amount = plan.price;

  // Check if bKash is configured
  const env = context.cloudflare.env;
  if (!env.BKASH_APP_KEY || !env.BKASH_APP_SECRET || !env.BKASH_USERNAME || !env.BKASH_PASSWORD) {
    return json({ 
      error: 'Payment system not configured. Please contact support.',
      code: 'BKASH_NOT_CONFIGURED' 
    }, { status: 503 });
  }

  try {
    const bkash = BkashService.fromEnv(env);
    
    // Generate unique invoice number
    const invoiceNumber = `UPG-${storeId}-${Date.now()}`;
    
    // Get the base URL for callback
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const callbackUrl = `${baseUrl}/api/bkash/callback?storeId=${storeId}&plan=${selectedPlan}&invoice=${invoiceNumber}`;
    
    // Create bKash payment
    const paymentResponse = await bkash.createPayment({
      payerReference: `store-${storeId}`,
      callbackURL: callbackUrl,
      amount: amount.toString(),
      merchantInvoiceNumber: invoiceNumber,
    });

    // Redirect to bKash payment page
    if (paymentResponse.bkashURL) {
      return redirect(paymentResponse.bkashURL);
    }

    return json({ 
      error: paymentResponse.statusMessage || 'Failed to create payment',
      code: 'BKASH_CREATE_FAILED'
    }, { status: 500 });

  } catch (error) {
    console.error('[Upgrade] bKash payment error:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Payment initialization failed',
      code: 'BKASH_ERROR'
    }, { status: 500 });
  }
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function UpgradePage() {
  const { currentPlan, bkashAvailable } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <a 
          href="/app/billing" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h1>
        <p className="text-gray-500 mt-1">Choose a plan to unlock more features</p>
      </div>

      {/* Error Message */}
      {actionData && 'error' in actionData && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {actionData.error}
        </div>
      )}

      {/* bKash Not Available Warning */}
      {!bkashAvailable && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">Payment System Setup Required</p>
          <p className="text-yellow-700 text-sm mt-1">
            bKash payment is not configured. Please set up BKASH_APP_KEY, BKASH_APP_SECRET, 
            BKASH_USERNAME, and BKASH_PASSWORD in your environment variables.
          </p>
        </div>
      )}

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
                <Form method="post">
                  <input type="hidden" name="plan" value={key} />
                  <button 
                    type="submit"
                    disabled={isSubmitting || !bkashAvailable}
                    className={`w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      key === 'starter' 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay with bKash
                      </>
                    )}
                  </button>
                </Form>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Info */}
      <div className="mt-8 p-6 bg-pink-50 rounded-xl border border-pink-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">bKash</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pay with bKash</h3>
            <p className="text-sm text-gray-600">Secure mobile payment</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          You'll be redirected to bKash to complete your payment. 
          Your plan will be upgraded instantly after successful payment.
        </p>
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
              You'll be charged monthly via bKash. Your subscription renews automatically 
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

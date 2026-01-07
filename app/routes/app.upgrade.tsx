/**
 * Plan Upgrade Page
 * 
 * Route: /app/upgrade
 * 
 * Allows users to upgrade their subscription plan with coupon code support.
 * Currently uses WhatsApp for manual payment processing.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import type { PlanType } from '~/utils/plans.server';
import { validateSaasCoupon, applyCouponDiscount } from '~/utils/coupon.server';
import { useState, useEffect } from 'react';
import { 
  Zap, 
  Crown, 
  Check, 
  ArrowLeft,
  MessageCircle,
  Ticket,
  X,
  Loader2
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

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
// ACTION - Validate Coupon
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request);
  
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  
  if (intent === 'validate_coupon') {
    const couponCode = formData.get('couponCode') as string;
    const planPrice = parseFloat(formData.get('planPrice') as string);
    
    if (!couponCode) {
      return json({ error: 'Please enter a coupon code' }, { status: 400 });
    }
    
    const result = await validateSaasCoupon(context.cloudflare.env.DB, couponCode);
    
    if (!result.valid) {
      return json({ error: result.error }, { status: 400 });
    }
    
    const discount = applyCouponDiscount(planPrice, result.coupon!);
    
    return json({
      valid: true,
      couponCode: result.coupon!.code,
      discountLabel: discount.discountLabel,
      originalPrice: discount.originalPrice,
      discountAmount: discount.discountAmount,
      finalPrice: discount.finalPrice,
    });
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function UpgradePage() {
  const { currentPlan } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const couponFetcher = useFetcher<{
    valid?: boolean;
    error?: string;
    couponCode?: string;
    discountLabel?: string;
    originalPrice?: number;
    discountAmount?: number;
    finalPrice?: number;
  }>();
  
  const [couponCode, setCouponCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'premium' | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountLabel: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);
  
  // Handle coupon validation response
  useEffect(() => {
    if (couponFetcher.data?.valid && couponFetcher.data.couponCode) {
      setAppliedCoupon({
        code: couponFetcher.data.couponCode,
        discountLabel: couponFetcher.data.discountLabel!,
        originalPrice: couponFetcher.data.originalPrice!,
        discountAmount: couponFetcher.data.discountAmount!,
        finalPrice: couponFetcher.data.finalPrice!,
      });
      setCouponCode('');
    }
  }, [couponFetcher.data]);
  
  const handleApplyCoupon = () => {
    if (!selectedPlan || !couponCode) return;
    
    const planPrice = UPGRADE_PLANS[selectedPlan].price;
    couponFetcher.submit(
      { intent: 'validate_coupon', couponCode, planPrice: planPrice.toString() },
      { method: 'POST' }
    );
  };
  
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };
  
  const getWhatsAppLink = (planKey: 'starter' | 'premium') => {
    const plan = UPGRADE_PLANS[planKey];
    let message = `Hi! I want to upgrade to ${plan.name} plan`;
    
    if (appliedCoupon && selectedPlan === planKey) {
      message += ` with coupon code: ${appliedCoupon.code}`;
      message += `\n\nOriginal Price: ৳${appliedCoupon.originalPrice}`;
      message += `\nDiscount: -৳${appliedCoupon.discountAmount} (${appliedCoupon.discountLabel})`;
      message += `\nFinal Price: ৳${appliedCoupon.finalPrice}`;
    } else {
      message += ` (৳${plan.price}/month)`;
    }
    
    return `https://wa.me/8801739416661?text=${encodeURIComponent(message)}`;
  };
  
  const isValidating = couponFetcher.state === 'submitting';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/app/billing" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToBilling')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('upgradePlan')}</h1>
        <p className="text-gray-500 mt-1">{lang === 'bn' ? 'আরো ফিচার আনলক করতে প্ল্যান আপগ্রেড করুন' : 'Choose a plan to unlock more features'}</p>
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

      {/* Coupon Code Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900">
            {lang === 'bn' ? 'কুপন কোড আছে?' : 'Have a Coupon Code?'}
          </h3>
        </div>
        
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
            <div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="font-mono font-bold text-green-700">{appliedCoupon.code}</span>
                <span className="text-sm text-green-600">({appliedCoupon.discountLabel})</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {lang === 'bn' ? 'ডিসকাউন্ট প্রযোজ্য হয়েছে!' : 'Discount applied!'}
              </p>
            </div>
            <button
              onClick={removeCoupon}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={lang === 'bn' ? 'কুপন কোড লিখুন' : 'Enter coupon code'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono uppercase"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode || !selectedPlan || isValidating}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {lang === 'bn' ? 'চেক হচ্ছে...' : 'Checking...'}
                </>
              ) : (
                lang === 'bn' ? 'অ্যাপ্লাই' : 'Apply'
              )}
            </button>
          </div>
        )}
        
        {!selectedPlan && !appliedCoupon && (
          <p className="text-sm text-gray-500 mt-2">
            {lang === 'bn' ? 'প্রথমে একটি প্ল্যান সিলেক্ট করুন' : 'Select a plan first to apply coupon'}
          </p>
        )}
        
        {couponFetcher.data?.error && (
          <p className="text-sm text-red-600 mt-2">{couponFetcher.data.error}</p>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.entries(UPGRADE_PLANS) as [keyof typeof UPGRADE_PLANS, typeof UPGRADE_PLANS['starter']][]).map(([key, plan]) => {
          const isCurrentPlan = key === currentPlan;
          const isDowngrade = 
            (currentPlan === 'premium' && key === 'starter') ||
            (currentPlan === 'custom');
          const Icon = plan.icon;
          const isSelected = selectedPlan === key;
          
          // Calculate price with coupon
          const showDiscount = appliedCoupon && selectedPlan === key;
          const displayPrice = showDiscount ? appliedCoupon.finalPrice : plan.price;
          const originalPrice = showDiscount ? appliedCoupon.originalPrice : null;
          
          return (
            <div 
              key={key}
              onClick={() => !isCurrentPlan && !isDowngrade && setSelectedPlan(key)}
              className={`relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                isSelected 
                  ? key === 'starter' 
                    ? 'border-emerald-500 ring-2 ring-emerald-200' 
                    : 'border-purple-500 ring-2 ring-purple-200'
                  : key === 'starter' 
                    ? 'border-emerald-200 hover:border-emerald-300' 
                    : 'border-purple-200 hover:border-purple-300'
              } ${(isCurrentPlan || isDowngrade) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {/* Popular Badge */}
              {key === 'starter' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              {/* Selected Badge */}
              {isSelected && !isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    key === 'starter' ? 'bg-emerald-500' : 'bg-purple-500'
                  }`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
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
                
                {/* Price with discount */}
                <div className="mt-4">
                  {originalPrice && (
                    <p className="text-lg text-gray-400 line-through">৳{originalPrice.toLocaleString()}</p>
                  )}
                  <p className={`text-4xl font-bold ${showDiscount ? 'text-green-600' : 'text-gray-900'}`}>
                    ৳{displayPrice.toLocaleString()}
                    <span className="text-base font-normal text-gray-500">/month</span>
                  </p>
                  {showDiscount && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      🎉 {appliedCoupon.discountLabel} - Save ৳{appliedCoupon.discountAmount}!
                    </p>
                  )}
                </div>
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
                  href={getWhatsAppLink(key)}
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
                  {showDiscount && ` (৳${appliedCoupon.finalPrice})`}
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
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How do coupon codes work?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              Coupon codes give you a discount on your subscription fee. Select a plan,
              enter your coupon code, and click Apply. The discounted price will be shown
              and included in your WhatsApp message when you contact us.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

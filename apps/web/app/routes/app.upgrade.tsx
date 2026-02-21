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
import { useLoaderData, Link, useFetcher, useSearchParams } from '@remix-run/react';
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
  Loader2,
  CreditCard,
  Copy,
  Send,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/lib/formatting';

export const meta: MetaFunction = () => {
  return [{ title: 'Upgrade Plan' }];
};

// ============================================================================
// PLAN CONFIG
// ============================================================================
const UPGRADE_PLANS = {
  starter: {
    name: 'Starter',
    nameBn: 'স্টার্টার',
    priceMonthly: 799,
    priceAnnual: 639,
    description: 'For growing businesses',
    descriptionBn: 'বাড়তে থাকা ব্যবসার জন্য',
    icon: Zap,
    color: 'emerald',
    features: [
      '১০০টি Product',
      '৫০০ Orders/মাস',
      'সীমাহীন Visitors*',
      'Full E-commerce Store',
      'Custom Domain',
      'Facebook Pixel',
      '২ জন Team Member',
    ],
    featuresEn: [
      '100 products',
      '500 orders/month',
      'Unlimited visitors*',
      'Full E-commerce Store',
      'Custom Domain',
      'Facebook Pixel',
      '2 Team Members',
    ],
  },
  premium: {
    name: 'Premium',
    nameBn: 'প্রিমিয়াম',
    priceMonthly: 1999,
    priceAnnual: 1599,
    description: 'For serious businesses',
    descriptionBn: 'সিরিয়াস ব্যবসার জন্য',
    icon: Crown,
    color: 'purple',
    features: [
      '২০০টি Product',
      '২,০০০ Orders/মাস',
      'সীমাহীন Visitors*',
      'Facebook CAPI',
      'Priority Support',
      '২ GB Storage',
      '৫ জন Team Member',
      '০% Platform Fee (আপাতত ফ্রি)',
    ],
    featuresEn: [
      '200 products',
      '2,000 orders/month',
      'Unlimited visitors*',
      'Facebook CAPI',
      'Priority Support',
      '2 GB Storage',
      '5 Team Members',
      '0% Platform Fee (Currently Free)',
    ],
  },
} as const;

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);

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
// ACTION - Validate Coupon & Submit Payment
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);

  if (!storeId) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // ========== VALIDATE COUPON ==========
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

  // ========== SUBMIT PAYMENT REQUEST ==========
  if (intent === 'submit_payment') {
    const planType = formData.get('planType') as string;
    const transactionId = formData.get('transactionId') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const amount = parseFloat(formData.get('amount') as string);

    // Validation
    if (!planType || !['starter', 'premium'].includes(planType)) {
      return json({ error: 'Invalid plan selected' }, { status: 400 });
    }
    if (!transactionId || transactionId.length < 6) {
      return json(
        { error: 'Please enter a valid Transaction ID (at least 6 characters)' },
        { status: 400 }
      );
    }
    if (!phoneNumber || phoneNumber.length < 11) {
      return json({ error: 'Please enter your bKash/Nagad phone number' }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return json({ error: 'Invalid amount' }, { status: 400 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    // Check if there's already a pending payment
    const existingPending = await db
      .select({ paymentStatus: stores.paymentStatus })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (existingPending[0]?.paymentStatus === 'pending_verification') {
      return json(
        {
          error:
            'You already have a pending payment request. Please wait for admin approval or contact support.',
        },
        { status: 400 }
      );
    }

    // Save payment request
    await db
      .update(stores)
      .set({
        paymentTransactionId: transactionId.trim(),
        paymentPhone: phoneNumber.trim(),
        paymentAmount: amount,
        paymentStatus: 'pending_verification',
        paymentSubmittedAt: new Date(),
        // Don't change planType yet - admin will approve and set it
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({
      success: true,
      message:
        'Payment request submitted successfully! We will verify and activate your plan within 24 hours.',
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
  const [searchParams] = useSearchParams();
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
  // Auto-select plan from URL parameter
  const planFromUrl = searchParams.get('plan') as 'starter' | 'premium' | null;
  const billingFromUrl = searchParams.get('billing') as 'monthly' | 'annual' | null;
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'premium' | null>(
    planFromUrl && ['starter', 'premium'].includes(planFromUrl) ? planFromUrl : null
  );
  // Billing period from URL - default to monthly if not specified
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(
    billingFromUrl === 'annual' ? 'annual' : 'monthly'
  );
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountLabel: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  // Helper to get display price based on billing period (Monthly Rate)
  const getMonthlyRate = (plan: (typeof UPGRADE_PLANS)[keyof typeof UPGRADE_PLANS]) => {
    return billingPeriod === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  };

  // Helper to get total payment amount
  const getTotalPaymentAmount = (plan: (typeof UPGRADE_PLANS)[keyof typeof UPGRADE_PLANS]) => {
    return billingPeriod === 'annual' ? plan.priceAnnual * 12 : plan.priceMonthly;
  };

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

    const planPrice = getTotalPaymentAmount(UPGRADE_PLANS[selectedPlan]);
    couponFetcher.submit(
      { intent: 'validate_coupon', couponCode, planPrice: planPrice.toString() },
      { method: 'POST' }
    );
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
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
        <p className="text-gray-500 mt-1">{t('unlockMoreFeatures')}</p>
      </div>

      {/* bKash/Nagad Payment Section */}
      <div className="mb-6 p-5 bg-gradient-to-r from-pink-50 via-purple-50 to-emerald-50 border border-pink-200 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('bkashNagadPayment')}</h3>
            <p className="text-sm text-gray-600">{t('sendMoneySubmitTrx')}</p>
          </div>
        </div>

        {/* Payment Number */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-pink-100">
          <p className="text-sm text-gray-600 mb-2">{t('sendMoneyToNumber')}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-pink-600 font-mono">01739416661</span>
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded">
                bKash / Nagad
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('01739416661');
                alert(t('numberCopied'));
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              {t('copyBtn')}
            </button>
          </div>
        </div>

        {/* Submission Form - Show directly if plan selected from URL */}
        {selectedPlan ? (
          <PaymentSubmitForm
            selectedPlan={selectedPlan}
            appliedCoupon={appliedCoupon}
            planPrice={getTotalPaymentAmount(UPGRADE_PLANS[selectedPlan])}
            billingPeriod={billingPeriod}
            t={t}
          />
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">{t('selectPlanFirst')}</p>
          </div>
        )}
      </div>

      {/* Billing Period Toggle */}
      <div className="mb-6 flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            billingPeriod === 'monthly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {lang === 'bn' ? 'মাসিক' : 'Monthly'}
        </button>
        <button
          onClick={() => setBillingPeriod('annual')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${
            billingPeriod === 'annual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {lang === 'bn' ? 'বার্ষিক' : 'Annual'}
          <span className="px-1.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded">
            -20%
          </span>
        </button>
      </div>

      {/* Coupon Code Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900">{t('haveCouponCode')}</h3>
        </div>

        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
            <div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="font-mono font-bold text-green-700">{appliedCoupon.code}</span>
                <span className="text-sm text-green-600">({appliedCoupon.discountLabel})</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{t('discountApplied')}</p>
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
              placeholder={t('enterCouponCode')}
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
                  {t('checking')}
                </>
              ) : (
                t('apply')
              )}
            </button>
          </div>
        )}

        {!selectedPlan && !appliedCoupon && (
          <p className="text-sm text-gray-500 mt-2">{t('selectPlanToApplyCoupon')}</p>
        )}

        {couponFetcher.data?.error && (
          <p className="text-sm text-red-600 mt-2">{couponFetcher.data.error}</p>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(
          Object.entries(UPGRADE_PLANS) as [
            keyof typeof UPGRADE_PLANS,
            (typeof UPGRADE_PLANS)['starter'],
          ][]
        ).map(([key, plan]) => {
          const isCurrentPlan = key === currentPlan;
          const isDowngrade = currentPlan === 'premium' && key === 'starter';
          const Icon = plan.icon;
          const isSelected = selectedPlan === key;

          // Calculate price with coupon
          const monthlyRate = getMonthlyRate(plan);
          const totalPaymentAmount = getTotalPaymentAmount(plan);
          
          // For display in the CARD, we typically show the monthly rate
          // But if coupon is applied, it's calculated on the TOTAL amount (e.g. 20% off yearly total)
          // So we need to be careful what we display.
          
          // Let's stick to showing the "rate per month" in the card header, as is standard SaaS practice
          // But we can show a "Billed yearly" subtitle
          
          // Discount calculation for the CARD display:
          // If we have a coupon, it reduces the TOTAL amount.
          // To show the discounted "per month" rate, we divide the final discount price by 12 (if annual) or 1 (if monthly).
          
          const showDiscount = appliedCoupon && selectedPlan === key;
          
          // Display logic
          let displayRate = monthlyRate;
          let originalRate = null;
          
          if (showDiscount) {
             const months = billingPeriod === 'annual' ? 12 : 1;
             displayRate = appliedCoupon.finalPrice / months;
             originalRate = appliedCoupon.originalPrice / months; 
          } else if (billingPeriod === 'annual') {
             // If manual annual selection (20% off built-in), show the original monthly rate as strikethrough if we want?
             // Actually currently `monthlyRate` IS the discounted rate (639 is 20% off 799).
             // Let's show the standard monthly price (799) as crossed out if annual is selected.
             if (plan.priceMonthly > plan.priceAnnual) {
                originalRate = plan.priceMonthly;
             }
          }

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
              } ${isCurrentPlan || isDowngrade ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {/* Popular Badge */}
              {key === 'starter' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t('mostPopular')}
                  </span>
                </div>
              )}

              {/* Selected Badge */}
              {isSelected && !isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      key === 'starter' ? 'bg-emerald-500' : 'bg-purple-500'
                    }`}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    key === 'starter' ? 'bg-emerald-100' : 'bg-purple-100'
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${
                      key === 'starter' ? 'text-emerald-600' : 'text-purple-600'
                    }`}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {lang === 'bn' ? plan.nameBn : plan.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {lang === 'bn' ? plan.descriptionBn : plan.description}
                </p>

                {/* Price with discount */}
                <div className="mt-4">
                  {originalRate && (
                    <p className="text-lg text-gray-400 line-through">
                      ৳{originalRate.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                    </p>
                  )}
                  <p
                    className={`text-4xl font-bold ${showDiscount ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    ৳{displayRate.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                    <span className="text-base font-normal text-gray-500">{t('perMonth')}</span>
                  </p>
                  
                  {billingPeriod === 'annual' && (
                    <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                            {lang === 'bn' ? 'বছরে বিল করা হবে:' : 'Billed yearly:'} <span className="font-bold">৳{showDiscount ? appliedCoupon.finalPrice.toLocaleString('bn-BD') : totalPaymentAmount.toLocaleString('bn-BD')}</span>
                        </p>
                        {!showDiscount && (
                            <p className="text-emerald-600 font-medium">
                                {lang === 'bn' ? `(সেভ ৳${((plan.priceMonthly - plan.priceAnnual) * 12).toLocaleString('bn-BD')})` : `(Save ৳${((plan.priceMonthly - plan.priceAnnual) * 12).toLocaleString()})`}
                            </p>
                        )}
                    </div>
                  )}
                  
                  {showDiscount && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      🎉 {appliedCoupon.discountLabel} - {t('saveAmount')} ৳
                      {appliedCoupon.discountAmount}!
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {(lang === 'bn' ? plan.features : plan.featuresEn).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 ${
                        key === 'starter' ? 'text-emerald-500' : 'text-purple-500'
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="w-full py-3 text-center text-gray-500 font-medium border border-gray-200 rounded-xl bg-gray-50">
                  {t('currentPlanLabel')}
                </div>
              ) : isDowngrade ? (
                <div className="w-full py-3 text-center text-gray-400 font-medium border border-gray-200 rounded-xl bg-gray-50">
                  {t('notAvailable')}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedPlan(key);
                    // Scroll to payment section
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
                    isSelected
                      ? key === 'starter'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                        : 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                      : key === 'starter'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t('selected')}
                    </>
                  ) : (
                    t('selectThisPlan')
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('faqs')}</h3>
        <div className="space-y-3">
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              {t('faqBillingTitle')}
            </summary>
            <p className="mt-2 text-gray-600 text-sm">{t('faqBillingDesc')}</p>
          </details>
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              {t('faqUpgradeTitle')}
            </summary>
            <p className="mt-2 text-gray-600 text-sm">{t('faqUpgradeDesc')}</p>
          </details>
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              {t('faqDowngradeTitle')}
            </summary>
            <p className="mt-2 text-gray-600 text-sm">{t('faqDowngradeDesc')}</p>
          </details>
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              {t('faqCouponTitle')}
            </summary>
            <p className="mt-2 text-gray-600 text-sm">{t('faqCouponDesc')}</p>
          </details>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/8801739416661?text=Hi!%20I%20need%20help%20with%20plan%20upgrade"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50"
        title={t('contactViaWhatsapp')}
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}

// ============================================================================
// PAYMENT SUBMIT FORM COMPONENT
// ============================================================================
function PaymentSubmitForm({
  selectedPlan,
  appliedCoupon,
  planPrice,
  billingPeriod: _billingPeriod,
  t,
}: {
  selectedPlan: 'starter' | 'premium';
  appliedCoupon: { finalPrice: number } | null;
  planPrice: number;
  billingPeriod: 'monthly' | 'annual';
  t: (key: string) => string;
}) {
  const fetcher = useFetcher<{ success?: boolean; error?: string; message?: string }>();
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const finalAmount = appliedCoupon?.finalPrice ?? planPrice;
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-semibold text-green-800">{t('successfullySubmitted')}</h4>
        <p className="text-sm text-green-700 mt-1">{t('paymentVerifyActivation')}</p>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" className="space-y-4">
      <input type="hidden" name="intent" value="submit_payment" />
      <input type="hidden" name="planType" value={selectedPlan} />
      <input type="hidden" name="amount" value={finalAmount} />

      {/* Amount Display */}
      <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-200">
        <span className="text-sm font-medium text-emerald-800">{t('amountToSend')}</span>
        <span className="text-xl font-bold text-emerald-600">
          {formatPrice(finalAmount, 'BDT')}
        </span>
      </div>

      {/* Transaction ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction ID (TRX ID) *
        </label>
        <input
          type="text"
          name="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
          placeholder="e.g. TXN123456789"
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono uppercase"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('bkashNagadNumber')} *
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="01XXXXXXXXX"
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Error */}
      {fetcher.data?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {fetcher.data.error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !transactionId || !phoneNumber}
        className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            {t('submitPayment')}
          </>
        )}
      </button>
    </fetcher.Form>
  );
}

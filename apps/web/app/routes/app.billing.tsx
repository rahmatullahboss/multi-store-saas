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

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import { useState } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { stores, payments } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getUsageStats, PLAN_LIMITS, type PlanType } from '~/utils/plans.server';

// Client-side constant for AI plan prices (mirrored from server)
// Client-side constant for AI plan prices (mirrored from server)
// Moved to credit system

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
  ArrowRight,
  Bot,
  Users
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { GlassCard } from '~/components/ui/GlassCard';

export const meta: MetaFunction = () => {
  return [{ title: 'Billing & Plans - Ozzyl' }];
};

// ============================================================================
// PLAN DISPLAY CONFIG (matches marketing page)
// ============================================================================
const PLAN_DISPLAY = {
  free: {
    name: 'Free',
    nameBn: 'ফ্রি',
    description: 'Perfect for testing and getting started',
    descriptionBn: 'ট্রায়ালের জন্য পারফেক্ট',
    priceMonthly: 0,
    priceAnnual: 0,
    period: '/মাস',
    icon: Rocket,
    color: 'gray',
    features: [
      { text: '২০টি Product', textEn: '20 products', included: true },
      { text: '৫০ Orders/মাস', textEn: '50 orders/month', included: true },
      { text: 'সীমাহীন Visitors*', textEn: 'Unlimited visitors*', included: true },
      { text: 'Store + Landing Page', textEn: 'Store + Landing Page', included: true },
      { text: 'Live Visual Editor', textEn: 'Live Visual Editor', included: true },
      { text: 'Bangla Support', textEn: 'Bangla Support', included: true },
      { text: 'Custom Domain', textEn: 'Custom domain', included: false },
    ],
  },
  starter: {
    name: 'Starter',
    nameBn: 'স্টার্টার',
    description: 'For growing businesses',
    descriptionBn: 'বাড়তে থাকা ব্যবসার জন্য',
    priceMonthly: 799,
    priceAnnual: 639,
    period: '/মাস',
    icon: Zap,
    color: 'emerald',
    popular: true,
    features: [
      { text: '১০০টি Product', textEn: '100 products', included: true },
      { text: '৫০০ Orders/মাস', textEn: '500 orders/month', included: true },
      { text: 'সীমাহীন Visitors*', textEn: 'Unlimited visitors*', included: true },
      { text: 'Full E-commerce Store', textEn: 'Full store mode', included: true },
      { text: 'Custom Domain', textEn: 'Custom domain', included: true },
      { text: 'Facebook Pixel', textEn: 'Facebook Pixel', included: true },
      { text: '২ জন Team Member', textEn: '2 team members', included: true },
      { text: 'সব Free Features', textEn: 'All Free features', included: true },
    ],
  },
  premium: {
    name: 'Premium',
    nameBn: 'প্রিমিয়াম',
    description: 'For serious businesses',
    descriptionBn: 'সিরিয়াস ব্যবসার জন্য',
    priceMonthly: 1999,
    priceAnnual: 1599,
    period: '/মাস',
    icon: Crown,
    color: 'purple',
    features: [
      { text: '২০০টি Product', textEn: '200 products', included: true },
      { text: '২,০০০ Orders/মাস', textEn: '2,000 orders/month', included: true },
      { text: 'সীমাহীন Visitors*', textEn: 'Unlimited visitors*', included: true },
      { text: 'Facebook CAPI', textEn: 'Facebook CAPI', included: true },
      { text: 'Priority Support', textEn: 'Priority support', included: true },
      { text: '২ GB Storage', textEn: '2 GB Storage', included: true },
      { text: '৫ জন Team Member', textEn: '5 team members', included: true },
      { text: '০% Platform Fee (আপাতত ফ্রি)', textEn: '0% Platform Fee (Currently Free)', included: true },
      { text: 'সব Starter Features', textEn: 'All Starter features', included: true },
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

  // Get store info
  const storeResult = await db
    .select({
      planType: stores.planType,
      subscriptionStatus: stores.subscriptionStatus,
      name: stores.name,
      isCustomerAiEnabled: stores.isCustomerAiEnabled,
      aiAgentRequestStatus: stores.aiAgentRequestStatus,
      // aiPlan removed
      paymentStatus: stores.paymentStatus,
      paymentTransactionId: stores.paymentTransactionId,
      paymentPhone: stores.paymentPhone,
      paymentAmount: stores.paymentAmount,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  const planType = (store?.planType as PlanType) || 'free';
  const subscriptionStatus = store?.subscriptionStatus || 'active';

  // Get usage stats
  const usage = await getUsageStats(context.cloudflare.env.DB, storeId);

  // Get payment history
  const paymentHistory = await db
    .select()
    .from(payments)
    .where(eq(payments.storeId, storeId))
    .orderBy(desc(payments.createdAt))
    .limit(10);

  return json({
    storeName: store?.name || 'Your Store',
    planType,
    subscriptionStatus,
    usage,
    limits: PLAN_LIMITS[planType],
    isCustomerAiEnabled: store?.isCustomerAiEnabled || false,
    aiAgentRequestStatus: store?.aiAgentRequestStatus || 'none',
    // aiPlan removed
    paymentStatus: store?.paymentStatus || 'none',
    paymentTransactionId: store?.paymentTransactionId || null,
    paymentPhone: store?.paymentPhone || null,
    paymentAmount: store?.paymentAmount || null,
    paymentHistory,
  });
}

// ============================================================================
// ACTION - Request AI Agent Activation
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const actionType = formData.get('action');

  const db = drizzle(context.cloudflare.env.DB);

  // activate_ai_plan action removed as we moved to credit system

  if (actionType === 'submit_ai_payment') {
    const transactionId = formData.get('transactionId') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const amount = parseFloat(formData.get('amount') as string);

    if (!transactionId || transactionId.length < 6) {
      return json({ error: 'Invalid Transaction ID' }, { status: 400 });
    }
    if (!phoneNumber || phoneNumber.length < 11) {
      return json({ error: 'Invalid Phone Number' }, { status: 400 });
    }

    await db
      .update(stores)
      .set({ 
        paymentTransactionId: transactionId.trim(),
        paymentPhone: phoneNumber.trim(),
        paymentAmount: amount,
        paymentStatus: 'pending_verification',
        aiAgentRequestStatus: 'pending',
        updatedAt: new Date()
      })
      .where(eq(stores.id, storeId));
    
    return json({ success: true });
  }

  if (actionType === 'disable_ai_agent') {
    // Disable AI agent
    await db
      .update(stores)
      .set({ 
        isCustomerAiEnabled: false,
        // aiPlan: null, // Removed
        aiAgentRequestStatus: 'none',
        updatedAt: new Date()
      })
      .where(eq(stores.id, storeId));
    
    return json({ success: true, isCustomerAiEnabled: false });
  }

  // Handle Plan Upgrade (Legacy or Future)
  if (actionType === 'request_ai_agent') {
      // Legacy or manual request
      await db
      .update(stores)
      .set({ 
          aiAgentRequestStatus: 'pending',
          aiAgentRequestedAt: new Date(),
          updatedAt: new Date()
      })
      .where(eq(stores.id, storeId));
      return json({ success: true, aiAgentRequestStatus: 'pending' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BillingPage() {
  const { 
    planType, 
    subscriptionStatus, 
    usage: rawUsage
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  // Use a minimal T function if language context is missing or fix usage
  // The user's rule says "Use Context7 MCP server: Fetch latest docs...". 
  // Assuming 't' exists in useTranslation.
  const { t, lang } = useTranslation();
  
  // Safe defaults for usage to prevent null errors
  const usage = {
    orders: {
      current: rawUsage?.orders?.current ?? 0,
      limit: rawUsage?.orders?.limit ?? 0,
      percentage: rawUsage?.orders?.percentage ?? 0,
    },
    products: {
      current: rawUsage?.products?.current ?? 0,
      limit: rawUsage?.products?.limit ?? 0,
      percentage: rawUsage?.products?.percentage ?? 0,
    },
    visitors: {
      current: rawUsage?.visitors?.current ?? 0,
      limit: rawUsage?.visitors?.limit ?? Infinity,
      percentage: rawUsage?.visitors?.percentage ?? 0,
    },
  };
  
  const success = searchParams.get('success');
  const upgradedPlan = searchParams.get('plan');
  const trxID = searchParams.get('trxID');
  const error = searchParams.get('error');
  
  const currentPlan = PLAN_DISPLAY[planType as keyof typeof PLAN_DISPLAY] || PLAN_DISPLAY.free;
  
  // Billing period toggle state
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  // Helper to get display price
  const getDisplayPrice = (plan: { priceMonthly: number; priceAnnual: number }) => {
    const price = billingPeriod === 'annual' ? plan.priceAnnual : plan.priceMonthly;
    return `৳${price.toLocaleString('bn-BD')}`;
  };
  


  return (
    <div className="space-y-8">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-semibold">🎉 {lang === 'bn' ? 'প্ল্যান সফলভাবে আপগ্রেড হয়েছে!' : 'Plan Upgraded Successfully!'}</p>
          <p className="text-green-700 text-sm mt-1">
            {lang === 'bn' ? `আপনার প্ল্যান ${upgradedPlan} এ আপগ্রেড হয়েছে। ট্রানজেকশন আইডি: ${trxID}` : `Your plan has been upgraded to ${upgradedPlan}. Transaction ID: ${trxID}`}
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-semibold">{lang === 'bn' ? 'পেমেন্ট ব্যর্থ' : 'Payment Failed'}</p>
          <p className="text-red-700 text-sm mt-1">
            {error === 'payment_cancelled' && (lang === 'bn' ? 'পেমেন্ট বাতিল করা হয়েছে। আবার চেষ্টা করুন।' : 'Payment was cancelled. Please try again.')}
            {error === 'payment_failed' && (lang === 'bn' ? 'পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Payment failed. Please try again or use a different method.')}
            {error === 'payment_incomplete' && (lang === 'bn' ? 'পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন।' : 'Payment could not be completed. Please try again.')}
            {error === 'execution_failed' && (lang === 'bn' ? 'পেমেন্ট প্রসেস করতে সমস্যা হয়েছে। সাপোর্টে যোগাযোগ করুন।' : 'There was an error processing your payment. Please contact support.')}
          </p>
        </div>
      )}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('billing')}</h1>
        <p className="text-gray-500 mt-1">{t('managePlanAndUsage')}</p>
      </div>

      {/* Current Plan Card */}
      <GlassCard variant="hover" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${currentPlan.color}-100`}>
              <currentPlan.icon className={`w-6 h-6 text-${currentPlan.color}-600`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {lang === 'bn' ? currentPlan.nameBn : currentPlan.name} {t('plan')}
                </h2>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  subscriptionStatus === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : subscriptionStatus === 'past_due'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {subscriptionStatus === 'active' ? t('planStatusActive') : subscriptionStatus === 'past_due' ? t('planStatusPastDue') : t('planStatusCanceled')}
                </span>
              </div>
              <p className="text-gray-500">{lang === 'bn' ? currentPlan.descriptionBn : currentPlan.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {getDisplayPrice(currentPlan)}
              <span className="text-sm font-normal text-gray-500">{currentPlan.period}</span>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders Usage */}
        <GlassCard variant="hover" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('monthlyOrders')}</h3>
              <p className="text-sm text-gray-500">{t('resetsOn1st')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('usage')}</span>
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
                ⚠️ {t('approachingLimit')}
              </p>
            )}
          </div>
        </GlassCard>

        {/* Products Usage */}
        <GlassCard variant="hover" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('activeProducts')}</h3>
              <p className="text-sm text-gray-500">{t('publishedProducts')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{lang === 'bn' ? 'ব্যবহার' : 'Usage'}</span>
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
            {planType === 'free' && usage.products.current >= 20 && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ {t('freePlanLimit20Products')}
              </p>
            )}
          </div>
        </GlassCard>

        {/* Visitors Usage */}
        <GlassCard variant="hover" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('monthlyVisitors')}</h3>
              <p className="text-sm text-gray-500">{t('uniqueVisitorsThisMonth')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('usage')}</span>
              <span className="font-medium text-gray-900">
                {usage.visitors.limit === Infinity ? t('unlimited') : `${usage.visitors.current.toLocaleString()} / ${usage.visitors.limit.toLocaleString()}`}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  usage.visitors.percentage >= 90 ? 'bg-red-500' : 
                  usage.visitors.percentage >= 70 ? 'bg-yellow-500' : 
                  'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(usage.visitors.percentage, 100)}%` }}
              />
            </div>
            {usage.visitors.percentage >= 80 && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ {t('highTrafficUpgrade')}
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Add-ons Section */}
      {/* AI Credits Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('aiCredits')}</h3>
              <p className="text-gray-600">
                {lang === 'bn' ? 'AI ব্যবহার করতে ক্রেডিট কিনুন' : 'Purchase credits to use AI features'}
              </p>
            </div>
          </div>
          <Link 
            to="/app/credits"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
          >
            {t('manageCredits')}
            <ArrowRight className="w-4 h-4" />
          </Link>
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
                <h3 className="text-lg font-bold">{t('readyToGrow')}</h3>
                <p className="text-emerald-100">
                  {t('upgradeToStarterDesc')}
                </p>
              </div>
            </div>
            <Link 
              to="/app/upgrade"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition"
            >
              {t('upgradeNow')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Pricing Table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">{lang === 'bn' ? 'প্ল্যান তুলনা করুন' : 'Compare Plans'}</h2>
          
          {/* Billing Period Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {lang === 'bn' ? 'সবচেয়ে জনপ্রিয়' : 'Most Popular'}
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-${plan.color}-100`}>
                    <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{lang === 'bn' ? plan.nameBn : plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? plan.descriptionBn : plan.description}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-4">
                    {getDisplayPrice(plan)}
                    <span className="text-sm font-normal text-gray-500">{plan.period}</span>
                  </p>
                  {billingPeriod === 'annual' && plan.priceMonthly > 0 && (
                    <p className="text-sm text-emerald-600 font-medium mt-1">
                      {lang === 'bn' ? `বছরে ৳${((plan.priceMonthly - plan.priceAnnual) * 12).toLocaleString('bn-BD')} সেভ` : `Save ৳${((plan.priceMonthly - plan.priceAnnual) * 12).toLocaleString()} / year`}
                    </p>
                  )}
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
                        {lang === 'bn' ? feature.text : feature.textEn}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {isCurrentPlan ? (
                  <div className="w-full py-2.5 text-center text-emerald-600 font-medium border border-emerald-200 rounded-lg bg-emerald-50">
                    {lang === 'bn' ? 'বর্তমান প্ল্যান' : 'Current Plan'}
                  </div>
                ) : (
                  <Link 
                    to={`/app/upgrade?plan=${key}&billing=${billingPeriod}`}
                    className={`block w-full py-2.5 text-center text-white font-medium rounded-lg transition ${
                      key === 'starter' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      key === 'premium' ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {t('upgradeTo')} {lang === 'bn' ? plan.nameBn : plan.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Business Plan - Contact Us */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('businessPlan')}</h3>
                <p className="text-white/80">
                  {t('customSolutionForLarge')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                t('unlimitedProducts'),
                t('unlimitedOrders'),
                t('unlimitedVisitors'),
                t('dedicatedSupport'),
              ].map((feature, i) => (
                <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-white/70 text-sm">
              {t('everythingUnlimited')}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition"
            >
              {t('contactUs')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ or Help */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{t('needHelp')}</h3>
        <p className="text-gray-600">
          {t('billingSupportContact')}
        </p>
      </div>
    </div>
  );
}

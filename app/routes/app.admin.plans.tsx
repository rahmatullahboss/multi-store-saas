/**
 * Admin Plan Management Page with Premium Design
 * 
 * Route: /app/admin/plans
 * 
 * Allows platform admin to:
 * - View all stores and their current plans
 * - View pending bKash payments and verify/reject them
 * - Manually upgrade/downgrade store plans
 * - Search stores by name or subdomain
 * 
 * Design: Uses premium dark theme matching marketing page
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigation, useSearchParams, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, like, or, desc, isNotNull } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { requireUserId } from '~/services/auth.server';
import { getBulkUsageStats, PLAN_LIMITS, type PlanType } from '~/utils/plans.server';
import { Crown, Zap, Gift, Search, Check, Calendar, ArrowUpCircle, AlertCircle, Mail, Phone, Copy, CheckCircle, XCircle, ArrowDown, Star, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => [{ title: 'Plan Management - Admin' }];

// ============================================================================
// DESIGN TOKENS (Matching Marketing Page)
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  primaryLight: '#00875F',
  accent: '#F9A825',       // Golden Yellow
  accentLight: '#FFB74D',
  background: '#0A0F0D',
  backgroundAlt: '#0D1512',
  violet: '#8B5CF6',
  blue: '#3B82F6',
};

// Plan options with premium styling
const PLAN_OPTIONS = [
  { 
    value: 'free', 
    label: 'Free', 
    labelKey: 'planFree' as const, 
    nameBn: 'শুরু করুন',
    icon: Gift,
    price: '৳০',
    description: 'ট্রায়ালের জন্য পারফেক্ট',
    features: ['১টি Product', '১টি Landing Page', '৫০ Sales/মাস'],
  },
  { 
    value: 'starter', 
    label: 'Starter', 
    labelKey: 'planStarter' as const, 
    nameBn: 'সবচেয়ে জনপ্রিয়',
    icon: Zap,
    price: '৳৪৯৯',
    description: 'বাড়তে থাকা ব্যবসার জন্য',
    features: ['৫০টি Product', 'Multiple Landing Pages', '৫০০ Sales/মাস'],
    isPopular: true,
  },
  { 
    value: 'premium', 
    label: 'Premium', 
    labelKey: 'planPremium' as const, 
    nameBn: 'সীমাহীন',
    icon: Crown,
    price: '৳১,৯৯৯',
    description: 'এন্টারপ্রাইজ লেভেল',
    features: ['Unlimited Products', 'Unlimited Landing Pages', 'Unlimited Sales'],
    isUltimate: true,
  },
];

// ============================================================================
// LOADER - Fetch all stores and pending payments (admin only)
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  // Check if user is admin
  const user = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0] || user[0].role !== 'admin') {
    throw new Response('Unauthorized - Admin access required', { status: 403 });
  }

  // Get search query
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  // Fetch all stores
  let storeQuery = db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      createdAt: stores.createdAt,
      isActive: stores.isActive,
    })
    .from(stores)
    .orderBy(desc(stores.createdAt));

  // Apply search filter
  if (search) {
    storeQuery = storeQuery.where(
      or(
        like(stores.name, `%${search}%`),
        like(stores.subdomain, `%${search}%`)
      )
    ) as typeof storeQuery;
  }

  const allStores = await storeQuery.limit(100);

  // Fetch pending payments separately (stores with pending_verification status)
  const pendingPayments = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      paymentTransactionId: stores.paymentTransactionId,
      paymentStatus: stores.paymentStatus,
      paymentSubmittedAt: stores.paymentSubmittedAt,
      paymentAmount: stores.paymentAmount,
      paymentPhone: stores.paymentPhone,
      createdAt: stores.createdAt,
    })
    .from(stores)
    .where(eq(stores.paymentStatus, 'pending_verification'))
    .orderBy(desc(stores.paymentSubmittedAt))
    .limit(50);

  // Get owner emails for pending payments
  const pendingWithOwners = await Promise.all(
    pendingPayments.map(async (store) => {
      const owner = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.storeId, store.id))
        .limit(1);
      return {
        ...store,
        ownerEmail: owner[0]?.email || 'N/A',
        ownerName: owner[0]?.name || 'N/A',
      };
    })
  );

  // Count by plan
  const planCounts = {
    free: allStores.filter(s => !s.planType || s.planType === 'free').length,
    starter: allStores.filter(s => s.planType === 'starter').length,
    premium: allStores.filter(s => s.planType === 'premium').length,
  };

  // Fetch bulk usage stats for all stores
  const storeIds = allStores.map(s => s.id);
  const usageMap = await getBulkUsageStats(context.cloudflare.env.DB, storeIds);
  
  // Attach usage stats to each store
  const storesWithUsage = allStores.map(store => {
    const usage = usageMap.get(store.id) || { orders: 0, products: 0 };
    const planType = (store.planType as PlanType) || 'free';
    // Safely get limits with fallback to 'free' if planType is invalid
    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS['free'];
    return {
      ...store,
      usage: {
        orders: usage.orders,
        ordersLimit: limits.max_orders,
        products: usage.products,
        productsLimit: limits.max_products,
      },
    };
  });

  return json({
    stores: storesWithUsage,
    pendingPayments: pendingWithOwners,
    planCounts,
    search,
  });
}

// ============================================================================
// ACTION - Update store plan or verify/reject payment (admin only)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  // Check if user is admin
  const user = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0] || user[0].role !== 'admin') {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  const storeId = Number(formData.get('storeId'));

  if (!storeId) {
    return json({ error: 'Missing store ID' }, { status: 400 });
  }

  // Handle different action types
  switch (actionType) {
    case 'update_plan': {
      const newPlan = formData.get('planType') as string;
      if (!newPlan || !['free', 'starter', 'premium', 'custom'].includes(newPlan)) {
        return json({ error: 'Invalid plan type' }, { status: 400 });
      }
      
      // Get current plan to check if upgrading from free
      const currentStore = await db
        .select({ planType: stores.planType, subscriptionStartDate: stores.subscriptionStartDate })
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);

      const currentPlan = currentStore[0]?.planType || 'free';
      const isUpgradingFromFree = currentPlan === 'free' && newPlan !== 'free';
      const hasNoStartDate = !currentStore[0]?.subscriptionStartDate;

      // Calculate subscription dates (1 month from now)
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      // Build update object
      const updateData: Record<string, unknown> = {
        planType: newPlan as 'free' | 'starter' | 'premium' | 'custom',
        updatedAt: new Date(),
      };

      // Auto-set subscription dates when upgrading to paid OR if no dates exist yet
      if ((isUpgradingFromFree || hasNoStartDate) && newPlan !== 'free') {
        updateData.subscriptionStartDate = now;
        updateData.subscriptionEndDate = endDate;
        updateData.subscriptionPaymentMethod = 'manual';
      }

      await db.update(stores).set(updateData).where(eq(stores.id, storeId));
      return json({ success: true, message: 'Plan updated', storeId, newPlan });
    }

    case 'verify_payment': {
      await db.update(stores).set({ 
        paymentStatus: 'verified',
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      return json({ success: true, message: 'Payment verified', storeId });
    }

    case 'reject_payment': {
      await db.update(stores).set({ 
        paymentStatus: 'rejected',
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      return json({ success: true, message: 'Payment rejected', storeId });
    }

    case 'downgrade_to_free': {
      await db.update(stores).set({ 
        planType: 'free',
        paymentStatus: 'rejected',
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      return json({ success: true, message: 'Store downgraded to Free', storeId });
    }

    default:
      return json({ error: 'Invalid action type' }, { status: 400 });
  }
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function AdminPlansPage() {
  const { stores: allStores, pendingPayments, planCounts, search } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);
  const { t, lang: language } = useTranslation();

  const isSubmitting = navigation.state === 'submitting';

  // Handle successful update
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setSuccessMessage(actionData.message || t('planUpdatedSuccess'));
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData, t]);

  const copyTrxId = (trxId: string) => {
    navigator.clipboard.writeText(trxId);
    setCopiedTrxId(trxId);
    setTimeout(() => setCopiedTrxId(null), 2000);
  };

  return (
    <div 
      className="min-h-screen py-8 px-4 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes gradientBorder {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 106, 78, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 106, 78, 0.5); }
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${COLORS.violet}15 0%, transparent 70%)`,
          }}
        />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ 
              backgroundColor: `${COLORS.primary}20`,
              borderColor: `${COLORS.primary}40`,
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span className="text-sm" style={{ color: COLORS.accent }}>
              Admin Panel
            </span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            প্ল্যান{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
              }}
            >
              ম্যানেজমেন্ট
            </span>
          </h1>
          <p className="text-lg text-white/50">
            {t('planManagementDesc')}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-[#006A4E]/20 border border-[#006A4E]/40 text-[#00875F] rounded-2xl flex items-center gap-2 backdrop-blur-xl">
            <Check className="w-5 h-5" />
            <span className="text-white">{successMessage}</span>
          </div>
        )}

        {/* Plan Stats Cards - Marketing Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLAN_OPTIONS.map((plan, index) => {
            const Icon = plan.icon;
            const count = planCounts[plan.value as keyof typeof planCounts] || 0;
            
            return (
              <div 
                key={plan.value}
                className={`relative h-full rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${
                  plan.isPopular 
                    ? 'bg-gradient-to-br from-[#006A4E] to-[#00875F] text-white shadow-2xl shadow-[#006A4E]/40' 
                    : plan.isUltimate
                      ? 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/10 border border-[#8B5CF6]/30 backdrop-blur-xl'
                      : 'bg-white/[0.03] backdrop-blur-xl border border-white/10'
                }`}
                style={plan.isPopular ? { animation: 'pulse-glow 3s infinite' } : {}}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-[#F9A825] text-black font-bold text-sm rounded-full shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    সবচেয়ে জনপ্রিয়
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    plan.isPopular 
                      ? 'bg-white/20' 
                      : plan.isUltimate
                        ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]'
                        : 'bg-white/10'
                  }`}>
                    <Icon className={`w-7 h-7 ${plan.isPopular ? 'text-white' : plan.isUltimate ? 'text-white' : 'text-white/60'}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.label}</h3>
                    <p className={`text-sm ${plan.isPopular ? 'text-white/80' : 'text-white/50'}`}>
                      {plan.nameBn}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black text-white">{count}</span>
                  <span className={`text-lg ${plan.isPopular ? 'text-white/70' : 'text-white/40'}`}>stores</span>
                </div>

                <div className="text-center pt-4 border-t border-white/10">
                  <span className={`text-3xl font-black ${plan.isPopular ? 'text-white' : 'text-white/80'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.isPopular ? 'text-white/70' : 'text-white/40'}`}>/মাস</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div className="mb-8 bg-[#F9A825]/10 backdrop-blur-xl border-2 border-[#F9A825]/30 rounded-3xl overflow-hidden">
            <div className="bg-[#F9A825]/20 px-6 py-4 border-b border-[#F9A825]/30">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-[#F9A825]" />
                {t('pendingPayments')} ({pendingPayments.length})
              </h2>
              <p className="text-sm text-white/60">{t('pendingPaymentsDesc')}</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-white/60 border-b border-white/10">
                      <th className="pb-4 font-medium">{t('store')}</th>
                      <th className="pb-4 font-medium">{t('plan')}</th>
                      <th className="pb-4 font-medium">{t('trxId')}</th>
                      <th className="pb-4 font-medium">{t('paymentAmount')}</th>
                      <th className="pb-4 font-medium">{t('ownerEmail')}</th>
                      <th className="pb-4 font-medium">{t('submittedAt')}</th>
                      <th className="pb-4 font-medium">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {pendingPayments.map((store) => (
                      <tr key={store.id} className="text-sm">
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-white">{store.name}</p>
                            <p className="text-xs text-white/40">{store.subdomain}.digitalcare.site</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <PlanBadge plan={store.planType || 'free'} />
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-white/10 px-2 py-1 rounded border border-white/20 text-xs font-mono text-white">
                              {store.paymentTransactionId}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyTrxId(store.paymentTransactionId || '')}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              title="Copy"
                            >
                              {copiedTrxId === store.paymentTransactionId ? (
                                <Check className="w-4 h-4 text-[#006A4E]" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#F9A825]" />
                              )}
                            </button>
                          </div>
                          {store.paymentPhone && (
                            <p className="text-xs text-white/40 mt-1">
                              <Phone className="w-3 h-3 inline mr-1" />
                              {store.paymentPhone}
                            </p>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-[#F9A825]">৳{store.paymentAmount}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-white/40" />
                            <a 
                              href={`mailto:${store.ownerEmail}`}
                              className="text-[#3B82F6] hover:underline text-xs"
                            >
                              {store.ownerEmail}
                            </a>
                          </div>
                          <p className="text-xs text-white/40">{store.ownerName}</p>
                        </td>
                        <td className="py-4 text-xs text-white/40">
                          {store.paymentSubmittedAt 
                            ? new Date(store.paymentSubmittedAt).toLocaleString('en-BD')
                            : 'N/A'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {/* Verify Button */}
                            <Form method="post">
                              <input type="hidden" name="actionType" value="verify_payment" />
                              <input type="hidden" name="storeId" value={store.id} />
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006A4E] hover:bg-[#00875F] text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                                title={t('verifyPayment')}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t('verifyPayment')}
                              </button>
                            </Form>
                            
                            {/* Downgrade Button */}
                            <Form method="post">
                              <input type="hidden" name="actionType" value="downgrade_to_free" />
                              <input type="hidden" name="storeId" value={store.id} />
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                                title={t('downgradeToFree')}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                                {language === 'bn' ? 'ফ্রি' : 'Free'}
                              </button>
                            </Form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <Form method="get" className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder={t('searchStores')}
                className="w-full pl-12 pr-4 py-3 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#006A4E]/50 focus:border-[#006A4E]/50 text-white placeholder-white/40 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#00875F] hover:to-[#006A4E] text-white font-medium rounded-2xl transition shadow-lg shadow-[#006A4E]/20"
            >
              {t('search')}
            </button>
          </Form>
        </div>

        {/* Stores Table */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.05] border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">{t('store')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">{t('subdomain')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">{t('currentPlan')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Usage</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">{t('created')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allStores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      {t('noResults')}
                    </td>
                  </tr>
                ) : (
                  allStores.map((store) => (
                    <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#8B5CF6]/30">
                            {store.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-white">{store.name}</p>
                            <p className="text-xs text-white/40">ID: {store.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={`https://${store.subdomain}.digitalcare.site`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] hover:text-[#60A5FA] hover:underline text-sm transition-colors"
                        >
                          {store.subdomain}.digitalcare.site
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <PlanBadge plan={store.planType || 'free'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className={`flex items-center gap-2 ${
                            store.usage.ordersLimit !== Infinity && 
                            (store.usage.orders / store.usage.ordersLimit) >= 0.8 
                              ? 'text-[#F9A825]' 
                              : 'text-white/60'
                          }`}>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#006A4E] to-[#00875F] rounded-full transition-all"
                                style={{ 
                                  width: store.usage.ordersLimit === Infinity 
                                    ? '10%' 
                                    : `${Math.min((store.usage.orders / store.usage.ordersLimit) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span>O: {store.usage.orders}/{store.usage.ordersLimit === Infinity ? '∞' : store.usage.ordersLimit}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${
                            store.usage.productsLimit !== Infinity && 
                            (store.usage.products / store.usage.productsLimit) >= 0.8 
                              ? 'text-[#F9A825]' 
                              : 'text-white/60'
                          }`}>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full transition-all"
                                style={{ 
                                  width: store.usage.productsLimit === Infinity 
                                    ? '10%' 
                                    : `${Math.min((store.usage.products / store.usage.productsLimit) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span>P: {store.usage.products}/{store.usage.productsLimit === Infinity ? '∞' : store.usage.productsLimit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">
                        {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <Form method="post" className="flex items-center gap-2">
                          <input type="hidden" name="actionType" value="update_plan" />
                          <input type="hidden" name="storeId" value={store.id} />
                          <select
                            name="planType"
                            defaultValue={store.planType || 'free'}
                            className="text-sm bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#006A4E]/50 focus:border-[#006A4E]/50 transition-all"
                          >
                            <option value="free" className="bg-[#0A0F0D] text-white">{t('planFree')}</option>
                            <option value="starter" className="bg-[#0A0F0D] text-white">{t('planStarter')}</option>
                            <option value="premium" className="bg-[#0A0F0D] text-white">{t('planPremium')}</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white text-sm font-medium rounded-xl transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20"
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                            {t('update')}
                          </button>
                        </Form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 backdrop-blur-xl border border-[#3B82F6]/30 rounded-3xl p-6">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F9A825]" />
            {t('planNotes')}
          </h4>
          <ul className="text-sm text-white/60 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#006A4E]" />
              {t('planFreeNote')}
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#006A4E]" />
              {t('planStarterNote')}
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              {t('planPremiumNote')}
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F9A825]" />
              {t('plansEffectImmediate')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Plan Badge Component - Premium Style
function PlanBadge({ plan }: { plan: string }) {
  const { t } = useTranslation();
  
  const config = {
    free: { 
      bg: 'bg-white/10', 
      text: 'text-white/70', 
      border: 'border-white/20',
      labelKey: 'planFree' as const 
    },
    starter: { 
      bg: 'bg-gradient-to-r from-[#006A4E]/30 to-[#00875F]/30', 
      text: 'text-[#00875F]', 
      border: 'border-[#006A4E]/40',
      labelKey: 'planStarter' as const 
    },
    premium: { 
      bg: 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#3B82F6]/30', 
      text: 'text-[#8B5CF6]', 
      border: 'border-[#8B5CF6]/40',
      labelKey: 'planPremium' as const 
    },
    custom: { 
      bg: 'bg-gradient-to-r from-[#F9A825]/30 to-[#FFB74D]/30', 
      text: 'text-[#F9A825]', 
      border: 'border-[#F9A825]/40',
      labelKey: 'planPremium' as const 
    },
  }[plan] || { 
    bg: 'bg-white/10', 
    text: 'text-white/70', 
    border: 'border-white/20',
    labelKey: 'planFree' as const 
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
      {t(config.labelKey)}
    </span>
  );
}

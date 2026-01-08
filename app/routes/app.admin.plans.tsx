/**
 * Admin Plan Management Page with Pending Payments
 * 
 * Route: /app/admin/plans
 * 
 * Allows platform admin to:
 * - View all stores and their current plans
 * - View pending bKash payments and verify/reject them
 * - Manually upgrade/downgrade store plans
 * - Search stores by name or subdomain
 * 
 * MVP: Manual plan management with bKash verification
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigation, useSearchParams, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, like, or, desc, isNotNull } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { requireUserId } from '~/services/auth.server';
import { getBulkUsageStats, PLAN_LIMITS, type PlanType } from '~/utils/plans.server';
import { Crown, Zap, Gift, Search, Check, Calendar, ArrowUpCircle, AlertCircle, Mail, Phone, Copy, CheckCircle, XCircle, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => [{ title: 'Plan Management - Admin' }];

// Plan options
const PLAN_OPTIONS = [
  { value: 'free', label: 'Free', labelKey: 'planFree' as const, color: 'gray', icon: Gift },
  { value: 'starter', label: 'Starter', labelKey: 'planStarter' as const, color: 'emerald', icon: Zap },
  { value: 'premium', label: 'Premium', labelKey: 'planPremium' as const, color: 'purple', icon: Crown },
];

// ============================================================================
// LOADER - Fetch all stores and pending payments (admin only)
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
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
    const limits = PLAN_LIMITS[planType];
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
  const userId = await requireUserId(request);
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Crown className="w-7 h-7 text-purple-600" />
          {t('planManagement')}
        </h1>
        <p className="text-gray-600 mt-1">{t('planManagementDesc')}</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl overflow-hidden">
          <div className="bg-amber-100 px-4 py-3 border-b border-amber-200">
            <h2 className="font-bold text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t('pendingPayments')} ({pendingPayments.length})
            </h2>
            <p className="text-sm text-amber-700">{t('pendingPaymentsDesc')}</p>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-amber-800">
                    <th className="pb-3">{t('store')}</th>
                    <th className="pb-3">{t('plan')}</th>
                    <th className="pb-3">{t('trxId')}</th>
                    <th className="pb-3">{t('paymentAmount')}</th>
                    <th className="pb-3">{t('ownerEmail')}</th>
                    <th className="pb-3">{t('submittedAt')}</th>
                    <th className="pb-3">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200">
                  {pendingPayments.map((store) => (
                    <tr key={store.id} className="text-sm">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-xs text-gray-500">{store.subdomain}.digitalcare.site</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <PlanBadge plan={store.planType || 'free'} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-2 py-1 rounded border text-xs font-mono">
                            {store.paymentTransactionId}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyTrxId(store.paymentTransactionId || '')}
                            className="p-1 hover:bg-amber-200 rounded transition-colors"
                            title="Copy"
                          >
                            {copiedTrxId === store.paymentTransactionId ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-amber-600" />
                            )}
                          </button>
                        </div>
                        {store.paymentPhone && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Phone className="w-3 h-3 inline mr-1" />
                            {store.paymentPhone}
                          </p>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="font-medium">৳{store.paymentAmount}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <a 
                            href={`mailto:${store.ownerEmail}`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            {store.ownerEmail}
                          </a>
                        </div>
                        <p className="text-xs text-gray-500">{store.ownerName}</p>
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {store.paymentSubmittedAt 
                          ? new Date(store.paymentSubmittedAt).toLocaleString('en-BD')
                          : 'N/A'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {/* Verify Button */}
                          <Form method="post">
                            <input type="hidden" name="actionType" value="verify_payment" />
                            <input type="hidden" name="storeId" value={store.id} />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition disabled:opacity-50"
                              title={t('verifyPayment')}
                            >
                              <CheckCircle className="w-3 h-3" />
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
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition disabled:opacity-50"
                              title={t('downgradeToFree')}
                            >
                              <ArrowDown className="w-3 h-3" />
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLAN_OPTIONS.map((plan) => {
          const Icon = plan.icon;
          const count = planCounts[plan.value as keyof typeof planCounts] || 0;
          const storeLabel = plan.value === 'free' ? t('freeStores') : plan.value === 'starter' ? t('starterStores') : t('premiumStores');
          return (
            <div 
              key={plan.value}
              className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                plan.value === 'free' ? 'bg-gray-100' :
                plan.value === 'starter' ? 'bg-emerald-100' : 'bg-purple-100'
              }`}>
                <Icon className={`w-6 h-6 ${
                  plan.value === 'free' ? 'text-gray-600' :
                  plan.value === 'starter' ? 'text-emerald-600' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500">{storeLabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Form method="get" className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder={t('searchStores')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            {t('search')}
          </button>
        </Form>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('store')}</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('subdomain')}</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('currentPlan')}</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Usage</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('created')}</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {t('noResults')}
                  </td>
                </tr>
              ) : (
                allStores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {store.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-xs text-gray-500">ID: {store.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a 
                        href={`https://${store.subdomain}.digitalcare.site`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {store.subdomain}.digitalcare.site
                      </a>
                    </td>
                    <td className="px-4 py-3">
                    <PlanBadge plan={store.planType || 'free'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs space-y-0.5">
                        <div className={`${
                          store.usage.ordersLimit !== Infinity && 
                          (store.usage.orders / store.usage.ordersLimit) >= 0.8 
                            ? 'text-amber-600' 
                            : 'text-gray-600'
                        }`}>
                          O: {store.usage.orders}/{store.usage.ordersLimit === Infinity ? '∞' : store.usage.ordersLimit}
                        </div>
                        <div className={`${
                          store.usage.productsLimit !== Infinity && 
                          (store.usage.products / store.usage.productsLimit) >= 0.8 
                            ? 'text-amber-600' 
                            : 'text-gray-600'
                        }`}>
                          P: {store.usage.products}/{store.usage.productsLimit === Infinity ? '∞' : store.usage.productsLimit}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Form method="post" className="flex items-center gap-2">
                        <input type="hidden" name="actionType" value="update_plan" />
                        <input type="hidden" name="storeId" value={store.id} />
                        <select
                          name="planType"
                          defaultValue={store.planType || 'free'}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="free">{t('planFree')}</option>
                          <option value="starter">{t('planStarter')}</option>
                          <option value="premium">{t('planPremium')}</option>
                        </select>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
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
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 {t('planNotes')}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('planFreeNote')}</li>
          <li>• {t('planStarterNote')}</li>
          <li>• {t('planPremiumNote')}</li>
          <li>• {t('plansEffectImmediate')}</li>
        </ul>
      </div>
    </div>
  );
}

// Plan Badge Component
function PlanBadge({ plan }: { plan: string }) {
  const { t } = useTranslation();
  const config = {
    free: { bg: 'bg-gray-100', text: 'text-gray-700', labelKey: 'planFree' as const },
    starter: { bg: 'bg-emerald-100', text: 'text-emerald-700', labelKey: 'planStarter' as const },
    premium: { bg: 'bg-purple-100', text: 'text-purple-700', labelKey: 'planPremium' as const },
    custom: { bg: 'bg-blue-100', text: 'text-blue-700', labelKey: 'planPremium' as const },
  }[plan] || { bg: 'bg-gray-100', text: 'text-gray-700', labelKey: 'planFree' as const };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {t(config.labelKey)}
    </span>
  );
}

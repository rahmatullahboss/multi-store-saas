/**
 * Admin Plan Management Page
 * 
 * Route: /app/admin/plans
 * 
 * Allows platform admin to:
 * - View all stores and their current plans
 * - Manually upgrade/downgrade store plans
 * - Search stores by name or subdomain
 * 
 * MVP: Manual plan management
 * TODO: Auto-upgrade via payment integration (bKash, etc.)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigation, useSearchParams, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, like, or, desc } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { Crown, Zap, Gift, Search, Check, Store, Calendar, ArrowUpCircle } from 'lucide-react';
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
// LOADER - Fetch all stores (admin only)
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

  // Fetch stores
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

  // Count by plan
  const planCounts = {
    free: allStores.filter(s => !s.planType || s.planType === 'free').length,
    starter: allStores.filter(s => s.planType === 'starter').length,
    premium: allStores.filter(s => s.planType === 'premium').length,
  };

  return json({
    stores: allStores,
    planCounts,
    search,
  });
}

// ============================================================================
// ACTION - Update store plan (admin only)
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
  const storeId = Number(formData.get('storeId'));
  const newPlan = formData.get('planType') as string;

  if (!storeId || !newPlan) {
    return json({ error: 'Missing store ID or plan type' }, { status: 400 });
  }

  // Valid plans
  if (!['free', 'starter', 'premium', 'custom'].includes(newPlan)) {
    return json({ error: 'Invalid plan type' }, { status: 400 });
  }

  // Update store plan
  await db.update(stores).set({ 
    planType: newPlan as 'free' | 'starter' | 'premium' | 'custom',
    updatedAt: new Date(),
  }).where(eq(stores.id, storeId));

  return json({ success: true, storeId, newPlan });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function AdminPlansPage() {
  const { stores: allStores, planCounts, search } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const isSubmitting = navigation.state === 'submitting';

  // Handle successful update
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setSuccessMessage(t('planUpdatedSuccess'));
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData, t]);

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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('created')}</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
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
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Form method="post" className="flex items-center gap-2">
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


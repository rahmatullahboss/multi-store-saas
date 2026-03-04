/**
 * Dashboard Overview Page - Shopify-Inspired Design
 *
 * Route: /app/dashboard
 *
 * Features:
 * - Welcome section with store status
 * - Key metrics with trend indicators
 * - 7-day sales chart
 * - Action items/todos
 * - Recent orders preview
 */

import * as React from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useNavigate, useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { orders, stores } from '@db/schema';
import * as schema from '@db/schema';
import { getSession, commitSession } from '~/services/auth.server';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Sparkles,
  Clock,
  Bot,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { MetricCard, SalesChart, ActionItems, RecentOrders } from '~/components/dashboard';
import { PLSummaryCards } from '~/components/dashboard/PLSummaryCards';
import { GlassCard } from '~/components/ui/GlassCard';
import { FirstSaleChecklist } from '~/components/dashboard/FirstSaleChecklist';
import { LimitWarningBanner } from '~/components/LimitWarningBanner';
import { LowStockAlertBanner } from '~/components/LowStockAlertBanner';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { getUsageStats } from '~/utils/plans.server';
import { getStoreStats, getRevenueForecast, getPredictedCLV } from '~/services/analytics.server';
import { GrowthOpportunitiesCard } from '~/components/dashboard/GrowthOpportunitiesCard';

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard - Ozzyl' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });
  if (!storeId) {
    // User has no store — show create-new-store UI in dashboard (not onboarding)
    return json({ storeDeleted: true });
  }

  const db = drizzle(context.cloudflare.env.DB, { schema }); // Fix: Initialize with schema

  // Fetch store info
  const storeResult = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  const store = storeResult; // drizzle-orm query findFirst returns the object directly or undefined
  if (!store || !store.isActive || store.deletedAt !== null) {
    // Store was deleted — show create-new-store UI, don't redirect to onboarding
    console.error(`[dashboard] Store ${storeId} is deleted or inactive for user`);
    const session = await getSession(request, context.cloudflare.env);
    session.unset('storeId');
    return json(
      { storeDeleted: true },
      { headers: { 'Set-Cookie': await commitSession(session, context.cloudflare.env) } }
    );
  }

  // Fetch store stats using shared service
  // Pass correct db instance type by using 'as any' if strictly needed or ensuring getStoreStats accepts the schematized db
  // For now, let's fix the schema passed to drizzle above, which should match what the service expects if it imports schema
  // P&L: Fetch current month summary for dashboard cards
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [statsResult, forecast, clv, plSummary] = await Promise.all([
    getStoreStats(db, storeId),
    getRevenueForecast(db, storeId),
    getPredictedCLV(db, storeId),
    import('~/services/pl-report.server').then(m =>
      m.getPLSummary(db as any, storeId, context.cloudflare.env as any, monthStart, now)
        .catch(() => null)
    ),
  ]);
  const {
    products: productCount,
    lowStock: lowStockCount,
    orders: orderCount,
    revenue: revenueTotal,
    todaySales,
    salesTrend,
    pendingOrders: pendingCount,
    abandonedCarts: abandonedCount,
    salesData,
  } = statsResult;

  // Build action items
  const actionItems: Array<{
    id: string;
    type: 'low_stock' | 'pending_order' | 'abandoned_cart' | 'domain_request';
    count: number;
    link: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Recent 5 orders
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  if (pendingCount > 0) {
    actionItems.push({
      id: 'pending-orders',
      type: 'pending_order',
      count: pendingCount,
      link: '/app/orders?status=pending',
      priority: 'high',
    });
  }

  if (lowStockCount > 0) {
    actionItems.push({
      id: 'low-stock',
      type: 'low_stock',
      count: lowStockCount,
      link: '/app/inventory?filter=low',
      priority: 'medium',
    });
  }

  if (abandonedCount > 0) {
    actionItems.push({
      id: 'abandoned-carts',
      type: 'abandoned_cart',
      count: abandonedCount,
      link: '/app/abandoned-carts',
      priority: 'low',
    });
  }

  // Get greeting based on time
  const currentTime = new Date();
  const hour = currentTime.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  // Get SAAS_DOMAIN for store URL
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'ozzyl.com';
  const storeUrl = `https://${store.subdomain}.${saasDomain}`;

  // Get usage stats for limit warning banner
  const usage = await getUsageStats(context.cloudflare.env.DB, storeId);

  return json({
    storeName: store.name,
    storeUrl,
    currency: store.currency || 'BDT',
    greeting,
    planType: store.planType || 'free',
    storeEnabled: store.storeEnabled ?? true,
    usage,
    stats: {
      products: productCount,
      lowStock: lowStockCount,
      orders: orderCount,
      revenue: revenueTotal,
      todaySales,
      salesTrend,
      pendingOrders: pendingCount,
    },
    salesData: salesData.map((d) => ({
      date: d.date,
      label: d.date, // Use date as label
      value: d.amount,
    })),
    actionItems,
    forecast,
    clv,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
    })),
    plSummary,
  });
}

/**
 * Shown when a logged-in user has no active store (e.g. after deletion).
 * Lets them create a new store without going through full onboarding.
 */
// Maps URL error codes to i18n translation keys (defined in utils/i18n/*/common.ts)
const GOOGLE_ERROR_KEY_MAP: Record<string, string> = {
  google_auth_failed: 'googleAuthFailed',
  google_redirect_mismatch: 'googleRedirectMismatch',
  google_token_invalid: 'googleTokenInvalid',
  google_scope_error: 'googleScopeError',
  google_access_denied: 'googleAccessDenied',
  google_email_not_verified: 'googleEmailNotVerified',
};

function CreateNewStorePanel() {
  const { t } = useTranslation();
  const [storeName, setStoreName] = React.useState('');
  const [subdomain, setSubdomain] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [subdomainAutoGenerated, setSubdomainAutoGenerated] = React.useState(true);
  // TODO: Add real-time subdomain availability check via /api/check-subdomain
  // Server-side validation in api.create-store-for-existing-user.ts catches duplicates on submit

  // Auto-generate subdomain from store name (handles non-Latin names like Bengali)
  React.useEffect(() => {
    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
    if (slug.length >= 3) {
      setSubdomain(slug);
      setSubdomainAutoGenerated(true);
    } else if (storeName.length > 0) {
      // Non-Latin characters (Bengali, Arabic, etc.) produce empty slug
      // Set a random placeholder the user can customize
      const fallback = `my-store-${Math.random().toString(36).slice(2, 6)}`;
      setSubdomain(fallback);
      setSubdomainAutoGenerated(false);
    }
  }, [storeName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/create-store-for-existing-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, subdomain, phone }),
      });
      const json = await res.json<{ success?: boolean; error?: string; field?: string; storeId?: number }>();
      if (!res.ok || !json.success) {
        if (json.field) setFieldError(json.error || 'Validation error');
        else setError(json.error || 'Failed to create store. Please try again.');
        setLoading(false);
        return;
      }
      // Reload to pick up new session storeId
      window.location.href = '/app/dashboard';
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your New Store</h1>
          <p className="text-gray-500 text-sm">
            Your previous store was deleted. Create a new one to get started.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="My Awesome Store"
              required
              minLength={2}
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                type="text"
                value={subdomain}
                onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-store"
                required
                minLength={3}
                maxLength={50}
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-l border-gray-300">
                .ozzyl.com
              </span>
            </div>
            {!subdomainAutoGenerated && storeName.length > 0 && (
              <p className="text-amber-600 text-xs mt-1">
                ⚠️ Could not auto-generate subdomain from store name. Please choose one manually.
              </p>
            )}
            {fieldError && <p className="text-red-500 text-xs mt-1">{fieldError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
              minLength={11}
              maxLength={15}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !storeName || !subdomain || !phone}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Creating Store...' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Store was deleted — show inline create-new-store UI
  const isStoreDeleted = 'storeDeleted' in data && data.storeDeleted;

  // Use suppressHydrationWarning pattern: render same structure on SSR and client
  // but swap content after mount to avoid React #418 hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  if (isStoreDeleted) {
    return mounted ? <CreateNewStorePanel /> : (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const {
    storeName,
    storeUrl,
    currency,
    greeting,
    planType,
    storeEnabled,
    usage,
    stats,
    salesData,
    actionItems,
    forecast,
    clv,
    recentOrders,
    plSummary,
  } = data as Exclude<typeof data, { storeDeleted: boolean }>;

  // Get translated greeting
  const getGreeting = () => {
    if (greeting === 'Good morning') return t('dashboard:goodMorning');
    if (greeting === 'Good afternoon') return t('dashboard:goodAfternoon');
    return t('dashboard:goodEvening');
  };

  return (
    <div className="space-y-0 -mx-4 lg:mx-0 lg:space-y-8">
      {/* Limit Warning Banner */}
      <div className="px-4 pt-4 lg:px-0 lg:pt-0">
        <LimitWarningBanner usage={usage} planType={planType} />
      </div>

      {/* Low Stock Alert */}
      <div className="px-4 lg:px-0">
        <LowStockAlertBanner
          count={stats.lowStock}
          threshold={10}
          onAction={() => navigate('/app/inventory?filter=low')}
        />
      </div>

      {/* Welcome Card - Mobile */}
      <div className="px-4 pt-4 pb-2 lg:px-0 lg:pt-0">
        <div className="relative overflow-hidden rounded-xl bg-emerald-500 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white opacity-10 blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 rounded-full bg-black opacity-10 blur-xl" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1">
              {getGreeting()}, {storeName}
            </h2>
            <p className="text-white/80 text-sm font-medium">
              {new Date().toLocaleDateString('en-BD', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* First Sale Checklist (Only if 0 orders) */}
      {stats.orders === 0 && (
        <div className="px-4 lg:px-0">
          <FirstSaleChecklist productCount={stats.products} storeUrl={storeUrl} />
        </div>
      )}

      {/* ── MOBILE ONLY: Key Metrics + Quick Actions + Recent Orders ── */}
      <div className="lg:hidden">

        {/* Revenue Hero Card */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 shadow-lg shadow-emerald-200">
            <div className="flex justify-between items-start mb-1">
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">{t('dashboard:todaysSales')}</p>
              {stats.salesTrend !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${stats.salesTrend >= 0 ? 'bg-white/20 text-white' : 'bg-red-400/30 text-white'}`}>
                  {stats.salesTrend >= 0 ? '↑' : '↓'} {Math.abs(stats.salesTrend)}%
                </span>
              )}
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight mb-3">{formatPrice(stats.todaySales)}</h3>
            <div className="flex items-center gap-4 text-xs text-emerald-100">
              <span className="flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5" /> {stats.orders} {t('dashboard:totalOrders')}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {stats.pendingOrders} {t('dashboard:pendingOrders')}</span>
            </div>
          </div>
        </div>

        {/* 2×2 KPI Grid */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-500">{t('dashboard:totalOrders')}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.orders || 0}</p>
            {stats.salesTrend !== 0 && (
              <p className={`text-xs font-semibold mt-1 ${stats.salesTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {stats.salesTrend >= 0 ? '↑' : '↓'} {Math.abs(stats.salesTrend)}%
              </p>
            )}
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">{t('dashboard:pendingOrders')}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.pendingOrders || 0}</p>
            <p className="text-xs text-slate-400 mt-1">{t('dashboard:needsAction') || 'Needs attention'}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-slate-500">{t('dashboard:totalProducts')}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.products || 0}</p>
            <Link to="/app/products/new" className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              + {t('dashboard:addProduct')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-500">{t('dashboard:revenue') || 'Revenue'}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{formatPrice(stats.revenue)}</p>
            <p className="text-xs text-slate-400 mt-1">{t('dashboard:allTime') || 'All time'}</p>
          </div>
        </div>

        {/* P&L Summary Cards */}
        {plSummary && (plSummary.grossProfit !== 0 || plSummary.totalCOGS !== 0) ? (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">This Month's Profit</h3>
              <Link to="/app/reports?report=pl" className="text-xs text-emerald-600 font-medium hover:underline">Full P&L →</Link>
            </div>
            <PLSummaryCards summary={plSummary} compact={true} showIncompleteWarning={false} />
          </div>
        ) : (
          <div className="px-4 pb-2">
            <Link to="/app/products" className="block bg-emerald-50 border border-emerald-200 rounded-xl p-3 hover:bg-emerald-100 transition">
              <p className="text-sm font-semibold text-emerald-800">📊 Unlock Profit Tracking</p>
              <p className="text-xs text-emerald-600 mt-0.5">Add cost prices to products to see real profit numbers →</p>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">{t('dashboard:quickActions') || 'Quick Actions'}</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { to: '/app/products/new', icon: Package, label: t('dashboard:addProduct'), color: 'bg-emerald-50 text-emerald-600' },
              { to: '/app/orders', icon: ShoppingCart, label: t('dashboard:viewOrders'), color: 'bg-blue-50 text-blue-600' },
              { to: '/app/analytics', icon: BarChart3, label: t('dashboard:analytics'), color: 'bg-purple-50 text-purple-600' },
              { to: '/app/settings', icon: Sparkles, label: t('dashboard:settings'), color: 'bg-slate-100 text-slate-600' },
            ].map((action, i) => (
              <Link key={i} to={action.to} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
                <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-sm`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="px-4 pb-28">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-900">{t('dashboard:recentOrders')}</h3>
            <Link to="/app/orders" className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              {t('dashboard:viewAll')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">{t('dashboard:noOrdersYet') || 'No orders yet'}</p>
                <p className="text-xs text-slate-300 mt-1">{t('dashboard:shareStoreLink') || 'Share your store to get started'}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.slice(0, 5).map((order) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-700',
                    confirmed: 'bg-sky-100 text-sky-700',
                    processing: 'bg-blue-100 text-blue-700',
                    shipped: 'bg-violet-100 text-violet-700',
                    delivered: 'bg-emerald-100 text-emerald-700',
                    cancelled: 'bg-red-100 text-red-700',
                    returned: 'bg-orange-100 text-orange-700',
                  };
                  const statusLabels: Record<string, string> = {
                    pending: '⏳ Pending', confirmed: '✅ Confirmed', processing: '⚙️ Processing',
                    shipped: '🚚 Shipped', delivered: '📦 Delivered', cancelled: '❌ Cancelled', returned: '↩️ Returned',
                  };
                  const status = order.status || 'pending';
                  return (
                    <Link
                      key={order.id}
                      to={`/app/orders/${order.id}`}
                      className="flex items-center justify-between px-4 py-3.5 active:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{order.orderNumber}</span>
                          <span className="text-xs text-slate-400 truncate max-w-[100px]">{order.customerName}</span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">{formatPrice(order.total)}</span>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabels[status] || status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>{/* end lg:hidden */}

      {/* ── Desktop-only: Main Content Grid (Sales Chart + Sidebar) ── */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column Stack: Sales Chart & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard intensity="low" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('dashboard:salesOverview')}</h2>
                <p className="text-sm text-gray-500">{t('dashboard:last7Days')}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <SalesChart data={salesData} currency={currency} />
          </GlassCard>

          {/* Recent Orders */}
          <GlassCard intensity="low" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('dashboard:recentOrders')}</h2>
              <Link
                to="/app/orders"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t('dashboard:viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <RecentOrders orders={recentOrders} currency={currency} />
          </GlassCard>
        </div>

        {/* Growth Opportunities & Action Items */}
        <div className="space-y-6">
          <GrowthOpportunitiesCard forecast={forecast} clv={clv} currency={currency} />
          <GlassCard intensity="low" className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {t('dashboard:actionItems')}
            </h2>
            <ActionItems items={actionItems} />
          </GlassCard>
        </div>
      </div>

      {/* Desktop: Quick Actions 4-col grid */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {[
          { to: '/app/products/new', icon: Package, label: 'addProduct', color: 'bg-emerald-100 text-emerald-600', border: 'hover:border-emerald-300' },
          { to: '/app/orders', icon: ShoppingCart, label: 'viewOrders', color: 'bg-blue-100 text-blue-600', border: 'hover:border-blue-300' },
          { to: '/app/analytics', icon: TrendingUp, label: 'analytics', color: 'bg-purple-100 text-purple-600', border: 'hover:border-purple-300' },
          { to: '/app/settings', icon: Sparkles, label: 'settings', color: 'bg-gray-100 text-gray-600', border: 'hover:border-gray-300' },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm ${action.border} hover:shadow-lg transition-all duration-300 text-center group transform hover:-translate-y-1`}
          >
            <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
              <action.icon className="w-7 h-7" />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-gray-900">
              {t(`dashboard:${action.label}`)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

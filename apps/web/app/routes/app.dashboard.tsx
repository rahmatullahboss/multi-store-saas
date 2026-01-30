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

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useNavigate, useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { orders, stores } from '@db/schema';
import * as schema from '@db/schema';
import { getStoreId } from '~/services/auth.server';
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
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB, { schema }); // Fix: Initialize with schema

  // Fetch store info
  const storeResult = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  const store = storeResult; // drizzle-orm query findFirst returns the object directly or undefined
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Fetch store stats using shared service
  // Pass correct db instance type by using 'as any' if strictly needed or ensuring getStoreStats accepts the schematized db
  // For now, let's fix the schema passed to drizzle above, which should match what the service expects if it imports schema
  const [statsResult, forecast, clv] = await Promise.all([
    getStoreStats(db, storeId),
    getRevenueForecast(db, storeId),
    getPredictedCLV(db, storeId),
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
  const now = new Date();
  const hour = now.getHours();
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
  });
}

export default function DashboardPage() {
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
  } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  // Get translated greeting
  const getGreeting = () => {
    if (greeting === 'Good morning') return t('goodMorning');
    if (greeting === 'Good afternoon') return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <div className="space-y-8">
      {/* Limit Warning Banner */}
      <LimitWarningBanner usage={usage} planType={planType} />

      {/* Low Stock Alert */}
      <LowStockAlertBanner
        count={stats.lowStock}
        threshold={10}
        onAction={() => navigate('/app/inventory?filter=low')}
      />

      {/* Welcome Section - Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 p-8 shadow-xl text-white">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-emerald-50 border border-white/10">
                <Sparkles className="w-3 h-3" />
                {getGreeting()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              {t('welcomeTo')} {storeName}
            </h1>
            <p className="text-emerald-100 text-lg max-w-xl leading-relaxed">
              {t('dashboardSubtitle')}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <ExternalLink className="w-5 h-5" />
                {t('viewStore')}
              </a>
              {/* Theme Editor - Coming Soon for MVP */}
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white/60 border border-white/20 rounded-xl font-semibold backdrop-blur-sm cursor-not-allowed relative"
                title={lang === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
              >
                <Sparkles className="w-5 h-5" />
                {lang === 'bn' ? 'থিম এডিটর' : 'Theme Editor'}
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {lang === 'bn' ? 'শীঘ্রই' : 'Soon'}
                </span>
              </button>
            </div>
            <div className="text-xs text-center text-emerald-200/80 font-medium">
              {storeEnabled ? 'Store is Live' : 'Maintenance Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* First Sale Checklist (Only if 0 orders) */}
      {stats.orders === 0 && (
        <FirstSaleChecklist productCount={stats.products} storeUrl={storeUrl} />
      )}

      {/* Key Metrics - Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard
          variant="hover"
          intensity="medium"
          className="p-0 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <DollarSign className="w-16 h-16 text-emerald-500/10 rotate-12" />
          </div>
          <MetricCard
            title={t('todaysSales')}
            value={formatPrice(stats.todaySales)}
            icon={DollarSign}
            color="emerald"
            trend={{
              value: stats.salesTrend,
              label: t('vsYesterday'),
            }}
          />
        </GlassCard>

        <GlassCard
          variant="hover"
          intensity="medium"
          className="p-0 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <TrendingUp className="w-16 h-16 text-purple-500/10 rotate-12" />
          </div>
          <MetricCard
            title={t('totalRevenue')}
            value={formatPrice(stats.revenue)}
            icon={TrendingUp}
            color="purple"
          />
        </GlassCard>

        <GlassCard
          variant="hover"
          intensity="medium"
          className="p-0 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Clock className="w-16 h-16 text-blue-500/10 rotate-12" />
          </div>
          <MetricCard
            title={t('pendingOrders')}
            value={stats.pendingOrders}
            icon={Clock}
            color={stats.pendingOrders > 0 ? 'orange' : 'blue'}
            link="/app/orders?status=pending"
          />
        </GlassCard>

        <GlassCard
          variant="hover"
          intensity="medium"
          className="p-0 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Package className="w-16 h-16 text-blue-500/10 rotate-12" />
          </div>
          <MetricCard
            title={t('totalProducts')}
            value={stats.products}
            icon={Package}
            color="blue"
            link="/app/products"
          />
        </GlassCard>

        {/* AI Usage Card */}
        {usage.aiPlan && (
          <GlassCard
            variant="default"
            className="p-6 flex flex-col justify-between border-orange-100 bg-orange-50/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {t('aiMessages') || 'AI Messages'}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {usage.aiMessages?.current}
                    <span className="text-sm font-normal text-gray-400">
                      {' '}
                      / {usage.aiMessages?.limit}
                    </span>
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-md flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all shadow-sm ${
                      (usage.aiMessages?.percentage || 0) >= 90
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}
                    style={{ width: `${Math.min(usage.aiMessages?.percentage || 0, 100)}%` }}
                  />
                </div>
                {(usage.aiMessages?.percentage || 0) >= 80 && (
                  <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {usage.aiMessages?.percentage >= 100
                      ? t('limitReached') || 'Limit Reached'
                      : t('runningLow') || 'Running Low'}
                    <Link
                      to="/app/billing"
                      className="ml-1 underline font-bold hover:text-orange-700"
                    >
                      {t('upgrade') || 'Upgrade'}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column Stack: Sales Chart & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard intensity="low" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('salesOverview')}</h2>
                <p className="text-sm text-gray-500">{t('last7Days')}</p>
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
              <h2 className="text-lg font-bold text-gray-900">{t('recentOrders')}</h2>
              <Link
                to="/app/orders"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t('viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <RecentOrders orders={recentOrders} currency={currency} />
          </GlassCard>
        </div>

        {/* Growth Opportunities & Action Items */}
        <div className="space-y-6">
          <GrowthOpportunitiesCard forecast={forecast} clv={clv} currency={currency} />

          {/* Action Items */}
          <GlassCard intensity="low" className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {t('actionItems')}
            </h2>
            <ActionItems items={actionItems} />
          </GlassCard>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            to: '/app/products/new',
            icon: Package,
            label: 'addProduct',
            color: 'bg-emerald-100 text-emerald-600',
            border: 'hover:border-emerald-300',
          },
          {
            to: '/app/orders',
            icon: ShoppingCart,
            label: 'viewOrders',
            color: 'bg-blue-100 text-blue-600',
            border: 'hover:border-blue-300',
          },
          {
            to: '/app/analytics',
            icon: TrendingUp,
            label: 'analytics',
            color: 'bg-purple-100 text-purple-600',
            border: 'hover:border-purple-300',
          },
          {
            to: '/app/settings',
            icon: Sparkles,
            label: 'settings',
            color: 'bg-gray-100 text-gray-600',
            border: 'hover:border-gray-300',
          },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm ${action.border} hover:shadow-lg transition-all duration-300 text-center group transform hover:-translate-y-1`}
          >
            <div
              className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}
            >
              <action.icon className="w-7 h-7" />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-gray-900">
              {t(action.label)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

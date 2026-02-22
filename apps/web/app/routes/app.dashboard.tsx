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
import { json, redirect } from '@remix-run/cloudflare';
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
    // User has no store yet - redirect to onboarding to create one
    return redirect('/onboarding');
  }

  const db = drizzle(context.cloudflare.env.DB, { schema }); // Fix: Initialize with schema

  // Fetch store info
  const storeResult = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  const store = storeResult; // drizzle-orm query findFirst returns the object directly or undefined
  if (!store) {
    // Store was deleted or doesn't exist - redirect to onboarding
    return redirect('/onboarding');
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
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get translated greeting
  const getGreeting = () => {
    if (greeting === 'Good morning') return t('dashboard:goodMorning');
    if (greeting === 'Good afternoon') return t('dashboard:goodAfternoon');
    return t('dashboard:goodEvening');
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

      {/* Welcome Section - Stitch Design Style */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-primary p-6 md:p-8 shadow-lg text-white">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold mb-1">
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

      {/* First Sale Checklist (Only if 0 orders) */}
      {stats.orders === 0 && (
        <FirstSaleChecklist productCount={stats.products} storeUrl={storeUrl} />
      )}

      {/* Key Metrics - Stitch Design Style (2x2 grid) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Orders */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 rounded-full">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            {stats.salesTrend !== 0 && (
              <span
                className={`flex items-center text-xs font-bold ${stats.salesTrend >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-1.5 py-0.5 rounded`}
              >
                {stats.salesTrend >= 0 ? '↑' : '↓'} {Math.abs(stats.salesTrend)}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs font-medium mb-0.5">{t('dashboard:todaysOrders')}</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.orders || 0}</h3>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-green-50 rounded-full">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-medium mb-0.5">{t('dashboard:todaysSales')}</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats.todaySales)}</h3>
        </div>

        {/* Total Products */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-50 rounded-full">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-medium mb-0.5">{t('dashboard:totalProducts')}</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.products || 0}</h3>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-orange-50 rounded-full">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-medium mb-0.5">{t('dashboard:pendingOrders')}</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders || 0}</h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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

          {/* Action Items */}
          <GlassCard intensity="low" className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {t('dashboard:actionItems')}
            </h2>
            <ActionItems items={actionItems} />
          </GlassCard>
        </div>
      </div>

      {/* Quick Actions */}
      {/* Mobile: horizontal scroll row | Desktop: 4-col grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 md:hidden px-0.5">
          Quick Actions
        </h2>
        {/* Mobile: scrollable horizontal pills */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 md:hidden">
          {[
            {
              to: '/app/products/new',
              icon: Package,
              label: 'addProduct',
              color: 'bg-emerald-100 text-emerald-600',
            },
            {
              to: '/app/orders',
              icon: ShoppingCart,
              label: 'viewOrders',
              color: 'bg-blue-100 text-blue-600',
            },
            {
              to: '/app/analytics',
              icon: TrendingUp,
              label: 'analytics',
              color: 'bg-purple-100 text-purple-600',
            },
            {
              to: '/app/settings',
              icon: Sparkles,
              label: 'settings',
              color: 'bg-gray-100 text-gray-600',
            },
          ].map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform min-w-[88px]"
            >
              <div
                className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center`}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                {t(`dashboard:${action.label}`)}
              </span>
            </Link>
          ))}
        </div>
        {/* Desktop: 4-col grid */}
        <div className="hidden md:grid grid-cols-4 gap-4">
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
                {t(`dashboard:${action.label}`)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

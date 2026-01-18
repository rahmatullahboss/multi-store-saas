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
import { eq, count, sql, desc, and, gte } from 'drizzle-orm';
import { products, orders, stores, abandonedCarts } from '@db/schema';
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
  FileText,
  Store,
  Users
} from 'lucide-react';
import { MetricCard, SalesChart, ActionItems, RecentOrders } from '~/components/dashboard';
import { FirstSaleChecklist } from '~/components/dashboard/FirstSaleChecklist';
import { LimitWarningBanner } from '~/components/LimitWarningBanner';
import { LowStockAlertBanner } from '~/components/LowStockAlertBanner';
import { useTranslation } from '~/contexts/LanguageContext';
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
    getStoreStats(db as any, storeId), // Type assertion to bypass strict mismatch if service isn't updated yet
    getRevenueForecast(db as any, storeId),
    getPredictedCLV(db as any, storeId)
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
      salesData 
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
    salesData: salesData.map(d => ({
        date: d.date,
        label: d.date, // Use date as label
        value: d.amount
    })),
    actionItems,
    forecast,
    clv,
    recentOrders: recentOrders.map(o => ({
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
    recentOrders 
  } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get translated greeting
  const getGreeting = () => {
    if (greeting === 'Good morning') return t('goodMorning');
    if (greeting === 'Good afternoon') return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <div className="space-y-6">
      {/* Limit Warning Banner */}
      <LimitWarningBanner usage={usage} planType={planType} />

      {/* Low Stock Alert */}
      <LowStockAlertBanner 
        count={stats.lowStock} 
        threshold={10} 
        onAction={() => navigate('/app/inventory?filter=low')}
      />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="text-emerald-100 text-sm font-medium">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {t('welcomeTo')} {storeName}
            </h1>
            <p className="text-emerald-100">
              {t('dashboardSubtitle')}
            </p>
          </div>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition"
          >
            <ExternalLink className="w-4 h-4" />
            {t('viewStore')}
          </a>
        </div>
      </div>

      {/* Enable Store CTA (Only for landing-only users) */}
      {!storeEnabled && (
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{t('enableStoreTitle') || 'Ready to Sell Products?'}</h2>
                <p className="text-violet-100">
                  {t('enableStoreDescription') || 'Enable your online store to add products, accept orders, and grow your business.'}
                </p>
              </div>
            </div>
            <Link
              to="/app/settings/homepage?enable_store=1"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition shadow-lg"
            >
              <Store className="w-5 h-5" />
              {t('enableStoreButton') || 'Enable Store'}
            </Link>
          </div>
        </div>
      )}

      {/* First Sale Checklist (Only if 0 orders AND store is enabled) */}
      {storeEnabled && stats.orders === 0 && (
         <FirstSaleChecklist productCount={stats.products} storeUrl={storeUrl} />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <MetricCard
          title={t('totalRevenue')}
          value={formatPrice(stats.revenue)}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title={t('pendingOrders')}
          value={stats.pendingOrders}
          icon={Clock}
          color={stats.pendingOrders > 0 ? 'orange' : 'blue'}
          link="/app/orders?status=pending"
        />
        <MetricCard
          title={t('totalProducts')}
          value={stats.products}
          icon={Package}
          color="blue"
          link="/app/products"
        />
        {/* AI Usage Card */}
        {usage.aiPlan && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                  <div className="flex items-center justify-between mb-4">
                      <div>
                          <p className="text-gray-500 text-sm font-medium">{t('aiMessages') || 'AI Messages'}</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">
                              {usage.aiMessages?.current}
                              <span className="text-sm font-normal text-gray-400"> / {usage.aiMessages?.limit}</span>
                          </h3>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-orange-600" />
                      </div>
                  </div>
                  <div className="space-y-2">
                       <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all ${
                                  (usage.aiMessages?.percentage || 0) >= 90 ? 'bg-red-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(usage.aiMessages?.percentage || 0, 100)}%` }}
                          />
                       </div>
                       {(usage.aiMessages?.percentage || 0) >= 80 && (
                           <p className="text-xs text-orange-600 font-medium">
                               {usage.aiMessages?.percentage >= 100 ? t('limitReached') || 'Limit Reached' : t('runningLow') || 'Running Low'}
                               <Link to="/app/billing" className="ml-1 underline">{t('upgrade') || 'Upgrade'}</Link>
                           </p>
                       )}
                  </div>
              </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column Stack: Sales Chart & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('salesOverview')}</h2>
              <span className="text-sm text-gray-500">{t('last7Days')}</span>
            </div>
            <SalesChart data={salesData} currency={currency} />
          </div>

          {/* Recent Orders - Now aligned with left side */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('recentOrders')}</h2>
              <Link 
                to="/app/orders" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {t('viewAll')}
              </Link>
            </div>
            <RecentOrders orders={recentOrders} currency={currency} />
          </div>
        </div>

        {/* Growth Opportunities & Action Items */}
        <div className="space-y-6">
            <GrowthOpportunitiesCard forecast={forecast} clv={clv} currency={currency} />
            
            {/* Action Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('actionItems')}</h2>
              <ActionItems items={actionItems} />
            </div>
        </div>
      </div>


      {/* Quick Actions - Conditional based on storeEnabled */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {storeEnabled ? (
          <>
            <Link
              to="/app/products/new"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition text-center group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-900">{t('addProduct')}</span>
            </Link>
            <Link
              to="/app/orders"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-center group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">{t('viewOrders')}</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/app/pages"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition text-center group"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition">
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
              <span className="font-medium text-gray-900">{t('navPages') || 'Pages'}</span>
            </Link>
            <Link
              to="/app/campaigns"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-center group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">{t('navCampaigns') || 'Campaigns'}</span>
            </Link>
          </>
        )}
        <Link
          to="/app/analytics"
          className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition text-center group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <span className="font-medium text-gray-900">{t('analytics')}</span>
        </Link>
        <Link
          to="/app/settings"
          className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition text-center group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition">
            <Sparkles className="w-6 h-6 text-gray-600" />
          </div>
          <span className="font-medium text-gray-900">{t('settings')}</span>
        </Link>
      </div>
    </div>
  );
}

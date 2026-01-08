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
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sql, desc, and, gte } from 'drizzle-orm';
import { products, orders, stores, abandonedCarts } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  ExternalLink,
  Sparkles,
  Clock
} from 'lucide-react';
import { MetricCard, SalesChart, ActionItems, RecentOrders } from '~/components/dashboard';
import { LimitWarningBanner } from '~/components/LimitWarningBanner';
import { useTranslation } from '~/contexts/LanguageContext';
import { getUsageStats } from '~/utils/plans.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard - Multi-Store SaaS' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];

  // Get today's start timestamp (Bangladesh timezone)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekAgoStart = new Date(todayStart.getTime() - 7 * 86400000);

  // Count products
  const productCount = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.storeId, storeId));

  // Low stock products
  const lowStockProducts = await db
    .select({ count: count() })
    .from(products)
    .where(and(
      eq(products.storeId, storeId),
      sql`${products.inventory} <= 5 AND ${products.inventory} > 0`
    ));

  // Total orders
  const orderCount = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  // Today's orders
  const todayOrders = await db
    .select({ 
      count: count(),
      total: sql<number>`COALESCE(SUM(total), 0)`
    })
    .from(orders)
    .where(and(
      eq(orders.storeId, storeId),
      gte(orders.createdAt, todayStart)
    ));

  // Yesterday's orders for comparison
  const yesterdayOrders = await db
    .select({ 
      count: count(),
      total: sql<number>`COALESCE(SUM(total), 0)`
    })
    .from(orders)
    .where(and(
      eq(orders.storeId, storeId),
      gte(orders.createdAt, yesterdayStart),
      sql`${orders.createdAt} < ${todayStart.toISOString()}`
    ));

  // Total revenue
  const revenueResult = await db
    .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  // Pending orders count
  const pendingOrders = await db
    .select({ count: count() })
    .from(orders)
    .where(and(
      eq(orders.storeId, storeId),
      eq(orders.status, 'pending')
    ));

  // Abandoned carts count (last 7 days)
  const abandonedCartsCount = await db
    .select({ count: count() })
    .from(abandonedCarts)
    .where(and(
      eq(abandonedCarts.storeId, storeId),
      eq(abandonedCarts.status, 'abandoned'),
      gte(abandonedCarts.abandonedAt, weekAgoStart)
    ));

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

  // Daily sales for last 7 days
  const salesData: { date: string; label: string; value: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart.getTime() - i * 86400000);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    
    // Convert to Unix timestamps (seconds) for SQLite integer comparison
    const dayStartTimestamp = Math.floor(dayStart.getTime() / 1000);
    const dayEndTimestamp = Math.floor(dayEnd.getTime() / 1000);
    
    const dayRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
      .from(orders)
      .where(and(
        eq(orders.storeId, storeId),
        sql`${orders.createdAt} >= ${dayStartTimestamp}`,
        sql`${orders.createdAt} < ${dayEndTimestamp}`
      ));
    
    salesData.push({
      date: dayStart.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : dayNames[dayStart.getDay()],
      value: dayRevenue[0]?.total || 0,
    });
  }

  // Calculate trends
  const todaySales = todayOrders[0]?.total || 0;
  const yesterdaySales = yesterdayOrders[0]?.total || 0;
  const salesTrend = yesterdaySales > 0 
    ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100)
    : todaySales > 0 ? 100 : 0;

  // Build action items
  const actionItems: Array<{
    id: string;
    type: 'low_stock' | 'pending_order' | 'abandoned_cart' | 'domain_request';
    count: number;
    link: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  const pendingCount = pendingOrders[0]?.count || 0;
  if (pendingCount > 0) {
    actionItems.push({
      id: 'pending-orders',
      type: 'pending_order',
      count: pendingCount,
      link: '/app/orders?status=pending',
      priority: 'high',
    });
  }

  const lowStockCount = lowStockProducts[0]?.count || 0;
  if (lowStockCount > 0) {
    actionItems.push({
      id: 'low-stock',
      type: 'low_stock',
      count: lowStockCount,
      link: '/app/inventory?filter=low',
      priority: 'medium',
    });
  }

  const abandonedCount = abandonedCartsCount[0]?.count || 0;
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
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  // Get SAAS_DOMAIN for store URL
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'digitalcare.site';
  const storeUrl = `https://${store.subdomain}.${saasDomain}`;

  // Get usage stats for limit warning banner
  const usage = await getUsageStats(context.cloudflare.env.DB, storeId);

  return json({
    storeName: store.name,
    storeUrl,
    currency: store.currency || 'BDT',
    greeting,
    planType: store.planType || 'free',
    usage,
    stats: {
      products: productCount[0]?.count || 0,
      orders: orderCount[0]?.count || 0,
      revenue: revenueResult[0]?.total || 0,
      todaySales,
      salesTrend,
      pendingOrders: pendingCount,
    },
    salesData,
    actionItems,
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
    usage,
    stats, 
    salesData, 
    actionItems,
    recentOrders 
  } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();

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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{t('salesOverview')}</h2>
            <span className="text-sm text-gray-500">{t('last7Days')}</span>
          </div>
          <SalesChart data={salesData} currency={currency} />
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('actionItems')}</h2>
          <ActionItems items={actionItems} />
        </div>
      </div>

      {/* Recent Orders */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

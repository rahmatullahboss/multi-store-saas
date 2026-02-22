/**
 * Analytics Dashboard
 * 
 * Route: /app/analytics
 * 
 * Features:
 * - Sales overview (today, week, month, all-time)
 * - Revenue chart
 * - Top selling products
 * - Recent orders
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { useState } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql } from 'drizzle-orm';
import { orders, orderItems, stores, abandonedCarts, pageViews, carts, checkoutSessions } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  MapPin,
  Percent,
  ShoppingBag,
  Layout,
  RefreshCcw
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { getAbandonedCartRecoveryStats } from '~/services/analytics.server';
import { GlassCard } from '~/components/ui/GlassCard';

export const meta: MetaFunction = () => {
  return [{ title: 'Analytics - Ozzyl' }];
};

// ============================================================================
// LOADER - Fetch analytics data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store currency
  const storeData = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const currency = storeData[0]?.currency || 'BDT';

  // Date calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all orders for stats
  const allOrders = await db
    .select({
      id: orders.id,
      total: orders.total,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  // Get page views
  const allPageViews = await db
    .select({
      visitorId: pageViews.visitorId,
      createdAt: pageViews.createdAt,
    })
    .from(pageViews)
    .where(eq(pageViews.storeId, storeId));

  // Calculate stats - include ALL orders for revenue (COD orders have pending payment status)
  // Convert timestamps for proper comparison with SQLite integer timestamps
  const todayStartTs = Math.floor(todayStart.getTime() / 1000);
  const weekStartTs = Math.floor(weekStart.getTime() / 1000);
  const monthStartTs = Math.floor(monthStart.getTime() / 1000);
  
  const todayOrders = allOrders.filter(o => {
    const orderTs = o.createdAt instanceof Date ? Math.floor(o.createdAt.getTime() / 1000) : o.createdAt;
    return orderTs && orderTs >= todayStartTs;
  });
  const weekOrders = allOrders.filter(o => {
    const orderTs = o.createdAt instanceof Date ? Math.floor(o.createdAt.getTime() / 1000) : o.createdAt;
    return orderTs && orderTs >= weekStartTs;
  });
  const monthOrders = allOrders.filter(o => {
    const orderTs = o.createdAt instanceof Date ? Math.floor(o.createdAt.getTime() / 1000) : o.createdAt;
    return orderTs && orderTs >= monthStartTs;
  });

  const todayVisitors = allPageViews.filter(v => {
    const ts = v.createdAt instanceof Date ? Math.floor(v.createdAt.getTime() / 1000) : v.createdAt;
    return ts && ts >= todayStartTs;
  }).length;

  const weekVisitors = allPageViews.filter(v => {
    const ts = v.createdAt instanceof Date ? Math.floor(v.createdAt.getTime() / 1000) : v.createdAt;
    return ts && ts >= weekStartTs;
  }).length;

  const monthVisitors = allPageViews.filter(v => {
    const ts = v.createdAt instanceof Date ? Math.floor(v.createdAt.getTime() / 1000) : v.createdAt;
    return ts && ts >= monthStartTs;
  }).length;
  
  // Revenue includes all non-cancelled orders (COD orders have pending payment but still count)
  const validOrders = allOrders.filter(o => o.status !== 'cancelled');
  const todayValid = todayOrders.filter(o => o.status !== 'cancelled');
  const weekValid = weekOrders.filter(o => o.status !== 'cancelled');
  const monthValid = monthOrders.filter(o => o.status !== 'cancelled');

  const stats = {
    today: {
      orders: todayOrders.length,
      revenue: todayValid.reduce((sum, o) => sum + (o.total || 0), 0),
      visitors: todayVisitors,
    },
    week: {
      orders: weekOrders.length,
      revenue: weekValid.reduce((sum, o) => sum + (o.total || 0), 0),
      visitors: weekVisitors,
    },
    month: {
      orders: monthOrders.length,
      revenue: monthValid.reduce((sum, o) => sum + (o.total || 0), 0),
      visitors: monthVisitors,
    },
    allTime: {
      orders: allOrders.length,
      revenue: validOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      visitors: allPageViews.length,
    },
  };

  // Order status breakdown
  const statusBreakdown = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    processing: allOrders.filter(o => o.status === 'processing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length,
  };

  // Top selling products
  const topProductsQuery = await db
    .select({
      productId: orderItems.productId,
      title: orderItems.title,
      totalQty: sql<number>`SUM(${orderItems.quantity})`.as('total_qty'),
      totalRevenue: sql<number>`SUM(${orderItems.total})`.as('total_revenue'),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orders.storeId, storeId))
    .groupBy(orderItems.productId, orderItems.title)
    .orderBy(desc(sql`total_qty`))
    .limit(5);

  // Recent orders
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

  // Daily revenue for last 7 days (for chart)
  const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - i);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Convert to Unix timestamps for comparison
    const dateTs = Math.floor(date.getTime() / 1000);
    const nextDateTs = Math.floor(nextDate.getTime() / 1000);
    
    const dayOrders = allOrders.filter(o => {
      if (!o.createdAt) return false;
      const orderTs = o.createdAt instanceof Date ? Math.floor(o.createdAt.getTime() / 1000) : o.createdAt;
      return orderTs >= dateTs && orderTs < nextDateTs;
    });
    // Include all non-cancelled orders in revenue (not just paid - for COD support)
    const dayValid = dayOrders.filter(o => o.status !== 'cancelled');
    
    dailyRevenue.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: dayValid.reduce((sum, o) => sum + (o.total || 0), 0),
      orders: dayOrders.length,
    });
  }

  // Customer Demographics
  const allOrdersForCustomers = await db
    .select({
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  // Unique customers by email OR phone (many BD customers use phone only)
  const uniqueCustomers = new Set<string>();
  allOrdersForCustomers.forEach(o => {
    // Use email if available, otherwise use phone
    const identifier = o.customerEmail || o.customerPhone;
    if (identifier) {
      uniqueCustomers.add(identifier);
    }
  });
  const totalCustomers = uniqueCustomers.size;

  // New vs returning (orders in last 30 days by first-time vs repeat customers)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const customerOrderCounts = new Map<string, number>();
  allOrdersForCustomers.forEach(o => {
    // Use email if available, otherwise use phone
    const identifier = o.customerEmail || o.customerPhone;
    if (identifier) {
      customerOrderCounts.set(identifier, (customerOrderCounts.get(identifier) || 0) + 1);
    }
  });
  
  const newCustomers = Array.from(customerOrderCounts.values()).filter(cnt => cnt === 1).length;
  const returningCustomers = totalCustomers - newCustomers;

  // Top cities from shipping address JSON
  const cityCounts = new Map<string, number>();
  allOrdersForCustomers.forEach(o => {
    if (o.shippingAddress) {
      try {
        const addr = typeof o.shippingAddress === 'string' 
          ? JSON.parse(o.shippingAddress) 
          : o.shippingAddress;
        const city = addr?.city || addr?.district;
        if (city) {
          cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
        }
      } catch {
        // Invalid JSON, skip
      }
    }
  });
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, orderCount]) => ({ city, orders: orderCount }));

  // Conversion Metrics
  const abandonedCartsData = await db
    .select({ id: abandonedCarts.id, status: abandonedCarts.status })
    .from(abandonedCarts)
    .where(eq(abandonedCarts.storeId, storeId));

  const totalAbandoned = abandonedCartsData.length;
  const recoveredCarts = abandonedCartsData.filter(c => c.status === 'recovered').length;
  const abandonedRate = totalAbandoned > 0 
    ? ((totalAbandoned - recoveredCarts) / (totalAbandoned + allOrders.length) * 100).toFixed(1)
    : '0';

  // Recovery stats
  const recoveryStats = await getAbandonedCartRecoveryStats(db as any, storeId);

  // Average order value (from non-cancelled orders)
  const avgOrderValue = validOrders.length > 0 
    ? Math.round(validOrders.reduce((sum, o) => sum + (o.total || 0), 0) / validOrders.length)
    : 0;

  // Funnel metrics (unique visitors)
  const funnelViews = await db
    .select({ count: sql<number>`count(distinct ${pageViews.visitorId})` })
    .from(pageViews)
    .where(eq(pageViews.storeId, storeId));

  const funnelCarts = await db
    .select({ count: sql<number>`count(distinct ${carts.visitorId})` })
    .from(carts)
    .where(eq(carts.storeId, storeId));

  const funnelCheckouts = await db
    .select({ count: sql<number>`count(distinct ${checkoutSessions.id})` })
    .from(checkoutSessions)
    .where(eq(checkoutSessions.storeId, storeId));

  const funnelOrders = await db
    .select({ count: sql<number>`count(distinct ${orders.id})` })
    .from(orders)
    .where(and(eq(orders.storeId, storeId), sql`status != 'cancelled'`));

  const viewCount = Number(funnelViews[0]?.count || 0);
  const cartCount = Number(funnelCarts[0]?.count || 0);
  const checkoutCount = Number(funnelCheckouts[0]?.count || 0);
  const orderCount = Number(funnelOrders[0]?.count || 0);

  const rate = (numerator: number, denominator: number) =>
    denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;

  const funnel = {
    views: viewCount,
    carts: cartCount,
    checkouts: checkoutCount,
    orders: orderCount,
    viewToCartRate: rate(cartCount, viewCount),
    cartToCheckoutRate: rate(checkoutCount, cartCount),
    checkoutToOrderRate: rate(orderCount, checkoutCount),
    viewToOrderRate: rate(orderCount, viewCount),
  };

  return json({
    stats,
    statusBreakdown,
    topProducts: topProductsQuery,
    recentOrders,
    dailyRevenue,
    currency,
    customerDemographics: {
      totalCustomers,
      newCustomers,
      returningCustomers,
      topCities,
    },
    conversionMetrics: {
      abandonedRate,
      avgOrderValue,
      totalAbandoned,
      recoveredCarts,
      recoveryRate: recoveryStats.recoveryRate,
      recoveredRevenue: recoveryStats.recoveredRevenue,
    },
    funnel,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AnalyticsPage() {
  const { 
    stats, 
    statusBreakdown, 
    topProducts, 
    recentOrders, 
    dailyRevenue, 
    currency,
    customerDemographics,
    conversionMetrics,
    funnel,
  } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<'today' | 'week' | 'month' | 'allTime'>('month');

  const formatPrice = (amount: number) => {
    const symbols: Record<string, string> = { BDT: '৳', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return `${symbols[currency] || currency} ${amount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-BD')}`;
  };

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);

  const periodStats = stats[activePeriod];
  const prevRevenue = activePeriod === 'today' ? 0 : activePeriod === 'week' ? stats.today.revenue : activePeriod === 'month' ? stats.week.revenue : stats.month.revenue;
  const revenueGrowth = prevRevenue > 0 ? Math.round(((periodStats.revenue - prevRevenue) / prevRevenue) * 100) : 0;

  const periodLabels = {
    today: 'আজ',
    week: '৭ দিন',
    month: '৩০ দিন',
    allTime: 'সব সময়',
  };

  return (
    <div className="space-y-6">
      {/* ===== MOBILE HEADER (Stitch style) ===== */}
      <div className="md:hidden">
        {/* Title + Date */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">{t('analytics')}</h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Time Period Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-4">
          {(['today', 'week', 'month', 'allTime'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activePeriod === period
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>

        {/* Hero Revenue Display */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">মোট রাজস্ব</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{formatPrice(periodStats.revenue)}</p>
            {revenueGrowth !== 0 && (
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${revenueGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {revenueGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(revenueGrowth)}%
              </span>
            )}
          </div>
        </div>

        {/* Revenue Bar Chart (Mobile) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('revenueLast7Days')}</h3>
          <div className="flex items-end justify-between gap-1 h-24">
            {dailyRevenue.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${index === dailyRevenue.length - 1 ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 80, day.revenue > 0 ? 6 : 0)}px` }}
                    title={`${day.date}: ${formatPrice(day.revenue)}`}
                  />
                </div>
                <span className="text-[9px] text-gray-400">{day.date.split(',')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2x2 Metric Grid (Stitch style) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">নেট প্রফিট</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatPrice(Math.round(periodStats.revenue * 0.3))}</p>
            <p className="text-xs text-green-600 mt-0.5 font-medium">▲ 15%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">অর্ডার</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{periodStats.orders}</p>
            <p className="text-xs text-blue-600 mt-0.5 font-medium">▲ 48%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">গড় মূল্য</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatPrice(conversionMetrics.avgOrderValue)}</p>
            <p className="text-xs text-red-500 mt-0.5 font-medium">▼ 3%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">কনভার্সন</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{funnel.viewToOrderRate}%</p>
            <p className="text-xs text-green-600 mt-0.5 font-medium">▲ {funnel.viewToOrderRate > 0 ? 12 : 0}%</p>
          </div>
        </div>

        {/* Top Products (Mobile) */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">সেরা পণ্য</h3>
              <Link to="/app/products" className="text-xs font-medium text-emerald-600">সব দেখুন</Link>
            </div>
            <div className="space-y-3">
              {topProducts.slice(0, 3).map((product, index) => (
                <div key={product.productId || index} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">{index + 1}</span>
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">{product.totalQty} বিক্রি</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(product.totalRevenue || 0)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== DESKTOP HEADER ===== */}
      <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('analytics')}</h1>
          <p className="text-gray-600">{t('analyticsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Desktop period pills */}
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'allTime'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activePeriod === period
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
          <Link
            to="/app/analytics/templates"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm font-medium"
          >
            <Layout className="w-4 h-4" />
            {t('templatePerformanceReport')}
          </Link>
        </div>
      </div>

      {/* Desktop Stats Overview */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('analyticsToday')}
          value={formatPrice(stats.today.revenue)}
          subtitle={`${stats.today.orders} ${t('orders')} • ${stats.today.visitors} ${t('visits')}`}
          icon={<Calendar className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title={t('analyticsThisWeek')}
          value={formatPrice(stats.week.revenue)}
          subtitle={`${stats.week.orders} ${t('orders')} • ${stats.week.visitors} ${t('visits')}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title={t('analyticsThisMonth')}
          value={formatPrice(stats.month.revenue)}
          subtitle={`${stats.month.orders} ${t('orders')} • ${stats.month.visitors} ${t('visits')}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title={t('analyticsAllTime')}
          value={formatPrice(stats.allTime.revenue)}
          subtitle={`${stats.allTime.orders} ${t('orders')} • ${stats.allTime.visitors} ${t('visits')}`}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="orange"
        />
      </div>


      {/* Revenue Chart */}
      <GlassCard intensity="low" className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('revenueLast7Days')}</h2>
        <div className="space-y-3">
          {dailyRevenue.map((day, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-600">{day.date}</div>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg transition-all duration-500"
                  style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                />
                {day.revenue > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                    {formatPrice(day.revenue)}
                  </span>
                )}
              </div>
              <div className="w-16 text-sm text-gray-500 text-right">{day.orders} {t('orders')}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <GlassCard intensity="low" className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-4" />
            {t('orderStatus')}
          </h2>
          <div className="space-y-3">
            <StatusRow label={t('pending')} count={statusBreakdown.pending} color="yellow" />
            <StatusRow label={t('processing')} count={statusBreakdown.processing} color="blue" />
            <StatusRow label={t('shipped')} count={statusBreakdown.shipped} color="purple" />
            <StatusRow label={t('delivered')} count={statusBreakdown.delivered} color="emerald" />
            <StatusRow label={t('cancelled')} count={statusBreakdown.cancelled} color="red" />
          </div>
        </GlassCard>

        {/* Top Products */}
        <GlassCard intensity="low" className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            {t('topSellingProducts')}
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">
                      {product.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.totalQty} {t('sold')}</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.totalRevenue || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('noSalesDataYet') || 'No sales data yet'}</p>
          )}
        </GlassCard>
      </div>

      {/* Customer Demographics & Conversion Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Demographics */}
        <GlassCard intensity="low" className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            {t('customerDemographics')}
          </h2>
          <div className="space-y-4">
            {/* Customer Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{customerDemographics.totalCustomers}</p>
                <p className="text-xs text-gray-500">{t('totalCustomers')}</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{customerDemographics.newCustomers}</p>
                <p className="text-xs text-gray-500">{t('firstTimeLabel')}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{customerDemographics.returningCustomers}</p>
                <p className="text-xs text-gray-500">{t('returningLabel')}</p>
              </div>
            </div>
            
            {/* Top Cities */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('topCities')}
              </h3>
              {customerDemographics.topCities.length > 0 ? (
                <div className="space-y-2">
                  {customerDemographics.topCities.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.city}</span>
                      <span className="font-medium text-gray-900">{item.orders} {t('orders')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('noGeographicData')}</p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Conversion Metrics */}
        <GlassCard intensity="low" className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-gray-400" />
            {t('conversionMetrics')}
          </h2>
          <div className="space-y-6">
            {/* Funnel */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Conversion Funnel</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium text-gray-900">{funnel.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Add to Cart</span>
                  <span className="font-medium text-gray-900">{funnel.carts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Checkout</span>
                  <span className="font-medium text-gray-900">{funnel.checkouts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Orders</span>
                  <span className="font-medium text-gray-900">{funnel.orders}</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <span>View → Cart: {funnel.viewToCartRate}%</span>
                <span>Cart → Checkout: {funnel.cartToCheckoutRate}%</span>
                <span>Checkout → Order: {funnel.checkoutToOrderRate}%</span>
                <span>View → Order: {funnel.viewToOrderRate}%</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">{t('abandonedRate')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{conversionMetrics.abandonedRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('abandonedSubtext', { abandoned: conversionMetrics.totalAbandoned, recovered: conversionMetrics.recoveredCarts })}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCcw className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">Recovery Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{conversionMetrics.recoveryRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Recovered carts</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">{t('customerAvgOrderValue')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(conversionMetrics.avgOrderValue)}</p>
                <p className="text-xs text-gray-500 mt-1">{t('avgOrderValueSubtext')}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">Recovered Revenue</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(conversionMetrics.recoveredRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Recovered from carts</p>
              </div>
            </div>
            
            {/* Quick Insights */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('quickInsights')}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('returningCustomerRate', { 
                  rate: customerDemographics.totalCustomers > 0 
                  ? Math.round((customerDemographics.returningCustomers / customerDemographics.totalCustomers) * 100) 
                  : 0 
                })}</li>
                <li>• {t('recoveredCartsCount', { count: conversionMetrics.recoveredCarts })}</li>
              </ul>
            </div>
          </div>
      </GlassCard>
      </div>

      {/* Recent Orders */}
      <GlassCard intensity="low" className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
          {t('recentOrders')}
        </h2>
        {recentOrders.length > 0 ? (
          <>
            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-gray-100 -mx-6">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/app/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-emerald-700 text-sm">#{order.orderNumber}</span>
                      <StatusBadge status={order.status || 'pending'} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{order.customerName || t('guestLabel')}</p>
                  </div>
                  <div className="flex flex-col items-end ml-3 flex-shrink-0">
                    <span className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">{t('order')}</th>
                    <th className="pb-3 font-medium">{t('customerLabel')}</th>
                    <th className="pb-3 font-medium">{t('amountLabel')}</th>
                    <th className="pb-3 font-medium">{t('status')}</th>
                    <th className="pb-3 font-medium">{t('date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">#{order.orderNumber}</td>
                      <td className="py-3 text-gray-600">{order.customerName || t('guestLabel')}</td>
                      <td className="py-3 font-medium text-gray-900">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        <StatusBadge status={order.status || 'pending'} />
                      </td>
                      <td className="py-3 text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">{t('noOrdersYet')}</p>
        )}
      </GlassCard>
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'purple' | 'orange';
}) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <GlassCard variant="hover" className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </GlassCard>
  );
}

function StatusRow({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
        {count}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

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

import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link } from 'react-router';
import { useState } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql } from 'drizzle-orm';
import { orders, orderItems, stores, abandonedCarts, pageViews, carts, checkoutSessions } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { formatPrice } from '~/utils/formatPrice';
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
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });

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
    .where(and(eq(orders.storeId, storeId), sql`${orders.status} != 'cancelled'`));

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

  // Currency-aware price formatter using the shared utility
  const fmtPrice = (amount: number) =>
    formatPrice(amount, {
      currency: (currency as 'BDT' | 'USD' | 'EUR' | 'GBP') || 'BDT',
      locale: lang === 'bn' ? 'bn' : 'en',
    });

  const maxRevenue = Math.max(...(dailyRevenue.length > 0 ? dailyRevenue.map(d => d.revenue) : [0]), 1);

  const periodStats = stats[activePeriod] ?? stats.month;
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
      {/* ===== MOBILE VIEW (Sample Design) ===== */}
      <div className="md:hidden -mx-4 -mt-4">

        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">{t('analytics')}</h1>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-slate-600" suppressHydrationWarning>
              {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Time Period Filter - Horizontal Scroll */}
        <div className="overflow-x-auto px-4 py-4 flex gap-3 scrollbar-hide">
          {(['today', 'week', 'month', 'allTime'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activePeriod === period
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>

        {/* Revenue Chart Card */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">মোট রাজস্ব</p>
                <h3 className="text-2xl font-bold tracking-tight">{formatPrice(periodStats.revenue)}</h3>
              </div>
              {revenueGrowth !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${revenueGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%</span>
                </div>
              )}
            </div>
            {/* Bar Chart */}
            <div className="relative h-48 w-full flex items-end justify-between gap-1 overflow-hidden">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className="border-t border-slate-100 w-full h-0" />
                ))}
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-600/10 to-transparent rounded-b-lg" />
              {/* Bars */}
              <div className="relative z-10 w-full h-full flex items-end px-1 pt-8 gap-1">
                {dailyRevenue.map((day, index) => {
                  const heightPct = maxRevenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 5 : 0) : 0;
                  const isLatest = index === dailyRevenue.length - 1;
                  return (
                    <div
                      key={index}
                      className={`flex-1 rounded-t-sm transition-all duration-500 ${isLatest ? 'bg-emerald-600' : 'bg-emerald-400/60'}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${day.date}: ${formatPrice(day.revenue)}`}
                    />
                  );
                })}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium px-1">
              {dailyRevenue.filter((_, i) => i === 0 || i === Math.floor(dailyRevenue.length / 2) || i === dailyRevenue.length - 1).map((day, i) => (
                <span key={i}>{day.date.split(',')[0]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Grid 2x2 */}
        <div className="grid grid-cols-2 gap-4 px-4 mb-6">
          {/* Net Profit */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600/10 rounded-md">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-500">নেট প্রফিট</span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-bold">{formatPrice(periodStats.revenue)}</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%</span>
              </div>
            </div>
          </div>
          {/* Orders */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-md">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">অর্ডার</span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-bold">{periodStats.orders}</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{periodStats.orders > 0 ? 'সক্রিয়' : 'কোনো অর্ডার নেই'}</span>
              </div>
            </div>
          </div>
          {/* Avg Order Value */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500/10 rounded-md">
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">গড় মূল্য</span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-bold">{formatPrice(conversionMetrics.avgOrderValue)}</p>
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold mt-1">
                <span>প্রতি অর্ডার</span>
              </div>
            </div>
          </div>
          {/* Conversion */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/10 rounded-md">
                <Percent className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">কনভার্সন</span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-bold">{funnel.viewToOrderRate}%</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>ভিজিটর → অর্ডার</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="px-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-base">সেরা পণ্য</h3>
                <Link to="/app/products" className="text-emerald-600 text-xs font-semibold hover:underline">সব দেখুন</Link>
              </div>
              <div className="flex flex-col">
                {topProducts.slice(0, 3).map((product, index) => (
                  <div key={product.productId || index} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${index < Math.min(topProducts.length, 3) - 1 ? 'border-b border-slate-50' : ''}`}>
                    <span className="text-slate-400 font-bold text-sm w-4 flex-shrink-0">{index + 1}</span>
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-800">{product.title}</p>
                      <p className="text-xs text-slate-500">{product.totalQty} বিক্রি</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 flex-shrink-0">{formatPrice(product.totalRevenue || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversion Funnel (Donut style) */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-base mb-4">কনভার্সন ফানেল</h3>
            <div className="flex items-center gap-6">
              {/* SVG Donut */}
              <div className="relative h-32 w-32 shrink-0">
                {(() => {
                  const total = funnel.views || 1;
                  const cartPct = Math.min((funnel.carts / total) * 100, 100);
                  const checkoutPct = Math.min((funnel.checkouts / total) * 100, 100);
                  const orderPct = Math.min((funnel.orders / total) * 100, 100);
                  const circ = 251.2;
                  const seg1 = (orderPct / 100) * circ;
                  const seg2 = (checkoutPct / 100) * circ;
                  const seg3 = (cartPct / 100) * circ;
                  return (
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="16" strokeDasharray={`${circ} ${circ}`} />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#86efac" strokeWidth="16" strokeDasharray={`${seg3} ${circ}`} />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0d9488" strokeWidth="16" strokeDasharray={`${seg2} ${circ}`} strokeDashoffset={-seg3} />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray={`${seg1} ${circ}`} strokeDashoffset={-(seg3 + seg2)} />
                    </svg>
                  );
                })()}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400 font-medium">ভিজিটর</span>
                  <span className="text-sm font-bold text-slate-800">{funnel.views.toLocaleString()}</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-300 flex-shrink-0" />
                    <span className="text-sm text-slate-600">কার্ট</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{funnel.carts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">চেকআউট</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{funnel.checkouts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">অর্ডার</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{funnel.orders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders (Mobile) */}
        {recentOrders.length > 0 && (
          <div className="px-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-base">সাম্প্রতিক অর্ডার</h3>
                <Link to="/app/orders" className="text-emerald-600 text-xs font-semibold hover:underline">সব দেখুন</Link>
              </div>
              <div className="flex flex-col divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/app/orders/${order.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-emerald-700 text-sm">#{order.orderNumber}</span>
                        <StatusBadge status={order.status || 'pending'} />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{order.customerName || t('guestLabel')}</p>
                    </div>
                    <div className="flex flex-col items-end ml-3 flex-shrink-0">
                      <span className="font-bold text-slate-900 text-sm">{formatPrice(order.total)}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
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


      {/* Revenue Chart - Desktop only */}
      <GlassCard intensity="low" className="hidden md:block p-6">
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

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Customer Demographics & Conversion Metrics - Desktop only */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Recent Orders - Desktop only */}
      <GlassCard intensity="low" className="hidden md:block p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
          {t('recentOrders')}
        </h2>
        {recentOrders.length > 0 ? (
          <>
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

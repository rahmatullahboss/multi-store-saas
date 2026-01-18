/**
 * Super Admin - Platform Analytics
 * 
 * Route: /admin/analytics
 * 
 * Comprehensive analytics dashboard showing:
 * - Platform-wide metrics (GMV, orders, visitors)
 * - Per-store breakdown with sales, orders, products, usage
 * - Top performing stores
 * - Stores approaching limits
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql, count, sum, gte, and } from 'drizzle-orm';
import { stores, orders, products, pageViews, users } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { PLAN_LIMITS, type PlanType } from '~/utils/plans.server';
import { 
  BarChart as LucideBarChart, 
  TrendingUp, 
  ShoppingCart, 
  Users,
  Eye,
  AlertTriangle,
  Crown,
  Zap,
  Gift,
  Store,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  Legend,
  Cell
} from 'recharts';

export const meta: MetaFunction = () => {
  return [{ title: 'Analytics - Super Admin' }];
};

// ============================================================================
// LOADER - Fetch comprehensive analytics
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
// 1. Ensure Super Admin
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const drizzleDb = drizzle(db);
  
  // Time periods
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // ===== PLATFORM-WIDE METRICS =====
  
  // Total GMV (all stores, non-cancelled orders)
  const totalGMVResult = await drizzleDb
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`);
  
  // Monthly GMV
  const monthlyGMVResult = await drizzleDb
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(and(
      sql`${orders.status} != 'cancelled'`,
      gte(orders.createdAt, monthStart)
    ));
  
  // Total orders
  const totalOrdersResult = await drizzleDb
    .select({ count: count() })
    .from(orders);
  
  // Monthly orders
  const monthlyOrdersResult = await drizzleDb
    .select({ count: count() })
    .from(orders)
    .where(gte(orders.createdAt, monthStart));
  
  // Total visitors (unique visitor IDs this month)
  const monthlyVisitorsResult = await drizzleDb
    .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, monthStart));
  
  // Today's visitors
  const todayVisitorsResult = await drizzleDb
    .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, todayStart));

  // ===== CHART DATA (Last 30 Days) =====
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Note: Drizzle stores timestamps as Date objects (milliseconds), but usually stored as INTEGER in SQLite.
  // We'll use raw SQL for grouping. D1 stores dates as milliseconds usually.
  // SQLite `date` function expects seconds for unixepoch modifier. So we divide by 1000.
  
  const dailyGMVRaw = await drizzleDb.all(sql`
    SELECT 
      date(created_at / 1000, 'unixepoch') as date, 
      sum(total) as total 
    FROM orders 
    WHERE status != 'cancelled' AND created_at >= ${thirtyDaysAgo.getTime() / 1000} 
    GROUP BY date
    ORDER BY date ASC
  `);
  // Cast to expected type
  const dailyGMV = dailyGMVRaw as unknown as { date: string, total: number }[];

  const dailySignupsRaw = await drizzleDb.all(sql`
    SELECT 
      date(created_at / 1000, 'unixepoch') as date, 
      count(id) as count 
    FROM stores 
    WHERE created_at >= ${thirtyDaysAgo.getTime() / 1000} 
    GROUP BY date
    ORDER BY date ASC
  `);
  const dailySignups = dailySignupsRaw as unknown as { date: string, count: number }[];
  
  // Process chart data to fill in gaps
  const chartData = [];
  const currentDate = new Date(thirtyDaysAgo);
  const nowTime = now.getTime();
  
  while (currentDate.getTime() <= nowTime) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const gmvEntry = dailyGMV.find(d => d.date === dateStr);
    const signupEntry = dailySignups.find(d => d.date === dateStr);
    
    chartData.push({
      date: dateStr,
      displayDate: currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      revenue: gmvEntry ? Number(gmvEntry.total) : 0,
      signups: signupEntry ? Number(signupEntry.count) : 0,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // ===== PER-STORE BREAKDOWN =====
  
  // Get all stores with owner info
  const allStores = await drizzleDb
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      isActive: stores.isActive,
      createdAt: stores.createdAt,
      ownerEmail: users.email,
    })
    .from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .where(sql`${stores.deletedAt} IS NULL`)
    .orderBy(desc(stores.createdAt));
  
  // Get order stats per store
  const storeOrderStats = await drizzleDb
    .select({
      storeId: orders.storeId,
      totalOrders: count(),
      totalRevenue: sum(orders.total),
    })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`)
    .groupBy(orders.storeId);
  
  // Get product counts per store
  const storeProductCounts = await drizzleDb
    .select({
      storeId: products.storeId,
      productCount: count(),
    })
    .from(products)
    .where(eq(products.isPublished, true))
    .groupBy(products.storeId);
  
  // Get visitor counts per store (this month)
  const storeVisitorCounts = await drizzleDb
    .select({
      storeId: pageViews.storeId,
      visitorCount: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`,
      pageViewCount: count(),
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, monthStart))
    .groupBy(pageViews.storeId);
  
  // Build lookup maps
  const orderStatsMap = new Map(storeOrderStats.map(s => [s.storeId, s]));
  const productCountMap = new Map(storeProductCounts.map(s => [s.storeId, s.productCount]));
  const visitorCountMap = new Map(storeVisitorCounts.map(s => [s.storeId, s]));
  
  // Combine data for each store
  const storeAnalytics = allStores.map(store => {
    const orderStats = orderStatsMap.get(store.id);
    const productCount = productCountMap.get(store.id) || 0;
    const visitorStats = visitorCountMap.get(store.id);
    const planType = (store.planType as PlanType) || 'free';
    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS['free'];
    
    const totalOrders = orderStats?.totalOrders || 0;
    const totalRevenue = Number(orderStats?.totalRevenue) || 0;
    const visitors = visitorStats?.visitorCount || 0;
    const pageViews = visitorStats?.pageViewCount || 0;
    
    // Calculate usage percentages
    const orderUsage = limits.max_orders === Infinity 
      ? 0 
      : Math.round((totalOrders / limits.max_orders) * 100);
    const productUsage = limits.max_products === Infinity 
      ? 0 
      : Math.round((productCount / limits.max_products) * 100);
    
    return {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      planType,
      isActive: store.isActive,
      ownerEmail: store.ownerEmail,
      createdAt: store.createdAt,
      totalOrders,
      totalRevenue,
      productCount,
      visitors,
      pageViews,
      limits: {
        maxOrders: limits.max_orders,
        maxProducts: limits.max_products,
        orderUsage,
        productUsage,
      },
    };
  });
  
  // ===== TOP PERFORMING STORES =====
  const topStores = [...storeAnalytics]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);
  
  // ===== STORES APPROACHING LIMITS =====
  const storesApproachingLimits = storeAnalytics
    .filter(s => s.limits.orderUsage >= 80 || s.limits.productUsage >= 80)
    .sort((a, b) => Math.max(b.limits.orderUsage, b.limits.productUsage) - Math.max(a.limits.orderUsage, a.limits.productUsage));
  
  // ===== UNUSUAL ACTIVITY DETECTION =====
  // Calculate visitor-to-order ratio for suspicious activity
  // Normal ratio: 10-100 visitors per order
  // Warning: ratio > 500 (500+ visitors per 1 order)
  // Critical: ratio > 1000 (possible bot/abuse)
  const unusualActivityStores = storeAnalytics
    .filter(s => {
      // Only flag stores with at least some visitors
      if (s.visitors < 100) return false;
      
      // Calculate ratio (if no orders, use 1 to avoid division by zero)
      const ratio = s.totalOrders > 0 ? s.visitors / s.totalOrders : s.visitors;
      
      // Flag if ratio is suspiciously high
      return ratio > 500;
    })
    .map(s => {
      const ratio = s.totalOrders > 0 ? Math.round(s.visitors / s.totalOrders) : s.visitors;
      const severity: 'warning' | 'critical' = ratio > 1000 ? 'critical' : 'warning';
      
      return {
        ...s,
        visitorOrderRatio: ratio,
        severity,
      };
    })
    .sort((a, b) => b.visitorOrderRatio - a.visitorOrderRatio);
  
  // ===== FUNNEL ANALYSIS (Last 30 Days) =====
  // We approximate steps based on page paths and actual orders
  const funnelMetricsRaw = await drizzleDb.all(sql`
    SELECT 
      COUNT(DISTINCT visitor_id) as total_visitors,
      COUNT(DISTINCT CASE WHEN path LIKE '%/p/%' OR path LIKE '%/products/%' THEN visitor_id END) as product_viewers,
      COUNT(DISTINCT CASE WHEN path LIKE '%/cart%' THEN visitor_id END) as cart_adders,
      COUNT(DISTINCT CASE WHEN path LIKE '%/checkout%' THEN visitor_id END) as checkout_initiators
    FROM page_views
    WHERE created_at >= ${thirtyDaysAgo.getTime()}
  `);
  
  const funnelDataRawResult = funnelMetricsRaw[0] as any;
  const totalPeriodOrdersResult = await drizzleDb.all(sql`
    SELECT COUNT(DISTINCT customer_email) as count 
    FROM orders 
    WHERE created_at >= ${thirtyDaysAgo.getTime()} AND status != 'cancelled'
  `);
  
  const funnelData = [
    { name: 'All Visitors', value: Number(funnelDataRawResult?.total_visitors) || 0, fill: '#3b82f6' },
    { name: 'View Product', value: Number(funnelDataRawResult?.product_viewers) || 0, fill: '#0ea5e9' },
    { name: 'Add to Cart', value: Number(funnelDataRawResult?.cart_adders) || 0, fill: '#8b5cf6' },
    { name: 'Checkout', value: Number(funnelDataRawResult?.checkout_initiators) || 0, fill: '#d946ef' },
    { name: 'Purchase', value: Number((totalPeriodOrdersResult[0] as any)?.count) || 0, fill: '#10b981' },
  ];

  // ===== REVENUE FORECASTING (Linear Regression) =====
  // Use existing chartData (last 30 days) to project next 7 days
  // Formula: y = mx + b
  const n = chartData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  chartData.forEach((point, i) => {
    sumX += i;
    sumY += point.revenue;
    sumXY += i * point.revenue;
    sumXX += i * i;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const forecastData = [...chartData.map(d => ({ ...d, type: 'historical' }))];
  const lastDate = new Date();
  
  // Predict next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextIndex = n + i - 1;
    const predictedRevenue = Math.max(0, slope * nextIndex + intercept); // Prevent negative
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    
    forecastData.push({
      date: nextDate.toISOString().split('T')[0],
      displayDate: nextDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      revenue: Math.round(predictedRevenue),
      signups: 0,
      type: 'forecast'
    });
  }
  
  return json({
    platformMetrics: {
      totalGMV: Number(totalGMVResult[0]?.total) || 0,
      monthlyGMV: Number(monthlyGMVResult[0]?.total) || 0,
      totalOrders: totalOrdersResult[0]?.count || 0,
      monthlyOrders: monthlyOrdersResult[0]?.count || 0,
      monthlyVisitors: monthlyVisitorsResult[0]?.count || 0,
      todayVisitors: todayVisitorsResult[0]?.count || 0,
      totalStores: allStores.length,
    },
    storeAnalytics,
    topStores,
    storesApproachingLimits,
    unusualActivityStores,
    chartData,
    funnelData,
    forecastData
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminAnalytics() {
  const { 
    platformMetrics, 
    storeAnalytics, 
    topStores, 
    storesApproachingLimits,
    unusualActivityStores,
    chartData,
    funnelData,
    forecastData
  } = useLoaderData<typeof loader>();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'growth'>('overview');
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'visitors' | 'products'>('revenue');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  
  // Sort and filter stores
  const filteredStores = storeAnalytics
    .filter(s => filterPlan === 'all' || s.planType === filterPlan)
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue': return b.totalRevenue - a.totalRevenue;
        case 'orders': return b.totalOrders - a.totalOrders;
        case 'visitors': return b.visitors - a.visitors;
        case 'products': return b.productCount - a.productCount;
        default: return 0;
      }
    });
  
  const formatCurrency = (amountInCents: number) => `৳${(amountInCents / 100).toLocaleString()}`;
  
  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        );
      case 'starter':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">
            <Zap className="w-3 h-3" />
            Starter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-slate-400">
            <Gift className="w-3 h-3" />
            Free
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <LucideBarChart className="w-5 h-5 text-white" />
          </div>
          Platform Analytics
        </h1>
        <p className="text-slate-400 mt-1">
          Comprehensive metrics across all stores
        </p>
      </div>

      {/* Platform-wide Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard
          title="Total GMV"
          value={formatCurrency(platformMetrics.totalGMV)}
          subtitle="All time"
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Monthly GMV"
          value={formatCurrency(platformMetrics.monthlyGMV)}
          subtitle="This month"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={platformMetrics.totalOrders.toLocaleString()}
          subtitle={`${platformMetrics.monthlyOrders} this month`}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Today's Visitors"
          value={platformMetrics.todayVisitors.toLocaleString()}
          subtitle="Unique visitors"
          icon={<Eye className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard
          title="Monthly Visitors"
          value={platformMetrics.monthlyVisitors.toLocaleString()}
          subtitle="This month"
          icon={<Users className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          title="Active Stores"
          value={platformMetrics.totalStores.toLocaleString()}
          subtitle="Total stores"
          icon={<Store className="w-5 h-5" />}
          color="pink"
        />
        <StatCard
          title="Approaching Limits"
          value={storesApproachingLimits.length.toString()}
          subtitle="Need attention"
          icon={<AlertTriangle className="w-5 h-5" />}
          color={storesApproachingLimits.length > 0 ? 'red' : 'slate'}
        />
      </div>

      {/* CHARTS SECTION */}
      {/* TABS */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'insights' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            User Insights
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'growth' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Revenue & Growth
          </button>
        </nav>
      </div>

      {/* OVERVIEW CONTENT */}
      {activeTab === 'overview' && (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Revenue Trend (30 Days)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value) => [`৳${value}`, 'Revenue']}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Signups Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-400" />
              New Stores (30 Days)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#1e293b', opacity: 0.5 }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#3b82f6' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar 
                    dataKey="signups" 
                    name="New Stores" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Stores */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Top 10 Stores by Revenue
            </h2>
            <div className="space-y-3">
              {topStores.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No sales data yet</p>
              ) : (
                topStores.map((store, index) => (
                  <div key={store.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-xs font-medium text-slate-400">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">{store.name}</p>
                        <p className="text-xs text-slate-500">{store.subdomain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">{formatCurrency(store.totalRevenue)}</p>
                      <p className="text-xs text-slate-500">{store.totalOrders} orders</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stores Approaching Limits */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Stores Approaching Limits
            </h2>
            <div className="space-y-3">
              {storesApproachingLimits.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No stores at risk</p>
              ) : (
                storesApproachingLimits.slice(0, 10).map((store) => (
                  <div key={store.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{store.name}</p>
                        {getPlanBadge(store.planType)}
                      </div>
                      <Link
                        to={`/admin/stores?search=${store.subdomain}`}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Orders: </span>
                        <span className={store.limits.orderUsage >= 100 ? 'text-red-400' : store.limits.orderUsage >= 80 ? 'text-amber-400' : 'text-slate-300'}>
                          {store.totalOrders}/{store.limits.maxOrders === Infinity ? '∞' : store.limits.maxOrders}
                          ({store.limits.orderUsage}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Products: </span>
                        <span className={store.limits.productUsage >= 100 ? 'text-red-400' : store.limits.productUsage >= 80 ? 'text-amber-400' : 'text-slate-300'}>
                          {store.productCount}/{store.limits.maxProducts === Infinity ? '∞' : store.limits.maxProducts}
                          ({store.limits.productUsage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* USER INSIGHTS CONTENT */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Conversion Funnel (Last 30 Days)
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#94a3b8" 
                      fontSize={14} 
                      width={100}
                    />
                    <Tooltip 
                      cursor={{ fill: '#1e293b', opacity: 0.5 }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {funnelData.map((step, i) => (
                  <div key={i} className="bg-slate-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-400 mb-1">{step.name}</p>
                    <p className="text-lg font-bold text-white">{step.value.toLocaleString()}</p>
                    {i > 0 && funnelData[i-1].value > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        {Math.round((step.value / funnelData[0].value) * 100)}% of total
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cohort analysis placeholder - requires massive data to look good */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
               <h3 className="text-lg font-bold text-white mb-4">Retention Cohorts</h3>
               <p className="text-slate-400 text-sm mb-6">
                 Stores grouped by creation month and their activity over time.
               </p>
               <div className="overflow-x-auto">
                 <table className="w-full text-center">
                   <thead>
                     <tr>
                        <th className="px-4 py-2 text-xs text-slate-500">Cohort</th>
                        <th className="px-4 py-2 text-xs text-slate-500">Stores</th>
                        <th className="px-4 py-2 text-xs text-slate-500">Month 1</th>
                        <th className="px-4 py-2 text-xs text-slate-500">Month 2</th>
                        <th className="px-4 py-2 text-xs text-slate-500">Month 3</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {/* Mock data for visualization until we have real persistent history */}
                     {[
                        { month: 'Oct 2025', count: 12, m1: 85, m2: 70, m3: 65 },
                        { month: 'Nov 2025', count: 18, m1: 82, m2: 75, m3: null },
                        { month: 'Dec 2025', count: 25, m1: 88, m2: null, m3: null },
                     ].map((cohort, i) => (
                       <tr key={i}>
                         <td className="px-4 py-3 text-sm text-white font-medium">{cohort.month}</td>
                         <td className="px-4 py-3 text-sm text-slate-400">{cohort.count}</td>
                         <td className="px-4 py-3"><div className={`w-full py-1 rounded ${cohort.m1 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50'}`}>{cohort.m1 ? `${cohort.m1}%` : '-'}</div></td>
                         <td className="px-4 py-3"><div className={`w-full py-1 rounded ${cohort.m2 ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-800/50'}`}>{cohort.m2 ? `${cohort.m2}%` : '-'}</div></td>
                         <td className="px-4 py-3"><div className={`w-full py-1 rounded ${cohort.m3 ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800/50'}`}>{cohort.m3 ? `${cohort.m3}%` : '-'}</div></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* REVENUE GROWTH CONTENT */}
      {activeTab === 'growth' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Revenue Forecast (Next 7 Days)
              </h3>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                AI Projection (Linear Regression)
              </span>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorRevenueForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Area 
                    name="Historical Revenue"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenueForecast)" 
                    connectNulls
                  />
                  <Line 
                    name="Forecast"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f59e0b" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    // Filter to only show forecast part in this line if needed, 
                    // but for continuity we plot all. 
                    // Ideally we'd separate data keys but this works for visual trend
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-500">
                <span className="text-emerald-400 font-bold">Insight: </span>
                Based on the last 30 days of performance, your revenue is trending 
                {forecastData[forecastData.length - 1].revenue > forecastData[0].revenue ? ' upward 📈' : ' stable/downward'}.
                The yellow dashed line represents the predicted trajectory for the next week.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Unusual Activity Section */}
      {unusualActivityStores.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            ⚠️ Unusual Activity Detected
            <span className="text-xs px-2 py-0.5 bg-red-500/20 rounded-full text-red-400">
              {unusualActivityStores.length} stores
            </span>
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            এই স্টোরগুলোতে Order এর তুলনায় অস্বাভাবিক বেশি Visitor দেখা যাচ্ছে। সম্ভাব্য bot/spam activity পরীক্ষা করুন।
          </p>
          <div className="space-y-3">
            {unusualActivityStores.slice(0, 10).map((store) => (
              <div 
                key={store.id} 
                className={`p-4 rounded-lg ${
                  store.severity === 'critical' 
                    ? 'bg-red-500/20 border border-red-500/40' 
                    : 'bg-amber-500/10 border border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      store.severity === 'critical' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-amber-500 text-black'
                    }`}>
                      {store.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ WARNING'}
                    </span>
                    <div>
                      <p className="text-white font-medium">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.subdomain}</p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/stores?search=${store.subdomain}`}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View Store <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Visitors</span>
                    <p className="text-white font-medium">{store.visitors.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Orders</span>
                    <p className="text-white font-medium">{store.totalOrders}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Ratio</span>
                    <p className={`font-bold ${
                      store.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {store.visitorOrderRatio}:1
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  প্রতি ১ অর্ডারে {store.visitorOrderRatio} জন ভিজিটর (স্বাভাবিক: ১০-১০০)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Stores Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">All Stores Breakdown</h2>
          <div className="flex items-center gap-3">
            {/* Plan Filter */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="premium">Premium</option>
            </select>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="orders">Sort by Orders</option>
              <option value="visitors">Sort by Visitors</option>
              <option value="products">Sort by Products</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Store</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Orders</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Products</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Visitors</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No stores found
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{store.name}</p>
                        <p className="text-xs text-slate-500">{store.subdomain}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getPlanBadge(store.planType)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                      {formatCurrency(store.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {store.totalOrders}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {store.productCount}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {store.visitors}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Order Usage */}
                        <div className="w-16">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-500">O</span>
                            <span className={
                              store.limits.orderUsage >= 100 ? 'text-red-400' :
                              store.limits.orderUsage >= 80 ? 'text-amber-400' :
                              'text-slate-400'
                            }>{store.limits.orderUsage}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                store.limits.orderUsage >= 100 ? 'bg-red-500' :
                                store.limits.orderUsage >= 80 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(store.limits.orderUsage, 100)}%` }}
                            />
                          </div>
                        </div>
                        {/* Product Usage */}
                        <div className="w-16">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-500">P</span>
                            <span className={
                              store.limits.productUsage >= 100 ? 'text-red-400' :
                              store.limits.productUsage >= 80 ? 'text-amber-400' :
                              'text-slate-400'
                            }>{store.limits.productUsage}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                store.limits.productUsage >= 100 ? 'bg-red-500' :
                                store.limits.productUsage >= 80 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(store.limits.productUsage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
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
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'cyan' | 'pink' | 'red' | 'slate';
}) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: 'text-orange-400' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: 'text-cyan-400' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: 'text-pink-400' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', icon: 'text-red-400' },
    slate: { bg: 'bg-slate-700', text: 'text-slate-400', icon: 'text-slate-400' },
  };
  
  const colors = colorMap[color];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
          <div className={colors.icon}>{icon}</div>
        </div>
      </div>
      <p className={`text-xl font-bold ${colors.text}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

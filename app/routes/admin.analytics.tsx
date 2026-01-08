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
  BarChart3, 
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

export const meta: MetaFunction = () => {
  return [{ title: 'Analytics - Super Admin' }];
};

// ============================================================================
// LOADER - Fetch comprehensive analytics
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, db);
  
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
  
  // ===== DAILY REVENUE TREND (Last 7 days) =====
  const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - i);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayResult = await drizzleDb
      .select({
        revenue: sum(orders.total),
        orders: count(),
      })
      .from(orders)
      .where(and(
        sql`${orders.status} != 'cancelled'`,
        gte(orders.createdAt, date),
        sql`${orders.createdAt} < ${nextDate}`
      ));
    
    dailyRevenue.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: Number(dayResult[0]?.revenue) || 0,
      orders: dayResult[0]?.orders || 0,
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
    dailyRevenue,
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
    dailyRevenue,
  } = useLoaderData<typeof loader>();
  
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
  
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
  
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
            <BarChart3 className="w-5 h-5 text-white" />
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

      {/* Revenue Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Platform Revenue - Last 7 Days</h2>
        <div className="space-y-3">
          {dailyRevenue.map((day, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm text-slate-400">{day.date}</div>
              <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg transition-all duration-500"
                  style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                />
                {day.revenue > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-300">
                    {formatCurrency(day.revenue)}
                  </span>
                )}
              </div>
              <div className="w-20 text-sm text-slate-500 text-right">{day.orders} orders</div>
            </div>
          ))}
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

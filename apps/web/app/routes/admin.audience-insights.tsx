/**
 * Super Admin: Audience Insights (Enhanced)
 *
 * Platform-wide customer analytics with advanced features:
 * - Cross-store customer matching (Super VIP identification)
 * - Top trending products nationally
 * - Merchant performance benchmarking
 * - Industry average comparisons
 * - GMV and revenue analytics
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { sql, count, sum, avg, desc, eq } from 'drizzle-orm';
import { customers, stores, orders, products, orderItems } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import {
  Users,
  Crown,
  AlertTriangle,
  ShoppingCart,
  UserPlus,
  TrendingUp,
  Globe,
  DollarSign,
  Star,
  Package,
  Store,
  Award,
  Target,
  Zap,
} from 'lucide-react';
import { formatPrice } from '~/lib/formatting';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  // ============================================================
  // BASIC METRICS
  // ============================================================

  // Get global segment counts across all stores
  const segmentCounts = await db
    .select({
      segment: customers.segment,
      count: count().as('count'),
    })
    .from(customers)
    .groupBy(customers.segment);

  // Get total unique customers (by phone number)
  const [uniquePhones] = await db
    .select({
      count: sql<number>`COUNT(DISTINCT phone)`.as('count'),
    })
    .from(customers);

  // Get total stores with customers
  const [storesWithCustomers] = await db
    .select({
      count: sql<number>`COUNT(DISTINCT store_id)`.as('count'),
    })
    .from(customers);

  // Get total revenue across all stores
  const [totalRevenue] = await db
    .select({
      total: sum(orders.total).as('total'),
      orderCount: count().as('order_count'),
    })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`);

  // ============================================================
  // CROSS-STORE CUSTOMER MATCHING (Super VIP Detection)
  // ============================================================

  // Find customers who shop across multiple stores (same phone)
  const crossStoreCustomers = await db
    .select({
      phone: customers.phone,
      storeCount: sql<number>`COUNT(DISTINCT store_id)`.as('store_count'),
      totalSpent: sql<number>`SUM(total_spent)`.as('total_spent'),
      totalOrders: sql<number>`SUM(total_orders)`.as('total_orders'),
    })
    .from(customers)
    .where(sql`phone IS NOT NULL AND phone != ''`)
    .groupBy(customers.phone)
    .having(sql`COUNT(DISTINCT store_id) > 1`)
    .orderBy(sql`total_spent DESC`)
    .limit(10);

  // Count total cross-store shoppers
  const [crossStoreCount] = await db
    .select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(
      db
        .select({
          phone: customers.phone,
        })
        .from(customers)
        .where(sql`phone IS NOT NULL AND phone != ''`)
        .groupBy(customers.phone)
        .having(sql`COUNT(DISTINCT store_id) > 1`)
        .as('cross_store')
    );

  // ============================================================
  // TOP TRENDING PRODUCTS NATIONALLY
  // ============================================================

  const trendingProducts = await db
    .select({
      productId: orderItems.productId,
      productName: products.title,
      storeName: stores.name,
      soldCount: sql<number>`SUM(${orderItems.quantity})`.as('sold_count'),
      revenue: sql<number>`SUM(${orderItems.price} * ${orderItems.quantity})`.as('revenue'),
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(stores, eq(products.storeId, stores.id))
    .groupBy(orderItems.productId)
    .orderBy(sql`sold_count DESC`)
    .limit(10);

  // ============================================================
  // MERCHANT PERFORMANCE BENCHMARKING
  // ============================================================

  // Get store performance metrics
  const merchantPerformance = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      customerCount: sql<number>`(SELECT COUNT(*) FROM customers WHERE store_id = ${stores.id})`.as(
        'customer_count'
      ),
      orderCount:
        sql<number>`(SELECT COUNT(*) FROM orders WHERE store_id = ${stores.id} AND status != 'cancelled')`.as(
          'order_count'
        ),
      revenue:
        sql<number>`(SELECT COALESCE(SUM(total), 0) FROM orders WHERE store_id = ${stores.id} AND status != 'cancelled')`.as(
          'revenue'
        ),
      vipCount:
        sql<number>`(SELECT COUNT(*) FROM customers WHERE store_id = ${stores.id} AND segment = 'vip')`.as(
          'vip_count'
        ),
    })
    .from(stores)
    .where(eq(stores.isActive, true))
    .orderBy(sql`revenue DESC`)
    .limit(15);

  // Calculate industry averages
  const [industryAverages] = await db
    .select({
      avgOrderValue: sql<number>`AVG(total)`.as('avg_order_value'),
      avgOrdersPerStore:
        sql<number>`(SELECT AVG(cnt) FROM (SELECT COUNT(*) as cnt FROM orders WHERE status != 'cancelled' GROUP BY store_id))`.as(
          'avg_orders'
        ),
    })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`);

  // ============================================================
  // TOP CATEGORIES
  // ============================================================

  const topCategories = await db
    .select({
      category: products.category,
      productCount: count().as('product_count'),
      soldCount:
        sql<number>`COALESCE((SELECT SUM(quantity) FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = ${products.category})), 0)`.as(
          'sold_count'
        ),
    })
    .from(products)
    .where(sql`${products.category} IS NOT NULL AND ${products.category} != ''`)
    .groupBy(products.category)
    .orderBy(sql`sold_count DESC`)
    .limit(8);

  // ============================================================
  // CUSTOMERS BY STORE (existing)
  // ============================================================

  const customersByStore = await db
    .select({
      storeId: customers.storeId,
      storeName: stores.name,
      customerCount: count().as('customer_count'),
    })
    .from(customers)
    .innerJoin(stores, sql`${customers.storeId} = ${stores.id}`)
    .groupBy(customers.storeId)
    .orderBy(sql`customer_count DESC`)
    .limit(10);

  const countsMap = segmentCounts.reduce(
    (acc, { segment, count: cnt }) => {
      acc[segment || 'new'] = cnt;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalCustomers = Object.values(countsMap).reduce((a, b) => a + b, 0);

  return json({
    // Basic metrics
    segmentCounts: countsMap,
    totalCustomers,
    uniquePhones: uniquePhones?.count || 0,
    storesWithCustomers: storesWithCustomers?.count || 0,
    totalRevenue: Number(totalRevenue?.total) || 0,
    totalOrders: Number(totalRevenue?.orderCount) || 0,

    // Advanced metrics
    crossStoreCustomers,
    crossStoreCount: crossStoreCount?.count || 0,
    trendingProducts,
    merchantPerformance,
    industryAverages: {
      avgOrderValue: Number(industryAverages?.avgOrderValue) || 0,
      avgOrdersPerStore: Number(industryAverages?.avgOrdersPerStore) || 0,
    },
    topCategories,
    customersByStore,
  });
}

// Segment config
const SEGMENTS = [
  { id: 'vip', label: 'VIP', icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  {
    id: 'churn_risk',
    label: 'Churn Risk',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 'window_shopper',
    label: 'Window Shoppers',
    icon: ShoppingCart,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'new',
    label: 'New Leads',
    icon: UserPlus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'regular',
    label: 'Regular',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
];

export default function AudienceInsights() {
  const {
    segmentCounts,
    totalCustomers,
    uniquePhones,
    storesWithCustomers,
    totalRevenue,
    totalOrders,
    crossStoreCustomers,
    crossStoreCount,
    trendingProducts,
    merchantPerformance,
    industryAverages,
    topCategories,
    customersByStore,
  } = useLoaderData<typeof loader>();

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-500" />
            Platform Data Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time analytics across all stores • Cross-store customer intelligence
          </p>
        </div>

        {/* Key Metrics - Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <MetricCard
            icon={Users}
            label="Total Customers"
            value={totalCustomers.toLocaleString()}
            iconColor="text-purple-500/50"
          />
          <MetricCard
            icon={TrendingUp}
            label="Unique Shoppers"
            value={uniquePhones.toLocaleString()}
            subtext="By phone"
            iconColor="text-green-500/50"
          />
          <MetricCard
            icon={Store}
            label="Active Stores"
            value={storesWithCustomers.toLocaleString()}
            iconColor="text-blue-500/50"
          />
          <MetricCard
            icon={DollarSign}
            label="Total GMV"
            value={formatPrice(totalRevenue)}
            iconColor="text-yellow-500/50"
          />
          <MetricCard
            icon={Package}
            label="Total Orders"
            value={totalOrders.toLocaleString()}
            iconColor="text-indigo-500/50"
          />
          <MetricCard
            icon={Target}
            label="Avg Order Value"
            value={formatPrice(avgOrderValue)}
            iconColor="text-pink-500/50"
          />
        </div>

        {/* Cross-Store Super VIPs */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl shadow-sm p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Cross-Store Super VIPs
              </h2>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                {crossStoreCount} found
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Customers who shop at multiple stores on your platform
            </p>
            {crossStoreCustomers.length > 0 ? (
              <div className="space-y-3">
                {crossStoreCustomers.slice(0, 5).map((customer, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.storeCount} stores • {customer.totalOrders} orders
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                      {formatPrice(Number(customer.totalSpent))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No cross-store customers yet</p>
            )}
          </div>

          {/* Top Trending Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-orange-500" />
              Top Trending Products
            </h2>
            {trendingProducts.length > 0 ? (
              <div className="space-y-3">
                {trendingProducts.slice(0, 5).map((product, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {product.productName || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{product.storeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {product.soldCount} sold
                      </p>
                      <p className="text-xs text-green-500">
                        {formatPrice(Number(product.revenue))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No product data yet</p>
            )}
          </div>
        </div>

        {/* Segment Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Customer Segments Distribution
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SEGMENTS.map((segment) => {
              const Icon = segment.icon;
              const segmentCount = segmentCounts[segment.id] || 0;
              const percentage =
                totalCustomers > 0 ? ((segmentCount / totalCustomers) * 100).toFixed(1) : 0;

              return (
                <div key={segment.id} className="text-center">
                  <div className={`inline-flex p-4 rounded-xl ${segment.bgColor} mb-3`}>
                    <Icon className={`w-8 h-8 ${segment.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {segmentCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{segment.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Merchant Performance & Categories */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Merchant Leaderboard */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-500" />
              Merchant Performance Leaderboard
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Store</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                    <th className="pb-3 font-medium text-right">Orders</th>
                    <th className="pb-3 font-medium text-right">VIPs</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {merchantPerformance.slice(0, 8).map((store, i) => {
                    const storeAvgOrderValue =
                      Number(store.orderCount) > 0
                        ? Number(store.revenue) / Number(store.orderCount)
                        : 0;
                    const aboveAvg = storeAvgOrderValue > industryAverages.avgOrderValue;

                    return (
                      <tr key={store.storeId} className="text-gray-900 dark:text-white">
                        <td className="py-3 font-bold text-gray-400">{i + 1}</td>
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{store.storeName}</p>
                            <p className="text-xs text-gray-500">{store.customerCount} customers</p>
                          </div>
                        </td>
                        <td className="py-3 text-right font-bold">
                          ৳{(Number(store.revenue) / 1000).toFixed(1)}k
                        </td>
                        <td className="py-3 text-right">{store.orderCount}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 ${Number(store.vipCount) > 0 ? 'text-yellow-500' : 'text-gray-400'}`}
                          >
                            {Number(store.vipCount) > 0 && <Crown className="w-3 h-3" />}
                            {store.vipCount}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Industry Benchmarks */}
          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm p-6 border border-purple-500/20">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-500" />
              Platform Benchmarks
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ৳{industryAverages.avgOrderValue.toFixed(0)}
                </p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Orders/Store</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {industryAverages.avgOrdersPerStore.toFixed(0)}
                </p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">VIP Conversion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalCustomers > 0
                    ? (((segmentCounts.vip || 0) / totalCustomers) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Product Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topCategories.map((cat, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {cat.category || 'Uncategorized'}
                </p>
                <p className="text-sm text-gray-500 mt-1">{cat.productCount} products</p>
                <p className="text-xs text-green-500 mt-1">{cat.soldCount} sold</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor,
}: {
  icon: any;
  label: string;
  value: string;
  subtext?: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </div>
  );
}

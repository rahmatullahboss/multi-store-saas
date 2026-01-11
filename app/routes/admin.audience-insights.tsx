/**
 * Super Admin: Audience Insights
 * 
 * Platform-wide customer analytics aggregated from all stores.
 * Shows global customer segments, trends, and engagement metrics.
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { sql, count, sum } from 'drizzle-orm';
import { customers, stores, orders } from '@db/schema';
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
} from 'lucide-react';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

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
    })
    .from(orders);

  // Get customers by store (top 10)
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
    segmentCounts: countsMap,
    totalCustomers,
    uniquePhones: uniquePhones?.count || 0,
    storesWithCustomers: storesWithCustomers?.count || 0,
    totalRevenue: totalRevenue?.total || 0,
    customersByStore,
  });
}

// Segment config
const SEGMENTS = [
  { id: 'vip', label: 'VIP', icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'churn_risk', label: 'Churn Risk', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { id: 'window_shopper', label: 'Window Shoppers', icon: ShoppingCart, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'new', label: 'New Leads', icon: UserPlus, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'regular', label: 'Regular', icon: Users, color: 'text-green-500', bgColor: 'bg-green-500/10' },
];

export default function AudienceInsights() {
  const {
    segmentCounts,
    totalCustomers,
    uniquePhones,
    storesWithCustomers,
    totalRevenue,
    customersByStore,
  } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-500" />
            Audience Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform-wide customer analytics across all stores
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-purple-500/50" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unique Shoppers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{uniquePhones.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/50" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">By phone number</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Stores</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{storesWithCustomers.toLocaleString()}</p>
              </div>
              <Globe className="w-10 h-10 text-blue-500/50" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">With customers</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total GMV</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ৳{(totalRevenue / 1000).toFixed(1)}k
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-500/50" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Gross Merchandise Value</p>
          </div>
        </div>

        {/* Segment Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Customer Segments
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SEGMENTS.map((segment) => {
              const Icon = segment.icon;
              const count = segmentCounts[segment.id] || 0;
              const percentage = totalCustomers > 0 ? ((count / totalCustomers) * 100).toFixed(1) : 0;

              return (
                <div key={segment.id} className="text-center">
                  <div className={`inline-flex p-4 rounded-xl ${segment.bgColor} mb-3`}>
                    <Icon className={`w-8 h-8 ${segment.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{segment.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Stores by Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Top Stores by Customer Count
          </h2>
          <div className="space-y-4">
            {customersByStore.map((store, index) => (
              <div key={store.storeId} className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-8">
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{store.storeName}</p>
                  <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{
                        width: `${(Number(store.customerCount) / (Number(customersByStore[0]?.customerCount) || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {store.customerCount.toLocaleString()} customers
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

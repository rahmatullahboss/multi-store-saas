/**
 * Returns Dashboard
 *
 * Route: /app/returns
 *
 * Shows only actual delivery returns (courierStatus = 'returned')
 * NOT call cancels (status = 'cancelled')
 */

import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { orders, stores, customers } from '@db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  PackageX,
  ArrowLeft,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
  User,
  TrendingDown,
} from 'lucide-react';
import { PageHeader, StatCard } from '~/components/ui';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';

export const meta: MetaFunction = () => {
  return [{ title: 'Returns - Merchant Dashboard' }];
};

// ============================================================================
// LOADER - Fetch returned orders
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'orders',
  });

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  const store = storeResult[0];

  // Fetch ONLY returned orders (courierStatus = 'returned')
  // NOT cancelled orders (those are call cancels)
  const returnedOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.storeId, storeId), eq(orders.courierStatus, 'returned')))
    .orderBy(desc(orders.updatedAt))
    .limit(100);

  // Get all orders for calculating return rate
  const allOrders = await db
    .select({
      status: orders.status,
      courierStatus: orders.courierStatus,
      total: orders.total,
    })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  // Calculate stats
  const totalOrders = allOrders.length;
  const deliveredCount = allOrders.filter(
    (o) => o.status === 'delivered' || o.courierStatus === 'delivered'
  ).length;
  const returnedCount = allOrders.filter((o) => o.courierStatus === 'returned').length;
  const shippedCount = deliveredCount + returnedCount;

  const returnRate = shippedCount > 0 ? Math.round((returnedCount / shippedCount) * 100) : 0;

  const returnLoss = returnedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Get top returners (customers with most returns)
  const topReturners = await db
    .select({
      phone: orders.customerPhone,
      name: orders.customerName,
      returnCount: sql<number>`COUNT(*)`.as('return_count'),
    })
    .from(orders)
    .where(and(eq(orders.storeId, storeId), eq(orders.courierStatus, 'returned')))
    .groupBy(orders.customerPhone, orders.customerName)
    .orderBy(desc(sql`return_count`))
    .limit(10);

  return json({
    orders: returnedOrders,
    storeName: store.name,
    currency: store.currency || 'BDT',
    stats: {
      totalReturns: returnedCount,
      returnRate,
      returnLoss,
      shippedOrders: shippedCount,
    },
    topReturners,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ReturnsDashboard() {
  const { orders: returnedOrders, currency, stats, topReturners } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();

  const formatDate = (date: string | Date | null) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/orders" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <PageHeader
          title="রিটার্ন পার্সেল"
          description="ডেলিভারি রিটার্ন হওয়া অর্ডার (শুধু shipped → returned)"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="মোট রিটার্ন"
          value={stats.totalReturns}
          icon={<PackageX className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="রিটার্ন রেট"
          value={`${stats.returnRate}%`}
          icon={<TrendingDown className="w-5 h-5" />}
          color={stats.returnRate > 20 ? 'red' : stats.returnRate > 10 ? 'yellow' : 'emerald'}
        />
        <StatCard
          label="রিটার্ন লস"
          value={formatPrice(stats.returnLoss)}
          icon={<DollarSign className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          label="শিপড অর্ডার"
          value={stats.shippedOrders}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Top Returners */}
      {topReturners.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            টপ রিটার্নার কাস্টমার
          </h3>
          <div className="space-y-2">
            {topReturners.slice(0, 5).map((customer, idx) => (
              <div
                key={customer.phone}
                className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  {customer.returnCount}টি রিটার্ন
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Returns List */}
      {returnedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <PackageX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো রিটার্ন নেই 🎉</h3>
          <p className="text-gray-500">দারুণ! আপনার কোনো ডেলিভারি রিটার্ন হয়নি।</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-red-50">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ এই লিস্টে শুধু ডেলিভারি রিটার্ন আছে (shipped → returned)। Call cancel এখানে নেই।
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {returnedOrders.map((order) => (
              <Link
                key={order.id}
                to={`/app/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <PackageX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{order.customerName || 'Unknown'}</span>
                      <span>•</span>
                      <Phone className="w-3 h-3" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

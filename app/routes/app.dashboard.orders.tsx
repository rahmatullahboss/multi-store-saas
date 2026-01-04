/**
 * Merchant Dashboard - Orders List
 * 
 * Route: /app/dashboard/orders
 * 
 * Displays all orders for the merchant's store with:
 * - Order #, Date, Customer, Phone, Total, Status
 * - Responsive table design
 * - Status badges with colors
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { orders, stores } from '@db/schema';
import { eq, desc } from 'drizzle-orm';

export const meta: MetaFunction = () => {
  return [
    { title: 'Orders - Merchant Dashboard' },
  ];
};

// ============================================================================
// LOADER - Fetch orders for the merchant's store
// ============================================================================
export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  
  // For now, we'll use the context storeId (from tenant middleware)
  // In production, you'd verify the user is authenticated and owns this store
  const { storeId, store } = context;

  if (!storeId || !store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Fetch orders for this store, newest first
  const storeOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return json({
    orders: storeOrders,
    storeName: store.name,
    currency: store.currency || 'BDT',
  });
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    processing: 'bg-purple-100 text-purple-800 border-purple-300',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const labels: Record<string, string> = {
    pending: 'অপেক্ষমান',
    confirmed: 'কনফার্মড',
    processing: 'প্রসেসিং',
    shipped: 'শিপড',
    delivered: 'ডেলিভার্ড',
    cancelled: 'বাতিল',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DashboardOrdersPage() {
  const { orders: storeOrders, storeName, currency } = useLoaderData<typeof loader>();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                ← স্টোরে ফিরুন
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900">{storeName} - অর্ডার সমূহ</h1>
            </div>
            <div className="text-sm text-gray-500">
              মোট {storeOrders.length} অর্ডার
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="মোট অর্ডার"
            value={storeOrders.length}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="অপেক্ষমান"
            value={storeOrders.filter(o => o.status === 'pending').length}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="ডেলিভার্ড"
            value={storeOrders.filter(o => o.status === 'delivered').length}
            icon="✅"
            color="emerald"
          />
          <StatCard
            title="মোট আয়"
            value={formatPrice(storeOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0))}
            icon="💰"
            color="purple"
            isPrice
          />
        </div>

        {/* Orders Table */}
        {storeOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">এখনও কোনো অর্ডার নেই</h3>
            <p className="text-gray-500 mb-6">অর্ডার আসলে এখানে দেখা যাবে</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              স্টোরে যান
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      অর্ডার #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      গ্রাহক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ফোন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      মোট
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {storeOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link 
                          to={`/app/dashboard/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.createdAt as Date)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <a href={`tel:${order.customerPhone}`} className="hover:text-blue-600">
                          {order.customerPhone}
                        </a>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status || 'pending'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {storeOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <Link 
                      to={`/app/dashboard/orders/${order.id}`}
                      className="text-blue-600 font-medium"
                    >
                      {order.orderNumber}
                    </Link>
                    <StatusBadge status={order.status || 'pending'} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(order.createdAt as Date)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <a href={`tel:${order.customerPhone}`} className="text-sm text-gray-500 hover:text-blue-600">
                        {order.customerPhone}
                      </a>
                    </div>
                    <p className="font-bold text-lg text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'yellow' | 'emerald' | 'purple';
  isPrice?: boolean;
}

function StatCard({ title, value, icon, color, isPrice }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`font-bold ${isPrice ? 'text-lg' : 'text-2xl'} text-gray-900`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

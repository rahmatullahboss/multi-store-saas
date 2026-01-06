/**
 * Merchant Dashboard - Orders List - Shopify-Inspired Design
 * 
 * Route: /app/orders
 * 
 * Features:
 * - Status tabs for filtering
 * - Search by order number, customer, phone
 * - Stats cards
 * - Responsive table design with quick actions
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { orders, stores } from '@db/schema';
import { eq, desc } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { 
  ShoppingCart, Clock, Package, Truck, CheckCircle, XCircle, 
  Phone, Eye, DollarSign, ThumbsUp
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';

export const meta: MetaFunction = () => {
  return [{ title: 'Orders - Merchant Dashboard' }];
};

// ============================================================================
// LOADER - Fetch orders for the merchant's store
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
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

  // Fetch orders for this store, newest first
  const storeOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt))
    .limit(200);

  // Calculate stats
  const stats = {
    total: storeOrders.length,
    pending: storeOrders.filter(o => o.status === 'pending').length,
    confirmed: storeOrders.filter(o => o.status === 'confirmed').length,
    processing: storeOrders.filter(o => o.status === 'processing').length,
    shipped: storeOrders.filter(o => o.status === 'shipped').length,
    delivered: storeOrders.filter(o => o.status === 'delivered').length,
    cancelled: storeOrders.filter(o => o.status === 'cancelled').length,
    revenue: storeOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
  };

  return json({
    orders: storeOrders,
    storeName: store.name,
    currency: store.currency || 'BDT',
    stats,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DashboardOrdersPage() {
  const { orders: storeOrders, currency, stats } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter state
  const statusFilter = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: 'All Orders', count: stats.total },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'confirmed', label: 'Confirmed', count: stats.confirmed },
    { id: 'processing', label: 'Processing', count: stats.processing },
    { id: 'shipped', label: 'Shipped', count: stats.shipped },
    { id: 'delivered', label: 'Delivered', count: stats.delivered },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelled },
  ];

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...storeOrders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(query) ||
        (o.customerName && o.customerName.toLowerCase().includes(query)) ||
        (o.customerPhone && o.customerPhone.includes(query))
      );
    }

    return filtered;
  }, [storeOrders, statusFilter, searchQuery]);

  const handleStatusChange = useCallback((tabId: string) => {
    setSearchParams(prev => {
      if (tabId === 'all') {
        prev.delete('status');
      } else {
        prev.set('status', tabId);
      }
      return prev;
    });
  }, [setSearchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '—';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString('en-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Orders"
        description="View and manage customer orders"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.total}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
          color={stats.pending > 0 ? 'yellow' : 'gray'}
          href="/app/orders?status=pending"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label="Revenue"
          value={formatPrice(stats.revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <SearchInput
          placeholder="Search by order #, customer, or phone..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full md:w-80"
        />
        
        {/* Status Tabs */}
        <div className="flex-1 overflow-x-auto">
          <StatusTabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Orders List */}
      {storeOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={<ShoppingCart className="w-10 h-10" />}
            title="No orders yet"
            description="Orders will appear here when customers place them."
            action={{
              label: 'View Store',
              href: '/',
            }}
          />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No orders match your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleStatusChange('all');
            }}
            className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link 
                        to={`/app/orders/${order.id}`}
                        className="font-mono text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {order.customerName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.customerName || 'Customer'}</p>
                          <a 
                            href={`tel:${order.customerPhone}`} 
                            className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {order.customerPhone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status || 'pending'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <Link 
                key={order.id} 
                to={`/app/orders/${order.id}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm font-medium text-emerald-600">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status || 'pending'} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
                      {order.customerName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.customerName || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { icon: typeof Clock; bg: string; text: string; label: string }> = {
    pending: { 
      icon: Clock, 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-700', 
      label: 'Pending' 
    },
    confirmed: { 
      icon: ThumbsUp, 
      bg: 'bg-cyan-100', 
      text: 'text-cyan-700', 
      label: 'Confirmed' 
    },
    processing: { 
      icon: Package, 
      bg: 'bg-blue-100', 
      text: 'text-blue-700', 
      label: 'Processing' 
    },
    shipped: { 
      icon: Truck, 
      bg: 'bg-purple-100', 
      text: 'text-purple-700', 
      label: 'Shipped' 
    },
    delivered: { 
      icon: CheckCircle, 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-700', 
      label: 'Delivered' 
    },
    cancelled: { 
      icon: XCircle, 
      bg: 'bg-red-100', 
      text: 'text-red-700', 
      label: 'Cancelled' 
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

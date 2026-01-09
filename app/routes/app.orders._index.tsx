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

import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { orders, stores } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { 
  ShoppingCart, Clock, Package, Truck, CheckCircle, XCircle, 
  Phone, Eye, DollarSign, ThumbsUp, Loader2, ChevronDown
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Orders - Merchant Dashboard' }];
};

// ============================================================================
// LOADER - Fetch orders for the merchant's store
// ============================================================================
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
// ACTION - Update order status inline
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const orderId = parseInt(formData.get('orderId') as string);
  const status = formData.get('status') as string;

  if (!orderId) {
    return json({ error: 'Order ID required' }, { status: 400 });
  }

  if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return json({ error: 'Invalid status' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Verify order belongs to this store
  const orderResult = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .limit(1);

  if (!orderResult[0]) {
    return json({ error: 'Order not found' }, { status: 404 });
  }

  // Update the order status
  await db
    .update(orders)
    .set({ 
      status: status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      updatedAt: new Date() 
    })
    .where(eq(orders.id, orderId));

  return json({ success: true, orderId, status });
}

// ============================================================================
// STATUS OPTIONS
// ============================================================================
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DashboardOrdersPage() {
  const { orders: storeOrders, currency, stats } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useTranslation();
  
  // Filter state
  const statusFilter = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: t('allOrders'), count: stats.total },
    { id: 'pending', label: t('pending'), count: stats.pending },
    { id: 'confirmed', label: lang === 'bn' ? 'নিশ্চিত' : 'Confirmed', count: stats.confirmed },
    { id: 'processing', label: t('processingOrders'), count: stats.processing },
    { id: 'shipped', label: t('shippedOrders'), count: stats.shipped },
    { id: 'delivered', label: t('deliveredOrders'), count: stats.delivered },
    { id: 'cancelled', label: t('cancelledOrders'), count: stats.cancelled },
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
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-BD', {
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

    const agoText = lang === 'bn' ? 'আগে' : 'ago';
    if (diffMins < 60) return `${diffMins} ${lang === 'bn' ? 'মিনিট' : 'min'} ${agoText}`;
    if (diffHours < 24) return `${diffHours}${lang === 'bn' ? 'ঘন্টা' : 'h'} ${agoText}`;
    if (diffDays < 7) return `${diffDays}${lang === 'bn' ? 'দিন' : 'd'} ${agoText}`;
    
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', {
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
        title={t('orders')}
        description={lang === 'bn' ? 'কাস্টমার অর্ডার দেখুন ও ম্যানেজ করুন' : 'View and manage customer orders'}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
          value={stats.total}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label={t('pending')}
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
          color={stats.pending > 0 ? 'yellow' : 'gray'}
          href="/app/orders?status=pending"
        />
        <StatCard
          label={t('deliveredOrders')}
          value={stats.delivered}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label={t('totalRevenue')}
          value={formatPrice(stats.revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <SearchInput
          placeholder={lang === 'bn' ? 'অর্ডার #, কাস্টমার, অথবা ফোন দিয়ে খুঁজুন...' : 'Search by order #, customer, or phone...'}
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
            title={lang === 'bn' ? 'এখনো কোনো অর্ডার নেই' : 'No orders yet'}
            description={lang === 'bn' ? 'কাস্টমাররা অর্ডার করলে এখানে দেখা যাবে।' : 'Orders will appear here when customers place them.'}
            action={{
              label: lang === 'bn' ? 'স্টোর দেখুন' : 'View Store',
              href: '/',
            }}
          />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">{lang === 'bn' ? 'কোনো অর্ডার আপনার ফিল্টারের সাথে মিলছে না।' : 'No orders match your filters.'}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleStatusChange('all');
            }}
            className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {lang === 'bn' ? 'ফিল্টার সাফ করুন' : 'Clear filters'}
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
                    {lang === 'bn' ? 'অর্ডার' : 'Order'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {lang === 'bn' ? 'তারিখ' : 'Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {lang === 'bn' ? 'কাস্টমার' : 'Customer'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {lang === 'bn' ? 'মোট' : 'Total'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {lang === 'bn' ? 'অ্যাকশন' : 'Actions'}
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
                      <StatusDropdown orderId={order.id} currentStatus={order.status || 'pending'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                        {lang === 'bn' ? 'দেখুন' : 'View'}
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
              <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/app/orders/${order.id}`}>
                    <span className="font-mono text-sm font-medium text-emerald-600">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </Link>
                  <StatusDropdown orderId={order.id} currentStatus={order.status || 'pending'} />
                </div>
                <Link to={`/app/orders/${order.id}`} className="flex items-center justify-between">
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
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STATUS DROPDOWN COMPONENT
// ============================================================================
function StatusDropdown({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== 'idle';
  
  // Determine the displayed status (optimistic update)
  const displayStatus = fetcher.formData 
    ? (fetcher.formData.get('status') as string) 
    : currentStatus;

  const configs: Record<string, { icon: typeof Clock; bg: string; text: string; border: string }> = {
    pending: { icon: Clock, bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    confirmed: { icon: ThumbsUp, bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    processing: { icon: Package, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    shipped: { icon: Truck, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    delivered: { icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    cancelled: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const config = configs[displayStatus] || configs.pending;
  const Icon = config.icon;

  return (
    <fetcher.Form method="post" className="relative">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="relative">
        <select
          name="status"
          value={displayStatus}
          onChange={(e) => fetcher.submit(e.target.form)}
          disabled={isUpdating}
          className={`
            appearance-none cursor-pointer pl-8 pr-8 py-1.5 text-xs font-semibold rounded-full border
            ${config.bg} ${config.text} ${config.border}
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500
            disabled:opacity-50 disabled:cursor-wait
            transition-all
          `}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
        {isUpdating ? (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
        )}
      </div>
    </fetcher.Form>
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

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

import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, stores } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { calculateOrderWeight } from '~/lib/courier-weight.server';
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ThumbsUp,
  Loader2,
  ChevronDown,
  Shield,
  PackageX,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import {
  type OrderStatus,
  assertOrderStatusTransition,
  isOrderStatus,
} from '~/lib/orderStatus';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

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
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  const store = storeResult[0];

  // Fetch orders for this store, newest first
  const storeOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt))
    .limit(200);

  // Parse shippingAddress for each order to get display-friendly address
  const ordersWithAddress = storeOrders.map((o) => {
    let displayAddress = '';
    if (o.shippingAddress) {
      try {
        // Could be a JSON string or a plain address string
        const parsed = typeof o.shippingAddress === 'string' && o.shippingAddress.startsWith('{')
          ? JSON.parse(o.shippingAddress)
          : null;
        if (parsed && typeof parsed === 'object') {
          // JSON object: extract address, upazila, district/city
          // Prioritize: Address, Upazila, District
          const parts = [
            parsed.address, 
            parsed.upazila, 
            parsed.district || parsed.city
          ].filter(Boolean);
          // Deduplicate components
          displayAddress = [...new Set(parts)].join(', ');
        } else {
          // Plain string address
          displayAddress = o.shippingAddress;
        }
      } catch {
        displayAddress = o.shippingAddress;
      }
    }
    return { ...o, displayAddress };
  });

  // Calculate stats
  const stats = {
    total: storeOrders.length,
    pending: storeOrders.filter((o) => o.status === 'pending').length,
    confirmed: storeOrders.filter((o) => o.status === 'confirmed').length,
    processing: storeOrders.filter((o) => o.status === 'processing').length,
    shipped: storeOrders.filter((o) => o.status === 'shipped').length,
    delivered: storeOrders.filter((o) => o.status === 'delivered').length,
    cancelled: storeOrders.filter((o) => o.status === 'cancelled').length,
    returned: storeOrders.filter((o) => o.status === 'returned').length,
    revenue: storeOrders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
      .reduce((sum, o) => sum + o.total, 0),
  };

  // Read courier provider from unified settings first (canonical source)
  let courierProvider: string | null = null;
  try {
    const unified = await getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env });
    courierProvider = unified.courier?.provider || null;
  } catch {
    courierProvider = null;
  }

  // Compatibility fallback: dedicated column
  if (!courierProvider && store.courierSettings) {
    try {
      const courierSettings =
        typeof store.courierSettings === 'string'
          ? JSON.parse(store.courierSettings)
          : store.courierSettings;
      courierProvider = courierSettings?.provider || null;
    } catch {
      courierProvider = null;
    }
  }

  return json({
    orders: ordersWithAddress,
    storeName: store.name,
    currency: store.currency || 'BDT',
    stats,
    courierProvider,
  });
}

// ============================================================================
// ACTION - Update order status inline + Fraud Check
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const orderId = parseInt(formData.get('orderId') as string);

  const db = drizzle(context.cloudflare.env.DB);

  // Handle courier booking
  if (intent === 'bookCourier') {
    const provider = formData.get('provider') as string;

    // Get order
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
      .limit(1);

    if (!orderResult[0]) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult[0];

    // Get store courier settings
    const storeResultCourier = await db
      .select({ courierSettings: stores.courierSettings, name: stores.name })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!storeResultCourier[0]?.courierSettings) {
      return json(
        { error: 'Courier not configured. Go to Settings > Courier to connect.' },
        { status: 400 }
      );
    }

    const courierSettings = JSON.parse(storeResultCourier[0].courierSettings as string);
    let consignmentId = '';

    try {
      // Parse shipping address
      let address = '';
      let city = '';
      if (order.shippingAddress) {
        try {
          const parsed =
            typeof order.shippingAddress === 'string'
              ? JSON.parse(order.shippingAddress)
              : order.shippingAddress;
          city = parsed.city || parsed.district || '';
          // Build full address from all available components
          const fullAddress = [
            parsed.address,
            parsed.upazila,
            parsed.district,
            parsed.city,
            parsed.division,
          ].filter(Boolean).join(', ');
          address = fullAddress || (typeof order.shippingAddress === 'string' ? order.shippingAddress : '');
        } catch {
          address = typeof order.shippingAddress === 'string' ? order.shippingAddress : '';
        }
      }
      // Pathao requires at least 10 characters
      if (!address) address = 'Dhaka, Bangladesh';

      if (provider === 'pathao' && courierSettings.pathao) {
        const { createPathaoClient } = await import('~/services/pathao.server');
        const client = createPathaoClient(courierSettings.pathao);
        const configuredStoreId = Number(courierSettings.pathao.defaultStoreId);
        if (!Number.isInteger(configuredStoreId) || configuredStoreId <= 0) {
          return json({ error: 'Pathao default store ID is missing. Please set it in Courier Settings.' }, { status: 400 });
        }

        // Fetch order items to calculate actual product weight
        const orderItemsForWeight = await db
          .select({
            productId: orderItems.productId,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, orderId));

        const pathaoItemWeight = await calculateOrderWeight(db, storeId, orderItemsForWeight);

        const result = await client.createOrder({
          store_id: configuredStoreId,
          merchant_order_id: order.orderNumber,
          recipient_name: order.customerName || 'Customer',
          recipient_phone: order.customerPhone || '',
          // Pathao requires recipient_address to be at least 10 characters
          recipient_address: address.length >= 10 ? address : (address ? address.padEnd(10, ' ').trim() : 'Dhaka, Bangladesh'),
          delivery_type: 48,
          item_type: 2,
          item_quantity: 1,
          item_weight: pathaoItemWeight, // Calculated from product metafields (min 0.5 kg)
          amount_to_collect: Math.round(order.total),
        });
        consignmentId = result.consignment_id;
      } else if (provider === 'redx' && courierSettings.redx) {
        const { createRedXClient } = await import('~/services/redx.server');
        const client = createRedXClient(courierSettings.redx);

        const result = await client.createParcel({
          customer_name: order.customerName || 'Customer',
          customer_phone: order.customerPhone || '',
          delivery_area: city || 'Dhaka',
          delivery_area_id: 1,
          customer_address: address,
          merchant_invoice_id: order.orderNumber,
          cash_collection_amount: order.total,
          parcel_weight: 500,
        });
        consignmentId = result.tracking_id;
      } else if (provider === 'steadfast' && courierSettings.steadfast) {
        const { createSteadfastClient } = await import('~/services/steadfast.server');
        const client = createSteadfastClient(courierSettings.steadfast);

        const result = await client.createOrder({
          invoice: order.orderNumber,
          recipient_name: order.customerName || 'Customer',
          recipient_phone: order.customerPhone || '',
          recipient_address: address,
          cod_amount: order.total,
        });
        consignmentId = result.consignment_id;
      } else {
        return json({ error: 'Selected courier not configured' }, { status: 400 });
      }

      // Update order with courier info
      await db
        .update(orders)
        .set({
          courierProvider: provider as 'pathao' | 'redx' | 'steadfast',
          courierConsignmentId: consignmentId,
          courierStatus: 'booked',
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      return json({ success: true, consignmentId });
    } catch (error) {
      console.error('Courier booking error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Booking failed' },
        { status: 500 }
      );
    }
  }

  // ========================================================================
  // FRAUD_CHECK - Check customer fraud risk and auto-confirm if low risk
  // ========================================================================
  if (intent === 'FRAUD_CHECK') {
    if (!orderId) {
      return json({ error: 'Order ID required' }, { status: 400 });
    }

    try {
      // Get order details
      const orderResult = await db
        .select({
          id: orders.id,
          customerPhone: orders.customerPhone,
          status: orders.status,
        })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
        .limit(1);

      if (!orderResult[0]) {
        return json({ error: 'Order not found' }, { status: 404 });
      }

      const order = orderResult[0];

      // Import and use checkCustomerRisk - check across ALL stores (platform-wide)
      const { checkCustomerRisk } = await import('~/services/steadfast.server');
      // Pass undefined for storeId to check across all Ozzyl platform orders
      const riskResult = await checkCustomerRisk(order.customerPhone || '', db);

      return json(
        {
          success: true,
          intent: 'FRAUD_CHECK',
          orderId,
          riskResult: {
            successRate: riskResult.successRate,
            totalOrders: riskResult.totalOrders,
            deliveredOrders: riskResult.deliveredOrders,
            returnedOrders: riskResult.returnedOrders,
            isHighRisk: riskResult.isHighRisk,
            riskScore: riskResult.riskScore,
          },
        },
        {
          headers: {
            'x-order-id': String(orderId),
          },
        }
      );
    } catch (error) {
      console.error('Fraud check error:', error);
      return json(
        {
          error: error instanceof Error ? error.message : 'Fraud check failed',
        },
        { status: 500 }
      );
    }
  }

  // ========================================================================
  // Default: Update order status
  // ========================================================================
  if (!orderId) {
    return json({ error: 'Order ID required' }, { status: 400 });
  }

  const statusRaw = formData.get('status');
  if (!isOrderStatus(statusRaw)) {
    return json({ error: 'Invalid status' }, { status: 400 });
  }
  const status: OrderStatus = statusRaw;

  // Verify order belongs to this store
  const orderResult = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .limit(1);

  const order = orderResult[0];
  if (!order) {
    return json({ error: 'Order not found' }, { status: 404 });
  }

  const previousStatus = (order.status || 'pending') as OrderStatus;
  try {
    assertOrderStatusTransition(previousStatus, status);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Invalid status transition' },
      { status: 400 }
    );
  }

  // Update the order status
  await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

  return json(
    { success: true, orderId, status },
    {
      headers: {
        'x-order-id': String(orderId),
      },
    }
  );
}

// ============================================================================
// STATUS OPTIONS (MOVE KEY TO TRANSLATION AT RENDER TIME)
// ============================================================================
const statusOptionsKeys = [
  { value: 'pending', labelKey: 'dashboard:pending' },
  { value: 'confirmed', labelKey: 'dashboard:confirmed' },
  { value: 'processing', labelKey: 'dashboard:processingOrders' },
  { value: 'shipped', labelKey: 'dashboard:shippedOrders' },
  { value: 'delivered', labelKey: 'dashboard:deliveredOrders' },
  { value: 'cancelled', labelKey: 'dashboard:cancelledOrders' },
  { value: 'returned', labelKey: 'dashboard:returnedOrders' },
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DashboardOrdersPage() {
  const { orders: storeOrders, stats, courierProvider } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useTranslation();

  // Filter state
  const statusFilter = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: t('dashboard:allOrders'), count: stats.total },
    { id: 'pending', label: t('dashboard:pending'), count: stats.pending },
    { id: 'confirmed', label: t('dashboard:confirmed'), count: stats.confirmed },
    { id: 'processing', label: t('dashboard:processingOrders'), count: stats.processing },
    { id: 'shipped', label: t('dashboard:shippedOrders'), count: stats.shipped },
    { id: 'delivered', label: t('dashboard:deliveredOrders'), count: stats.delivered },
    { id: 'cancelled', label: t('dashboard:cancelledOrders'), count: stats.cancelled },
    { id: 'returned', label: t('dashboard:returnedOrders'), count: stats.returned },
  ];

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...storeOrders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          (o.customerName && o.customerName.toLowerCase().includes(query)) ||
          (o.customerPhone && o.customerPhone.includes(query))
      );
    }

    return filtered;
  }, [storeOrders, statusFilter, searchQuery]);

  const handleStatusChange = useCallback(
    (tabId: string) => {
      setSearchParams((prev) => {
        if (tabId === 'all') {
          prev.delete('status');
        } else {
          prev.set('status', tabId);
        }
        return prev;
      });
    },
    [setSearchParams]
  );

  /*
   * Hydration safe date formatting
   * Note: Relative time (e.g. "5 mins ago") causes hydration mismatches because "now" changes
   * between server render and client hydration.
   * For now, we return a stable absolute date format.
   */
  const formatDate = (date: string | Date | null) => {
    if (!date) return '—';
    const d = new Date(date);

    // Stable format for both server and client
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] xl:h-[calc(100vh-64px)] relative -m-4 lg:-m-8">
      {/* Sticky Header / Command Bar */}
      <header className="h-16 border-b border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 md:top-auto">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">{t('dashboard:orders')}</h1>
          {/* Command K Search */}
          <div className="relative group hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
            </div>
            <input 
              role="search"
              aria-label="Search orders"
              className="block w-64 lg:w-96 pl-10 pr-12 py-1.5 border-none rounded-lg bg-gray-100 text-sm placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all" 
              placeholder={t('dashboard:searchByOrderHint')} 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="inline-flex items-center border border-gray-200 rounded px-2 text-[10px] font-sans font-medium text-gray-400">⌘K</kbd>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <Link
            to="/app/returns"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_return</span>
            <span className="hidden sm:inline">{t('dashboard:viewReturnParcels')}</span>
          </Link>
          <Link to="/app/orders/create" className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-emerald-500/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Create Order</span>
          </Link>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth bg-gray-50/50">
        
        {/* KPI Section (Compact) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* KPI 1 - Revenue */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard:totalRevenue')}</span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">{formatPrice(stats.revenue)}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  Active
                </span>
              </div>
              <div className="h-8 w-16 opacity-50 group-hover:opacity-100 transition-opacity">
                {/* Simple CSS Sparkline */}
                <div className="flex items-end h-full gap-0.5 mt-2">
                  <div className="bg-emerald-500/30 w-1/5 h-[40%] rounded-sm"></div>
                  <div className="bg-emerald-500/30 w-1/5 h-[60%] rounded-sm"></div>
                  <div className="bg-emerald-500/30 w-1/5 h-[50%] rounded-sm"></div>
                  <div className="bg-emerald-500/30 w-1/5 h-[80%] rounded-sm"></div>
                  <div className="bg-emerald-500 w-1/5 h-[70%] rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI 2 - Orders */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => handleStatusChange('all')}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard:totalOrders')}</span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats.total}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  All time
                </span>
              </div>
              <div className="h-8 w-16 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="flex items-end h-full gap-0.5 mt-2">
                  <div className="bg-emerald-500/30 w-1/5 h-[30%] rounded-sm"></div>
                  <div className="bg-emerald-500/30 w-1/5 h-[45%] rounded-sm"></div>
                  <div className="bg-emerald-500/30 w-1/5 h-[60%] rounded-sm"></div>
                  <div className="bg-emerald-500/30 w-1/5 h-[55%] rounded-sm"></div>
                  <div className="bg-emerald-500 w-1/5 h-[65%] rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI 3 - Pending */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-orange-50/50 border border-orange-100 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => handleStatusChange('pending')}>
            <span className="text-xs font-medium text-orange-600/80 uppercase tracking-wider flex items-center gap-1">
              {t('dashboard:pending')}
              {stats.pending > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>}
            </span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats.pending}</span>
                <span className="text-xs font-medium text-orange-600 flex items-center gap-0.5 mt-1">
                  Needs Action
                </span>
              </div>
              <div className="h-8 w-16 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="flex items-end h-full gap-0.5 mt-2">
                  <div className="bg-orange-500/30 w-1/5 h-[80%] rounded-sm"></div>
                  <div className="bg-orange-500/30 w-1/5 h-[60%] rounded-sm"></div>
                  <div className="bg-orange-500/30 w-1/5 h-[40%] rounded-sm"></div>
                  <div className="bg-orange-500/30 w-1/5 h-[50%] rounded-sm"></div>
                  <div className="bg-orange-500 w-1/5 h-[45%] rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI 4 - Shipped */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => handleStatusChange('shipped')}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard:shippedOrders')}</span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats.shipped}</span>
                <span className="text-xs font-medium text-blue-600 flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                  In Transit
                </span>
              </div>
              <div className="h-8 w-16 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="flex items-end h-full gap-0.5 mt-2">
                  <div className="bg-blue-500/30 w-1/5 h-[20%] rounded-sm"></div>
                  <div className="bg-blue-500/30 w-1/5 h-[30%] rounded-sm"></div>
                  <div className="bg-blue-500/30 w-1/5 h-[50%] rounded-sm"></div>
                  <div className="bg-blue-500/30 w-1/5 h-[70%] rounded-sm"></div>
                  <div className="bg-blue-500 w-1/5 h-[90%] rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI 5 - Returns & Cancelled */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-red-50/50 border border-red-100 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => handleStatusChange('returned')}>
            <span className="text-xs font-medium text-red-600/80 uppercase tracking-wider">Issues & Returns</span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats.cancelled + stats.returned}</span>
                <span className="text-xs font-medium text-red-600 flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Requires Attention
                </span>
              </div>
              <div className="h-8 w-16 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="flex items-end h-full gap-0.5 mt-2">
                  <div className="bg-red-500/30 w-1/5 h-[10%] rounded-sm"></div>
                  <div className="bg-red-500/30 w-1/5 h-[10%] rounded-sm"></div>
                  <div className="bg-red-500/30 w-1/5 h-[15%] rounded-sm"></div>
                  <div className="bg-red-500/30 w-1/5 h-[20%] rounded-sm"></div>
                  <div className="bg-red-500 w-1/5 h-[40%] rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Toolbar / Filter Row */}
          <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Saved Views */}
              <div className="relative">
                <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
                  {statusFilter === 'all' ? 'All Orders' : statusTabs.find(t => t.id === statusFilter)?.label}
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </button>
              </div>
              
              <div className="h-5 w-px bg-gray-200"></div>
              
              {/* Chip Filters */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                <select 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors border-none cursor-pointer focus:ring-0 appearance-none pr-8 relative"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="all">Status: All</option>
                  {statusTabs.slice(1).map(tab => (
                    <option key={tab.id} value={tab.id}>Status: {tab.label}</option>
                  ))}
                </select>

                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    Search: {searchQuery}
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Pagination / Count */}
            <div className="text-xs text-gray-500 font-medium">
              Showing {filteredOrders.length > 0 ? 1 : 0}-{Math.min(filteredOrders.length, 200)} of {filteredOrders.length}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            {storeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">dataset</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('dashboard:noOrdersYet')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('dashboard:noOrdersDescription')}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4">search_off</span>
                <h3 className="text-lg font-medium text-gray-900">{t('dashboard:noOrdersMatchFilters')}</h3>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    handleStatusChange('all');
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('dashboard:clearFilters')}
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 w-10">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-600/20" />
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard:order')} ID</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard:customer')}</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('dashboard:total')}</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard:status')}</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">Courier</th>
                    <th className="py-3 px-4 border-b border-gray-200 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => {
                    const isErrorState = order.status === 'cancelled' || order.status === 'returned';
                    return (
                    <tr key={order.id} className={`group hover:bg-gray-50 transition-colors ${isErrorState ? 'bg-red-50/30 hover:bg-red-50/50' : ''}`}>
                      <td className="py-3 px-4 w-10">
                        <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-600/20" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`${isErrorState ? 'text-red-500' : 'text-gray-400'} material-symbols-outlined text-[16px]`}>receipt_long</span>
                            <Link to={`/app/orders/${order.id}`} className="font-medium text-emerald-600 text-sm font-sans tabular-nums hover:underline cursor-pointer">
                              {order.orderNumber}
                            </Link>
                          </div>
                          <span className="text-[11px] text-gray-400 ml-6">{formatDate(order.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{order.customerName || 'Customer'}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-sans tabular-nums flex items-center gap-1">
                              {order.customerPhone}
                            </span>
                            {order.customerPhone && (
                              <SteadfastFraudCheckButton customerPhone={order.customerPhone} />
                            )}
                          </div>
                          {order.displayAddress && (
                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 w-[180px] truncate" title={order.displayAddress}>
                              {order.displayAddress}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900 font-sans tabular-nums">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'COD'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusDropdown
                          orderId={order.id}
                          currentStatus={order.status || 'pending'}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                           {courierProvider && order.status === 'confirmed' && !['booked', 'in_transit', 'delivered', 'shipped'].includes(order.courierStatus || '') ? (
                              <div className="opacity-60 xl:opacity-100 group-hover:opacity-100 transition-opacity">
                                <SendToCourierButton
                                  orderId={order.id}
                                  orderNumber={order.orderNumber}
                                  status={order.status || 'pending'}
                                  courierStatus={order.courierStatus}
                                  courierProvider={courierProvider}
                                />
                              </div>
                           ) : courierProvider ? (
                             <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                               {courierProvider.charAt(0).toUpperCase() + courierProvider.slice(1)}
                               {order.courierConsignmentId ? `: ${order.courierConsignmentId}` : ''}
                             </span>
                           ) : (
                             <span className="text-[11px] text-gray-400 italic font-medium">Not configured</span>
                           )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                         <div className="flex items-center justify-end gap-2">
                           <FraudCheckButton
                              orderId={order.id}
                              currentStatus={order.status || 'pending'}
                           />
                           <Link to={`/app/orders/${order.id}`} className="text-gray-400 hover:text-emerald-600 transition-colors" title="View Details">
                             <span className="material-symbols-outlined text-[20px]">visibility</span>
                           </Link>
                         </div>
                      </td>
                    </tr>
                   );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Footer / Bulk Actions */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between text-xs text-gray-500 mt-auto">
            <div>
              <span className="font-medium">0 rows selected</span>
              <span className="mx-2 text-gray-300">|</span>
              <button className="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50" disabled>Bulk Edit</button>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50 shadow-sm" disabled>Prev</button>
              <button className="px-2 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50 shadow-sm" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS DROPDOWN COMPONENT
// ============================================================================
function StatusDropdown({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== 'idle';

  // Determine the displayed status (optimistic update)
  const displayStatus = fetcher.formData
    ? (fetcher.formData.get('status') as string)
    : currentStatus;

  const configs: Record<string, { icon: typeof Clock; bg: string; text: string; border: string }> =
    {
      pending: {
        icon: Clock,
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      },
      confirmed: {
        icon: ThumbsUp,
        bg: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-200',
      },
      processing: {
        icon: Package,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      },
      shipped: {
        icon: Truck,
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
      },
      delivered: {
        icon: CheckCircle,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      },
      cancelled: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      returned: {
        icon: PackageX,
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      },
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
          {statusOptionsKeys.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
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



// ============================================================================
// FRAUD CHECK BUTTON COMPONENT
// ============================================================================
interface FraudCheckResult {
  successRate: number;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  isHighRisk: boolean;
}

function FraudCheckButton({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const { t } = useTranslation();
  const fetcher = useFetcher<{
    success?: boolean;
    riskResult?: FraudCheckResult;
    error?: string;
  }>();
  const [showResult, setShowResult] = useState(false);
  const isChecking = fetcher.state !== 'idle';

  // Only show for pending orders (most useful for pending)
  const showButton = ['pending', 'confirmed'].includes(currentStatus);

  const handleCheck = () => {
    fetcher.submit({ intent: 'FRAUD_CHECK', orderId: String(orderId) }, { method: 'POST' });
    setShowResult(true);
  };

  // If we have a result
  if (fetcher.data?.success && showResult) {
    const result = fetcher.data.riskResult!;
    const successColor =
      result.successRate >= 80
        ? 'bg-green-100 text-green-700 border-green-200'
        : result.successRate >= 50
          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
          : 'bg-red-100 text-red-700 border-red-200';

    return (
      <div className="flex items-center gap-1">
        <span className={`text-xs px-2 py-1 rounded-full border ${successColor} font-medium`}>
          {result.successRate}% ({result.deliveredOrders}/{result.totalOrders})
        </span>
      </div>
    );
  }

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={handleCheck}
      disabled={isChecking}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 hover:text-white hover:bg-orange-500 border border-orange-200 hover:border-orange-500 rounded-lg transition disabled:opacity-50"
      title={t('checkFraud')}
    >
      {isChecking ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Shield className="w-3.5 h-3.5" />
      )}
      {t('dashboard:check')}
    </button>
  );
}

// ============================================================================
// STEADFAST EXTERNAL FRAUD CHECK BUTTON COMPONENT
// ============================================================================
function SteadfastFraudCheckButton({ customerPhone }: { customerPhone: string }) {
  const fetcher = useFetcher<{
    success?: boolean;
    data?: { success: number; cancellation: number };
    error?: string;
  }>();
  const [showResult, setShowResult] = useState(false);
  const isChecking = fetcher.state !== 'idle';

  const handleCheck = () => {
    // We send this to the Steadfast courier API route instead of the current page action
    fetcher.submit(
      { intent: 'CHECK_EXTERNAL_FRAUD', phone: customerPhone },
      { method: 'POST', action: '/api/courier/steadfast' }
    );
    setShowResult(true);
  };

  if (fetcher.data?.success && fetcher.data.data && showResult) {
    const { success, cancellation } = fetcher.data.data;
    const total = success + cancellation;
    
    // Steadfast high risk logic: more than 30% cancellation (if there's enough history)
    const isRisky = total > 0 && (cancellation / total) > 0.3;
    
    return (
      <span 
        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap ${
          isRisky 
            ? 'bg-red-50 text-red-600 border-red-200' 
            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}
        title={`Steadfast: ${success} Delivered, ${cancellation} Cancelled`}
      >
        SF: {success}/{total} {isRisky && '⚠️'}
      </span>
    );
  }

  if (fetcher.data?.error && showResult) {
     return (
       <span className="text-[10px] text-red-500 truncate max-w-[100px]" title={fetcher.data.error}>
         Error SF
       </span>
     );
  }

  return (
    <button
      type="button"
      onClick={handleCheck}
      disabled={isChecking}
      className="inline-flex items-center text-[10px] text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
      title="Check Steadfast History"
    >
      {isChecking ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span className="material-symbols-outlined text-[14px]">public</span>
      )}
    </button>
  );
}

// ============================================================================
// SEND TO COURIER BUTTON COMPONENT
// ============================================================================
function SendToCourierButton({ 
  orderId, 
  orderNumber,
  status, 
  courierStatus,
  courierProvider 
}: { 
  orderId: number; 
  orderNumber: string;
  status: string; 
  courierStatus?: string | null;
  courierProvider: string;
}) {
  const { t } = useTranslation();
  const fetcher = useFetcher<{
    success?: boolean;
    error?: string;
    consignmentId?: string;
  }>();

  const isSubmitting = fetcher.state !== 'idle';
  const isBooked = courierStatus === 'booked' || courierStatus === 'in_transit' || courierStatus === 'delivered' || courierStatus === 'shipped';
  
  // Show button only if status is valid for booking (e.g. confirmed) and not already booked
  if (status !== 'confirmed') return null;
  
  // If already booked, show status badge
  if (isBooked) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg">
        <Truck className="w-3.5 h-3.5" />
        {courierStatus === 'booked' ? t('booked') : courierStatus}
      </span>
    );
  }

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="bookCourier" />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="provider" value={courierProvider} />
      
      <button
        type="submit"
        disabled={isSubmitting}
        onClick={(e) => {
          if (!confirm(t('dashboard:confirmSendToCourier', { orderNumber, courierProvider }))) {
            e.preventDefault();
          }
        }}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 rounded-lg transition disabled:opacity-50 shadow-sm"
        title={`Send to ${courierProvider}`}
      >
        {isSubmitting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Truck className="w-3.5 h-3.5" />
        )}
        {t('courierSend')}
      </button>
    </fetcher.Form>
  );
}

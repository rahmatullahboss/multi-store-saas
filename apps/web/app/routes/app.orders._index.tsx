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
import { useLoaderData, Link, useSearchParams, useFetcher, useRevalidator, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, stores, products } from '@db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
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
  Search,
  UndoDot,
  Plus,
  TrendingUp,
  AlertTriangle,
  X,
  Database,
  SearchX,
  Receipt,
  Eye,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { type OrderStatus, assertOrderStatusTransition, isOrderStatus } from '~/lib/orderStatus';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import { ozzylGuardCacheKey, fetchAndCacheGuardData } from '~/services/fraud-engine.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Orders - Merchant Dashboard' }];
};

// ============================================================================
// LOADER - Fetch orders for the merchant's store
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'orders',
  });

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
        const parsed =
          typeof o.shippingAddress === 'string' && o.shippingAddress.startsWith('{')
            ? JSON.parse(o.shippingAddress)
            : null;
        if (parsed && typeof parsed === 'object') {
          // JSON object: extract address, upazila, district/city
          // Prioritize: Address, Upazila, District
          const parts = [parsed.address, parsed.upazila, parsed.district || parsed.city].filter(
            Boolean
          );
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

  // Read courier provider from unified settings (single source of truth)
  let courierProvider: string | null = null;
  let allCouriers: string[] = [];
  try {
    const unified = await getUnifiedStorefrontSettings(db, storeId, {
      env: context.cloudflare.env,
    });
    courierProvider = unified.courier?.provider || null;
    if (unified.courier?.pathao) allCouriers.push('pathao');
    if (unified.courier?.redx) allCouriers.push('redx');
    if (unified.courier?.steadfast) allCouriers.push('steadfast');
  } catch {
    courierProvider = null;
  }

  // Ensure unique couriers
  allCouriers = Array.from(new Set(allCouriers));
  if (allCouriers.length === 0 && courierProvider) {
    allCouriers.push(courierProvider);
  }

  // Calculate daily stats for the last 5 days
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(now.getDate() - 4);

  const dailyStats = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(fiveDaysAgo);
    d.setDate(fiveDaysAgo.getDate() + i);
    return {
      date: d,
      total: 0,
      revenue: 0,
      pending: 0,
      shipped: 0,
      issues: 0,
    };
  });

  storeOrders.forEach((o) => {
    if (!o.createdAt) return;
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const diffTime = d.getTime() - fiveDaysAgo.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 4) {
      dailyStats[diffDays].total++;
      if (o.status !== 'cancelled' && o.status !== 'returned') {
        dailyStats[diffDays].revenue += o.total;
      }
      if (o.status === 'pending') dailyStats[diffDays].pending++;
      if (o.status === 'shipped') dailyStats[diffDays].shipped++;
      if (o.status === 'returned' || o.status === 'cancelled') dailyStats[diffDays].issues++;
    }
  });

  // === BULK LOAD FRAUD CACHE FROM KV ===
  // Read previously cached Steadfast fraud results for all unique phones in this order list
  const fraudCacheByPhone: Record<
    string,
    {
      successRate: number;
      totalOrders: number;
      deliveredOrders: number;
      returnedOrders: number;
      isHighRisk: boolean;
      riskScore: number;
      cachedAt: string;
    }
  > = {};

  try {
    const kv = context.cloudflare.env.STORE_CACHE;
    if (kv) {
      const uniquePhones = [
        ...new Set(ordersWithAddress.map((o) => o.customerPhone).filter((p): p is string => !!p)),
      ];

      // Fetch in parallel (up to 20 unique phones at a time to avoid overloading)
      const phoneSlice = uniquePhones.slice(0, 40);
      const cacheResults = await Promise.all(
        phoneSlice.map((phone) =>
          kv
            .get(ozzylGuardCacheKey(storeId, phone), 'json')
            .then((val) => ({ phone, val }))
            .catch(() => ({ phone, val: null }))
        )
      );

      for (const { phone, val } of cacheResults) {
        if (val) {
          fraudCacheByPhone[phone] = val as (typeof fraudCacheByPhone)[string];
        }
      }
    }
  } catch (e) {
    // Non-blocking — fraud cache is optional display data
    console.warn('[FRAUD CACHE] Bulk KV read failed:', e);
  }

  // Fetch order items for all orders (with product image)
  const orderIds = storeOrders.map((o) => o.id);
  let itemsByOrderId: Record<number, Array<{ title: string; quantity: number; imageUrl: string | null }>> = {};
  if (orderIds.length > 0) {
    try {
      const allItems = await db
        .select({
          orderId: orderItems.orderId,
          title: orderItems.title,
          quantity: orderItems.quantity,
          imageUrl: products.imageUrl,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.orderId, orderIds));

      for (const item of allItems) {
        if (!itemsByOrderId[item.orderId]) itemsByOrderId[item.orderId] = [];
        itemsByOrderId[item.orderId].push({
          title: item.title,
          quantity: item.quantity,
          imageUrl: item.imageUrl ?? null,
        });
      }
    } catch { /* ignore */ }
  }

  // Attach cached fraud data to each order
  const ordersWithFraud = ordersWithAddress.map((o) => ({
    ...o,
    fraudCache: o.customerPhone ? (fraudCacheByPhone[o.customerPhone] ?? null) : null,
    items: itemsByOrderId[o.id] ?? [],
  }));

  return json({
    orders: ordersWithFraud,
    storeName: store.name,
    currency: store.currency || 'BDT',
    stats: { ...stats, dailyStats },
    courierProvider,
    allCouriers,
  });
}

// ============================================================================
// ACTION - Update order status inline + Fraud Check
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'orders',
  });

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

    // Get courier settings from unified settings (single source of truth)
    const unified = await getUnifiedStorefrontSettings(db, storeId, {
      env: context.cloudflare.env,
    });
    const courierSettings = unified.courier;
    if (!courierSettings) {
      return json(
        { error: 'Courier not configured. Go to Settings > Courier to connect.' },
        { status: 400 }
      );
    }
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
          ]
            .filter(Boolean)
            .join(', ');
          address =
            fullAddress || (typeof order.shippingAddress === 'string' ? order.shippingAddress : '');
        } catch {
          address = typeof order.shippingAddress === 'string' ? order.shippingAddress : '';
        }
      }
      // Pathao requires at least 10 characters
      if (!address) address = 'Dhaka, Bangladesh';

      if (provider === 'pathao' && courierSettings.pathao) {
        const { createPathaoClient } = await import('~/services/pathao.server');
        const client = createPathaoClient({
          clientId: courierSettings.pathao.clientId || '',
          clientSecret: courierSettings.pathao.clientSecret || '',
          username: courierSettings.pathao.username || '',
          password: courierSettings.pathao.password || '',
          baseUrl: courierSettings.pathao.baseUrl || undefined,
        });
        const configuredStoreId = Number(courierSettings.pathao.defaultStoreId);
        if (!Number.isInteger(configuredStoreId) || configuredStoreId <= 0) {
          return json(
            { error: 'Pathao default store ID is missing. Please set it in Courier Settings.' },
            { status: 400 }
          );
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
          recipient_address:
            address.length >= 10
              ? address
              : address
                ? address.padEnd(10, ' ').trim()
                : 'Dhaka, Bangladesh',
          delivery_type: 48,
          item_type: 2,
          item_quantity: 1,
          item_weight: pathaoItemWeight, // Calculated from product metafields (min 0.5 kg)
          amount_to_collect: Math.round(order.total),
        });
        consignmentId = result.consignment_id;
      } else if (provider === 'redx' && courierSettings.redx) {
        const { createRedXClient } = await import('~/services/redx.server');
        const client = createRedXClient({
          accessToken: courierSettings.redx.apiKey || '',
          baseUrl: courierSettings.redx.baseUrl || '',
        });

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
        const client = createSteadfastClient({
          apiKey: courierSettings.steadfast.apiKey || '',
          secretKey: courierSettings.steadfast.secretKey || '',
        });

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
  // FRAUD_CHECK - Check customer fraud risk via fraudchecker.link (Pathao + Steadfast + RedX)
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
      const phoneForCheck = order.customerPhone || '';

      if (!phoneForCheck) {
        return json({ error: 'No phone number on this order' }, { status: 400 });
      }

      const kv = context.cloudflare.env.STORE_CACHE;
      const forceRefresh = formData.get('forceRefresh') === 'true';

      // ── If forceRefresh, delete cache so fetchAndCacheGuardData re-fetches ──
      if (forceRefresh && kv) {
        try {
          await kv.delete(ozzylGuardCacheKey(storeId, phoneForCheck));
        } catch { /* ignore */ }
      }

      // ── fetchAndCacheGuardData: reads KV first, then fetches live, saves to KV ──
      const resultObj = await fetchAndCacheGuardData(phoneForCheck, storeId, kv);

      if (!resultObj) {
        return json({ error: 'ফ্রড চেক ব্যর্থ হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।' }, { status: 502 });
      }

      return json(
        { success: true, intent: 'FRAUD_CHECK', orderId, riskResult: { ...resultObj, fromCache: false } },
        { headers: { 'x-order-id': String(orderId) } }
      );
    } catch (error) {
      console.error('Fraud check error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Fraud check failed' },
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
  const {
    orders: storeOrders,
    stats,
    courierProvider,
    allCouriers = [],
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useTranslation();

  // Filter state
  const statusFilter = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'safe' | 'good' | 'moderate' | 'high' | 'critical' | 'unchecked'>('all');
  const mobileCourierFetcher = useFetcher();
  const [dateFilter, setDateFilter] = useState('');
  const [displayedCount, setDisplayedCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

    // Apply risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter((o) => {
        const fc = 'fraudCache' in o ? (o as { fraudCache: { successRate: number } | null }).fraudCache : null;
        if (!fc) return riskFilter === 'unchecked';
        const rate = fc.successRate ?? 0;
        if (riskFilter === 'safe') return rate >= 80;
        if (riskFilter === 'good') return rate >= 60 && rate < 80;
        if (riskFilter === 'moderate') return rate >= 40 && rate < 60;
        if (riskFilter === 'high') return rate >= 20 && rate < 40;
        if (riskFilter === 'critical') return rate < 20;
        return true;
      });
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter((o) => {
        const raw = o.createdAt;
        const orderDate = new Date(typeof raw === 'string' ? raw : String(raw)).toISOString().split('T')[0];
        return orderDate === dateFilter;
      });
    }

    return filtered;
  }, [storeOrders, statusFilter, searchQuery, riskFilter, dateFilter]);

  // Reset displayed count when filters change
  useEffect(() => { setDisplayedCount(10); }, [statusFilter, searchQuery, riskFilter, dateFilter]);

  // Infinite scroll — load 10 more when sentinel comes into view
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => prev + 10);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [filteredOrders.length]);

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

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => setIsHydrated(true), []);

  /*
   * Hydration safe date formatting
   * Note: Relative time (e.g. "5 mins ago") causes hydration mismatches because "now" changes
   * between server render and client hydration.
   * For now, we return a stable absolute date format once the client hydrates.
   */
  const formatDate = (date: string | Date | null) => {
    if (!date || !isHydrated) return '—';
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

  const maxRevenue = Math.max(...(stats.dailyStats?.map((s: any) => s.revenue) || [1]), 1);
  const maxOrders = Math.max(...(stats.dailyStats?.map((s: any) => s.total) || [1]), 1);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] xl:h-[calc(100vh-64px)] relative -m-4 lg:-m-8">
      {/* Sticky Header / Command Bar */}
      <header className="h-16 border-b border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 md:top-auto">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            {t('dashboard:orders')}
          </h1>
          {/* Command K Search */}
          <div className="relative group hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
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
              <kbd className="inline-flex items-center border border-gray-200 rounded px-2 text-[10px] font-sans font-medium text-gray-400">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <Link
            to="/app/returns"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg border border-transparent"
          >
            <UndoDot className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">{t('dashboard:viewReturnParcels')}</span>
          </Link>
          <Link
            to="/app/orders/create"
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm shadow-emerald-500/20"
          >
            <Plus className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">{t('dashboard:createOrder')}</span>
          </Link>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth bg-gray-50">
        {/* KPI Section (Compact) — Desktop only */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 mb-8">
          {/* KPI 1 - Revenue */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard:totalRevenue')}
            </span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatPrice(stats.revenue)}
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 mt-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t('dashboard:active')}
                </span>
              </div>
              <div className="h-8 w-16 opacity-50 group-hover:opacity-100 transition-opacity flex items-end justify-end">
                <div className="flex items-end h-full gap-0.5 mt-2 w-full">
                  {stats.dailyStats?.map((s: any, i: number) => (
                    <div
                      key={i}
                      className={`w-1/5 rounded-sm ${i === 4 ? 'bg-emerald-500' : 'bg-emerald-500/30'}`}
                      style={{ height: `${Math.max((s.revenue / maxRevenue) * 100, 15)}%` }}
                      title={`${formatDate(s.date)}: ${formatPrice(s.revenue)}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KPI 2 - Orders */}
          <div
            className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleStatusChange('all')}
          >
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard:totalOrders')}
            </span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats.total}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 mt-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t('dashboard:allTime')}
                </span>
              </div>
              <div className="h-8 w-16 opacity-50 group-hover:opacity-100 transition-opacity flex items-end justify-end">
                <div className="flex items-end h-full gap-0.5 mt-2 w-full">
                  {stats.dailyStats?.map((s: any, i: number) => (
                    <div
                      key={i}
                      className={`w-1/5 rounded-sm ${i === 4 ? 'bg-emerald-500' : 'bg-emerald-500/30'}`}
                      style={{ height: `${Math.max((s.total / maxOrders) * 100, 15)}%` }}
                      title={`${formatDate(s.date)}: ${s.total} orders`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KPI 3 - Pending */}
          <div
            className="flex flex-col gap-1 p-3 rounded-xl bg-orange-50/50 border border-orange-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleStatusChange('pending')}
          >
            <span className="text-xs font-medium text-orange-600/80 uppercase tracking-wider flex items-center gap-1">
              {t('dashboard:pending')}
              {stats.pending > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              )}
            </span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {stats.pending}
                </span>
                <span className="text-xs font-medium text-orange-600 flex items-center gap-0.5 mt-1">
                  {t('dashboard:needsAction')}
                </span>
              </div>
              <div className="w-16 flex flex-col items-end justify-end h-8 opacity-100 pb-1">
                <div className="w-full bg-orange-200/50 rounded-full h-1.5">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full"
                    style={{
                      width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-orange-600 font-medium mt-1">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* KPI 4 - Shipped */}
          <div
            className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleStatusChange('shipped')}
          >
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard:shippedOrders')}
            </span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {stats.shipped}
                </span>
                <span className="text-xs font-medium text-blue-600 flex items-center gap-0.5 mt-1">
                  <Truck className="h-3.5 w-3.5" />
                  {t('dashboard:inTransit')}
                </span>
              </div>
              <div className="w-16 flex flex-col items-end justify-end h-8 opacity-70 group-hover:opacity-100 transition-opacity pb-1">
                <div className="w-full bg-blue-200/50 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{
                      width: `${stats.total > 0 ? (stats.shipped / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-blue-600 font-medium mt-1">
                  {stats.total > 0 ? Math.round((stats.shipped / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* KPI 5 - Returns & Cancelled */}
          <div
            className="flex flex-col gap-1 p-3 rounded-xl bg-red-50/50 border border-red-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleStatusChange('returned')}
          >
            <span className="text-xs font-medium text-red-600/80 uppercase tracking-wider">
              {t('dashboard:issuesAndReturns')}
            </span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {stats.cancelled + stats.returned}
                </span>
                <span className="text-xs font-medium text-red-600 flex items-center gap-0.5 mt-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t('dashboard:requiresAttention')}
                </span>
              </div>
              <div className="w-16 flex flex-col items-end justify-end h-8 opacity-70 group-hover:opacity-100 transition-opacity pb-1">
                <div className="w-full bg-red-200/50 rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{
                      width: `${stats.total > 0 ? ((stats.cancelled + stats.returned) / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-red-600 font-medium mt-1">
                  {stats.total > 0
                    ? Math.round(((stats.cancelled + stats.returned) / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
          {/* Toolbar / Filter Row */}
          <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Chip Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border-none cursor-pointer focus:ring-0 appearance-none pr-8 relative"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="all">Status: All</option>
                  {statusTabs.slice(1).map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      Status: {tab.label}
                    </option>
                  ))}
                </select>

                <select
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border-none cursor-pointer focus:ring-0 appearance-none pr-8 relative"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="all">Risk: All</option>
                  <option value="safe">Risk: Safe (≥80%)</option>
                  <option value="good">Risk: Good (60-79%)</option>
                  <option value="moderate">Risk: Moderate (40-59%)</option>
                  <option value="high">Risk: High (20-39%)</option>
                  <option value="critical">Risk: Critical (&lt;20%)</option>
                  <option value="unchecked">Risk: Unchecked</option>
                </select>

                {/* Date filter — same line as other filters */}
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border-none cursor-pointer focus:ring-0 outline-none"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter('')}
                      className="text-[10px] text-gray-400 hover:text-red-500 font-bold leading-none"
                    >✕</button>
                  )}
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-xs font-medium text-emerald-700  border border-emerald-200"
                  >
                    Search: {searchQuery}
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Mobile Stats Summary — visible only on mobile */}
          {/* Mobile KPI — compact 2-col grid */}
          <div className="md:hidden px-3 pt-2 pb-1.5 grid grid-cols-4 gap-1.5">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-white border border-slate-100 shadow-sm cursor-pointer active:scale-95 col-span-2" onClick={() => handleStatusChange('all')}>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard:totalRevenue')}</span>
              <span className="text-base font-bold text-slate-900 tabular-nums leading-tight">{formatPrice(stats.revenue)}</span>
              <span className="text-[9px] text-emerald-600 font-medium">{t('dashboard:active')}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-white border border-slate-100 shadow-sm cursor-pointer active:scale-95 col-span-2" onClick={() => handleStatusChange('all')}>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard:totalOrders')}</span>
              <span className="text-base font-bold text-slate-900 tabular-nums leading-tight">{stats.total}</span>
              <span className="text-[9px] text-emerald-600 font-medium">{t('dashboard:allTime')}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-orange-50 border border-orange-100 shadow-sm cursor-pointer active:scale-95" onClick={() => handleStatusChange('pending')}>
              <span className="text-[9px] font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-0.5">
                {stats.pending > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block"></span>}
                {t('dashboard:pending')}
              </span>
              <span className="text-base font-bold text-slate-900 tabular-nums leading-tight">{stats.pending}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-blue-50 border border-blue-100 shadow-sm cursor-pointer active:scale-95" onClick={() => handleStatusChange('shipped')}>
              <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wider">Shipped</span>
              <span className="text-base font-bold text-slate-900 tabular-nums leading-tight">{stats.shipped}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-red-50 border border-red-100 shadow-sm cursor-pointer active:scale-95 col-span-2" onClick={() => handleStatusChange('returned')}>
              <span className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">{t('dashboard:issuesAndReturns')}</span>
              <span className="text-base font-bold text-slate-900 tabular-nums leading-tight">{stats.cancelled + stats.returned}</span>
            </div>
          </div>

          {/* Mobile Status Pills — horizontal scroll, no scrollbar */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto px-3 py-1.5 bg-white border-b border-slate-100" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {[{id: 'all', label: 'All'}, ...statusTabs.slice(1)].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
                className={`flex-none px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {tab.label}
                {tab.id !== 'all' && (tab as typeof tab & {count?: number}).count != null && (tab as typeof tab & {count?: number}).count! > 0 && (
                  <span className={`ml-1 ${statusFilter === tab.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {(tab as typeof tab & {count?: number}).count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Search + Filters */}
          <div className="md:hidden px-3 py-2 bg-white flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                role="search"
                aria-label="Search orders"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 text-xs placeholder-slate-400 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white outline-none"
                placeholder={t('dashboard:searchByOrderHint')}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5 items-center">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="flex-1 min-w-0 text-[11px] border border-slate-200 rounded-lg py-1.5 px-2 bg-white text-slate-600 focus:ring-1 focus:ring-emerald-500/20 outline-none"
              >
                <option value="all">Status: All</option>
                {statusTabs.slice(1).map((tab) => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
                className="flex-1 min-w-0 text-[11px] border border-slate-200 rounded-lg py-1.5 px-2 bg-white text-slate-600 focus:ring-1 focus:ring-emerald-500/20 outline-none"
              >
                <option value="all">Risk: All</option>
                <option value="safe">Safe (≥80%)</option>
                <option value="good">Good (60–79%)</option>
                <option value="moderate">Moderate (40–59%)</option>
                <option value="high">High (20–39%)</option>
                <option value="critical">Critical (&lt;20%)</option>
                <option value="unchecked">Unchecked</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 min-w-0 text-[11px] border border-slate-200 rounded-lg py-1.5 px-2 bg-white text-slate-600 focus:ring-1 focus:ring-emerald-500/20 outline-none"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-slate-400 hover:text-red-500 font-bold leading-none flex-shrink-0"
                >✕</button>
              )}
            </div>
          </div>

          {/* Table / Card List */}
          <div className="flex-1 overflow-visible bg-slate-100" data-theme="light">
            {storeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('dashboard:noOrdersYet')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('dashboard:noOrdersDescription')}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <SearchX className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  {t('dashboard:noOrdersMatchFilters')}
                </h3>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    handleStatusChange('all');
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium"
                >
                  {t('dashboard:clearFilters')}
                </button>
              </div>
            ) : (
              <>
                {/* ===== MOBILE CARD VIEW ===== */}
                <div className="md:hidden space-y-2 p-3 pb-24">
                  {filteredOrders.slice(0, displayedCount).map((order) => {
                    // ── Left bar color based on fraud cache or status ──
                    const fc = ('fraudCache' in order
                      ? (order as { fraudCache: { successRate: number; totalOrders: number; isHighRisk: boolean; cachedAt: string } | null }).fraudCache
                      : null);

                    const fraudBarColor = fc
                      ? fc.successRate >= 80
                        ? 'bg-emerald-500'
                        : fc.successRate >= 60
                          ? 'bg-green-500'
                          : fc.successRate >= 40
                            ? 'bg-amber-400'
                            : fc.successRate >= 20
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      : order.status === 'delivered'
                        ? 'bg-emerald-500'
                        : order.status === 'cancelled' || order.status === 'returned'
                          ? 'bg-red-500'
                          : order.status === 'shipped'
                            ? 'bg-indigo-400'
                            : 'bg-slate-300';

                    const fraudSuccessText = fc
                      ? fc.successRate >= 80
                        ? { color: 'text-emerald-600', text: `${fc.successRate.toFixed(0)}% Success` }
                        : fc.successRate >= 60
                          ? { color: 'text-green-600', text: `${fc.successRate.toFixed(0)}% Success` }
                          : fc.successRate >= 40
                            ? { color: 'text-amber-600', text: `${fc.successRate.toFixed(0)}% Success` }
                            : fc.successRate >= 20
                              ? { color: 'text-orange-600', text: `${fc.successRate.toFixed(0)}% Success` }
                              : { color: 'text-red-600', text: `${fc.successRate.toFixed(0)}% Success` }
                      : null;

                    const orderItemsMobile = (order as typeof order & { items: Array<{title: string; quantity: number; imageUrl: string | null}> }).items ?? [];
                    const firstItem = orderItemsMobile[0] ?? null;

                    const statusBadgeColors: Record<string, string> = {
                      pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-700/20',
                      confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
                      processing: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
                      shipped: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
                      delivered: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-700/20',
                      cancelled: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-700/10',
                      returned: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/20',
                    };

                    const paymentLabel = order.paymentStatus === 'paid'
                      ? { label: 'bKash', cls: 'bg-emerald-50 text-emerald-600' }
                      : { label: 'COD', cls: 'bg-slate-100 text-slate-600' };

                    return (
                      <Link
                        key={order.id}
                        to={`/app/orders/${order.id}`}
                        className="relative bg-white rounded-xl border border-slate-100 overflow-hidden block pl-[5px]"
                        style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05), 0 1px 4px -1px rgba(0,0,0,0.03)' }}
                      >
                        {/* Left color bar based on fraud success rate */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[5px] rounded-l-xl ${
                          fc
                            ? fc.successRate >= 80 ? 'bg-emerald-500'
                              : fc.successRate >= 60 ? 'bg-green-400'
                              : fc.successRate >= 40 ? 'bg-amber-400'
                              : fc.successRate >= 20 ? 'bg-orange-400'
                              : 'bg-red-500'
                            : order.status === 'delivered' ? 'bg-emerald-400'
                            : order.status === 'cancelled' || order.status === 'returned' ? 'bg-red-400'
                            : order.status === 'shipped' ? 'bg-blue-400'
                            : 'bg-slate-200'
                        }`} />
                        {/* Stitch design: no left bar, card header instead */}
                        <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100/30">
                          <div className="flex flex-col">
                            <Link to={`/app/orders/${order.id}`} className="text-sm font-bold text-slate-900">
                              #{order.orderNumber}
                            </Link>
                            <span className="text-[10px] text-slate-400">{formatDate(order.createdAt)}</span>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeColors[order.status || 'pending'] || 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10'}`}>
                            {order.status === 'pending' ? 'Pending'
                              : order.status === 'confirmed' ? 'Confirmed'
                              : order.status === 'processing' ? 'Processing'
                              : order.status === 'shipped' ? 'Shipped'
                              : order.status === 'delivered' ? 'Delivered'
                              : order.status === 'cancelled' ? 'Cancelled'
                              : order.status === 'returned' ? 'Returned'
                              : order.status}
                          </span>
                        </div>

                        {/* Card body — Stitch design */}
                        <div className="p-3">
                          <div className="flex gap-3 mb-3">
                            {/* Product image */}
                            {firstItem?.imageUrl ? (
                              <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                <img src={firstItem.imageUrl} alt={firstItem.title} className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <Package className="h-5 w-5 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                                {firstItem?.title || t('dashboard:noProducts')}
                              </h3>
                              <div className="mt-1 flex items-center text-xs text-slate-500 gap-1.5 flex-wrap">
                                <span className="truncate">{order.customerName || '—'}</span>
                                {order.customerPhone && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-medium text-slate-600">{order.customerPhone}</span>
                                  </>
                                )}
                              </div>
                              {/* Fraud badge */}
                              {fc && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                                    fc.successRate >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    fc.successRate >= 60 ? 'bg-green-50 text-green-700 border-green-100' :
                                    fc.successRate >= 40 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    fc.successRate >= 20 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                  }`}>
                                    {fc.successRate}% Success
                                  </div>
                                  {fc.totalOrders > 0 && (
                                    <span className="text-[10px] text-slate-400">Total {fc.totalOrders} orders</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Price + payment */}
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-bold text-slate-900">{formatPrice(order.total)}</div>
                              {order.courierCharge ? (
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Courier: {formatPrice(order.courierCharge / 100)}
                                </div>
                              ) : null}
                              <div className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${paymentLabel.cls}`}>
                                {paymentLabel.label}
                              </div>
                            </div>
                          </div>

                          {/* Bottom: fraud check + courier send — always show */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            {/* Left: fraud check button (only if unchecked & actionable status) */}
                            {!fc && ['pending', 'confirmed', 'processing'].includes(order.status || '') ? (
                              <MobileFraudCheckButton orderId={order.id} currentStatus={order.status || 'pending'} />
                            ) : (
                              <div />
                            )}
                            {/* Right: courier logic */}
                            {order.courierConsignmentId ? (
                              // Already booked → show courier name with checkmark
                              <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                                <Truck className="h-3 w-3" /> {order.courierProvider} ✓
                              </span>
                            ) : order.status === 'confirmed' && allCouriers.length > 0 ? (
                              // Confirmed + courier setup → show send button
                              <mobileCourierFetcher.Form method="post" onClick={(e: React.MouseEvent) => e.stopPropagation()} className="flex items-center gap-1.5">
                                <input type="hidden" name="intent" value="BOOK_COURIER" />
                                <input type="hidden" name="orderId" value={order.id} />
                                {allCouriers.length === 1 ? (
                                  <>
                                    <input type="hidden" name="courierProvider" value={allCouriers[0]} />
                                    <span className="text-[10px] text-slate-500">{allCouriers[0].charAt(0).toUpperCase() + allCouriers[0].slice(1)}</span>
                                  </>
                                ) : (
                                  <select
                                    name="courierProvider"
                                    onClick={(e: React.MouseEvent<HTMLSelectElement>) => e.stopPropagation()}
                                    className="text-[10px] border border-slate-200 rounded-md py-1 px-1.5 bg-white text-slate-600 outline-none"
                                    defaultValue={allCouriers[0]}
                                  >
                                    {allCouriers.map((c) => (
                                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                    ))}
                                  </select>
                                )}
                                <button
                                  type="submit"
                                  disabled={mobileCourierFetcher.state !== 'idle'}
                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-semibold whitespace-nowrap"
                                >
                                  <Truck className="h-3 w-3" />
                                  {mobileCourierFetcher.state !== 'idle' ? '...' : 'Send'}
                                </button>
                              </mobileCourierFetcher.Form>
                            ) : order.status === 'confirmed' && allCouriers.length === 0 ? (
                              // Confirmed but no courier setup → prompt to set up
                              <Link
                                to="/app/settings/courier"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                className="text-[10px] text-blue-500 flex items-center gap-1 font-medium"
                              >
                                <Truck className="h-3 w-3" /> কুরিয়ার সেটআপ করুন
                              </Link>
                            ) : (
                              <div />
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {/* Infinite scroll sentinel */}
                  {displayedCount < filteredOrders.length && (
                    <div ref={loadMoreRef} className="flex justify-center py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        লোড হচ্ছে...
                      </div>
                    </div>
                  )}
                  {displayedCount >= filteredOrders.length && filteredOrders.length > 0 && (
                    <div className="text-center text-[10px] text-slate-300 py-3">
                      সব {filteredOrders.length}টি অর্ডার দেখানো হয়েছে
                    </div>
                  )}
                </div>

                {/* ===== DESKTOP TABLE VIEW ===== */}
                <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="table-scroll-container">
                    <table className="w-full text-left text-sm min-w-[1100px]">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-medium w-[240px] min-w-[240px]">{t('dashboard:order')} ID</th>
                          <th className="px-4 py-3 font-medium min-w-[180px]">{t('dashboard:customer')}</th>
                          <th className="px-4 py-3 font-medium min-w-[200px]">Products</th>
                          <th className="px-4 py-3 font-medium w-[100px]">{t('dashboard:total')}</th>
                          <th className="px-4 py-3 font-medium w-[100px]">Courier</th>
                          <th className="px-4 py-3 font-medium w-[100px]">{t('dashboard:payment')}</th>
                          <th className="px-4 py-3 font-medium w-[110px]">{t('dashboard:status')}</th>
                          <th className="px-4 py-3 font-medium w-[260px] min-w-[260px]">Fraud Risk</th>
                          <th className="px-4 py-3 font-medium text-right w-[160px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => {
                          const isErrorState = order.status === 'cancelled' || order.status === 'returned';
                          const orderItemsList = (order as typeof order & { items: Array<{title: string; quantity: number; imageUrl: string | null}> }).items ?? [];
                          return (
                            <tr
                              key={order.id}
                              className={`hover:bg-gray-50 transition ${isErrorState ? 'bg-red-50/30' : ''}`}
                            >
                              {/* Order ID */}
                              <td className="px-4 py-4 font-medium text-slate-900 w-[240px] min-w-[240px]">
                                <Link to={`/app/orders/${order.id}`} className="text-emerald-600  font-medium">
                                  {order.orderNumber}
                                </Link>
                                <div className="text-xs text-slate-400 font-normal mt-0.5">{formatDate(order.createdAt)}</div>
                              </td>

                              {/* Customer */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                                    {(order.customerName || 'C').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900 text-sm">{order.customerName || 'Customer'}</div>
                                    <div className="text-xs text-slate-500">{order.customerPhone || '—'}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Products */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5 max-w-[200px]">
                                  {orderItemsList.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className="relative shrink-0">
                                      <div className="h-10 w-10 overflow-hidden rounded bg-slate-100 ring-1 ring-slate-200">
                                        {item.imageUrl ? (
                                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px] font-medium p-1 text-center leading-tight">
                                            {item.title.slice(0, 2)}
                                          </div>
                                        )}
                                      </div>
                                      {item.quantity > 1 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white ring-1 ring-white">
                                          {item.quantity}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                  {orderItemsList.length > 6 && (
                                    <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 ring-1 ring-slate-200 shrink-0">
                                      +{orderItemsList.length - 6}
                                    </div>
                                  )}
                                  {orderItemsList.length === 0 && (
                                    <span className="text-xs text-slate-400 italic">—</span>
                                  )}
                                </div>
                                {orderItemsList.length > 0 && (
                                  <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                                    {orderItemsList[0].title}{orderItemsList.length > 1 ? ` +${orderItemsList.length - 1} more` : ''}
                                  </div>
                                )}
                              </td>

                              {/* Amount */}
                              <td className="px-4 py-4 font-semibold text-slate-900">
                                {formatPrice(order.total)}
                              </td>

                              {/* Courier Charge */}
                              <td className="px-4 py-4">
                                {order.courierCharge ? (
                                  <span className="text-sm text-slate-900">{formatPrice(order.courierCharge / 100)}</span>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>

                              {/* Payment */}
                              <td className="px-4 py-4">
                                {(() => {
                                  const method = order.paymentMethod?.toLowerCase() || '';
                                  const isPaid = order.paymentStatus === 'paid';
                                  // Show payment method badge only — COD implies unpaid, bKash/card implies paid
                                  const label = method === 'cod' ? 'COD'
                                    : method === 'bkash' ? 'bKash'
                                    : method === 'nagad' ? 'Nagad'
                                    : method === 'rocket' ? 'Rocket'
                                    : method === 'card' ? 'Card'
                                    : method === 'stripe' ? 'Stripe'
                                    : method ? method.charAt(0).toUpperCase() + method.slice(1)
                                    : isPaid ? t('dashboard:paid') : t('dashboard:unpaid');
                                  const colorClass = method === 'cod'
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : isPaid
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200';
                                  return (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
                                      {label}
                                    </span>
                                  );
                                })()}
                              </td>

                              {/* Status */}
                              <td className="px-4 py-4">
                                <StatusDropdown
                                  orderId={order.id}
                                  currentStatus={order.status || 'pending'}
                                />
                              </td>


                              {/* Fraud Risk */}
                              <td className="px-4 py-4 w-[260px] min-w-[260px]">
                                {(() => {
                                  const fd = 'fraudCache' in order
                                    ? (order as typeof order & { fraudCache: { successRate: number; totalOrders: number; deliveredOrders: number; returnedOrders: number; isHighRisk: boolean; riskScore: number; } | null }).fraudCache
                                    : null;
                                  const riskColors = fd
                                    ? fd.successRate >= 80 ? { border: 'border-emerald-100', bg: 'bg-emerald-50/50', bar: 'bg-emerald-500', text: 'text-emerald-700', sub: 'text-emerald-600/70' }
                                    : fd.successRate >= 60 ? { border: 'border-green-100', bg: 'bg-green-50/50', bar: 'bg-green-500', text: 'text-green-700', sub: 'text-green-600/70' }
                                    : fd.successRate >= 40 ? { border: 'border-amber-100', bg: 'bg-amber-50/50', bar: 'bg-amber-500', text: 'text-amber-700', sub: 'text-amber-600/70' }
                                    : fd.successRate >= 20 ? { border: 'border-orange-100', bg: 'bg-orange-50/50', bar: 'bg-orange-500', text: 'text-orange-700', sub: 'text-orange-600/70' }
                                    : { border: 'border-red-100', bg: 'bg-red-50/50', bar: 'bg-red-500', text: 'text-red-700', sub: 'text-red-600/70' }
                                    : null;
                                  if (fd && riskColors) {
                                    const pct = `${fd.successRate}%`;
                                    return (
                                      <div className={`relative flex w-full items-center justify-between rounded-lg border ${riskColors.border} ${riskColors.bg} p-2 pr-3`}>
                                        <div className={`absolute left-0 top-2 bottom-2 w-1 ${riskColors.bar} rounded-r-full`}></div>
                                        <div className="ml-3 flex flex-col">
                                          <span className={`text-xs font-bold ${riskColors.text}`}>{pct} Success</span>
                                          <span className={`text-[10px] font-medium ${riskColors.sub}`}>Total: {fd.totalOrders} orders</span>
                                        </div>
                                        <div
                                          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                          style={{ background: `conic-gradient(${riskColors.bar.replace('bg-', '').includes('emerald') ? '#10b981' : riskColors.bar.replace('bg-', '').includes('green') ? '#22c55e' : riskColors.bar.replace('bg-', '').includes('amber') ? '#f59e0b' : riskColors.bar.replace('bg-', '').includes('orange') ? '#f97316' : '#ef4444'} ${pct}, #e2e8f0 0deg)`, position: 'relative' }}
                                        >
                                          <div className="absolute w-6 h-6 bg-white rounded-full" />
                                        </div>
                                      </div>
                                    );
                                  }
                                  if (!order.customerPhone) return <span className="text-[11px] text-gray-300 italic">—</span>;
                                  return <FraudCheckButton orderId={order.id} currentStatus={order.status || 'pending'} />;
                                })()}
                              </td>

                              {/* Actions (includes courier) */}
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {courierProvider &&
                                    order.status === 'confirmed' &&
                                    !['booked', 'in_transit', 'delivered', 'shipped'].includes(
                                      order.courierStatus || ''
                                    ) ? (
                                    <div className="opacity-100">
                                      <SendToCourierButton
                                        orderId={order.id}
                                        orderNumber={order.orderNumber}
                                        status={order.status || 'pending'}
                                        courierStatus={order.courierStatus}
                                        courierProvider={courierProvider}
                                        allCouriers={allCouriers}
                                      />
                                    </div>
                                  ) : courierProvider ? (
                                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                      {courierProvider.charAt(0).toUpperCase() +
                                        courierProvider.slice(1)}
                                      {order.courierConsignmentId
                                        ? `: ${order.courierConsignmentId}`
                                        : ''}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-gray-400 italic font-medium">
                                      {t('dashboard:notConfigured')}
                                    </span>
                                  )}
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop: show total count only */}
          <div className="hidden md:flex border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 items-center justify-between text-xs text-gray-400">
            <span>{filteredOrders.length} {t('dashboard:orders') || 'orders'}</span>
            {dateFilter && <button onClick={() => setDateFilter('')} className="text-red-400">✕ {dateFilter}</button>}
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
  riskScore: number;
  riskLevel?: 'excellent' | 'good' | 'moderate' | 'high' | 'critical';
  riskMessage?: string;
  couriers?: Array<{ name: string; orders: number; delivered: number; cancelled: number; delivery_rate: string }>;
  source?: string;
  fromCache?: boolean;
}

// ── Smart Risk Card helpers ──────────────────────────────────────────────────

const RISK_META: Record<
  string,
  { bar: string; badge: string; label: string; dot: string }
> = {
  excellent: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'নিরাপদ',
    dot: 'bg-emerald-500',
  },
  good: {
    bar: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
    label: 'ভালো',
    dot: 'bg-green-500',
  },
  moderate: {
    bar: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'মাঝারি',
    dot: 'bg-amber-400',
  },
  high: {
    bar: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    label: 'উচ্চ ঝুঁকি',
    dot: 'bg-orange-500',
  },
  critical: {
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    label: 'ক্রিটিক্যাল',
    dot: 'bg-red-500',
  },
};

/** Inline Smart Risk Card shown inside the table cell after a result */
function SmartRiskCard({
  result,
  onRecheck,
  isRechecking,
}: {
  result: FraudCheckResult;
  onRecheck: () => void;
  isRechecking: boolean;
}) {
  const level = result.riskLevel ?? 'moderate';
  const meta = RISK_META[level] ?? RISK_META.moderate;
  const sr = result.successRate;
  const barWidth = `${Math.max(sr, 2)}%`;

  return (
    <div className="flex items-stretch gap-0 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden min-w-[160px] max-w-[190px]">
      {/* Left colored indicator bar */}
      <div className={`w-1 flex-shrink-0 ${meta.bar}`} />

      {/* Card body */}
      <div className="flex flex-col gap-1 px-2 py-1.5 flex-1">
        {/* Top row: badge + rate */}
        <div className="flex items-center justify-between gap-1">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">
            {sr.toFixed(0)}%
          </span>
        </div>

        {/* Progress arc bar */}
        <div className="w-full bg-gray-100 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all ${meta.bar}`}
            style={{ width: barWidth }}
          />
        </div>

        {/* Bottom row: stats */}
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>{result.totalOrders} অর্ডার</span>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium">↑{result.deliveredOrders}</span>
            <span className="text-red-500 font-medium">↓{result.returnedOrders}</span>
          </div>
        </div>

        {/* Courier mini breakdown (max 2 shown) */}
        {result.couriers && result.couriers.length > 0 && (
          <div className="border-t border-gray-100 pt-1 space-y-0.5">
            {result.couriers.slice(0, 2).map((c) => {
              const rate = parseFloat(c.delivery_rate);
              const courierColor =
                rate >= 70
                  ? 'bg-emerald-400'
                  : rate >= 40
                    ? 'bg-amber-400'
                    : 'bg-red-400';
              return (
                <div key={c.name} className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-400 w-10 truncate">{c.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-0.5">
                    <div
                      className={`h-0.5 rounded-full ${courierColor}`}
                      style={{ width: `${Math.max(rate, 2)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-gray-500 tabular-nums w-6 text-right">
                    {c.delivery_rate}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Re-check link */}
        <button
          type="button"
          onClick={onRecheck}
          disabled={isRechecking}
          className="text-[9px] text-gray-400 text-left disabled:opacity-40 mt-0.5"
        >
          {isRechecking ? '⟳ চেক করছে…' : '↺ রিফ্রেশ'}
        </button>
      </div>
    </div>
  );
}

/** Skeleton shimmer shown while fetching */
function SmartRiskCardSkeleton() {
  return (
    <div className="flex items-stretch gap-0 rounded-lg border border-gray-100 bg-white overflow-hidden min-w-[160px] max-w-[190px] animate-pulse">
      <div className="w-1 flex-shrink-0 bg-gray-200" />
      <div className="flex flex-col gap-1.5 px-2 py-1.5 flex-1">
        <div className="flex items-center justify-between gap-1">
          <div className="h-4 w-14 bg-gray-200 rounded-full" />
          <div className="h-4 w-8 bg-gray-200 rounded" />
        </div>
        <div className="h-1 w-full bg-gray-200 rounded-full" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

/** Mobile-specific fraud check button — compact, shown at bottom of card */
function MobileFraudCheckButton({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const fetcher = useFetcher<{
    success?: boolean;
    riskResult?: FraudCheckResult;
    error?: string;
  }>();
  const { revalidate } = useRevalidator();
  const isChecking = fetcher.state !== 'idle';

  const handleCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fetcher.submit({ intent: 'FRAUD_CHECK', orderId: String(orderId) }, { method: 'POST' });
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      revalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data?.success]);

  const result = fetcher.data?.riskResult;

  if (isChecking) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse">
        <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-500" />
        <div className="h-2.5 w-12 bg-slate-300 dark:bg-slate-500 rounded" />
      </div>
    );
  }

  if (result) {
    const level = result.riskLevel ?? 'moderate';
    const meta = RISK_META[level] ?? RISK_META.moderate;
    return (
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${meta.bar}`} />
        <span className={`text-[10px] font-bold ${
          level === 'excellent' || level === 'good' ? 'text-emerald-600' :
          level === 'moderate' ? 'text-amber-600' :
          'text-red-600'
        }`}>
          {result.successRate.toFixed(0)}% • {meta.label}
        </span>
      </div>
    );
  }

  if (fetcher.data?.error) {
    return (
      <button
        type="button"
        onClick={handleCheck}
        className="text-[10px] text-red-500 font-medium"
      >
        ⚠️ পুনরায় চেষ্টা
      </button>
    );
  }

  if (!['pending', 'confirmed', 'processing'].includes(currentStatus)) return null;

  return (
    <button
      type="button"
      onClick={handleCheck}
      disabled={isChecking}
      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all duration-200
        text-orange-600 border-orange-200 bg-white dark:bg-slate-800 dark:border-orange-700 dark:text-orange-400
        "
    >
      <Shield className="w-3 h-3" />
      চেক করুন
    </button>
  );
}

function FraudCheckButton({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const { t } = useTranslation();
  const fetcher = useFetcher<{
    success?: boolean;
    riskResult?: FraudCheckResult;
    error?: string;
  }>();
  const { revalidate } = useRevalidator();
  const isChecking = fetcher.state !== 'idle';

  // Only show for pending/confirmed orders
  const showButton = ['pending', 'confirmed'].includes(currentStatus);

  const handleCheck = () => {
    fetcher.submit({ intent: 'FRAUD_CHECK', orderId: String(orderId) }, { method: 'POST' });
  };

  const handleRecheck = () => {
    fetcher.submit(
      { intent: 'FRAUD_CHECK', orderId: String(orderId), forceRefresh: 'true' },
      { method: 'POST' },
    );
  };

  // After a successful FRAUD_CHECK, revalidate so the KV-cached badge updates
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      revalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data?.success]);

  const result = fetcher.data?.riskResult;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isChecking) return <SmartRiskCardSkeleton />;

  // ── Result: Smart Risk Card ───────────────────────────────────────────────
  if (result) {
    return (
      <SmartRiskCard
        result={result}
        onRecheck={handleRecheck}
        isRechecking={isChecking}
      />
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (fetcher.data?.error) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-red-500 italic">
          ⚠️ {fetcher.data.error.slice(0, 35)}
        </span>
        {showButton && (
          <button
            type="button"
            onClick={handleCheck}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-orange-600 border border-orange-200 rounded-md transition"
          >
            <Shield className="w-3 h-3" /> পুনরায় চেষ্টা
          </button>
        )}
      </div>
    );
  }

  // ── Default: check button ─────────────────────────────────────────────────
  if (!showButton) return <span className="text-[11px] text-gray-300 italic">—</span>;

  return (
    <button
      type="button"
      onClick={handleCheck}
      disabled={isChecking}
      title={t('checkFraud')}
      className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 disabled:opacity-50
        text-orange-600 border-orange-200 bg-white
        "
    >
      <Shield className="w-3.5 h-3.5 " />
      {t('dashboard:check')}
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
  courierProvider,
  allCouriers = [],
}: {
  orderId: number;
  orderNumber: string;
  status: string;
  courierStatus?: string | null;
  courierProvider: string;
  allCouriers?: string[];
}) {
  const { t } = useTranslation();
  const fetcher = useFetcher<{
    success?: boolean;
    error?: string;
    consignmentId?: string;
  }>();

  const isSubmitting = fetcher.state !== 'idle';
  const isBooked =
    courierStatus === 'booked' ||
    courierStatus === 'in_transit' ||
    courierStatus === 'delivered' ||
    courierStatus === 'shipped';

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
    <fetcher.Form method="post" className="flex items-center gap-1.5 flex-nowrap">
      <input type="hidden" name="intent" value="bookCourier" />
      <input type="hidden" name="orderId" value={orderId} />

      {allCouriers.length > 1 ? (
        <select
          name="provider"
          defaultValue={courierProvider}
          className="text-[11px] font-medium border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-[5px] pl-2 pr-6 bg-gray-50 text-gray-700 min-w-[90px] cursor-pointer outline-none"
        >
          {allCouriers.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      ) : (
        <input type="hidden" name="provider" value={courierProvider} />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        onClick={(e) => {
          const selectEl = e.currentTarget.form?.elements.namedItem('provider') as
            | HTMLSelectElement
            | HTMLInputElement;
          const provider = selectEl ? selectEl.value : courierProvider;
          if (
            !confirm(
              t('dashboard:confirmSendToCourier', {
                orderNumber,
                courierProvider: provider.charAt(0).toUpperCase() + provider.slice(1),
              })
            )
          ) {
            e.preventDefault();
          }
        }}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-lg disabled:opacity-50 shadow-sm whitespace-nowrap"
        title={
          allCouriers.length > 1
            ? t('dashboard:courierSend')
            : `Send to ${courierProvider.charAt(0).toUpperCase() + courierProvider.slice(1)}`
        }
      >
        {isSubmitting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Truck className="w-3.5 h-3.5" />
        )}
        {allCouriers.length > 1
          ? t('dashboard:courierSend')
          : t('dashboard:sendToProvider', {
            provider: courierProvider.charAt(0).toUpperCase() + courierProvider.slice(1),
          })}
      </button>
    </fetcher.Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-red-600 mb-4">{error.status}</h1>
          <p className="text-gray-600 mb-6">{error.data || error.statusText}</p>
          <a href="/app" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-6">Failed to load orders. Please refresh and try again.</p>
        <a href="/app" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}

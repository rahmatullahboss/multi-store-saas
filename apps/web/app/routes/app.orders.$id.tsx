/**
 * Order Detail Page
 * 
 * Route: /app/orders/:id
 * 
 * Features:
 * - View order details
 * - Update order status
 * - Customer info display
 * - Order items list
 * - Print invoice
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { Form, useLoaderData, Link, useNavigation, useFetcher } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { orders, orderItems, products, productVariants, stores, activityLogs, users } from '@db/schema';
import { getStoreId, getUserId } from '~/services/auth.server';
import { ArrowLeft, Package, User, Phone, MapPin, Loader2, CheckCircle, Printer, Truck, ExternalLink, Send, Download, Copy, Check, StickyNote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RiskBadge } from '~/components/RiskBadge';
import { TrackingTimeline } from '~/components/TrackingTimeline';
import { OrderTimeline } from '~/components/OrderTimeline';
import { useTranslation } from '~/contexts/LanguageContext';
import { logActivity } from '~/lib/activity.server';
import { dispatchWebhook } from '~/services/webhook.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.order ? `Order ${data.order.orderNumber}` : 'Order Details' }];
};

// ============================================================================
// LOADER - Fetch order with items and store info
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const orderId = parseInt(params.id || '0');
  if (!orderId) {
    throw new Response('Order not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info for invoice header
  const storeResult = await db
    .select({ name: stores.name, logo: stores.logo, currency: stores.currency, courierSettings: stores.courierSettings })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const store = storeResult[0];

  // Fetch order
  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .limit(1);

  if (orderResult.length === 0) {
    throw new Response('Order not found', { status: 404 });
  }

  const order = orderResult[0];

  // Fetch order items with product info
  const items = await db
    .select({
      id: orderItems.id,
      title: orderItems.title,
      quantity: orderItems.quantity,
      price: orderItems.price,
      total: orderItems.total,
      productId: orderItems.productId,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  // Get product images for items (Optimized N+1 query)
  const productIds = Array.from(new Set(items.map((i) => i.productId).filter((id): id is number => id !== null)));

  const productsMap = new Map<number, string | null>();
  if (productIds.length > 0) {
    const productsData = await db
      .select({ id: products.id, imageUrl: products.imageUrl })
      .from(products)
      .where(and(eq(products.storeId, storeId), inArray(products.id, productIds)));

    for (const p of productsData) {
      productsMap.set(p.id, p.imageUrl);
    }
  }

  const itemsWithImages = items.map((item) => {
    return {
      ...item,
      imageUrl: item.productId ? productsMap.get(item.productId) ?? null : null,
    };
  });

  // Get courier settings from store
  const courierSettings = store?.courierSettings as string | null;
  let connectedCourier: string | null = null;
  if (courierSettings) {
    try {
      const settings = JSON.parse(courierSettings);
      if (settings.isConnected && settings.provider) {
        connectedCourier = settings.provider;
      }
    } catch {
      // Invalid JSON
    }
  }

  // Fetch activity logs for this order
  const logsResult = await db
    .select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      details: activityLogs.details,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .where(and(
      eq(activityLogs.storeId, storeId),
      eq(activityLogs.entityType, 'order'),
      eq(activityLogs.entityId, orderId)
    ))
    .orderBy(desc(activityLogs.createdAt))
    .limit(50);

  // Fetch all team members for user lookup
  const teamMembers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.storeId, storeId));

  // Enrich logs with user info
  const userMap = new Map(teamMembers.map(u => [u.id, u]));
  const orderActivityLogs = logsResult.map(log => ({
    ...log,
    user: log.userId ? userMap.get(log.userId) : null,
  }));

  return json({ 
    order, 
    items: itemsWithImages, 
    store,
    connectedCourier,
    activityLogs: orderActivityLogs,
  });
}

// ============================================================================
// ACTION - Update order status or book courier
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderId = parseInt(params.id || '0');
  if (!orderId) {
    return json({ error: 'Order not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

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
      return json({ error: 'Courier not configured. Go to Settings > Courier to connect.' }, { status: 400 });
    }

    const courierSettings = JSON.parse(storeResultCourier[0].courierSettings as string);
    let consignmentId = '';

    try {
      // Parse shipping address
      let address = '';
      let city = '';
      if (order.shippingAddress) {
        const parsed = typeof order.shippingAddress === 'string' 
          ? JSON.parse(order.shippingAddress) 
          : order.shippingAddress;
        address = parsed.address || '';
        city = parsed.city || '';
      }

      if (provider === 'pathao' && courierSettings.pathao) {
        const { createPathaoClient } = await import('~/services/pathao.server');
        const client = createPathaoClient(courierSettings.pathao);
        
        const result = await client.createOrder({
          store_id: courierSettings.pathao.defaultStoreId || 1,
          merchant_order_id: order.orderNumber,
          sender_name: storeResultCourier[0].name || 'Merchant',
          sender_phone: courierSettings.pathao.senderPhone || '',
          recipient_name: order.customerName || 'Customer',
          recipient_phone: order.customerPhone || '',
          recipient_address: address,
          recipient_city: 1,
          recipient_zone: 1,
          delivery_type: 48,
          item_type: 2,
          item_quantity: 1,
          item_weight: 0.5,
          amount_to_collect: order.total,
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
        .where(eq(orders.id, orderId));

      return json({ success: true, consignmentId });

    } catch (error) {
      console.error('Courier booking error:', error);
      return json({ error: error instanceof Error ? error.message : 'Booking failed' }, { status: 500 });
    }
  }

  // Get current user ID for activity logging
  const userId = await getUserId(request, context.cloudflare.env);

  // Handle addNote intent
  if (intent === 'addNote') {
    const note = formData.get('note') as string;
    if (!note || !note.trim()) {
      return json({ error: 'Note cannot be empty' }, { status: 400 });
    }

    // Log the note as an activity
    await logActivity(db, {
      storeId,
      userId,
      action: 'order_note_added',
      entityType: 'order',
      entityId: orderId,
      details: { note: note.trim() },
    });

    return json({ success: true });
  }

  // Handle status update (default)
  const status = formData.get('status') as string;

  if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status)) {
    return json({ error: 'Invalid status' }, { status: 400 });
  }

  // Fetch order before update to check if we need to send email or manage inventory
  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .limit(1);

  if (orderResult.length === 0) {
    return json({ error: 'Order not found' }, { status: 404 });
  }

  const order = orderResult[0];
  const previousStatus = order.status;
  
  const isCancelled = ['cancelled', 'returned'].includes(status);
  const wasCancelled = ['cancelled', 'returned'].includes(previousStatus || '');
  const isUncancel = !isCancelled && wasCancelled;

  // ============================================================================
  // PRE-UPDATE SECURITY CHECKS (Inventory Deduction)
  // ============================================================================
  
  // If un-cancelling (Active -> Cancelled -> Active), we MUST re-deduct inventory FIRST.
  // If this fails (out of stock), we MUST NOT update the status.
  if (isUncancel) {
    const items = await db
      .select({ 
        productId: orderItems.productId, 
        variantId: orderItems.variantId, 
        quantity: orderItems.quantity 
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const successfulDeductions: { type: 'product' | 'variant', id: number, qty: number }[] = [];

    for (const item of items) {
       let result;
       try {
         if (item.variantId) {
            result = await db
             .update(productVariants)
             .set({ inventory: sql`${productVariants.inventory} - ${item.quantity}` })
             .where(and(
               eq(productVariants.id, item.variantId),
               sql`${productVariants.inventory} >= ${item.quantity}`
             ))
             .returning({ id: productVariants.id });
             
             if (result.length > 0) successfulDeductions.push({ type: 'variant', id: item.variantId, qty: item.quantity });
         } else if (item.productId) {
            result = await db
             .update(products)
             .set({ inventory: sql`${products.inventory} - ${item.quantity}` })
             .where(and(
               eq(products.id, item.productId),
               sql`${products.inventory} >= ${item.quantity}`
             ))
             .returning({ id: products.id });
             
             if (result.length > 0) successfulDeductions.push({ type: 'product', id: item.productId, qty: item.quantity });
         }

         if (!result || result.length === 0) {
            throw new Error('Out of stock');
         }
       } catch (error) {
          // ROLLBACK successful deductions
          console.error("Un-cancel failed, rolling back inventory:", error);
          for (const deduction of successfulDeductions) {
            if (deduction.type === 'variant') {
              await db.update(productVariants)
                .set({ inventory: sql`${productVariants.inventory} + ${deduction.qty}` })
                .where(eq(productVariants.id, deduction.id));
            } else {
              await db.update(products)
                .set({ inventory: sql`${products.inventory} + ${deduction.qty}` })
                .where(eq(products.id, deduction.id));
            }
          }
          
          return json({ error: `Cannot activate order: Item out of stock.` }, { status: 400 });
       }
    }
  }

  // ============================================================================
  // STATUS UPDATE
  // ============================================================================

  await db
    .update(orders)
    .set({ 
      status: status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      updatedAt: new Date() 
    })
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

  // Log status change to activity log
  if (previousStatus !== status) {
    await logActivity(db, {
      storeId,
      userId,
      action: 'order_status_update',
      entityType: 'order',
      entityId: orderId,
      details: { from: previousStatus, to: status, orderNumber: order.orderNumber },
    });

    // Dispatch webhooks for order status changes
    const webhookPayload = {
      event: 'order.updated',
      order_id: orderId,
      order_number: order.orderNumber,
      previous_status: previousStatus,
      new_status: status,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      total: order.total,
      updated_at: new Date().toISOString(),
    };

    // Use waitUntil to dispatch webhooks without blocking response
    (context as any).waitUntil(dispatchWebhook(context.cloudflare.env, storeId, 'order.updated', webhookPayload));

    // Also dispatch specific status events
    if (status === 'cancelled') {
      (context as any).waitUntil(dispatchWebhook(context.cloudflare.env, storeId, 'order.cancelled', webhookPayload));
    } else if (status === 'delivered') {
      (context as any).waitUntil(dispatchWebhook(context.cloudflare.env, storeId, 'order.delivered', webhookPayload));
    }
  }

  // ============================================================================
  // POST-UPDATE ACTIONS (Inventory Restoration)
  // ============================================================================

  // When order is cancelled or returned: Restore inventory
  if (isCancelled && !wasCancelled) {
    const items = await db
      .select({ 
        productId: orderItems.productId, 
        variantId: orderItems.variantId,
        quantity: orderItems.quantity 
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    
    for (const item of items) {
      if (item.variantId) {
        // Restore variant stock
        await db
          .update(productVariants)
          .set({ inventory: sql`${productVariants.inventory} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      } else if (item.productId) {
        // Restore product stock
        await db
          .update(products)
          .set({ inventory: sql`${products.inventory} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }
    }
  }

  // Send shipping notification if status changed to shipped/delivered and customer has email
  const shippingStatuses = ['shipped', 'out_for_delivery', 'delivered'];
  if (
    shippingStatuses.includes(status) && 
    previousStatus !== status &&
    order.customerEmail
  ) {
    const resendApiKey = context.cloudflare.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      // Import email service
      const { createEmailService } = await import('~/services/email.server');
      const emailService = createEmailService(resendApiKey);

      // Fetch store name
      const storeResult = await db
        .select({ name: stores.name })
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);

      const storeName = storeResult[0]?.name || 'Your Store';

      // Send shipping update email (non-blocking)
      context.cloudflare.ctx.waitUntil(
        emailService.sendShippingUpdate({
          customerEmail: order.customerEmail,
          customerName: order.customerName || 'Valued Customer',
          orderNumber: order.orderNumber || `#${orderId}`,
          storeName,
          status: status as 'shipped' | 'out_for_delivery' | 'delivered',
          trackingNumber: order.courierConsignmentId || undefined,
          trackingUrl: order.courierConsignmentId
            ? `https://${storeName.toLowerCase().replace(/\s+/g, '')}.ozzyl.com/track/${order.courierConsignmentId}`
            : undefined,
        })
      );
      
      // ========== FIRE AUTOMATION TRIGGER FOR DELIVERED ==========
      if (status === 'delivered') {
        const { triggerAutomation } = await import('~/services/automation.server');
        context.cloudflare.ctx.waitUntil(
          triggerAutomation(
            context.cloudflare.env.DB,
            'order_delivered',
            {
              storeId,
              customerEmail: order.customerEmail,
              customerName: order.customerName || 'Customer',
              metadata: {
                orderNumber: order.orderNumber,
                total: order.total,
              }
            },
            resendApiKey
          )
        );
      }
    }
  }

  return json({ success: true });
}

// ============================================================================
// STATUS CONFIG
// ============================================================================
const statusOptions = [
  { value: 'pending', label: 'অপেক্ষমান (Pending)', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'confirmed', label: 'কনফার্মড (Confirmed)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'processing', label: 'প্রসেসিং (Processing)', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'shipped', label: 'শিপড (Shipped)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'delivered', label: 'ডেলিভার্ড (Delivered)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'cancelled', label: 'বাতিল (Cancelled)', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'returned', label: 'রিটার্ন (Returned)', color: 'bg-orange-100 text-orange-800 border-orange-300' },
];

function StatusBadge({ status }: { status: string }) {
  const option = statusOptions.find(o => o.value === status) || statusOptions[0];
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${option.color}`}>
      {option.label}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function OrderDetailPage() {
  const { order, items, store, connectedCourier, activityLogs } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isUpdating = navigation.state === 'submitting';
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const handleCopyTrackingLink = () => {
    const link = `${window.location.origin}/track/${order.orderNumber}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
  };
  const steadfastFetcher = useFetcher();
  const isBooking = steadfastFetcher.state === 'submitting';
  const fetcher = useFetcher();

  const currency = store?.currency || 'BDT';
  const { t, lang } = useTranslation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  let shippingAddress: { address?: string; city?: string; postalCode?: string, area?: string } = {};
  try {
    if (order.shippingAddress) {
      shippingAddress = typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress;
    }
  } catch {
    shippingAddress = {};
  }

  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
          .print-break { page-break-after: always; }
        }
      `}</style>

      <div className="flex flex-col h-[calc(100vh-80px)] xl:h-[calc(100vh-64px)] relative -m-4 lg:-m-8 bg-gray-50 no-print">
        <header className="h-16 border-b border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 w-full">
          <div className="flex items-center gap-4">
            <Link
              to="/app/orders"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title={t('backToOrders')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  {t('order')} {order.orderNumber}
                </h1>
                <StatusBadge status={order.status || 'pending'} />
              </div>
              <p className="text-xs text-gray-500 font-medium tracking-wide hidden sm:block">
                {formatDate(order.createdAt as unknown as Date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTrackingLink}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              title="Copy Tracking Link"
            >
              {isCopied ? <Check className="w-4 h-4 sm:mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 sm:mr-2" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy Tracking'}</span>
            </button>
            <a
              href={`/resources/order-invoice/${order.id}`}
              download
              className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              title={t('downloadPdf')}
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </a>
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition shadow-sm"
              title={t('printInvoice')}
            >
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('print')}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 scroll-smooth">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1400px] mx-auto">
            
            <div className="xl:col-span-8 space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    Order Items ({items.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-5 flex items-start sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      {item.imageUrl ? (
                        <div className="relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200 bg-white"
                          />
                          <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ring-2 ring-white">
                            {item.quantity}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                          <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ring-2 ring-white">
                            {item.quantity}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight truncate">{item.title}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-gray-900 text-lg">{formatPrice(item.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-5 py-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
                  <div className="text-sm text-gray-500">
                    <p>Subtotal: {formatPrice(order.subtotal)}</p>
                    <p>Shipping: {formatPrice(order.shipping || 0)}</p>
                    <p>Tax: {formatPrice(order.tax || 0)}</p>
                  </div>
                  <div className="text-right flex items-baseline gap-3">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-emerald-600" />
                  Internal Staff Notes
                </h2>

                <fetcher.Form method="post" className="mb-6 relative">
                  <input type="hidden" name="intent" value="addNote" />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="note"
                      placeholder="Type a note and hit Enter..."
                      required
                      className="flex-1 pl-4 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-sm transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (e.currentTarget.value.trim()) {
                            e.currentTarget.form?.requestSubmit();
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={fetcher.state === 'submitting'}
                      className="absolute right-1 top-1 bottom-1 px-4 bg-gray-900 text-white text-xs font-bold rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                      onClick={(e) => {
                        const form = e.currentTarget.form;
                        if (form) {
                          const input = form.querySelector('input[name="note"]') as HTMLInputElement;
                          if (!input.value.trim()) {
                            e.preventDefault();
                            return;
                          }
                          setTimeout(() => { input.value = ''; }, 10);
                        }
                      }}
                    >
                      {fetcher.state === 'submitting' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Note'}
                    </button>
                  </div>
                </fetcher.Form>

                <div className="space-y-4">
                  {activityLogs
                    .filter(log => log.action === 'order_note_added')
                    .map((log) => {
                      let noteContent = '';
                      try {
                        const parsed = JSON.parse(log.details || '{}');
                        noteContent = parsed.note || '';
                      } catch (e) { noteContent = log.details || ''; }

                      return (
                        <div key={log.id} className="flex gap-3 text-sm p-3 bg-yellow-50/50 rounded-lg border border-yellow-100/50">
                          <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">{log.user?.name?.[0] || 'S'}</span>
                          </div>
                          <div>
                            <p className="text-gray-900 leading-snug break-words">"{noteContent}"</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {log.user?.name || log.user?.email || 'System'} • {new Date(log.createdAt || '').toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  {activityLogs.filter(log => log.action === 'order_note_added').length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-2">No notes added yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Update Status
                </h2>
                <Form method="post" className="flex flex-col gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="submit"
                      name="status"
                      value={option.value}
                      disabled={isUpdating || order.status === option.value}
                      className={`
                        w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between
                        ${order.status === option.value 
                          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${order.status === option.value ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        {option.label}
                      </span>
                      {order.status === option.value && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                  {isUpdating && <div className="flex justify-center mt-2"><Loader2 className="w-5 h-5 animate-spin text-emerald-600" /></div>}
                </Form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex justify-between items-center">
                    Customer Info
                    {order.customerPhone && <RiskBadge phone={order.customerPhone} />}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{order.customerName || 'No Name Provided'}</p>
                        <a href={`tel:${order.customerPhone}`} className="text-sm text-gray-500 hover:text-emerald-600 transition truncate block">
                          {order.customerPhone || 'No Phone'}
                        </a>
                        {order.customerEmail && <p className="text-sm text-gray-500 truncate">{order.customerEmail}</p>}
                      </div>
                    </div>

                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[\s+-]/g, '').startsWith('01') ? '88' + order.customerPhone.replace(/[\s+-]/g, '') : order.customerPhone.replace(/[\s+-]/g, '')}?text=${encodeURIComponent(
                          `Hi ${order.customerName || 'Customer'}! Your order #${order.orderNumber} has been ${order.status || 'pending'}. Thank you for shopping at ${store?.name || 'our store'}! 🙏`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-lg hover:bg-[#1DA851] transition shadow-sm"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-current"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50/50 p-5">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</h2>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="text-sm font-medium text-gray-700 leading-relaxed">
                      {shippingAddress.address && <span>{shippingAddress.address}<br/></span>}
                      {order.shippingArea && <span>{order.shippingArea}<br/></span>}
                      {order.shippingCity && <span>{order.shippingCity}<br/></span>}
                      {shippingAddress.postalCode && <span>Postal: {shippingAddress.postalCode}</span>}
                      {!shippingAddress.address && !order.shippingCity && <span className="text-gray-400 italic">No address provided</span>}
                    </div>
                  </div>
                </div>
                
                <div className="p-5 border-t border-gray-100">
                  {!order.courierConsignmentId ? (
                    connectedCourier === 'steadfast' ? (
                      <steadfastFetcher.Form method="post" action="/api/courier/steadfast">
                        <input type="hidden" name="intent" value="BOOK_ORDER" />
                        <input type="hidden" name="orderId" value={order.id} />
                        <button
                          type="submit"
                          disabled={isBooking || order.status === 'delivered' || order.status === 'cancelled'}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-sm"
                        >
                          {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Book via Steadfast
                        </button>
                      </steadfastFetcher.Form>
                    ) : (
                      <Link
                        to="/app/settings/courier"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition shadow-sm"
                      >
                        <Truck className="w-4 h-4" /> Connect Courier
                      </Link>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsTrackingOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Track Consignment
                    </button>
                  )}
                  {steadfastFetcher.data && (
                    <div className="mt-2 text-center text-sm font-medium">
                      {(steadfastFetcher.data as { error?: string }).error 
                        ? <span className="text-red-500">{(steadfastFetcher.data as { error: string }).error}</span> 
                        : <span className="text-emerald-600 flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Booking Successful!</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-5">
                <OrderTimeline logs={activityLogs} orderId={order.id} isSubmitting={isUpdating} />
              </div>

            </div>
          </div>
        </div>
      </div>

      <div id="invoice-print" className="bg-white p-8 no-print hidden !block">
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
          <div>
            {store?.logo ? <img src={store.logo} alt={store.name} className="h-12 mb-2" /> : <h2 className="text-2xl font-bold text-gray-900">{store?.name}</h2>}
            <p className="text-sm text-gray-500">{t('invoice')}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
            <p className="text-sm text-gray-500">{formatDateShort(order.createdAt as unknown as Date)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('billTo')}</h3>
            <p className="font-semibold">{order.customerName}</p>
            <p>{order.customerPhone}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('shipTo')}</h3>
             <p>{shippingAddress.address}</p>
             <p>{order.shippingArea}</p>
             <p>{order.shippingCity}</p>
          </div>
        </div>
        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">{t('item')}</th>
              <th className="text-center py-2">{t('quantity')}</th>
              <th className="text-right py-2">{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2">{item.title}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold text-lg pt-4">Total: {formatPrice(order.total)}</div>
      </div>

      {order.courierConsignmentId && (
        <TrackingTimeline
          consignmentId={order.courierConsignmentId}
          trackingCode={order.courierConsignmentId}
          currentStatus={order.courierStatus || undefined}
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />
      )}
    </>
  );
}

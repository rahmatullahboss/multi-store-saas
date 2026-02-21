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

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, Link, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import {
  orders,
  orderItems,
  products,
  productVariants,
  stores,
  activityLogs,
  users,
} from '@db/schema';
import { calculateOrderWeight } from '~/lib/courier-weight.server';
import { getStoreId, getUserId } from '~/services/auth.server';
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  Printer,
  Truck,
  ExternalLink,
  Send,
  Download,
} from 'lucide-react';
import { useState } from 'react';
import { RiskBadge } from '~/components/RiskBadge';
import { TrackingTimeline } from '~/components/TrackingTimeline';
import { OrderTimeline } from '~/components/OrderTimeline';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { logActivity } from '~/lib/activity.server';
import { dispatchWebhook } from '~/services/webhook.server';
import { type OrderStatus, isOrderStatus, assertOrderStatusTransition } from '~/lib/orderStatus';

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

  // Get unified settings for courier info
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Fetch store info for invoice header
  const storeResult = await db
    .select({
      name: stores.name,
      logo: stores.logo,
      currency: stores.currency,
    })
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

  // Get product images for items
  const itemsWithImages = await Promise.all(
    items.map(async (item) => {
      if (item.productId) {
        const product = await db
          .select({ imageUrl: products.imageUrl })
          .from(products)
          .where(and(eq(products.id, item.productId), eq(products.storeId, storeId)))
          .limit(1);
        return { ...item, imageUrl: product[0]?.imageUrl };
      }
      return { ...item, imageUrl: null };
    })
  );

  // Get courier settings from unified settings (single source of truth)
  const courierConfig = unifiedSettings.courier || {};
  const availableCouriers: string[] = [];
  let defaultCourier: string | null = null;

  // Check for each provider's credentials to determine availability
  if (courierConfig.pathao?.clientId && courierConfig.pathao?.clientSecret)
    availableCouriers.push('pathao');
  if (courierConfig.steadfast?.apiKey && courierConfig.steadfast?.secretKey)
    availableCouriers.push('steadfast');
  if (courierConfig.redx?.apiKey) availableCouriers.push('redx');

  if (courierConfig.provider && availableCouriers.includes(courierConfig.provider)) {
    defaultCourier = courierConfig.provider;
  } else if (availableCouriers.length > 0) {
    defaultCourier = availableCouriers[0];
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
    .where(
      and(
        eq(activityLogs.storeId, storeId),
        eq(activityLogs.entityType, 'order'),
        eq(activityLogs.entityId, orderId)
      )
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(50);

  // Fetch all team members for user lookup
  const teamMembers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.storeId, storeId));

  // Enrich logs with user info
  const userMap = new Map(teamMembers.map((u) => [u.id, u]));
  const orderActivityLogs = logsResult.map((log) => ({
    ...log,
    user: log.userId ? userMap.get(log.userId) : null,
  }));

  // Read KV cached fraud data for this order's phone
  let fraudCache = null;
  if (order.customerPhone) {
    try {
      const kv = context.cloudflare.env.STORE_CACHE;
      if (kv) {
        const cached = await kv.get(`fraud_steadfast_${storeId}_${order.customerPhone}`, 'json');
        if (cached) fraudCache = cached;
      }
    } catch {
      /* ignore */
    }
  }

  return json({
    order,
    items: itemsWithImages,
    store,
    availableCouriers,
    defaultCourier,
    activityLogs: orderActivityLogs,
    fraudCache,
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

  // Handle fraud check — fetches from Steadfast external API and caches in KV
  if (intent === 'FRAUD_CHECK') {
    try {
      const orderResult = await db
        .select({ id: orders.id, customerPhone: orders.customerPhone })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
        .limit(1);

      if (!orderResult[0]) {
        return json({ error: 'Order not found' }, { status: 404 });
      }

      const phone = (formData.get('phone') as string) || orderResult[0].customerPhone || '';
      const kv = context.cloudflare.env.STORE_CACHE;
      const fraudCacheKey = `fraud_steadfast_${storeId}_${phone}`;

      const forceRefresh = formData.get('forceRefresh') === 'true';

      // Check KV cache first (24h TTL)
      if (kv && phone && !forceRefresh) {
        try {
          const cached = (await kv.get(fraudCacheKey, 'json')) as {
            successRate: number;
            totalOrders: number;
            deliveredOrders: number;
            returnedOrders: number;
            isHighRisk: boolean;
            riskScore: number;
            source: string;
            cachedAt: string;
          } | null;
          if (cached) {
            return json({ success: true, riskResult: { ...cached, fromCache: true } });
          }
        } catch {
          /* ignore cache errors */
        }
      }

      // Call Steadfast external API
      const { createSteadfastClient } = await import('~/services/steadfast.server');
      let sessionCookie: string | undefined;
      let xsrfToken: string | undefined;

      if (kv) {
        const adminCredsRaw = await kv.get(`steadfast_credentials_${storeId}`);
        if (adminCredsRaw) {
          const creds = JSON.parse(adminCredsRaw as string);
          sessionCookie = creds.sessionCookie;
          xsrfToken = creds.xsrfToken;
        }
      }

      if (!sessionCookie || !xsrfToken) {
        return json({ error: 'Steadfast credentials not configured' }, { status: 400 });
      }

      const client = createSteadfastClient({
        apiKey: 'internal',
        secretKey: 'internal',
        sessionCookie,
        xsrfToken,
      });

      // Normalize phone for Steadfast (strip +88/880 prefix)
      const sfPhone = phone.startsWith('+88')
        ? phone.slice(3)
        : phone.startsWith('880')
          ? phone.slice(3)
          : phone;

      let externalFraud;
      try {
        externalFraud = await client.checkExternalFraud(sfPhone);
      } catch (err) {
        console.warn('[FRAUD CHECK] API Failed:', err);
        return json({ error: 'Steadfast API error' }, { status: 400 });
      }

      const deliveredOrders = externalFraud.success || 0;
      const returnedOrders = externalFraud.cancellation || 0;
      const totalOrders = deliveredOrders + returnedOrders;
      const successRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 100;
      const riskScore = totalOrders > 0 ? Math.round((returnedOrders / totalOrders) * 100) : 0;
      const isHighRisk = totalOrders >= 2 && returnedOrders / totalOrders > 0.3;
      let source = 'steadfast_external';

      if (totalOrders === 0) {
        source = 'no_data';
      }

      const result = {
        successRate,
        totalOrders,
        deliveredOrders,
        returnedOrders,
        isHighRisk,
        riskScore,
        source,
        cachedAt: new Date().toISOString(),
      };

      // Save to KV cache (24 hours) so orders list and this page both show it
      if (kv && phone) {
        try {
          await kv.put(fraudCacheKey, JSON.stringify(result), { expirationTtl: 86400 });
        } catch {
          /* ignore */
        }
      }

      return json({ success: true, riskResult: result });
    } catch (error) {
      console.error('[ORDER DETAIL] Fraud check failed:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Fraud check failed' },
        { status: 500 }
      );
    }
  }

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
      // Parse shipping address with robust fallback
      let address = '';
      let city = '';
      let district = '';
      let upazila = '';
      if (order.shippingAddress) {
        try {
          const parsed =
            typeof order.shippingAddress === 'string'
              ? JSON.parse(order.shippingAddress)
              : order.shippingAddress;
          address = parsed.address || '';
          city = parsed.city || parsed.district || '';
          district = parsed.district || '';
          upazila = parsed.upazila || '';
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
          if (fullAddress) address = fullAddress;
        } catch {
          // If JSON parse fails, use raw string as address
          address = typeof order.shippingAddress === 'string' ? order.shippingAddress : '';
        }
      }
      // Final fallback — Pathao requires at least 10 characters
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
          special_instruction: [district, upazila].filter(Boolean).join(', ') || undefined,
          item_description: `Order ${order.orderNumber}`,
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
          cash_collection_amount: Math.round(order.total),
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
          cod_amount: Math.round(order.total),
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

      return json(
        { success: true, consignmentId },
        {
          headers: {
            'x-order-id': String(orderId),
          },
        }
      );
    } catch (error) {
      console.error('Courier booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Booking failed';
      return json({ error: errorMessage }, { status: 500 });
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

    return json(
      { success: true },
      {
        headers: {
          'x-order-id': String(orderId),
        },
      }
    );
  }

  // Handle status update (default)
  const statusRaw = formData.get('status');

  if (!isOrderStatus(statusRaw)) {
    return json({ error: 'Invalid status' }, { status: 400 });
  }
  const status: OrderStatus = statusRaw;

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
  const previousStatus = (order.status || 'pending') as OrderStatus;

  try {
    assertOrderStatusTransition(previousStatus, status);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Invalid status transition' },
      { status: 400 }
    );
  }

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
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const successfulDeductions: { type: 'product' | 'variant'; id: number; qty: number }[] = [];

    for (const item of items) {
      let result;
      try {
        if (item.variantId) {
          result = await db
            .update(productVariants)
            .set({ inventory: sql`${productVariants.inventory} - ${item.quantity}` })
            .where(
              and(
                eq(productVariants.id, item.variantId),
                sql`exists (
                  select 1
                  from ${products}
                  where ${products.id} = ${productVariants.productId}
                    and ${products.storeId} = ${storeId}
                )`,
                sql`${productVariants.inventory} >= ${item.quantity}`
              )
            )
            .returning({ id: productVariants.id });

          if (result.length > 0)
            successfulDeductions.push({ type: 'variant', id: item.variantId, qty: item.quantity });
        } else if (item.productId) {
          result = await db
            .update(products)
            .set({ inventory: sql`${products.inventory} - ${item.quantity}` })
            .where(
              and(
                eq(products.id, item.productId),
                eq(products.storeId, storeId),
                sql`${products.inventory} >= ${item.quantity}`
              )
            )
            .returning({ id: products.id });

          if (result.length > 0)
            successfulDeductions.push({ type: 'product', id: item.productId, qty: item.quantity });
        }

        if (!result || result.length === 0) {
          throw new Error('Out of stock');
        }
      } catch (error) {
        // ROLLBACK successful deductions
        console.error('Un-cancel failed, rolling back inventory:', error);
        for (const deduction of successfulDeductions) {
          if (deduction.type === 'variant') {
            await db
              .update(productVariants)
              .set({ inventory: sql`${productVariants.inventory} + ${deduction.qty}` })
              .where(
                and(
                  eq(productVariants.id, deduction.id),
                  sql`exists (
                    select 1
                    from ${products}
                    where ${products.id} = ${productVariants.productId}
                      and ${products.storeId} = ${storeId}
                  )`
                )
              );
          } else {
            await db
              .update(products)
              .set({ inventory: sql`${products.inventory} + ${deduction.qty}` })
              .where(and(eq(products.id, deduction.id), eq(products.storeId, storeId)));
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
      status,
      updatedAt: new Date(),
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
    // Use waitUntil to dispatch webhooks without blocking response
    context.cloudflare.ctx.waitUntil(
      dispatchWebhook(context.cloudflare.env, storeId, 'order.updated', webhookPayload)
    );

    // Also dispatch specific status events
    if (status === 'cancelled') {
      context.cloudflare.ctx.waitUntil(
        dispatchWebhook(context.cloudflare.env, storeId, 'order.cancelled', webhookPayload)
      );
    } else if (status === 'delivered') {
      context.cloudflare.ctx.waitUntil(
        dispatchWebhook(context.cloudflare.env, storeId, 'order.delivered', webhookPayload)
      );
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
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      if (item.variantId) {
        // Restore variant stock
        await db
          .update(productVariants)
          .set({ inventory: sql`${productVariants.inventory} + ${item.quantity}` })
          .where(
            and(
              eq(productVariants.id, item.variantId),
              sql`exists (
                select 1
                from ${products}
                where ${products.id} = ${productVariants.productId}
                  and ${products.storeId} = ${storeId}
              )`
            )
          );
      } else if (item.productId) {
        // Restore product stock
        await db
          .update(products)
          .set({ inventory: sql`${products.inventory} + ${item.quantity}` })
          .where(and(eq(products.id, item.productId), eq(products.storeId, storeId)));
      }
    }
  }

  // Send shipping notification if status changed to shipped/delivered and customer has email
  const shippingStatuses: OrderStatus[] = ['shipped', 'delivered'];
  if (shippingStatuses.includes(status) && previousStatus !== status && order.customerEmail) {
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
          status: status as 'shipped' | 'delivered',
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
              },
            },
            resendApiKey
          )
        );
      }
    }
  }

  return json(
    { success: true },
    {
      headers: {
        'x-order-id': String(orderId),
      },
    }
  );
}

// ============================================================================
// STATUS CONFIG
// ============================================================================
const statusOptions = [
  {
    value: 'pending',
    label: 'অপেক্ষমান (Pending)',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    value: 'confirmed',
    label: 'কনফার্মড (Confirmed)',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    value: 'processing',
    label: 'প্রসেসিং (Processing)',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    value: 'shipped',
    label: 'শিপড (Shipped)',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    value: 'delivered',
    label: 'ডেলিভার্ড (Delivered)',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    value: 'cancelled',
    label: 'বাতিল (Cancelled)',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    value: 'returned',
    label: 'রিটার্ন (Returned)',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
];

function StatusBadge({ status }: { status: string }) {
  const option = statusOptions.find((o) => o.value === status) || statusOptions[0];
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
  const { order, items, store, availableCouriers, defaultCourier, activityLogs, fraudCache } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isUpdating = navigation.state === 'submitting';
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const courierFetcher = useFetcher();
  const isBooking = courierFetcher.state === 'submitting';
  const [selectedProvider, setSelectedProvider] = useState<string>(
    defaultCourier || (availableCouriers.length > 0 ? availableCouriers[0] : '')
  );

  const { t, lang } = useTranslation();

  const formatDate = (date: string | Date) => {
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

  // Parse shipping address if it's a JSON string or use as is
  let shippingAddress: {
    address?: string;
    city?: string;
    postalCode?: string;
    district?: string;
    upazila?: string;
  } = {};
  if (order.shippingAddress) {
    try {
      const isJson =
        typeof order.shippingAddress === 'string' && order.shippingAddress.trim().startsWith('{');
      if (isJson) {
        shippingAddress = JSON.parse(order.shippingAddress);
      } else {
        shippingAddress = { address: order.shippingAddress };
      }
    } catch {
      // Fallback if JSON parse fails
      shippingAddress = {
        address: typeof order.shippingAddress === 'string' ? order.shippingAddress : '',
      };
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Styles */}
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

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="no-print">
          <Link
            to="/app/orders"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToOrders')}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('order')} {order.orderNumber}
              </h1>
              <p className="text-gray-600">{formatDate(order.createdAt as unknown as Date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status || 'pending'} />
              <a
                href={`/resources/order-invoice/${order.id}`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Download className="w-4 h-4" />
                {t('downloadPdf')}
              </a>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
              >
                <Printer className="w-4 h-4" />
                {t('printInvoice')}
              </button>
            </div>
          </div>
        </div>

        {/* Status Update - Hidden on Print */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 no-print">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('updateStatus')}</h2>
          <Form method="post" className="flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="submit"
                name="status"
                value={option.value}
                disabled={isUpdating || order.status === option.value}
                className={`
                  px-4 py-2 rounded-lg border text-sm font-medium transition
                  ${
                    order.status === option.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {order.status === option.value && <CheckCircle className="w-4 h-4 inline mr-1" />}
                {option.label.split(' ')[0]}
              </button>
            ))}
            {isUpdating && (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600 self-center" />
            )}
          </Form>
        </div>

        {/* Printable Invoice */}
        <div id="invoice-print" className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
            <div>
              {store?.logo ? (
                <img src={store.logo} alt={store.name} className="h-12 mb-2" />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{store?.name}</h2>
              )}
              <p className="text-sm text-gray-500">{t('invoice')}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
              <p className="text-sm text-gray-500">
                {formatDateShort(order.createdAt as unknown as Date)}
              </p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('billTo')}</h3>
              <p className="font-medium text-gray-900">{order.customerName || 'N/A'}</p>
              <p className="text-gray-600">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-gray-600">{order.customerEmail}</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('shipTo')}</h3>
              {shippingAddress.address && (
                <p className="text-gray-600">{shippingAddress.address}</p>
              )}
              {shippingAddress.upazila && (
                <p className="text-gray-600">{shippingAddress.upazila}</p>
              )}
              {shippingAddress.district && (
                <p className="text-gray-600">{shippingAddress.district}</p>
              )}
              {/* Fallback for city if district is missing */}
              {shippingAddress.city && !shippingAddress.district && (
                <p className="text-gray-600">{shippingAddress.city}</p>
              )}
              {shippingAddress.postalCode && (
                <p className="text-gray-600">Postal: {shippingAddress.postalCode}</p>
              )}
              {!shippingAddress.address && !shippingAddress.city && !shippingAddress.district && (
                <p className="text-gray-400">N/A</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-semibold text-gray-600">{t('item')}</th>
                <th className="text-center py-3 text-sm font-semibold text-gray-600">
                  {t('quantity')}
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600">
                  {t('price')}
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600">
                  {t('total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{item.title}</p>
                  </td>
                  <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {formatPrice(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('subtotal')}</span>
                <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('shipping')}</span>
                <span className="text-gray-900">{formatPrice(order.shipping || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('tax')}</span>
                <span className="text-gray-900">{formatPrice(order.tax || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-lg font-bold">
                <span>{t('total')}</span>
                <span className="text-emerald-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Thank you for your order!</p>
            <p className="mt-1">Powered by Ozzyl</p>
          </div>
        </div>

        {/* Non-print sections: Customer, Shipping, Summary cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              {t('customer')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('name')}</p>
                  <p className="font-medium text-gray-900">{order.customerName || 'N/A'}</p>
                </div>
                {order.customerPhone && (
                  <RiskBadge
                    phone={order.customerPhone}
                    initialData={
                      fraudCache as {
                        successRate: number;
                        totalOrders: number;
                        deliveredOrders: number;
                        returnedOrders: number;
                        isHighRisk: boolean;
                        riskScore: number;
                      } | null
                    }
                    orderId={order.id}
                    showDetails
                  />
                )}
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t('phone')}</p>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    {order.customerPhone || 'N/A'}
                  </a>
                </div>
              </div>
              {order.customerEmail && (
                <div>
                  <p className="text-sm text-gray-500">{t('email')}</p>
                  <p className="font-medium text-gray-900">{order.customerEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              Shipping Address
            </h2>
            <div className="space-y-1 text-gray-700">
              {shippingAddress.address && <p>{shippingAddress.address}</p>}
              {shippingAddress.upazila && <p>{shippingAddress.upazila}</p>}
              {shippingAddress.district && <p>{shippingAddress.district}</p>}
              {/* Fallback for city if district is missing */}
              {shippingAddress.city && !shippingAddress.district && <p>{shippingAddress.city}</p>}
              {shippingAddress.postalCode && <p>Postal: {shippingAddress.postalCode}</p>}
              {!shippingAddress.address && !shippingAddress.city && !shippingAddress.district && (
                <p className="text-gray-400">No address provided</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">{formatPrice(order.shipping || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">{formatPrice(order.tax || 0)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-emerald-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipment / Courier Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 no-print">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-gray-500" />
            Shipment
          </h2>

          {order.courierConsignmentId ? (
            // Already shipped — show courier info + tracking
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {/* Provider badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${
                      order.courierProvider === 'pathao'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : order.courierProvider === 'redx'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-orange-50 border-orange-200 text-orange-700'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    {order.courierProvider
                      ? order.courierProvider.charAt(0).toUpperCase() +
                        order.courierProvider.slice(1)
                      : 'Courier'}
                  </span>

                  {/* Courier status badge */}
                  {order.courierStatus && (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        ['delivered'].includes(order.courierStatus.toLowerCase())
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ['returned', 'cancelled'].includes(order.courierStatus.toLowerCase())
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ['booked', 'pending'].includes(order.courierStatus.toLowerCase())
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {order.courierStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Consignment ID */}
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Consignment ID</p>
                <p className="text-sm font-mono font-semibold text-gray-900">
                  {order.courierConsignmentId}
                </p>
              </div>

              {/* Track Shipment button */}
              <button
                type="button"
                onClick={() => setIsTrackingOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Track Shipment
              </button>
            </div>
          ) : (
            // Not shipped yet — show booking form
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                No shipment booked yet. Send this order to a courier for delivery.
              </p>

              {availableCouriers.length > 0 ? (
                <courierFetcher.Form method="post" className="space-y-3">
                  <input type="hidden" name="intent" value="bookCourier" />

                  {/* Provider Selector if multiple */}
                  {availableCouriers.length > 1 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Select Courier
                      </label>
                      <select
                        name="provider"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {availableCouriers.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Hidden input for single provider */}
                  {availableCouriers.length === 1 && (
                    <input type="hidden" name="provider" value={availableCouriers[0]} />
                  )}

                  <button
                    type="submit"
                    disabled={
                      isBooking || order.status === 'delivered' || order.status === 'cancelled'
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    {isBooking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send to{' '}
                    {selectedProvider
                      ? selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)
                      : 'Courier'}
                  </button>
                </courierFetcher.Form>
              ) : (
                <Link
                  to="/app/settings/courier"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  <Truck className="w-4 h-4" />
                  Connect Courier
                </Link>
              )}

              {/* Courier booking feedback */}
              {(() => {
                const data = courierFetcher.data as
                  | { error?: string; success?: boolean }
                  | undefined;
                if (data?.error) {
                  return <p className="text-sm text-red-600">{data.error}</p>;
                }
                if (data?.success) {
                  return <p className="text-sm text-emerald-600">Shipment booked successfully!</p>;
                }
                return null;
              })()}
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className="no-print">
          <OrderTimeline logs={activityLogs} orderId={order.id} isSubmitting={isUpdating} />
        </div>

        {/* Order Items - Screen only */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden no-print">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" />
              Items ({items.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(item.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tracking Timeline Modal */}
      {order.courierConsignmentId && (
        <TrackingTimeline
          consignmentId={order.courierConsignmentId}
          trackingCode={order.courierConsignmentId}
          currentStatus={order.courierStatus || undefined}
          courierProvider={
            (order.courierProvider as 'steadfast' | 'pathao' | 'redx') || 'steadfast'
          }
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />
      )}
    </>
  );
}

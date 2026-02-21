/**
 * RedX Courier API Route
 *
 * Route: /api/courier/redx
 *
 * Actions:
 * - BOOK_ORDER: Create RedX parcel and update order
 * - GET_STATUS: Check parcel delivery status
 * - SYNC_STATUS: Bulk sync parcel statuses (used by cron)
 * - CANCEL_ORDER: Cancel a RedX parcel (only if not picked up)
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, inArray } from 'drizzle-orm';
import { orders, orderItems, shipments } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { REDX_STATUS_MAP } from '~/services/redx.server';
import { calculateOrderWeight } from '~/lib/courier-weight.server';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

// ============================================================================
// ACTION HANDLER
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  const db = drizzle(context.cloudflare.env.DB);

  // Helper: get RedX client from store settings
  async function getRedXClient() {
    const unified = await getUnifiedStorefrontSettings(db, storeId!, {
      env: context.cloudflare.env,
    });
    const courierSettings = unified.courier;
    if (!courierSettings) {
      throw new Error('RedX not configured. Go to Settings > Courier.');
    }

    if (!courierSettings.redx?.apiKey) {
      throw new Error('RedX credentials not configured. Go to Settings > Courier.');
    }

    const { createRedXClient } = await import('~/services/redx.server');
    return createRedXClient({
      accessToken: courierSettings.redx.apiKey || '',
      baseUrl: courierSettings.redx.baseUrl || '',
    });
  }
  // ========================================
  // BOOK_ORDER - Create RedX parcel
  // ========================================
  if (intent === 'BOOK_ORDER') {
    const orderId = parseInt(formData.get('orderId') as string);

    if (!orderId) {
      return json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
      // Fetch order
      const orderResult = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
        .limit(1);

      if (!orderResult[0]) {
        return json({ error: 'Order not found' }, { status: 404 });
      }

      const order = orderResult[0];

      if (['cancelled', 'returned'].includes(order.status || '')) {
        return json(
          { error: 'Cannot book courier for cancelled or returned orders.' },
          { status: 400 }
        );
      }

      if (order.courierConsignmentId) {
        return json({ error: 'Order already has a shipment' }, { status: 400 });
      }

      const client = await getRedXClient();

      // Parse shipping address
      let address = 'Dhaka';
      let deliveryArea = 'Dhaka';
      const deliveryAreaId = 1; // RedX default area ID for Dhaka

      if (order.shippingAddress) {
        try {
          const parsed =
            typeof order.shippingAddress === 'string'
              ? JSON.parse(order.shippingAddress)
              : order.shippingAddress;
          const fullAddress = [
            parsed.address,
            parsed.upazila,
            parsed.district,
            parsed.city,
          ]
            .filter(Boolean)
            .join(', ');
          if (fullAddress) address = fullAddress;
          deliveryArea = parsed.district || parsed.city || 'Dhaka';
        } catch {
          // use defaults
        }
      }

      // Calculate weight from product metafields (min 0.5 kg → 500g for RedX)
      const orderItemsForWeight = await db
        .select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      const weightKg = await calculateOrderWeight(db, storeId, orderItemsForWeight);
      const weightGrams = Math.round(weightKg * 1000); // RedX uses grams

      // Create RedX parcel
      const result = await client.createParcel({
        customer_name: order.customerName || 'Customer',
        customer_phone: order.customerPhone || '',
        delivery_area: deliveryArea,
        delivery_area_id: deliveryAreaId,
        customer_address: address,
        merchant_invoice_id: order.orderNumber,
        cash_collection_amount: Math.round(order.total),
        parcel_weight: weightGrams,
        instruction: order.notes || undefined,
      });

      const trackingId = result.tracking_id;

      // Update order
      await db
        .update(orders)
        .set({
          courierProvider: 'redx',
          courierConsignmentId: trackingId,
          courierStatus: 'Pending Pickup',
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      // Create shipment record
      await db.insert(shipments).values({
        orderId,
        courier: 'redx',
        trackingNumber: trackingId,
        status: 'pending',
        courierData: JSON.stringify(result),
        shippedAt: new Date(),
      });

      return json({
        success: true,
        trackingId,
        consignmentId: trackingId,
      });
    } catch (error) {
      console.error('RedX book order error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Booking failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // GET_STATUS - Get single parcel status
  // ========================================
  if (intent === 'GET_STATUS') {
    const trackingId = formData.get('consignmentId') as string;

    if (!trackingId) {
      return json({ error: 'Tracking ID is required' }, { status: 400 });
    }

    try {
      const client = await getRedXClient();
      const info = await client.trackParcel(trackingId);

      const latestStatus = info.current_status || '';
      const normalizedStatus = REDX_STATUS_MAP[latestStatus] || 'processing';
      const isTerminal = ['Returned', 'Cancelled'].includes(latestStatus);
      const terminalType = latestStatus === 'Returned'
        ? 'returned'
        : latestStatus === 'Cancelled'
        ? 'cancelled'
        : undefined;

      // Map to timeline step (matches 5-step TrackingTimeline component)
      const timelineStep = (['Pending Pickup'].includes(latestStatus) ? 0
        : latestStatus === 'Picked Up' ? 1
        : latestStatus === 'In Transit' ? 2
        : latestStatus === 'Out for Delivery' ? 3
        : latestStatus === 'Delivered' ? 4
        : 0);

      return json({
        status: latestStatus,
        trackingCode: trackingId,
        normalizedStatus,
        timelineStep,
        isTerminal,
        terminalType,
        events: info.events || [],
      });
    } catch (error) {
      console.error('RedX get status error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Status check failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // CANCEL_ORDER - Cancel RedX parcel
  // ========================================
  if (intent === 'CANCEL_ORDER') {
    const trackingId = formData.get('consignmentId') as string;
    const orderId = parseInt(formData.get('orderId') as string);

    if (!trackingId || !orderId) {
      return json({ error: 'Tracking ID and Order ID are required' }, { status: 400 });
    }

    try {
      const client = await getRedXClient();
      const cancelled = await client.cancelParcel(trackingId);

      if (cancelled) {
        await db
          .update(orders)
          .set({
            courierStatus: 'Cancelled',
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

        // Update shipment record
        await db
          .update(shipments)
          .set({
            status: 'returned',
            updatedAt: new Date(),
          })
          .where(eq(shipments.orderId, orderId));

        return json({ success: true, message: 'Parcel cancelled successfully' });
      } else {
        return json(
          { error: 'Cannot cancel — parcel may already be picked up by RedX' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('RedX cancel error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Cancellation failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // SYNC_STATUS - Bulk sync RedX statuses
  // ========================================
  if (intent === 'SYNC_STATUS') {
    try {
      const client = await getRedXClient();

      // Get all active RedX orders
      const activeOrders = await db
        .select({
          id: orders.id,
          consignmentId: orders.courierConsignmentId,
          currentStatus: orders.courierStatus,
        })
        .from(orders)
        .where(
          and(
            eq(orders.storeId, storeId),
            eq(orders.courierProvider, 'redx'),
            inArray(orders.status, ['processing', 'shipped'])
          )
        );

      let updated = 0;
      const errors: string[] = [];

      for (const order of activeOrders) {
        if (!order.consignmentId) continue;

        try {
          const info = await client.trackParcel(order.consignmentId);
          const latestStatus = info.current_status || '';
          const normalizedStatus = REDX_STATUS_MAP[latestStatus] || 'processing';

          if (latestStatus !== order.currentStatus) {
            await db
              .update(orders)
              .set({
                courierStatus: latestStatus,
                status: normalizedStatus as 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned',
                updatedAt: new Date(),
              })
              .where(and(eq(orders.id, order.id), eq(orders.storeId, storeId)));

            // Update shipment record
            await db
              .update(shipments)
              .set({
                status: normalizedStatus as 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned',
                courierData: JSON.stringify(info),
                deliveredAt: normalizedStatus === 'delivered' ? new Date() : undefined,
                updatedAt: new Date(),
              })
              .where(eq(shipments.orderId, order.id));

            updated++;
          }
        } catch (error) {
          errors.push(
            `Order ${order.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return json({ success: true, updated, errors });
    } catch (error) {
      console.error('RedX sync status error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Sync failed' },
        { status: 500 }
      );
    }
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function () {}

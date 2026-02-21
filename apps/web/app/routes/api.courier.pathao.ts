/**
 * Pathao Courier API Route
 *
 * Route: /api/courier/pathao
 *
 * Actions:
 * - BOOK_ORDER: Create Pathao shipment and update order
 * - GET_STATUS: Check order delivery status
 * - SYNC_STATUS: Bulk sync shipment statuses
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, inArray } from 'drizzle-orm';
import { orders, orderItems, stores, shipments } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import {
  createPathaoClient,
  PATHAO_STATUS_MAP,
} from '~/services/pathao.server';
import { calculateOrderWeight } from '~/lib/courier-weight.server';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

/**
 * Map Pathao order status string to a timeline step index (0-4).
 * Matches the 5-step timeline used by TrackingTimeline component:
 * 0 = Order Placed, 1 = Picked Up, 2 = In Transit, 3 = Out for Delivery, 4 = Delivered
 */
function getPathaoTimelineStep(status: string): number {
  switch (status) {
    case 'Pending':
    case 'Pickup Requested':
      return 0;
    case 'Picked':
      return 1;
    case 'In Transit':
      return 2;
    case 'Delivered':
      return 4;
    // Returned/Cancelled are terminal — show last known progress step
    case 'Returned':
      return 2;
    case 'Cancelled':
      return 0;
    default:
      return 0;
  }
}

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

  // Helper: get Pathao client from store settings
  async function getPathaoClient() {
    const unified = await getUnifiedStorefrontSettings(db, storeId!, {
      env: context.cloudflare.env,
    });
    const courierSettings = unified.courier;
    if (!courierSettings) {
      throw new Error('Pathao not configured. Go to Settings > Courier.');
    }

    if (!courierSettings.pathao) {
      throw new Error('Pathao credentials not configured');
    }

    return {
      client: createPathaoClient({
        clientId: courierSettings.pathao.clientId || '',
        clientSecret: courierSettings.pathao.clientSecret || '',
        username: courierSettings.pathao.username || '',
        password: courierSettings.pathao.password || '',
        baseUrl: courierSettings.pathao.baseUrl || undefined,
      }),
      defaultStoreId: courierSettings.pathao.defaultStoreId as number | undefined,
    };
  }

  // ========================================
  // BOOK_ORDER - Create Pathao shipment
  // ========================================
  if (intent === 'BOOK_ORDER') {
    const orderId = parseInt(formData.get('orderId') as string);

    if (!orderId) {
      return json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
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

      // Check if order is cancelled
      if (['cancelled', 'returned'].includes(order.status || '')) {
        return json(
          { error: 'Cannot book courier for cancelled or returned orders. Please activate the order first.' },
          { status: 400 }
        );
      }

      // Check if already shipped
      if (order.courierConsignmentId) {
        return json(
          { error: 'Order already has a shipment' },
          { status: 400 }
        );
      }

      // ========== FRAUD CHECK (Fulfillment Gate) ==========
      if (order.customerPhone) {
        try {
          const { performFraudCheck, parseFraudSettings } = await import('~/services/fraud-engine.server');

          const fraudStoreResult = await db
            .select({ fraudSettings: stores.fraudSettings })
            .from(stores)
            .where(eq(stores.id, storeId))
            .limit(1);

          const fraudSettings = parseFraudSettings(fraudStoreResult[0]?.fraudSettings);

          if (fraudSettings.enabled) {
            const assessment = await performFraudCheck({
              phone: order.customerPhone,
              storeId,
              orderTotal: order.total,
              paymentMethod: order.paymentMethod || 'cod',
              shippingAddress: order.shippingAddress as string,
              db,
              orderId,
              settings: fraudSettings,
            });

            if (assessment.decision === 'block') {
              return json(
                {
                  error: `⛔ Fraud detected (Score: ${assessment.clampedScore}/100). This order is blocked.`,
                  riskScore: assessment.clampedScore,
                  decision: assessment.decision,
                  signals: assessment.signals,
                },
                { status: 403 }
              );
            }

            if (assessment.decision === 'hold') {
              return json(
                {
                  error: `⚠️ High risk order (Score: ${assessment.clampedScore}/100). Order is on HOLD for review. Go to Settings > Fraud Detection.`,
                  riskScore: assessment.clampedScore,
                  decision: assessment.decision,
                  signals: assessment.signals,
                },
                { status: 403 }
              );
            }
          }
        } catch (fraudError) {
          console.error('[FRAUD] Fraud check error during Pathao booking:', fraudError);
        }
      }

      const { client, defaultStoreId } = await getPathaoClient();

      if (!defaultStoreId) {
        return json(
          { error: 'No Pathao Store ID configured. Go to Settings > Courier and set a default store.' },
          { status: 400 }
        );
      }

      // Parse shipping address
      let recipientAddress = '';
      let recipientCity: number | undefined;
      let recipientZone: number | undefined;
      let recipientArea: number | undefined;

      if (order.shippingAddress) {
        const parsed = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
        // Build full address from all available components
        recipientAddress = [
          parsed.address,
          parsed.upazila,
          parsed.district,
          parsed.city,
          parsed.division,
        ].filter(Boolean).join(', ');
        recipientCity = parsed.pathao_city_id;
        recipientZone = parsed.pathao_zone_id;
        recipientArea = parsed.pathao_area_id;
      }

      // Fetch order items to calculate actual weight
      const orderItemsResult = await db
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      // Calculate weight from product metafields (min 0.5 kg)
      const itemWeight = await calculateOrderWeight(db, storeId, orderItemsResult);

      // Create Pathao order
      const result = await client.createOrder({
        store_id: defaultStoreId,
        merchant_order_id: order.orderNumber,
        recipient_name: order.customerName || 'Customer',
        recipient_phone: order.customerPhone || '',
        // Pathao requires recipient_address to be at least 10 characters
        recipient_address: recipientAddress.length >= 10
          ? recipientAddress
          : recipientAddress
            ? recipientAddress.padEnd(10, ' ').trim() || 'Dhaka, Bangladesh'
            : 'Dhaka, Bangladesh',
        recipient_city: recipientCity,
        recipient_zone: recipientZone,
        recipient_area: recipientArea,
        delivery_type: 48, // Normal delivery
        item_type: 2, // Parcel
        item_quantity: 1,
        item_weight: itemWeight, // Calculated from product metafields
        amount_to_collect: order.total,
        special_instruction: order.notes || undefined,
      });

      // Update order with courier info
      await db
        .update(orders)
        .set({
          courierProvider: 'pathao',
          courierConsignmentId: result.consignment_id,
          courierStatus: 'Pending',
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      // Create shipment record
      await db.insert(shipments).values({
        orderId,
        courier: 'pathao',
        trackingNumber: result.consignment_id,
        status: 'pending',
        courierData: JSON.stringify(result),
        shippedAt: new Date(),
      });

      return json({
        success: true,
        consignmentId: result.consignment_id,
        deliveryFee: result.delivery_fee,
      });
    } catch (error) {
      console.error('Pathao book order error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Booking failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // GET_STATUS - Get single order status
  // ========================================
  if (intent === 'GET_STATUS') {
    const consignmentId = formData.get('consignmentId') as string;

    if (!consignmentId) {
      return json({ error: 'Consignment ID is required' }, { status: 400 });
    }

    try {
      const { client } = await getPathaoClient();
      const status = await client.getOrderStatus(consignmentId);

      const normalizedStatus = PATHAO_STATUS_MAP[status.order_status] || 'processing';

      // Map Pathao status to timeline step index (0-4) to match Steadfast format
      const timelineStep = getPathaoTimelineStep(status.order_status);
      const isTerminal = ['Returned', 'Cancelled'].includes(status.order_status);
      const terminalType = status.order_status === 'Returned' ? 'returned'
        : status.order_status === 'Cancelled' ? 'cancelled'
        : undefined;

      return json({
        status: status.order_status,
        trackingCode: consignmentId,
        statusSlug: status.order_status_slug,
        normalizedStatus,
        timelineStep,
        isTerminal,
        terminalType,
        updatedAt: status.updated_at,
      });
    } catch (error) {
      console.error('Pathao get status error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Status check failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // CANCEL_ORDER - Cancel Pathao order
  // ========================================
  if (intent === 'CANCEL_ORDER') {
    const consignmentId = formData.get('consignmentId') as string;
    const orderId = parseInt(formData.get('orderId') as string);

    if (!consignmentId || !orderId) {
      return json({ error: 'Consignment ID and Order ID are required' }, { status: 400 });
    }

    try {
      const { client } = await getPathaoClient();
      const cancelled = await client.cancelOrder(consignmentId);

      if (cancelled) {
        // Update order
        await db
          .update(orders)
          .set({
            courierStatus: 'Cancelled',
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

        return json({ success: true, message: 'Order cancelled successfully' });
      } else {
        return json(
          { error: 'Cannot cancel - order may already be picked up' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Pathao cancel order error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Cancellation failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // SYNC_STATUS - Bulk sync Pathao statuses
  // ========================================
  if (intent === 'SYNC_STATUS') {
    try {
      const { client } = await getPathaoClient();

      // Get all in-transit orders with Pathao
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
            eq(orders.courierProvider, 'pathao'),
            inArray(orders.status, ['processing', 'shipped'])
          )
        );

      let updated = 0;
      const errors: string[] = [];

      for (const order of activeOrders) {
        if (!order.consignmentId) continue;

        try {
          const status = await client.getOrderStatus(order.consignmentId);
          const normalizedStatus = PATHAO_STATUS_MAP[status.order_status] || 'processing';

          if (status.order_status !== order.currentStatus) {
            await db
              .update(orders)
              .set({
                courierStatus: status.order_status,
                status: normalizedStatus as 'processing' | 'shipped' | 'delivered' | 'cancelled',
                updatedAt: new Date(),
              })
              .where(and(eq(orders.id, order.id), eq(orders.storeId, storeId)));

            // Update shipment record
            await db
              .update(shipments)
              .set({
                status: normalizedStatus as 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned',
                courierData: JSON.stringify(status),
                deliveredAt: normalizedStatus === 'delivered' ? new Date() : undefined,
                updatedAt: new Date(),
              })
              .where(eq(shipments.orderId, order.id));

            updated++;
          }
        } catch (error) {
          errors.push(`Order ${order.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return json({
        success: true,
        updated,
        errors,
      });
    } catch (error) {
      console.error('Pathao sync status error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Sync failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // BULK_BOOK_ORDERS - Bulk create Pathao shipments
  // ========================================
  if (intent === 'BULK_BOOK_ORDERS') {
    const orderIdsRaw = formData.get('orderIds') as string;
    if (!orderIdsRaw) {
      return json({ error: 'orderIds is required' }, { status: 400 });
    }

    const orderIds = orderIdsRaw.split(',').map((id) => parseInt(id.trim())).filter(Boolean);
    if (orderIds.length === 0) {
      return json({ error: 'No valid order IDs provided' }, { status: 400 });
    }

    try {
      const { client, defaultStoreId } = await getPathaoClient();

      const orderResults = await db
        .select()
        .from(orders)
        .where(and(inArray(orders.id, orderIds), eq(orders.storeId, storeId)));

      const skipped: { orderId: number; reason: string }[] = [];
      const payloads: { orderId: number; payload: Parameters<typeof client.createOrder>[0] }[] = [];

      for (const order of orderResults) {
        if (order.courierConsignmentId) {
          skipped.push({ orderId: order.id, reason: 'Already has a shipment' });
          continue;
        }
        if (['cancelled', 'returned'].includes(order.status || '')) {
          skipped.push({ orderId: order.id, reason: 'Order is cancelled or returned' });
          continue;
        }
        if (!order.customerPhone || !order.customerName || !order.shippingAddress) {
          skipped.push({ orderId: order.id, reason: 'Missing required customer info' });
          continue;
        }

        const pathaoStoreId = defaultStoreId ?? parseInt(formData.get('storeId') as string ?? '0');
        if (!pathaoStoreId) {
          skipped.push({ orderId: order.id, reason: 'No Pathao store ID configured' });
          continue;
        }

        // Fetch order items for this order to calculate weight
        const orderItemsForWeight = await db
          .select({
            productId: orderItems.productId,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        const bulkItemWeight = await calculateOrderWeight(db, storeId, orderItemsForWeight);

        // Build recipient address from shipping address JSON
        let bulkAddress = 'Dhaka, Bangladesh';
        if (order.shippingAddress) {
          try {
            const parsedAddr = typeof order.shippingAddress === 'string'
              ? JSON.parse(order.shippingAddress)
              : order.shippingAddress;
            const fullAddr = [parsedAddr.address, parsedAddr.upazila, parsedAddr.district, parsedAddr.city, parsedAddr.division]
              .filter(Boolean).join(', ');
            if (fullAddr.length >= 10) bulkAddress = fullAddr;
            else if (fullAddr) bulkAddress = fullAddr.padEnd(10, ' ').trim();
          } catch {
            // use default
          }
        }

        payloads.push({
          orderId: order.id,
          payload: {
            store_id: pathaoStoreId,
            merchant_order_id: String(order.id),
            recipient_name: order.customerName,
            recipient_phone: order.customerPhone,
            recipient_address: bulkAddress,
            delivery_type: 48,
            item_type: 2,
            item_quantity: 1,
            item_weight: bulkItemWeight, // Calculated from product metafields
            amount_to_collect: order.total,
          },
        });
      }

      if (payloads.length === 0) {
        return json({ success: true, booked: 0, skipped, errors: [] });
      }

      // Call Pathao bulk endpoint
      const bulkResults = await client.bulkCreateOrders(payloads.map((p) => p.payload));

      const booked: number[] = [];
      const errors: { orderId: number; error: string }[] = [];

      for (let i = 0; i < bulkResults.length; i++) {
        const result = bulkResults[i];
        const { orderId } = payloads[i];

        if (result.success && result.consignment_id) {
          // Update order with consignment ID
          await db
            .update(orders)
            .set({
              courierConsignmentId: result.consignment_id,
              courierProvider: 'pathao',
              status: 'processing',
              updatedAt: new Date(),
            })
            .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

          // Insert shipment record
          await db.insert(shipments).values({
            orderId,
            courier: 'pathao',
            trackingNumber: result.consignment_id,
            status: 'pending',
            courierData: JSON.stringify(result),
            shippedAt: new Date(),
          });

          booked.push(orderId);
        } else {
          errors.push({ orderId, error: result.error ?? 'Unknown error from Pathao' });
        }
      }

      return json({ success: true, booked, skipped, errors });
    } catch (error) {
      console.error('Pathao bulk order error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Bulk booking failed' },
        { status: 500 }
      );
    }
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function () {}

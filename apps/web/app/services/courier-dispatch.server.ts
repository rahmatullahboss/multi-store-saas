/**
 * courier-dispatch.server.ts
 *
 * Reusable helper for automatically booking an order with the store's
 * configured courier provider. Used by the auto-dispatch feature in the
 * fraud / order-automation system.
 *
 * Supports: Steadfast, Pathao, RedX
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders, orderItems } from '@db/schema';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import { calculateOrderWeight } from '~/lib/courier-weight.server';

export type AutoDispatchResult =
  | { success: true; provider: string; consignmentId: string }
  | { success: false; reason: string };

/**
 * Book an order with the store's configured courier automatically.
 * Called after an order is auto-confirmed (high delivery rate customer).
 *
 * @param DB      - D1Database binding
 * @param env     - Cloudflare env (for KV + courier secrets)
 * @param storeId - The store that owns the order
 * @param orderId - The order to dispatch
 */
export async function bookCourierForOrder(
  DB: D1Database,
  env: unknown,
  storeId: number,
  orderId: number
): Promise<AutoDispatchResult> {
  try {
    const db = drizzle(DB);

    // 1. Fetch the order
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
      .limit(1);

    if (!orderResult[0]) {
      return { success: false, reason: 'Order not found' };
    }

    const order = orderResult[0];

    // 2. Get unified courier settings (single source of truth)
    const unified = await getUnifiedStorefrontSettings(db, storeId, { env: env as unknown as Env });
    const courierSettings = unified.courier;

    if (!courierSettings) {
      return { success: false, reason: 'Courier not configured for this store' };
    }

    // 3. Determine which provider to use (merchant-selected default)
    const provider = courierSettings.provider as string | undefined;
    if (!provider) {
      return { success: false, reason: 'No default courier provider selected' };
    }

    // 4. Parse shipping address
    let address = 'Dhaka, Bangladesh';
    let city = '';
    let district = '';
    let upazila = '';

    if (order.shippingAddress) {
      try {
        const parsed =
          typeof order.shippingAddress === 'string'
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress;

        city = parsed.city || parsed.district || '';
        district = parsed.district || '';
        upazila = parsed.upazila || '';

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
        address =
          typeof order.shippingAddress === 'string' ? order.shippingAddress : 'Dhaka, Bangladesh';
      }
    }

    // 5. Book with the configured provider
    let consignmentId = '';

    if (provider === 'steadfast' && courierSettings.steadfast) {
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
    } else if (provider === 'pathao' && courierSettings.pathao) {
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
        return { success: false, reason: 'Pathao store ID missing in courier settings' };
      }

      // Calculate actual product weight from metafields
      const orderItemsForWeight = await db
        .select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      const itemWeight = await calculateOrderWeight(db, storeId, orderItemsForWeight);

      const result = await client.createOrder({
        store_id: configuredStoreId,
        merchant_order_id: order.orderNumber,
        recipient_name: order.customerName || 'Customer',
        recipient_phone: order.customerPhone || '',
        recipient_address:
          address.length >= 10 ? address : address ? address.padEnd(10, ' ').trim() : 'Dhaka, Bangladesh',
        delivery_type: 48,
        item_type: 2,
        item_quantity: 1,
        item_weight: itemWeight,
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
    } else {
      return { success: false, reason: `Provider "${provider}" not configured` };
    }

    // 6. Update order with courier info
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

    return { success: true, provider, consignmentId };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown courier dispatch error';
    console.error('[AUTO-DISPATCH] Courier booking failed:', reason);
    return { success: false, reason };
  }
}

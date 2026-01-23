/**
 * Public API - Single Order
 * 
 * Route: /api/v1/orders/:id
 * 
 * Authenticated via API Key (Bearer token)
 * Get a single order with its items.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders, orderItems } from '@db/schema';
import { authenticateApiKey } from '~/services/api.server';

// ============================================================================
// GET /api/v1/orders/:id - Get single order with items
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  try {
    const auth = await authenticateApiKey(request, context.cloudflare.env, 'read_orders');
    const db = drizzle(context.cloudflare.env.DB);
    
    const orderId = parseInt(params.id || '0');
    if (!orderId) {
      return json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    // Fetch order
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.storeId, auth.storeId)))
      .limit(1);

    if (!order) {
      return json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Fetch order items
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        variantId: orderItems.variantId,
        title: orderItems.title,
        variantTitle: orderItems.variantTitle,
        quantity: orderItems.quantity,
        price: orderItems.price,
        total: orderItems.total,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return json({
      success: true,
      data: {
        ...order,
        items,
      },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('API Order Detail Error:', error);
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

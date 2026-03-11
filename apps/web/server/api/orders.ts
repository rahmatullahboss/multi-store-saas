/**
 * Orders API Routes
 * 
 * Order management with automatic store_id filtering.
 */

import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, products, type NewOrder, type NewOrderItem } from '@db/schema';
import type { TenantEnv, TenantContext } from '../middleware/tenant';

type OrdersContext = {
  Bindings: TenantEnv;
  Variables: TenantContext;
};

export const ordersApi = new Hono<OrdersContext>();

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * GET /api/orders
 * List all orders for the current store
 */
ordersApi.get('/', async (c) => {
  const storeId = c.get('storeId');
  const db = drizzle(c.env.DB);
  
  const status = c.req.query('status');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);
  
  const result = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.storeId, storeId),
        status ? eq(orders.status, status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') : undefined
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
  
  return c.json({
    orders: result,
    pagination: { limit, offset, hasMore: result.length === limit },
  });
});

/**
 * GET /api/orders/:id
 * Get a single order with items
 */
ordersApi.get('/:id', async (c) => {
  const storeId = c.get('storeId');
  const orderId = parseInt(c.req.param('id'), 10);
  const db = drizzle(c.env.DB);
  
  const orderResult = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.storeId, storeId)
      )
    )
    .limit(1);
  
  if (!orderResult[0]) {
    return c.json({ error: 'Order not found' }, 404);
  }
  
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  
  return c.json({
    order: orderResult[0],
    items,
  });
});

/**
 * POST /api/orders
 * Create a new order (checkout)
 */
ordersApi.post('/', async (c) => {
  const storeId = c.get('storeId');
  const db = drizzle(c.env.DB);
  
  interface CartItem {
    productId: number;
    quantity: number;
  }
  
  interface OrderBody {
    customerEmail: string;
    customerName?: string;
    shippingAddress?: string;
    billingAddress?: string;
    items: CartItem[];
    notes?: string;
  }
  
  const body = await c.req.json<OrderBody>();
  
  // Validate items exist and belong to this store
  const productIds = body.items.map(item => item.productId);
  const storeProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId)
      )
    );
  
  const productMap = new Map(storeProducts.map(p => [p.id, p]));
  
  // Calculate totals
  let subtotal = 0;
  const orderItemsData: Omit<NewOrderItem, 'orderId'>[] = [];
  
  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return c.json({ error: `Product ${item.productId} not found` }, 400);
    }
    
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    
    orderItemsData.push({
      productId: product.id,
      title: product.title,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal,
    });
  }
  
  // TODO: Calculate tax and shipping based on store settings
  // [SKIPPED] Complex: requires fetching store settings and changing order calculation logic
  const tax = 0;
  const shipping = 0;
  const total = subtotal + tax + shipping;
  
  // Create order
  const orderResult = await db
    .insert(orders)
    .values({
      storeId,
      orderNumber: generateOrderNumber(),
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      subtotal,
      tax,
      shipping,
      total,
      notes: body.notes,
      status: 'pending',
      paymentStatus: 'pending',
    })
    .returning();
  
  const order = orderResult[0];
  
  // Create order items
  const items = await db
    .insert(orderItems)
    .values(
      orderItemsData.map(item => ({
        ...item,
        orderId: order.id,
      }))
    )
    .returning();
  
  return c.json({ order, items }, 201);
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
ordersApi.patch('/:id/status', async (c) => {
  const storeId = c.get('storeId');
  const orderId = parseInt(c.req.param('id'), 10);
  const db = drizzle(c.env.DB);
  
  const { status } = await c.req.json<{ status: string }>();
  
  const result = await db
    .update(orders)
    .set({
      status: status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.storeId, storeId)
      )
    )
    .returning();
  
  if (!result[0]) {
    return c.json({ error: 'Order not found' }, 404);
  }
  
  return c.json({ order: result[0] });
});

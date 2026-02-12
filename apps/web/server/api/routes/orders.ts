/**
 * Orders API Routes
 * 
 * Order management with automatic store_id filtering.
 */

import { Hono } from 'hono';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { customers, orders, orderItems, products, type NewOrderItem } from '@db/schema';
import type { TenantEnv, TenantContext } from '../../middleware/tenant';
import { recalculateCustomerSegment } from '../../services/customer-segmentation';
import { checkUsageLimit } from '../../../app/utils/plans.server';

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
    customerPhone?: string; // Add phone for lookup
    customerName?: string;
    shippingAddress?: string;
    billingAddress?: string;
    items: CartItem[];
    notes?: string;
  }
  
  const body = await c.req.json<OrderBody>();

  const limitCheck = await checkUsageLimit(c.env.DB, storeId, 'order');
  if (!limitCheck.allowed) {
    return c.json(
      {
        error: limitCheck.error?.message ?? 'Monthly order limit reached. Upgrade to accept more orders.',
        code: 'LIMIT_REACHED_ORDER',
        limit: limitCheck.error?.limit,
        current: limitCheck.error?.current,
      },
      402
    );
  }
  
  // Validate items exist and belong to this store
  const productIds = body.items.map(item => item.productId);
  const storeProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        inArray(products.id, productIds)
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
  const tax = 0;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  // ---------------------------------------------------------
  // CUSTOMER LINKING LOGIC
  // ---------------------------------------------------------
  let customerId: number | null = null;
  
  if (body.customerEmail) {
    // 1. Try to find existing customer
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.storeId, storeId),
          eq(customers.email, body.customerEmail)
        )
      )
      .get();
      
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // 2. Create new customer
      const newCustomer = await db
        .insert(customers)
        .values({
          storeId,
          email: body.customerEmail,
          name: body.customerName,
          phone: body.customerPhone,
          segment: 'new',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .get();
        
      customerId = newCustomer.id;
    }
  }
  
  // Create order
  const orderResult = await db
    .insert(orders)
    .values({
      storeId,
      customerId, // Link to customer
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

  // ---------------------------------------------------------
  // SEGMENTATION TRIGGER
  // ---------------------------------------------------------
  if (customerId) {
    // Fire and forget using Cloudflare waitUntil to avoid blocking the response
    c.executionCtx.waitUntil(
      recalculateCustomerSegment(db, customerId, storeId).catch(err => {
        console.error('Failed to recalculate segment:', err);
      })
    );
  }

  // Dispatch Webhook Event
  try {
    if (c.env.WEBHOOK_QUEUE) {
      await c.env.WEBHOOK_QUEUE.send({
        topic: 'orders/create',
        storeId,
        payload: {
          id: order.id,
          order_number: order.orderNumber,
          total: order.total,
          currency: 'BDT', // TODO: Fetch from store config
          customer: {
            id: customerId,
            name: order.customerName,
            email: order.customerEmail,
          },
          items: items.map(i => ({
            id: i.id,
            product_id: i.productId,
            quantity: i.quantity,
            price: i.price
          })),
          created_at: order.createdAt
        }
      });
      // console.log(`[Webhook] Dispatched orders/create for Order #${order.id}`);
    } else {
      console.warn('[Webhook] WEBHOOK_QUEUE not bound');
    }
  } catch (err) {
    console.error('[Webhook] Failed to dispatch event:', err);
    // Non-blocking error
  }
  
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

  // Also recalculate segment on status change (e.g. cancelled vs delivered)
  // For now, simple recalculation
  if (result[0].customerId) {
    c.executionCtx.waitUntil(recalculateCustomerSegment(db, result[0].customerId, storeId));
  }
  
  return c.json({ order: result[0] });
});

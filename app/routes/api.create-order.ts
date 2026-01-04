/**
 * Order Creation API Route
 * 
 * POST /api/create-order
 * 
 * Handles order submissions from Landing Pages and Store checkout.
 * This route is NOT cached - always dynamic.
 * 
 * Input: store_id, product_id, customer_name, phone, address, quantity
 * Output: { success: true, orderId: "..." }
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { orders, products, stores } from '@db/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const OrderSchema = z.object({
  store_id: z.number().int().positive('Store ID is required'),
  product_id: z.number().int().positive('Product ID is required'),
  customer_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500),
  quantity: z.number().int().min(1).max(99).default(1),
  notes: z.string().max(500).optional(),
});

type OrderInput = z.infer<typeof OrderSchema>;

// ============================================================================
// ACTION HANDLER
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  // Only allow POST
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const parseResult = OrderSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errors = parseResult.error.flatten();
      return json(
        { 
          success: false, 
          error: 'Validation failed',
          details: errors.fieldErrors 
        },
        { status: 400 }
      );
    }

    const input: OrderInput = parseResult.data;

    // Verify store exists and is active
    const store = await db
      .select()
      .from(stores)
      .where(and(eq(stores.id, input.store_id), eq(stores.isActive, true)))
      .limit(1);

    if (store.length === 0) {
      return json(
        { success: false, error: 'Store not found or inactive' },
        { status: 404 }
      );
    }

    // Verify product exists and belongs to store
    const product = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, input.product_id),
          eq(products.storeId, input.store_id),
          eq(products.isPublished, true)
        )
      )
      .limit(1);

    if (product.length === 0) {
      return json(
        { success: false, error: 'Product not found or unavailable' },
        { status: 404 }
      );
    }

    // Calculate total
    const unitPrice = product[0].price;
    const subtotal = unitPrice * input.quantity;

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Create the order
    const result = await db
      .insert(orders)
      .values({
        storeId: input.store_id,
        orderNumber,
        status: 'pending',
        customerName: input.customer_name,
        customerEmail: null, // Optional for COD
        customerPhone: input.phone,
        shippingAddress: input.address,
        subtotal,
        tax: 0, // Can be calculated based on store settings
        shipping: 0, // Can be fetched from store settings
        total: subtotal,
        notes: input.notes || `Product: ${product[0].title} x ${input.quantity}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    return json({
      success: true,
      orderId: result[0].id,
      orderNumber: result[0].orderNumber,
      message: 'Order placed successfully! We will contact you shortly.',
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    return json(
      { 
        success: false, 
        error: 'Failed to process order. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// LOADER (GET requests return method info)
// ============================================================================
export async function loader() {
  return json({
    method: 'POST',
    description: 'Create a new order',
    fields: ['store_id', 'product_id', 'customer_name', 'phone', 'address', 'quantity', 'notes?'],
  });
}

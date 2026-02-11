/**
 * Cart Tracking API Route
 * 
 * POST /api/track-cart
 * 
 * Tracks abandoned carts by capturing form data when users
 * start filling out order forms but don't complete checkout.
 * 
 * This enables cart recovery features like email reminders.
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { abandonedCarts, products, stores } from '@db/schema';
import { eq, and, or } from 'drizzle-orm';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const TrackCartSchema = z.object({
  store_id: z.number().int().positive('Store ID is required'),
  product_id: z.number().int().positive('Product ID is required'),
  session_id: z.string().min(10, 'Session ID is required'),
  customer_name: z.string().max(100).optional(),
  customer_email: z.string().email().optional().or(z.literal('')),
  customer_phone: z.string().max(20).optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  variant_id: z.number().int().optional(),
  variant_info: z.string().optional(),
});

type TrackCartInput = z.infer<typeof TrackCartSchema>;

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
    const parseResult = TrackCartSchema.safeParse(body);
    
    if (!parseResult.success) {
      return json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      );
    }

    const input: TrackCartInput = parseResult.data;

    // Skip if no contact info provided (can't recover without it)
    if (!input.customer_phone && !input.customer_email) {
      return json({ success: true, tracked: false, reason: 'No contact info' });
    }

    // Verify store exists and is active
    const storeResult = await db
      .select({ id: stores.id, currency: stores.currency })
      .from(stores)
      .where(and(eq(stores.id, input.store_id), eq(stores.isActive, true)))
      .limit(1);

    if (storeResult.length === 0) {
      return json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Fetch product details for cart item info
    const productResult = await db
      .select({ 
        id: products.id, 
        title: products.title, 
        price: products.price,
        images: products.images 
      })
      .from(products)
      .where(
        and(
          eq(products.id, input.product_id),
          eq(products.storeId, input.store_id),
          eq(products.isPublished, true)
        )
      )
      .limit(1);

    if (productResult.length === 0) {
      return json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const product = productResult[0];
    const unitPrice = product.price;
    const totalAmount = unitPrice * input.quantity;

    // Build cart items JSON - extract first image from images JSON array
    const productImages = product.images ? JSON.parse(product.images) : [];
    const firstImage = Array.isArray(productImages) && productImages.length > 0 ? productImages[0] : null;
    
    const cartItems = JSON.stringify([{
      productId: product.id,
      title: input.variant_info 
        ? `${product.title} (${input.variant_info})` 
        : product.title,
      quantity: input.quantity,
      price: unitPrice,
      image: firstImage,
    }]);

    const now = new Date();

    // Check for existing abandoned cart by sessionId, phone, or email
    const existingCart = await db
      .select({ id: abandonedCarts.id })
      .from(abandonedCarts)
      .where(
        and(
          eq(abandonedCarts.storeId, input.store_id),
          eq(abandonedCarts.status, 'abandoned'),
          or(
            eq(abandonedCarts.sessionId, input.session_id),
            input.customer_phone 
              ? eq(abandonedCarts.customerPhone, input.customer_phone) 
              : undefined,
            input.customer_email 
              ? eq(abandonedCarts.customerEmail, input.customer_email) 
              : undefined
          )
        )
      )
      .limit(1);

    if (existingCart.length > 0) {
      // Update existing cart
      await db
        .update(abandonedCarts)
        .set({
          customerName: input.customer_name || null,
          customerEmail: input.customer_email || null,
          customerPhone: input.customer_phone || null,
          cartItems,
          totalAmount,
          currency: storeResult[0].currency || 'BDT',
        })
        .where(eq(abandonedCarts.id, existingCart[0].id));

      return json({ success: true, tracked: true, action: 'updated' });
    }

    // Insert new abandoned cart record
    await db.insert(abandonedCarts).values({
      storeId: input.store_id,
      sessionId: input.session_id,
      customerName: input.customer_name || null,
      customerEmail: input.customer_email || null,
      customerPhone: input.customer_phone || null,
      cartItems,
      totalAmount,
      currency: storeResult[0].currency || 'BDT',
      abandonedAt: now,
      status: 'abandoned',
      recoveryEmailSent: false,
    });

    return json({ success: true, tracked: true, action: 'created' });

  } catch (error) {
    console.error('Cart tracking error:', error);
    // Fail silently - don't break the user experience for tracking
    return json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}

// ============================================================================
// LOADER (GET requests return method info)
// ============================================================================
export async function loader() {
  return json({
    method: 'POST',
    description: 'Track abandoned cart data',
    required_fields: ['store_id', 'product_id', 'session_id'],
    optional_fields: ['customer_name', 'customer_email', 'customer_phone', 'quantity', 'variant_id'],
  });
}


export default function() {}

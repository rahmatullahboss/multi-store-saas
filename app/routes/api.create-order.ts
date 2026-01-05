/**
 * Order Creation API Route
 * 
 * POST /api/create-order
 * 
 * Handles order submissions from Landing Pages and Store checkout.
 * This route is NOT cached - always dynamic.
 * 
 * SECURITY: Server-side price calculation - NEVER trust frontend prices
 * 
 * Input: store_id, product_id, customer_name, phone, address, quantity
 * Output: { success: true, orderId: "...", orderNumber: "..." }
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, products, stores, users } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { createEmailService } from '~/services/email.server';
import { checkUsageLimit } from '~/utils/plans.server';

// ============================================================================
// VALIDATION SCHEMA with BD Phone validation
// ============================================================================
const bdPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;

const OrderSchema = z.object({
  store_id: z.number().int().positive('Store ID is required'),
  product_id: z.number().int().positive('Product ID is required'),
  customer_name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে').max(100),
  phone: z.string()
    .min(10, 'মোবাইল নম্বর কমপক্ষে ১০ সংখ্যা হতে হবে')
    .max(20)
    .refine(val => bdPhoneRegex.test(val.replace(/[\s-]/g, '')), {
      message: 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (01XXXXXXXXX)',
    }),
  address: z.string().min(10, 'ঠিকানা কমপক্ষে ১০ অক্ষর হতে হবে').max(500),
  quantity: z.number().int().min(1).max(99).default(1),
  notes: z.string().max(500).optional(),
  customer_email: z.string().email().optional(), // Optional email for confirmation
});

type OrderInput = z.infer<typeof OrderSchema>;

// ============================================================================
// GENERATE ORDER NUMBER
// ============================================================================
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

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
          error: 'ভ্যালিডেশন ব্যর্থ',
          details: errors.fieldErrors 
        },
        { status: 400 }
      );
    }

    const input: OrderInput = parseResult.data;

    // Verify store exists and is active
    const storeResult = await db
      .select()
      .from(stores)
      .where(and(eq(stores.id, input.store_id), eq(stores.isActive, true)))
      .limit(1);

    if (storeResult.length === 0) {
      return json(
        { success: false, error: 'স্টোর পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const storeData = storeResult[0];

    // ========================================================================
    // PLAN LIMIT CHECK - Block orders if monthly limit reached
    // ========================================================================
    const limitCheck = await checkUsageLimit(context.cloudflare.env.DB, input.store_id, 'order');
    
    if (!limitCheck.allowed) {
      return json(
        {
          success: false,
          error: limitCheck.error?.message || 'Monthly order limit reached. Upgrade to accept more orders.',
          code: 'LIMIT_REACHED',
          limit: limitCheck.error?.limit,
          current: limitCheck.error?.current,
        },
        { status: 402 } // Payment Required - upgrade needed
      );
    }

    // SECURITY: Fetch REAL product price from database
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
        { success: false, error: 'প্রোডাক্ট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // SECURITY: Calculate price on SERVER, never trust frontend
    const productData = product[0];
    const unitPrice = productData.price;
    const itemTotal = unitPrice * input.quantity;
    const subtotal = itemTotal;
    const tax = 0; // Can be calculated based on store settings
    const shipping = 0; // Can be calculated based on store settings
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = generateOrderNumber();
    const now = new Date();

    // Use D1 Batch/Transaction to insert order and order_items together
    // Step 1: Insert order
    const orderResult = await db
      .insert(orders)
      .values({
        storeId: input.store_id,
        orderNumber,
        status: 'pending',
        paymentStatus: 'pending', // COD - payment pending until delivery
        customerName: input.customer_name,
        customerPhone: input.phone,
        customerEmail: input.customer_email || null,
        shippingAddress: input.address,
        billingAddress: null,
        subtotal,
        tax,
        shipping,
        total,
        notes: input.notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    const orderId = orderResult[0].id;

    // Step 2: Insert order item
    await db
      .insert(orderItems)
      .values({
        orderId,
        productId: productData.id,
        title: productData.title,
        quantity: input.quantity,
        price: unitPrice,
        total: itemTotal,
      });

    // ============================================================================
    // SEND EMAIL NOTIFICATIONS (non-blocking)
    // ============================================================================
    const resendApiKey = context.cloudflare.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      const emailService = createEmailService(resendApiKey);
      
      // Send order confirmation to customer (if email provided)
      if (input.customer_email) {
        context.cloudflare.ctx.waitUntil(
          emailService.sendOrderConfirmation({
            orderNumber,
            customerName: input.customer_name,
            customerEmail: input.customer_email,
            total,
            currency: storeData.currency || 'BDT',
            items: [{
              title: productData.title,
              quantity: input.quantity,
              price: unitPrice,
            }],
            shippingAddress: input.address,
            paymentMethod: 'Cash on Delivery',
          })
        );
      }

      // Send new order alert to merchant
      const merchantUser = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.storeId, input.store_id))
        .limit(1);

      if (merchantUser.length > 0 && merchantUser[0].email) {
        context.cloudflare.ctx.waitUntil(
          emailService.sendNewOrderAlert({
            merchantEmail: merchantUser[0].email,
            storeName: storeData.name,
            orderNumber,
            customerName: input.customer_name,
            total,
            currency: storeData.currency || 'BDT',
            itemCount: input.quantity,
          })
        );
      }
    }

    return json({
      success: true,
      orderId,
      orderNumber,
      total,
      message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে! শীঘ্রই আমরা আপনার সাথে যোগাযোগ করবো।',
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    return json(
      { 
        success: false, 
        error: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
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
    description: 'Create a new Cash on Delivery order',
    required_fields: ['store_id', 'product_id', 'customer_name', 'phone', 'address'],
    optional_fields: ['quantity (default: 1)', 'notes'],
  });
}

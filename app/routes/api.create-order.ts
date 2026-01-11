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
import { orders, orderItems, products, productVariants, stores, users, abandonedCarts, orderBumps, upsellOffers, upsellTokens, pushSubscriptions } from '@db/schema';
import { eq, and, or, inArray, sql, gte } from 'drizzle-orm';
import { createEmailService } from '~/services/email.server';
import { sendPushNotification } from '~/services/push.server';
import { dispatchWebhook } from '~/services/webhook.server';
import { checkUsageLimit } from '~/utils/plans.server';
import { parseShippingConfig, calculateShipping, BD_DIVISIONS } from '~/utils/shipping';
import { sendPurchaseEvent } from '~/services/facebook-capi.server';

// ============================================================================
// VALIDATION SCHEMA with BD Phone validation
// ============================================================================
const bdPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;

// Valid division values
const validDivisions = BD_DIVISIONS.map(d => d.value);

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
  division: z.enum(validDivisions as [string, ...string[]]).default('dhaka'), // Inside/Outside Dhaka
  quantity: z.number().int().min(1).max(99).default(1),
  notes: z.string().max(500).optional(),
  customer_email: z.string().email().optional(), // Optional email for confirmation
  payment_method: z.string().default('cod'), // 'cod', 'bkash', 'nagad'
  transaction_id: z.string().optional(),
  variant_id: z.number().int().optional(), // Product variant ID
  manual_payment_details: z.object({
    senderNumber: z.string().optional(),
    method: z.string().optional(),
  }).optional(),
  bump_ids: z.array(z.number().int().positive()).optional(), // Order bump product IDs
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

    // Extend Schema for Cart Items
    const CartItemSchema = z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().min(1),
      variant_id: z.number().int().optional(),
    });

    const ExtendedOrderSchema = OrderSchema.extend({
      // Optional now because we might have cart_items
      product_id: z.number().int().positive().optional(), 
      quantity: z.number().int().min(1).max(99).default(1),
      
      cart_items: z.array(CartItemSchema).optional(),
    }).refine(data => {
        // Either product_id (single) OR cart_items (multi) must be present
        return data.product_id || (data.cart_items && data.cart_items.length > 0);
    }, {
        message: "Either product_id or cart_items must be provided",
        path: ["product_id"] // Attach error to product_id
    });
    
    // Validate input
    const parseResult = ExtendedOrderSchema.safeParse(body);
    
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

    const input = parseResult.data;

    // Normalize input to a list of items
    let orderItemsData: { productId: number; quantity: number; variantId?: number }[] = [];
    
    if (input.cart_items && input.cart_items.length > 0) {
        orderItemsData = input.cart_items.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
            variantId: item.variant_id
        }));
    } else if (input.product_id) {
        orderItemsData = [{
            productId: input.product_id,
            quantity: input.quantity,
            variantId: input.variant_id
        }];
    }

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

    // ========================================================================
    // PROCESS ITEMS (Fetch Prices & Check Inventory)
    // ========================================================================
    const productIds = orderItemsData.map(i => i.productId);
    const dbProducts = await db.select().from(products)
        .where(and(eq(products.storeId, input.store_id), inArray(products.id, productIds)));
    
    // Fetch variants if involved
    const variantIds = orderItemsData.map(i => i.variantId).filter(Boolean) as number[];
    let dbVariants: any[] = [];
    if (variantIds.length > 0) {
        dbVariants = await db.select().from(productVariants)
            .where(inArray(productVariants.id, variantIds));
    }

    let subtotal = 0;
    const finalOrderItems = [];

    for (const item of orderItemsData) {
        const product = dbProducts.find(p => p.id === item.productId);
        if (!product || !product.isPublished) {
             return json({ success: false, error: `Product ID ${item.productId} not found or unavailable` }, { status: 400 });
        }

        let unitPrice = product.price;
        let variantInfo = null;
        let currentStock = product.inventory || 0;
        let isVariantStock = false;
        let variantIdToUpdate = null;

        if (item.variantId) {
            const variant = dbVariants.find(v => v.id === item.variantId);
            if (variant) {
                unitPrice = variant.price || unitPrice;
                currentStock = variant.inventory || 0;
                variantInfo = [variant.option1Value, variant.option2Value].filter(Boolean).join(' - ');
                variantIdToUpdate = variant.id;
                isVariantStock = true;
            }
        }

        // Check Stock
        if (currentStock < item.quantity) {
             return json({ success: false, error: `Stock unavailable for ${product.title}` }, { status: 400 });
        }

        // Add to list for atomic update later (or do optimistic check here)
        finalOrderItems.push({
            ...item,
            title: variantInfo ? `${product.title} (${variantInfo})` : product.title,
            variantTitle: variantInfo,
            unitPrice,
            total: unitPrice * item.quantity,
            isVariantStock,
            variantIdToUpdate,
            product // keep ref
        });

        subtotal += unitPrice * item.quantity;
    }
    
    // Handle Order Bumps (Only support bumps for the "first" main product logic or general logic?)
    // Decision: Supports bumps only relative to the PRIMARY product if single, or just add them.
    // Logic: Bumps are separate items.
    interface BumpItem {
      bumpId: number;
      productId: number;
      title: string;
      price: number;
      discountedPrice: number;
    }
    const bumpItems: BumpItem[] = [];
    
    if (input.bump_ids && input.bump_ids.length > 0) {
       // Fetch active bumps based on IDs (we trust IDs belong to store)
       // We only validate store_id
      const activeBumps = await db
        .select({
          id: orderBumps.id,
          bumpProductId: orderBumps.bumpProductId,
          title: orderBumps.title,
          discount: orderBumps.discount,
        })
        .from(orderBumps)
        .where(
          and(
            eq(orderBumps.storeId, input.store_id),
            eq(orderBumps.isActive, true),
            inArray(orderBumps.id, input.bump_ids)
          )
        );
      
      if (activeBumps.length > 0) {
        const bumpProductIds = activeBumps.map(b => b.bumpProductId);
        const bumpProducts = await db.select({id: products.id, title: products.title, price: products.price})
          .from(products).where(and(eq(products.storeId, input.store_id), inArray(products.id, bumpProductIds)));
        
        for (const bump of activeBumps) {
          const bumpProduct = bumpProducts.find(p => p.id === bump.bumpProductId);
          if (bumpProduct) {
            const discountValue = bump.discount ?? 0;
            const discountedPrice = discountValue > 0 ? bumpProduct.price * (1 - discountValue / 100) : bumpProduct.price;
            
            bumpItems.push({
              bumpId: bump.id,
              productId: bumpProduct.id,
              title: bump.title || bumpProduct.title,
              price: bumpProduct.price,
              discountedPrice,
            });
            subtotal += discountedPrice;
          }
        }
        
        // Update stats
        context.cloudflare.ctx.waitUntil(
            Promise.all(input.bump_ids!.map(bumpId => 
              context.cloudflare.env.DB.prepare('UPDATE order_bumps SET conversions = conversions + 1 WHERE id = ?').bind(bumpId).run()
            )).catch(e => console.error('Failed to update bump conversions:', e))
        );
      }
    }
    
    // Calculate shipping
    const shippingConfig = parseShippingConfig(storeData.shippingConfig as string | null);
    const shippingResult = calculateShipping(shippingConfig, input.division, subtotal);
    const shipping = shippingResult.cost;
    const tax = 0;
    
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = generateOrderNumber();
    const now = new Date();

    // ========================================================================
    // DATABASE TRANSACTION (Manual)
    // ========================================================================
    // 1. DEDUCT INVENTORY FIRST (Fail fast)
    // We need to loop and update. If any fails, we must rollback previous ones.
    // Since D1 doesn't have full ACID transactions across multiple calls easily without batch,
    // we will optimistic-update and rollback if needed.
    
    const inventoryRollbacks: { type: 'product' | 'variant', id: number, qty: number }[] = [];
    
    try {
        for (const item of finalOrderItems) {
            let res;
            if (item.isVariantStock && item.variantIdToUpdate) {
                res = await db.update(productVariants)
                    .set({ inventory: sql`${productVariants.inventory} - ${item.quantity}` })
                    .where(and(eq(productVariants.id, item.variantIdToUpdate), gte(productVariants.inventory, item.quantity)))
                    .returning({ id: productVariants.id });
                if (res.length > 0) inventoryRollbacks.push({ type: 'variant', id: item.variantIdToUpdate, qty: item.quantity });
            } else {
                res = await db.update(products)
                    .set({ inventory: sql`${products.inventory} - ${item.quantity}` })
                    .where(and(eq(products.id, item.product.id), gte(products.inventory, item.quantity)))
                    .returning({ id: products.id });
                if (res.length > 0) inventoryRollbacks.push({ type: 'product', id: item.product.id, qty: item.quantity });
            }
            
            if (res.length === 0) {
                throw new Error(`Stock unavailable for ${item.title}`);
            }
        }
    } catch (stockError) {
        // Rollback inventory
        console.error('Stock deduction failed, rolling back:', stockError);
        for (const rb of inventoryRollbacks) {
            if (rb.type === 'variant') {
                await db.update(productVariants).set({ inventory: sql`${productVariants.inventory} + ${rb.qty}` }).where(eq(productVariants.id, rb.id));
            } else {
                await db.update(products).set({ inventory: sql`${products.inventory} + ${rb.qty}` }).where(eq(products.id, rb.id));
            }
        }
        return json({ success: false, error: stockError instanceof Error ? stockError.message : 'Inventory Error' }, { status: 400 });
    }

    // 2. CREATE ORDER
    let orderId: number | undefined;
    try {
      const orderResult = await db.insert(orders).values({
          storeId: input.store_id,
          orderNumber,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: input.payment_method,
          transactionId: input.transaction_id || null,
          manualPaymentDetails: input.manual_payment_details ? JSON.stringify(input.manual_payment_details) : null,
          customerName: input.customer_name,
          customerPhone: input.phone,
          customerEmail: input.customer_email || '',
          shippingAddress: input.address,
          billingAddress: null,
          subtotal,
          tax,
          shipping,
          total,
          notes: input.notes || null,
          createdAt: now,
          updatedAt: now,
        }).returning({ id: orders.id });

      orderId = orderResult[0].id;

      // 3. INSERT ITEMS
      await db.insert(orderItems).values([
          ...finalOrderItems.map(item => ({
              orderId: orderId!,
              productId: item.productId,
              variantId: item.variantId || null,
              title: item.title,
              variantTitle: item.variantTitle || null,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.total
          })),
          ...bumpItems.map(bump => ({
              orderId: orderId!,
              productId: bump.productId,
              title: `[Bump] ${bump.title}`,
              quantity: 1,
              price: bump.discountedPrice,
              total: bump.discountedPrice
          }))
      ]);

    } catch (orderError) {
        console.error('Order creation failed, rolling back inventory:', orderError);
        // Rollback Order
        if (orderId) await db.delete(orders).where(eq(orders.id, orderId));
        
        // Rollback Inventory
        for (const rb of inventoryRollbacks) {
            if (rb.type === 'variant') {
                await db.update(productVariants).set({ inventory: sql`${productVariants.inventory} + ${rb.qty}` }).where(eq(productVariants.id, rb.id));
            } else {
                await db.update(products).set({ inventory: sql`${products.inventory} + ${rb.qty}` }).where(eq(products.id, rb.id));
            }
        }
        throw orderError;
    }

    // ============================================================================
    // NOTIFICATIONS & TRACKING (Non-blocking)
    // ============================================================================
    const resendApiKey = context.cloudflare.env.RESEND_API_KEY;
    if (resendApiKey) {
      const emailService = createEmailService(resendApiKey);
      if (input.customer_email) {
        context.cloudflare.ctx.waitUntil(
          emailService.sendOrderConfirmation({
            orderNumber,
            customerName: input.customer_name,
            customerEmail: input.customer_email,
            total,
            currency: storeData.currency || 'BDT',
            items: finalOrderItems.map(i => ({ title: i.title, quantity: i.quantity, price: i.unitPrice })),
            shippingAddress: input.address,
            paymentMethod: input.payment_method === 'cod' ? 'Cash on Delivery' : input.payment_method.toUpperCase(),
          })
        );
      }
      
      // Merchant Alert
       const merchantUser = await db.select({ email: users.email }).from(users).where(eq(users.storeId, input.store_id)).limit(1);
       if (merchantUser.length > 0 && merchantUser[0].email) {
         context.cloudflare.ctx.waitUntil(
           emailService.sendNewOrderAlert({
             merchantEmail: merchantUser[0].email,
             storeName: storeData.name,
             orderNumber,
             customerName: input.customer_name,
             total,
             currency: storeData.currency || 'BDT',
             itemCount: finalOrderItems.reduce((acc, i) => acc + i.quantity, 0),
           })
         );
       }
    }

    // Push Notifications
    context.cloudflare.ctx.waitUntil((async () => {
        try {
            const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.storeId, input.store_id));
            if (subscriptions.length > 0) {
                const payload = {
                    title: `New Order: ${orderNumber}`,
                    body: `${input.customer_name} - ${storeData.currency} ${total}`,
                    url: `/admin/orders/${orderNumber}`,
                };
                await Promise.all(subscriptions.map(sub => sendPushNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, context.cloudflare.env)));
            }
        } catch(e) { console.error('Push failed', e); }
    })());

    // Recover Abandoned Carts
    context.cloudflare.ctx.waitUntil((async () => {
        try {
             await db.update(abandonedCarts).set({ status: 'recovered', recoveredAt: now })
                .where(and(eq(abandonedCarts.storeId, input.store_id), eq(abandonedCarts.status, 'abandoned'), 
                 or(eq(abandonedCarts.customerPhone, input.phone), input.customer_email ? eq(abandonedCarts.customerEmail, input.customer_email) : undefined)));
        } catch(e) { console.error('Abandon update failed', e); }
    })());

    // FB CAPI
    if (storeData.facebookPixelId && storeData.facebookAccessToken) {
      context.cloudflare.ctx.waitUntil(
        sendPurchaseEvent({
          pixelId: storeData.facebookPixelId,
          accessToken: storeData.facebookAccessToken,
          orderId,
          orderNumber,
          total,
          currency: storeData.currency || 'BDT',
          customerEmail: input.customer_email,
          customerPhone: input.phone,
          customerName: input.customer_name,
          items: finalOrderItems.map(i => ({ productId: i.productId, title: i.title, quantity: i.quantity, price: i.unitPrice })),
        }).catch(e => console.error('[FB CAPI] Purchase event failed:', e))
      );
    }
    
    // Check Upsell
    let upsellUrl;
    // ... Upsell logic can be complicated for multi-item (which product triggers it?). 
    // Simplified: Check upsell for the FIRST product in loop.
    if (finalOrderItems.length > 0) {
       try {
          const firstItem = finalOrderItems[0];
          const upsellOffer = await db.select({ id: upsellOffers.id }).from(upsellOffers)
            .where(and(eq(upsellOffers.storeId, input.store_id), eq(upsellOffers.productId, firstItem.productId), eq(upsellOffers.isActive, true)))
            .orderBy(upsellOffers.displayOrder).limit(1);
          
          if (upsellOffer.length > 0) {
             const token = crypto.randomUUID();
             await db.insert(upsellTokens).values({ orderId: orderId!, token, offerId: upsellOffer[0].id, expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
             upsellUrl = `/upsell/${token}`;
          }
       } catch (e) {
         console.error('Upsell check failed', e);
       }
    }

    return json({
      success: true,
      orderId,
      orderNumber,
      total,
      upsellUrl,
      message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
    });

  } catch (error) {
    const errorDetails = { message: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() };
    console.error('Order creation error:', JSON.stringify(errorDetails, null, 2));
    
    return json({ success: false, error: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', debug: errorDetails.message }, { status: 500 });
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

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

    // SECURITY: Fetch REAL product price and inventory from database
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
    let unitPrice = productData.price;
    let variantInfo: string | null = null;
    let variantIdToUpdate: number | null = null;
    let isVariantStock = false;
    
    // Check Inventory (Product Level)
    // If variants exist, we should rely on variant stock, but if not, fallback to product stock
    let currentStock = productData.inventory || 0;

    // If variant_id provided, fetch variant price and inventory
    if (input.variant_id) {
      const variant = await db
        .select()
        .from(productVariants)
        .where(
          and(
            eq(productVariants.id, input.variant_id),
            eq(productVariants.productId, productData.id)
          )
        )
        .limit(1);
      
      if (variant.length > 0) {
        unitPrice = variant[0].price || unitPrice; // Fallback to product price if variant has no specific price
        currentStock = variant[0].inventory || 0;
        variantInfo = [variant[0].option1Value, variant[0].option2Value]
          .filter(Boolean)
          .join(' - ');
        variantIdToUpdate = variant[0].id;
        isVariantStock = true;
      }
    }

    // DEDUCT INVENTORY (Atomic Update)
    let updateResult;

    if (isVariantStock && variantIdToUpdate) {
       updateResult = await db
        .update(productVariants)
        .set({ inventory: sql`${productVariants.inventory} - ${input.quantity}` })
        .where(and(
          eq(productVariants.id, variantIdToUpdate),
          gte(productVariants.inventory, input.quantity) // Atomic check
        ))
        .returning({ id: productVariants.id });
    } else {
       updateResult = await db
        .update(products)
        .set({ inventory: sql`${products.inventory} - ${input.quantity}` })
        .where(and(
          eq(products.id, productData.id),
          gte(products.inventory, input.quantity) // Atomic check
        ))
        .returning({ id: products.id });
    }

    // If no rows updated, it means stock changed between check and update -> OUT OF STOCK
    if (updateResult.length === 0) {
      return json(
        { 
          success: false, 
          error: `দুঃখিত! এই পণ্যটি বর্তমানে স্টকে নেই (Order collision detected)` 
        },
        { status: 400 }
      );
    }
    
    const itemTotal = unitPrice * input.quantity;
    let subtotal = itemTotal;
    const tax = 0; // Can be calculated based on store settings
    
    // ========================================================================
    // PROCESS ORDER BUMPS - Add bump products if selected
    // ========================================================================
    interface BumpItem {
      bumpId: number;
      productId: number;
      title: string;
      price: number;
      discountedPrice: number;
    }
    const bumpItems: BumpItem[] = [];
    
    if (input.bump_ids && input.bump_ids.length > 0) {
      // Fetch active bumps for this product
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
            eq(orderBumps.productId, input.product_id),
            eq(orderBumps.isActive, true),
            inArray(orderBumps.id, input.bump_ids)
          )
        );
      
      if (activeBumps.length > 0) {
        // Fetch bump products prices
        const bumpProductIds = activeBumps.map(b => b.bumpProductId);
        const bumpProducts = await db
          .select({
            id: products.id,
            title: products.title,
            price: products.price,
          })
          .from(products)
          .where(
            and(
              eq(products.storeId, input.store_id),
              inArray(products.id, bumpProductIds)
            )
          );
        
        // Calculate discounted prices and add to subtotal
        for (const bump of activeBumps) {
          const bumpProduct = bumpProducts.find(p => p.id === bump.bumpProductId);
          if (bumpProduct) {
            const originalPrice = bumpProduct.price;
            const discountValue = bump.discount ?? 0;
            const discountedPrice = discountValue > 0 
              ? originalPrice * (1 - discountValue / 100) 
              : originalPrice;
            
            bumpItems.push({
              bumpId: bump.id,
              productId: bumpProduct.id,
              title: bump.title || bumpProduct.title,
              price: originalPrice,
              discountedPrice,
            });
            
            subtotal += discountedPrice;
          }
        }
        
        // Update bump conversion stats (non-blocking)
        context.cloudflare.ctx.waitUntil(
          db
            .update(orderBumps)
            .set({ conversions: orderBumps.conversions })
            .where(inArray(orderBumps.id, input.bump_ids))
            .then(() => {
              // Raw SQL for increment since Drizzle doesn't support easy increment
              return Promise.all(input.bump_ids!.map(bumpId => 
                context.cloudflare.env.DB.prepare(
                  'UPDATE order_bumps SET conversions = conversions + 1 WHERE id = ?'
                ).bind(bumpId).run()
              ));
            })
            .catch(e => console.error('Failed to update bump conversions:', e))
        );
      }
    }
    
    // Calculate shipping based on store config and customer division
    const shippingConfig = parseShippingConfig(storeData.shippingConfig as string | null);
    const shippingResult = calculateShipping(shippingConfig, input.division, subtotal);
    const shipping = shippingResult.cost;
    
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = generateOrderNumber();
    const now = new Date();

    // Transaction-like safety via Manual Compensation
    // Step 1: Insert order
    let orderId: number | undefined;

    try {
      const orderResult = await db
        .insert(orders)
        .values({
          storeId: input.store_id,
          orderNumber,
          status: 'pending',
          paymentStatus: 'pending', // Pending verification for manual payments too
          paymentMethod: input.payment_method,
          transactionId: input.transaction_id || null,
          manualPaymentDetails: input.manual_payment_details ? JSON.stringify(input.manual_payment_details) : null,
          customerName: input.customer_name,
          customerPhone: input.phone,
          customerEmail: input.customer_email || '', // Empty string instead of null for NOT NULL constraint
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

      orderId = orderResult[0].id;

      if (!orderId) {
        throw new Error('Failed to generate order ID');
      }

      // Step 2: Insert order item (with variant info if applicable)
      await db
        .insert(orderItems)
        .values({
          orderId,
          productId: productData.id,
          variantId: variantIdToUpdate || null,
          title: variantInfo ? `${productData.title} (${variantInfo})` : productData.title,
          variantTitle: variantInfo || null,
          quantity: input.quantity,
          price: unitPrice,
          total: itemTotal,
        });
      
      // Step 3: Insert order items for bump products
      if (bumpItems.length > 0) {
        await db.insert(orderItems).values(
          bumpItems.map(bump => ({
            orderId: orderId as number,
            productId: bump.productId,
            title: `[Bump] ${bump.title}`,
            quantity: 1,
            price: bump.discountedPrice,
            total: bump.discountedPrice,
          }))
        );
      }
    } catch (insertError) {
      console.error('Order/Item insertion failed, executing rollback:', insertError);
      
      // ROLLBACK: Delete Order (if created)
      if (orderId) {
        try {
          await db.delete(orders).where(eq(orders.id, orderId));
          // Items cascade delete usually, but we haven't inserted them successfully if we are here mostly
          // If using relation delete... but here manual delete is fine.
        } catch (cleanupError) {
          console.error('CRITICAL: Failed to delete partial order during rollback:', cleanupError);
        }
      }

      // ROLLBACK: Restore Inventory via Increment
      if (isVariantStock && variantIdToUpdate) {
        await db
          .update(productVariants)
          .set({ inventory: sql`${productVariants.inventory} + ${input.quantity}` })
          .where(eq(productVariants.id, variantIdToUpdate));
      } else {
        await db
          .update(products)
          .set({ inventory: sql`${products.inventory} + ${input.quantity}` })
          .where(eq(products.id, productData.id));
      }
      throw insertError;
    }

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
            paymentMethod: input.payment_method === 'cod' ? 'Cash on Delivery' : input.payment_method.toUpperCase(),
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

    // ============================================================================
    // SEND PUSH NOTIFICATIONS (non-blocking)
    // ============================================================================
    context.cloudflare.ctx.waitUntil(
      (async () => {
        try {
          // Get all subscriptions for this store (e.g. admin/staff)
          // For now, we notify ALL subscribers of the store
          const subscriptions = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.storeId, input.store_id));

          if (subscriptions.length > 0) {
             const payload = {
              title: `New Order: ${orderNumber}`,
              body: `${input.customer_name} ordered ${input.quantity}x items. Total: ${storeData.currency || 'BDT'} ${total}`,
              url: `/admin/orders/${orderNumber}`, // Link to admin order details
            };

            await Promise.all(
              subscriptions.map(sub => 
                sendPushNotification(
                  { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                  payload,
                  context.cloudflare.env
                )
              )
            );
          }
        } catch (e) {
          console.error('Failed to send push notifications:', e);
        }
      })()
    );

    // ============================================================================
    // DISPATCH WEBHOOKS (non-blocking) - order.created
    // ============================================================================
    context.cloudflare.ctx.waitUntil(
      (async () => {
        try {
          await dispatchWebhook(
            context.cloudflare.env,
            input.store_id,
            'order.created',
            {
              event: 'order.created',
              orderId,
              orderNumber,
              total,
              currency: storeData.currency || 'BDT',
              status: 'pending',
              customer: {
                name: input.customer_name,
                phone: input.phone,
                email: input.customer_email
              },
              createdAt: new Date().toISOString(),
            }
          );
        } catch (e) {
          console.error('Failed to dispatch webhooks:', e);
        }
      })()
    );
    }

    // ============================================================================
    // MARK ABANDONED CART AS RECOVERED (non-blocking)
    // ============================================================================
    context.cloudflare.ctx.waitUntil(
      (async () => {
        try {
          await db
            .update(abandonedCarts)
            .set({
              status: 'recovered',
              recoveredAt: now,
            })
            .where(
              and(
                eq(abandonedCarts.storeId, input.store_id),
                eq(abandonedCarts.status, 'abandoned'),
                or(
                  eq(abandonedCarts.customerPhone, input.phone),
                  input.customer_email ? eq(abandonedCarts.customerEmail, input.customer_email) : undefined
                )
              )
            );
        } catch (e) {
          console.error('Failed to mark abandoned cart as recovered:', e);
        }
      })()
    );

    // ============================================================================
    // CHECK FOR UPSELL OFFERS & GENERATE TOKEN
    // ============================================================================
    let upsellUrl: string | undefined;
    
    try {
      // Check if there are active upsell offers for this product
      const upsellOffer = await db
        .select({
          id: upsellOffers.id,
          offerProductId: upsellOffers.offerProductId,
          headline: upsellOffers.headline,
        })
        .from(upsellOffers)
        .where(
          and(
            eq(upsellOffers.storeId, input.store_id),
            eq(upsellOffers.productId, input.product_id),
            eq(upsellOffers.isActive, true)
          )
        )
        .orderBy(upsellOffers.displayOrder)
        .limit(1);
      
      if (upsellOffer.length > 0) {
        // Generate unique token for upsell
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        await db.insert(upsellTokens).values({
          orderId,
          token,
          offerId: upsellOffer[0].id,
          expiresAt,
        });
        
        upsellUrl = `/upsell/${token}`;
        
        // Increment upsell views (non-blocking)
        context.cloudflare.ctx.waitUntil(
          context.cloudflare.env.DB.prepare(
            'UPDATE upsell_offers SET views = views + 1 WHERE id = ?'
          ).bind(upsellOffer[0].id).run().catch(e => 
            console.error('Failed to increment upsell views:', e)
          )
        );
      }
    } catch (e) {
      console.error('Failed to check/create upsell offer:', e);
      // Don't fail the order, just skip upsell
    }

    // ============================================================================
    // FACEBOOK CONVERSION API - Server-side Purchase tracking (non-blocking)
    // ============================================================================
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
          items: [{
            productId: productData.id,
            title: productData.title,
            quantity: input.quantity,
            price: unitPrice,
          }],
        }).catch(e => console.error('[FB CAPI] Purchase event failed:', e))
      );
    }

    return json({
      success: true,
      orderId,
      orderNumber,
      total,
      upsellUrl, // If defined, client should redirect here instead of thank-you
      message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে! শীঘ্রই আমরা আপনার সাথে যোগাযোগ করবো।',
    });

  } catch (error) {
    // Enhanced error logging for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name || typeof error,
      timestamp: new Date().toISOString(),
    };
    
    console.error('Order creation error:', JSON.stringify(errorDetails, null, 2));
    console.error('Raw error:', error);
    
    // TEMPORARILY return detailed error for debugging production issues
    return json(
      { 
        success: false, 
        error: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        debug: errorDetails.message, // Show error details for debugging
        debugType: errorDetails.type,
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

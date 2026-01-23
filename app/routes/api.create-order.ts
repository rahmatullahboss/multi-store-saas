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
import { orders, orderItems, products, productVariants, stores, users, abandonedCarts, orderBumps, upsellOffers, upsellTokens, pushSubscriptions, customers, templateAnalytics, savedLandingConfigs, checkoutSessions } from '@db/schema';
import { eq, and, or, inArray, sql, gte } from 'drizzle-orm';
import { createEmailService } from '~/services/email.server';
import { sendPushNotification } from '~/services/push.server';
import { dispatchWebhook } from '~/services/webhook.server';
import { checkUsageLimit } from '~/utils/plans.server';
import { parseShippingConfig, calculateShipping, BD_DIVISIONS } from '~/utils/shipping';
import { sendPurchaseEvent } from '~/services/facebook-capi.server';
import { createDb } from '~/lib/db.server';
import { sendSmartNotification } from '~/services/messaging.server';
import { addLoyaltyPoints } from '~/services/loyalty.server';
import { triggerAutomation } from '~/services/automation.server';
import { parseLandingConfig } from '@db/types';
import { generateCheckoutIdempotencyKey } from '~/services/webhook-utils.server';


// ============================================================================
// VALIDATION SCHEMA with BD Phone validation
// ============================================================================
const bdPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;

// Valid division values
const validDivisions = BD_DIVISIONS.map(d => d.value);

export const OrderSchema = z.object({
  store_id: z.number().int().positive('Store ID is required'),
  product_id: z.number().int().positive('Product ID is required'),
  // Combo discount settings (client input ignored; server authoritative)
  combo_discount_enabled: z.string().optional(),
  combo_discount_2: z.preprocess((v) => Number(v), z.number().min(0).max(100)).optional(),
  combo_discount_3: z.preprocess((v) => Number(v), z.number().min(0).max(100)).optional(),
  customer_name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে').max(100),
  phone: z.string()
    .min(10, 'মোবাইল নম্বর কমপক্ষে ১০ সংখ্যা হতে হবে')
    .max(20)
    .refine(val => bdPhoneRegex.test(val.replace(/[\s-]/g, '')), {
      message: 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (01XXXXXXXXX)',
    }),
  address: z.string().min(5, 'ঠিকানা কমপক্ষে ৫ অক্ষর হতে হবে').max(500),
  division: z.enum(validDivisions as [string, ...string[]]).default('dhaka'), // Inside/Outside Dhaka
  // BD Address System - District & Upazila
  district: z.string().max(50).optional(), // District ID from bd-locations
  upazila: z.string().max(50).optional(), // Upazila ID from bd-locations
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
  landing_page_id: z.number().int().optional(), // Campaign Page ID for attribution
  // Attribution (UTM Parameters)
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});


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

  const db = createDb(context.cloudflare.env.DB);

  try {
    // Parse request body - handle both JSON and FormData
    let body: Record<string, unknown>;
    const contentType = request.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Handle FormData (default for useFetcher without encType)
      const formData = await request.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        // Parse numbers for numeric fields
        if (['store_id', 'product_id', 'quantity', 'variant_id', 'landing_page_id'].includes(key)) {
          const strValue = (value as string).trim();
          if (strValue !== '') {
            const parsed = parseInt(strValue, 10);
            if (!isNaN(parsed)) {
              body[key] = parsed;
            }
          }
        } else if (['utm_source', 'utm_medium', 'utm_campaign'].includes(key)) {
           body[key] = (value as string).trim();
        } else if (key === 'cart_items') {
          try {
            body[key] = JSON.parse(value as string);
          } catch {
            body[key] = [];
          }
        } else if (key === 'bump_ids') {
          try {
            body[key] = JSON.parse(value as string);
          } catch {
            body[key] = [];
          }
        } else {
          body[key] = value;
        }
      }
    }
    
    // ========================================================================
    // ANTI-SPAM: HONEYPOT CHECK
    // ========================================================================
    // If the hidden 'website' field is filled, it's likely a bot
    if (body.website && String(body.website).trim() !== '') {
      // console.log('[SPAM] Honeypot triggered from:', request.headers.get('CF-Connecting-IP') || 'unknown');
      return json(
        { success: false, error: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।' },
        { status: 400 }
      );
    }
    
    // ========================================================================
    // PHONE NORMALIZATION
    // ========================================================================
    // Normalize BD phone number if present
    if (body.phone && typeof body.phone === 'string') {
      let phone = body.phone.replace(/[\s-]/g, ''); // Remove spaces and dashes
      // Convert to standard format
      if (phone.startsWith('+880')) {
        phone = '0' + phone.slice(4);
      } else if (phone.startsWith('880')) {
        phone = '0' + phone.slice(3);
      }
      body.phone = phone;
    }

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
      console.error('[VALIDATION] Order validation failed:', JSON.stringify(errors.fieldErrors));
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
    
    // ========================================================================
    // ANTI-SPAM: RATE LIMITING (IP-based)
    // ========================================================================
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For')?.split(',')[0] || 
                     'unknown';
    
    const RATE_LIMIT_MAX = 5; // Max orders per window
    const RATE_LIMIT_WINDOW_MINUTES = 10;
    
    // Use D1 for rate limiting (per-phone or per-IP per-store)
    try {
      const phoneOrIp = (body.phone && String(body.phone).trim()) || clientIP;
      const recentOrderCountResult = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(
          and(
            eq(orders.storeId, input.store_id),
            sql`${orders.createdAt} > datetime('now', ${`-${RATE_LIMIT_WINDOW_MINUTES} minutes`})`,
            // Match by phone when available, otherwise by stored clientIP
            sql`(
              ${orders.customerPhone} = ${phoneOrIp} OR 
              json_extract(${orders.pricingJson}, '$.clientIP') = ${phoneOrIp}
            )`
          )
        );

      const recentOrderCount = recentOrderCountResult[0]?.count ?? 0;
      if (recentOrderCount >= RATE_LIMIT_MAX) {
        return json(
          { success: false, error: 'অতিরিক্ত অর্ডার অনুরোধ। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
          { status: 429 }
        );
      }
    } catch (e) {
      // Don't block on rate limit check failure
      console.error('[Rate Limit] Check failed:', e);
    }
    
    // ========================================================================
    // ANTI-SPAM: DUPLICATE ORDER DETECTION
    // ========================================================================
    // Check if same phone ordered same product within last 4 hours
    const primaryProductId = input.product_id || (input.cart_items?.[0]?.product_id);
    
    if (primaryProductId) {
      try {
        const duplicateCheck = await db.select({ 
          id: orders.id, 
          orderNumber: orders.orderNumber,
          createdAt: orders.createdAt 
        })
          .from(orders)
          .where(
            and(
              eq(orders.storeId, input.store_id),
              eq(orders.customerPhone, input.phone),
              sql`${orders.createdAt} > datetime('now', '-4 hours')`
            )
          )
          .limit(1);
        
        if (duplicateCheck.length > 0) {
          const existingOrder = duplicateCheck[0];
          // Duplicate order detected, log to console.warn instead of console.log
          console.warn('[DUPLICATE] Potential duplicate order detected:', {
            phone: input.phone,
            existingOrderId: existingOrder.id,
            existingOrderNumber: existingOrder.orderNumber
          });
          
          return json(
            { 
              success: false, 
              error: 'আপনি ইতোমধ্যে একটি অর্ডার করেছেন। সমস্যা হলে আমাদের কল করুন।',
              code: 'DUPLICATE_ORDER',
              existingOrderNumber: existingOrder.orderNumber
            },
            { status: 429 } // Too Many Requests
          );
        }
      } catch (e) {
        // Don't block on duplicate check failure
        console.error('[Duplicate Check] Failed:', e);
      }
    }

    // ========================================================================
    // IDEMPOTENT ORDER CREATION via checkout_sessions
    // ========================================================================
    // Generate idempotency key from phone + first product + time bucket
    const idempotencyKey = generateCheckoutIdempotencyKey(
      input.store_id,
      input.phone,
      primaryProductId || 0
    );

    // Check for existing checkout session with this key
    try {
      const existingSession = await db
        .select({
          id: checkoutSessions.id,
          status: checkoutSessions.status,
          orderId: checkoutSessions.orderId,
        })
        .from(checkoutSessions)
        .where(eq(checkoutSessions.idempotencyKey, idempotencyKey))
        .limit(1);

      if (existingSession.length > 0) {
        const session = existingSession[0];
        
        // If already completed, return existing order
        if (session.status === 'completed' && session.orderId) {
          const existingOrder = await db
            .select({ orderNumber: orders.orderNumber, id: orders.id, total: orders.total })
            .from(orders)
            .where(eq(orders.id, session.orderId))
            .limit(1);

          if (existingOrder.length > 0) {
            console.warn('[IDEMPOTENT] Returning existing order:', existingOrder[0].orderNumber);
            return json({
              success: true,
              orderId: existingOrder[0].id,
              orderNumber: existingOrder[0].orderNumber,
              total: existingOrder[0].total,
              message: 'Order already exists',
              isIdempotent: true,
            });
          }
        }
        // If pending/processing, wait or return busy
        if (session.status === 'pending' || session.status === 'processing') {
          return json(
            { success: false, error: 'অর্ডার প্রক্রিয়াকরণ হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।', code: 'PROCESSING' },
            { status: 409 }
          );
        }
      }
    } catch (e) {
      console.error('[Idempotency Check] Failed:', e);
    }

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
        const bumpProducts = await db.select({ id: products.id, title: products.title, price: products.price })
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
    
    // ============================================================================
    // COMBO/BUNDLE DISCOUNT - Apply discount for multiple unique products
    // ============================================================================
    // Count unique products in order
    const uniqueProductIds = new Set(orderItemsData.map(item => item.productId));
    const uniqueProductCount = uniqueProductIds.size;
    
    // Combo discount rates (server-authoritative)
    let comboDiscountRate = 0;
    let comboDiscountAmount = 0;

    // Defaults
    let comboDiscountEnabled = true;
    let comboDiscount2 = 10;
    let comboDiscount3 = 15;

    // 1) Landing page override (if landing_page_id)
    if (input.landing_page_id) {
      const landingConfigRow = await db
        .select({ landingConfig: savedLandingConfigs.landingConfig })
        .from(savedLandingConfigs)
        .where(and(
          eq(savedLandingConfigs.id, input.landing_page_id),
          eq(savedLandingConfigs.storeId, input.store_id)
        ))
        .limit(1);

      if (landingConfigRow.length > 0) {
        const landingConfig = parseLandingConfig(landingConfigRow[0].landingConfig);
        if (landingConfig) {
          comboDiscountEnabled = landingConfig.enableComboDiscount !== false;
          comboDiscount2 = landingConfig.comboDiscount2Products ?? comboDiscount2;
          comboDiscount3 = landingConfig.comboDiscount3Products ?? comboDiscount3;
        }
      }
    }

    // 2) Store default fallback (if landing override not set)
    if (comboDiscount2 === 10 && comboDiscount3 === 15) {
      const storeLandingConfig = parseLandingConfig(storeData.landingConfig as string | null);
      if (storeLandingConfig) {
        comboDiscountEnabled = storeLandingConfig.enableComboDiscount !== false;
        comboDiscount2 = storeLandingConfig.comboDiscount2Products ?? comboDiscount2;
        comboDiscount3 = storeLandingConfig.comboDiscount3Products ?? comboDiscount3;
      }
    }

    // Cap to safe max (50%) to prevent abuse
    comboDiscount2 = Math.min(Math.max(comboDiscount2, 0), 50);
    comboDiscount3 = Math.min(Math.max(comboDiscount3, 0), 50);
    
    if (comboDiscountEnabled) {
      if (uniqueProductCount >= 3) {
        comboDiscountRate = comboDiscount3 / 100;
      } else if (uniqueProductCount === 2) {
        comboDiscountRate = comboDiscount2 / 100;
      }
    }
    
    if (comboDiscountRate > 0) {
      comboDiscountAmount = Math.round(subtotal * comboDiscountRate);
    }
    
    // Apply combo discount to subtotal
    const discountedSubtotal = subtotal - comboDiscountAmount;

    const total = discountedSubtotal + tax + shipping;

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

    // Check if this is the first order (for celebration email)
    const existingOrderCheck = await db.select({ id: orders.id }).from(orders).where(eq(orders.storeId, input.store_id)).limit(1);
    const isFirstOrder = existingOrderCheck.length === 0;

    // 2. CREATE ORDER
    let orderId: number | undefined;
    try {
      const orderResult = await db.insert(orders).values({
        storeId: input.store_id,
        orderNumber,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: input.payment_method as any,
        transactionId: input.transaction_id || null,
        manualPaymentDetails: input.manual_payment_details ? JSON.stringify(input.manual_payment_details) : null,
        customerName: input.customer_name,
        customerPhone: input.phone,
        customerEmail: input.customer_email || '',
        shippingAddress: input.address,
        billingAddress: null,
        subtotal: discountedSubtotal, // After combo discount
        tax,
        shipping,
        total,
        // Store combo discount info in pricingJson
        pricingJson: JSON.stringify({
          originalSubtotal: subtotal,
          comboDiscount: comboDiscountAmount,
          comboDiscountRate: comboDiscountRate,
          uniqueProductCount: uniqueProductCount,
          discountedSubtotal: discountedSubtotal,
          shipping,
          tax,
          total,
          isFreeShipping: shippingResult.isFree || false,
          clientIP,
        }),
        notes: input.notes || null,
        landingPageId: input.landing_page_id || null, // ATTRIBUTION
        utmSource: input.utm_source || null,
        utmMedium: input.utm_medium || null,
        utmCampaign: input.utm_campaign || null,
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

      // ========== WEBHOOK: ORDER CREATED ==========
      context.cloudflare.ctx.waitUntil(
        dispatchWebhook(context.cloudflare.env, input.store_id, 'order.created', {
          event: 'order.created',
          order_id: orderId,
          order_number: orderNumber,
          customer_name: input.customer_name,
          customer_phone: input.phone,
          customer_email: input.customer_email || null,
          shipping_address: input.address,
          division: input.division,
          subtotal,
          shipping,
          tax,
          total,
          payment_method: input.payment_method,
          item_count: finalOrderItems.reduce((acc, i) => acc + i.quantity, 0),
          items: finalOrderItems.map(i => ({
            product_id: i.productId,
            title: i.title,
            quantity: i.quantity,
            price: i.unitPrice,
          })),
          created_at: now.toISOString(),
        }).catch(e => console.error('[Webhook] order.created failed:', e))
      );

      // ========== CHECKOUT SESSION: MARK COMPLETED ==========
      // Create checkout session for idempotency tracking
      context.cloudflare.ctx.waitUntil(
        db.insert(checkoutSessions).values({
          id: crypto.randomUUID(),
          storeId: input.store_id,
          cartJson: JSON.stringify(orderItemsData),
          phone: input.phone,
          customerName: input.customer_name,
          email: input.customer_email || null,
          shippingAddressJson: JSON.stringify({
            address: input.address,
            division: input.division,
            district: input.district,
            upazila: input.upazila,
          }),
          pricingJson: JSON.stringify({ subtotal, shipping, tax, total }),
          paymentMethod: input.payment_method as 'cod' | 'bkash' | 'nagad' | 'stripe',
          status: 'completed',
          idempotencyKey,
          orderId,
          landingPageId: input.landing_page_id,
          createdAt: now,
          updatedAt: now,
        }).catch(e => console.error('[Checkout Session] Creation failed:', e))
      );

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
    // CUSTOMER CREATION/UPDATE (For Segmentation & Marketing)
    // ============================================================================
    // let finalCustomerId: number | undefined;
    
    context.cloudflare.ctx.waitUntil((async () => {
      try {
        // Check if customer exists (by phone or email)
        const existingCustomer = await db.select({ id: customers.id, totalOrders: customers.totalOrders, totalSpent: customers.totalSpent })
          .from(customers)
          .where(
            and(
              eq(customers.storeId, input.store_id),
              or(
                eq(customers.phone, input.phone),
                input.customer_email ? eq(customers.email, input.customer_email) : undefined
              )
            )
          )
          .limit(1);

        if (existingCustomer.length > 0) {
          // UPDATE existing customer stats
          const customer = existingCustomer[0];
          // finalCustomerId = customer.id;
          const newTotalOrders = (customer.totalOrders || 0) + 1;
          const newTotalSpent = (customer.totalSpent || 0) + total;

          // Determine new segment
          let newSegment: 'vip' | 'regular' = 'regular';
          if (newTotalOrders >= 3 || newTotalSpent >= 10000) {
            newSegment = 'vip';
          }

          await db.update(customers)
            .set({
              totalOrders: newTotalOrders,
              totalSpent: newTotalSpent,
              lastOrderAt: now,
              segment: newSegment,
              name: input.customer_name,
              address: input.address,
              updatedAt: now,
            })
            .where(eq(customers.id, customer.id));

          // Link customer to order
          await db.update(orders)
            .set({ customerId: customer.id })
            .where(eq(orders.id, orderId!));

          // ========== LOYALTY POINTS INTEGRATION ==========
          await addLoyaltyPoints(db, customer.id, input.store_id, total, `Order ${orderNumber}`);

        } else {
          // CREATE new customer
          const [newCustomer] = await db.insert(customers).values({
            storeId: input.store_id,
            email: input.customer_email || null, // Email is optional for BD market
            name: input.customer_name,
            phone: input.phone,
            address: input.address,
            totalOrders: 1,
            totalSpent: total,
            lastOrderAt: now,
            segment: 'regular', // First order = regular
          }).returning({ id: customers.id });
          
          // finalCustomerId = newCustomer.id;

          // Link customer to order
          await db.update(orders)
            .set({ customerId: newCustomer.id })
            .where(eq(orders.id, orderId!));

          // ========== LOYALTY POINTS FOR NEW CUSTOMER ==========
          await addLoyaltyPoints(db, newCustomer.id, input.store_id, total, `First Order ${orderNumber}`);

          // ========== WEBHOOK: NEW CUSTOMER CREATED ==========
          dispatchWebhook(context.cloudflare.env, input.store_id, 'customer.created', {
            customerId: newCustomer.id,
            email: input.customer_email || null,
            phone: input.phone,
            name: input.customer_name,
            firstOrderNumber: orderNumber,
          }).catch(e => console.error('[Webhook] customer.created failed:', e));
        }

        // ========== FIRE AUTOMATION TRIGGERS ==========
        if (input.customer_email && !input.customer_email.includes('@phone.local')) {
          await triggerAutomation(
            context.cloudflare.env.DB,
            'order_placed',
            {
              storeId: input.store_id,
              customerEmail: input.customer_email,
              customerName: input.customer_name,
              metadata: {
                orderNumber,
                total,
                currency: storeData.currency || 'BDT',
                itemCount: finalOrderItems.reduce((acc, i) => acc + i.quantity, 0),
              }
            },
            context.cloudflare.env.RESEND_API_KEY
          );
        }

      } catch (customerError) {
        console.error('Customer creation/update failed:', customerError);
        // Non-blocking - order already created
      }
    })());

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
            storeName: storeData.name,
            storeLogo: storeData.logo || undefined,
            primaryColor: (storeData.themeConfig && JSON.parse(storeData.themeConfig as string)?.primaryColor) || undefined
          })
        );
      }

      // Merchant Alert
      const merchantUser = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.storeId, input.store_id)).limit(1);
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

        // Fire Celebration Email if it's the First Sale!
        if (isFirstOrder) {
          context.cloudflare.ctx.waitUntil(
            emailService.sendFirstSaleCelebration({
              merchantEmail: merchantUser[0].email,
              merchantName: merchantUser[0].name || 'Merchant',
              storeName: storeData.name,
              orderNumber,
              amount: `${storeData.currency || 'BDT'} ${total}`
            })
          );
        }
      }
    }

    // Smart Notification (WhatsApp / SMS) - Marketing Research Feature
    context.cloudflare.ctx.waitUntil(
      sendSmartNotification(db, context.cloudflare.env, orderId!, input.store_id, 'ORDER_CONFIRMATION', {
        phone: input.phone,
        customerName: input.customer_name,
        amount: total,
        currency: storeData.currency || 'BDT',
        orderNumber: orderNumber,
        itemCount: finalOrderItems.reduce((acc, i) => acc + i.quantity, 0)
      }).catch(e => console.error('[Messaging] Notification failed:', e))
    );

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
      } catch (e) { console.error('Push failed', e); }
    })());

    // Recover Abandoned Carts
    context.cloudflare.ctx.waitUntil((async () => {
      try {
        await db.update(abandonedCarts).set({ status: 'recovered', recoveredAt: now })
          .where(and(eq(abandonedCarts.storeId, input.store_id), eq(abandonedCarts.status, 'abandoned'),
            or(eq(abandonedCarts.customerPhone, input.phone), input.customer_email ? eq(abandonedCarts.customerEmail, input.customer_email) : undefined)));
      } catch (e) { console.error('Abandon update failed', e); }
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

    // ========== TEMPLATE ANALYTICS TRACKING ==========
    // Track which template generated this order for conversion analytics
    context.cloudflare.ctx.waitUntil((async () => {
      try {
        const landingConfig = parseLandingConfig(storeData.landingConfig as string | null);
        const templateId = landingConfig?.templateId || 'unknown';

        // Try to update existing analytics record, or insert new one
        const existing = await db.select({ id: templateAnalytics.id, ordersGenerated: templateAnalytics.ordersGenerated, revenueGenerated: templateAnalytics.revenueGenerated })
          .from(templateAnalytics)
          .where(and(eq(templateAnalytics.storeId, input.store_id), eq(templateAnalytics.templateId, templateId)))
          .limit(1);

        if (existing.length > 0) {
          await db.update(templateAnalytics)
            .set({
              ordersGenerated: (existing[0].ordersGenerated || 0) + 1,
              revenueGenerated: (existing[0].revenueGenerated || 0) + total,
              updatedAt: new Date(),
            })
            .where(eq(templateAnalytics.id, existing[0].id));
        } else {
          await db.insert(templateAnalytics).values({
            storeId: input.store_id,
            templateId,
            ordersGenerated: 1,
            revenueGenerated: total,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (e) {
        console.error('[Template Analytics] Tracking failed:', e);
      }


      // CAMPAIGN PAGE ANALYTICS
      if (input.landing_page_id) {
        try {
          await db.update(savedLandingConfigs)
            .set({
              orders: sql`orders + 1`,
              revenue: sql`revenue + ${total}`
            })
            .where(eq(savedLandingConfigs.id, input.landing_page_id));
        } catch (e) {
          console.error('[Campaign Analytics] Tracking failed:', e);
        }
      }
    })());

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
    description: 'Create a new order (single or multi-item)',
    payload_options: {
      single_item: {
        required_fields: ['store_id', 'product_id', 'customer_name', 'phone', 'address'],
        optional_fields: ['quantity (default: 1)', 'variant_id', 'notes', 'customer_email', 'payment_method', 'division', 'bump_ids'],
      },
      multi_item: {
        required_fields: ['store_id', 'cart_items', 'customer_name', 'phone', 'address'],
        cart_item_structure: '{ product_id: number, quantity: number, variant_id?: number }[]',
        optional_fields: ['notes', 'customer_email', 'payment_method', 'division', 'bump_ids'],
      },
    },
    note: 'Either product_id (single item) OR cart_items (multi-item) must be provided, not both.',
  });
}

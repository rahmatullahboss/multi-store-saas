/**
 * Accept Upsell API Route
 * 
 * POST /api/accept-upsell
 * 
 * Accepts an upsell offer and adds the product to the existing order.
 * Token-based authentication ensures only valid post-purchase upsells.
 * 
 * Input: { token: string }
 * Output: { success: true, nextUrl: string }
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { upsellTokens, upsellOffers, orders, orderItems, products } from '@db/schema';
import { eq, and } from 'drizzle-orm';

const AcceptUpsellSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  try {
    const body = await request.json();
    const parseResult = AcceptUpsellSchema.safeParse(body);
    
    if (!parseResult.success) {
      return json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const { token } = parseResult.data;

    // Validate token
    const tokenRecord = await db
      .select({
        id: upsellTokens.id,
        orderId: upsellTokens.orderId,
        offerId: upsellTokens.offerId,
        expiresAt: upsellTokens.expiresAt,
        usedAt: upsellTokens.usedAt,
      })
      .from(upsellTokens)
      .where(eq(upsellTokens.token, token))
      .limit(1);

    if (tokenRecord.length === 0) {
      return json({ success: false, error: 'Invalid or expired token' }, { status: 400 });
    }

    const upsellToken = tokenRecord[0];

    // Check if token is expired
    if (new Date() > new Date(upsellToken.expiresAt)) {
      return json({ 
        success: false, 
        error: 'Offer expired',
        nextUrl: `/thank-you/${upsellToken.orderId}`,
      }, { status: 400 });
    }

    // Check if token already used
    if (upsellToken.usedAt) {
      return json({ 
        success: false, 
        error: 'Offer already claimed',
        nextUrl: `/thank-you/${upsellToken.orderId}`,
      }, { status: 400 });
    }

    // Get upsell offer details
    const offer = await db
      .select({
        id: upsellOffers.id,
        offerProductId: upsellOffers.offerProductId,
        discount: upsellOffers.discount,
        headline: upsellOffers.headline,
        nextOfferId: upsellOffers.nextOfferId,
        storeId: upsellOffers.storeId,
      })
      .from(upsellOffers)
      .where(eq(upsellOffers.id, upsellToken.offerId!))
      .limit(1);

    if (offer.length === 0) {
      return json({ 
        success: false, 
        error: 'Offer not found',
        nextUrl: `/thank-you/${upsellToken.orderId}`,
      }, { status: 400 });
    }

    const upsellOffer = offer[0];

    // Get product details
    const productData = await db
      .select({
        id: products.id,
        title: products.title,
        price: products.price,
      })
      .from(products)
      .where(eq(products.id, upsellOffer.offerProductId))
      .limit(1);

    if (productData.length === 0) {
      return json({ 
        success: false, 
        error: 'Product not found',
        nextUrl: `/thank-you/${upsellToken.orderId}`,
      }, { status: 400 });
    }

    const product = productData[0];
    
    // Calculate discounted price
    const originalPrice = product.price;
    const discountPercent = upsellOffer.discount || 0;
    const discountedPrice = discountPercent > 0 
      ? originalPrice * (1 - discountPercent / 100)
      : originalPrice;

    // Add upsell product to order as new order item
    await db.insert(orderItems).values({
      orderId: upsellToken.orderId,
      productId: product.id,
      title: `[Upsell] ${product.title}`,
      quantity: 1,
      price: discountedPrice,
      total: discountedPrice,
    });

    // Update order total
    const currentOrder = await db
      .select({ total: orders.total })
      .from(orders)
      .where(and(eq(orders.id, upsellToken.orderId), eq(orders.storeId, upsellOffer.storeId)))
      .limit(1);

    if (currentOrder.length > 0) {
      const newTotal = currentOrder[0].total + discountedPrice;
      await db
        .update(orders)
        .set({ 
          total: newTotal,
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, upsellToken.orderId), eq(orders.storeId, upsellOffer.storeId)));
    }

    // Mark token as used
    await db
      .update(upsellTokens)
      .set({ usedAt: new Date() })
      .where(eq(upsellTokens.id, upsellToken.id));

    // Increment conversion stats (non-blocking)
    context.cloudflare.ctx.waitUntil(
      Promise.all([
        context.cloudflare.env.DB.prepare(
          'UPDATE upsell_offers SET conversions = conversions + 1 WHERE id = ?'
        ).bind(upsellOffer.id).run(),
        context.cloudflare.env.DB.prepare(
          'UPDATE upsell_offers SET revenue = revenue + ? WHERE id = ?'
        ).bind(discountedPrice, upsellOffer.id).run(),
      ]).catch(e => console.error('Failed to update upsell stats:', e))
    );

    // Check for next upsell offer
    let nextUrl = `/thank-you/${upsellToken.orderId}`;
    
    if (upsellOffer.nextOfferId) {
      // Generate new token for next offer
      const nextToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      await db.insert(upsellTokens).values({
        orderId: upsellToken.orderId,
        token: nextToken,
        offerId: upsellOffer.nextOfferId,
        expiresAt,
      });
      
      nextUrl = `/upsell/${nextToken}`;
    }

    return json({
      success: true,
      message: 'Upsell added to your order!',
      nextUrl,
    });

  } catch (error) {
    console.error('Accept upsell error:', error);
    return json({ 
      success: false, 
      error: 'Failed to process upsell',
    }, { status: 500 });
  }
}

export async function loader() {
  return json({
    method: 'POST',
    description: 'Accept an upsell offer',
    required_fields: ['token'],
  });
}

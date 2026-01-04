/**
 * Stripe Checkout Initiate API
 * 
 * Route: POST /api/stripe/initiate
 * 
 * Creates a Stripe Checkout Session and returns the checkout URL.
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders, orderItems, stores } from '@db/schema';
import { createStripeService } from '~/services/stripe.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json() as { orderId: number };
    const { orderId } = body;

    if (!orderId) {
      return json({ error: 'orderId is required' }, { status: 400 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    // Fetch order
    const orderResult = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderResult.length === 0) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult[0];

    // Fetch store for currency
    const storeResult = await db
      .select()
      .from(stores)
      .where(eq(stores.id, order.storeId))
      .limit(1);

    const store = storeResult[0];
    const currency = store?.currency || 'USD';

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Create Stripe service
    const stripe = createStripeService(context.cloudflare.env as unknown as Record<string, string>);

    // Get base URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Create checkout session
    const session = await stripe.createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      lineItems: items.map(item => ({
        name: item.title,
        description: item.variantTitle || undefined,
        quantity: item.quantity,
        price: Math.round(item.price * 100), // Convert to cents
      })),
      currency,
      customerEmail: order.customerEmail || undefined,
      successUrl: `${baseUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout/cancelled?orderId=${order.id}`,
    });

    // Store Stripe session ID in order notes
    const existingNotes = order.notes ? JSON.parse(order.notes) : {};
    await db
      .update(orders)
      .set({
        notes: JSON.stringify({
          ...existingNotes,
          stripeSessionId: session.id,
        }),
      })
      .where(eq(orders.id, orderId));

    return json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });

  } catch (error) {
    console.error('Stripe initiate error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

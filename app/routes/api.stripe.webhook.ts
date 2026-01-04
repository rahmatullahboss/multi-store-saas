/**
 * Stripe Webhook Handler
 * 
 * Route: POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events for payment confirmation.
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders } from '@db/schema';
import { createStripeService } from '~/services/stripe.server';

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      metadata?: {
        order_id?: string;
        order_number?: string;
      };
      payment_status?: string;
      payment_intent?: string;
    };
  };
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // Verify webhook signature
    const stripe = createStripeService(context.cloudflare.env as unknown as Record<string, string>);
    const isValid = await stripe.verifyWebhookSignature(payload, signature);

    if (!isValid && context.cloudflare.env.STRIPE_WEBHOOK_SECRET) {
      return json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event: StripeEvent = JSON.parse(payload);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (orderId && session.payment_status === 'paid') {
        const db = drizzle(context.cloudflare.env.DB);

        // Fetch order
        const orderResult = await db
          .select()
          .from(orders)
          .where(eq(orders.id, parseInt(orderId)))
          .limit(1);

        if (orderResult.length > 0) {
          const order = orderResult[0];
          const existingNotes = order.notes ? JSON.parse(order.notes) : {};

          // Update order status
          await db
            .update(orders)
            .set({
              status: 'processing',
              paymentStatus: 'paid',
              notes: JSON.stringify({
                ...existingNotes,
                stripePaymentIntent: session.payment_intent,
                paidAt: new Date().toISOString(),
                paymentMethod: 'stripe',
              }),
              updatedAt: new Date(),
            })
            .where(eq(orders.id, parseInt(orderId)));
        }
      }
    }

    // Handle payment_intent.payment_failed event
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      // Log failure but don't update order - user might retry
      console.log('Payment failed for intent:', paymentIntent.id);
    }

    return json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

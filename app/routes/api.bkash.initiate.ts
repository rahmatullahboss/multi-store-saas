/**
 * bKash Payment Initiation API
 * 
 * POST /api/bkash/initiate
 * 
 * Creates a bKash payment and returns the redirect URL
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders } from '@db/schema';
import { BkashService } from '~/services/bkash.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json() as {
      orderId: number;
      storeId: number;
      amount: number;
      customerPhone: string;
    };

    const { orderId, storeId, amount, customerPhone } = body;

    // Validate required fields
    if (!orderId || !storeId || !amount) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get order from database
    const db = drizzle(context.cloudflare.env.DB);
    const orderResult = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderResult.length === 0) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult[0];

    // Initialize bKash service
    const bkash = BkashService.fromEnv({
      BKASH_BASE_URL: context.cloudflare.env.BKASH_BASE_URL,
      BKASH_APP_KEY: context.cloudflare.env.BKASH_APP_KEY,
      BKASH_APP_SECRET: context.cloudflare.env.BKASH_APP_SECRET,
      BKASH_USERNAME: context.cloudflare.env.BKASH_USERNAME,
      BKASH_PASSWORD: context.cloudflare.env.BKASH_PASSWORD,
    });

    // Build callback URL
    const host = request.headers.get('host') || 'localhost';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackURL = `${protocol}://${host}/api/bkash/callback?orderId=${orderId}`;

    // Create payment
    const payment = await bkash.createPayment({
      payerReference: customerPhone || order.customerPhone || 'customer',
      callbackURL,
      amount: amount.toFixed(2),
      merchantInvoiceNumber: order.orderNumber,
    });

    // Store paymentID in order notes or a new field
    await db
      .update(orders)
      .set({
        notes: JSON.stringify({
          ...(order.notes ? JSON.parse(order.notes as string) : {}),
          bkashPaymentID: payment.paymentID,
        }),
      })
      .where(eq(orders.id, orderId));

    return json({
      success: true,
      paymentID: payment.paymentID,
      bkashURL: payment.bkashURL,
      amount: payment.amount,
    });
  } catch (error) {
    console.error('bKash initiate error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

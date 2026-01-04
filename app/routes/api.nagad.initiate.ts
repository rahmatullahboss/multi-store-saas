/**
 * Nagad Payment Initiation API
 * 
 * POST /api/nagad/initiate
 * 
 * Creates a Nagad payment and returns the redirect URL
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders, stores } from '@db/schema';
import { NagadService } from '~/services/nagad.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json() as {
      orderId: number;
      storeId: number;
      amount: number;
    };

    const { orderId, storeId, amount } = body;

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

    // Initialize Nagad service
    const nagad = NagadService.fromEnv({
      NAGAD_BASE_URL: (context.cloudflare.env as Record<string, string>).NAGAD_BASE_URL,
      NAGAD_MERCHANT_ID: (context.cloudflare.env as Record<string, string>).NAGAD_MERCHANT_ID,
      NAGAD_MERCHANT_NUMBER: (context.cloudflare.env as Record<string, string>).NAGAD_MERCHANT_NUMBER,
      NAGAD_PUBLIC_KEY: (context.cloudflare.env as Record<string, string>).NAGAD_PUBLIC_KEY,
      NAGAD_PRIVATE_KEY: (context.cloudflare.env as Record<string, string>).NAGAD_PRIVATE_KEY,
    });

    // Step 1: Initialize payment
    const initResponse = await nagad.initializePayment(order.orderNumber);

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('cf-connecting-ip') || 
                     '127.0.0.1';

    // Step 2: Complete order to get redirect URL
    const completeResponse = await nagad.completeOrder({
      paymentReferenceId: initResponse.paymentReferenceId,
      challenge: initResponse.challenge,
      orderId: order.orderNumber,
      amount: amount.toFixed(2),
      productDetails: `Order ${order.orderNumber}`,
      ip: clientIP,
    });

    // Store payment reference in order notes
    await db
      .update(orders)
      .set({
        notes: JSON.stringify({
          ...(order.notes ? JSON.parse(order.notes as string) : {}),
          nagadPaymentRefId: initResponse.paymentReferenceId,
        }),
      })
      .where(eq(orders.id, orderId));

    return json({
      success: true,
      callbackUrl: completeResponse.callBackUrl,
      paymentRefId: initResponse.paymentReferenceId,
    });
  } catch (error) {
    console.error('Nagad initiate error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

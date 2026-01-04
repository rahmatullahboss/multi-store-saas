/**
 * bKash Payment Callback API
 * 
 * GET /api/bkash/callback
 * 
 * Handles callback from bKash after user completes/cancels payment
 * Executes the payment and updates order status
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders } from '@db/schema';
import { BkashService } from '~/services/bkash.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const paymentID = url.searchParams.get('paymentID');
  const status = url.searchParams.get('status');
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return redirect('/checkout/failed?error=invalid_order');
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get order
  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.id, parseInt(orderId)))
    .limit(1);

  if (orderResult.length === 0) {
    return redirect('/checkout/failed?error=order_not_found');
  }

  const order = orderResult[0];

  // Handle cancel/failure
  if (status === 'cancel') {
    await db
      .update(orders)
      .set({ 
        status: 'cancelled',
        notes: JSON.stringify({
          ...(order.notes ? JSON.parse(order.notes as string) : {}),
          bkashStatus: 'cancelled',
        }),
      })
      .where(eq(orders.id, parseInt(orderId)));
    
    return redirect(`/checkout/cancelled?orderId=${orderId}`);
  }

  if (status === 'failure' || !paymentID) {
    return redirect(`/checkout/failed?orderId=${orderId}&error=payment_failed`);
  }

  // Execute payment
  try {
    const bkash = BkashService.fromEnv({
      BKASH_BASE_URL: context.cloudflare.env.BKASH_BASE_URL,
      BKASH_APP_KEY: context.cloudflare.env.BKASH_APP_KEY,
      BKASH_APP_SECRET: context.cloudflare.env.BKASH_APP_SECRET,
      BKASH_USERNAME: context.cloudflare.env.BKASH_USERNAME,
      BKASH_PASSWORD: context.cloudflare.env.BKASH_PASSWORD,
    });

    const result = await bkash.executePayment(paymentID);

    if (result.transactionStatus === 'Completed') {
      // Payment successful
      await db
        .update(orders)
        .set({
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'bkash',
          notes: JSON.stringify({
            ...(order.notes ? JSON.parse(order.notes as string) : {}),
            bkashPaymentID: paymentID,
            bkashTrxID: result.trxID,
            bkashStatus: 'completed',
            paidAt: new Date().toISOString(),
          }),
        })
        .where(eq(orders.id, parseInt(orderId)));

      return redirect(`/checkout/success?orderId=${orderId}&trxID=${result.trxID}`);
    } else {
      // Payment failed
      await db
        .update(orders)
        .set({
          notes: JSON.stringify({
            ...(order.notes ? JSON.parse(order.notes as string) : {}),
            bkashPaymentID: paymentID,
            bkashStatus: result.transactionStatus,
            bkashError: result.statusMessage,
          }),
        })
        .where(eq(orders.id, parseInt(orderId)));

      return redirect(`/checkout/failed?orderId=${orderId}&error=${result.statusMessage || 'payment_failed'}`);
    }
  } catch (error) {
    console.error('bKash execute error:', error);
    return redirect(`/checkout/failed?orderId=${orderId}&error=execution_failed`);
  }
}

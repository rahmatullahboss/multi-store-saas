/**
 * Nagad Payment Callback API
 * 
 * GET /api/nagad/callback
 * 
 * Handles callback from Nagad after user completes/cancels payment
 * Verifies the payment and updates order status
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders } from '@db/schema';
import { NagadService } from '~/services/nagad.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const paymentRefId = url.searchParams.get('payment_ref_id');
  const status = url.searchParams.get('status');
  const orderId = url.searchParams.get('orderId') || url.searchParams.get('order_id');

  if (!orderId) {
    return redirect('/checkout/failed?error=invalid_order');
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get order by orderNumber
  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderId))
    .limit(1);

  if (orderResult.length === 0) {
    return redirect('/checkout/failed?error=order_not_found');
  }

  const order = orderResult[0];

  // Handle cancel/failure
  if (status === 'cancel' || status === 'Aborted') {
    await db
      .update(orders)
      .set({ 
        status: 'cancelled',
        notes: JSON.stringify({
          ...(order.notes ? JSON.parse(order.notes as string) : {}),
          nagadStatus: 'cancelled',
        }),
      })
      .where(eq(orders.id, order.id));
    
    return redirect(`/checkout/cancelled?orderId=${order.id}`);
  }

  if (status === 'failure' || status === 'Failed' || !paymentRefId) {
    return redirect(`/checkout/failed?orderId=${order.id}&error=payment_failed`);
  }

  // Verify payment
  try {
    const nagad = NagadService.fromEnv({
      NAGAD_BASE_URL: (context.cloudflare.env as Record<string, string>).NAGAD_BASE_URL,
      NAGAD_MERCHANT_ID: (context.cloudflare.env as Record<string, string>).NAGAD_MERCHANT_ID,
      NAGAD_MERCHANT_NUMBER: (context.cloudflare.env as Record<string, string>).NAGAD_MERCHANT_NUMBER,
      NAGAD_PUBLIC_KEY: (context.cloudflare.env as Record<string, string>).NAGAD_PUBLIC_KEY,
      NAGAD_PRIVATE_KEY: (context.cloudflare.env as Record<string, string>).NAGAD_PRIVATE_KEY,
    });

    const result = await nagad.verifyPayment(paymentRefId);

    if (result.status === 'Success') {
      // Payment successful
      await db
        .update(orders)
        .set({
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'nagad',
          notes: JSON.stringify({
            ...(order.notes ? JSON.parse(order.notes as string) : {}),
            nagadPaymentRefId: paymentRefId,
            nagadTrxId: result.issuerPaymentRefNo,
            nagadStatus: 'completed',
            nagadAmount: result.amount,
            paidAt: new Date().toISOString(),
          }),
        })
        .where(eq(orders.id, order.id));

      return redirect(`/checkout/success?orderId=${order.id}&trxID=${result.issuerPaymentRefNo}`);
    } else {
      // Payment failed
      await db
        .update(orders)
        .set({
          notes: JSON.stringify({
            ...(order.notes ? JSON.parse(order.notes as string) : {}),
            nagadPaymentRefId: paymentRefId,
            nagadStatus: result.status,
            nagadError: result.statusCode,
          }),
        })
        .where(eq(orders.id, order.id));

      return redirect(`/checkout/failed?orderId=${order.id}&error=${result.statusCode || 'payment_failed'}`);
    }
  } catch (error) {
    console.error('Nagad verify error:', error);
    return redirect(`/checkout/failed?orderId=${order.id}&error=verification_failed`);
  }
}

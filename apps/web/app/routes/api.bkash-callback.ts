/**
 * bKash Gateway Callback Route
 * Route: GET /api/bkash-callback
 *
 * bKash redirects here after customer completes/cancels/fails payment.
 * Query params: paymentID, status, orderId, storeId
 *
 * Flow:
 *  1. Check status param (success/failure/cancel)
 *  2. If success → executePayment() to verify with bKash API
 *  3. Update order paymentStatus in DB
 *  4. Redirect to appropriate page
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders, stores } from '@db/schema';
import { parseGatewayConfig, getEffectiveBkashGatewayConfig } from '~/lib/gateway-config';
import { createBkashGatewayService } from '~/services/bkash-gateway.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const paymentID = url.searchParams.get('paymentID');
  const status = url.searchParams.get('status'); // success | failure | cancel
  const orderIdStr = url.searchParams.get('orderId');
  const storeIdStr = url.searchParams.get('storeId');

  const orderId = orderIdStr ? parseInt(orderIdStr) : null;
  const storeId = storeIdStr ? parseInt(storeIdStr) : null;

  const origin = url.origin;

  // Validate required params
  if (!orderId || !storeId) {
    return redirect(`${origin}/checkout/failed?error=invalid_callback`);
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Handle cancel/failure without executing
  if (status === 'cancel') {
    await db
      .update(orders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));
    return redirect(`${origin}/checkout/cancelled?orderId=${orderId}`);
  }

  if (status === 'failure' || !paymentID) {
    await db
      .update(orders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));
    return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=payment_failed`);
  }

  // status === 'success' → execute payment to verify
  try {
    // Get store gateway config
    const storeData = await db
      .select({ gatewayConfig: stores.gatewayConfig })
      .from(stores)
      .where(eq(stores.id, storeId))
      .get();

    if (!storeData) {
      return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=store_not_found`);
    }

    const gatewayConfig = parseGatewayConfig(storeData.gatewayConfig as string | null);
    const bkashCreds = getEffectiveBkashGatewayConfig(gatewayConfig);

    if (!bkashCreds) {
      return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=gateway_not_configured`);
    }

    // Execute payment with bKash API to confirm
    const bkash = createBkashGatewayService(bkashCreds);
    const result = await bkash.executePayment(paymentID);

    if (result.transactionStatus === 'Completed' && result.statusCode === '0000') {
      // Payment confirmed — mark order as paid
      await db
        .update(orders)
        .set({
          paymentStatus: 'paid',
          transactionId: result.trxID,
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      return redirect(`${origin}/checkout/success?orderId=${orderId}`);
    } else {
      // Payment not completed
      await db
        .update(orders)
        .set({ paymentStatus: 'failed', updatedAt: new Date() })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      return redirect(
        `${origin}/checkout/failed?orderId=${orderId}&error=${result.statusCode}`
      );
    }
  } catch (error) {
    console.error('[bKash Callback] Error:', error);
    await db
      .update(orders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));
    return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=execution_failed`);
  }
}

/**
 * Nagad Gateway Callback Route
 * Route: GET /api/nagad-callback
 *
 * Nagad redirects here after customer completes/cancels/fails payment.
 * Query params: payment_ref_id, status, orderId, storeId
 *
 * Flow:
 *  1. Get payment_ref_id from query params
 *  2. Verify payment with Nagad API
 *  3. Update order paymentStatus in DB
 *  4. Redirect to appropriate page
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders, stores } from '@db/schema';
import { parseGatewayConfig, getEffectiveNagadGatewayConfig } from '~/lib/gateway-config';
import { createNagadGatewayService } from '~/services/nagad-gateway.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const paymentRefId = url.searchParams.get('payment_ref_id');
  const status = url.searchParams.get('status');
  const orderIdStr = url.searchParams.get('orderId');
  const storeIdStr = url.searchParams.get('storeId');

  const orderId = orderIdStr ? parseInt(orderIdStr) : null;
  const storeId = storeIdStr ? parseInt(storeIdStr) : null;
  const origin = url.origin;

  if (!orderId || !storeId) {
    return redirect(`${origin}/checkout/failed?error=invalid_callback`);
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Handle cancel
  if (status === 'Cancel' || status === 'cancel') {
    await db
      .update(orders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));
    return redirect(`${origin}/checkout/cancelled?orderId=${orderId}`);
  }

  // Handle failure or missing paymentRefId
  if (!paymentRefId || status === 'Fail' || status === 'fail') {
    await db
      .update(orders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));
    return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=payment_failed`);
  }

  // status === 'Success' → verify with Nagad API
  try {
    const storeData = await db
      .select({ gatewayConfig: stores.gatewayConfig })
      .from(stores)
      .where(eq(stores.id, storeId))
      .get();

    if (!storeData) {
      return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=store_not_found`);
    }

    const gatewayConfig = parseGatewayConfig(storeData.gatewayConfig as string | null);
    const nagadCreds = getEffectiveNagadGatewayConfig(gatewayConfig);

    if (!nagadCreds) {
      return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=gateway_not_configured`);
    }

    const nagad = createNagadGatewayService(nagadCreds);
    const result = await nagad.verifyPayment(paymentRefId);

    if (result.status === 'Success' || result.statusCode === '000') {
      await db
        .update(orders)
        .set({
          paymentStatus: 'paid',
          transactionId: result.issuerPaymentRefNo || paymentRefId,
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      return redirect(`${origin}/checkout/success?orderId=${orderId}`);
    } else {
      await db
        .update(orders)
        .set({ paymentStatus: 'failed', updatedAt: new Date() })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      return redirect(
        `${origin}/checkout/failed?orderId=${orderId}&error=${result.statusCode || 'verify_failed'}`
      );
    }
  } catch (error) {
    console.error('[Nagad Callback] Error:', error);
    await db
      .update(orders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));
    return redirect(`${origin}/checkout/failed?orderId=${orderId}&error=execution_failed`);
  }
}

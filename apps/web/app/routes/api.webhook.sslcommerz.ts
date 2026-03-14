import { type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { orders } from '@db/schema';
import { createSslCommerzService } from '~/services/sslcommerz.server';
import { checkAndMarkWebhook } from '~/services/webhook-utils.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env as unknown as Record<string, string | undefined>;
  const db = drizzle(context.cloudflare.env.DB);

  try {
    const contentType = request.headers.get('content-type') || '';
    const payload: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      const body = (await request.json()) as Record<string, string>;
      Object.assign(payload, body);
    } else {
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        payload[key] = String(value);
      }
    }

    const tranId = payload.tran_id || payload.tranId;
    const valId = payload.val_id || payload.valId;
    const status = (payload.status || '').toUpperCase();

    if (!tranId) {
      return json({ success: false, error: 'Missing tran_id' }, { status: 400 });
    }

    const dedupe = await checkAndMarkWebhook(
      context.cloudflare.env.DB,
      'sslcommerz',
      valId || `tran:${tranId}`,
      status || 'IPN',
      payload
    );

    if (!dedupe.isNew) {
      return json({ success: true, duplicate: true });
    }

    const existingOrder = await db
      .select({
        id: orders.id,
        storeId: orders.storeId,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
      })
      .from(orders)
      .where(eq(orders.orderNumber, tranId))
      .limit(1);

    if (existingOrder.length === 0) {
      return json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const order = existingOrder[0];

    // If gateway already says failed/cancelled, mark failed and exit.
    if (['FAILED', 'CANCELLED'].includes(status)) {
      await db
        .update(orders)
        .set({
          paymentStatus: 'failed',
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, order.id), eq(orders.storeId, order.storeId)));

      return json({ success: true, status: 'failed' });
    }

    if (!valId) {
      return json({ success: false, error: 'Missing val_id for validation' }, { status: 400 });
    }

    const ssl = createSslCommerzService(env);
    const validation = await ssl.validatePayment(valId);

    const isValid =
      (validation.status || '').toUpperCase() === 'VALID' ||
      (validation.status || '').toUpperCase() === 'VALIDATED';

    const sameTransaction = (validation.tran_id || '').trim() === tranId.trim();
    const validatedAmount = Number(validation.amount);
    const amountMatches =
      Number.isFinite(validatedAmount) && Math.abs(validatedAmount - Number(order.total)) < 0.01;

    if (!isValid || !sameTransaction || !amountMatches) {
      await db
        .update(orders)
        .set({
          paymentStatus: 'failed',
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, order.id), eq(orders.storeId, order.storeId)));

      return json(
        {
          success: false,
          error: 'Payment validation failed',
          validationStatus: validation.status || null,
          amountMismatch: !amountMatches,
        },
        { status: 400 }
      );
    }

    await db
      .update(orders)
      .set({
        paymentStatus: 'paid',
        status: 'confirmed',
        transactionId: validation.bank_tran_id || valId,
        updatedAt: new Date(),
      })
      .where(and(eq(orders.id, order.id), eq(orders.storeId, order.storeId)));

    return json({ success: true, status: 'paid' });
  } catch (error) {
    console.error('[SSLCommerz Webhook] Error:', error);
    return json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}

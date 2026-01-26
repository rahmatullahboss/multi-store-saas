import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { payments, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';

/**
 * Payment Invoice PDF Generator
 *
 * Route: /resources/invoice/:paymentId
 *
 * Uses PDF_SERVICE (Service Binding) to generate invoices.
 * Heavy jsPDF library is offloaded to separate worker.
 */

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const paymentId = params.paymentId;
  if (!paymentId) throw new Response('Payment ID required', { status: 400 });

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch payment and store details
  const result = await db
    .select({
      payment: payments,
      store: stores,
    })
    .from(payments)
    .innerJoin(stores, eq(payments.storeId, stores.id))
    .where(and(eq(payments.id, Number(paymentId)), eq(payments.storeId, storeId)))
    .get();

  if (!result) throw new Response('Invoice not found', { status: 404 });

  const { payment, store } = result;

  // Call PDF_SERVICE via Service Binding
  const pdfService = context.cloudflare.env.PDF_SERVICE;

  if (!pdfService) {
    throw new Response('PDF service not available', { status: 503 });
  }

  // Call the PDF worker
  const pdfResponse = await pdfService.fetch(
    new Request('https://pdf-worker/payment-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment: {
          id: payment.id,
          orderId: 0, // payments table doesn't have orderId
          amount: payment.amount,
          method: payment.planType || 'subscription',
          status: payment.status || 'pending',
          transactionId: payment.transactionId,
          createdAt: payment.createdAt,
        },
        store: {
          name: store.name,
          currency: store.currency,
        },
      }),
    })
  );

  if (!pdfResponse.ok) {
    const error = await pdfResponse.text();
    throw new Response(`PDF generation failed: ${error}`, { status: 500 });
  }

  // Return PDF response with proper headers
  return new Response(pdfResponse.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${payment.id}.pdf"`,
    },
  });
}

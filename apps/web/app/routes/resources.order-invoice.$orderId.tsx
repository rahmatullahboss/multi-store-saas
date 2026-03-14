import { type LoaderFunctionArgs } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders, orderItems, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';

/**
 * Order Invoice PDF Generator
 *
 * Route: /resources/order-invoice/:orderId
 *
 * Uses PDF_SERVICE (Service Binding) to generate invoices.
 * Heavy jsPDF library is offloaded to separate worker.
 */

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const orderId = Number(params.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Response('Order ID required', { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch order with store details
  const result = await db
    .select({
      order: orders,
      store: stores,
    })
    .from(orders)
    .innerJoin(stores, eq(orders.storeId, stores.id))
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .get();

  if (!result) throw new Response('Order not found', { status: 404 });

  const { order, store } = result;

  // Fetch order items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  // Call PDF_SERVICE via Service Binding
  const pdfService = context.cloudflare.env.PDF_SERVICE;

  if (!pdfService) {
    throw new Response('PDF service not available', { status: 503 });
  }

  // Call the PDF worker
  const pdfResponse = await pdfService.fetch(
    new Request('https://pdf-worker/order-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          notes: order.notes,
          createdAt: order.createdAt,
        },
        store: {
          name: store.name,
          currency: store.currency,
        },
        items: items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
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
      'Content-Disposition': `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
    },
  });
}

export default function () {}

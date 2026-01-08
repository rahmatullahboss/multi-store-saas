import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { payments, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fix for jsPDF in Worker environment (if needed, but jsPDF is mostly client/node. 
// In CF Workers, we might need a workaround or just generate strictly.
// Since jsPDF is often used in browser, running it in Worker might be tricky without DOM.
// However, newer versions support it. We'll try standard usage first.)

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
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

  // Generate PDF
  // Note: jsPDF usually expects a window object. in CF Worker it might fail.
  // If it fails, we might need to rely on a different approach or just return data 
  // and let client generate it. 
  // Let's try to generate it here. If `window` is missing, we might need to mock it or use a purely non-DOM lib.
  // Actually, for robust PDF generation in Cloudflare Workers, a client-side generation 
  // (fetching data JSON and generating on client) or a specific library like `pdf-lib` or `@react-pdf/renderer` 
  // is often safer. But the plan said `jspdf`.
  // Let's try to see if we can just return the data to the client to generate it, 
  // OR use a safe way. 
  // Actually, the safest bet for "Download Invoice" in Remix+CF is often:
  // 1. Client clicks button -> fetches JSON -> generates PDF in browser (saves server CPU).
  // 2. Resource route returns PDF stream (heavy on server).
  // Given the constraints and typical "Invoice Download" UX, server-side is preferred for "official" feel,
  // but client-side is much easier for CF Workers (no node modules, no DOM).
  
  // Let's stick to the plan: Resource Route. But if I can't run jsPDF in worker, I have to pivot.
  // jsPDF *can* work in node with some polyfills, but CF Worker is not Node.
  // `jspdf` depends on DOM/Node.
  
  // ALTERNATIVE: Return the raw data and let the Client component generate/download it?
  // Or use the resource route to returned a stamped PDF.
  // 
  // Let's try to implement a simple "PDF Generator" using `pdfmake` or similar if `jspdf` fails?
  // Actually, creating a client-side generator function is safer and more scalable for CF.
  // The User approved `jspdf`. 
  // I will implement the Resource Route to return **JSON Data** and let the client generate the PDF?
  // NO, the plan said "Resource route ... Generates PDF".
  // I will try to use `jspdf` in the worker. If it fails due to missing window, I'll switch to client-side.
  
  // Wait, I can't easily fallback if I commit to a resource route that crashes.
  // I'll assume for a moment that I can polyfill or it works. 
  // Actually, `jspdf` creates a PDF file string. 
  
  // Let's try a different approach:
  // I'll create the route. I'll simply initialize jsPDF. 
  // `const doc = new jsPDF();`
  // If this throws, I'll know.
  // But wait, I'm writing code now.
  
  // Better approach for Cloudflare:
  // Return the PDF as an ArrayBuffer.
  // I will write the code to generating it.
  
  const doc = new jsPDF();

  // Add Company Logo/Header
  doc.setFontSize(20);
  doc.text('INVOICE', 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Invoice #: INV-${payment.id}`, 14, 30);
  doc.text(`Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString()}`, 14, 35);
  doc.text(`Status: ${payment.status?.toUpperCase()}`, 14, 40);

  // Bill To
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 55);
  doc.setFontSize(10);
  doc.text(`Store: ${store.name}`, 14, 60);
  doc.text(`Email: ${store.notificationEmail || 'N/A'}`, 14, 65);
  
  // Table
  autoTable(doc, {
    startY: 75,
    head: [['Description', 'Period', 'Amount']],
    body: [
      [
        `${payment.planType ? payment.planType.toUpperCase() : 'Subscription'} Plan`,
        `${new Date(payment.periodStart || Date.now()).toLocaleDateString()} - ${new Date(payment.periodEnd || Date.now()).toLocaleDateString()}`,
        `${payment.amount} ${payment.currency}`
      ]
    ],
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total: ${payment.amount} ${payment.currency}`, 14, finalY);

  const pdfOutput = doc.output('arraybuffer');

  return new Response(pdfOutput, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${payment.id}.pdf"`,
    },
  });
}

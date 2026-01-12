import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders, orderItems, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Order Invoice PDF Generator
 * 
 * Route: /resources/order-invoice/:orderId
 * 
 * Generates a professional PDF invoice for merchant orders.
 * Uses jsPDF for PDF generation with autotable for item tables.
 */

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const orderId = params.orderId;
  if (!orderId) throw new Response('Order ID required', { status: 400 });

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch order with store details
  const result = await db
    .select({
      order: orders,
      store: stores,
    })
    .from(orders)
    .innerJoin(stores, eq(orders.storeId, stores.id))
    .where(and(eq(orders.id, Number(orderId)), eq(orders.storeId, storeId)))
    .get();

  if (!result) throw new Response('Order not found', { status: 404 });

  const { order, store } = result;

  // Fetch order items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, Number(orderId)));

  // Parse shipping address
  let shippingAddress: { address?: string; city?: string; postalCode?: string } = {};
  try {
    if (order.shippingAddress) {
      shippingAddress = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
    }
  } catch {
    shippingAddress = {};
  }

  // Currency formatter
  const currency = store.currency || 'BDT';
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Generate PDF
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39); // gray-900
  doc.text('INVOICE', 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(`Invoice #: ${order.orderNumber}`, 14, 33);
  doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, 14, 38);

  // Store Name (Right aligned)
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(store.name || 'Store', 196, 25, { align: 'right' });

  // Status Badge
  const statusColors: Record<string, [number, number, number]> = {
    delivered: [16, 185, 129], // emerald
    cancelled: [239, 68, 68], // red
    pending: [245, 158, 11], // amber
    processing: [139, 92, 246], // purple
    shipped: [59, 130, 246], // blue
  };
  const statusColor = statusColors[order.status || 'pending'] || statusColors.pending;
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(10);
  doc.text((order.status || 'PENDING').toUpperCase(), 196, 33, { align: 'right' });

  // Divider
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(14, 45, 196, 45);

  // Bill To / Ship To
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('BILL TO', 14, 55);
  doc.text('SHIP TO', 110, 55);

  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(order.customerName || 'Customer', 14, 62);
  
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99); // gray-600
  if (order.customerPhone) doc.text(order.customerPhone, 14, 68);
  if (order.customerEmail) doc.text(order.customerEmail, 14, 74);

  // Ship To
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  let shipY = 62;
  if (shippingAddress.address) {
    doc.text(shippingAddress.address, 110, shipY);
    shipY += 6;
  }
  if (shippingAddress.city) {
    doc.text(shippingAddress.city, 110, shipY);
    shipY += 6;
  }
  if (shippingAddress.postalCode) {
    doc.text(`Postal: ${shippingAddress.postalCode}`, 110, shipY);
  }

  // Items Table
  const tableData = items.map(item => [
    item.title,
    item.quantity.toString(),
    formatPrice(item.price),
    formatPrice(item.total)
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [249, 250, 251], // gray-50
      textColor: [75, 85, 99], // gray-600
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  // Get final Y position after table
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Totals Section (Right aligned)
  const totalsX = 140;
  const valueX = 196;
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Subtotal:', totalsX, finalY);
  doc.setTextColor(17, 24, 39);
  doc.text(formatPrice(order.subtotal), valueX, finalY, { align: 'right' });

  doc.setTextColor(107, 114, 128);
  doc.text('Shipping:', totalsX, finalY + 7);
  doc.setTextColor(17, 24, 39);
  doc.text(formatPrice(order.shipping || 0), valueX, finalY + 7, { align: 'right' });

  doc.setTextColor(107, 114, 128);
  doc.text('Tax:', totalsX, finalY + 14);
  doc.setTextColor(17, 24, 39);
  doc.text(formatPrice(order.tax || 0), valueX, finalY + 14, { align: 'right' });

  // Total line
  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX, finalY + 18, valueX, finalY + 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', totalsX, finalY + 26);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(formatPrice(order.total), valueX, finalY + 26, { align: 'right' });

  // Payment Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Payment: ${(order.paymentMethod || 'COD').toUpperCase()}`, 14, finalY + 10);
  doc.text(`Status: ${(order.paymentStatus || 'pending').toUpperCase()}`, 14, finalY + 16);

  // Notes
  if (order.notes) {
    doc.text('Notes:', 14, finalY + 28);
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(order.notes, 100);
    doc.text(splitNotes, 14, finalY + 34);
  }

  // Footer
  const footerY = 280;
  doc.setDrawColor(229, 231, 235);
  doc.line(14, footerY - 5, 196, footerY - 5);

  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text('Thank you for your order!', 105, footerY, { align: 'center' });
  doc.text('Powered by Multi-Store SaaS', 105, footerY + 5, { align: 'center' });

  // Output PDF
  const pdfOutput = doc.output('arraybuffer');

  return new Response(pdfOutput, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
    },
  });
}

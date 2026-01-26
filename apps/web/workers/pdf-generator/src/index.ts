/**
 * PDF Generator Worker
 *
 * Separate worker for heavy jsPDF library (~410KB)
 * Called via Service Binding from main Pages app
 *
 * Endpoints:
 * - POST /order-invoice - Generate order invoice PDF
 * - POST /payment-invoice - Generate payment invoice PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Env {
  DB: D1Database;
}

interface OrderData {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    subtotal: number;
    shipping?: number;
    tax?: number;
    total: number;
    paymentMethod?: string;
    paymentStatus?: string;
    notes?: string;
    createdAt?: string;
  };
  store: {
    name: string;
    currency?: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface PaymentData {
  payment: {
    id: number;
    orderId: number;
    amount: number;
    method: string;
    status: string;
    transactionId?: string;
    createdAt?: string;
  };
  store: {
    name: string;
    currency?: string;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for Service Binding calls
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      switch (url.pathname) {
        case '/order-invoice':
          return await generateOrderInvoice(request);
        case '/payment-invoice':
          return await generatePaymentInvoice(request);
        case '/health':
          return new Response('OK', { status: 200 });
        default:
          return new Response('Not found', { status: 404 });
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'PDF generation failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};

async function generateOrderInvoice(request: Request): Promise<Response> {
  const data: OrderData = await request.json();
  const { order, store, items } = data;

  // Parse shipping address
  let shippingAddress: { address?: string; city?: string; postalCode?: string } = {};
  try {
    if (order.shippingAddress) {
      shippingAddress =
        typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
    }
  } catch {
    shippingAddress = {};
  }

  // Currency formatter
  const currency = store.currency || 'BDT';
  const formatPrice = (priceInCents: number) => {
    const price = priceInCents / 100;
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
  doc.setTextColor(17, 24, 39);
  doc.text('INVOICE', 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Invoice #: ${order.orderNumber}`, 14, 33);
  doc.text(
    `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    14,
    38
  );

  // Store Name (Right aligned)
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(store.name || 'Store', 196, 25, { align: 'right' });

  // Status Badge
  const statusColors: Record<string, [number, number, number]> = {
    delivered: [16, 185, 129],
    cancelled: [239, 68, 68],
    pending: [245, 158, 11],
    processing: [139, 92, 246],
    shipped: [59, 130, 246],
  };
  const statusColor = statusColors[order.status || 'pending'] || statusColors.pending;
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(10);
  doc.text((order.status || 'PENDING').toUpperCase(), 196, 33, { align: 'right' });

  // Divider
  doc.setDrawColor(229, 231, 235);
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
  doc.setTextColor(75, 85, 99);
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
  const tableData = items.map((item) => [
    item.title,
    item.quantity.toString(),
    formatPrice(item.price),
    formatPrice(item.total),
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
      fillColor: [249, 250, 251],
      textColor: [75, 85, 99],
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
  const finalY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Totals Section
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
  doc.setTextColor(16, 185, 129);
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
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for your order!', 105, footerY, { align: 'center' });
  doc.text('Powered by Ozzyl', 105, footerY + 5, { align: 'center' });

  // Output PDF
  const pdfOutput = doc.output('arraybuffer');

  return new Response(pdfOutput, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
    },
  });
}

async function generatePaymentInvoice(request: Request): Promise<Response> {
  const data: PaymentData = await request.json();
  const { payment, store } = data;

  const currency = store.currency || 'BDT';
  const formatPrice = (priceInCents: number) => {
    const price = priceInCents / 100;
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text('PAYMENT RECEIPT', 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Receipt #: PAY-${payment.id}`, 14, 33);
  doc.text(
    `Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    14,
    38
  );

  // Store Name
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(store.name || 'Store', 196, 25, { align: 'right' });

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 45, 196, 45);

  // Payment Details
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Payment Details', 14, 55);

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Order ID: ${payment.orderId}`, 14, 65);
  doc.text(`Amount: ${formatPrice(payment.amount)}`, 14, 72);
  doc.text(`Method: ${payment.method.toUpperCase()}`, 14, 79);
  doc.text(`Status: ${payment.status.toUpperCase()}`, 14, 86);
  if (payment.transactionId) {
    doc.text(`Transaction ID: ${payment.transactionId}`, 14, 93);
  }

  // Footer
  const footerY = 280;
  doc.setDrawColor(229, 231, 235);
  doc.line(14, footerY - 5, 196, footerY - 5);

  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for your payment!', 105, footerY, { align: 'center' });
  doc.text('Powered by Ozzyl', 105, footerY + 5, { align: 'center' });

  const pdfOutput = doc.output('arraybuffer');

  return new Response(pdfOutput, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Receipt-PAY-${payment.id}.pdf"`,
    },
  });
}

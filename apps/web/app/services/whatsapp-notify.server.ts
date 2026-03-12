export async function notifyMerchantViaWhatsApp(
  merchantPhone: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    currency: string;
    itemCount: number;
    address?: string;
  }
) {
  try {
    const message = `
🛒 New Order #${orderDetails.orderNumber}!
👤 Customer: ${orderDetails.customerName}
📱 Phone: ${orderDetails.customerPhone}
💰 Total: ${orderDetails.currency === 'BDT' ? '৳' : orderDetails.currency}${orderDetails.total} (${orderDetails.itemCount} items)
📍 Address: ${orderDetails.address || 'N/A'}
    `.trim();

    // Option 1: Use Twilio/WhatsApp API if configured
    // Option 2: Store notification for merchant to see in dashboard

    // For now, log the notification (merchants see via Cloudflare Logs)
    console.log(`[WhatsApp Notify] to ${merchantPhone}:\n${message}`);

  } catch (error) {
    console.error('[WhatsApp Notify] Failed to format or send notification:', error);
    // Note: We swallow the error here intentionally so it doesn't break the main flow
  }
}

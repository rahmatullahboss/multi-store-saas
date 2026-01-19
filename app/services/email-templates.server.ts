/**
 * Email Templates
 * 
 * Separated HTML templates for better maintainability.
 */

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

const currencySymbols: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

// Helper: Get symbol
const getSymbol = (currency: string) => currencySymbols[currency] || currency;

// ============================================================================
// ORDER CONFIRMATION
// ============================================================================
export function getOrderConfirmationHtml(data: {
  customerName: string;
  orderNumber: string;
  paymentMethod?: string;
  items: OrderItem[];
  currency: string;
  total: number;
  shippingAddress?: string;
  storeName: string;
  storeLogo?: string;
  primaryColor?: string;
}) {
  const symbol = getSymbol(data.currency);
  
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${symbol}${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const themeColor = data.primaryColor || '#10b981';
  const brandHeader = data.storeLogo
    ? `<img src="${data.storeLogo}" alt="${data.storeName}" style="height: 40px; margin-bottom: 16px; object-fit: contain;">`
    : `<h2 style="margin: 0 0 12px; color: ${themeColor}; font-size: 20px;">${data.storeName}</h2>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${themeColor} 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        ${brandHeader}
        <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi <strong>${data.customerName}</strong>,</p>
        <p>Thank you for your order from ${data.storeName}! We've received your order and will process it shortly.</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${data.orderNumber}</p>
          ${data.paymentMethod ? `<p style="margin: 0;"><strong>Payment:</strong> ${data.paymentMethod}</p>` : ''}
        </div>
        
        <h3 style="color: #374151; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 12px; text-align: right; font-size: 18px; color: #10b981;"><strong>${symbol}${data.total.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
        
        ${data.shippingAddress ? `
          <h3 style="color: #374151; margin-top: 30px;">Shipping Address</h3>
          <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">${data.shippingAddress}</p>
        ` : ''}
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          If you have any questions, just reply to this email. We're here to help!
        </p>
      </div>
      
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
        This email was sent to you because you placed an order.
      </p>
    </body>
    </html>
  `;
}

// ============================================================================
// NEW ORDER ALERT (MERCHANT)
// ============================================================================
export function getNewOrderAlertHtml(data: {
  storeName: string;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  currency: string;
  total: number;
}) {
  const symbol = getSymbol(data.currency);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Order! 🛒</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Great news! Your store <strong>${data.storeName}</strong> just received a new order.</p>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 10px 0;"><strong>Order #${data.orderNumber}</strong></p>
          <p style="margin: 0 0 10px 0;">Customer: ${data.customerName}</p>
          <p style="margin: 0 0 10px 0;">Items: ${data.itemCount}</p>
          <p style="margin: 0; font-size: 20px; color: #1d4ed8;"><strong>Total: ${symbol}${data.total.toLocaleString()}</strong></p>
        </div>
        
        <a href="https://ozzyl.com/app/orders" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Order Details</a>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// SHIPPING UPDATE
// ============================================================================
export function getShippingUpdateHtml(data: {
  status: 'shipped' | 'out_for_delivery' | 'delivered';
  customerName: string;
  orderNumber: string;
  storeName: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}) {
  const statusMessages = {
    shipped: { title: 'Your Order Has Shipped! 📦', color: '#8b5cf6', message: 'Your order is on its way!' },
    out_for_delivery: { title: 'Out for Delivery! 🚚', color: '#f59e0b', message: 'Your order is out for delivery today!' },
    delivered: { title: 'Order Delivered! ✅', color: '#10b981', message: 'Your order has been delivered!' },
  };

  const status = statusMessages[data.status];

  const trackingBlock = data.trackingNumber
    ? `<div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Tracking:</strong> ${data.trackingNumber}</p>
          ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display: inline-block; margin-top: 10px; background: ${status.color}; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Order</a>` : ''}
        </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${status.color}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${status.title}</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi <strong>${data.customerName}</strong>,</p>
        <p>${status.message}</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Order:</strong> #${data.orderNumber}</p>
          <p style="margin: 0 0 10px 0;"><strong>Store:</strong> ${data.storeName}</p>
          ${data.courierName ? `<p style="margin: 0 0 10px 0;"><strong>Courier:</strong> ${data.courierName}</p>` : ''}
        </div>

        ${trackingBlock}
        
        <p style="color: #6b7280; font-size: 14px;">Thank you for shopping with us!</p>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// LOW STOCK ALERT
// ============================================================================
export function getLowStockAlertHtml(data: {
  storeName: string;
  products: Array<{ name: string; stock: number; }>;
}) {
  const productsHtml = data.products
    .map(
      (p) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${p.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #ef4444; font-weight: bold;">${p.stock}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Low Stock Alert</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">The following products in <strong>${data.storeName}</strong> are running low on stock:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #fef2f2;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Stock</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
        </table>
        
        <a href="https://ozzyl.com/app/products" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Update Inventory</a>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// STAFF INVITE
// ============================================================================
export function getStaffInviteHtml(data: {
  inviterName: string;
  storeName: string;
  role: string;
  inviteUrl: string;
}) {
  const roleLabel = {
    admin: 'Administrator',
    staff: 'Staff Member',
    viewer: 'Viewer',
  }[data.role] || data.role;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited! 🎉</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi there,</p>
        <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.storeName}</strong> as a <strong>${roleLabel}</strong>.</p>
        
        <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
          <p style="margin: 0 0 10px 0;"><strong>Store:</strong> ${data.storeName}</p>
          <p style="margin: 0;"><strong>Role:</strong> ${roleLabel}</p>
        </div>
        
        <p>Click the button below to accept this invitation and create your account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.inviteUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days. If you didn't expect this email, you can safely ignore it.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="color: #9ca3af; font-size: 12px;">Or copy and paste this link: <br>${data.inviteUrl}</p>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// SUBSCRIPTION APPROVAL
// ============================================================================
export function getSubscriptionApprovalHtml(data: {
  storeName: string;
  planName: string;
  startDate: Date;
  endDate: Date;
}) {
  const formatDate = (date: Date) => date.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Payment Approved! 🎉</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Great news!</p>
        <p>Your payment for <strong>${data.storeName}</strong> has been approved. Your subscription is now active!</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 10px 0;"><strong>🎯 Plan:</strong> ${data.planName}</p>
          <p style="margin: 0 0 10px 0;"><strong>📅 Start Date:</strong> ${formatDate(data.startDate)}</p>
          <p style="margin: 0;"><strong>📅 End Date:</strong> ${formatDate(data.endDate)}</p>
        </div>
        
        <p>You now have access to all ${data.planName} features. Start growing your business today!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://ozzyl.com/app/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard →</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions about your subscription, please contact our support team.
        </p>
      </div>
      
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
        You received this email because you purchased a subscription.
      </p>
    </body>
    </html>
  `;
}

// ============================================================================
// FIRST SALE CELEBRATION
// ============================================================================
export function getFirstSaleCelebrationHtml(data: {
  merchantName: string;
  storeName: string;
  orderNumber: string;
  amount: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px;">KA-CHING! 💰</h1>
        <p style="color: white; opacity: 0.9; margin: 10px 0 0; font-size: 18px;">You just made your first sale!</p>
      </div>
      
      <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
        <h2 style="font-size: 24px; color: #111827; margin-bottom: 20px;">Congratulations, ${data.merchantName}! 🎉</h2>
        
        <p style="font-size: 16px; color: #4B5563; margin-bottom: 30px;">
          This is a huge milestone. The first sale is always the hardest, and you've done it!
          Here are the details of your victory:
        </p>
        
        <div style="background: #FFFBEB; padding: 25px; border-radius: 12px; margin: 0 auto 30px; display: inline-block; min-width: 250px; border: 2px dashed #F59E0B;">
          <p style="font-size: 14px; color: #92400E; margin: 0 0 5px; text-transform: uppercase; font-weight: bold;">Order Amount</p>
          <p style="font-size: 36px; font-weight: 800; color: #D97706; margin: 0;">${data.amount}</p>
          <p style="font-size: 14px; color: #B45309; margin: 5px 0 0;">Order #${data.orderNumber}</p>
        </div>
        
        <p style="font-size: 16px; color: #374151;">
          Don't stop here! This is just the beginning of your empire.
          Go fulfill this order and keep the momentum going! 🚀
        </p>

        <div style="margin-top: 40px;">
          <a href="https://ozzyl.com/app/orders/${data.orderNumber}" style="display: inline-block; background: #000000; color: white; padding: 16px 36px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            Fulfill My First Order
          </a>
        </div>
      </div>
      
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
        Sent with ❤️ from Ozzyl Team
      </p>
    </body>
    </html>
  `;
}

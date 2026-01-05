/**
 * Email Service using Resend
 * 
 * Handles all transactional emails:
 * - Order confirmation (customer)
 * - New order alert (merchant)
 * - Shipping updates
 * - Low stock alerts
 */

// Note: Resend is imported dynamically to avoid SSR bundling issues with svix (CommonJS)

// Types for email service
interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string;
  paymentMethod?: string;
}

interface MerchantEmailData {
  merchantEmail: string;
  storeName: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  itemCount: number;
}

interface ShippingEmailData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  storeName: string;
  trackingNumber?: string;
  courierName?: string;
  status: 'shipped' | 'out_for_delivery' | 'delivered';
}

interface LowStockEmailData {
  merchantEmail: string;
  storeName: string;
  products: Array<{
    name: string;
    stock: number;
  }>;
}

// Currency symbols
const currencySymbols: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

/**
 * Create email service with Resend API key
 * Uses dynamic import to avoid SSR bundling issues
 */
export function createEmailService(apiKey: string, fromEmail?: string) {
  const defaultFrom = fromEmail || 'Multi-Store SaaS <noreply@digitalcare.site>';
  
  // Lazy load resend to avoid SSR issues
  const getResend = async () => {
    const { Resend } = await import('resend');
    return new Resend(apiKey);
  };

  return {
    /**
     * Send order confirmation email to customer
     */
    async sendOrderConfirmation(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
      try {
        const symbol = currencySymbols[data.currency] || data.currency;
        
        const itemsHtml = data.items
          .map(
            (item) => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${symbol}${item.price.toLocaleString()}</td>
            </tr>
          `
          )
          .join('');

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Hi <strong>${data.customerName}</strong>,</p>
              <p>Thank you for your order! We've received your order and will process it shortly.</p>
              
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

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.customerEmail,
          subject: `Order Confirmed! #${data.orderNumber}`,
          html,
        });

        if (error) {
          console.error('Email send error:', error);
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        console.error('Email service error:', err);
        return { success: false, error: String(err) };
      }
    },

    /**
     * Send new order notification to merchant
     */
    async sendNewOrderAlert(data: MerchantEmailData): Promise<{ success: boolean; error?: string }> {
      try {
        const symbol = currencySymbols[data.currency] || data.currency;

        const html = `
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
              
              <a href="https://online-bazar.top/app/dashboard/orders" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Order Details</a>
            </div>
          </body>
          </html>
        `;

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.merchantEmail,
          subject: `🛒 New Order #${data.orderNumber} - ${symbol}${data.total.toLocaleString()}`,
          html,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },

    /**
     * Send shipping status update to customer
     */
    async sendShippingUpdate(data: ShippingEmailData): Promise<{ success: boolean; error?: string }> {
      try {
        const statusMessages = {
          shipped: { title: 'Your Order Has Shipped! 📦', color: '#8b5cf6', message: 'Your order is on its way!' },
          out_for_delivery: { title: 'Out for Delivery! 🚚', color: '#f59e0b', message: 'Your order is out for delivery today!' },
          delivered: { title: 'Order Delivered! ✅', color: '#10b981', message: 'Your order has been delivered!' },
        };

        const status = statusMessages[data.status];

        const html = `
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
                ${data.trackingNumber ? `<p style="margin: 0;"><strong>Tracking:</strong> ${data.trackingNumber}</p>` : ''}
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">Thank you for shopping with us!</p>
            </div>
          </body>
          </html>
        `;

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.customerEmail,
          subject: `${status.title} - Order #${data.orderNumber}`,
          html,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },

    /**
     * Send low stock alert to merchant
     */
    async sendLowStockAlert(data: LowStockEmailData): Promise<{ success: boolean; error?: string }> {
      try {
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

        const html = `
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
              
              <a href="https://online-bazar.top/app/products" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Update Inventory</a>
            </div>
          </body>
          </html>
        `;

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.merchantEmail,
          subject: `⚠️ Low Stock Alert - ${data.products.length} products need attention`,
          html,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },

    /**
     * Send staff invitation email
     */
    async sendStaffInvite(data: {
      email: string;
      inviterName: string;
      storeName: string;
      role: string;
      inviteUrl: string;
    }): Promise<{ success: boolean; error?: string }> {
      try {
        const roleLabel = {
          admin: 'Administrator',
          staff: 'Staff Member',
          viewer: 'Viewer',
        }[data.role] || data.role;

        const html = `
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

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.email,
          subject: `You're invited to join ${data.storeName}`,
          html,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },

    /**
     * Send campaign marketing email
     */
    async sendCampaignEmail(data: {
      email: string;
      subject: string;
      content: string;
      storeName: string;
      previewText?: string;
      unsubscribeUrl: string;
    }): Promise<{ success: boolean; error?: string }> {
      try {
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${data.content}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="text-align: center; color: #9ca3af; font-size: 12px;">
              You received this email from ${data.storeName}.<br>
              <a href="${data.unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
            </p>
          </body>
          </html>
        `;

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.email,
          subject: data.subject,
          html,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
  };
}

// Export types
export type EmailService = ReturnType<typeof createEmailService>;

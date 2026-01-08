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

import { 
  getOrderConfirmationHtml, 
  getNewOrderAlertHtml, 
  getShippingUpdateHtml, 
  getLowStockAlertHtml, 
  getStaffInviteHtml, 
  getSubscriptionApprovalHtml 
} from './email-templates.server';

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
        const html = getOrderConfirmationHtml(data);
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
        const symbol = data.currency; // Passed to template logic if needed, actually template handles symbol lookup
        const html = getNewOrderAlertHtml(data);

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.merchantEmail,
          subject: `🛒 New Order #${data.orderNumber} - ${data.total}`, // Simplification, can improve subject formatting
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
        const html = getShippingUpdateHtml(data);
        const subjects: Record<string, string> = {
            shipped: 'Your Order Has Shipped! 📦',
            out_for_delivery: 'Out for Delivery! 🚚',
            delivered: 'Order Delivered! ✅',
        };

        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.customerEmail,
          subject: `${subjects[data.status] || 'Order Update'} - Order #${data.orderNumber}`,
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
        const html = getLowStockAlertHtml(data);
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
        const html = getStaffInviteHtml(data);
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
        // Campaign email content is dynamic and comes from user input, so we wrap it here locally
        // or extract a wrapper template too. For now keeping wrapper here is fine or could extract 'getCampaignHtml'.
        // Let's keep it simple and inline the wrapper here to avoid complexity with user content injection.
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

    /**
     * Send subscription approval confirmation to store owner
     */
    async sendSubscriptionApprovalEmail(data: {
      email: string;
      storeName: string;
      planName: string;
      startDate: Date;
      endDate: Date;
    }): Promise<{ success: boolean; error?: string }> {
      try {
        const html = getSubscriptionApprovalHtml(data);
        const resend = await getResend();
        const { error } = await resend.emails.send({
          from: defaultFrom,
          to: data.email,
          subject: `✅ Payment Approved - ${data.planName} Plan Activated!`,
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

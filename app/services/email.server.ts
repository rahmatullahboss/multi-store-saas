import { Resend } from 'resend';
import { getFirstSaleCelebrationHtml, getOrderConfirmationHtml, getShippingUpdateHtml } from './email-templates.server';
// Env is globally declared

/**
 * Send a password reset email to the user
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  env: Env
): Promise<{ success: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn('[email.server] RESEND_API_KEY is missing. Email not sent.');
    // For local dev without API key, we log the token
    if (env.ENVIRONMENT === 'development' || !env.ENVIRONMENT) {
      console.log('=================================================================');
      console.log(`[DEV] Password Reset Token for ${email}: ${token}`);
      console.log(`[DEV] Link: ${env.SAAS_DOMAIN}/auth/reset-password?token=${token}`);
      console.log('=================================================================');
      return { success: true };
    }
    return { success: false, error: 'Email service configuration missing.' };
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const resetLink = `${env.SAAS_DOMAIN}/auth/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Ozzyl <contact@ozzyl.com>', // Update with your verified domain
      to: [email],
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset the password for your account.</p>
          <p>Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[email.server] Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('[email.server] Password reset email sent to:', email, 'ID:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[email.server] Unexpected error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
}

/**
 * Send Low Stock Alert to Merchant
 */
export async function sendLowStockAlert(
  apiKey: string,
  merchantEmail: string,
  storeName: string,
  products: { name: string; stock: number }[]
): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) {
    console.warn('[email.server] API Key missing');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const resend = new Resend(apiKey);
    
    // Construct product list HTML
    const productRows = products.map(p => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${p.name}</td>
        <td style="padding: 8px; color: #DC2626; font-weight: bold;">${p.stock}</td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: 'Ozzyl <contact@ozzyl.com>',
      to: [merchantEmail],
      subject: `[Alert] Low Stock Warning - ${storeName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">Low Stock Alert</h2>
          <p>The following products in <strong>${storeName}</strong> are running low on inventory:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6; text-align: left;">
                <th style="padding: 8px;">Product</th>
                <th style="padding: 8px;">Stock</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>
          
          <p>Please login to your dashboard to restock these items.</p>
        </div>
      `,
    });

    if (error) {
      console.error('[email.server] Resend API error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[email.server] Unexpected error sending low stock alert:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

interface SendCampaignEmailParams {
  email: string;
  subject: string;
  content: string;
  storeName: string;
  unsubscribeUrl: string;
  previewText?: string;
}

interface SendOrderConfirmationParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  items: { title: string; quantity: number; price: number }[];
  shippingAddress: string;
  paymentMethod: string;
}

interface SendNewOrderAlertParams {
  merchantEmail: string;
  storeName: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  itemCount: number;
}

interface SendShippingUpdateParams {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  storeName: string;
  status: 'shipped' | 'out_for_delivery' | 'delivered';
  trackingNumber?: string;
  trackingUrl?: string;
}

interface SendStaffInviteParams {
  email: string;
  inviteLink: string;
  storeName: string;
  invitedBy: string;
}

/**
 * Factory to create email service with methods
 */
export function createEmailService(apiKey: string) {
  const resend = new Resend(apiKey);
  const fromEmail = 'Ozzyl <contact@ozzyl.com>';

  return {
    async sendCampaignEmail({ email, subject, content, storeName, unsubscribeUrl, previewText }: SendCampaignEmailParams) {
      return resend.emails.send({
        from: fromEmail,
        to: [email],
        subject,
        html: `
          <div style="display: none; max-height: 0px; overflow: hidden;">
            ${previewText || ''}
          </div>
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            ${content}
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
              <p>Sent by ${storeName}</p>
              <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a>
            </div>
          </div>
        `,
      });
    },

    async sendStaffInvite({ email, inviteLink, storeName, invitedBy }: SendStaffInviteParams) {
      return resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `You've been invited to join ${storeName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Join the team at ${storeName}</h2>
            <p><strong>${invitedBy}</strong> has invited you to join their store staff.</p>
            <p>Click the button below to accept the invitation and set up your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Accept Invitation
              </a>
            </div>
            <p>Or copy this link:</p>
            <p><a href="${inviteLink}">${inviteLink}</a></p>
            <p style="color: #666; font-size: 12px;">This invitation will expire in 24 hours.</p>
          </div>
        `,
      });
    },

    async sendOrderConfirmation({ orderNumber, customerName, customerEmail, total, currency, items, shippingAddress, paymentMethod, storeLogo, primaryColor, storeName }: SendOrderConfirmationParams & { storeLogo?: string, primaryColor?: string, storeName: string }) {
      const html = getOrderConfirmationHtml({
        customerName,
        orderNumber,
        paymentMethod,
        items,
        currency,
        total,
        shippingAddress,
        storeName,
        storeLogo,
        primaryColor,
      });

      return resend.emails.send({
        from: fromEmail,
        to: [customerEmail],
        subject: `Order Confirmation #${orderNumber} - ${storeName}`,
        html,
      });
    },

    async sendNewOrderAlert({ merchantEmail, storeName, orderNumber, customerName, total, currency, itemCount }: SendNewOrderAlertParams) {
       return resend.emails.send({
        from: fromEmail,
        to: [merchantEmail],
        subject: `[New Order] #${orderNumber} - ${currency} ${total}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563EB;">New Order Received via ${storeName}</h2>
            <p>You have received a new order from <strong>${customerName}</strong>.</p>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dbeafe;">
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${currency} ${total}</p>
              <p style="margin: 5px 0 0;">Order #${orderNumber} • ${itemCount} items</p>
            </div>

            <p>
              <a href="https://ozzyl.com/admin/orders/${orderNumber}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Order
              </a>
            </p>
          </div>
        `,
      });
    },

    async sendLowStockAlert({ merchantEmail, storeName, products }: { merchantEmail: string; storeName: string; products: { name: string; stock: number }[] }) {
      return sendLowStockAlert(apiKey, merchantEmail, storeName, products);
    },

    async sendFirstSaleCelebration({ merchantEmail, merchantName, storeName, orderNumber, amount }: { merchantEmail: string, merchantName: string, storeName: string, orderNumber: string, amount: string }) {
      const html = getFirstSaleCelebrationHtml({
        merchantName,
        storeName,
        orderNumber, // e.g. "1001"
        amount, // e.g. "৳1,250"
      });

      return resend.emails.send({
        from: fromEmail,
        to: [merchantEmail],
        subject: `🎉 Your First Sale! You're in Business!`,
        html,
      });
    },

    async sendShippingUpdate({ customerEmail, customerName, orderNumber, storeName, status, trackingNumber, trackingUrl }: SendShippingUpdateParams) {
      const subject = status === 'delivered' ? `Order Delivered! #${orderNumber}` : `Shipping Update for Order #${orderNumber}`;
      const html = getShippingUpdateHtml({
        status,
        customerName,
        orderNumber,
        storeName,
        trackingNumber,
        trackingUrl,
      });

      return resend.emails.send({
        from: fromEmail,
        to: [customerEmail],
        subject: `${subject} - ${storeName}`,
        html,
      });
    },

    async sendSubscriptionApprovalEmail({ email, storeName, planName, startDate, endDate }: { email: string; storeName: string; planName: string; startDate: Date; endDate: Date }) {
      const formatDate = (date: Date) => date.toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' });
      
      return resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `🎉 Subscription Approved - ${storeName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">Subscription Approved! 🎉</h1>
            </div>
            
            <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #374151;">Great news! Your subscription for <strong>${storeName}</strong> has been approved.</p>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                <p style="margin: 0; font-size: 14px; color: #166534;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #166534;"><strong>Start Date:</strong> ${formatDate(startDate)}</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #166534;"><strong>End Date:</strong> ${formatDate(endDate)}</p>
              </div>
              
              <p style="color: #6b7280;">You now have full access to all ${planName} features. Start growing your business today!</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://ozzyl.com/app" style="display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Dashboard</a>
              </div>
            </div>
            
            <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
              Questions? Reply to this email or contact our support team.
            </p>
          </div>
        `,
      });
    }
  };
}

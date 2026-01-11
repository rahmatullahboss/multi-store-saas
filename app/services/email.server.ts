import { Resend } from 'resend';
import { getFirstSaleCelebrationHtml } from './email-templates.server';
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
      from: 'Multi-Store SaaS <system@digitalcare.site>', // Update with your verified domain
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
      from: 'Multi-Store SaaS <system@digitalcare.site>',
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

/**
 * Factory to create email service with methods
 */
export function createEmailService(apiKey: string) {
  const resend = new Resend(apiKey);
  const fromEmail = 'Multi-Store SaaS <system@digitalcare.site>';

  return {
    async sendCampaignEmail({ email, subject, content, storeName, unsubscribeUrl }: SendCampaignEmailParams) {
      return resend.emails.send({
        from: fromEmail,
        to: [email],
        subject,
        html: `
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

    async sendOrderConfirmation({ orderNumber, customerName, customerEmail, total, currency, items, shippingAddress, paymentMethod, storeLogo, primaryColor, storeName }: SendOrderConfirmationParams & { storeLogo?: string, primaryColor?: string, storeName: string }) {
      const itemsHtml = items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 500; color: #333;">${item.title}</div>
            <div style="color: #666; font-size: 13px;">Qty: ${item.quantity}</div>
          </td>
          <td style="padding: 12px 0; text-align: right; font-weight: 500; color: #333;">${currency} ${item.price * item.quantity}</td>
        </tr>
      `).join('');

      const themeColor = primaryColor || '#10B981'; // Default green if no brand color

      return resend.emails.send({
        from: fromEmail,
        to: [customerEmail],
        subject: `Order Confirmation #${orderNumber} - ${storeName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 0; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="text-align: center; padding: 40px 40px 30px; border-bottom: 1px solid #f3f4f6;">
                ${storeLogo ? `<img src="${storeLogo}" alt="${storeName}" style="height: 40px; margin-bottom: 20px; object-fit: contain;">` : `<h2 style="margin: 0 0 20px; color: ${themeColor}; font-size: 24px;">${storeName}</h2>`}
                <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0;">Thanks for your order!</h1>
                <p style="color: #6B7280; font-size: 16px; margin-top: 8px;">Order #${orderNumber}</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px;">
                <p style="color: #374151; font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
                <p style="color: #374151; font-size: 16px; line-height: 1.5;">We've received your order and are getting it ready! We'll notify you when it's on its way.</p>

                <!-- Order Summary -->
                <div style="margin-top: 32px;">
                  <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Order Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                    ${itemsHtml}
                    <tr>
                      <td style="padding-top: 20px; border-top: 2px solid #eee; font-weight: bold; color: #111827;">Total</td>
                      <td style="padding-top: 20px; border-top: 2px solid #eee; text-align: right; font-weight: bold; color: ${themeColor}; font-size: 18px;">${currency} ${total}</td>
                    </tr>
                  </table>
                </div>

                <!-- Details Grid -->
                <div style="margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding-bottom: 16px; vertical-align: top; width: 50%;">
                        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6B7280; margin-bottom: 4px;">Shipping Address</div>
                        <div style="color: #111827; font-size: 14px; line-height: 1.4;">${shippingAddress}</div>
                      </td>
                      <td style="padding-bottom: 16px; vertical-align: top; width: 50%;">
                        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6B7280; margin-bottom: 4px;">Payment Method</div>
                        <div style="color: #111827; font-size: 14px; line-height: 1.4;">${paymentMethod}</div>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin-top: 40px;">
                  <a href="https://${storeName.toLowerCase().replace(/\s+/g, '')}.digitalcare.site" style="display: inline-block; background-color: ${themeColor}; color: #ffffff; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">Visit Store</a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                  Sent with ❤️ by ${storeName}<br>
                  If you have any questions, reply to this email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
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
              <a href="https://digitalcare.site/admin/orders/${orderNumber}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
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
    }
  };
}

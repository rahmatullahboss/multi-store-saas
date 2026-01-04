/**
 * Stripe Payment Service
 * 
 * Server-side service for Stripe Checkout Sessions.
 * Handles creating checkout sessions and webhook verification.
 */

/**
 * Note: Stripe SDK doesn't work well in Cloudflare Workers Edge runtime.
 * We're using fetch API directly to the Stripe REST API instead.
 */

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  price: number; // In smallest currency unit (cents/paisa)
  imageUrl?: string;
}

interface CreateCheckoutOptions {
  orderId: number;
  orderNumber: string;
  lineItems: LineItem[];
  currency: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSession {
  id: string;
  url: string;
  payment_intent?: string;
  payment_status: string;
}

export class StripeService {
  private secretKey: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(config: StripeConfig) {
    this.secretKey = config.secretKey;
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create a Stripe Checkout Session
   * Returns the checkout URL to redirect the user to
   */
  async createCheckoutSession(options: CreateCheckoutOptions): Promise<CheckoutSession> {
    const lineItems = options.lineItems.map((item, index) => ({
      [`line_items[${index}][price_data][currency]`]: options.currency.toLowerCase(),
      [`line_items[${index}][price_data][unit_amount]`]: String(Math.round(item.price)),
      [`line_items[${index}][price_data][product_data][name]`]: item.name,
      [`line_items[${index}][price_data][product_data][description]`]: item.description || '',
      ...(item.imageUrl && {
        [`line_items[${index}][price_data][product_data][images][0]`]: item.imageUrl,
      }),
      [`line_items[${index}][quantity]`]: String(item.quantity),
    }));

    const body = new URLSearchParams({
      mode: 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      [`metadata[order_id]`]: String(options.orderId),
      [`metadata[order_number]`]: options.orderNumber,
      ...(options.customerEmail && { customer_email: options.customerEmail }),
    });

    // Add line items to body
    lineItems.forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });
    });

    const response = await fetch(`${this.baseUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'Failed to create checkout session');
    }

    const session = await response.json() as CheckoutSession;
    return session;
  }

  /**
   * Retrieve a checkout session by ID
   */
  async retrieveSession(sessionId: string): Promise<CheckoutSession> {
    const response = await fetch(
      `${this.baseUrl}/checkout/sessions/${sessionId}?expand[]=payment_intent`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to retrieve checkout session');
    }

    return response.json() as Promise<CheckoutSession>;
  }

  /**
   * Verify webhook signature using crypto
   * (Simplified version for Cloudflare Workers)
   */
  async verifyWebhookSignature(
    payload: string,
    signature: string
  ): Promise<boolean> {
    try {
      const signatureParts = signature.split(',');
      const timestampPart = signatureParts.find(p => p.startsWith('t='));
      const signaturePart = signatureParts.find(p => p.startsWith('v1='));
      
      if (!timestampPart || !signaturePart) {
        return false;
      }

      const timestamp = timestampPart.split('=')[1];
      const expectedSignature = signaturePart.split('=')[1];

      // Check if timestamp is within 5 minutes
      const timestampSeconds = parseInt(timestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestampSeconds) > 300) {
        return false;
      }

      // Compute expected signature
      const signedPayload = `${timestamp}.${payload}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(signedPayload)
      );
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return computedSignature === expectedSignature;
    } catch {
      return false;
    }
  }
}

/**
 * Create Stripe service instance from environment
 */
export function createStripeService(env: Record<string, string>): StripeService {
  const secretKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET || '';

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  return new StripeService({
    secretKey,
    webhookSecret,
  });
}

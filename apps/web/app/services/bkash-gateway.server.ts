/**
 * bKash Tokenized Checkout Gateway Service
 *
 * Implements the bKash Tokenized Checkout API v1.2.0-beta:
 * 1. Grant Token  → get access_token + id_token
 * 2. Create Payment → get paymentID + bkashURL (redirect customer here)
 * 3. Execute Payment → verify after callback (webhook-first)
 *
 * Docs: https://developer.bka.sh/docs/tokenized-checkout-process
 *
 * Flow:
 *   Checkout → createBkashPayment() → redirect to bkashURL
 *   Customer pays → bKash redirects to callbackURL?paymentID=...&status=success
 *   Callback route → executeBkashPayment() → mark order as paid
 */

const BKASH_SANDBOX_BASE = 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
const BKASH_LIVE_BASE = 'https://tokenized.pay.bka.sh/v1.2.0-beta';

export interface BkashCredentials {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  isLive: boolean;
}

export interface BkashTokenResponse {
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
}

export interface BkashCreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  statusCode: string;
  statusMessage: string;
  transactionStatus: string;
}

export interface BkashExecutePaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  statusCode: string;
  statusMessage: string;
}

export class BkashGatewayService {
  private baseUrl: string;
  private credentials: BkashCredentials;

  constructor(credentials: BkashCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.isLive ? BKASH_LIVE_BASE : BKASH_SANDBOX_BASE;
  }

  /**
   * Step 1: Grant Token
   * POST /checkout/token/grant
   * Returns id_token used as Authorization header in subsequent requests.
   */
  async grantToken(): Promise<{ idToken: string; appKey: string }> {
    const response = await fetch(`${this.baseUrl}/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: this.credentials.username,
        password: this.credentials.password,
      },
      body: JSON.stringify({
        app_key: this.credentials.appKey,
        app_secret: this.credentials.appSecret,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`bKash token grant failed: ${response.status} ${err}`);
    }

    const data = (await response.json()) as BkashTokenResponse;
    if (!data.id_token) {
      throw new Error('bKash token grant: no id_token in response');
    }

    return { idToken: data.id_token, appKey: this.credentials.appKey };
  }

  /**
   * Step 2: Create Payment
   * POST /tokenized/checkout/create
   * Returns paymentID + bkashURL to redirect the customer.
   */
  async createPayment(params: {
    amount: string;
    currency: string;
    merchantInvoiceNumber: string;
    callbackURL: string;
    payerReference?: string;
  }): Promise<BkashCreatePaymentResponse> {
    const { idToken, appKey } = await this.grantToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': appKey,
      },
      body: JSON.stringify({
        mode: '0011', // Checkout without agreement
        payerReference: params.payerReference || params.merchantInvoiceNumber,
        callbackURL: params.callbackURL,
        amount: params.amount,
        currency: params.currency || 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: params.merchantInvoiceNumber,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`bKash create payment failed: ${response.status} ${err}`);
    }

    const data = (await response.json()) as BkashCreatePaymentResponse;
    if (data.statusCode !== '0000') {
      throw new Error(`bKash create payment error: ${data.statusCode} - ${data.statusMessage}`);
    }

    return data;
  }

  /**
   * Step 3: Execute Payment (called after customer completes payment)
   * POST /tokenized/checkout/execute
   * Call this in the callback route after bKash redirects back.
   */
  async executePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
    const { idToken, appKey } = await this.grantToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`bKash execute payment failed: ${response.status} ${err}`);
    }

    const data = (await response.json()) as BkashExecutePaymentResponse;
    return data;
  }

  /**
   * Query payment status (for verification / retry)
   * POST /tokenized/checkout/payment/status
   */
  async queryPayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
    const { idToken, appKey } = await this.grantToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`bKash query payment failed: ${response.status} ${err}`);
    }

    return (await response.json()) as BkashExecutePaymentResponse;
  }
}

/**
 * Factory: create a BkashGatewayService from store gateway config
 */
export function createBkashGatewayService(credentials: BkashCredentials): BkashGatewayService {
  return new BkashGatewayService(credentials);
}

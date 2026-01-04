/**
 * bKash Payment Service
 * 
 * Implements bKash Tokenized Checkout API for payment processing.
 * Docs: https://developer.bka.sh/docs
 * 
 * Flow:
 * 1. Grant Token - Get access token using app credentials
 * 2. Create Payment - Initialize payment with amount
 * 3. Redirect user to bKash payment page
 * 4. Execute Payment - Complete payment after user confirms
 */

// Types
interface BkashConfig {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
}

interface TokenResponse {
  id_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string;
}

interface CreatePaymentRequest {
  mode?: string;
  payerReference: string;
  callbackURL: string;
  amount: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber: string;
}

interface CreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
  statusCode?: string;
  statusMessage?: string;
}

interface ExecutePaymentRequest {
  paymentID: string;
}

interface ExecutePaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  paymentExecuteTime: string;
  merchantInvoiceNumber: string;
  payerReference: string;
  customerMsisdn: string;
  payerType: string;
  statusCode?: string;
  statusMessage?: string;
}

// ============================================================================
// BKASH SERVICE CLASS
// ============================================================================
export class BkashService {
  private config: BkashConfig;
  private idToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: BkashConfig) {
    this.config = config;
  }

  // Get sandbox config from env
  static fromEnv(env: {
    BKASH_BASE_URL?: string;
    BKASH_APP_KEY?: string;
    BKASH_APP_SECRET?: string;
    BKASH_USERNAME?: string;
    BKASH_PASSWORD?: string;
  }): BkashService {
    return new BkashService({
      baseUrl: env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
      appKey: env.BKASH_APP_KEY || '',
      appSecret: env.BKASH_APP_SECRET || '',
      username: env.BKASH_USERNAME || '',
      password: env.BKASH_PASSWORD || '',
    });
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================
  private async grantToken(): Promise<TokenResponse> {
    const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': this.config.username,
        'password': this.config.password,
      },
      body: JSON.stringify({
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`bKash token grant failed: ${error}`);
    }

    const data = await response.json() as TokenResponse;
    
    this.idToken = data.id_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + (parseInt(data.expires_in) * 1000) - 60000; // 1 min buffer
    
    return data;
  }

  private async refreshIdToken(): Promise<void> {
    if (!this.refreshToken) {
      await this.grantToken();
      return;
    }

    const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': this.config.username,
        'password': this.config.password,
      },
      body: JSON.stringify({
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      // Refresh failed, get new token
      await this.grantToken();
      return;
    }

    const data = await response.json() as TokenResponse;
    this.idToken = data.id_token;
    this.tokenExpiry = Date.now() + (parseInt(data.expires_in) * 1000) - 60000;
  }

  private async getValidToken(): Promise<string> {
    if (!this.idToken || Date.now() >= this.tokenExpiry) {
      if (this.refreshToken) {
        await this.refreshIdToken();
      } else {
        await this.grantToken();
      }
    }
    return this.idToken!;
  }

  // ============================================================================
  // PAYMENT APIS
  // ============================================================================
  
  /**
   * Create a payment request
   * Returns bkashURL to redirect user for payment
   */
  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const token = await this.getValidToken();

    const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token,
        'X-App-Key': this.config.appKey,
      },
      body: JSON.stringify({
        mode: request.mode || '0011', // Checkout URL mode
        payerReference: request.payerReference,
        callbackURL: request.callbackURL,
        amount: request.amount,
        currency: request.currency || 'BDT',
        intent: request.intent || 'sale',
        merchantInvoiceNumber: request.merchantInvoiceNumber,
      }),
    });

    const data = await response.json() as CreatePaymentResponse;
    
    if (data.statusCode && data.statusCode !== '0000') {
      throw new Error(`bKash create payment failed: ${data.statusMessage || data.statusCode}`);
    }

    return data;
  }

  /**
   * Execute/finalize a payment after user confirms
   */
  async executePayment(paymentID: string): Promise<ExecutePaymentResponse> {
    const token = await this.getValidToken();

    const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token,
        'X-App-Key': this.config.appKey,
      },
      body: JSON.stringify({
        paymentID,
      }),
    });

    const data = await response.json() as ExecutePaymentResponse;
    
    if (data.statusCode && data.statusCode !== '0000') {
      throw new Error(`bKash execute payment failed: ${data.statusMessage || data.statusCode}`);
    }

    return data;
  }

  /**
   * Query payment status
   */
  async queryPayment(paymentID: string): Promise<ExecutePaymentResponse> {
    const token = await this.getValidToken();

    const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token,
        'X-App-Key': this.config.appKey,
      },
      body: JSON.stringify({
        paymentID,
      }),
    });

    return await response.json() as ExecutePaymentResponse;
  }

  /**
   * Refund a payment (full or partial)
   */
  async refundPayment(
    paymentID: string, 
    trxID: string, 
    amount: string, 
    sku: string, 
    reason: string
  ): Promise<{ refundTrxID: string; transactionStatus: string }> {
    const token = await this.getValidToken();

    const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token,
        'X-App-Key': this.config.appKey,
      },
      body: JSON.stringify({
        paymentID,
        trxID,
        amount,
        sku,
        reason,
      }),
    });

    return await response.json();
  }
}

// Export types for use in API routes
export type { 
  BkashConfig, 
  CreatePaymentRequest, 
  CreatePaymentResponse, 
  ExecutePaymentResponse 
};

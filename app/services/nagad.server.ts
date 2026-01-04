/**
 * Nagad Payment Service
 * 
 * Implements Nagad Online Payment Gateway API
 * Docs: Nagad Online Payment API Integration Guide v3.3
 * 
 * Flow:
 * 1. Initialize - Get payment reference key
 * 2. Complete Order - Redirect user to Nagad payment page
 * 3. Verify Payment - Confirm payment status on callback
 * 
 * Note: Uses global crypto object (Web Crypto API) for Cloudflare Workers compatibility
 */

// Types
interface NagadConfig {
  baseUrl: string;
  merchantId: string;
  merchantNumber: string;
  publicKey: string;
  privateKey: string;
}

interface InitializeResponse {
  sensitiveData: string;
  signature: string;
  paymentReferenceId: string;
  challenge: string;
}

interface CompleteOrderRequest {
  paymentReferenceId: string;
  challenge: string;
  orderId: string;
  amount: string;
  productDetails: string;
  ip: string;
}

interface CompleteOrderResponse {
  callBackUrl: string;
  status: string;
}

interface VerifyPaymentResponse {
  merchantId: string;
  orderId: string;
  paymentRefId: string;
  amount: string;
  clientMobileNo: string;
  merchantMobileNo: string;
  orderDateTime: string;
  issuerPaymentDateTime: string;
  issuerPaymentRefNo: string;
  additionalMerchantInfo: string;
  status: string;
  statusCode: string;
}

// ============================================================================
// NAGAD SERVICE CLASS
// ============================================================================
export class NagadService {
  private config: NagadConfig;

  constructor(config: NagadConfig) {
    this.config = config;
  }

  // Get config from env
  static fromEnv(env: {
    NAGAD_BASE_URL?: string;
    NAGAD_MERCHANT_ID?: string;
    NAGAD_MERCHANT_NUMBER?: string;
    NAGAD_PUBLIC_KEY?: string;
    NAGAD_PRIVATE_KEY?: string;
  }): NagadService {
    return new NagadService({
      baseUrl: env.NAGAD_BASE_URL || 'https://sandbox-ssl.nagad.com.bd/api/dfs/check-out',
      merchantId: env.NAGAD_MERCHANT_ID || '',
      merchantNumber: env.NAGAD_MERCHANT_NUMBER || '',
      publicKey: env.NAGAD_PUBLIC_KEY || '',
      privateKey: env.NAGAD_PRIVATE_KEY || '',
    });
  }

  // ============================================================================
  // CRYPTO HELPERS (Using Web Crypto API - global crypto object)
  // ============================================================================
  
  private async encryptWithPublicKey(data: string): Promise<string> {
    // Convert PEM to CryptoKey and encrypt
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = this.config.publicKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\n/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const publicKey = await crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );

    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoder.encode(data)
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  private async signWithPrivateKey(data: string): Promise<string> {
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = this.config.privateKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\n/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      encoder.encode(data)
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  private generateDatetime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // ============================================================================
  // PAYMENT APIS
  // ============================================================================

  /**
   * Step 1: Initialize payment to get payment reference
   */
  async initializePayment(orderId: string): Promise<InitializeResponse> {
    const datetime = this.generateDatetime();
    
    const sensitiveData = {
      merchantId: this.config.merchantId,
      datetime,
      orderId,
      challenge: crypto.randomUUID(),
    };

    const encryptedData = await this.encryptWithPublicKey(JSON.stringify(sensitiveData));
    const signature = await this.signWithPrivateKey(JSON.stringify(sensitiveData));

    const response = await fetch(
      `${this.config.baseUrl}/initialize/${this.config.merchantId}/${orderId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
        },
        body: JSON.stringify({
          merchantId: this.config.merchantId,
          datetime,
          orderId,
          sensitiveData: encryptedData,
          signature,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nagad initialize failed: ${error}`);
    }

    return await response.json() as InitializeResponse;
  }

  /**
   * Step 2: Complete order and get callback URL
   */
  async completeOrder(request: CompleteOrderRequest): Promise<CompleteOrderResponse> {
    const sensitiveData = {
      merchantId: this.config.merchantId,
      orderId: request.orderId,
      currencyCode: '050', // BDT
      amount: request.amount,
      challenge: request.challenge,
    };

    const encryptedData = await this.encryptWithPublicKey(JSON.stringify(sensitiveData));
    const signature = await this.signWithPrivateKey(JSON.stringify(sensitiveData));

    const response = await fetch(
      `${this.config.baseUrl}/complete/${request.paymentReferenceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': request.ip,
          'X-KM-Client-Type': 'PC_WEB',
        },
        body: JSON.stringify({
          sensitiveData: encryptedData,
          signature,
          merchantCallbackURL: `https://your-domain.com/api/nagad/callback?orderId=${request.orderId}`,
          additionalMerchantInfo: JSON.stringify({
            productDetails: request.productDetails,
          }),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nagad complete order failed: ${error}`);
    }

    return await response.json() as CompleteOrderResponse;
  }

  /**
   * Step 3: Verify payment after callback
   */
  async verifyPayment(paymentRefId: string): Promise<VerifyPaymentResponse> {
    const response = await fetch(
      `${this.config.baseUrl}/verify/payment/${paymentRefId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nagad verify failed: ${error}`);
    }

    return await response.json() as VerifyPaymentResponse;
  }
}

// Export types
export type { 
  NagadConfig, 
  InitializeResponse, 
  CompleteOrderRequest, 
  CompleteOrderResponse, 
  VerifyPaymentResponse 
};

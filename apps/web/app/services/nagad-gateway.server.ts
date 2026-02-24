/**
 * Nagad Payment Gateway Service
 *
 * Implements Nagad Merchant API:
 * 1. Create Payment → encrypt sensitive data with RSA, get callbackURL
 * 2. Verify Payment → confirm after Nagad redirects back
 *
 * Docs: https://nagad.com.bd/developer/
 * API Version: v1
 *
 * Flow:
 *   Checkout → createNagadPayment() → redirect to nagadURL
 *   Customer pays → Nagad redirects to callbackURL?payment_ref_id=...
 *   Callback route → verifyNagadPayment() → mark order as paid
 *
 * NOTE: Nagad requires RSA encryption using merchant private key.
 * The Web Crypto API is used (available in Cloudflare Workers).
 */

const NAGAD_SANDBOX_BASE = 'https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0';
const NAGAD_LIVE_BASE = 'https://api.mynagad.com/api/dfs';

export interface NagadCredentials {
  merchantId: string;
  merchantPrivateKey: string; // PEM format RSA private key (base64 encoded without headers)
  isLive: boolean;
}

export interface NagadCreatePaymentResponse {
  callBackUrl: string;
  status: string;
  reason?: string;
}

export interface NagadVerifyPaymentResponse {
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
  cancelReason?: string;
}

/**
 * Encrypt data with RSA public key using Web Crypto API (Cloudflare Workers compatible)
 * Nagad requires merchant data encrypted before sending.
 */
async function encryptWithPrivateKey(data: string, privateKeyBase64: string): Promise<string> {
  try {
    // Nagad uses merchant private key for signing (not encryption)
    // We sign the sensitive data JSON
    const privateKeyDer = Uint8Array.from(atob(privateKeyBase64), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyDer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const encoded = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoded);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  } catch (error) {
    throw new Error(`Nagad signature failed: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}

export class NagadGatewayService {
  private baseUrl: string;
  private credentials: NagadCredentials;

  constructor(credentials: NagadCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.isLive ? NAGAD_LIVE_BASE : NAGAD_SANDBOX_BASE;
  }

  /**
   * Step 1: Create Payment
   * POST /api/dfs/check-out/initialize/{merchantId}/{orderId}
   */
  async createPayment(params: {
    orderId: string;
    amount: string;
    callbackURL: string;
    customerMobile?: string;
  }): Promise<{ callbackURL: string; paymentRefId?: string }> {
    const datetime = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14); // YYYYMMDDHHmmss

    const sensitiveData = JSON.stringify({
      merchantId: this.credentials.merchantId,
      datetime,
      orderId: params.orderId,
      challenge: crypto.randomUUID().replace(/-/g, '').slice(0, 20),
    });

    const signature = await encryptWithPrivateKey(
      sensitiveData,
      this.credentials.merchantPrivateKey
    );

    const requestBody = {
      dateTime: datetime,
      sensitiveData: btoa(sensitiveData), // base64 encode
      signature,
      merchantCallbackURL: params.callbackURL,
      additionalMerchantInfo: {
        mobileNo: params.customerMobile || '',
        intent: 'sale',
        productdetails: [
          {
            productName: 'Order ' + params.orderId,
            productType: 'goods',
            quantity: '1',
            unitprice: params.amount,
            price: params.amount,
          },
        ],
      },
      amount: params.amount,
      currencyCode: '050', // BDT
      exchangeRate: '1',
    };

    const response = await fetch(
      `${this.baseUrl}/check-out/initialize/${this.credentials.merchantId}/${params.orderId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
          'X-KM-Api-Version': 'v-0.2.0',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Nagad create payment failed: ${response.status} ${err}`);
    }

    const data = (await response.json()) as NagadCreatePaymentResponse;

    if (data.status !== 'Success' && !data.callBackUrl) {
      throw new Error(`Nagad error: ${data.reason || data.status}`);
    }

    return { callbackURL: data.callBackUrl };
  }

  /**
   * Step 2: Verify Payment
   * GET /api/dfs/verify/payment/{paymentRefId}
   */
  async verifyPayment(paymentRefId: string): Promise<NagadVerifyPaymentResponse> {
    const response = await fetch(
      `${this.baseUrl}/verify/payment/${paymentRefId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Nagad verify payment failed: ${response.status} ${err}`);
    }

    return (await response.json()) as NagadVerifyPaymentResponse;
  }
}

export function createNagadGatewayService(credentials: NagadCredentials): NagadGatewayService {
  return new NagadGatewayService(credentials);
}

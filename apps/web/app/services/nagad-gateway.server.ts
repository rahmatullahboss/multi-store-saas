/**
 * Nagad Payment Gateway Service
 * Based on official Nagad API documentation and open-source SDK:
 * https://github.com/shahriar-shojib/nagad-payment-gateway
 *
 * Flow:
 *   1. Initialize payment  → POST /api/dfs/check-out/initialize/{merchantID}/{orderId}
 *      (RSA encrypt sensitiveData, RSA sign, receive encrypted response)
 *   2. Decrypt response    → get paymentReferenceId + challenge
 *   3. Confirm payment     → POST /api/dfs/check-out/complete/{paymentReferenceId}
 *      (RSA encrypt new sensitiveData with challenge, receive callBackUrl)
 *   4. Customer redirect   → to callBackUrl (Nagad app/web)
 *   5. Nagad callback      → GET /api/nagad-callback?payment_ref_id=...&status=...
 *   6. Verify payment      → GET /api/dfs/verify/payment/{paymentRefID}
 */

export interface NagadCredentials {
  merchantId: string;
  merchantNumber: string;    // Nagad merchant wallet number
  merchantPrivateKey: string; // Base64-encoded RSA private key
  nagadPublicKey: string;     // Base64-encoded Nagad public key (for encrypt)
  isLive: boolean;
  apiVersion?: string;
}

export interface NagadCreatePaymentResult {
  callBackUrl: string;
  paymentReferenceId: string;
}

export interface NagadVerifyPaymentResult {
  status: string;             // 'Success' | 'Aborted' | 'Cancelled' etc.
  issuerPaymentRefNo?: string;
  issuerPaymentDateTime?: string;
  amount?: string;
  merchantId?: string;
  orderId?: string;
  [key: string]: unknown;
}

const SANDBOX_URL = 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0';
const LIVE_URL = 'https://api.mynagad.com';

// ── RSA helpers (Cloudflare Workers compatible using WebCrypto) ──────────────

function formatKey(key: string, type: 'PUBLIC' | 'PRIVATE'): string {
  if (/begin/i.test(key)) return key.trim();
  return `-----BEGIN ${type} KEY-----\n${key.trim()}\n-----END ${type} KEY-----`;
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-1' },
    false,
    ['encrypt']
  );
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-1' },
    false,
    ['decrypt']
  );
}

async function rsaEncrypt(data: Record<string, string>, publicKeyPem: string): Promise<string> {
  const key = await importPublicKey(formatKey(publicKeyPem, 'PUBLIC'));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, encoded);
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

async function rsaDecrypt<T>(data: string, privateKeyPem: string): Promise<T> {
  const key = await importPrivateKey(formatKey(privateKeyPem, 'PRIVATE'));
  const encrypted = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, encrypted);
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

async function rsaSign(data: Record<string, string>, privateKeyPem: string): Promise<string> {
  const pem = formatKey(privateKeyPem, 'PRIVATE');
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoded);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function sha1Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function getDhakaTimestamp(): string {
  // YYYYMMDDHHmmss in Asia/Dhaka timezone
  return new Date()
    .toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' })
    .replace(/[-: ]/g, '')
    .slice(0, 14);
}

// ── NagadGatewayService ──────────────────────────────────────────────────────

export class NagadGatewayService {
  private readonly baseUrl: string;
  private readonly creds: NagadCredentials;
  private readonly apiVersion: string;

  constructor(credentials: NagadCredentials) {
    this.creds = credentials;
    this.baseUrl = credentials.isLive ? LIVE_URL : SANDBOX_URL;
    this.apiVersion = credentials.apiVersion || 'v-0.2.0';
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-KM-Api-Version': this.apiVersion,
    };
  }

  /**
   * Step 1 + 2 + 3: Full payment creation flow.
   * Returns callBackUrl to redirect the customer.
   */
  async createPayment(params: {
    orderId: string;
    amount: string;
    clientIp: string;
    productDetails?: Record<string, string>;
    callbackURL: string;
  }): Promise<NagadCreatePaymentResult> {
    const { orderId, amount, clientIp, productDetails = {}, callbackURL } = params;
    const timestamp = getDhakaTimestamp();
    const challenge = await sha1Hex(orderId);

    // Step 1 — Sensitive data for initialize
    const sensitiveInit = {
      merchantId: this.creds.merchantId,
      datetime: timestamp,
      orderId,
      challenge,
    };

    const initPayload = {
      accountNumber: this.creds.merchantNumber,
      dateTime: timestamp,
      sensitiveData: await rsaEncrypt(sensitiveInit, this.creds.nagadPublicKey),
      signature: await rsaSign(sensitiveInit, this.creds.merchantPrivateKey),
    };

    const ip = clientIp === '::1' || clientIp === '127.0.0.1' ? '103.100.200.100' : clientIp;

    const initRes = await fetch(
      `${this.baseUrl}/api/dfs/check-out/initialize/${this.creds.merchantId}/${orderId}`,
      {
        method: 'POST',
        headers: { ...this.headers, 'X-KM-IP-V4': ip, 'X-KM-Client-Type': 'PC_WEB' },
        body: JSON.stringify(initPayload),
      }
    );

    if (!initRes.ok) {
      const err = await initRes.text();
      throw new Error(`Nagad initialize failed: ${initRes.status} ${err}`);
    }

    const initData = (await initRes.json()) as { sensitiveData: string; signature: string };

    // Step 2 — Decrypt response to get paymentReferenceId + new challenge
    const decrypted = await rsaDecrypt<{ paymentReferenceId: string; challenge: string }>(
      initData.sensitiveData,
      this.creds.merchantPrivateKey
    );
    const { paymentReferenceId, challenge: returnedChallenge } = decrypted;

    // Step 3 — Confirm payment with returned challenge
    const sensitiveConfirm = {
      merchantId: this.creds.merchantId,
      orderId,
      amount,
      currencyCode: '050',
      challenge: returnedChallenge,
    };

    const confirmPayload = {
      paymentRefId: paymentReferenceId,
      sensitiveData: await rsaEncrypt(sensitiveConfirm, this.creds.nagadPublicKey),
      signature: await rsaSign(sensitiveConfirm, this.creds.merchantPrivateKey),
      merchantCallbackURL: callbackURL,
      additionalMerchantInfo: productDetails,
    };

    const confirmRes = await fetch(
      `${this.baseUrl}/api/dfs/check-out/complete/${paymentReferenceId}`,
      {
        method: 'POST',
        headers: { ...this.headers, 'X-KM-IP-V4': ip, 'X-KM-Client-Type': 'PC_WEB' },
        body: JSON.stringify(confirmPayload),
      }
    );

    if (!confirmRes.ok) {
      const err = await confirmRes.text();
      throw new Error(`Nagad confirm failed: ${confirmRes.status} ${err}`);
    }

    const confirmData = (await confirmRes.json()) as { callBackUrl: string };
    return { callBackUrl: confirmData.callBackUrl, paymentReferenceId };
  }

  /**
   * Verify payment after customer returns from Nagad.
   * Call this in the callback route.
   */
  async verifyPayment(paymentRefId: string): Promise<NagadVerifyPaymentResult> {
    const res = await fetch(`${this.baseUrl}/api/dfs/verify/payment/${paymentRefId}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Nagad verify failed: ${res.status} ${err}`);
    }

    return (await res.json()) as NagadVerifyPaymentResult;
  }
}

/**
 * Factory
 */
export function createNagadGatewayService(credentials: NagadCredentials): NagadGatewayService {
  return new NagadGatewayService(credentials);
}

type SslCommerzEnv = Record<string, string | undefined>;

interface SslCommerzConfig {
  storeId: string;
  storePassword: string;
  isLive: boolean;
}

export interface SslCommerzSessionPayload {
  totalAmount: number;
  currency: string;
  tranId: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
}

export interface SslCommerzInitResponse {
  status: string;
  failedreason?: string;
  GatewayPageURL?: string;
  sessionkey?: string;
}

export interface SslCommerzValidationResponse {
  status?: string;
  APIConnect?: string;
  validated_on?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  currency?: string;
  bank_tran_id?: string;
  card_type?: string;
}

export class SslCommerzService {
  private readonly storeId: string;
  private readonly storePassword: string;
  private readonly initUrl: string;
  private readonly validationUrl: string;

  constructor(config: SslCommerzConfig) {
    this.storeId = config.storeId;
    this.storePassword = config.storePassword;

    if (config.isLive) {
      this.initUrl = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
      this.validationUrl = 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';
    } else {
      this.initUrl = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
      this.validationUrl = 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
    }
  }

  async createSession(input: SslCommerzSessionPayload): Promise<SslCommerzInitResponse> {
    const form = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: String(input.totalAmount),
      currency: input.currency || 'BDT',
      tran_id: input.tranId,
      success_url: input.successUrl,
      fail_url: input.failUrl,
      cancel_url: input.cancelUrl,
      ipn_url: input.ipnUrl,
      shipping_method: 'NO',
      product_name: input.productName,
      product_category: 'Ecommerce',
      product_profile: 'general',
      cus_name: input.customerName,
      cus_email: input.customerEmail,
      cus_add1: input.customerAddress,
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: input.customerPhone,
      ship_name: input.customerName,
      ship_add1: input.customerAddress,
      ship_city: 'Dhaka',
      ship_country: 'Bangladesh',
    });

    const response = await fetch(this.initUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    const payload = (await response.json()) as SslCommerzInitResponse;
    if (!response.ok || payload.status !== 'SUCCESS' || !payload.GatewayPageURL) {
      throw new Error(payload.failedreason || 'SSLCommerz session init failed');
    }

    return payload;
  }

  async validatePayment(valId: string): Promise<SslCommerzValidationResponse> {
    const url = new URL(this.validationUrl);
    url.searchParams.set('val_id', valId);
    url.searchParams.set('store_id', this.storeId);
    url.searchParams.set('store_passwd', this.storePassword);
    url.searchParams.set('v', '1');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('SSLCommerz validation API failed');
    }

    return (await response.json()) as SslCommerzValidationResponse;
  }
}

export function createSslCommerzService(env: SslCommerzEnv): SslCommerzService {
  const storeId = env.SSLCOMMERZ_STORE_ID;
  const storePassword = env.SSLCOMMERZ_STORE_PASSWORD;
  const isLive = env.SSLCOMMERZ_LIVE === '1' || env.SSLCOMMERZ_LIVE === 'true';

  if (!storeId || !storePassword) {
    throw new Error('SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD are required');
  }

  return new SslCommerzService({
    storeId,
    storePassword,
    isLive,
  });
}

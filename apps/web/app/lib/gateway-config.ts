/**
 * Per-store Payment Gateway Configuration
 * Hybrid model: Platform-level credentials as fallback, per-store override optional
 */

export interface SslCommerzGatewayConfig {
  enabled: boolean;
  useOwn: boolean; // false = use platform env credentials
  storeId?: string;
  storePassword?: string;
  isLive: boolean;
}

export interface BkashGatewayConfig {
  enabled: boolean;
  appKey?: string;
  appSecret?: string;
  username?: string;
  password?: string;
  isLive: boolean;
}

export interface NagadGatewayConfig {
  enabled: boolean;
  merchantId?: string;
  merchantPrivateKey?: string;
  isLive: boolean;
}

export interface StoreGatewayConfig {
  sslcommerz?: SslCommerzGatewayConfig;
  bkash?: BkashGatewayConfig;
  nagad?: NagadGatewayConfig;
}

export function parseGatewayConfig(raw: string | null | undefined): StoreGatewayConfig {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoreGatewayConfig;
  } catch {
    return {};
  }
}

export function serializeGatewayConfig(config: StoreGatewayConfig): string {
  return JSON.stringify(config);
}

/**
 * Get effective SSLCommerz credentials:
 * - If store has own credentials and useOwn=true → use store credentials
 * - Otherwise → use platform env credentials
 */
export function getEffectiveSslCommerzConfig(
  gatewayConfig: StoreGatewayConfig,
  env: Record<string, string | undefined>
): { storeId: string; storePassword: string; isLive: boolean } | null {
  const ssl = gatewayConfig.sslcommerz;

  if (ssl?.enabled && ssl?.useOwn && ssl?.storeId && ssl?.storePassword) {
    return {
      storeId: ssl.storeId,
      storePassword: ssl.storePassword,
      isLive: ssl.isLive ?? false,
    };
  }

  // Platform fallback
  const platformStoreId = env.SSLCOMMERZ_STORE_ID;
  const platformPassword = env.SSLCOMMERZ_STORE_PASSWORD;
  const platformIsLive = env.SSLCOMMERZ_LIVE === '1' || env.SSLCOMMERZ_LIVE === 'true';

  if (ssl?.enabled !== false && platformStoreId && platformPassword) {
    return {
      storeId: platformStoreId,
      storePassword: platformPassword,
      isLive: platformIsLive,
    };
  }

  return null;
}

/**
 * Get effective bKash Gateway credentials (per-store only, no platform fallback)
 */
export function getEffectiveBkashGatewayConfig(
  gatewayConfig: StoreGatewayConfig
): { appKey: string; appSecret: string; username: string; password: string; isLive: boolean } | null {
  const bkash = gatewayConfig.bkash;
  if (bkash?.enabled && bkash?.appKey && bkash?.appSecret && bkash?.username && bkash?.password) {
    return {
      appKey: bkash.appKey,
      appSecret: bkash.appSecret,
      username: bkash.username,
      password: bkash.password,
      isLive: bkash.isLive ?? false,
    };
  }
  return null;
}

/**
 * Get effective Nagad Gateway credentials (per-store only, no platform fallback)
 */
export function getEffectiveNagadGatewayConfig(
  gatewayConfig: StoreGatewayConfig
): { merchantId: string; merchantPrivateKey: string; isLive: boolean } | null {
  const nagad = gatewayConfig.nagad;
  if (nagad?.enabled && nagad?.merchantId && nagad?.merchantPrivateKey) {
    return {
      merchantId: nagad.merchantId,
      merchantPrivateKey: nagad.merchantPrivateKey,
      isLive: nagad.isLive ?? false,
    };
  }
  return null;
}

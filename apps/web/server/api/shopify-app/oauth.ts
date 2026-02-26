/**
 * server/api/shopify-app/oauth.ts — Shopify App OAuth Flow
 *
 * Handles the Shopify OAuth 2.0 install + callback flow:
 *   GET /api/shopify-app/install   — initiates OAuth (state → KV, redirect to Shopify)
 *   GET /api/shopify-app/callback  — handles callback, verifies HMAC, exchanges code for token
 *
 * Security:
 *  - State stored in KV with 10-minute TTL (CSRF protection)
 *  - HMAC verification using crypto.subtle (Web Crypto — Cloudflare Workers compatible)
 *  - Access token encrypted with AES-GCM before persisting to D1
 *  - Shop domain validated with strict regex before any processing
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { shopifyInstallations } from '@db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shopify access token API response */
interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
  expires_in?: number;
  associated_user_scope?: string;
  associated_user?: Record<string, unknown>;
}

/** Encrypted token envelope stored in D1 */
interface EncryptedToken {
  ciphertext: string; // base64
  iv: string;         // base64
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Valid Shopify myshopify.com domain regex */
export const SHOP_DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

/**
 * Allowlist of permitted OAuth redirect URIs.
 * SECURITY: validate redirectUri against this list before embedding it in the
 * OAuth authorization URL. An unvalidated redirect_uri allows an attacker to
 * redirect authorization codes to an attacker-controlled endpoint
 * (open-redirect / OAuth code hijacking).
 */
export const ALLOWED_REDIRECT_URIS: readonly string[] = [
  'https://app.ozzyl.com/api/shopify-app/callback',
  'https://multi-store-saas.rahmatullahzisan.workers.dev/api/shopify-app/callback',
];

/** KV key prefix for OAuth state */
const STATE_KV_PREFIX = 'shopify_oauth_state:';

/** State TTL: 10 minutes */
const STATE_TTL_SECONDS = 600;

/** Required Shopify OAuth scopes */
const REQUIRED_SCOPES = [
  'read_orders',
  'read_products',
  'read_customers',
  'write_script_tags',
].join(',');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validates a Shopify shop domain against the strict regex.
 * @param shop - Raw shop domain string
 * @returns true if valid myshopify.com domain
 */
export function isValidShopDomain(shop: string): boolean {
  return SHOP_DOMAIN_REGEX.test(shop);
}

/**
 * Timing-safe string comparison using crypto.subtle.
 * Prevents timing attacks on HMAC comparisons.
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  // If lengths differ, pad to same length before comparing (still constant-time)
  const maxLen = Math.max(bufA.length, bufB.length);
  const padA = new Uint8Array(maxLen);
  const padB = new Uint8Array(maxLen);
  padA.set(bufA);
  padB.set(bufB);

  // Use HMAC with a random key as a timing-safe comparison primitive
  const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigA = await crypto.subtle.sign('HMAC', key, padA);
  const sigB = await crypto.subtle.sign('HMAC', key, padB);

  const viewA = new Uint8Array(sigA);
  const viewB = new Uint8Array(sigB);

  let diff = 0;
  for (let i = 0; i < viewA.length; i++) {
    diff |= viewA[i] ^ viewB[i];
  }
  return diff === 0;
}

/**
 * Verifies Shopify HMAC signature on OAuth callback query params.
 * Excludes `hmac` param from the signed message, sorts remaining params.
 *
 * @param params    - URLSearchParams from the callback request
 * @param clientSecret - Shopify App client secret
 * @returns true if signature is valid
 */
export async function verifyShopifyHmac(
  params: URLSearchParams,
  clientSecret: string
): Promise<boolean> {
  const hmac = params.get('hmac');
  if (!hmac) return false;

  // Build sorted message from all params except hmac
  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== 'hmac') {
      // Shopify escapes % and & in values
      pairs.push(`${key}=${value}`);
    }
  });
  pairs.sort();
  const message = pairs.join('&');

  // Compute expected HMAC-SHA256
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(clientSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(message));
  const expectedHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqual(expectedHex, hmac);
}

/**
 * Encrypts a plaintext string with AES-GCM using the app's encryption key.
 * Returns base64-encoded ciphertext and IV.
 *
 * @param plaintext       - String to encrypt (e.g. Shopify access token)
 * @param encryptionKey   - 32-byte hex string (SHOPIFY_ENCRYPTION_KEY env var)
 * @returns EncryptedToken with base64 ciphertext and IV
 */
export async function encryptToken(
  plaintext: string,
  encryptionKey: string
): Promise<EncryptedToken> {
  const encoder = new TextEncoder();

  // Derive key from hex string
  const keyBytes = hexToBytes(encryptionKey);
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Generate random 12-byte IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
    key,
    encoder.encode(plaintext) as unknown as ArrayBuffer
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(cipherBuffer)),
    iv: bytesToBase64(iv),
  };
}

/**
 * Decrypts an AES-GCM encrypted token.
 *
 * @param encrypted     - Encrypted token envelope
 * @param encryptionKey - 32-byte hex string
 * @returns Decrypted plaintext string
 */
export async function decryptToken(
  encrypted: EncryptedToken,
  encryptionKey: string
): Promise<string> {
  const keyBytes = hexToBytes(encryptionKey);
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const iv = base64ToBytes(encrypted.iv);
  const cipherBytes = base64ToBytes(encrypted.ciphertext);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
    key,
    cipherBytes as unknown as ArrayBuffer
  );

  return new TextDecoder().decode(plainBuffer);
}

// ─── Encoding Utilities ───────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string length');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const oauthRouter = new Hono<{ Bindings: Env }>();

// ─── GET /install ─────────────────────────────────────────────────────────────

/**
 * Initiate Shopify OAuth install flow.
 *
 * 1. Validates the `shop` query param
 * 2. Generates a cryptographically random state nonce
 * 3. Stores state in KV with 10-minute TTL
 * 4. Redirects merchant to Shopify's OAuth authorization page
 *
 * @query shop - Shopify store domain (e.g. my-store.myshopify.com)
 */
oauthRouter.get('/install', async (c) => {
  const shop = c.req.query('shop');

  if (!shop || !isValidShopDomain(shop)) {
    return c.json(
      { success: false, error: 'invalid_shop', message: 'Valid shop domain required (*.myshopify.com)' },
      400
    );
  }

  const clientId = c.env.SHOPIFY_CLIENT_ID;
  const redirectUri = c.env.SHOPIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('[Shopify OAuth] Missing SHOPIFY_CLIENT_ID or SHOPIFY_REDIRECT_URI');
    return c.json({ success: false, error: 'server_error', message: 'App not configured' }, 500);
  }

  // SECURITY S-5: Validate redirect URI against the allowlist before embedding
  // it in the OAuth authorization URL. Even though redirectUri comes from an
  // env var, validating here provides defence-in-depth against misconfiguration
  // or env var injection attacks that could enable OAuth code hijacking.
  if (!ALLOWED_REDIRECT_URIS.includes(redirectUri)) {
    console.error(`[Shopify OAuth] Redirect URI not in allowlist: ${redirectUri}`);
    return c.json({ success: false, error: 'server_error', message: 'App not configured' }, 500);
  }

  // Generate random state nonce (32 bytes → 64 hex chars)
  const stateBytes = crypto.getRandomValues(new Uint8Array(32));
  const state = Array.from(stateBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Store state + shop in KV with TTL
  const kv = c.env.KV;
  if (!kv) {
    console.error('[Shopify OAuth] KV namespace not bound');
    return c.json({ success: false, error: 'server_error', message: 'KV not configured' }, 500);
  }
  const kvKey = `${STATE_KV_PREFIX}${state}`;
  await kv.put(kvKey, shop, { expirationTtl: STATE_TTL_SECONDS });

  // Build Shopify authorization URL
  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', REQUIRED_SCOPES);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('grant_options[]', 'per-user');

  return c.redirect(authUrl.toString(), 302);
});

// ─── GET /callback ────────────────────────────────────────────────────────────

/**
 * Handle Shopify OAuth callback.
 *
 * 1. Verifies state nonce (CSRF protection) from KV
 * 2. Verifies HMAC signature on all query params
 * 3. Exchanges authorization code for access token
 * 4. Encrypts access token with AES-GCM
 * 5. Upserts shopify_installations row in D1
 *
 * @query shop  - Shopify store domain
 * @query code  - Authorization code from Shopify
 * @query state - State nonce (must match KV stored value)
 * @query hmac  - HMAC-SHA256 signature from Shopify
 */
oauthRouter.get('/callback', async (c) => {
  const params = new URL(c.req.url).searchParams;
  const shop = params.get('shop');
  const code = params.get('code');
  const state = params.get('state');

  // ── 1. Validate shop domain ─────────────────────────────────────────────────
  if (!shop || !isValidShopDomain(shop)) {
    return c.json(
      { success: false, error: 'invalid_shop', message: 'Invalid shop domain' },
      400
    );
  }

  if (!code || !state) {
    return c.json(
      { success: false, error: 'missing_params', message: 'code and state are required' },
      400
    );
  }

  // ── 2. Verify state nonce (CSRF protection) ─────────────────────────────────
  const callbackKv = c.env.KV;
  if (!callbackKv) {
    console.error('[Shopify OAuth] KV namespace not bound');
    return c.json({ success: false, error: 'server_error', message: 'KV not configured' }, 500);
  }
  const kvKey = `${STATE_KV_PREFIX}${state}`;
  const storedShop = await callbackKv.get(kvKey);

  if (!storedShop) {
    return c.json(
      { success: false, error: 'invalid_state', message: 'State expired or invalid (CSRF check failed)' },
      400
    );
  }

  if (!(await timingSafeEqual(storedShop, shop))) {
    return c.json(
      { success: false, error: 'state_mismatch', message: 'State shop mismatch' },
      400
    );
  }

  // Delete state from KV immediately (one-time use)
  await callbackKv.delete(kvKey);

  // ── 3. Verify HMAC signature ────────────────────────────────────────────────
  const clientSecret = c.env.SHOPIFY_CLIENT_SECRET;
  if (!clientSecret) {
    console.error('[Shopify OAuth] Missing SHOPIFY_CLIENT_SECRET');
    return c.json({ success: false, error: 'server_error', message: 'App not configured' }, 500);
  }

  const hmacValid = await verifyShopifyHmac(params, clientSecret);
  if (!hmacValid) {
    return c.json(
      { success: false, error: 'invalid_hmac', message: 'HMAC verification failed' },
      401
    );
  }

  // ── 4. Exchange code for access token ───────────────────────────────────────
  let tokenData: ShopifyTokenResponse;
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: c.env.SHOPIFY_CLIENT_ID,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error(`[Shopify OAuth] Token exchange failed: ${tokenRes.status}`, body);
      return c.json(
        { success: false, error: 'token_exchange_failed', message: 'Failed to exchange authorization code' },
        502
      );
    }

    tokenData = (await tokenRes.json()) as ShopifyTokenResponse;
  } catch (err) {
    console.error('[Shopify OAuth] Token exchange error:', err);
    return c.json(
      { success: false, error: 'token_exchange_error', message: 'Network error during token exchange' },
      502
    );
  }

  // ── 5. Encrypt access token ─────────────────────────────────────────────────
  const encryptionKey = c.env.SHOPIFY_ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.error('[Shopify OAuth] Missing SHOPIFY_ENCRYPTION_KEY');
    return c.json({ success: false, error: 'server_error', message: 'App not configured' }, 500);
  }

  let encrypted: EncryptedToken;
  try {
    encrypted = await encryptToken(tokenData.access_token, encryptionKey);
  } catch (err) {
    console.error('[Shopify OAuth] Token encryption error:', err);
    return c.json(
      { success: false, error: 'encryption_error', message: 'Failed to secure access token' },
      500
    );
  }

  // ── 6. Upsert shopify_installations in D1 ──────────────────────────────────
  const db = drizzle(c.env.DB);
  const now = new Date();

  try {
    const existing = await db
      .select({ id: shopifyInstallations.id })
      .from(shopifyInstallations)
      .where(eq(shopifyInstallations.shopDomain, shop))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(shopifyInstallations)
        .set({
          accessTokenEncrypted: encrypted.ciphertext,
          accessTokenIv: encrypted.iv,
          scopes: tokenData.scope,
          installedAt: now,
          uninstalledAt: null,
          webhooksRegistered: false,
        })
        .where(eq(shopifyInstallations.shopDomain, shop));
    } else {
      await db.insert(shopifyInstallations).values({
        shopDomain: shop,
        accessTokenEncrypted: encrypted.ciphertext,
        accessTokenIv: encrypted.iv,
        scopes: tokenData.scope,
        installedAt: now,
        webhooksRegistered: false,
      });
    }
  } catch (err) {
    console.error('[Shopify OAuth] D1 upsert error:', err);
    return c.json(
      { success: false, error: 'database_error', message: 'Failed to save installation' },
      500
    );
  }

  // ── 7. Redirect to app embedded in Shopify Admin ───────────────────────────
  const appHandle = c.env.SHOPIFY_APP_HANDLE ?? 'ozzyl';
  const redirectUrl = `https://${shop}/admin/apps/${appHandle}`;

  console.log(JSON.stringify({
    level: 'info',
    msg: 'shopify_app_installed',
    shop,
    scopes: tokenData.scope,
    ts: now.toISOString(),
  }));

  return c.redirect(redirectUrl, 302);
});

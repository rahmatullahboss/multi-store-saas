/**
 * server/api/shopify-app/bridge.ts — Shopify App Bridge Session Token Verification
 *
 * Shopify App Bridge uses session tokens (JWTs) to authenticate embedded app requests.
 * These tokens are signed with the app's client secret using HMAC-SHA256.
 *
 * Endpoints:
 *   GET /api/shopify-app/session — verify session token, return store context
 *
 * References:
 *   https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { shopifyInstallations } from '@db/schema';
import { isValidShopDomain } from './oauth';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shopify App Bridge session token JWT payload */
interface ShopifySessionPayload {
  /** Issuer: https://{shop}/admin */
  iss: string;
  /** Destination: https://{shop}/admin */
  dest: string;
  /** Audience: Shopify app client ID */
  aud: string;
  /** Subject: myshopify.com domain of the shop */
  sub: string;
  /** Expiry (Unix timestamp) */
  exp: number;
  /** Not before (Unix timestamp) */
  nbf: number;
  /** Issued at (Unix timestamp) */
  iat: number;
  /** Unique JWT ID */
  jti: string;
  /** Session ID */
  sid: string;
}

/** Verified session result */
export interface VerifiedSession {
  shopDomain: string;
  installationId: number;
  storeId: number | null;
  scopes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verifies a Shopify App Bridge session token (JWT).
 *
 * The token is a standard JWT signed with HMAC-SHA256 using the app's client secret.
 * We manually verify without a JWT library to remain dependency-free on Cloudflare Workers.
 *
 * @param token        - Raw JWT from Authorization: Bearer header
 * @param clientSecret - Shopify App client secret (used as HMAC key)
 * @param clientId     - Shopify App client ID (used to verify `aud` claim)
 * @returns Parsed payload if valid, null if invalid
 */
export async function verifySessionToken(
  token: string,
  clientSecret: string,
  clientId: string
): Promise<ShopifySessionPayload | null> {
  // ── 1. Split JWT into parts ─────────────────────────────────────────────────
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  // ── 2. Verify HMAC-SHA256 signature ────────────────────────────────────────
  const encoder = new TextEncoder();
  const signingInput = `${headerB64}.${payloadB64}`;

  let keyMaterial: CryptoKey;
  try {
    keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(clientSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  } catch {
    return null;
  }

  const expectedSig = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(signingInput));
  const expectedB64 = bytesToBase64Url(new Uint8Array(expectedSig));

  // Timing-safe comparison
  const sigA = encoder.encode(expectedB64);
  const sigB = encoder.encode(signatureB64);
  if (sigA.length !== sigB.length) return null;

  let diff = 0;
  for (let i = 0; i < sigA.length; i++) diff |= sigA[i] ^ sigB[i];
  if (diff !== 0) return null;

  // ── 3. Decode and parse payload ─────────────────────────────────────────────
  let payload: ShopifySessionPayload;
  try {
    const decoded = atob(base64UrlToBase64(payloadB64));
    payload = JSON.parse(decoded) as ShopifySessionPayload;
  } catch {
    return null;
  }

  // ── 4. Validate claims ──────────────────────────────────────────────────────
  const now = Math.floor(Date.now() / 1000);

  // Check expiry
  if (payload.exp < now) return null;

  // Check not-before
  if (payload.nbf > now + 10) return null; // 10s clock skew tolerance

  // Check audience matches our client ID
  if (payload.aud !== clientId) return null;

  // Check issuer and dest point to same myshopify.com domain
  try {
    const issHost = new URL(payload.iss).hostname;
    const destHost = new URL(payload.dest).hostname;
    if (issHost !== destHost) return null;
    if (!isValidShopDomain(issHost)) return null;
  } catch {
    return null;
  }

  return payload;
}

// ─── Encoding Utilities ───────────────────────────────────────────────────────

function base64UrlToBase64(b64url: string): string {
  return b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    b64url.length + ((4 - (b64url.length % 4)) % 4),
    '='
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const bridgeRouter = new Hono<{ Bindings: Env }>();

// ─── GET /session ─────────────────────────────────────────────────────────────

/**
 * Verify an App Bridge session token and return the store context.
 *
 * Used by the embedded app's frontend to authenticate API calls.
 *
 * @header Authorization - Bearer <session_token>
 * @returns { success, shopDomain, storeId, scopes }
 */
bridgeRouter.get('/session', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: 'missing_token', message: 'Authorization: Bearer <session_token> required' },
      401
    );
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return c.json(
      { success: false, error: 'empty_token', message: 'Session token is empty' },
      401
    );
  }

  const clientSecret = c.env.SHOPIFY_CLIENT_SECRET;
  const clientId = c.env.SHOPIFY_CLIENT_ID;

  if (!clientSecret || !clientId) {
    console.error('[Shopify Bridge] Missing SHOPIFY_CLIENT_SECRET or SHOPIFY_CLIENT_ID');
    return c.json({ success: false, error: 'server_error', message: 'App not configured' }, 500);
  }

  // ── Verify JWT ──────────────────────────────────────────────────────────────
  const payload = await verifySessionToken(token, clientSecret, clientId);
  if (!payload) {
    return c.json(
      { success: false, error: 'invalid_token', message: 'Session token is invalid or expired' },
      401
    );
  }

  // Extract shop domain from issuer URL
  const shopDomain = new URL(payload.iss).hostname;

  // ── Lookup installation in D1 ───────────────────────────────────────────────
  const db = drizzle(c.env.DB);
  const rows = await db
    .select({
      id: shopifyInstallations.id,
      storeId: shopifyInstallations.storeId,
      scopes: shopifyInstallations.scopes,
      uninstalledAt: shopifyInstallations.uninstalledAt,
    })
    .from(shopifyInstallations)
    .where(eq(shopifyInstallations.shopDomain, shopDomain))
    .limit(1);

  if (rows.length === 0) {
    return c.json(
      { success: false, error: 'not_installed', message: 'App not installed for this shop' },
      404
    );
  }

  const installation = rows[0];

  if (installation.uninstalledAt !== null) {
    return c.json(
      { success: false, error: 'app_uninstalled', message: 'App has been uninstalled' },
      403
    );
  }

  return c.json({
    success: true,
    data: {
      shopDomain,
      installationId: installation.id,
      storeId: installation.storeId,
      scopes: installation.scopes,
      sessionId: payload.sid,
    },
  });
});

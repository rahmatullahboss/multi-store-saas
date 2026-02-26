/**
 * tests/shopify-app/oauth.test.ts
 * Unit tests for Shopify App OAuth helpers
 *
 * Tests:
 *  - isValidShopDomain: valid/invalid domain formats
 *  - timingSafeEqual: equality, inequality
 *  - verifyShopifyHmac: valid signature, tampered params, missing hmac
 *  - encryptToken / decryptToken: round-trip AES-GCM encryption
 *  - GET /install: redirect, state stored in KV, invalid shop rejection
 *  - GET /callback: full happy path, HMAC failure, state mismatch, expired state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Drizzle mock (must be hoisted before imports) ────────────────────────────
vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]), // no existing installation
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
      }),
    }),
  })),
}));

import {
  isValidShopDomain,
  timingSafeEqual,
  verifyShopifyHmac,
  encryptToken,
  decryptToken,
  oauthRouter,
} from '@server/api/shopify-app/oauth';

// ─── isValidShopDomain ─────────────────────────────────────────────────────────

describe('isValidShopDomain', () => {
  it('accepts valid myshopify.com domains', () => {
    expect(isValidShopDomain('my-store.myshopify.com')).toBe(true);
    expect(isValidShopDomain('test.myshopify.com')).toBe(true);
    expect(isValidShopDomain('abc123.myshopify.com')).toBe(true);
    expect(isValidShopDomain('my-store-123.myshopify.com')).toBe(true);
  });

  it('rejects domains without myshopify.com', () => {
    expect(isValidShopDomain('mystore.shopify.com')).toBe(false);
    expect(isValidShopDomain('mystore.com')).toBe(false);
    expect(isValidShopDomain('evil.myshopify.com.evil.com')).toBe(false);
  });

  it('rejects empty or invalid strings', () => {
    expect(isValidShopDomain('')).toBe(false);
    expect(isValidShopDomain('not-a-domain')).toBe(false);
    expect(isValidShopDomain('-invalid.myshopify.com')).toBe(false);
  });

  it('rejects domains with path or protocol', () => {
    expect(isValidShopDomain('https://my-store.myshopify.com')).toBe(false);
    expect(isValidShopDomain('my-store.myshopify.com/admin')).toBe(false);
  });

  it('rejects subdomains of myshopify.com', () => {
    // Only one level of subdomain allowed before myshopify.com
    expect(isValidShopDomain('a.b.myshopify.com')).toBe(false);
  });
});

// ─── timingSafeEqual ──────────────────────────────────────────────────────────

describe('timingSafeEqual', () => {
  it('returns true for identical strings', async () => {
    expect(await timingSafeEqual('hello', 'hello')).toBe(true);
  });

  it('returns true for empty strings', async () => {
    expect(await timingSafeEqual('', '')).toBe(true);
  });

  it('returns false for different strings', async () => {
    expect(await timingSafeEqual('hello', 'world')).toBe(false);
  });

  it('returns false for strings of different lengths', async () => {
    expect(await timingSafeEqual('abc', 'abcd')).toBe(false);
  });

  it('is case-sensitive', async () => {
    expect(await timingSafeEqual('Hello', 'hello')).toBe(false);
  });
});

// ─── verifyShopifyHmac ────────────────────────────────────────────────────────

describe('verifyShopifyHmac', () => {
  /**
   * Helper: compute a real HMAC-SHA256 over the Shopify-style message.
   * Replicates what Shopify does: sort params (excluding hmac), join with &.
   */
  async function computeShopifyHmac(
    params: Record<string, string>,
    secret: string
  ): Promise<string> {
    const pairs = Object.entries(params)
      .filter(([k]) => k !== 'hmac')
      .map(([k, v]) => `${k}=${v}`)
      .sort();
    const message = pairs.join('&');

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  it('verifies a valid HMAC', async () => {
    const secret = 'test-shopify-secret';
    const rawParams = { shop: 'my-store.myshopify.com', code: 'abc123', state: 'nonce42', timestamp: '1700000000' };
    const hmac = await computeShopifyHmac(rawParams, secret);
    const params = new URLSearchParams({ ...rawParams, hmac });
    expect(await verifyShopifyHmac(params, secret)).toBe(true);
  });

  it('rejects tampered params', async () => {
    const secret = 'test-shopify-secret';
    const rawParams = { shop: 'my-store.myshopify.com', code: 'abc123', state: 'nonce42', timestamp: '1700000000' };
    const hmac = await computeShopifyHmac(rawParams, secret);
    // Tamper with shop
    const params = new URLSearchParams({ ...rawParams, shop: 'evil.myshopify.com', hmac });
    expect(await verifyShopifyHmac(params, secret)).toBe(false);
  });

  it('rejects missing hmac param', async () => {
    const params = new URLSearchParams({ shop: 'my-store.myshopify.com', code: 'abc123' });
    expect(await verifyShopifyHmac(params, 'secret')).toBe(false);
  });

  it('rejects wrong secret', async () => {
    const secret = 'correct-secret';
    const rawParams = { shop: 'my-store.myshopify.com', code: 'abc123' };
    const hmac = await computeShopifyHmac(rawParams, secret);
    const params = new URLSearchParams({ ...rawParams, hmac });
    expect(await verifyShopifyHmac(params, 'wrong-secret')).toBe(false);
  });

  it('handles param ordering correctly (sort before sign)', async () => {
    const secret = 'sort-test-secret';
    // Params in reverse alphabetical order — should still verify
    const rawParams = { timestamp: '1700000000', state: 'xyz', shop: 'abc.myshopify.com', code: '999' };
    const hmac = await computeShopifyHmac(rawParams, secret);
    const params = new URLSearchParams({ ...rawParams, hmac });
    expect(await verifyShopifyHmac(params, secret)).toBe(true);
  });
});

// ─── encryptToken / decryptToken ──────────────────────────────────────────────

describe('encryptToken / decryptToken', () => {
  // 32-byte hex key (64 hex chars)
  const KEY = 'a'.repeat(64);
  const PLAINTEXT = 'shpat_test_access_token_12345';

  it('encrypts and decrypts successfully (round-trip)', async () => {
    const encrypted = await encryptToken(PLAINTEXT, KEY);
    const decrypted = await decryptToken(encrypted, KEY);
    expect(decrypted).toBe(PLAINTEXT);
  });

  it('produces base64 ciphertext and IV', async () => {
    const encrypted = await encryptToken(PLAINTEXT, KEY);
    expect(encrypted.ciphertext).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(encrypted.iv).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('produces different ciphertext each time (random IV)', async () => {
    const enc1 = await encryptToken(PLAINTEXT, KEY);
    const enc2 = await encryptToken(PLAINTEXT, KEY);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
    expect(enc1.iv).not.toBe(enc2.iv);
  });

  it('fails to decrypt with wrong key', async () => {
    const encrypted = await encryptToken(PLAINTEXT, KEY);
    const wrongKey = 'b'.repeat(64);
    await expect(decryptToken(encrypted, wrongKey)).rejects.toThrow();
  });

  it('encrypts empty string', async () => {
    const encrypted = await encryptToken('', KEY);
    const decrypted = await decryptToken(encrypted, KEY);
    expect(decrypted).toBe('');
  });
});

// ─── GET /install route ───────────────────────────────────────────────────────

describe('GET /install', () => {
  function makeEnv(overrides: Record<string, string> = {}) {
    return {
      SHOPIFY_CLIENT_ID: 'test-client-id',
      SHOPIFY_REDIRECT_URI: 'https://app.ozzyl.com/api/shopify-app/callback',
      KV: {
        put: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      ...overrides,
    };
  }

  it('redirects to Shopify OAuth URL for valid shop', async () => {
    const env = makeEnv();
    const req = new Request('https://app.ozzyl.com/install?shop=my-store.myshopify.com');
    const res = await oauthRouter.fetch(req, env);

    expect(res.status).toBe(302);
    const location = res.headers.get('Location') ?? '';
    expect(location).toContain('my-store.myshopify.com/admin/oauth/authorize');
    expect(location).toContain('client_id=test-client-id');
    expect(location).toContain('redirect_uri=');
    expect(location).toContain('state=');
  });

  it('stores state in KV with 10-minute TTL', async () => {
    const env = makeEnv();
    const req = new Request('https://app.ozzyl.com/install?shop=my-store.myshopify.com');
    await oauthRouter.fetch(req, env);

    expect(env.KV.put).toHaveBeenCalledWith(
      expect.stringMatching(/^shopify_oauth_state:/),
      'my-store.myshopify.com',
      { expirationTtl: 600 }
    );
  });

  it('returns 400 for missing shop param', async () => {
    const env = makeEnv();
    const req = new Request('https://app.ozzyl.com/install');
    const res = await oauthRouter.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('invalid_shop');
  });

  it('returns 400 for invalid shop domain', async () => {
    const env = makeEnv();
    const req = new Request('https://app.ozzyl.com/install?shop=evil.example.com');
    const res = await oauthRouter.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('invalid_shop');
  });

  it('returns 500 when SHOPIFY_CLIENT_ID is missing', async () => {
    const env = makeEnv({ SHOPIFY_CLIENT_ID: '' });
    const req = new Request('https://app.ozzyl.com/install?shop=my-store.myshopify.com');
    const res = await oauthRouter.fetch(req, env);
    expect(res.status).toBe(500);
  });
});

// ─── GET /callback route ──────────────────────────────────────────────────────

describe('GET /callback', () => {
  /** Build a valid Shopify HMAC for callback params */
  async function buildCallbackHmac(
    params: Record<string, string>,
    secret: string
  ): Promise<string> {
    const pairs = Object.entries(params)
      .filter(([k]) => k !== 'hmac')
      .map(([k, v]) => `${k}=${v}`)
      .sort();
    const message = pairs.join('&');
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  it('returns 400 when state is invalid/expired', async () => {
    const env = {
      SHOPIFY_CLIENT_SECRET: 'secret123',
      SHOPIFY_CLIENT_ID: 'client-id',
      SHOPIFY_ENCRYPTION_KEY: 'a'.repeat(64),
      KV: {
        get: vi.fn().mockResolvedValue(null), // state not found
        delete: vi.fn(),
      },
      DB: {},
    };
    const params = new URLSearchParams({
      shop: 'my-store.myshopify.com',
      code: 'abc123',
      state: 'invalid-state',
      hmac: 'deadbeef',
    });
    const req = new Request(`https://app.ozzyl.com/callback?${params}`);
    const res = await oauthRouter.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('invalid_state');
  });

  it('returns 400 for invalid shop domain', async () => {
    const env = {
      SHOPIFY_CLIENT_SECRET: 'secret123',
      SHOPIFY_CLIENT_ID: 'client-id',
      SHOPIFY_ENCRYPTION_KEY: 'a'.repeat(64),
      KV: { get: vi.fn(), delete: vi.fn() },
      DB: {},
    };
    const req = new Request('https://app.ozzyl.com/callback?shop=evil.com&code=x&state=y&hmac=z');
    const res = await oauthRouter.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('invalid_shop');
  });

  it('returns 401 when HMAC verification fails', async () => {
    const secret = 'correct-secret';
    const shop = 'my-store.myshopify.com';
    const state = 'valid-state-nonce';
    const env = {
      SHOPIFY_CLIENT_SECRET: secret,
      SHOPIFY_CLIENT_ID: 'client-id',
      SHOPIFY_ENCRYPTION_KEY: 'a'.repeat(64),
      KV: {
        get: vi.fn().mockResolvedValue(shop),
        delete: vi.fn(),
      },
      DB: {},
    };
    const params = new URLSearchParams({
      shop,
      code: 'abc123',
      state,
      hmac: 'invalidhmacvalue',
    });
    const req = new Request(`https://app.ozzyl.com/callback?${params}`);
    const res = await oauthRouter.fetch(req, env);
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('invalid_hmac');
  });

  it('returns 400 when code is missing', async () => {
    const env = {
      SHOPIFY_CLIENT_SECRET: 'secret',
      SHOPIFY_CLIENT_ID: 'client-id',
      SHOPIFY_ENCRYPTION_KEY: 'a'.repeat(64),
      KV: { get: vi.fn(), delete: vi.fn() },
      DB: {},
    };
    const req = new Request('https://app.ozzyl.com/callback?shop=my-store.myshopify.com&state=abc&hmac=xyz');
    const res = await oauthRouter.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('missing_params');
  });

  it('completes full happy-path: valid state, valid HMAC, successful token exchange', async () => {
    const secret = 'shopify-secret-abc';
    const shop = 'happy-store.myshopify.com';
    const state = 'valid-csrf-state';

    const rawParams = { shop, code: 'auth-code-123', state, timestamp: '1700000000' };
    const hmac = await buildCallbackHmac(rawParams, secret);

    // Mock fetch (token exchange)
    const mockFetchResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ access_token: 'shpat_test_token', scope: 'read_orders,read_products' }),
      text: vi.fn().mockResolvedValue(''),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    const env = {
      SHOPIFY_CLIENT_SECRET: secret,
      SHOPIFY_CLIENT_ID: 'client-id',
      SHOPIFY_REDIRECT_URI: 'https://app.ozzyl.com/callback',
      SHOPIFY_ENCRYPTION_KEY: 'a'.repeat(64),
      SHOPIFY_APP_HANDLE: 'ozzyl',
      KV: {
        get: vi.fn().mockResolvedValue(shop),
        delete: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
      },
      DB: {},
    };

    const params = new URLSearchParams({ ...rawParams, hmac });
    const req = new Request(`https://app.ozzyl.com/callback?${params}`);
    const res = await oauthRouter.fetch(req, env);

    // Should redirect to Shopify Admin app page
    expect(res.status).toBe(302);
    const location = res.headers.get('Location') ?? '';
    expect(location).toContain(shop);
    expect(location).toContain('admin/apps');

    // KV state should be deleted after use
    expect(env.KV.delete).toHaveBeenCalledWith(expect.stringContaining(state));

    vi.unstubAllGlobals();
  });
});

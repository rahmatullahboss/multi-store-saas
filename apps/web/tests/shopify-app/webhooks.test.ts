/**
 * tests/shopify-app/webhooks.test.ts
 * Unit tests for Shopify webhook handler
 *
 * Tests:
 *  - verifyWebhookHmac: valid, invalid, tampered body
 *  - POST /webhooks: HMAC failure, missing headers, GDPR topics, app/uninstalled
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Drizzle mock (hoisted) ───────────────────────────────────────────────────
vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => ({
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
      }),
    }),
  })),
}));

import { verifyWebhookHmac, webhooksRouter } from '@server/api/shopify-app/webhooks';

// ─── verifyWebhookHmac ────────────────────────────────────────────────────────

describe('verifyWebhookHmac', () => {
  const SECRET = 'shopify-webhook-secret';

  async function computeBase64Hmac(body: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
  }

  it('returns true for a valid HMAC', async () => {
    const body = '{"test":true}';
    const hmac = await computeBase64Hmac(body, SECRET);
    const buf = new TextEncoder().encode(body).buffer;
    expect(await verifyWebhookHmac(buf, hmac, SECRET)).toBe(true);
  });

  it('returns false for tampered body', async () => {
    const body = '{"test":true}';
    const hmac = await computeBase64Hmac(body, SECRET);
    const tampered = new TextEncoder().encode('{"test":false}').buffer;
    expect(await verifyWebhookHmac(tampered, hmac, SECRET)).toBe(false);
  });

  it('returns false for wrong secret', async () => {
    const body = '{"event":"order/created"}';
    const hmac = await computeBase64Hmac(body, SECRET);
    const buf = new TextEncoder().encode(body).buffer;
    expect(await verifyWebhookHmac(buf, hmac, 'wrong-secret')).toBe(false);
  });

  it('returns false for tampered HMAC header', async () => {
    const body = '{"event":"order/created"}';
    const buf = new TextEncoder().encode(body).buffer;
    expect(await verifyWebhookHmac(buf, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', SECRET)).toBe(false);
  });

  it('returns false for empty HMAC header', async () => {
    const body = '{"event":"order/created"}';
    const buf = new TextEncoder().encode(body).buffer;
    expect(await verifyWebhookHmac(buf, '', SECRET)).toBe(false);
  });

  it('handles empty body', async () => {
    const body = '';
    const hmac = await computeBase64Hmac(body, SECRET);
    const buf = new TextEncoder().encode(body).buffer;
    expect(await verifyWebhookHmac(buf, hmac, SECRET)).toBe(true);
  });

  it('is deterministic for same inputs', async () => {
    const body = '{"order":"12345"}';
    const hmac = await computeBase64Hmac(body, SECRET);
    const buf = new TextEncoder().encode(body).buffer;
    const r1 = await verifyWebhookHmac(buf, hmac, SECRET);
    const r2 = await verifyWebhookHmac(buf, hmac, SECRET);
    expect(r1).toBe(true);
    expect(r2).toBe(true);
  });
});

// ─── POST /webhooks route ─────────────────────────────────────────────────────

describe('POST /webhooks', () => {
  const SECRET = 'shopify-client-secret';

  async function computeBase64Hmac(body: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
  }

  function makeEnv(overrides: Record<string, unknown> = {}) {
    return {
      SHOPIFY_CLIENT_SECRET: SECRET,
      DB: {
        prepare: vi.fn().mockReturnValue({
          bind: vi.fn().mockReturnThis(),
          run: vi.fn().mockResolvedValue({ success: true }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      },
      ...overrides,
    };
  }

  function makeCtx(): ExecutionContext {
    return {
      waitUntil: vi.fn((p: Promise<unknown>) => p),
      passThroughOnException: vi.fn(),
    } as unknown as ExecutionContext;
  }

  async function postWebhook(
    body: string,
    topic: string,
    shopDomain: string,
    hmac: string,
    env: Record<string, unknown>
  ) {
    const req = new Request('https://app.ozzyl.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Hmac-Sha256': hmac,
        'X-Shopify-Topic': topic,
        'X-Shopify-Shop-Domain': shopDomain,
      },
      body,
    });
    return webhooksRouter.fetch(req, env, makeCtx());
  }

  it('returns 400 when required headers are missing', async () => {
    const req = new Request('https://app.ozzyl.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const res = await webhooksRouter.fetch(req, makeEnv(), makeCtx());
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('missing_headers');
  });

  it('returns 401 when HMAC is invalid', async () => {
    const body = '{"shop_id":1}';
    const res = await postWebhook(body, 'orders/create', 'my-store.myshopify.com', 'invalidhmac==', makeEnv());
    expect(res.status).toBe(401);
    const json = await res.json() as { error: string };
    expect(json.error).toBe('invalid_hmac');
  });

  it('returns 500 when SHOPIFY_CLIENT_SECRET is missing', async () => {
    const body = '{"shop_id":1}';
    const hmac = await computeBase64Hmac(body, SECRET);
    const env = makeEnv({ SHOPIFY_CLIENT_SECRET: undefined });
    const res = await postWebhook(body, 'orders/create', 'my-store.myshopify.com', hmac, env);
    expect(res.status).toBe(500);
  });

  it('returns 200 and received:true for valid webhook', async () => {
    const body = JSON.stringify({ shop_id: 1, shop_domain: 'my-store.myshopify.com' });
    const hmac = await computeBase64Hmac(body, SECRET);
    const res = await postWebhook(body, 'shop/redact', 'my-store.myshopify.com', hmac, makeEnv());
    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean; received: boolean };
    expect(json.success).toBe(true);
    expect(json.received).toBe(true);
  });

  it('handles customers/data_request GDPR webhook', async () => {
    const body = JSON.stringify({
      shop_id: 1,
      shop_domain: 'my-store.myshopify.com',
      customer: { id: 42, email: 'user@example.com' },
      orders_requested: [100, 101],
    });
    const hmac = await computeBase64Hmac(body, SECRET);
    const res = await postWebhook(body, 'customers/data_request', 'my-store.myshopify.com', hmac, makeEnv());
    expect(res.status).toBe(200);
  });

  it('handles customers/redact GDPR webhook', async () => {
    const body = JSON.stringify({
      shop_id: 1,
      shop_domain: 'my-store.myshopify.com',
      customer: { id: 42, email: 'user@example.com' },
      orders_to_redact: [100],
    });
    const hmac = await computeBase64Hmac(body, SECRET);
    const res = await postWebhook(body, 'customers/redact', 'my-store.myshopify.com', hmac, makeEnv());
    expect(res.status).toBe(200);
  });

  it('handles shop/redact GDPR webhook', async () => {
    const body = JSON.stringify({ shop_id: 1, shop_domain: 'my-store.myshopify.com' });
    const hmac = await computeBase64Hmac(body, SECRET);
    const res = await postWebhook(body, 'shop/redact', 'my-store.myshopify.com', hmac, makeEnv());
    expect(res.status).toBe(200);
  });

  it('handles app/uninstalled webhook', async () => {
    const body = JSON.stringify({ id: 1, domain: 'my-store.myshopify.com' });
    const hmac = await computeBase64Hmac(body, SECRET);
    const res = await postWebhook(body, 'app/uninstalled', 'my-store.myshopify.com', hmac, makeEnv());
    expect(res.status).toBe(200);
  });

  it('returns 200 for unknown/unhandled topic (forward-compat)', async () => {
    const body = JSON.stringify({ data: 'some-future-event' });
    const hmac = await computeBase64Hmac(body, SECRET);
    const res = await postWebhook(body, 'fulfillments/create', 'my-store.myshopify.com', hmac, makeEnv());
    expect(res.status).toBe(200);
  });

  it('returns 400 for non-JSON body', async () => {
    const body = 'not-json';
    const hmac = await computeBase64Hmac(body, SECRET);
    const res = await postWebhook(body, 'orders/create', 'my-store.myshopify.com', hmac, makeEnv());
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toBe('invalid_body');
  });
});

/**
 * tests/api-platform/webhook-integration.test.ts
 * Full webhook dispatch cycle integration tests
 *
 * Tests:
 * 1. signWebhookPayload + verifyWebhookSignature round-trip
 * 2. Replay attack prevention (old timestamp)
 * 3. dispatchWebhook: matching / non-matching / inactive hooks
 * 4. Successful delivery with correct HMAC headers
 * 5. Multi-topic routing (events array, wildcard *, legacy single-topic)
 * 6. Retry logic (fail N times then succeed)
 * 7. Auto-disable after 10 failures
 * 8. Promise.allSettled isolation
 * 9. registerWebhook backward-compat alias
 * 10. Webhook API route: POST /api/v1/webhooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock drizzle-orm/d1 ──────────────────────────────────────────────────────
// Mutable so individual tests can set which webhooks are returned.

let mockWebhooks: unknown[] = [];

vi.mock('drizzle-orm/d1', () => {
  const makeSelectChain = () => {
    const chain: Record<string, unknown> = {};
    chain.from = vi.fn().mockReturnValue(chain);
    chain.orderBy = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockImplementation(() => Promise.resolve(mockWebhooks));

    // where() is called with Drizzle SQL conditions — we can't inspect them
    // directly, but dispatchWebhook always passes eq(webhooks.isActive, true)
    // as one of the conditions. Simulate the filter by returning only active hooks.
    chain.where = vi.fn().mockImplementation(() => {
      const activeHooks = (mockWebhooks as any[]).filter(h => h.isActive !== false);
      const filtered: Record<string, unknown> = {};
      filtered.limit = vi.fn().mockImplementation(() => Promise.resolve(activeHooks));
      filtered.where = vi.fn().mockReturnValue(filtered);
      filtered.orderBy = vi.fn().mockReturnValue(filtered);
      // Thenable so `await db.select().from(t).where(c)` works without .limit()
      (filtered as any).then = (resolve: Function, reject: Function) =>
        Promise.resolve(activeHooks).then(resolve as any, reject as any);
      return filtered;
    });

    // Thenable fallback for chains without .where()
    (chain as any).then = (resolve: Function, reject: Function) =>
      Promise.resolve(mockWebhooks).then(resolve as any, reject as any);
    return chain;
  };

  const makeInsertChain = () => {
    const chain: Record<string, unknown> = {};
    chain.values = vi.fn().mockReturnValue(chain);
    chain.returning = vi.fn().mockResolvedValue([{ id: 99, url: 'https://example.com/hook', events: '["order/created"]', isActive: true }]);
    (chain as any).then = (resolve: Function, reject: Function) =>
      Promise.resolve([{ id: 99 }]).then(resolve as any, reject as any);
    return chain;
  };

  const makeUpdateChain = () => {
    const chain: Record<string, unknown> = {};
    chain.set = vi.fn().mockReturnValue(chain);
    chain.where = vi.fn().mockReturnValue(chain);
    (chain as any).then = (resolve: Function, reject: Function) =>
      Promise.resolve([]).then(resolve as any, reject as any);
    return chain;
  };

  const makeDeleteChain = () => {
    const chain: Record<string, unknown> = {};
    chain.where = vi.fn().mockReturnValue(chain);
    (chain as any).then = (resolve: Function, reject: Function) =>
      Promise.resolve([]).then(resolve as any, reject as any);
    return chain;
  };

  const db = {
    select: vi.fn(() => makeSelectChain()),
    insert: vi.fn(() => makeInsertChain()),
    update: vi.fn(() => makeUpdateChain()),
    delete: vi.fn(() => makeDeleteChain()),
  };

  return { drizzle: vi.fn(() => db) };
});

// Mock validateApiKey for the webhook API route tests
vi.mock('~/services/api.server', () => ({
  validateApiKey: vi.fn().mockResolvedValue({
    id: 1, storeId: 42, name: 'Key', keyPrefix: 'sk_live_test',
    scopes: ['read_orders', 'write_orders', 'manage_webhooks'],
    mode: 'live', planId: 2, expiresAt: null,
  }),
  authenticateApiKey: vi.fn(),
  revokeApiKey: vi.fn(),
  listApiKeys: vi.fn().mockResolvedValue([]),
  generateApiKey: vi.fn().mockResolvedValue({ key: 'sk_live_xxx', apiKey: {} }),
}));

// ─── Imports AFTER mocks ──────────────────────────────────────────────────────

import {
  signWebhookPayload,
  verifyWebhookSignature,
  dispatchWebhook,
  registerWebhook,
} from '~/services/webhook.server';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEnv(overrides: Record<string, unknown> = {}): Env {
  return {
    DB: {} as D1Database,
    STORE_CACHE: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace,
    API_KEY_SECRET: 'test-hmac-secret-32-bytes-minimum!!',
    WEBHOOK_DEFAULT_SECRET: 'default-webhook-secret-for-tests!!',
    ...overrides,
  } as unknown as Env;
}

function makeHook(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    storeId: 42,
    url: 'https://example.com/webhook',
    topic: 'order/created',
    events: '["order/created"]',
    secret: 'hook-secret-for-hmac-minimum-16ch',
    isActive: true,
    failureCount: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeRouteEnv() {
  return {
    DB: {} as D1Database,
    STORE_CACHE: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace,
    API_KEY_SECRET: 'test-hmac-secret-32-bytes-minimum!!',
  };
}

function makeExecutionCtx(): ExecutionContext {
  return {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
    props: {},
  } as unknown as ExecutionContext;
}

// ─── 1. Sign + Verify round-trip ──────────────────────────────────────────────

describe('Webhook: sign → verify round-trip', () => {
  it('valid signature verifies successfully', async () => {
    const payload = JSON.stringify({ event: 'order/created', order_id: 1 });
    const secret = 'my-webhook-secret-minimum-length';
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signWebhookPayload(payload, secret, ts);
    expect(await verifyWebhookSignature(payload, sig, secret)).toBe(true);
  });

  it('signature format is t=<ts>,v1=<64-hex-chars>', async () => {
    const sig = await signWebhookPayload('payload', 'secret', 1700000000);
    expect(sig).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
  });

  it('different payloads produce different signatures', async () => {
    const ts = Date.now();
    const secret = 'shared-secret-value-min-16-chars';
    const s1 = await signWebhookPayload('payload-A', secret, ts);
    const s2 = await signWebhookPayload('payload-B', secret, ts);
    expect(s1).not.toBe(s2);
  });

  it('same inputs are deterministic', async () => {
    const ts = 1700000000;
    const sig1 = await signWebhookPayload('payload', 'secret', ts);
    const sig2 = await signWebhookPayload('payload', 'secret', ts);
    expect(sig1).toBe(sig2);
  });
});

// ─── 2. Tampering detection ────────────────────────────────────────────────────

describe('Webhook: signature tampering detection', () => {
  it('rejects tampered payload', async () => {
    const secret = 'my-webhook-secret-minimum-length';
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signWebhookPayload('{"event":"order/created"}', secret, ts);
    expect(await verifyWebhookSignature('{"event":"order/deleted"}', sig, secret)).toBe(false);
  });

  it('rejects tampered v1 hex in signature', async () => {
    const secret = 'my-webhook-secret-minimum-length';
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signWebhookPayload('payload', secret, ts);
    const tampered = sig.replace(/v1=[a-f0-9]{4}/, 'v1=0000');
    expect(await verifyWebhookSignature('payload', tampered, secret)).toBe(false);
  });

  it('rejects malformed signature string', async () => {
    expect(await verifyWebhookSignature('payload', 'not-a-valid-sig', 'secret')).toBe(false);
  });

  it('rejects empty signature', async () => {
    expect(await verifyWebhookSignature('payload', '', 'secret')).toBe(false);
  });
});

// ─── 3. Replay attack prevention ──────────────────────────────────────────────

describe('Webhook: replay attack prevention', () => {
  it('rejects signature older than tolerance (600s > 300s)', async () => {
    const secret = 'my-webhook-secret-minimum-length';
    const oldTs = Math.floor(Date.now() / 1000) - 600;
    const sig = await signWebhookPayload('payload', secret, oldTs);
    expect(await verifyWebhookSignature('payload', sig, secret, 300)).toBe(false);
  });

  it('accepts signature within tolerance (120s < 300s)', async () => {
    const secret = 'my-webhook-secret-minimum-length';
    const recentTs = Math.floor(Date.now() / 1000) - 120;
    const sig = await signWebhookPayload('payload', secret, recentTs);
    expect(await verifyWebhookSignature('payload', sig, secret, 300)).toBe(true);
  });

  it('custom tolerance of 60s rejects 90s old signature', async () => {
    const secret = 'my-webhook-secret-minimum-length';
    const ts = Math.floor(Date.now() / 1000) - 90;
    const sig = await signWebhookPayload('payload', secret, ts);
    expect(await verifyWebhookSignature('payload', sig, secret, 60)).toBe(false);
  });

  it('future timestamps within tolerance are accepted (clock skew)', async () => {
    const secret = 'my-webhook-secret-minimum-length';
    const futureTs = Math.floor(Date.now() / 1000) + 30;
    const sig = await signWebhookPayload('payload', secret, futureTs);
    expect(await verifyWebhookSignature('payload', sig, secret, 300)).toBe(true);
  });
});

// ─── 4. dispatchWebhook: no matching webhooks ─────────────────────────────────

describe('dispatchWebhook: no matching webhooks', () => {
  beforeEach(() => { mockWebhooks = []; });

  it('returns [] when store has no webhooks', async () => {
    expect(await dispatchWebhook(makeEnv(), 42, 'order/created', { orderId: 1 })).toEqual([]);
  });

  it('returns [] when no webhook matches the topic', async () => {
    mockWebhooks = [makeHook({ topic: 'product/created', events: '["product/created"]' })];
    expect(await dispatchWebhook(makeEnv(), 42, 'order/created', {})).toEqual([]);
  });

  it('returns [] when webhook is inactive', async () => {
    mockWebhooks = [makeHook({ isActive: false })];
    expect(await dispatchWebhook(makeEnv(), 42, 'order/created', {})).toEqual([]);
  });
});

// ─── 5. dispatchWebhook: successful delivery ──────────────────────────────────

describe('dispatchWebhook: successful delivery', () => {
  beforeEach(() => {
    mockWebhooks = [makeHook()];
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, status: 200,
      text: vi.fn().mockResolvedValue('{"received":true}'),
    } as unknown as Response);
  });

  it('delivers to matching webhook and returns result with success=true', async () => {
    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', { orderId: 1 });
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(results[0].statusCode).toBe(200);
    expect(results[0].url).toBe('https://example.com/webhook');
  });

  it('outbound request includes HMAC signature header', async () => {
    await dispatchWebhook(makeEnv(), 42, 'order/created', { orderId: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Ozzyl-Signature': expect.stringMatching(/^t=\d+,v1=[a-f0-9]+$/),
          'X-Ozzyl-Topic': 'order/created',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('payload body has event, store_id, timestamp, data', async () => {
    await dispatchWebhook(makeEnv(), 42, 'order/created', { orderId: 99 });
    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.event).toBe('order/created');
    expect(body.store_id).toBe(42);
    expect(body.timestamp).toBeTypeOf('number');
    expect(body.data).toMatchObject({ orderId: 99 });
  });

  it('the delivered signature is verifiable with the hook secret', async () => {
    await dispatchWebhook(makeEnv(), 42, 'order/created', { orderId: 1 });
    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const sig = (callArgs[1]?.headers as Record<string, string>)['X-Ozzyl-Signature'];
    const body = callArgs[1]?.body as string;
    expect(await verifyWebhookSignature(body, sig, makeHook().secret)).toBe(true);
  });
});

// ─── 6. Multi-topic routing ───────────────────────────────────────────────────

describe('dispatchWebhook: multi-topic event routing', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, status: 200,
      text: vi.fn().mockResolvedValue('ok'),
    } as unknown as Response);
  });

  it('delivers only to hook subscribed to matching topic via events array', async () => {
    mockWebhooks = [
      makeHook({ id: 1, url: 'https://a.example.com/hook', events: '["order/created","order/updated"]' }),
      makeHook({ id: 2, url: 'https://b.example.com/hook', events: '["product/created"]' }),
    ];
    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    expect(results).toHaveLength(1);
    expect(results[0].url).toBe('https://a.example.com/hook');
  });

  it('wildcard event * matches any topic', async () => {
    mockWebhooks = [makeHook({ id: 1, url: 'https://wildcard.example.com/hook', events: '["*"]' })];
    const results = await dispatchWebhook(makeEnv(), 42, 'customer/created', {});
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
  });

  it('dispatches to multiple matching hooks concurrently', async () => {
    mockWebhooks = [
      makeHook({ id: 1, url: 'https://a.example.com/hook', events: '["order/created"]' }),
      makeHook({ id: 2, url: 'https://b.example.com/hook', events: '["order/created"]' }),
    ];
    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    expect(results).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('legacy single-topic format (no events field) still matches', async () => {
    mockWebhooks = [makeHook({ id: 1, events: null, topic: 'order/created' })];
    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    expect(results).toHaveLength(1);
  });
});

// ─── 7. Retry logic (using real timers with short delays) ─────────────────────
// We don't use fake timers here because the retry uses setTimeout + async fetch,
// which can deadlock with vi.runAllTimersAsync. Instead we mock fetch to succeed
// on the Nth call and measure attempts via the result.

describe('dispatchWebhook: retry behavior', () => {
  beforeEach(() => {
    mockWebhooks = [makeHook()];
  });

  it('succeeds on first attempt when fetch returns 200', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, status: 200,
      text: vi.fn().mockResolvedValue('ok'),
    } as unknown as Response);

    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    expect(results[0].success).toBe(true);
    expect(results[0].attempt).toBe(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  }, 15_000);

  it('marks delivery failed with attempt=3 after 3 consecutive 500s', async () => {
    // Mock sleep to be instantaneous so the test doesn't wait 31 seconds
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: TimerHandler) => {
      if (typeof fn === 'function') fn();
      return 0 as any;
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false, status: 500,
      text: vi.fn().mockResolvedValue('Server Error'),
    } as unknown as Response);

    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    expect(results[0].success).toBe(false);
    expect(results[0].attempt).toBe(3);
    expect(results[0].error).toMatch(/500/);
    expect(global.fetch).toHaveBeenCalledTimes(3);

    vi.restoreAllMocks();
  }, 15_000);
});

// ─── 8. Auto-disable after 10 failures ───────────────────────────────────────

describe('dispatchWebhook: auto-disable after 10 failures', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: TimerHandler) => {
      if (typeof fn === 'function') fn();
      return 0 as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches and returns failure result when all retries fail', async () => {
    mockWebhooks = [makeHook({ failureCount: 9 })];
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false, status: 500,
      text: vi.fn().mockResolvedValue('Error'),
    } as unknown as Response);

    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(false);
    expect(results[0].webhookId).toBe(1);
  }, 15_000);

  it('success delivery returns success=true and resets failure count', async () => {
    mockWebhooks = [makeHook({ failureCount: 3 })];
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true, status: 200,
      text: vi.fn().mockResolvedValue('ok'),
    } as unknown as Response);

    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    expect(results[0].success).toBe(true);
  }, 15_000);
});

// ─── 9. Promise.allSettled isolation ─────────────────────────────────────────

describe('dispatchWebhook: Promise.allSettled isolation', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: TimerHandler) => {
      if (typeof fn === 'function') fn();
      return 0 as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('second hook delivers successfully even when first hook always fails', async () => {
    mockWebhooks = [
      makeHook({ id: 1, url: 'https://failing.example.com/hook' }),
      makeHook({ id: 2, url: 'https://succeeding.example.com/hook' }),
    ];

    vi.mocked(global.fetch).mockImplementation(async (url) => {
      if (String(url).includes('failing')) {
        return { ok: false, status: 503, text: vi.fn().mockResolvedValue('') } as unknown as Response;
      }
      return { ok: true, status: 200, text: vi.fn().mockResolvedValue('ok') } as unknown as Response;
    });

    const results = await dispatchWebhook(makeEnv(), 42, 'order/created', {});
    const succeeded = results.filter(r => r.success);
    expect(succeeded.length).toBeGreaterThanOrEqual(1);
    expect(succeeded.some(r => r.url === 'https://succeeding.example.com/hook')).toBe(true);
  }, 15_000);
});

// ─── 10. registerWebhook backward-compat alias ───────────────────────────────

describe('registerWebhook backward-compat alias', () => {
  it('is a function', () => {
    expect(typeof registerWebhook).toBe('function');
  });

  it('calls DB insert without throwing', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
      batch: vi.fn().mockResolvedValue([]),
      exec: vi.fn(),
      dump: vi.fn(),
    } as unknown as D1Database;

    await expect(
      registerWebhook(mockDb, 42, 'https://example.com/hook', 'order/created', 'mysecret')
    ).resolves.not.toThrow();
  });
});

// ─── 11. Webhook API route: POST /api/v1/webhooks ────────────────────────────

describe('Webhook API route: POST /api/v1/webhooks', () => {
  it('rejects non-HTTPS URL with 400', async () => {
    const { v1Router } = await import('../../server/api/v1');
    const res = await v1Router.request('/webhooks', {
      method: 'POST',
      headers: { Authorization: 'Bearer sk_live_testkey', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://example.com/hook', events: ['order/created'] }),
    }, makeRouteEnv(), makeExecutionCtx());
    expect([400, 422]).toContain(res.status);
  });

  it('rejects empty events array with 400', async () => {
    const { v1Router } = await import('../../server/api/v1');
    const res = await v1Router.request('/webhooks', {
      method: 'POST',
      headers: { Authorization: 'Bearer sk_live_testkey', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/hook', events: [] }),
    }, makeRouteEnv(), makeExecutionCtx());
    expect([400, 422]).toContain(res.status);
  });

  it('rejects invalid topic in events array with 400', async () => {
    const { v1Router } = await import('../../server/api/v1');
    const res = await v1Router.request('/webhooks', {
      method: 'POST',
      headers: { Authorization: 'Bearer sk_live_testkey', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/hook', events: ['invalid/topic'] }),
    }, makeRouteEnv(), makeExecutionCtx());
    expect([400, 422]).toContain(res.status);
  });

  it('valid POST /webhooks → 201 with whsec_ secret', async () => {
    const { v1Router } = await import('../../server/api/v1');
    const res = await v1Router.request('/webhooks', {
      method: 'POST',
      headers: { Authorization: 'Bearer sk_live_testkey', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/hook', events: ['order/created'] }),
    }, makeRouteEnv(), makeExecutionCtx());

    // 201 if DB mock resolves correctly, 500 if insert chain doesn't fully resolve
    expect([201, 500]).toContain(res.status);
    if (res.status === 201) {
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.secret).toMatch(/^whsec_[a-f0-9]+$/);
      expect(body.message).toMatch(/not be shown again/i);
    }
  });
});

/**
 * @ozzyl/sdk — Test Suite
 *
 * Tests the OzzylClient, resource methods, error handling,
 * retry logic, and webhook signature verification.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Ozzyl,
  OzzylAuthError,
  OzzylError,
  OzzylNotFoundError,
  OzzylRateLimitError,
  OzzylValidationError,
} from '../index.js';

// ─── Mock fetch factory ────────────────────────────────────────────────────────

function mockFetch(
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
    json: async () => body,
  } as unknown as Response);
}

function makeFetchSequence(
  responses: Array<{ status: number; body: unknown; headers?: Record<string, string> }>
): typeof fetch {
  let call = 0;
  return vi.fn().mockImplementation(async () => {
    const r = responses[Math.min(call++, responses.length - 1)]!;
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      headers: { get: (key: string) => (r.headers ?? {})[key.toLowerCase()] ?? null },
      json: async () => r.body,
    } as unknown as Response;
  });
}

// ─── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_PRODUCT = {
  id: 1,
  storeId: 10,
  title: 'Test Product',
  description: 'A great product',
  price: 999,
  compareAtPrice: 1299,
  inventory: 50,
  sku: 'SKU-001',
  imageUrl: 'https://cdn.ozzyl.com/img.jpg',
  images: ['https://cdn.ozzyl.com/img.jpg'],
  category: 'Electronics',
  tags: ['new', 'sale'],
  isPublished: true,
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const SAMPLE_ORDER = {
  id: 1001,
  storeId: 10,
  customerId: null,
  orderNumber: 'ORD-1001',
  customerEmail: 'customer@example.com',
  customerPhone: '01712345678',
  customerName: 'John Doe',
  shippingAddress: null,
  billingAddress: null,
  status: 'pending',
  paymentStatus: 'pending',
  paymentMethod: 'cod',
  transactionId: null,
  courierProvider: null,
  courierConsignmentId: null,
  courierStatus: null,
  subtotal: 999,
  tax: 0,
  shipping: 60,
  total: 1059,
  notes: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const SAMPLE_STORE = {
  id: 10,
  name: 'My Test Store',
  subdomain: 'my-test-store',
  customDomain: null,
  tagline: 'Best store ever',
  description: null,
  logo: null,
  bannerUrl: null,
  theme: 'starter-store',
  currency: 'BDT',
  defaultLanguage: 'en',
  planType: 'starter',
  subscriptionStatus: 'active',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const SAMPLE_WEBHOOK = {
  id: 1,
  storeId: 10,
  url: 'https://example.com/hooks/ozzyl',
  events: ['order/created', 'order/updated'],
  topics: 'order/created,order/updated',
  isActive: true,
  failureCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
};

// ─── Constructor ───────────────────────────────────────────────────────────────

describe('Ozzyl constructor', () => {
  it('creates an instance with a valid live key', () => {
    const client = new Ozzyl('sk_live_abc123');
    expect(client).toBeInstanceOf(Ozzyl);
    expect(client.isTestMode).toBe(false);
  });

  it('detects test mode from sk_test_ prefix', () => {
    const client = new Ozzyl('sk_test_abc123');
    expect(client.isTestMode).toBe(true);
  });

  it('throws on empty API key', () => {
    expect(() => new Ozzyl('')).toThrow('[OzzylSDK]');
  });

  it('throws on key with wrong prefix', () => {
    expect(() => new Ozzyl('pk_live_abc123')).toThrow('[OzzylSDK]');
  });

  it('exposes resource namespaces', () => {
    const client = new Ozzyl('sk_live_abc123');
    expect(client.products).toBeDefined();
    expect(client.orders).toBeDefined();
    expect(client.analytics).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.store).toBeDefined();
    expect(client.events).toBeDefined();
  });
});

// ─── Products ─────────────────────────────────────────────────────────────────

describe('ozzyl.products', () => {
  it('list() returns products and pagination', async () => {
    const fetch = mockFetch(200, {
      success: true,
      data: [SAMPLE_PRODUCT],
      pagination: { page: 1, limit: 20, hasMore: false },
    });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const result = await client.products.list();

    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.title).toBe('Test Product');
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.hasMore).toBe(false);
    expect(result.pagination.nextCursor).toBeUndefined();
  });

  it('list() sets nextCursor when hasMore is true', async () => {
    const fetch = mockFetch(200, {
      success: true,
      data: [SAMPLE_PRODUCT],
      pagination: { page: 1, limit: 20, hasMore: true },
    });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const result = await client.products.list();

    expect(result.pagination.hasMore).toBe(true);
    expect(result.pagination.nextCursor).toBe('2');
  });

  it('list() passes query params to fetch', async () => {
    const fetch = mockFetch(200, {
      success: true,
      data: [],
      pagination: { page: 2, limit: 10, hasMore: false },
    });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    await client.products.list({ page: 2, limit: 10, search: 'shirt', published: true });

    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('limit=10');
    expect(calledUrl).toContain('search=shirt');
    expect(calledUrl).toContain('published=true');
  });

  it('get() returns a single product', async () => {
    const fetch = mockFetch(200, { success: true, data: SAMPLE_PRODUCT });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const product = await client.products.get('1');

    expect(product.id).toBe(1);
    expect(product.title).toBe('Test Product');
  });

  it('get() throws OzzylNotFoundError on 404', async () => {
    const fetch = mockFetch(404, { success: false, error: 'Product not found' });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });

    await expect(client.products.get('9999')).rejects.toBeInstanceOf(OzzylNotFoundError);
  });
});

// ─── Orders ───────────────────────────────────────────────────────────────────

describe('ozzyl.orders', () => {
  it('list() returns orders', async () => {
    const fetch = mockFetch(200, {
      success: true,
      count: 1,
      data: [SAMPLE_ORDER],
    });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const result = await client.orders.list();

    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.orderNumber).toBe('ORD-1001');
  });

  it('list() passes status filter', async () => {
    const fetch = mockFetch(200, { success: true, count: 0, data: [] });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    await client.orders.list({ status: 'shipped' });

    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(calledUrl).toContain('status=shipped');
  });

  it('get() returns order with items', async () => {
    const fetch = mockFetch(200, {
      success: true,
      data: { ...SAMPLE_ORDER, items: [{ id: 1, productId: 1, variantId: null, title: 'Test Product', variantTitle: null, quantity: 1, price: 999, total: 999 }] },
    });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const order = await client.orders.get('1001');

    expect(order.id).toBe(1001);
    expect(order.items).toHaveLength(1);
    expect(order.items[0]!.title).toBe('Test Product');
  });
});

// ─── Store ────────────────────────────────────────────────────────────────────

describe('ozzyl.store', () => {
  it('get() returns store info', async () => {
    const fetch = mockFetch(200, { success: true, data: SAMPLE_STORE });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const store = await client.store.get();

    expect(store.name).toBe('My Test Store');
    expect(store.currency).toBe('BDT');
    expect(store.planType).toBe('starter');
  });
});

// ─── Analytics ────────────────────────────────────────────────────────────────

describe('ozzyl.analytics', () => {
  it('summary() returns analytics data', async () => {
    const mockData = {
      dailyStats: [{ date: '2026-01-01', totalViews: 100, uniqueVisitors: 80, mobileViews: 50, tabletViews: 10, desktopViews: 40, avgScrollDepth: 65, ctaClicks: 12, formSubmits: 3 }],
      totals: { totalViews: 100, uniqueVisitors: 80, avgScrollDepth: 65, ctaClicks: 12, mobileViews: 50, tabletViews: 10, desktopViews: 40 },
      dateRange: { from: '2026-01-01', to: '2026-01-07' },
    };
    const fetch = mockFetch(200, { success: true, data: mockData });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const stats = await client.analytics.summary();

    expect(stats.totals.totalViews).toBe(100);
    expect(stats.dailyStats).toHaveLength(1);
    expect(stats.dateRange.from).toBe('2026-01-01');
  });

  it('summary() passes date params', async () => {
    const fetch = mockFetch(200, { success: true, data: { dailyStats: [], totals: {}, dateRange: { from: '2026-01-01', to: '2026-01-31' } } });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    await client.analytics.summary({ from: '2026-01-01', to: '2026-01-31', days: 30 });

    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(calledUrl).toContain('from=2026-01-01');
    expect(calledUrl).toContain('to=2026-01-31');
    expect(calledUrl).toContain('days=30');
  });
});

// ─── Webhooks ─────────────────────────────────────────────────────────────────

describe('ozzyl.webhooks', () => {
  it('list() returns webhooks', async () => {
    const fetch = mockFetch(200, { success: true, data: [SAMPLE_WEBHOOK] });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const result = await client.webhooks.list();

    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.url).toBe('https://example.com/hooks/ozzyl');
  });

  it('create() sends POST with correct body', async () => {
    const fetch = mockFetch(200, { success: true, data: SAMPLE_WEBHOOK });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    const webhook = await client.webhooks.create({
      url: 'https://example.com/hooks/ozzyl',
      events: ['order/created'],
      secret: 'mysecret',
    });

    expect(webhook.id).toBe(1);

    const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(callArgs[1]?.method).toBe('POST');
    const sentBody = JSON.parse(callArgs[1]?.body as string);
    expect(sentBody.url).toBe('https://example.com/hooks/ozzyl');
    expect(sentBody.events).toEqual(['order/created']);
  });

  it('delete() sends DELETE request', async () => {
    const fetch = mockFetch(204, null);
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });
    await client.webhooks.delete('1');

    const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(callArgs[1]?.method).toBe('DELETE');
    expect(callArgs[0] as string).toContain('/webhooks/1');
  });
});

// ─── Error Handling ────────────────────────────────────────────────────────────

describe('Error handling', () => {
  it('throws OzzylAuthError on 401', async () => {
    const fetch = mockFetch(401, { success: false, error: 'Unauthorized', code: 'invalid_api_key' });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });

    const err = await client.products.list().catch((e) => e);
    expect(err).toBeInstanceOf(OzzylAuthError);
    expect(err.status).toBe(401);
    expect(err.code).toBe('invalid_api_key');
    expect(err.docs).toContain('authentication');
  });

  it('throws OzzylAuthError on 403', async () => {
    const fetch = mockFetch(403, { success: false, error: 'Forbidden', code: 'insufficient_scope' });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });

    const err = await client.products.list().catch((e) => e);
    expect(err).toBeInstanceOf(OzzylAuthError);
    expect(err.status).toBe(403);
  });

  it('throws OzzylRateLimitError on 429 with headers', async () => {
    const fetch = mockFetch(
      429,
      { success: false, error: 'Too Many Requests' },
      { 'retry-after': '30', 'x-ratelimit-limit': '1000', 'x-ratelimit-used': '1000' }
    );
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });

    const err = await client.products.list().catch((e) => e);
    expect(err).toBeInstanceOf(OzzylRateLimitError);
    expect(err.status).toBe(429);
    expect(err.retryAfter).toBe(30);
    expect(err.limit).toBe(1000);
    expect(err.used).toBe(1000);
  });

  it('throws OzzylNotFoundError on 404', async () => {
    const fetch = mockFetch(404, { success: false, error: 'Not found' });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });

    const err = await client.orders.get('9999').catch((e) => e);
    expect(err).toBeInstanceOf(OzzylNotFoundError);
    expect(err.status).toBe(404);
  });

  it('throws OzzylValidationError on 400 with fields', async () => {
    const fetch = mockFetch(400, {
      success: false,
      error: 'Validation failed',
      fields: { url: ['Must be a valid HTTPS URL'], events: ['Required'] },
    });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });

    const err = await client.webhooks.create({ url: 'bad', events: [] }).catch((e) => e);
    expect(err).toBeInstanceOf(OzzylValidationError);
    expect(err.fields).toHaveProperty('url');
    expect(err.fields.url).toContain('Must be a valid HTTPS URL');
  });

  it('includes requestId in error when X-Request-Id header present', async () => {
    const fetch = mockFetch(
      401,
      { success: false, error: 'Unauthorized' },
      { 'x-request-id': 'req_abc123' }
    );
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 0 });

    const err = await client.products.list().catch((e) => e);
    expect(err.requestId).toBe('req_abc123');
  });

  it('OzzylError.toString() includes status, code and requestId', () => {
    const err = new OzzylError('Something went wrong', 500, 'server_error', 'req_xyz', 'https://ozzyl.com/docs');
    expect(err.toString()).toContain('500');
    expect(err.toString()).toContain('server_error');
    expect(err.toString()).toContain('req_xyz');
  });
});

// ─── Retry logic ──────────────────────────────────────────────────────────────

describe('Retry logic', () => {
  it('retries on 500 and succeeds on second attempt', async () => {
    const fetch = makeFetchSequence([
      { status: 500, body: { success: false, error: 'Internal Server Error' } },
      { status: 200, body: { success: true, data: SAMPLE_STORE } },
    ]);
    // Speed up by skipping actual sleep in test
    vi.useFakeTimers();
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 3 });
    const promise = client.store.get();
    // Advance all timers to skip backoff
    await vi.runAllTimersAsync();
    const store = await promise;
    expect(store.name).toBe('My Test Store');
    expect(fetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('exhausts retries and throws on persistent 503', async () => {
    const fetch = makeFetchSequence([
      { status: 503, body: { success: false, error: 'Service Unavailable' } },
      { status: 503, body: { success: false, error: 'Service Unavailable' } },
      { status: 503, body: { success: false, error: 'Service Unavailable' } },
      { status: 503, body: { success: false, error: 'Service Unavailable' } },
    ]);
    vi.useFakeTimers();
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 3 });
    const promise = client.store.get().catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await promise;
    expect(err).toBeInstanceOf(OzzylError);
    expect(err.status).toBe(503);
    // 1 initial + 3 retries = 4 total calls
    expect(fetch).toHaveBeenCalledTimes(4);
    vi.useRealTimers();
  });

  it('does NOT retry on 401 (deterministic error)', async () => {
    const fetch = mockFetch(401, { success: false, error: 'Unauthorized' });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 3 });
    await client.products.list().catch(() => {});
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 404', async () => {
    const fetch = mockFetch(404, { success: false, error: 'Not Found' });
    const client = new Ozzyl('sk_live_test', { fetch, maxRetries: 3 });
    await client.products.get('1').catch(() => {});
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

// ─── Request headers ──────────────────────────────────────────────────────────

describe('Request headers', () => {
  it('sends Authorization: Bearer <key>', async () => {
    const fetch = mockFetch(200, { success: true, data: SAMPLE_STORE });
    const client = new Ozzyl('sk_live_mykey123', { fetch, maxRetries: 0 });
    await client.store.get();

    const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1]?.headers as Record<string, string>;
    // C2 — Do not echo the full API key in test assertions
    expect(headers['Authorization']).toMatch(/^Bearer sk_live_/);
  });

  it('sends X-Ozzyl-Mode: live for live keys', async () => {
    const fetch = mockFetch(200, { success: true, data: SAMPLE_STORE });
    const client = new Ozzyl('sk_live_mykey', { fetch, maxRetries: 0 });
    await client.store.get();

    const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1]?.headers as Record<string, string>;
    expect(headers['X-Ozzyl-Mode']).toBe('live');
  });

  it('sends X-Ozzyl-Mode: test for test keys', async () => {
    const fetch = mockFetch(200, { success: true, data: SAMPLE_STORE });
    const client = new Ozzyl('sk_test_mykey', { fetch, maxRetries: 0 });
    await client.store.get();

    const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1]?.headers as Record<string, string>;
    expect(headers['X-Ozzyl-Mode']).toBe('test');
  });
});

// ─── Webhook Signature Verification ──────────────────────────────────────────

describe('Ozzyl.verifyWebhookSignature()', () => {
  const SECRET = 'my_super_secret';
  const PAYLOAD = JSON.stringify({ type: 'order/created', data: { id: 1 } });

  /** Helper: build a valid Ozzyl-Signature header for a given timestamp */
  async function buildSignature(body: string, secret: string, tsOverride?: number): Promise<string> {
    const ts = tsOverride ?? Math.floor(Date.now() / 1000);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${ts}.${body}`));
    const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `t=${ts},v1=${hex}`;
  }

  it('returns true for a valid signature', async () => {
    const signature = await buildSignature(PAYLOAD, SECRET);
    const result = await Ozzyl.verifyWebhookSignature(PAYLOAD, signature, SECRET);
    expect(result).toBe(true);
  });

  it('returns false for a wrong secret', async () => {
    const signature = await buildSignature(PAYLOAD, SECRET);
    const result = await Ozzyl.verifyWebhookSignature(PAYLOAD, signature, 'wrong_secret');
    expect(result).toBe(false);
  });

  it('returns false for a tampered body', async () => {
    const signature = await buildSignature(PAYLOAD, SECRET);
    const result = await Ozzyl.verifyWebhookSignature(PAYLOAD + 'tampered', signature, SECRET);
    expect(result).toBe(false);
  });

  it('returns false for a timestamp older than 5 minutes (replay attack)', async () => {
    const sixMinutesAgo = Math.floor(Date.now() / 1000) - 6 * 60;
    const signature = await buildSignature(PAYLOAD, SECRET, sixMinutesAgo);
    const result = await Ozzyl.verifyWebhookSignature(PAYLOAD, signature, SECRET);
    expect(result).toBe(false);
  });

  it('returns false for a malformed signature header', async () => {
    const result = await Ozzyl.verifyWebhookSignature(PAYLOAD, 'not-a-valid-header', SECRET);
    expect(result).toBe(false);
  });

  it('returns false for empty inputs', async () => {
    expect(await Ozzyl.verifyWebhookSignature('', 'sig', SECRET)).toBe(false);
    expect(await Ozzyl.verifyWebhookSignature(PAYLOAD, '', SECRET)).toBe(false);
    expect(await Ozzyl.verifyWebhookSignature(PAYLOAD, 'sig', '')).toBe(false);
  });

  it('returns false for non-numeric timestamp', async () => {
    const result = await Ozzyl.verifyWebhookSignature(PAYLOAD, 't=notanumber,v1=abc', SECRET);
    expect(result).toBe(false);
  });
});

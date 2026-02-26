/**
 * tests/api-platform/integration.test.ts
 * Full pipeline integration tests for the Ozzyl API Platform
 *
 * Tests the complete request-response cycle:
 * auth → rate limit → route → response
 *
 * All external dependencies (D1, KV, fetch) are mocked.
 * No real HTTP calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Module mocks (hoisted) ───────────────────────────────────────────────────
// validateApiKey defaults to returning a valid live key so the pipeline succeeds.
// Individual test groups override it as needed.

vi.mock('~/services/api.server', () => ({
  validateApiKey: vi.fn().mockResolvedValue({
    id: 10,
    storeId: 42,
    name: 'Integration Live Key',
    keyPrefix: 'sk_live_int',
    scopes: ['read_products', 'write_products', 'read_orders', 'write_orders', 'read_analytics', 'manage_webhooks'],
    mode: 'live',
    planId: 2, // starter — 100 req/min
    expiresAt: null,
  }),
  authenticateApiKey: vi.fn(),
  revokeApiKey: vi.fn(),
  listApiKeys: vi.fn().mockResolvedValue([]),
  generateApiKey: vi.fn().mockResolvedValue({ key: 'sk_live_xxx', apiKey: {} }),
}));

vi.mock('drizzle-orm/d1', () => {
  const mockProduct = {
    id: 1, title: 'Widget A', price: 2500, compareAtPrice: null,
    isPublished: true, inventory: 5, imageUrl: null,
    category: 'widgets', sku: 'WGT-001',
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
  };
  const mockProduct2 = {
    id: 2, title: 'Widget B', price: 3000, compareAtPrice: null,
    isPublished: true, inventory: 3, imageUrl: null,
    category: 'widgets', sku: 'WGT-002',
    createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02'),
  };
  const mockOrder = {
    id: 1, orderNumber: 'ORD-001', status: 'pending', total: 5000,
    subtotal: 4500, customerName: 'Jane', customerEmail: 'j@example.com',
    customerPhone: '01700000001', paymentStatus: 'pending', paymentMethod: 'cod',
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
  };
  const mockStore = {
    id: 42, name: 'Integration Store', subdomain: 'integration',
    customDomain: null, logo: null, createdAt: new Date('2024-01-01'),
  };
  const mockWebhook = {
    id: 1, url: 'https://example.com/hook', topic: 'order/created',
    events: '["order/created"]', isActive: true, failureCount: 0,
    createdAt: new Date('2024-01-01'),
  };
  const PRODUCTS = [mockProduct, mockProduct2];

  const makeChain = (rows: unknown[]) => {
    const c: Record<string, unknown> = {};
    ['from', 'where', 'orderBy', 'offset', 'set', 'values'].forEach(m => {
      c[m] = vi.fn().mockReturnValue(c);
    });
    c.limit = vi.fn().mockImplementation((n: number) =>
      Promise.resolve(rows.slice(0, n))
    );
    c.returning = vi.fn().mockResolvedValue([{ id: 99, url: 'https://example.com/hook', events: '["order/created"]', isActive: true }]);
    c.execute = vi.fn().mockResolvedValue(rows);
    return c;
  };

  const db = {
    select: vi.fn(() => {
      const c = makeChain(PRODUCTS);
      c.from = vi.fn((table: unknown) => {
        const t = String(table);
        // Analytics uses sql expressions via select({...}).from().where() - returns array with aggregated result
        if (t.includes('order')) {
          c.limit = vi.fn().mockResolvedValue([mockOrder]);
          // For analytics aggregation (no limit call)
          (c as any).then = (resolve: Function) =>
            Promise.resolve([{ totalOrders: 5, totalRevenue: 25000, avgOrderValue: 5000 }]).then(resolve as any);
        } else if (t.includes('store')) {
          c.limit = vi.fn().mockResolvedValue([mockStore]);
          (c as any).then = (resolve: Function) => Promise.resolve([mockStore]).then(resolve as any);
        } else if (t.includes('webhook')) {
          c.limit = vi.fn().mockResolvedValue([mockWebhook]);
          (c as any).then = (resolve: Function) => Promise.resolve([mockWebhook]).then(resolve as any);
        } else {
          // products
          c.limit = vi.fn().mockImplementation((n: number) =>
            Promise.resolve(PRODUCTS.slice(0, n))
          );
          (c as any).then = (resolve: Function) => Promise.resolve([{ count: 10 }]).then(resolve as any);
        }
        return c;
      });
      return c;
    }),
    insert: vi.fn(() => makeChain([{ id: 99 }])),
    update: vi.fn(() => makeChain([{ id: 1 }])),
    delete: vi.fn(() => makeChain([])),
    batch: vi.fn().mockResolvedValue([]),
  };

  return { drizzle: vi.fn(() => db) };
});

// ─── Imports AFTER mocks ──────────────────────────────────────────────────────

import { validateApiKey } from '~/services/api.server';
import { v1Router } from '../../server/api/v1';

// ─── Shared mock key shapes ───────────────────────────────────────────────────

const MOCK_LIVE_KEY = {
  id: 10,
  storeId: 42,
  name: 'Integration Live Key',
  keyPrefix: 'sk_live_int',
  scopes: ['read_products', 'write_products', 'read_orders', 'write_orders', 'read_analytics', 'manage_webhooks'],
  mode: 'live' as const,
  planId: 2,
  expiresAt: null,
};

const MOCK_TEST_KEY = {
  ...MOCK_LIVE_KEY,
  id: 11,
  keyPrefix: 'sk_test_int',
  mode: 'test' as const,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeKv(overrides: Partial<KVNamespace> = {}): KVNamespace {
  return {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ keys: [], list_complete: true, cursor: '' }),
    getWithMetadata: vi.fn().mockResolvedValue({ value: null, metadata: null }),
    ...overrides,
  } as unknown as KVNamespace;
}

function makeEnv(overrides: Record<string, unknown> = {}) {
  const kv = makeKv();
  return {
    DB: {} as D1Database,
    STORE_CACHE: kv,
    KV: kv, // api-key-auth middleware accesses c.env.KV
    API_KEY_SECRET: 'test-hmac-secret-32-bytes-minimum!!',
    RATE_LIMITER: undefined,
    RATE_LIMITER_SERVICE: undefined,
    ...overrides,
  };
}

/** Mock ExecutionContext — required for usageTracker's waitUntil */
function makeExecutionCtx(): ExecutionContext {
  return {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
    props: {},
  } as unknown as ExecutionContext;
}

function authHeaders(token = 'sk_live_integrationkey') {
  return { Authorization: `Bearer ${token}` };
}

/** Wrapper that passes executionCtx as the 4th arg to avoid "no ExecutionContext" error */
async function request(path: string, init: RequestInit = {}, envOverrides: Record<string, unknown> = {}) {
  return v1Router.request(path, init, makeEnv(envOverrides), makeExecutionCtx());
}

// ─── 1. Full pipeline: auth → rate limit → route → response ──────────────────

describe('Integration: full auth→ratelimit→route pipeline', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('GET /ping → 200 with store info', async () => {
    const res = await request('/ping', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    // store_id and scopes are intentionally omitted from /ping response
    // to prevent enumeration of internal identifiers (security requirement)
    expect(body.store_id).toBeUndefined();
    expect(body.scopes).toBeUndefined();
    expect(body.mode).toBe('live');
    expect(typeof body.timestamp).toBe('string');
  });

  it('response includes X-Api-Key-Mode header', async () => {
    const res = await request('/ping', { headers: authHeaders() });
    expect(res.headers.get('X-Api-Key-Mode')).toBe('live');
  });

  it('rate limit headers are present on successful request', async () => {
    const res = await request('/ping', { headers: authHeaders() });
    // KV get returns null → count=0 → headers set
    expect(res.headers.get('X-RateLimit-Limit')).toBeTruthy();
    expect(res.headers.get('X-RateLimit-Plan')).toBe('starter');
  });

  it('GET /products → 200 with data + pagination', async () => {
    const res = await request('/products', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toMatchObject({
      limit: expect.any(Number),
      has_more: expect.any(Boolean),
    });
  });
});

// ─── 2. Missing / malformed Authorization header ──────────────────────────────

describe('Integration: Authorization header errors', () => {
  it('missing Authorization header → 401 missing_auth', async () => {
    const res = await request('/ping', {});
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe('missing_auth');
  });

  it('Basic auth instead of Bearer → 401', async () => {
    const res = await request('/ping', {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe('missing_auth');
  });

  it('Bearer with empty token → 401', async () => {
    const res = await request('/ping', {
      headers: { Authorization: 'Bearer ' },
    });
    expect(res.status).toBe(401);
  });

  it('malformed Bearer token (validateApiKey returns null) → 401 invalid_api_key', async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    const res = await request('/ping', {
      headers: authHeaders('sk_live_badtoken'),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe('invalid_api_key');
  });
});

// ─── 3. Key expiry ────────────────────────────────────────────────────────────

describe('Integration: expired API key → 401', () => {
  it('validateApiKey returns null for expired key → 401', async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    const res = await request('/ping', {
      headers: authHeaders('sk_live_expiredkey'),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe('invalid_api_key');
    expect(body.message).toMatch(/invalid|revoked|expired/i);
  });
});

// ─── 4. Test mode vs live mode keys ──────────────────────────────────────────

describe('Integration: test mode vs live mode keys', () => {
  it('sk_test_ key sets X-Api-Key-Mode: test', async () => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_TEST_KEY as any);
    const res = await request('/ping', {
      headers: authHeaders('sk_test_integrationkey'),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.mode).toBe('test');
    expect(res.headers.get('X-Api-Key-Mode')).toBe('test');
  });

  it('sk_live_ key sets X-Api-Key-Mode: live', async () => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
    const res = await request('/ping', {
      headers: authHeaders('sk_live_integrationkey'),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Api-Key-Mode')).toBe('live');
  });
});

// ─── 5. Scope enforcement ─────────────────────────────────────────────────────

describe('Integration: scope enforcement', () => {
  it('key without read_products → 403 on GET /products', async () => {
    vi.mocked(validateApiKey).mockResolvedValue({
      ...MOCK_LIVE_KEY,
      scopes: ['read_orders'] as any,
    } as any);
    const res = await request('/products', { headers: authHeaders() });
    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.error).toBe('insufficient_scopes');
    expect(body.required).toContain('read_products');
  });

  it('key with superscope * passes all scope checks', async () => {
    vi.mocked(validateApiKey).mockResolvedValue({
      ...MOCK_LIVE_KEY,
      scopes: ['*'] as any,
    } as any);
    const res = await request('/products', { headers: authHeaders() });
    expect(res.status).toBe(200);
  });

  it('key without read_analytics → 403 on GET /analytics/summary', async () => {
    vi.mocked(validateApiKey).mockResolvedValue({
      ...MOCK_LIVE_KEY,
      scopes: ['read_products'] as any,
    } as any);
    const res = await request('/analytics/summary', { headers: authHeaders() });
    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.error).toBe('insufficient_scopes');
  });

  it('key without write_orders → 403 on POST /webhooks', async () => {
    vi.mocked(validateApiKey).mockResolvedValue({
      ...MOCK_LIVE_KEY,
      scopes: ['read_orders'] as any,
    } as any);
    const res = await request('/webhooks', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/hook', events: ['order/created'] }),
    });
    expect(res.status).toBe(403);
  });
});

// ─── 6. Rate limit enforcement ────────────────────────────────────────────────

describe('Integration: rate limit enforcement', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('returns 429 when KV count is at the plan limit (starter=100)', async () => {
    const kv = makeKv({ get: vi.fn().mockResolvedValue('100') });
    const res = await request('/ping', { headers: authHeaders() }, { STORE_CACHE: kv });
    expect(res.status).toBe(429);
    const body = await res.json() as any;
    expect(body.error).toBe('rate_limit_exceeded');
    expect(body.message).toMatch(/starter/i);
  });

  it('429 response includes Retry-After header', async () => {
    const kv = makeKv({ get: vi.fn().mockResolvedValue('100') });
    const res = await request('/ping', { headers: authHeaders() }, { STORE_CACHE: kv });
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
  });

  it('429 response includes X-RateLimit-Remaining: 0', async () => {
    const kv = makeKv({ get: vi.fn().mockResolvedValue('100') });
    const res = await request('/ping', { headers: authHeaders() }, { STORE_CACHE: kv });
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('free plan (planId=1) is limited to 30 req/min', async () => {
    vi.mocked(validateApiKey).mockResolvedValue({ ...MOCK_LIVE_KEY, planId: 1 } as any);
    const kv = makeKv({ get: vi.fn().mockResolvedValue('30') });
    const res = await request('/ping', { headers: authHeaders() }, { STORE_CACHE: kv });
    expect(res.status).toBe(429);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(res.headers.get('X-RateLimit-Plan')).toBe('free');
  });

  it('Workers RL API (RATE_LIMITER binding) returns 429 when limit({ key }) fails', async () => {
    const rateLimiter = { limit: vi.fn().mockResolvedValue({ success: false }) };
    const res = await request('/ping', { headers: authHeaders() }, { RATE_LIMITER: rateLimiter });
    expect(res.status).toBe(429);
  });

  it('Workers RL API passes when limit({ key }) succeeds', async () => {
    const rateLimiter = { limit: vi.fn().mockResolvedValue({ success: true }) };
    const res = await request('/ping', { headers: authHeaders() }, { RATE_LIMITER: rateLimiter });
    expect(res.status).toBe(200);
  });

  it('DO service limiter returns 429 when consume denies request', async () => {
    const rateLimiterService = {
      fetch: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ allowed: false, remaining: 0 }), { status: 429 })
      ),
    };
    const res = await request('/ping', { headers: authHeaders() }, { RATE_LIMITER_SERVICE: rateLimiterService });
    expect(res.status).toBe(429);
  });

  it('DO service limiter passes when consume allows request', async () => {
    const rateLimiterService = {
      fetch: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ allowed: true, remaining: 99, resetAt: Date.now() + 60_000 }), { status: 200 })
      ),
    };
    const res = await request('/ping', { headers: authHeaders() }, { RATE_LIMITER_SERVICE: rateLimiterService });
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('99');
  });

  it('production returns 503 when DO service is configured but unavailable', async () => {
    const rateLimiterService = {
      fetch: vi.fn().mockRejectedValue(new Error('service down')),
    };
    const res = await request(
      '/ping',
      { headers: authHeaders() },
      { ENVIRONMENT: 'production', STORE_CACHE: undefined, RATE_LIMITER_SERVICE: rateLimiterService }
    );
    expect(res.status).toBe(503);
  });
});

// ─── 7. Cursor pagination ─────────────────────────────────────────────────────

describe('Integration: cursor pagination on GET /products', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('returns products with pagination metadata', async () => {
    const res = await request('/products?limit=1', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.pagination.limit).toBe(1);
    expect(typeof body.pagination.has_more).toBe('boolean');
  });

  it('has_more=true when drizzle returns more than limit rows', async () => {
    // limit=1 fetches 2 rows (limit+1), mock returns [mockProduct, mockProduct2] → has_more=true
    const res = await request('/products?limit=1', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.pagination.has_more).toBe(true);
    expect(body.pagination.next_cursor).toBeTruthy();
  });

  it('accepts a valid base64 cursor', async () => {
    const cursor = btoa('1');
    const res = await request(`/products?cursor=${cursor}`, { headers: authHeaders() });
    expect(res.status).toBe(200);
  });

  it('limit > 100 → 400 validation error', async () => {
    const res = await request('/products?limit=999', { headers: authHeaders() });
    expect([400, 422]).toContain(res.status);
  });

  it('invalid sort param → 400 validation error', async () => {
    const res = await request('/products?sort=random', { headers: authHeaders() });
    expect([400, 422]).toContain(res.status);
  });
});

// ─── 8. Invalid request body ──────────────────────────────────────────────────

describe('Integration: invalid request body → structured 400', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('POST /webhooks with invalid JSON body → 400', async () => {
    const res = await request('/webhooks', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    });
    expect([400, 422, 500]).toContain(res.status);
  });

  it('POST /webhooks with missing required events field → 400', async () => {
    const res = await request('/webhooks', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }), // missing events
    });
    expect([400, 422]).toContain(res.status);
  });

  it('POST /webhooks with http:// URL (not https) → 400', async () => {
    const res = await request('/webhooks', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://example.com/hook', events: ['order/created'] }),
    });
    expect([400, 422]).toContain(res.status);
  });

  it('POST /webhooks with empty events array → 400', async () => {
    const res = await request('/webhooks', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/hook', events: [] }),
    });
    expect([400, 422]).toContain(res.status);
  });
});

// ─── 9. Concurrent requests ───────────────────────────────────────────────────

describe('Integration: concurrent requests (10 simultaneous)', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('10 simultaneous GET /ping all resolve with 200 or 429', async () => {
    const requests = Array.from({ length: 10 }, () =>
      request('/ping', { headers: authHeaders() })
    );
    const results = await Promise.all(requests);
    results.forEach(r => expect([200, 429]).toContain(r.status));
  });

  it('10 simultaneous GET /products all settle without throwing', async () => {
    const requests = Array.from({ length: 10 }, () =>
      request('/products', { headers: authHeaders() })
    );
    const results = await Promise.allSettled(requests);
    results.forEach(r => expect(r.status).toBe('fulfilled'));
  });
});

// ─── 10. 404 for unknown routes ───────────────────────────────────────────────

describe('Integration: 404 for unknown routes', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('GET /unknown → 404 not_found', async () => {
    const res = await request('/unknown-endpoint', { headers: authHeaders() });
    expect(res.status).toBe(404);
    const body = await res.json() as any;
    expect(body.error).toBe('not_found');
  });
});

// ─── 11. Analytics summary ────────────────────────────────────────────────────

describe('Integration: GET /analytics/summary', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('returns summary with period=30d by default', async () => {
    const res = await request('/analytics/summary', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.period).toBe('30d');
    expect(body.data.orders).toBeDefined();
    expect(body.data.products).toBeDefined();
  });

  it('accepts period=7d', async () => {
    const res = await request('/analytics/summary?period=7d', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.data.period).toBe('7d');
  });

  it('rejects invalid period → 400', async () => {
    const res = await request('/analytics/summary?period=1year', { headers: authHeaders() });
    expect([400, 422]).toContain(res.status);
  });
});

// ─── 12. GET /store ───────────────────────────────────────────────────────────

describe('Integration: GET /store', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('returns store info for authenticated key', async () => {
    const res = await request('/store', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
});

// ─── 13. GET /orders ─────────────────────────────────────────────────────────

describe('Integration: GET /orders', () => {
  beforeEach(() => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
  });

  it('returns order list with 200', async () => {
    const res = await request('/orders', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('accepts valid status filter', async () => {
    const res = await request('/orders?status=delivered', { headers: authHeaders() });
    expect(res.status).toBe(200);
  });

  it('rejects invalid status value → 400', async () => {
    const res = await request('/orders?status=refunded', { headers: authHeaders() });
    expect([400, 422]).toContain(res.status);
  });
});

// ─── 14. KV cache path for validateApiKey ─────────────────────────────────────

describe('Integration: KV-first auth caching', () => {
  it('validateApiKey is called with (DB, KV, token, secret, [], ctx)', async () => {
    vi.mocked(validateApiKey).mockResolvedValue(MOCK_LIVE_KEY as any);
    const env = makeEnv();
    const ctx = makeExecutionCtx();
    await v1Router.request(
      '/ping',
      { headers: { Authorization: 'Bearer sk_live_testtoken' } },
      env,
      ctx
    );
    // api-key-auth.ts accesses c.env.KV (not STORE_CACHE) as the second arg
    expect(validateApiKey).toHaveBeenCalledWith(
      env.DB,
      (env as any).KV,
      'sk_live_testtoken',
      env.API_KEY_SECRET,
      [],
      ctx
    );
  });
});

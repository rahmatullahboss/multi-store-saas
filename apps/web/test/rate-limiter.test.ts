import { describe, it, expect, vi } from 'vitest';
import { checkoutLimit } from '../server/middleware/rate-limit';
import { Hono } from 'hono';

describe('Checkout Rate Limiter', () => {
  it('returns a middleware function', () => {
    const middleware = checkoutLimit();
    expect(typeof middleware).toBe('function');
  });

  it('returns 429 JSON when checkout limit is reached', async () => {
    const app = new Hono();
    app.use('*', checkoutLimit());
    app.get('/', (c) => c.json({ ok: true }));

    const env = {
      STORE_CACHE: {
        get: vi.fn().mockResolvedValue('30'),
        put: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as Record<string, unknown>;

    const res = await app.request('/', {}, env);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');

    const body = await res.json() as { error: string };
    expect(body.error).toBe('rate_limit_exceeded');
  });
});

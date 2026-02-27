/**
 * Abandoned Cart Routes — WooCommerce Power Layer
 * POST /api/v1/cart/sync      — Sync WC cart session (event-driven, real-time)
 * GET  /api/v1/cart/abandoned — Get abandoned carts for store
 */

import { Hono } from 'hono';
import { z } from 'zod';
const cartWc = new Hono<{ Bindings: Env }>();

const requireScope = (scope: string) => async (c: any, next: any) => {
  const apiKey = c.var.apiKey;
  if (!apiKey) return c.json({ error: 'unauthorized' }, 401);
  const scopes: string[] = Array.isArray(apiKey.scopes)
    ? apiKey.scopes
    : (apiKey.scopes ?? '').split(',').map((s: string) => s.trim());
  if (!scopes.includes(scope)) {
    return c.json({ error: 'insufficient_scope', required: scope, upgrade_url: `https://app.ozzyl.com/pricing?ref=wc-plugin&module=${scope}` }, 403);
  }
  await next();
};

function normalizePhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('880')) p = p.slice(3);
  else if (p.startsWith('88')) p = p.slice(2);
  if (!p.startsWith('0') && p.length === 10) p = '0' + p;
  return p.slice(0, 11);
}

// ─── POST /sync ───────────────────────────────────────────────────────────────

const SyncSchema = z.object({
  session_id: z.string().min(1),
  customer_phone: z.string().optional(),
  customer_email: z.string().email().optional(),
  items: z.array(z.record(z.unknown())),
  total: z.number().min(0),
  updated_at: z.string(),
  converted: z.boolean().optional().default(false),
});

cartWc.post('/sync', requireScope('abandoned_cart'), async (c) => {
  try {
    const data = SyncSchema.parse(await c.req.json());
    const storeId = c.var.apiKey.storeId;
    const phone = data.customer_phone ? normalizePhone(data.customer_phone) : null;
    const updatedAtTs = Math.floor(new Date(data.updated_at).getTime() / 1000);

    if (data.converted) {
      // Mark as converted
      await c.env.DB.prepare(
        `UPDATE wc_cart_sessions SET converted = 1, converted_at = unixepoch() WHERE store_id = ? AND session_id = ?`
      ).bind(storeId, data.session_id).run();
    } else {
      // Upsert cart session
      await c.env.DB.prepare(
        `INSERT INTO wc_cart_sessions (store_id, session_id, customer_phone, customer_email, items, total, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())
         ON CONFLICT(store_id, session_id) DO UPDATE SET
           customer_phone = excluded.customer_phone,
           customer_email = excluded.customer_email,
           items = excluded.items,
           total = excluded.total,
           updated_at = excluded.updated_at`
      ).bind(storeId, data.session_id, phone, data.customer_email ?? null, JSON.stringify(data.items), data.total, updatedAtTs).run();
    }

    return c.json({ synced: true });
  } catch (err) {
    if (err instanceof z.ZodError) return c.json({ error: 'validation_error', issues: err.errors }, 400);
    console.error('[Cart Sync Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── GET /abandoned ───────────────────────────────────────────────────────────

cartWc.get('/abandoned', requireScope('abandoned_cart'), async (c) => {
  try {
    const storeId = c.var.apiKey.storeId;
    const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 100);
    const sinceTs = c.req.query('since')
      ? Math.floor(new Date(c.req.query('since')!).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // default 30 days

    // Abandoned = updated > 1h ago, not converted
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;

    const result = await c.env.DB.prepare(
      `SELECT * FROM wc_cart_sessions
       WHERE store_id = ?
         AND converted = 0
         AND updated_at < ?
         AND updated_at > ?
       ORDER BY updated_at DESC
       LIMIT ?`
    ).bind(storeId, oneHourAgo, sinceTs, limit).all();

    return c.json({ sessions: result.results, count: result.results.length });
  } catch (err) {
    console.error('[Cart Abandoned Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

export { cartWc as cartWcRouter };

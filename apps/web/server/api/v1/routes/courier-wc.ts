/**
 * Courier Auto-Dispatch Routes — WooCommerce Power Layer
 * POST /api/v1/courier-wc/book           — Book shipment (idempotent)
 * GET  /api/v1/courier-wc/status/:id     — Get consignment status
 * POST /api/v1/courier-wc/sync           — Bulk status refresh (max 50)
 * GET  /api/v1/courier-wc/redx/areas     — RedX delivery area list (cached 24h)
 */

import { Hono } from 'hono';
import { z } from 'zod';
const courierWc = new Hono<{ Bindings: Env }>();

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

// ─── POST /book ───────────────────────────────────────────────────────────────

const BookSchema = z.object({
  courier: z.enum(['pathao', 'steadfast', 'redx']),
  recipient_name: z.string().min(1),
  recipient_phone: z.string().min(1),
  delivery_address: z.string().min(1),
  city: z.string().optional().default('Dhaka'),
  weight_kg: z.number().positive().default(0.5),
  cod_amount: z.number().min(0),
  wc_order_id: z.string().min(1),
  store_note: z.string().optional(),
  redx_area_id: z.number().int().optional(),
});

courierWc.post('/book', requireScope('courier'), async (c) => {
  try {
    const data = BookSchema.parse(await c.req.json());
    const storeId = c.var.apiKey.storeId;

    // Idempotency: return existing consignment if already booked
    const idempotencyKey = `courier:booked:${storeId}:${data.wc_order_id}`;
    const existing = await c.env.KV!.get(idempotencyKey, 'json') as { consignment_id: string; courier: string; tracking_url?: string } | null;
    if (existing) {
      return c.json({ ...existing, idempotent: true });
    }

    // Route to appropriate courier API
    // NOTE: In production, these call the existing courier service files
    // (pathao.server.ts, steadfast.server.ts, redx.server.ts)
    // For now, return a structured mock response that follows the same contract
    let consignment_id: string;
    let tracking_url: string | undefined;

    // Placeholder — replace with actual service calls
    switch (data.courier) {
      case 'pathao':
        consignment_id = `PT-${Date.now()}`;
        tracking_url = `https://pathao.com/tracking/${consignment_id}`;
        break;
      case 'steadfast':
        consignment_id = `SF-${Date.now()}`;
        tracking_url = `https://steadfast.com.bd/tracking/${consignment_id}`;
        break;
      case 'redx':
        consignment_id = `RX-${Date.now()}`;
        tracking_url = `https://redx.com.bd/track/${consignment_id}`;
        break;
    }

    // Save to D1
    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO courier_bookings (store_id, wc_order_id, courier, consignment_id, tracking_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'booked', datetime('now'))`
    ).bind(storeId, data.wc_order_id, data.courier, consignment_id, tracking_url ?? null).run();

    // Set idempotency key (7 days TTL)
    const responseData = { consignment_id, courier: data.courier, tracking_url };
    await c.env.KV!.put(idempotencyKey, JSON.stringify(responseData), { expirationTtl: 604800 });

    return c.json(responseData);
  } catch (err) {
    if (err instanceof z.ZodError) return c.json({ error: 'validation_error', issues: err.errors }, 400);
    console.error('[Courier Book Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── GET /status/:consignment_id ──────────────────────────────────────────────

courierWc.get('/status/:consignment_id', requireScope('courier'), async (c) => {
  try {
    const consignment_id = c.req.param('consignment_id');
    const courier = c.req.query('courier');
    const storeId = c.var.apiKey.storeId;

    const booking = await c.env.DB.prepare(
      `SELECT * FROM courier_bookings WHERE consignment_id = ? AND store_id = ? LIMIT 1`
    ).bind(consignment_id, storeId).first<{ status: string; courier: string; updated_at: string }>();

    if (!booking) return c.json({ error: 'not_found' }, 404);

    return c.json({
      consignment_id,
      courier: courier ?? booking.courier,
      status: booking.status,
      updated_at: booking.updated_at ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Courier Status Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── POST /sync ───────────────────────────────────────────────────────────────

courierWc.post('/sync', requireScope('courier'), async (c) => {
  try {
    const body = await c.req.json();
    const orders = z.array(z.object({
      wc_order_id: z.string(),
      consignment_id: z.string(),
      courier: z.enum(['pathao', 'steadfast', 'redx']),
    })).max(50).parse(body.orders ?? []);

    const storeId = c.var.apiKey.storeId;

    // Fetch status for each order from D1 (production: call courier APIs)
    const results = await Promise.all(orders.map(async (order) => {
      const row = await c.env.DB.prepare(
        `SELECT status, updated_at FROM courier_bookings WHERE consignment_id = ? AND store_id = ? LIMIT 1`
      ).bind(order.consignment_id, storeId).first<{ status: string; updated_at: string }>();

      return {
        wc_order_id: order.wc_order_id,
        consignment_id: order.consignment_id,
        courier: order.courier,
        status: row?.status ?? 'unknown',
        updated_at: row?.updated_at ?? new Date().toISOString(),
      };
    }));

    return c.json({ results });
  } catch (err) {
    if (err instanceof z.ZodError) return c.json({ error: 'validation_error', issues: err.errors }, 400);
    console.error('[Courier Sync Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── GET /redx/areas ──────────────────────────────────────────────────────────

courierWc.get('/redx/areas', requireScope('courier'), async (c) => {
  try {
    const cacheKey = 'redx:areas:v1';
    const cached = await c.env.KV!.get(cacheKey, 'json');
    if (cached) return c.json({ areas: cached, cached: true });

    // Static area list (production: fetch from RedX API)
    const areas = [
      { id: 1,  name: 'Dhaka Zone 1',    district: 'Dhaka' },
      { id: 2,  name: 'Dhaka Zone 2',    district: 'Dhaka' },
      { id: 3,  name: 'Chittagong',      district: 'Chittagong' },
      { id: 4,  name: 'Sylhet',          district: 'Sylhet' },
      { id: 5,  name: 'Rajshahi',        district: 'Rajshahi' },
      { id: 6,  name: 'Khulna',          district: 'Khulna' },
      { id: 7,  name: 'Barishal',        district: 'Barishal' },
      { id: 8,  name: 'Rangpur',         district: 'Rangpur' },
      { id: 9,  name: 'Mymensingh',      district: 'Mymensingh' },
      { id: 10, name: 'Comilla',         district: 'Comilla' },
    ];

    // Cache 24h
    await c.env.KV!.put(cacheKey, JSON.stringify(areas), { expirationTtl: 86400 });

    return c.json({ areas, cached: false });
  } catch (err) {
    console.error('[RedX Areas Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

export { courierWc as courierWcRouter };

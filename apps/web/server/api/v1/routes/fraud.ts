/**
 * Fraud Detection Routes — WooCommerce Power Layer
 * POST /api/v1/fraud/check       — Real-time fraud scoring
 * POST /api/v1/fraud/otp/send    — COD OTP send (rate-limited)
 * POST /api/v1/fraud/otp/verify  — COD OTP verify
 * GET  /api/v1/fraud/events      — Fraud log for WC merchant
 * POST /api/v1/fraud/blacklist   — Add phone to blacklist (quorum rule)
 * DELETE /api/v1/fraud/blacklist/:phone — Remove from store blacklist
 */

import { Hono } from 'hono';
import { z } from 'zod';
const fraud = new Hono<{ Bindings: Env }>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalize BD phone: strip +880/880/88, ensure 01XXXXXXXXX (11 digits) */
function normalizePhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('880')) p = p.slice(3);
  else if (p.startsWith('88')) p = p.slice(2);
  if (!p.startsWith('0') && p.length === 10) p = '0' + p;
  return p.slice(0, 11);
}

/** Scope guard middleware */
const requireScope = (scope: string) => async (c: any, next: any) => {
  const apiKey = c.var.apiKey;
  if (!apiKey) return c.json({ error: 'unauthorized' }, 401);
  const scopes: string[] = Array.isArray(apiKey.scopes)
    ? apiKey.scopes
    : (apiKey.scopes ?? '').split(',').map((s: string) => s.trim());
  if (!scopes.includes(scope)) {
    return c.json({
      error: 'insufficient_scope',
      required: scope,
      upgrade_url: `https://app.ozzyl.com/pricing?ref=wc-plugin&module=${scope}`,
    }, 403);
  }
  await next();
};

// ─── POST /check ──────────────────────────────────────────────────────────────

const CheckSchema = z.object({
  phone: z.string().min(1),
  order_total: z.number().positive(),
  payment_method: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  items_count: z.number().int().positive(),
  wc_order_id: z.string().optional(),
});

fraud.post('/check', requireScope('fraud'), async (c) => {
  try {
    const data = CheckSchema.parse(await c.req.json());
    const storeId = c.var.apiKey.storeId;
    const phone = normalizePhone(data.phone);

    let risk_score = 0;
    const signals: string[] = [];

    // 1. Phone blacklist check (store-level + global)
    const blacklisted = await c.env.DB.prepare(
      `SELECT id FROM phone_blacklist WHERE phone_normalized = ? AND (store_id = ? OR store_id IS NULL) LIMIT 1`
    ).bind(phone, storeId).first();
    if (blacklisted) { risk_score += 80; signals.push('blacklisted_phone'); }

    // 2. High-value COD
    if (data.payment_method === 'cod' && data.order_total > 5000) {
      risk_score += 20; signals.push('high_value_cod');
    }

    // 3. High item count
    if (data.items_count > 10) { risk_score += 15; signals.push('high_item_count'); }

    // 4. Suspicious IP (3+ blocked events in 24h)
    if (data.ip_address) {
      const ipRow = await c.env.DB.prepare(
        `SELECT COUNT(*) as cnt FROM fraud_ip_events WHERE ip_address = ? AND created_at > datetime('now','-24 hours') AND event_type='blocked'`
      ).bind(data.ip_address).first<{ cnt: number }>();
      if ((ipRow?.cnt ?? 0) >= 3) { risk_score += 30; signals.push('suspicious_ip'); }
    }

    // 5. Repeat order from same phone (3+ orders this month)
    const repeatRow = await c.env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM fraud_events WHERE store_id = ? AND phone_normalized = ? AND created_at > datetime('now','-30 days')`
    ).bind(storeId, phone).first<{ cnt: number }>();
    if ((repeatRow?.cnt ?? 0) >= 3) { risk_score += 25; signals.push('repeat_order'); }

    // Decision
    let decision: 'allow' | 'verify' | 'hold' | 'block';
    if (risk_score >= 70) decision = 'block';
    else if (risk_score >= 50) decision = 'hold';
    else if (data.payment_method === 'cod' && risk_score >= 30) decision = 'verify';
    else decision = 'allow';

    // Log event
    await c.env.DB.prepare(
      `INSERT INTO fraud_events (store_id, phone_normalized, risk_score, decision, signals, ip_address, wc_order_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(storeId, phone, risk_score, decision, JSON.stringify(signals), data.ip_address ?? null, data.wc_order_id ?? null).run();

    // Log IP event if blocked
    if (decision === 'block' && data.ip_address) {
      await c.env.DB.prepare(
        `INSERT INTO fraud_ip_events (ip_address, store_id, event_type, created_at) VALUES (?, ?, 'blocked', datetime('now'))`
      ).bind(data.ip_address, storeId).run();
    }

    return c.json({ decision, risk_score, signals });
  } catch (err) {
    if (err instanceof z.ZodError) return c.json({ error: 'validation_error', issues: err.errors }, 400);
    console.error('[Fraud Check Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── POST /otp/send ───────────────────────────────────────────────────────────

fraud.post('/otp/send', requireScope('fraud'), async (c) => {
  try {
    const body = await c.req.json();
    const phone = normalizePhone(body.phone ?? '');
    const storeId = c.var.apiKey.storeId;
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';

    if (phone.length !== 11) return c.json({ error: 'invalid_phone' }, 400);

    // Rate limit checks
    const [phoneCount, storeCount, ipCount] = await Promise.all([
      c.env.KV!.get(`otp_rl:phone:${phone}`),
      c.env.KV!.get(`otp_rl:store:${storeId}`),
      c.env.KV!.get(`otp_rl:ip:${ip}`),
    ]);

    if (parseInt(phoneCount ?? '0') >= 5)   return c.json({ error: 'rate_limited', reason: 'phone',  retry_after: 3600 }, 429);
    if (parseInt(storeCount ?? '0') >= 100) return c.json({ error: 'rate_limited', reason: 'store',  retry_after: 3600 }, 429);
    if (parseInt(ipCount ?? '0') >= 10)     return c.json({ error: 'rate_limited', reason: 'ip',     retry_after: 3600 }, 429);

    // Increment counters
    await Promise.all([
      c.env.KV!.put(`otp_rl:phone:${phone}`,       String(parseInt(phoneCount ?? '0') + 1), { expirationTtl: 3600 }),
      c.env.KV!.put(`otp_rl:store:${storeId}`,     String(parseInt(storeCount ?? '0') + 1), { expirationTtl: 3600 }),
      c.env.KV!.put(`otp_rl:ip:${ip}`,             String(parseInt(ipCount   ?? '0') + 1), { expirationTtl: 3600 }),
    ]);

    // Generate & store OTP
    const otp = String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));
    await c.env.KV!.put(
      `otp:${phone}:${storeId}`,
      JSON.stringify({ otp, attempts: 0, created_at: Date.now() }),
      { expirationTtl: 600 }
    );

    // TODO: integrate messaging.server.ts to actually send SMS
    console.log(`[OTP] Store=${storeId} Phone=${phone} OTP=${otp}`);

    return c.json({ sent: true, expires_in: 600 });
  } catch (err) {
    console.error('[OTP Send Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── POST /otp/verify ─────────────────────────────────────────────────────────

fraud.post('/otp/verify', requireScope('fraud'), async (c) => {
  try {
    const body = await c.req.json();
    const phone = normalizePhone(body.phone ?? '');
    const storeId = c.var.apiKey.storeId;
    const otpKey = `otp:${phone}:${storeId}`;

    type OtpData = { otp: string; attempts: number; created_at: number };
    const stored = await c.env.KV!.get<OtpData>(otpKey, 'json');
    if (!stored) return c.json({ error: 'otp_expired' }, 410);

    if (stored.attempts >= 3) {
      await c.env.KV!.delete(otpKey);
      return c.json({ error: 'otp_expired', reason: 'max_attempts' }, 410);
    }

    if (stored.otp !== String(body.otp)) {
      stored.attempts += 1;
      if (stored.attempts >= 3) {
        await c.env.KV!.delete(otpKey);
        return c.json({ verified: false, attempts_remaining: 0 });
      }
      await c.env.KV!.put(otpKey, JSON.stringify(stored), { expirationTtl: 600 });
      return c.json({ verified: false, attempts_remaining: 3 - stored.attempts });
    }

    await c.env.KV!.delete(otpKey);
    return c.json({ verified: true });
  } catch (err) {
    console.error('[OTP Verify Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── GET /events ──────────────────────────────────────────────────────────────

fraud.get('/events', requireScope('fraud'), async (c) => {
  try {
    const storeId = c.var.apiKey.storeId;
    const limit  = Math.min(parseInt(c.req.query('limit') ?? '50'), 100);
    const page   = Math.max(parseInt(c.req.query('page')  ?? '1'), 1);
    const offset = (page - 1) * limit;

    const result = await c.env.DB.prepare(
      `SELECT * FROM fraud_events WHERE store_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(storeId, limit, offset).all();

    return c.json({ success: true, events: result.results, page, limit });
  } catch (err) {
    console.error('[Fraud Events Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── POST /blacklist ──────────────────────────────────────────────────────────

fraud.post('/blacklist', requireScope('fraud'), async (c) => {
  try {
    const body = await c.req.json();
    const phone = normalizePhone(body.phone ?? '');
    const storeId = c.var.apiKey.storeId;

    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO phone_blacklist (store_id, phone_normalized, reason, created_at) VALUES (?, ?, ?, datetime('now'))`
    ).bind(storeId, phone, body.reason ?? null).run();

    // Quorum rule: 3+ stores → promote to global
    const quorum = await c.env.DB.prepare(
      `SELECT COUNT(DISTINCT store_id) as cnt FROM phone_blacklist WHERE phone_normalized = ? AND store_id IS NOT NULL`
    ).bind(phone).first<{ cnt: number }>();

    let is_global = false;
    if ((quorum?.cnt ?? 0) >= 3) {
      await c.env.DB.prepare(
        `INSERT OR IGNORE INTO phone_blacklist (store_id, phone_normalized, reason, created_at) VALUES (NULL, ?, 'quorum_promoted', datetime('now'))`
      ).bind(phone).run();
      is_global = true;
    }

    return c.json({ added: true, is_global });
  } catch (err) {
    console.error('[Blacklist Add Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── DELETE /blacklist/:phone ─────────────────────────────────────────────────

fraud.delete('/blacklist/:phone', requireScope('fraud'), async (c) => {
  try {
    const phone   = normalizePhone(c.req.param('phone'));
    const storeId = c.var.apiKey.storeId;
    // Only remove from this store — NEVER touch global (store_id IS NULL)
    await c.env.DB.prepare(
      `DELETE FROM phone_blacklist WHERE phone_normalized = ? AND store_id = ?`
    ).bind(phone, storeId).run();
    return c.json({ removed: true });
  } catch (err) {
    console.error('[Blacklist Remove Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

export { fraud as fraudRouter };

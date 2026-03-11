/**
 * SMS Notification Routes — WooCommerce Power Layer
 * POST /api/v1/sms/send    — Send SMS (respects opt-out for marketing)
 * POST /api/v1/sms/opt-out — Add phone to SMS suppression list
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { createDb } from '~/lib/db.server';
import { sendSMS } from '~/services/messaging.server';

const smsWc = new Hono<{ Bindings: Env }>();

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

// ─── POST /send ───────────────────────────────────────────────────────────────

const SendSchema = z.object({
  phone: z.string().min(1),
  message: z.string().min(1).max(320),
  type: z.enum(['transactional', 'marketing']),
});

smsWc.post('/send', requireScope('sms'), async (c) => {
  try {
    const data = SendSchema.parse(await c.req.json());
    const storeId = c.var.apiKey.storeId;
    const phone = normalizePhone(data.phone);

    // Marketing SMS: check suppression list
    if (data.type === 'marketing') {
      const suppressionKey = `sms:optout:${storeId}:${phone}`;
      const isOptedOut = await c.env.KV!.get(suppressionKey);
      if (isOptedOut !== null) {
        return c.json({ sent: false, reason: 'opted_out' });
      }
    }

    // Integrate with messaging.server.ts for actual SMS delivery
    const db = createDb(c.env.DB);
    const msisdn = phone.startsWith('0') ? '88' + phone : phone;

    const smsRes = await sendSMS(db, c.env, {
      to: msisdn,
      message: data.message,
      storeId: Number(storeId),
    });

    const message_id = smsRes.messageId || `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[SMS] Store=${storeId} Phone=${msisdn} Type=${data.type} MsgId=${message_id} Success=${smsRes.success}`);
    console.log(`[SMS] Message: ${data.message}`);

    if (!smsRes.success) {
      return c.json({ sent: false, error: smsRes.error || 'gateway_error' }, 502);
    }

    // Log to D1 for analytics
    await c.env.DB.prepare(
      `INSERT INTO sms_logs (store_id, phone_normalized, message_type, message_id, sent_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(storeId, phone, data.type, message_id).run().catch(() => {
      // sms_logs table may not exist yet — non-fatal
    });

    return c.json({ sent: true, message_id });
  } catch (err) {
    if (err instanceof z.ZodError) return c.json({ error: 'validation_error', issues: err.errors }, 400);
    console.error('[SMS Send Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── POST /opt-out ────────────────────────────────────────────────────────────

smsWc.post('/opt-out', requireScope('sms'), async (c) => {
  try {
    const body = await c.req.json();
    const phone = normalizePhone(body.phone ?? '');
    const storeId = c.var.apiKey.storeId;

    if (phone.length !== 11) return c.json({ error: 'invalid_phone' }, 400);

    // Store in KV (no expiry — permanent opt-out)
    await c.env.KV!.put(`sms:optout:${storeId}:${phone}`, '1');

    // Also persist to D1
    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO sms_suppression_list (store_id, phone_normalized, source, opted_out_at)
       VALUES (?, ?, 'customer', unixepoch())`
    ).bind(storeId, phone).run();

    return c.json({ opted_out: true });
  } catch (err) {
    console.error('[SMS Opt-out Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

export { smsWc as smsWcRouter };

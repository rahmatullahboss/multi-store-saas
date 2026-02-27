/**
 * WooCommerce Webhook Receiver — WooCommerce Power Layer
 * POST /api/v1/wc/webhook        — Receive & verify WC events (HMAC-SHA256)
 * GET  /api/v1/wc/webhook/verify — Connection health check
 */

import { Hono } from 'hono';
const wcWebhook = new Hono<{ Bindings: Env }>();

// ─── HMAC-SHA256 Verification ─────────────────────────────────────────────────

async function verifyWcSignature(body: string, secret: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expected = btoa(String.fromCharCode(...new Uint8Array(signed)));
    return expected === signature;
  } catch {
    return false;
  }
}

// ─── POST /webhook ────────────────────────────────────────────────────────────

wcWebhook.post('/webhook', async (c) => {
  try {
    // Read raw body BEFORE any parsing (required for HMAC verification)
    const rawBody = await c.req.text();

    const signature = c.req.header('X-WC-Webhook-Signature') ?? '';
    const topic     = c.req.header('X-WC-Webhook-Topic') ?? '';
    const source    = c.req.header('X-WC-Webhook-Source') ?? '';

    // Get api key (set by middleware)
    const apiKey = c.var.apiKey;
    if (!apiKey) return c.json({ error: 'unauthorized' }, 401);

    const storeId = apiKey.storeId;

    // Get webhook secret from api_keys (middleware may not expose wcWebhookSecret)
    const keyRow = await c.env.DB.prepare(
      `SELECT wc_webhook_secret FROM api_keys WHERE id = ? LIMIT 1`
    ).bind(apiKey.id).first<{ wc_webhook_secret: string | null }>();

    const secret = keyRow?.wc_webhook_secret;
    if (!secret) {
      return c.json({ error: 'webhook_not_configured', message: 'Configure WC webhook secret in Ozzyl settings' }, 422);
    }

    // Verify HMAC-SHA256 signature
    const valid = await verifyWcSignature(rawBody, secret, signature);
    if (!valid) {
      console.warn(`[WC Webhook] Invalid signature for store ${storeId}`);
      return c.json({ error: 'invalid_signature' }, 401);
    }

    // Parse and store event
    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(rawBody); } catch { /* keep empty */ }

    const wcResourceId = String(payload?.id ?? payload?.order_id ?? '');

    await c.env.DB.prepare(
      `INSERT INTO wc_webhook_events (store_id, topic, wc_resource_id, payload, processed, created_at)
       VALUES (?, ?, ?, ?, 0, unixepoch())`
    ).bind(storeId, topic, wcResourceId || null, rawBody).run();

    // Log for debugging
    console.log(`[WC Webhook] Store=${storeId} Topic=${topic} Source=${source} Resource=${wcResourceId}`);

    return c.json({ received: true });
  } catch (err) {
    console.error('[WC Webhook Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ─── GET /webhook/verify ──────────────────────────────────────────────────────

wcWebhook.get('/webhook/verify', async (c) => {
  const apiKey = c.var.apiKey;
  if (!apiKey) return c.json({ error: 'unauthorized' }, 401);
  return c.json({ verified: true, store_id: apiKey.storeId });
});

export { wcWebhook as wcWebhookRouter };

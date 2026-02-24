/**
 * Ozzyl Guard — Shopify COD Fraud Detection
 * ==========================================
 * This Node.js script handles Shopify order webhooks and checks COD orders
 * against the Ozzyl Guard fraud detection API.
 *
 * SETUP:
 * 1. Deploy this as a Cloudflare Worker, Vercel function, or any Node.js server
 * 2. In Shopify Admin → Settings → Notifications → Webhooks:
 *    Add webhook: orders/create → https://your-domain.com/shopify-webhook
 * 3. Set environment variables:
 *    OZZYL_GUARD_API_KEY=og_live_xxxx   (from app.ozzyl.com/fdaas)
 *    SHOPIFY_WEBHOOK_SECRET=xxxx        (from Shopify webhook settings)
 *    SHOPIFY_ACCESS_TOKEN=xxxx          (for tagging orders back)
 *    SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
 *
 * RISK ACTIONS:
 *  - LOW/MEDIUM → tag order "ozzyl-low-risk", approve
 *  - HIGH       → tag order "ozzyl-high-risk", add note, cancel fulfillment
 *  - CRITICAL   → tag order "ozzyl-critical", cancel order
 */

import crypto from 'crypto';

// ── Config (set via env vars) ───────────────────────────────────────────────
const OZZYL_API_URL      = 'https://app.ozzyl.com/api/v1/fraud-check';
const OZZYL_API_KEY      = process.env.OZZYL_GUARD_API_KEY ?? '';
const SHOPIFY_SECRET     = process.env.SHOPIFY_WEBHOOK_SECRET ?? '';
const SHOPIFY_TOKEN      = process.env.SHOPIFY_ACCESS_TOKEN ?? '';
const SHOPIFY_DOMAIN     = process.env.SHOPIFY_SHOP_DOMAIN ?? '';
const RISK_THRESHOLD     = process.env.OZZYL_RISK_THRESHOLD ?? 'HIGH'; // 'MEDIUM' | 'HIGH' | 'CRITICAL'

// ── Shopify API helper ──────────────────────────────────────────────────────
async function shopifyRequest(endpoint, method = 'GET', body = null) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ── Verify Shopify HMAC signature ───────────────────────────────────────────
function verifyShopifyWebhook(rawBody, hmacHeader) {
  const digest = crypto
    .createHmac('sha256', SHOPIFY_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

// ── Call Ozzyl Guard API ────────────────────────────────────────────────────
async function checkFraud(phone, orderTotal, paymentMethod, shippingCity) {
  if (!OZZYL_API_KEY) {
    console.warn('[OzzylGuard] No API key configured — skipping fraud check');
    return null;
  }

  try {
    const res = await fetch(OZZYL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OZZYL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        order_total:      orderTotal,
        payment_method:   paymentMethod,
        shipping_address: shippingCity,
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!res.ok) {
      console.error('[OzzylGuard] API error:', res.status, await res.text());
      return null; // Fail open — never block orders due to API issues
    }

    return await res.json();
  } catch (err) {
    console.error('[OzzylGuard] Request failed:', err.message);
    return null; // Fail open
  }
}

// ── Tag a Shopify order ─────────────────────────────────────────────────────
async function tagOrder(orderId, existingTags, newTag, note = null) {
  const tags = existingTags
    ? `${existingTags}, ${newTag}`
    : newTag;

  const updateBody = { order: { id: orderId, tags } };
  if (note) {
    updateBody.order.note = note;
  }

  return shopifyRequest(`/orders/${orderId}.json`, 'PUT', updateBody);
}

// ── Cancel a Shopify order ──────────────────────────────────────────────────
async function cancelOrder(orderId, reason) {
  return shopifyRequest(`/orders/${orderId}/cancel.json`, 'POST', {
    reason: 'fraud',
    note: reason,
    restock: true,
    email: false, // Don't notify customer (avoids tipping off fraudster)
  });
}

// ── Main webhook handler ────────────────────────────────────────────────────
export async function handleShopifyWebhook(req, res) {
  // 1. Read raw body for HMAC verification
  const rawBody = await req.text?.() ?? JSON.stringify(await req.json());
  const hmac    = req.headers.get?.('x-shopify-hmac-sha256') ??
                  req.headers['x-shopify-hmac-sha256'];

  // 2. Verify webhook authenticity
  if (SHOPIFY_SECRET && !verifyShopifyWebhook(rawBody, hmac)) {
    console.warn('[OzzylGuard] Invalid HMAC — webhook rejected');
    return new Response('Unauthorized', { status: 401 });
  }

  const order = JSON.parse(rawBody);

  // 3. Only check COD orders (gateway = 'cash_on_delivery' or 'cod')
  const isCOD = ['cash_on_delivery', 'cod', 'manual'].includes(order.gateway ?? '');
  if (!isCOD) {
    console.log(`[OzzylGuard] Order #${order.order_number} skipped (not COD)`);
    return new Response('OK — not COD', { status: 200 });
  }

  // 4. Extract order details
  const phone        = order.billing_address?.phone ?? order.phone ?? '';
  const orderTotal   = parseFloat(order.total_price ?? '0');
  const shippingCity = order.shipping_address?.city ?? '';
  const existingTags = order.tags ?? '';

  if (!phone) {
    console.warn(`[OzzylGuard] Order #${order.order_number} has no phone number`);
    return new Response('OK — no phone', { status: 200 });
  }

  // 5. Call Ozzyl Guard
  const result = await checkFraud(phone, orderTotal, 'cod', shippingCity);

  if (!result?.success) {
    console.warn(`[OzzylGuard] API unavailable for order #${order.order_number} — allowing`);
    return new Response('OK — API unavailable', { status: 200 });
  }

  const { risk_level, risk_score, decision, signals = [] } = result;
  const signalTypes = signals.map(s => s.type).join(', ');

  console.log(`[OzzylGuard] Order #${order.order_number} | Risk: ${risk_level} (${risk_score}/100) | Decision: ${decision}`);

  // 6. Risk levels in severity order
  const LEVELS        = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const orderRisk     = LEVELS[risk_level]    ?? 1;
  const minRisk       = LEVELS[RISK_THRESHOLD] ?? 3;

  if (risk_level === 'CRITICAL') {
    // Cancel immediately
    const cancelNote = `Ozzyl Guard: CRITICAL fraud risk (${risk_score}/100). Signals: ${signalTypes}`;
    await Promise.all([
      cancelOrder(order.id, cancelNote),
      tagOrder(order.id, existingTags, 'ozzyl-critical', cancelNote),
    ]);
    console.log(`[OzzylGuard] Order #${order.order_number} CANCELLED — critical fraud risk`);

  } else if (orderRisk >= minRisk) {
    // Flag / hold
    const note = `Ozzyl Guard: ${risk_level} fraud risk (${risk_score}/100). Signals: ${signalTypes}. Manual review required.`;
    await tagOrder(order.id, existingTags, `ozzyl-${risk_level.toLowerCase()}`, note);
    console.log(`[OzzylGuard] Order #${order.order_number} FLAGGED — ${risk_level} risk`);

  } else {
    // Low risk — just tag it for audit trail
    await tagOrder(order.id, existingTags, 'ozzyl-verified');
    console.log(`[OzzylGuard] Order #${order.order_number} APPROVED — low risk`);
  }

  return new Response('OK', { status: 200 });
}

// ── Cloudflare Worker entry point ───────────────────────────────────────────
export default {
  async fetch(request, env) {
    // Set env vars from Cloudflare Worker secrets
    process.env.OZZYL_GUARD_API_KEY    = env.OZZYL_GUARD_API_KEY;
    process.env.SHOPIFY_WEBHOOK_SECRET = env.SHOPIFY_WEBHOOK_SECRET;
    process.env.SHOPIFY_ACCESS_TOKEN   = env.SHOPIFY_ACCESS_TOKEN;
    process.env.SHOPIFY_SHOP_DOMAIN    = env.SHOPIFY_SHOP_DOMAIN;

    const url = new URL(request.url);

    if (url.pathname === '/shopify-webhook' && request.method === 'POST') {
      return handleShopifyWebhook(request);
    }

    return new Response('Ozzyl Guard Webhook — OK', { status: 200 });
  },
};

// ── Express.js entry point (alternative) ───────────────────────────────────
// Uncomment if using Express instead of Cloudflare Workers:
//
// import express from 'express';
// const app = express();
// app.use(express.raw({ type: 'application/json' }));
// app.post('/shopify-webhook', async (req, res) => {
//   const result = await handleShopifyWebhook({
//     text: async () => req.body.toString(),
//     headers: { get: (k) => req.headers[k] },
//   });
//   res.status(result.status).send(await result.text());
// });
// app.listen(3000, () => console.log('Ozzyl Guard webhook listening on :3000'));

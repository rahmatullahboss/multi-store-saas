/**
 * server/api/shopify-app/webhooks.ts — Shopify Webhook Handler
 *
 * Receives and verifies Shopify webhooks.
 *   POST /api/shopify-app/webhooks
 *
 * Security:
 *  - HMAC-SHA256 verification via X-Shopify-Hmac-Sha256 header
 *  - Timing-safe comparison to prevent timing attacks
 *
 * Mandatory GDPR webhooks handled:
 *  - customers/data_request  — customer data export request
 *  - customers/redact        — customer PII deletion request
 *  - shop/redact             — shop data deletion (48h after uninstall)
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, inArray, and } from 'drizzle-orm';
import { shopifyInstallations, orders as ordersTable } from '@db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shopify webhook topic header value */
type ShopifyWebhookTopic =
  | 'customers/data_request'
  | 'customers/redact'
  | 'shop/redact'
  | 'app/uninstalled'
  | 'orders/create'
  | 'orders/updated'
  | 'orders/cancelled'
  | 'products/create'
  | 'products/update'
  | 'products/delete'
  | string; // allow any topic for forward-compat

/** GDPR customers/data_request payload */
interface CustomerDataRequestPayload {
  shop_id: number;
  shop_domain: string;
  customer: { id: number; email: string; phone?: string };
  orders_requested: number[];
}

/** GDPR customers/redact payload */
interface CustomerRedactPayload {
  shop_id: number;
  shop_domain: string;
  customer: { id: number; email: string; phone?: string };
  orders_to_redact: number[];
}

/** GDPR shop/redact payload */
interface ShopRedactPayload {
  shop_id: number;
  shop_domain: string;
}

/** app/uninstalled payload */
interface AppUninstalledPayload {
  id: number;
  domain: string;
}

// ─── HMAC Verification ────────────────────────────────────────────────────────

/**
 * Verifies the Shopify webhook HMAC-SHA256 signature.
 *
 * Shopify signs the raw request body with the app's client secret
 * and sends the base64-encoded signature in X-Shopify-Hmac-Sha256.
 *
 * @param rawBody      - Raw request body bytes
 * @param headerHmac   - Base64 HMAC from X-Shopify-Hmac-Sha256 header
 * @param clientSecret - Shopify App client secret
 * @returns true if signature is valid
 */
export async function verifyWebhookHmac(
  rawBody: ArrayBuffer,
  headerHmac: string,
  clientSecret: string
): Promise<boolean> {
  const encoder = new TextEncoder();

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(clientSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  } catch {
    return false;
  }

  const signature = await crypto.subtle.sign('HMAC', key, rawBody);

  // Base64-encode the computed HMAC
  const computed = btoa(String.fromCharCode(...new Uint8Array(signature)));

  // Timing-safe comparison
  const a = encoder.encode(computed);
  const b = encoder.encode(headerHmac);
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ─── Topic Handlers ───────────────────────────────────────────────────────────

/**
 * Handle GDPR customers/data_request webhook.
 * Merchants must respond within 30 days with a data export.
 * For now we log the request — a full implementation would queue a data export job.
 */
async function handleCustomerDataRequest(
  payload: CustomerDataRequestPayload,
  _db: ReturnType<typeof drizzle>
): Promise<void> {
  // Acknowledge receipt — full data export would be queued via Durable Objects or Queue
  console.log(JSON.stringify({
    level: 'info',
    msg: 'gdpr_customer_data_request_received',
    shop: payload.shop_domain,
    customerId: payload.customer.id,
    ordersRequested: payload.orders_requested?.length ?? 0,
    ts: new Date().toISOString(),
  }));
  // TODO: Queue a data export job via Durable Objects or Queue
}

/**
 * Handle GDPR customers/redact webhook.
 * Must delete or anonymize all customer PII within 30 days.
 */
async function handleCustomerRedact(
  payload: CustomerRedactPayload,
  db: ReturnType<typeof drizzle>
): Promise<void> {
  const { orders_to_redact } = payload;

  const installation = await db
    .select({ storeId: shopifyInstallations.storeId })
    .from(shopifyInstallations)
    .where(eq(shopifyInstallations.shopDomain, payload.shop_domain))
    .limit(1);

  const storeId = installation[0]?.storeId;
  if (storeId == null) {
    console.warn(JSON.stringify({
      level: 'warn',
      msg: 'gdpr_customer_redact_missing_installation',
      shop: payload.shop_domain,
    }));
    return;
  }

  if (orders_to_redact && orders_to_redact.length > 0) {
    await db.update(ordersTable)
      .set({
        customerName: 'REDACTED',
        customerEmail: 'redacted@deleted.invalid',
        customerPhone: null,
      })
      .where(and(
        eq(ordersTable.storeId, storeId),
        inArray(ordersTable.id, orders_to_redact)
      ));
  }
  console.log(JSON.stringify({ level: 'info', msg: 'gdpr_customer_redacted', shop: payload.shop_domain, orderCount: orders_to_redact?.length ?? 0 }));
}

/**
 * Handle GDPR shop/redact webhook.
 * Fired 48h after a merchant uninstalls the app.
 * Must delete all shop data.
 */
async function handleShopRedact(
  payload: ShopRedactPayload,
  db: ReturnType<typeof drizzle>
): Promise<void> {
  // Look up the store linked to this Shopify shop, then anonymize all its orders.
  const installation = await db
    .select({ storeId: shopifyInstallations.storeId })
    .from(shopifyInstallations)
    .where(eq(shopifyInstallations.shopDomain, payload.shop_domain))
    .limit(1);

  const storeId = installation[0]?.storeId;
  if (storeId != null) {
    await db.update(ordersTable)
      .set({
        customerName: 'REDACTED',
        customerEmail: 'redacted@deleted.invalid',
        customerPhone: null,
      })
      .where(eq(ordersTable.storeId, storeId));
  }

  console.log(JSON.stringify({ level: 'info', msg: 'gdpr_shop_redacted', shop: payload.shop_domain, shopId: payload.shop_id }));
}

/**
 * Handle app/uninstalled webhook.
 * Marks the installation as uninstalled in D1.
 */
async function handleAppUninstalled(
  payload: AppUninstalledPayload,
  db: ReturnType<typeof drizzle>
): Promise<void> {
  const shopDomain = payload.domain;
  await db
    .update(shopifyInstallations)
    .set({ uninstalledAt: new Date() })
    .where(eq(shopifyInstallations.shopDomain, shopDomain));

  console.log(JSON.stringify({
    level: 'info',
    msg: 'shopify_app_uninstalled',
    shopDomain,
    shopId: payload.id,
    ts: new Date().toISOString(),
  }));
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const webhooksRouter = new Hono<{ Bindings: Env }>();

// ─── POST /webhooks ───────────────────────────────────────────────────────────

/**
 * Receive and process Shopify webhooks.
 *
 * All webhooks are HMAC-verified before processing.
 * Returns 200 immediately — processing is best-effort async.
 *
 * @header X-Shopify-Hmac-Sha256  - HMAC-SHA256 base64 signature
 * @header X-Shopify-Topic        - Webhook topic (e.g. orders/create)
 * @header X-Shopify-Shop-Domain  - Source shop domain
 */
webhooksRouter.post('/', async (c) => {
  const hmacHeader = c.req.header('X-Shopify-Hmac-Sha256');
  const topic = c.req.header('X-Shopify-Topic') as ShopifyWebhookTopic | undefined;
  const shopDomain = c.req.header('X-Shopify-Shop-Domain');

  // ── Validate required headers ───────────────────────────────────────────────
  if (!hmacHeader || !topic || !shopDomain) {
    return c.json(
      { success: false, error: 'missing_headers', message: 'X-Shopify-Hmac-Sha256, X-Shopify-Topic, and X-Shopify-Shop-Domain are required' },
      400
    );
  }

  const clientSecret = c.env.SHOPIFY_CLIENT_SECRET;
  if (!clientSecret) {
    console.error('[Shopify Webhooks] Missing SHOPIFY_CLIENT_SECRET');
    return c.json({ success: false, error: 'server_error', message: 'App not configured' }, 500);
  }

  // ── Read raw body for HMAC verification ────────────────────────────────────
  // Must read raw bytes before any JSON parsing
  const rawBody = await c.req.arrayBuffer();

  // ── Verify HMAC ────────────────────────────────────────────────────────────
  const isValid = await verifyWebhookHmac(rawBody, hmacHeader, clientSecret);
  if (!isValid) {
    console.warn(JSON.stringify({
      level: 'warn',
      msg: 'shopify_webhook_hmac_failed',
      topic,
      shopDomain,
      ts: new Date().toISOString(),
    }));
    return c.json(
      { success: false, error: 'invalid_hmac', message: 'HMAC verification failed' },
      401
    );
  }

  // ── Parse JSON body ────────────────────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    const text = new TextDecoder().decode(rawBody);
    payload = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return c.json(
      { success: false, error: 'invalid_body', message: 'Request body must be valid JSON' },
      400
    );
  }

  // ── Dispatch to topic handler ──────────────────────────────────────────────
  const db = drizzle(c.env.DB);

  // Use waitUntil so we return 200 immediately while processing async
  c.executionCtx.waitUntil(
    (async () => {
      try {
        switch (topic) {
          case 'customers/data_request':
            await handleCustomerDataRequest(payload as unknown as CustomerDataRequestPayload, db);
            break;

          case 'customers/redact':
            await handleCustomerRedact(payload as unknown as CustomerRedactPayload, db);
            break;

          case 'shop/redact':
            await handleShopRedact(payload as unknown as ShopRedactPayload, db);
            break;

          case 'app/uninstalled':
            await handleAppUninstalled(payload as unknown as AppUninstalledPayload, db);
            break;

          default:
            // Log unhandled topics for observability — do not error
            console.log(JSON.stringify({
              level: 'info',
              msg: 'shopify_webhook_unhandled_topic',
              topic,
              shopDomain,
              ts: new Date().toISOString(),
            }));
        }
      } catch (err) {
        console.error(JSON.stringify({
          level: 'error',
          msg: 'shopify_webhook_handler_error',
          topic,
          shopDomain,
          error: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString(),
        }));
      }
    })()
  );

  // Always return 200 to Shopify immediately
  return c.json({ success: true, received: true });
});

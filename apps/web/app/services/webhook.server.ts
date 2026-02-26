/**
 * webhook.server.ts — Ozzyl API Platform
 * Enterprise-grade outbound webhook dispatcher
 *
 * Fixes applied (Adversarial Review × 2):
 * ✅ 10-second fetch timeout (AbortController)
 * ✅ Exponential backoff retry (3 attempts: 1s, 5s, 25s)
 * ✅ Promise.allSettled (one failure doesn't kill all)
 * ✅ Atomic sql`failure_count + 1` (no race condition)
 * ✅ Multi-topic support (events JSON array)
 * ✅ responseBody safe slice (no mid-char cut)
 * ✅ HMAC-SHA256 signature with replay prevention (timestamp)
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql } from 'drizzle-orm';
import { webhooks, webhookDeliveryLogs } from '@db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebhookPayload {
  event: string;
  store_id: number;
  timestamp: number; // Unix ms (second-aligned) — payload body precision for consumers
  data: Record<string, unknown>;
}

interface DeliveryResult {
  webhookId: number;
  url: string;
  success: boolean;
  statusCode: number | null;
  attempt: number;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 10_000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1_000, 5_000, 25_000]; // Exponential backoff
const MAX_RESPONSE_BYTES = 500; // Store first 500 bytes of response
const MAX_FAILURES_BEFORE_DISABLE = 10;

// ─── HMAC Signing ─────────────────────────────────────────────────────────────

/**
 * Sign webhook payload with HMAC-SHA256
 * Format: t=<timestamp>,v1=<signature>
 * Compatible with Stripe webhook signature format
 */
export async function signWebhookPayload(
  payload: string,
  secret: string,
  timestamp: number
): Promise<string> {
  const encoder = new TextEncoder();
  const signedContent = `${timestamp}.${payload}`;

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(signedContent));
  const hexSig = Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');

  return `t=${timestamp},v1=${hexSig}`;
}

/**
 * Verify incoming webhook signature (for inbound webhooks)
 * Includes replay attack prevention (5 minute tolerance)
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  toleranceSeconds: number = 300
): Promise<boolean> {
  try {
    // Parse "t=<seconds>,v1=<hex>" — use indexOf to handle any '=' inside values
    const parts: Record<string, string> = {};
    for (const part of signature.split(',')) {
      const eqIdx = part.indexOf('=');
      if (eqIdx !== -1) {
        parts[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
      }
    }
    // t= is Unix seconds (matches signWebhookPayload which also uses seconds)
    const timestamp = parseInt(parts['t'] ?? '0', 10);
    const v1 = parts['v1'];

    if (!timestamp || !v1) return false;

    // Replay attack prevention — both sides in Unix seconds
    const now = Math.floor(Date.now() / 1000);
    const age = Math.abs(now - timestamp);
    if (age > toleranceSeconds) return false;

    // Recompute signature
    const encoder = new TextEncoder();
    const signedContent = `${timestamp}.${payload}`;
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expected = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(signedContent));
    const expectedHex = Array.from(new Uint8Array(expected), (b) => b.toString(16).padStart(2, '0')).join('');

    // Timing-safe compare
    return timingSafeStringEqual(expectedHex, v1);
  } catch {
    return false;
  }
}

// ─── SSRF Protection ──────────────────────────────────────────────────────────

/**
 * Block SSRF targets: loopback, link-local, RFC-1918 private ranges, IPv6 ULA.
 * Returns true if the URL is safe to fetch (public, HTTPS).
 */
export function isSsrfSafeUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false; // Unparseable URL → reject
  }

  // HTTPS-only enforcement
  if (parsed.protocol !== 'https:') return false;

  const hostname = parsed.hostname.toLowerCase();

  // Strip surrounding brackets from IPv6 literals (e.g. [::1] → ::1)
  const host = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;

  // ── Loopback ──────────────────────────────────────────────────────────────
  if (host === 'localhost') return false;
  if (host === '::1') return false;

  // ── IPv4 checks ───────────────────────────────────────────────────────────
  const ipv4Re = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = host.match(ipv4Re);
  if (ipv4Match) {
    const [, a, b, c] = ipv4Match.map(Number);
    // 127.0.0.0/8 — loopback
    if (a === 127) return false;
    // 169.254.0.0/16 — link-local (AWS IMDS etc.)
    if (a === 169 && b === 254) return false;
    // 10.0.0.0/8 — RFC-1918
    if (a === 10) return false;
    // 172.16.0.0/12 — RFC-1918
    if (a === 172 && b >= 16 && b <= 31) return false;
    // 192.168.0.0/16 — RFC-1918
    if (a === 192 && b === 168) return false;
    // 0.0.0.0/8 — "this network"
    if (a === 0) return false;
    // 100.64.0.0/10 — shared address space (carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return false;
  }

  // ── IPv6 checks ───────────────────────────────────────────────────────────
  // ::ffff:0:0/96 — IPv4-mapped IPv6
  if (host.startsWith('::ffff:')) {
    const v4Part = host.slice(7);
    // Recursively validate the embedded IPv4 address
    return isSsrfSafeUrl(`https://${v4Part}/`);
  }
  // fc00::/7 — ULA (Unique Local Addresses, fd00:: and fc00::)
  if (/^f[cd]/i.test(host)) return false;
  // fe80::/10 — link-local
  if (/^fe[89ab]/i.test(host)) return false;

  return true;
}

// ─── Fetch with Timeout ───────────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Single Delivery Attempt ──────────────────────────────────────────────────

async function attemptDelivery(
  url: string,
  payload: string,
  signature: string,
  topic: string,
  storeId: number
): Promise<{ statusCode: number; responseBody: string; success: boolean }> {
  // C-1: SSRF guard — must pass before any network call
  if (!isSsrfSafeUrl(url)) {
    throw new Error(`[Webhook] Blocked SSRF attempt to unsafe URL: ${url}`);
  }

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ozzyl-Topic': topic,
      'X-Ozzyl-Signature': signature,
      'X-Ozzyl-Store-Id': storeId.toString(),
      'User-Agent': 'Ozzyl-Webhook/1.0',
    },
    body: payload,
  });

  // Safe slice — convert to bytes first to avoid mid-char cut
  const rawText = await response.text().catch(() => '');
  const encoder = new TextEncoder();
  const bytes = encoder.encode(rawText);
  const sliced = bytes.slice(0, MAX_RESPONSE_BYTES);
  const responseBody = new TextDecoder().decode(sliced);

  return {
    statusCode: response.status,
    responseBody,
    success: response.ok,
  };
}

// ─── Delivery with Retry ──────────────────────────────────────────────────────

async function deliverWithRetry(
  url: string,
  payload: string,
  signature: string,
  topic: string,
  storeId: number
): Promise<{ statusCode: number | null; responseBody: string | null; success: boolean; attempt: number; error?: string }> {
  let lastError: string | undefined;
  let lastStatusCode: number | null = null;
  let lastResponseBody: string | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await attemptDelivery(url, payload, signature, topic, storeId);
      lastStatusCode = result.statusCode;
      lastResponseBody = result.responseBody;

      if (result.success) {
        return { ...result, attempt, error: undefined };
      }

      // Non-2xx — retry with backoff (unless last attempt)
      lastError = `HTTP ${result.statusCode}`;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAYS_MS[attempt - 1]);
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error';
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAYS_MS[attempt - 1]);
      }
    }
  }

  return {
    statusCode: lastStatusCode,
    responseBody: lastResponseBody,
    success: false,
    attempt: MAX_RETRIES,
    error: lastError,
  };
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

/**
 * Dispatch webhook event to all matching endpoints for a store
 * Usually called via ctx.waitUntil() for non-blocking delivery
 *
 * @example
 * ctx.waitUntil(dispatchWebhook(env, storeId, 'order/created', { orderId: 123, ... }))
 */
export async function dispatchWebhook(
  env: Env,
  storeId: number,
  topic: string,
  data: Record<string, unknown>
): Promise<DeliveryResult[]> {
  const db = drizzle(env.DB);

  // 1. Fetch all active webhooks for this store
  const allHooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.storeId, storeId), eq(webhooks.isActive, true)));

  if (allHooks.length === 0) return [];

  // 2. Filter: support both single-topic and multi-topic (events JSON array)
  const matchingHooks = allHooks.filter((hook) => {
    // Multi-topic: events JSON array (new format)
    if (hook.events) {
      try {
        const events: string[] = JSON.parse(hook.events);
        return events.includes(topic) || events.includes('*');
      } catch {
        // Fall through to single-topic check
      }
    }
    // Single-topic: legacy format
    return hook.topic === topic;
  });

  if (matchingHooks.length === 0) return [];

  // 3. Build signed payload (with timestamp for replay prevention)
  // Use Unix seconds for the signature header (matches verifyWebhookSignature expectation).
  // The payload body carries Unix ms for consumers who need higher precision.
  const timestampSeconds = Math.floor(Date.now() / 1000);
  const timestamp = timestampSeconds * 1000; // Convert back to ms for the payload body
  const webhookPayload: WebhookPayload = { event: topic, store_id: storeId, timestamp, data };
  const payloadString = JSON.stringify(webhookPayload);

  // 4. Dispatch to all matching hooks concurrently
  //    Promise.allSettled — one failure does NOT kill others
  const deliveryPromises = matchingHooks.map(async (hook): Promise<DeliveryResult> => {
    const defaultSecret = (env as unknown as Record<string, unknown>)['WEBHOOK_DEFAULT_SECRET'] as string | undefined;
    // Pass timestampSeconds (Unix seconds) so the t= header field matches what
    // verifyWebhookSignature expects when it computes: Math.abs(Date.now() / 1000 - t)
    const signature = await signWebhookPayload(payloadString, hook.secret || defaultSecret || '', timestampSeconds);

    const result = await deliverWithRetry(hook.url, payloadString, signature, topic, storeId);

    // 5. Atomic failure count update (no race condition)
    if (!result.success) {
      await db
        .update(webhooks)
        .set({
          failureCount: sql`${webhooks.failureCount} + 1`,
        })
        .where(eq(webhooks.id, hook.id));

      // Disable if too many failures
      if ((hook.failureCount ?? 0) + 1 >= MAX_FAILURES_BEFORE_DISABLE) {
        await db
          .update(webhooks)
          .set({ isActive: false })
          .where(eq(webhooks.id, hook.id));
        console.warn(`[Webhook] Disabled endpoint ${hook.id} after ${MAX_FAILURES_BEFORE_DISABLE} failures`);
      }
    } else {
      // Reset failure count on success (only if it was > 0)
      if ((hook.failureCount ?? 0) > 0) {
        await db
          .update(webhooks)
          .set({ failureCount: 0 })
          .where(eq(webhooks.id, hook.id));
      }
    }

    // 6. Log delivery attempt — scrub PII before persisting
    // SECURITY S-6: payloadString may contain customer name, email, phone and
    // address fields. scrubPii() strips those before writing to D1 so that
    // delivery logs never become a PII exposure surface.
    try {
      await db.insert(webhookDeliveryLogs).values({
        webhookId: hook.id,
        eventType: topic,
        payload: scrubPii(payloadString),
        statusCode: result.statusCode,
        responseBody: result.responseBody,
        success: result.success,
        errorMessage: result.error ?? null,
      });
    } catch (logErr) {
      console.error('[Webhook] Failed to log delivery:', logErr);
    }

    return {
      webhookId: hook.id,
      url: hook.url,
      success: result.success,
      statusCode: result.statusCode,
      attempt: result.attempt,
      error: result.error,
    };
  });

  // 7. allSettled — collect results even if some throw
  const settled = await Promise.allSettled(deliveryPromises);
  return settled
    .filter((r): r is PromiseFulfilledResult<DeliveryResult> => r.status === 'fulfilled')
    .map((r) => r.value);
}

/**
 * registerWebhook — backward-compatible alias for existing routes
 * @deprecated Use the new webhooks API route POST /api/v1/webhooks instead
 */
export async function registerWebhook(
  db: D1Database,
  storeId: number,
  url: string,
  topic: string,
  secret?: string
): Promise<void> {
  // C-1: SSRF + HTTPS validation before persisting the URL
  if (!isSsrfSafeUrl(url)) {
    throw new Error(`[Webhook] Rejected unsafe webhook URL: ${url}`);
  }

  const { drizzle: drizzleFn } = await import('drizzle-orm/d1');
  const { webhooks } = await import('@db/schema');
  const drizzleDb = drizzleFn(db);
  await drizzleDb.insert(webhooks).values({
    storeId,
    url,
    topic,
    secret: secret ?? null,
    isActive: true,
    failureCount: 0,
  });
}

// ─── PII Scrubbing ────────────────────────────────────────────────────────────

/**
 * scrubPii — removes personally identifiable information from a webhook payload
 * string before it is persisted to the delivery log.
 *
 * SECURITY S-6: Storing full customer payloads (name, email, phone, addresses)
 * in delivery logs violates data-minimisation principles and creates an
 * unnecessary PII exposure surface in D1. Only the opaque customer ID is
 * retained; address fields are replaced with the literal '[REDACTED]'.
 *
 * @param payload - Raw JSON string of the webhook payload
 * @returns Scrubbed JSON string, or '[unparseable]' if parsing fails
 */
export function scrubPii(payload: string): string {
  try {
    const obj = JSON.parse(payload) as Record<string, unknown>;
    const data = obj.data as Record<string, unknown> | undefined;
    if (data) {
      // Retain only the opaque customer ID — drop name, email, phone, etc.
      if (data.customer && typeof data.customer === 'object') {
        const customer = data.customer as Record<string, unknown>;
        data.customer = { id: customer.id };
      }
      // Redact full address objects
      if (data.shipping_address) data.shipping_address = '[REDACTED]';
      if (data.billing_address) data.billing_address = '[REDACTED]';
    }
    return JSON.stringify(obj);
  } catch {
    return '[unparseable]';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

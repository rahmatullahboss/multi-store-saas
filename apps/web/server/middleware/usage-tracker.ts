/**
 * usage-tracker.ts — Ozzyl API Platform
 * Hono middleware: non-blocking API usage tracking
 *
 * Uses Cloudflare Analytics Engine for high-throughput tracking
 * Falls back to batched KV counters (approximate, non-atomic tradeoff acknowledged)
 *
 * TRADEOFF NOTE (acknowledged in master plan):
 * KV fallback uses read-modify-write which is NOT atomic.
 * Under high concurrency, some increments may be lost (~1-2%).
 * This is acceptable for usage analytics (not billing-critical).
 * For billing-critical counting, use Durable Objects or Analytics Engine.
 *
 * wrangler.toml binding required for Analytics Engine:
 * [[analytics_engine_datasets]]
 * binding = "ANALYTICS"
 * dataset = "ozzyl_api_usage"
 */

import type { MiddlewareHandler } from 'hono';
import type { ValidatedApiKey } from '~/services/api.server';

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * usageTracker middleware
 * Non-blocking — uses ctx.waitUntil so it never slows down the response
 * Must run AFTER apiKeyAuth (needs c.var.apiKey)
 *
 * @example
 * v1.use('*', apiKeyAuth(), rateLimitMiddleware(), usageTracker())
 */
export function usageTracker(): MiddlewareHandler {
  return async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    const apiKey: ValidatedApiKey | undefined = c.var.apiKey;
    if (!apiKey) return;

    const event: UsageEvent = {
      storeId: apiKey.storeId,
      keyId: apiKey.id,
      planId: apiKey.planId,
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      statusCode: c.res.status,
      durationMs: duration,
      timestamp: Date.now(),
    };

    // Non-blocking — never delays the response
    c.executionCtx.waitUntil(trackUsage(c.env, event));
  };
}

// ─── Event Type ───────────────────────────────────────────────────────────────

interface UsageEvent {
  storeId: number;
  keyId: number;
  planId: number | null;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

// ─── Tracking Implementation ──────────────────────────────────────────────────

async function trackUsage(env: Env, event: UsageEvent): Promise<void> {
  // ── Attempt 1: Cloudflare Analytics Engine (recommended, high-throughput) ──
  const analytics = (env as unknown as Record<string, unknown>)['ANALYTICS'] as AnalyticsEngineDataset | undefined;
  if (analytics) {
    try {
      analytics.writeDataPoint({
        blobs: [
          event.method,
          event.path,
          String(event.statusCode),
          String(event.storeId),
          String(event.keyId),
        ],
        doubles: [event.durationMs, event.timestamp],
        indexes: [String(event.storeId)],
      });
      return; // Analytics Engine handled it
    } catch (err) {
      console.warn('[UsageTracker] Analytics Engine write failed, falling back to KV:', err);
    }
  }

  // ── Fallback: KV batch counters (approximate) ──
  // See TRADEOFF NOTE above — ~1-2% loss acceptable for analytics
  try {
    const dayWindow = currentDayWindow();
    const hourWindow = currentHourWindow();

    const keys = {
      storeDay:  `usage:store:${event.storeId}:day:${dayWindow}`,
      storeHour: `usage:store:${event.storeId}:hour:${hourWindow}`,
      keyDay:    `usage:key:${event.keyId}:day:${dayWindow}`,
    };

    // Batch KV reads
    // Use STORE_CACHE KV namespace (available in TenantEnv)
    const kv = (env as unknown as Record<string, unknown>)['STORE_CACHE'] as KVNamespace | undefined;
    if (!kv) return; // No KV available — skip tracking

    const [storeDay, storeHour, keyDay] = await Promise.all([
      kv.get(keys.storeDay),
      kv.get(keys.storeHour),
      kv.get(keys.keyDay),
    ]);

    // Batch KV writes (approximate increment)
    await Promise.all([
      kv.put(keys.storeDay,  String((storeDay  ? parseInt(storeDay,  10) : 0) + 1), { expirationTtl: 172_800 }),
      kv.put(keys.storeHour, String((storeHour ? parseInt(storeHour, 10) : 0) + 1), { expirationTtl: 7_200 }),
      kv.put(keys.keyDay,    String((keyDay    ? parseInt(keyDay,    10) : 0) + 1), { expirationTtl: 172_800 }),
    ]);
  } catch (err) {
    // Non-critical — log and swallow
    console.warn('[UsageTracker] KV fallback failed:', err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentDayWindow(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function currentHourWindow(): string {
  const d = new Date();
  return `${currentDayWindow()}T${String(d.getUTCHours()).padStart(2, '0')}`;
}

// ─── TypeScript: Analytics Engine type ───────────────────────────────────────

interface AnalyticsEngineDataset {
  writeDataPoint(data: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
}

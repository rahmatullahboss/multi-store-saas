/**
 * POST /api/builder/analytics
 *
 * Public ingestion endpoint for published page analytics events.
 * Called from the analytics snippet injected into published pages.
 *
 * Security layers:
 *   1. HMAC-SHA256 token validation (daily rotating)
 *   2. KV rate limit: 100 events per page per minute
 *   3. Max 50 events per request body
 *   4. Visitor hashed — raw IP never stored
 *   5. All D1 writes done in a single batch call
 *
 * Always returns 200 (even on partial failure) so the published page
 * script never surfaces errors to end visitors.
 */

import { type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { z } from 'zod';
import { validateAnalyticsToken, hashVisitor } from '~/lib/analytics/analytics.server';

// ── Validation schemas ────────────────────────────────────────────────────────

const EventSchema = z.object({
  type: z.enum(['pageview', 'section_view', 'cta_click', 'form_submit', 'scroll_depth']),
  sessionId: z.string().min(1).max(128),
  sectionId: z.string().max(128).optional(),
  sectionType: z.string().max(64).optional(),
  scrollDepth: z.number().int().min(0).max(100).optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  referrer: z.string().max(2048).optional(),
});

const IngestionSchema = z.object({
  pageId: z.string().min(1).max(128),
  storeId: z.number().int().positive(),
  token: z.string().min(1),
  events: z.array(EventSchema).min(1).max(50),
});

type ValidatedEvent = z.infer<typeof EventSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * KV rate limit: max `limit` events per page per `windowSecs` seconds.
 * Returns true if the request is allowed.
 */
async function checkRateLimit(
  kv: KVNamespace,
  pageId: string,
  eventCount: number,
  limit = 100,
  windowSecs = 60
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSecs) * windowSecs;
  const key = `analytics_rl:${pageId}:${windowStart}`;

  const raw = await kv.get(key);
  const current = raw ? parseInt(raw, 10) : 0;

  if (current + eventCount > limit) return false;

  await kv.put(key, String(current + eventCount), { expirationTtl: windowSecs * 2 });
  return true;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function action({ request, context }: ActionFunctionArgs) {
  // Always return 200 on any non-security failure — never break published pages
  const ok = () => json({ ok: true }, { status: 200 });

  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  const env = context.cloudflare.env;

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ok(); // Malformed JSON — silently ignore
  }

  const parsed = IngestionSchema.safeParse(body);
  if (!parsed.success) {
    return ok(); // Validation failure — silently ignore (don't expose schema)
  }

  const { pageId, storeId, token, events } = parsed.data;

  // ── HMAC token validation ────────────────────────────────────────────────────
  const analyticsSecret = env.ANALYTICS_SECRET || '';
  if (!analyticsSecret) {
    // Secret not configured — reject with 403 to alert operators
    return json({ ok: false, error: 'Analytics not configured' }, { status: 403 });
  }

  const tokenValid = await validateAnalyticsToken(token, pageId, storeId, analyticsSecret);
  if (!tokenValid) {
    return json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  // ── KV rate limit ────────────────────────────────────────────────────────────
  const kv = env.STORE_CACHE;
  if (kv) {
    const allowed = await checkRateLimit(kv, pageId, events.length);
    if (!allowed) {
      return json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
  }

  // ── Enrich events with server-side data ──────────────────────────────────────
  const ip = getClientIP(request);
  const ua = request.headers.get('User-Agent') || '';
  const country = request.headers.get('CF-IPCountry') || null;
  const today = getTodayUTC();

  const visitorId = await hashVisitor(ip, ua);

  // ── Build D1 batch statements ─────────────────────────────────────────────────
  const db = env.DB;
  const statements: D1PreparedStatement[] = [];

  // 1. Insert raw events
  for (const evt of events) {
    statements.push(
      db
        .prepare(
          `INSERT INTO builder_page_events
             (page_id, store_id, event_type, session_id, visitor_id,
              section_id, section_type, scroll_depth,
              device_type, referrer, country)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          pageId,
          storeId,
          evt.type,
          evt.sessionId,
          visitorId,
          evt.sectionId ?? null,
          evt.sectionType ?? null,
          evt.scrollDepth ?? null,
          evt.deviceType,
          evt.referrer ?? null,
          country
        )
    );
  }

  // 2. Upsert daily aggregate stats
  //    Count event types from this batch
  const counts = tallyEventCounts(events);

  statements.push(
    db
      .prepare(
        `INSERT INTO builder_page_daily_stats
           (page_id, store_id, date,
            total_views, unique_visitors,
            mobile_views, tablet_views, desktop_views,
            avg_scroll_depth, cta_clicks, form_submits)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(page_id, date) DO UPDATE SET
           total_views      = total_views      + excluded.total_views,
           unique_visitors  = unique_visitors  + excluded.unique_visitors,
           mobile_views     = mobile_views     + excluded.mobile_views,
           tablet_views     = tablet_views     + excluded.tablet_views,
           desktop_views    = desktop_views    + excluded.desktop_views,
           avg_scroll_depth = CASE
             WHEN (total_views + excluded.total_views) > 0
             THEN (avg_scroll_depth * total_views + excluded.avg_scroll_depth * excluded.total_views)
                  / (total_views + excluded.total_views)
             ELSE avg_scroll_depth
             END,
           cta_clicks       = cta_clicks       + excluded.cta_clicks,
           form_submits     = form_submits      + excluded.form_submits`
      )
      .bind(
        pageId,
        storeId,
        today,
        counts.pageviews,
        counts.pageviews > 0 ? 1 : 0, // Approximate: treat each pageview as unique within batch
        counts.mobile,
        counts.tablet,
        counts.desktop,
        counts.avgScrollDepth,
        counts.ctaClicks,
        counts.formSubmits
      )
  );

  // 3. Upsert section stats for section_view and cta_click events
  const sectionMap = groupSectionEvents(events);
  for (const [key, data] of sectionMap.entries()) {
    const [sId, sType] = key.split('|');
    statements.push(
      db
        .prepare(
          `INSERT INTO builder_section_stats
             (page_id, store_id, section_id, section_type,
              view_count, click_count, avg_time_visible, date)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?)
           ON CONFLICT(page_id, section_id, date) DO UPDATE SET
             view_count  = view_count  + excluded.view_count,
             click_count = click_count + excluded.click_count`
        )
        .bind(
          pageId,
          storeId,
          sId,
          sType,
          data.views,
          data.clicks,
          today
        )
    );
  }

  // ── Execute batch ─────────────────────────────────────────────────────────────
  try {
    await db.batch(statements);
  } catch (err) {
    // Log but swallow — never break published pages
    console.error('[analytics] D1 batch error:', err);
  }

  return ok();
}

// GET not supported
export async function loader() {
  return json({ error: 'Use POST' }, { status: 405 });
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

interface EventCounts {
  pageviews: number;
  mobile: number;
  tablet: number;
  desktop: number;
  avgScrollDepth: number;
  ctaClicks: number;
  formSubmits: number;
}

function tallyEventCounts(events: ValidatedEvent[]): EventCounts {
  let pageviews = 0;
  let mobile = 0;
  let tablet = 0;
  let desktop = 0;
  let totalScrollDepth = 0;
  let scrollCount = 0;
  let ctaClicks = 0;
  let formSubmits = 0;

  for (const evt of events) {
    if (evt.type === 'pageview') pageviews++;
    if (evt.type === 'cta_click') ctaClicks++;
    if (evt.type === 'form_submit') formSubmits++;
    if (evt.type === 'scroll_depth' && evt.scrollDepth != null) {
      totalScrollDepth += evt.scrollDepth;
      scrollCount++;
    }

    if (evt.deviceType === 'mobile') mobile++;
    else if (evt.deviceType === 'tablet') tablet++;
    else desktop++;
  }

  return {
    pageviews,
    mobile,
    tablet,
    desktop,
    avgScrollDepth: scrollCount > 0 ? totalScrollDepth / scrollCount : 0,
    ctaClicks,
    formSubmits,
  };
}

/** Groups section_view + cta_click events by sectionId|sectionType */
function groupSectionEvents(
  events: ValidatedEvent[]
): Map<string, { views: number; clicks: number }> {
  const map = new Map<string, { views: number; clicks: number }>();

  for (const evt of events) {
    if (!evt.sectionId || !evt.sectionType) continue;
    if (evt.type !== 'section_view' && evt.type !== 'cta_click') continue;

    const key = `${evt.sectionId}|${evt.sectionType}`;
    const entry = map.get(key) ?? { views: 0, clicks: 0 };

    if (evt.type === 'section_view') entry.views++;
    if (evt.type === 'cta_click') entry.clicks++;

    map.set(key, entry);
  }

  return map;
}

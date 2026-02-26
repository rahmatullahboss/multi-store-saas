/**
 * Builder Analytics — Server-Side Queries & Token Utilities
 *
 * All queries are scoped by store_id for multi-tenant safety.
 * HMAC-SHA256 token validation guards the public ingestion endpoint.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DailyStat {
  date: string;
  totalViews: number;
  uniqueVisitors: number;
  mobileViews: number;
  tabletViews: number;
  desktopViews: number;
  avgScrollDepth: number;
  ctaClicks: number;
  formSubmits: number;
}

export interface SectionStat {
  sectionId: string;
  sectionType: string;
  viewCount: number;
  clickCount: number;
  avgTimeVisible: number;
}

export interface PageAnalyticsTotals {
  totalViews: number;
  uniqueVisitors: number;
  avgScrollDepth: number;
  ctaClicks: number;
  mobileViews: number;
  tabletViews: number;
  desktopViews: number;
}

export interface PageAnalyticsResult {
  dailyStats: DailyStat[];
  totals: PageAnalyticsTotals;
  dateRange: { from: string; to: string };
}

// ============================================================================
// HMAC TOKEN — ANALYTICS_SECRET must be set via wrangler secret
// Token = HMAC-SHA256(pageId + ":" + storeId + ":" + date, secret)
// date = YYYY-MM-DD (UTC) — tokens expire at day boundary
// ============================================================================

/**
 * Generate a daily rotating HMAC token for a page.
 */
export async function generateAnalyticsToken(
  pageId: string,
  storeId: number,
  secret: string
): Promise<string> {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const message = `${pageId}:${storeId}:${date}`;
  return _hmacHex(message, secret);
}

/**
 * Validate incoming HMAC token.
 * Accepts today's AND yesterday's token to handle midnight edge cases.
 */
export async function validateAnalyticsToken(
  token: string,
  pageId: string,
  storeId: number,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);

  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const [expectedToday, expectedYesterday] = await Promise.all([
    _hmacHex(`${pageId}:${storeId}:${todayStr}`, secret),
    _hmacHex(`${pageId}:${storeId}:${yesterdayStr}`, secret),
  ]);

  // Constant-time comparison via timingSafeEqual emulation
  return _safeEqual(token, expectedToday) || _safeEqual(token, expectedYesterday);
}

async function _hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time string comparison (XOR all bytes). */
function _safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ============================================================================
// HASH VISITOR — privacy-safe fingerprint from IP + UA
// Returns first 16 hex chars of SHA-256(ip + ua)
// ============================================================================

export async function hashVisitor(ip: string, userAgent: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${ip}|${userAgent}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

// ============================================================================
// QUERY: Last N days of daily stats
// ============================================================================

export async function getPageAnalytics(
  db: D1Database,
  pageId: string,
  storeId: number,
  days = 7
): Promise<PageAnalyticsResult> {
  // Build date range strings (YYYY-MM-DD)
  const toDate = new Date();
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(toDate.getUTCDate() - (days - 1));

  const fromStr = fromDate.toISOString().slice(0, 10);
  const toStr = toDate.toISOString().slice(0, 10);

  const { results } = await db
    .prepare(
      `SELECT
         date,
         total_views      AS totalViews,
         unique_visitors  AS uniqueVisitors,
         mobile_views     AS mobileViews,
         tablet_views     AS tabletViews,
         desktop_views    AS desktopViews,
         avg_scroll_depth AS avgScrollDepth,
         cta_clicks       AS ctaClicks,
         form_submits     AS formSubmits
       FROM builder_page_daily_stats
       WHERE page_id  = ?
         AND store_id = ?
         AND date    >= ?
         AND date    <= ?
       ORDER BY date ASC`
    )
    .bind(pageId, storeId, fromStr, toStr)
    .all<{
      date: string;
      totalViews: number;
      uniqueVisitors: number;
      mobileViews: number;
      tabletViews: number;
      desktopViews: number;
      avgScrollDepth: number;
      ctaClicks: number;
      formSubmits: number;
    }>();

  const dailyStats: DailyStat[] = results.map((r) => ({
    date: r.date,
    totalViews: r.totalViews ?? 0,
    uniqueVisitors: r.uniqueVisitors ?? 0,
    mobileViews: r.mobileViews ?? 0,
    tabletViews: r.tabletViews ?? 0,
    desktopViews: r.desktopViews ?? 0,
    avgScrollDepth: r.avgScrollDepth ?? 0,
    ctaClicks: r.ctaClicks ?? 0,
    formSubmits: r.formSubmits ?? 0,
  }));

  // Aggregate totals across the date range
  const totals: PageAnalyticsTotals = dailyStats.reduce(
    (acc, d) => ({
      totalViews: acc.totalViews + d.totalViews,
      uniqueVisitors: acc.uniqueVisitors + d.uniqueVisitors,
      avgScrollDepth:
        d.totalViews > 0
          ? (acc.avgScrollDepth * acc.totalViews + d.avgScrollDepth * d.totalViews) /
            (acc.totalViews + d.totalViews)
          : acc.avgScrollDepth,
      ctaClicks: acc.ctaClicks + d.ctaClicks,
      mobileViews: acc.mobileViews + d.mobileViews,
      tabletViews: acc.tabletViews + d.tabletViews,
      desktopViews: acc.desktopViews + d.desktopViews,
    }),
    {
      totalViews: 0,
      uniqueVisitors: 0,
      avgScrollDepth: 0,
      ctaClicks: 0,
      mobileViews: 0,
      tabletViews: 0,
      desktopViews: 0,
    }
  );

  return {
    dailyStats,
    totals,
    dateRange: { from: fromStr, to: toStr },
  };
}

// ============================================================================
// QUERY: Section heatmap for a specific date (default = today)
// ============================================================================

export async function getSectionHeatmap(
  db: D1Database,
  pageId: string,
  storeId: number,
  date?: string
): Promise<SectionStat[]> {
  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  const { results } = await db
    .prepare(
      `SELECT
         section_id       AS sectionId,
         section_type     AS sectionType,
         view_count       AS viewCount,
         click_count      AS clickCount,
         avg_time_visible AS avgTimeVisible
       FROM builder_section_stats
       WHERE page_id  = ?
         AND store_id = ?
         AND date     = ?
       ORDER BY view_count DESC`
    )
    .bind(pageId, storeId, targetDate)
    .all<{
      sectionId: string;
      sectionType: string;
      viewCount: number;
      clickCount: number;
      avgTimeVisible: number;
    }>();

  return results.map((r) => ({
    sectionId: r.sectionId,
    sectionType: r.sectionType,
    viewCount: r.viewCount ?? 0,
    clickCount: r.clickCount ?? 0,
    avgTimeVisible: r.avgTimeVisible ?? 0,
  }));
}

/**
 * @ozzyl/sdk — AnalyticsResource
 *
 * Provides methods to interact with the /analytics endpoints of the Ozzyl API.
 */

import type { HttpClient } from '../client.js';
import type { AnalyticsSummary, AnalyticsSummaryParams } from '../types.js';

/**
 * Resource for reading analytics data from your Ozzyl store.
 *
 * @example
 * ```ts
 * const ozzyl = new Ozzyl('sk_live_...');
 *
 * // Last 7 days (default)
 * const stats = await ozzyl.analytics.summary();
 * console.log(stats.totals.totalViews);
 *
 * // Custom date range
 * const stats = await ozzyl.analytics.summary({ from: '2026-01-01', to: '2026-01-31' });
 * ```
 */
export class AnalyticsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve an analytics summary for your store over a date range.
   *
   * Returns both a day-by-day breakdown (`dailyStats`) and aggregated
   * `totals` for the entire period, plus the actual `dateRange` covered.
   *
   * Required scope: `read_analytics`
   *
   * @param params - Optional date range or number of days to look back.
   * @returns Analytics summary with daily breakdown and totals.
   *
   * @example
   * ```ts
   * // Default: last 7 days
   * const { totals, dailyStats, dateRange } = await ozzyl.analytics.summary();
   *
   * console.log(`Views: ${totals.totalViews}`);
   * console.log(`Visitors: ${totals.uniqueVisitors}`);
   * console.log(`Mobile: ${totals.mobileViews}`);
   *
   * for (const day of dailyStats) {
   *   console.log(`${day.date}: ${day.totalViews} views`);
   * }
   *
   * // Last 30 days
   * const monthly = await ozzyl.analytics.summary({ days: 30 });
   *
   * // Specific range
   * const jan = await ozzyl.analytics.summary({
   *   from: '2026-01-01',
   *   to: '2026-01-31',
   * });
   * ```
   */
  async summary(params: AnalyticsSummaryParams = {}): Promise<AnalyticsSummary> {
    const searchParams = new URLSearchParams();

    if (params.from !== undefined) {
      searchParams.set('from', params.from);
    }
    if (params.to !== undefined) {
      searchParams.set('to', params.to);
    }
    if (params.days !== undefined) {
      searchParams.set('days', String(params.days));
    }

    const query = searchParams.toString();
    const path = query ? `/analytics/summary?${query}` : '/analytics/summary';

    const envelope = await this.http.get<{
      success: true;
      data: AnalyticsSummary;
    }>(path);

    return envelope.data;
  }
}

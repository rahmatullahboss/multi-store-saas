/**
 * P&L Report Server Service
 *
 * Single source of truth for all Profit & Loss calculations.
 * Used by:
 *   - /app/reports (P&L tab)
 *   - /app/dashboard (KPI cards)
 *
 * Architecture decisions:
 *   - Only 'delivered' orders count as revenue (COD revenue recognition)
 *   - 'returned' orders tracked separately for loss calculation
 *   - cost_price_snapshot is immutable — reflects cost at time of sale
 *   - NULL cost snapshots are excluded from margin % but included in revenue
 *   - KV cache: 5-minute TTL per store per period
 *
 * @see _bmad-output/planning-artifacts/architecture.md — AD-3, AD-4
 */

import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, and, gte, lte, sql, desc, isNotNull } from 'drizzle-orm';
import { orders, orderItems, products } from '@db/schema';
import { format } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface PLSummary {
  // Revenue (delivered orders only — COD recognition)
  grossRevenue: number;
  ordersCount: number;

  // Cost of Goods
  totalCOGS: number; // Sum of cost_price_snapshot × qty for delivered orders
  cogsOrdersCount: number; // Orders with at least partial cost data
  cogsCompleteness: number; // % of revenue covered by cost data (0-100)

  // Profit
  grossProfit: number; // grossRevenue - totalCOGS
  grossMarginPct: number; // grossProfit / grossRevenue * 100

  // Courier (merchant-paid)
  courierCost: number; // Sum of courier_charge (converted from paisa to BDT)

  // Net
  netProfit: number; // grossProfit - courierCost
  netMarginPct: number; // netProfit / grossRevenue * 100

  // Returns impact
  returnedCount: number;
  returnCOGSLoss: number; // COGS of returned items
  returnCourierLoss: number; // Courier cost on returned orders
  totalReturnLoss: number; // returnCOGSLoss + returnCourierLoss
  returnRatePct: number; // returnedCount / (ordersCount + returnedCount) * 100

  // Period
  periodStart: Date;
  periodEnd: Date;
}

export interface ProductMarginRow {
  productId: number;
  productTitle: string;
  unitsSold: number;
  revenue: number;
  cogs: number | null; // null = no cost data
  grossProfit: number | null;
  marginPct: number | null;
}

export interface ProductMarginsResult {
  rows: ProductMarginRow[];
  total: number; // Total count for pagination
  page: number;
  limit: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function periodCacheKey(storeId: number, periodStart: Date, periodEnd: Date): string {
  const start = format(periodStart, 'yyyy-MM-dd');
  const end = format(periodEnd, 'yyyy-MM-dd');
  return `pl:summary:${storeId}:${start}:${end}`;
}

function safeMarginPct(profit: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return Math.round((profit / revenue) * 1000) / 10; // 1 decimal place
}

function safeReturnRatePct(returned: number, delivered: number): number {
  const total = returned + delivered;
  if (total <= 0) return 0;
  return Math.round((returned / total) * 1000) / 10;
}

// ============================================================================
// MAIN: P&L SUMMARY
// ============================================================================

/**
 * Get P&L summary for a store and date range.
 * Results are cached in KV for 5 minutes.
 *
 * @param db - Drizzle D1 database instance
 * @param storeId - Store ID (multi-tenancy: always scoped)
 * @param env - Cloudflare env with KV binding
 * @param periodStart - Start of period (inclusive)
 * @param periodEnd - End of period (inclusive, extended to end of day)
 */
export async function getPLSummary(
  db: DrizzleD1Database<Record<string, never>>,
  storeId: number,
  env: { KV: KVNamespace },
  periodStart: Date,
  periodEnd: Date
): Promise<PLSummary> {
  // Extend end to end of day
  const endOfDay = new Date(periodEnd);
  endOfDay.setHours(23, 59, 59, 999);

  // Check KV cache
  const cacheKey = periodCacheKey(storeId, periodStart, endOfDay);
  try {
    const cached = await env.KV.get(cacheKey, 'json');
    if (cached) return cached as PLSummary;
  } catch {
    // Cache miss or error — continue to DB query
  }

  // ── Query 1: Delivered orders ──────────────────────────────────────────────
  const deliveredResult = await db
    .select({
      grossRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      ordersCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
      totalCOGS: sql<number>`COALESCE(SUM(
        CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL
          THEN ${orderItems.costPriceSnapshot} * ${orderItems.quantity}
          ELSE 0
        END
      ), 0)`,
      cogsOrdersCount: sql<number>`COUNT(DISTINCT CASE
        WHEN ${orderItems.costPriceSnapshot} IS NOT NULL THEN ${orders.id}
        END)`,
      revenueWithCost: sql<number>`COALESCE(SUM(
        CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL
          THEN ${orders.total}
          ELSE 0
        END
      ), 0)`,
      courierCostPaisa: sql<number>`COALESCE(SUM(${orders.courierCharge}), 0)`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.storeId, storeId),
        eq(orders.status, 'delivered'),
        gte(orders.createdAt, periodStart),
        lte(orders.createdAt, endOfDay)
      )
    );

  // ── Query 2: Returned orders impact ───────────────────────────────────────
  const returnedResult = await db
    .select({
      returnedCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
      returnCOGSLoss: sql<number>`COALESCE(SUM(
        CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL
          THEN ${orderItems.costPriceSnapshot} * ${orderItems.quantity}
          ELSE 0
        END
      ), 0)`,
      returnCourierLossPaisa: sql<number>`COALESCE(SUM(${orders.courierCharge}), 0)`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.storeId, storeId),
        eq(orders.status, 'returned'),
        gte(orders.createdAt, periodStart),
        lte(orders.createdAt, endOfDay)
      )
    );

  const d = deliveredResult[0];
  const r = returnedResult[0];

  const grossRevenue = Number(d?.grossRevenue ?? 0);
  const ordersCount = Number(d?.ordersCount ?? 0);
  const totalCOGS = Number(d?.totalCOGS ?? 0);
  const cogsOrdersCount = Number(d?.cogsOrdersCount ?? 0);
  const revenueWithCost = Number(d?.revenueWithCost ?? 0);
  const courierCost = Number(d?.courierCostPaisa ?? 0) / 100; // paisa → BDT
  const returnedCount = Number(r?.returnedCount ?? 0);
  const returnCOGSLoss = Number(r?.returnCOGSLoss ?? 0);
  const returnCourierLoss = Number(r?.returnCourierLossPaisa ?? 0) / 100;

  // Derived
  const grossProfit = grossRevenue - totalCOGS;
  const netProfit = grossProfit - courierCost;
  const cogsCompleteness =
    grossRevenue > 0 ? Math.round((revenueWithCost / grossRevenue) * 100) : 0;

  const summary: PLSummary = {
    grossRevenue,
    ordersCount,
    totalCOGS,
    cogsOrdersCount,
    cogsCompleteness,
    grossProfit,
    grossMarginPct: safeMarginPct(grossProfit, grossRevenue),
    courierCost,
    netProfit,
    netMarginPct: safeMarginPct(netProfit, grossRevenue),
    returnedCount,
    returnCOGSLoss,
    returnCourierLoss,
    totalReturnLoss: returnCOGSLoss + returnCourierLoss,
    returnRatePct: safeReturnRatePct(returnedCount, ordersCount),
    periodStart,
    periodEnd: endOfDay,
  };

  // Cache result for 5 minutes
  try {
    await env.KV.put(cacheKey, JSON.stringify(summary), { expirationTtl: 300 });
  } catch {
    // Cache write failure is non-fatal
  }

  return summary;
}

/**
 * Invalidate P&L KV cache for a store.
 * Call this after order status changes to 'delivered' or 'returned'.
 */
export async function invalidatePLCache(
  env: { KV: KVNamespace },
  storeId: number
): Promise<void> {
  // We can't enumerate KV keys by prefix easily, so we invalidate
  // current month and last month keys (most common periods merchants view)
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const keys = [
    // Today
    periodCacheKey(storeId, now, now),
    // This month
    periodCacheKey(storeId, currentMonthStart, now),
    // Last month
    periodCacheKey(storeId, lastMonthStart, lastMonthEnd),
  ];

  await Promise.allSettled(keys.map((k) => env.KV.delete(k)));
}

// ============================================================================
// PRODUCT MARGINS
// ============================================================================

/**
 * Get per-product profit margin data for a store and date range.
 * NOT cached — user-driven, paginated, real-time.
 *
 * @param db - Drizzle D1 database instance
 * @param storeId - Store ID
 * @param periodStart - Start of period
 * @param periodEnd - End of period
 * @param page - Page number (1-based)
 * @param limit - Rows per page (default 20)
 * @param sortBy - Column to sort by
 * @param sortDir - Sort direction
 */
export async function getProductMargins(
  db: DrizzleD1Database<Record<string, never>>,
  storeId: number,
  periodStart: Date,
  periodEnd: Date,
  page = 1,
  limit = 20,
  sortBy: 'grossProfit' | 'revenue' | 'marginPct' | 'unitsSold' = 'grossProfit',
  sortDir: 'asc' | 'desc' = 'desc'
): Promise<ProductMarginsResult> {
  const endOfDay = new Date(periodEnd);
  endOfDay.setHours(23, 59, 59, 999);
  const offset = (page - 1) * limit;

  // Sort column mapping
  const sortColMap = {
    grossProfit: sql`gross_profit`,
    revenue: sql`revenue`,
    marginPct: sql`margin_pct`,
    unitsSold: sql`units_sold`,
  };
  const sortCol = sortColMap[sortBy] ?? sortColMap.grossProfit;

  const rows = await db
    .select({
      productId: orderItems.productId,
      productTitle: orderItems.title,
      unitsSold: sql<number>`SUM(${orderItems.quantity})`,
      revenue: sql<number>`SUM(${orderItems.price} * ${orderItems.quantity})`,
      cogs: sql<number | null>`
        CASE
          WHEN COUNT(CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL THEN 1 END) > 0
          THEN SUM(CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL
            THEN ${orderItems.costPriceSnapshot} * ${orderItems.quantity}
            ELSE 0 END)
          ELSE NULL
        END`,
      grossProfit: sql<number | null>`
        CASE
          WHEN COUNT(CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL THEN 1 END) > 0
          THEN SUM(${orderItems.price} * ${orderItems.quantity}) -
               SUM(CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL
                 THEN ${orderItems.costPriceSnapshot} * ${orderItems.quantity}
                 ELSE 0 END)
          ELSE NULL
        END`,
      marginPct: sql<number | null>`
        CASE
          WHEN COUNT(CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL THEN 1 END) > 0
            AND SUM(${orderItems.price} * ${orderItems.quantity}) > 0
          THEN ROUND(
            (SUM(${orderItems.price} * ${orderItems.quantity}) -
             SUM(CASE WHEN ${orderItems.costPriceSnapshot} IS NOT NULL
               THEN ${orderItems.costPriceSnapshot} * ${orderItems.quantity}
               ELSE 0 END)) /
            SUM(${orderItems.price} * ${orderItems.quantity}) * 100, 1)
          ELSE NULL
        END`,
    })
    .from(orderItems)
    .innerJoin(
      orders,
      and(
        eq(orderItems.orderId, orders.id),
        eq(orders.storeId, storeId),
        eq(orders.status, 'delivered'),
        gte(orders.createdAt, periodStart),
        lte(orders.createdAt, endOfDay)
      )
    )
    .where(isNotNull(orderItems.productId))
    .groupBy(orderItems.productId, orderItems.title)
    .orderBy(sortDir === 'desc' ? desc(sortCol) : sortCol)
    .limit(limit)
    .offset(offset);

  // Count total for pagination
  const countResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${orderItems.productId})` })
    .from(orderItems)
    .innerJoin(
      orders,
      and(
        eq(orderItems.orderId, orders.id),
        eq(orders.storeId, storeId),
        eq(orders.status, 'delivered'),
        gte(orders.createdAt, periodStart),
        lte(orders.createdAt, endOfDay)
      )
    )
    .where(isNotNull(orderItems.productId));

  return {
    rows: rows.map((r) => ({
      productId: r.productId ?? 0,
      productTitle: r.productTitle,
      unitsSold: Number(r.unitsSold ?? 0),
      revenue: Number(r.revenue ?? 0),
      cogs: r.cogs != null ? Number(r.cogs) : null,
      grossProfit: r.grossProfit != null ? Number(r.grossProfit) : null,
      marginPct: r.marginPct != null ? Number(r.marginPct) : null,
    })),
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  };
}

// ============================================================================
// UTILITY: Format BDT amount for display
// ============================================================================

/**
 * Format a BDT amount with ৳ symbol and comma formatting.
 * e.g., 123456.78 → "৳1,23,456.78"  (BD lakh notation)
 */
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get period start/end dates for common presets.
 */
export function getPeriodDates(preset: 'today' | 'week' | 'month' | 'last_month'): {
  start: Date;
  end: Date;
  label: string;
} {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: now,
        label: 'Today',
      };
    case 'week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      return { start: weekStart, end: now, label: 'This Week' };
    }
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
        label: 'This Month',
      };
    case 'last_month': {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start: lastMonthStart, end: lastMonthEnd, label: 'Last Month' };
    }
  }
}

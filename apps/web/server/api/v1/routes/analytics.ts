/**
 * v1/routes/analytics.ts — Public API: Analytics
 * GET /api/v1/analytics/summary  — store summary stats
 * GET /api/v1/analytics/events   — recent events
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { requireScopes } from '@server/middleware/api-key-auth';
import { orders as ordersTable, products as productsTable } from '@db/schema';

export const analyticsRouter = new Hono<{ Bindings: Env }>();

const SummarySchema = z.object({
  period: z.enum(['today', '7d', '30d', '90d']).default('30d'),
});

// GET /api/v1/analytics/summary
analyticsRouter.get(
  '/summary',
  requireScopes(['read_analytics']),
  zValidator('query', SummarySchema),
  async (c) => {
    const { period } = c.req.valid('query');
    const storeId = c.var.apiKey.storeId;
    const db = drizzle(c.env.DB);

    const periodDays: Record<string, number> = {
      today: 1, '7d': 7, '30d': 30, '90d': 90,
    };
    const since = new Date(Date.now() - periodDays[period] * 86_400_000);

    // Parallel queries
    const [orderStats, productCount] = await Promise.all([
      db
        .select({
          totalOrders:  sql<number>`COUNT(*)`,
          totalRevenue: sql<number>`COALESCE(SUM(${ordersTable.total}), 0)`,
          avgOrderValue: sql<number>`COALESCE(AVG(${ordersTable.total}), 0)`,
        })
        .from(ordersTable)
        .where(and(
          eq(ordersTable.storeId, storeId),
          gte(ordersTable.createdAt, since),
        )),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(productsTable)
        .where(and(
          eq(productsTable.storeId, storeId),
          eq(productsTable.isPublished, true),
        )),
    ]);

    return c.json({
      success: true,
      data: {
        period,
        since: since.toISOString(),
        orders: {
          total:     orderStats[0]?.totalOrders ?? 0,
          revenue:   orderStats[0]?.totalRevenue ?? 0,
          avg_value: Math.round((orderStats[0]?.avgOrderValue ?? 0) * 100) / 100,
        },
        products: {
          active: productCount[0]?.count ?? 0,
        },
      },
    });
  }
);

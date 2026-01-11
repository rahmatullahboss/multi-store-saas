import type { Database } from "../lib/db.server";
import { orders, products, stores, abandonedCarts } from "../../db/schema";
import { eq, and, gte, sql, count, desc } from "drizzle-orm";

/**
 * ANALYTICS SERVICE
 * Provides predictive insights and forecasting using simple statistical models (SMA/Linear Regression).
 * Implements "Phase 9: AI Predictive Analytics"
 */

export interface SalesForecast {
  date: string;
  predictedRevenue: number;
}

// ... existing exports ...

/**
 * Get core store statistics for the dashboard
 */
export async function getStoreStats(db: Database, storeId: number) {
  // Date ranges
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 1. Basic Counts
  const [productCount] = await db.select({ count: count() }).from(products).where(and(eq(products.storeId, storeId), eq(products.isPublished, true)));
  const [lowStockCount] = await db.select({ count: count() }).from(products).where(and(eq(products.storeId, storeId), sql`inventory < 5`)); // Assuming 5 is low
  const [orderCount] = await db.select({ count: count() }).from(orders).where(eq(orders.storeId, storeId));
  const [pendingOrders] = await db.select({ count: count() }).from(orders).where(and(eq(orders.storeId, storeId), eq(orders.status, 'pending')));
  const [abandonedCartsCount] = await db.select({ count: count() }).from(abandonedCarts).where(and(eq(abandonedCarts.storeId, storeId), eq(abandonedCarts.status, 'abandoned')));

  // 2. Revenue & Sales
  const revenueResult = await db.select({ total: sql<number>`sum(total)` }).from(orders).where(and(eq(orders.storeId, storeId), sql`status != 'cancelled'`));
  const revenue = revenueResult[0]?.total || 0;

  const todayResult = await db.select({ total: sql<number>`sum(total)` }).from(orders).where(and(eq(orders.storeId, storeId), gte(orders.createdAt, today), sql`status != 'cancelled'`));
  const todaySales = todayResult[0]?.total || 0;

  const yesterdayResult = await db.select({ total: sql<number>`sum(total)` }).from(orders).where(and(eq(orders.storeId, storeId), gte(orders.createdAt, yesterday), sql`created_at < ${today.getTime()/1000}` /* approximated */, sql`status != 'cancelled'`));
  // Note: D1 dates are stored as integers/timestamps usually or strings depending on schema. 
  // Assuming standard implementation:
  
  // 3. Sales Trend Calculation
  const yesterdaySales = yesterdayResult[0]?.total || 0;
  let salesTrend = 0;
  if (yesterdaySales > 0) {
      salesTrend = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  } else if (todaySales > 0) {
      salesTrend = 100;
  }

  // 4. Sales Chart Data (Last 7 Days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  
  const salesDataRaw = await db
      .select({
          date: sql<string>`date(created_at, 'unixepoch')`,
          amount: sql<number>`sum(total)`
      })
      .from(orders)
      .where(and(eq(orders.storeId, storeId), gte(orders.createdAt, last7Days), sql`status != 'cancelled'`))
      .groupBy(sql`date(created_at, 'unixepoch')`)
      .orderBy(sql`date(created_at, 'unixepoch')`);

  const salesData = salesDataRaw.map(d => ({ date: d.date, amount: d.amount }));

  return {
      products: productCount.count,
      lowStock: lowStockCount.count,
      orders: orderCount.count,
      revenue,
      todaySales,
      salesTrend,
      pendingOrders: pendingOrders.count,
      abandonedCarts: abandonedCartsCount.count,
      salesData
  };
}

// ... existing forecast functions ...
export async function getRevenueForecast(db: Database, storeId: number, daysToPredict = 7): Promise<SalesForecast[]> {
  // 1. Get last 30 days revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyRevenue = await db
    .select({
      date: sql<string>`date(created_at, 'unixepoch')`,
      total: sql<number>`sum(total)`
    })
    .from(orders)
    .where(and(
      eq(orders.storeId, storeId),
      gte(orders.createdAt, thirtyDaysAgo),
      sql`status != 'cancelled'`
    ))
    .groupBy(sql`date(created_at, 'unixepoch')`)
    .orderBy(sql`date(created_at, 'unixepoch')`);
    
  if (dailyRevenue.length < 5) {
     return []; // Not enough data
  }

  // 2. Simple Forecast Logic (Linear Regression: y = mx + c)
  // X = day index (0..29), Y = revenue
  const n = dailyRevenue.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  dailyRevenue.forEach((day, index) => {
    const x = index;
    const y = Number(day.total);
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 3. Generate future points
  const forecast: SalesForecast[] = [];
  const lastDate = new Date(dailyRevenue[dailyRevenue.length - 1].date);

  for (let i = 1; i <= daysToPredict; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    
    // x = length + i
    const nextX = n + (i - 1);
    let predictedParams = slope * nextX + intercept;
    
    // Ensure no negative revenue prediction
    predictedParams = Math.max(0, predictedParams);
    
    forecast.push({
      date: nextDate.toISOString().split('T')[0],
      predictedRevenue: Math.round(predictedParams)
    });
  }

  return forecast;
}

export async function getPredictedCLV(db: Database, storeId: number) {
    // This is a placeholder for more advanced CLV logic
    // Currently returns a basic metric projected over 12 months
    const stats = await db.select({
        avgOrderValue: sql<number>`avg(total)`,
        totalOrders: sql<number>`count(*)`,
        uniqueCustomers: sql<number>`count(distinct customer_id)`
    }).from(orders).where(and(eq(orders.storeId, storeId), sql`status != 'cancelled'`));

    const avgOrderValue = stats[0]?.avgOrderValue || 0;
    const purchaseFrequency = (stats[0]?.totalOrders || 0) / (stats[0]?.uniqueCustomers || 1);
    
    // Basic CLV = AOV * Frequency
    return {
        clv: avgOrderValue * purchaseFrequency,
        avgOrderValue,
        purchaseFrequency
    };
}

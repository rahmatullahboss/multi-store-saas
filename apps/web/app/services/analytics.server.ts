import type { Database } from "../lib/db.server";
import { orders, products, stores, abandonedCarts, customers, pageViews, checkoutSessions, carts } from "../../db/schema";
import { eq, and, gte, lt, sql, count, desc } from "drizzle-orm";

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

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  // 1. & 2. Execute DB queries concurrently
  const [
    productCountResult,
    lowStockCountResult,
    orderCountResult,
    pendingOrdersResult,
    abandonedCartsCountResult,
    revenueResult,
    todayResult,
    yesterdayResult,
    salesDataRaw
  ] = await Promise.all([
    db.select({ count: count() }).from(products).where(and(eq(products.storeId, storeId), eq(products.isPublished, true))),
    db.select({ count: count() }).from(products).where(and(eq(products.storeId, storeId), sql`inventory <= 10`)),
    db.select({ count: count() }).from(orders).where(eq(orders.storeId, storeId)),
    db.select({ count: count() }).from(orders).where(and(eq(orders.storeId, storeId), eq(orders.status, 'pending'))),
    db.select({ count: count() }).from(abandonedCarts).where(and(eq(abandonedCarts.storeId, storeId), eq(abandonedCarts.status, 'abandoned'))),
    db.select({ total: sql<number>`sum(total)` }).from(orders).where(and(eq(orders.storeId, storeId), sql`status != 'cancelled'`)),
    db.select({
        total: sql<number>`sum(total)`,
        count: sql<number>`count(*)`,
      }).from(orders).where(and(eq(orders.storeId, storeId), gte(orders.createdAt, today), sql`status != 'cancelled'`)),
    db.select({ total: sql<number>`sum(total)` }).from(orders).where(and(eq(orders.storeId, storeId), gte(orders.createdAt, yesterday), sql`created_at < ${today.getTime()/1000}` /* approximated */, sql`status != 'cancelled'`)),
    db.select({
        date: sql<string>`date(created_at, 'unixepoch')`,
        amount: sql<number>`sum(total)`
    })
    .from(orders)
    .where(and(eq(orders.storeId, storeId), gte(orders.createdAt, last7Days), sql`status != 'cancelled'`))
    .groupBy(sql`date(created_at, 'unixepoch')`)
    .orderBy(sql`date(created_at, 'unixepoch')`)
  ]);

  const productCount = productCountResult[0];
  const lowStockCount = lowStockCountResult[0];
  const orderCount = orderCountResult[0];
  const pendingOrders = pendingOrdersResult[0];
  const abandonedCartsCount = abandonedCartsCountResult[0];

  const revenue = revenueResult[0]?.total || 0;

  const todaySales = todayResult[0]?.total || 0;
  const todayOrders = todayResult[0]?.count || 0;

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
  // We need exactly 7 data points, even if there are no sales on some days
  const salesData: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Format to YYYY-MM-DD which matches the DB date function
      const dateStr = d.toISOString().split('T')[0];
      salesData.push({ date: dateStr, amount: 0 });
  }

  // Merge raw data into our 7-day skeleton
  salesDataRaw.forEach(row => {
      const index = salesData.findIndex(s => s.date === row.date);
      if (index !== -1) {
          salesData[index].amount = row.amount;
      }
  });

  return {
      products: productCount.count,
      lowStock: lowStockCount.count,
      orders: orderCount.count,
      revenue,
      todaySales,
      todayOrders,
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

export async function getAbandonedCartRecoveryStats(db: Database, storeId?: number) {
  const conditions = storeId ? eq(abandonedCarts.storeId, storeId) : undefined;

  const totals = await db
    .select({
      total: sql<number>`count(*)`,
      recovered: sql<number>`sum(case when ${abandonedCarts.status} = 'recovered' then 1 else 0 end)`,
      recoveredRevenue: sql<number>`sum(case when ${abandonedCarts.status} = 'recovered' then ${abandonedCarts.totalAmount} else 0 end)`,
    })
    .from(abandonedCarts)
    .where(conditions ?? undefined);

  const total = Number(totals[0]?.total || 0);
  const recovered = Number(totals[0]?.recovered || 0);
  const recoveredRevenue = Number(totals[0]?.recoveredRevenue || 0);
  const recoveryRate = total > 0 ? Number(((recovered / total) * 100).toFixed(1)) : 0;

  return {
    total,
    recovered,
    recoveredRevenue,
    recoveryRate,
  };
}

export async function getStoreFunnelMetrics(db: Database, storeId: number) {
  const [views, cartsCount, checkouts, ordersCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(distinct ${pageViews.visitorId})` })
      .from(pageViews)
      .where(eq(pageViews.storeId, storeId)),
    db
      .select({ count: sql<number>`count(distinct ${carts.visitorId})` })
      .from(carts)
      .where(eq(carts.storeId, storeId)),
    db
      .select({ count: sql<number>`count(distinct ${checkoutSessions.id})` })
      .from(checkoutSessions)
      .where(eq(checkoutSessions.storeId, storeId)),
    db
      .select({ count: sql<number>`count(distinct ${orders.id})` })
      .from(orders)
      .where(and(eq(orders.storeId, storeId), sql`status != 'cancelled'`))
  ]);

  const viewCount = Number(views[0]?.count || 0);
  const cartCount = Number(cartsCount[0]?.count || 0);
  const checkoutCount = Number(checkouts[0]?.count || 0);
  const orderCount = Number(ordersCount[0]?.count || 0);

  const rate = (numerator: number, denominator: number) =>
    denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;

  return {
    views: viewCount,
    carts: cartCount,
    checkouts: checkoutCount,
    orders: orderCount,
    viewToCartRate: rate(cartCount, viewCount),
    cartToCheckoutRate: rate(checkoutCount, cartCount),
    checkoutToOrderRate: rate(orderCount, checkoutCount),
    viewToOrderRate: rate(orderCount, viewCount),
  };
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

/**
 * Identify customers at risk of churning
 * Risk is High if checking time > 3x average purchase frequency
 */
export async function calculateChurnRisk(db: Database, storeId: number) {
    // Default heuristic: 30 days frequency
    const averageFrequencyDays = 30; 
    const thresholdDays = 3 * averageFrequencyDays; // 90 days

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const atRiskCustomers = await db.select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        lastOrderAt: customers.lastOrderAt,
        totalSpent: customers.totalSpent
    })
    .from(customers)
    .where(and(
        eq(customers.storeId, storeId),
        lt(customers.lastOrderAt, thresholdDate)
    ))
    .limit(50);

    return atRiskCustomers.map(c => ({
        ...c,
        churnProbability: 100, // Conceptually high risk
        riskLabel: 'High'
    }));
}

/**
 * Predict next likely purchase date for a customer
 * Based on average gap between their past orders
 */
export function predictNextPurchaseDate(customerOrders: any[]) { // Using any[] for flexibility, expects { createdAt: Date }
    if (!customerOrders || customerOrders.length < 2) return null;

    // Ensure sorted desc (newest first)
    const sorted = [...customerOrders].sort((a,b) => (new Date(b.createdAt).getTime()) - (new Date(a.createdAt).getTime()));
    
    let totalGapMs = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
        const d1 = new Date(sorted[i].createdAt).getTime();
        const d2 = new Date(sorted[i+1].createdAt).getTime();
        totalGapMs += (d1 - d2); 
    }
    
    const avgGapMs = totalGapMs / (sorted.length - 1);
    
    const lastOrderTime = new Date(sorted[0].createdAt).getTime();
    const nextPurchaseTime = lastOrderTime + avgGapMs;
    
    return new Date(nextPurchaseTime);
}

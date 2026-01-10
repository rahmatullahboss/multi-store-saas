
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sql, desc, and, gte } from 'drizzle-orm';
import { products, orders, abandonedCarts } from 'db/schema';

export interface StoreStats {
    products: number;
    lowStock: number;
    orders: number;
    revenue: number;
    todaySales: number;
    salesTrend: number;
    pendingOrders: number;
    abandonedCarts: number;
    salesData: Array<{ date: string; label: string; value: number }>;
}

export async function getStoreStats(db: ReturnType<typeof drizzle>, storeId: number): Promise<StoreStats> {
    // Get today's start timestamp (Bangladesh timezone logic preserved from dashboard)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const weekAgoStart = new Date(todayStart.getTime() - 7 * 86400000);

    // Count products
    const productCount = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.storeId, storeId));

    // Low stock products (inventory <= 5)
    const lowStockProducts = await db
        .select({ count: count() })
        .from(products)
        .where(and(
            eq(products.storeId, storeId),
            sql`${products.inventory} <= 5 AND ${products.inventory} > 0`
        ));

    // Total orders
    const orderCount = await db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.storeId, storeId));

    // Total revenue
    const revenueResult = await db
        .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
        .from(orders)
        .where(eq(orders.storeId, storeId));

    // Today's orders
    const todayOrders = await db
        .select({ 
            count: count(),
            total: sql<number>`COALESCE(SUM(total), 0)`
        })
        .from(orders)
        .where(and(
            eq(orders.storeId, storeId),
            gte(orders.createdAt, todayStart)
        ));

    // Yesterday's orders for comparison
    const yesterdayOrders = await db
        .select({ 
            count: count(),
            total: sql<number>`COALESCE(SUM(total), 0)`
        })
        .from(orders)
        .where(and(
            eq(orders.storeId, storeId),
            gte(orders.createdAt, yesterdayStart),
            sql`${orders.createdAt} < ${todayStart.toISOString()}`
        ));

    // Pending orders count
    const pendingOrders = await db
        .select({ count: count() })
        .from(orders)
        .where(and(
            eq(orders.storeId, storeId),
            eq(orders.status, 'pending')
        ));

    // Abandoned carts count (last 7 days)
    const abandonedCartsCount = await db
        .select({ count: count() })
        .from(abandonedCarts)
        .where(and(
            eq(abandonedCarts.storeId, storeId),
            eq(abandonedCarts.status, 'abandoned'),
            gte(abandonedCarts.abandonedAt, weekAgoStart)
        ));

    // Daily sales for last 7 days
    const salesData: { date: string; label: string; value: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(todayStart.getTime() - i * 86400000);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        
        // Convert to Unix timestamps (seconds) for SQLite integer comparison if needed, 
        // but Drizzle/SQLite handling of Dates varies. 
        // Dashboard implementation used manual timestamp conversion.
        // Let's replicate the dashboard logic accurately.
        const dayStartTimestamp = Math.floor(dayStart.getTime() / 1000);
        const dayEndTimestamp = Math.floor(dayEnd.getTime() / 1000);
        
        const dayRevenue = await db
            .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
            .from(orders)
            .where(and(
                eq(orders.storeId, storeId),
                sql`${orders.createdAt} >= ${dayStartTimestamp}`,
                sql`${orders.createdAt} < ${dayEndTimestamp}`
            ));
        
        salesData.push({
            date: dayStart.toISOString().split('T')[0],
            label: i === 0 ? 'Today' : dayNames[dayStart.getDay()],
            value: dayRevenue[0]?.total || 0,
        });
    }

    // Calculate trends
    const todaySales = todayOrders[0]?.total || 0;
    const yesterdaySales = yesterdayOrders[0]?.total || 0;
    const salesTrend = yesterdaySales > 0 
        ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100)
        : todaySales > 0 ? 100 : 0;

    return {
        products: productCount[0]?.count || 0,
        lowStock: lowStockProducts[0]?.count || 0,
        orders: orderCount[0]?.count || 0,
        revenue: revenueResult[0]?.total || 0,
        todaySales,
        salesTrend,
        pendingOrders: pendingOrders[0]?.count || 0,
        abandonedCarts: abandonedCartsCount[0]?.count || 0,
        salesData
    };
}

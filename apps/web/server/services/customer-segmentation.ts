import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql, count, max } from 'drizzle-orm';
import { customers, orders, type CustomerSegment } from '@db/schema';


/**
 * Recalculate and update a customer's segment based on purchase history.
 * 
 * Logic:
 * - VIP: Spent > 10,000 OR Orders > 5
 * - New: 0 Orders AND Joined < 30 days ago
 * - Window Shopper: 0 Orders AND Joined > 30 days ago
 * - Churn Risk: Last Order > 60 days ago (and has at least 1 order)
 * - Regular: Default
 */
export async function recalculateCustomerSegment(
  db: ReturnType<typeof drizzle>, 
  customerId: number, 
  storeId: number
): Promise<string> {
  // 1. Fetch Customer Stats directly from Orders table for accuracy
  const orderStats = await db
    .select({
      totalSpent: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      orderCount: count(orders.id),
      lastOrderDate: max(orders.createdAt),
    })
    .from(orders)
    .where(
      and(
        eq(orders.customerId, customerId),
        eq(orders.storeId, storeId),
        sql`${orders.status} != 'cancelled'` // Exclude cancelled orders
      )
    )
    .get();

  // Fetch customer profile for 'joinedAt'
  const customer = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
    .get();

  if (!customer) return 'regular';

  const totalSpent = orderStats?.totalSpent || 0;
  const orderCount = orderStats?.orderCount || 0;
  const lastOrderDate = orderStats?.lastOrderDate ? new Date(orderStats.lastOrderDate) : null;
  const joinedAt = customer.createdAt ? new Date(customer.createdAt) : new Date();
  const now = new Date();

  // Calculate day differences
  const daysSinceJoin = (now.getTime() - joinedAt.getTime()) / (1000 * 3600 * 24);
  const daysSinceLastOrder = lastOrderDate 
    ? (now.getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24) 
    : 9999;

  // 2. Determine Segment
  let newSegment: CustomerSegment = 'regular';

  if (totalSpent > 10000 || orderCount > 5) {
    newSegment = 'vip';
  } else if (orderCount === 0) {
    if (daysSinceJoin < 30) {
      newSegment = 'new';
    } else {
      newSegment = 'window_shopper';
    }
  } else if (daysSinceLastOrder > 60) {
    newSegment = 'churn_risk';
  } else {
    newSegment = 'regular';
  }

  // 3. Update Customer
  // Only update if changed or to sync stats
  await db
    .update(customers)
    .set({ 
      segment: newSegment,
      totalSpent: totalSpent,
      totalOrders: orderCount,
      lastOrderAt: lastOrderDate || undefined,
      updatedAt: new Date()
    })
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));

  return newSegment;
}

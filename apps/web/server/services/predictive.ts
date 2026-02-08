import { drizzle } from 'drizzle-orm/d1';
import { customers, orders } from '@db/schema';
import { eq, sql, and, lt, isNull } from 'drizzle-orm';

export class PredictiveService {
  /**
   * Calculate Customer Lifetime Value (Total Spent)
   */
  static async calculateLTV(
    db: ReturnType<typeof drizzle>,
    storeId: number,
    customerId: number
  ): Promise<number> {
    const result = await db
      .select({ total: sql<number>`sum(${orders.total})` })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          eq(orders.customerId, customerId),
          sql`${orders.status} != 'cancelled'`
        )
      )
      .get();
    
    return result?.total || 0;
  }

  /**
   * Estimate Churn Risk (0-100)
   * Based on days since last order.
   * > 90 days = 100%
   * > 60 days = 80%
   * > 30 days = 50%
   */
  static calculateChurnRisk(lastOrderDate: Date | null): number {
    if (!lastOrderDate) return 100; // No orders = high risk if old? Or 0 if new? Assuming high for now if inactive.

    const daysSince = (new Date().getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysSince > 90) return 100;
    if (daysSince > 60) return 80;
    if (daysSince > 30) return 50;
    return 10; // Active
  }

  static async updateCustomerRiskScore(
    db: ReturnType<typeof drizzle>,
    storeId: number,
    customerId: number
  ) {
    const customer = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
      .get();
    if (!customer) return;

    const risk = this.calculateChurnRisk(customer.lastOrderAt || null);
    
    await db.update(customers).set({ 
        riskScore: risk,
        riskCheckedAt: new Date()
    }).where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));
  }
}

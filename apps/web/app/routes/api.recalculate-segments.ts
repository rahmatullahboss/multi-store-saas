/**
 * API Route: Recalculate Customer Segments
 * 
 * This endpoint recalculates customer segments for a store based on:
 * - totalOrders: Count of orders per customer
 * - totalSpent: Sum of order totals per customer
 * - lastOrderAt: Most recent order date
 * 
 * Segment Logic:
 * - VIP: totalOrders >= 3 OR totalSpent >= 10000
 * - Churn Risk: lastOrderAt < 60 days ago AND totalOrders >= 1
 * - Window Shopper: Has abandoned carts but totalOrders = 0
 * - New: totalOrders = 0 (never bought)
 * - Regular: Everyone else
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import { customers, orders, abandonedCarts } from '@db/schema';
import { getStoreId } from '~/services/auth.server';

export async function action({ context, request }: ActionFunctionArgs) {
  // Only merchants can recalculate their own store's segments
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  
  const db = drizzle(context.cloudflare.env.DB);
  
  try {
    // Step 1: Update totalOrders and totalSpent from orders data
    await db.run(sql`
      UPDATE customers SET
        total_orders = (
          SELECT COUNT(*) FROM orders 
          WHERE orders.customer_id = customers.id 
          AND orders.status != 'cancelled'
        ),
        total_spent = COALESCE((
          SELECT SUM(total) FROM orders 
          WHERE orders.customer_id = customers.id 
          AND orders.status != 'cancelled'
        ), 0),
        last_order_at = (
          SELECT MAX(created_at) FROM orders 
          WHERE orders.customer_id = customers.id
        )
      WHERE customers.store_id = ${storeId}
    `);
    
    // Step 2: Determine segment based on metrics
    const sixtyDaysAgo = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
    
    // Mark VIP customers (3+ orders OR 10k+ spent)
    await db.run(sql`
      UPDATE customers SET segment = 'vip'
      WHERE store_id = ${storeId}
      AND (total_orders >= 3 OR total_spent >= 10000)
    `);
    
    // Mark Churn Risk (60+ days since last order AND has ordered before)
    await db.run(sql`
      UPDATE customers SET segment = 'churn_risk'
      WHERE store_id = ${storeId}
      AND last_order_at IS NOT NULL
      AND last_order_at < ${sixtyDaysAgo}
      AND total_orders >= 1
      AND segment != 'vip'
    `);
    
    // Mark Window Shoppers (have abandoned carts but 0 orders)
    await db.run(sql`
      UPDATE customers SET segment = 'window_shopper'
      WHERE store_id = ${storeId}
      AND total_orders = 0
      AND (
        SELECT COUNT(*) FROM abandoned_carts 
        WHERE (abandoned_carts.customer_email = customers.email 
               OR abandoned_carts.customer_phone = customers.phone)
        AND abandoned_carts.store_id = ${storeId}
      ) > 0
    `);
    
    // Mark New customers (0 orders, no abandoned carts)
    await db.run(sql`
      UPDATE customers SET segment = 'new'
      WHERE store_id = ${storeId}
      AND total_orders = 0
      AND segment NOT IN ('window_shopper')
    `);
    
    // Mark Regular (everyone else who isn't VIP, Churn Risk, Window Shopper, or New)
    await db.run(sql`
      UPDATE customers SET segment = 'regular'
      WHERE store_id = ${storeId}
      AND segment NOT IN ('vip', 'churn_risk', 'window_shopper', 'new')
    `);
    
    // Step 3: Get segment counts for response
    const segmentCounts = await db.select({
      segment: customers.segment,
      count: sql<number>`COUNT(*)`.as('count'),
    })
      .from(customers)
      .where(eq(customers.storeId, storeId))
      .groupBy(customers.segment);
    
    return json({
      success: true,
      message: 'Customer segments recalculated successfully',
      segments: segmentCounts.reduce((acc, { segment, count }) => {
        acc[segment || 'unknown'] = count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error recalculating segments:', error);
    return json(
      { success: false, error: 'Failed to recalculate segments' },
      { status: 500 }
    );
  }
}


export default function() {}

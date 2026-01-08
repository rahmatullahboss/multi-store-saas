/**
 * Plan Limits Service
 * 
 * Central logic for subscription tier usage limits.
 * 
 * BUSINESS CRITICAL: This ensures Free tier users cannot exceed limits.
 * - Free: 1 product, 50 orders/month
 * - Starter: 50 products, 500 orders/month
 * - Premium: 500 products, 5000 orders/month
 * - Custom: Unlimited
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, count } from 'drizzle-orm';
import { stores, orders, products } from '@db/schema';

// ============================================================================
// PLAN CONFIGURATION
// ============================================================================
export type PlanType = 'free' | 'starter' | 'premium' | 'custom';

export interface PlanLimits {
  max_products: number;
  max_orders: number;
  allow_store_mode: boolean;
  allow_custom_domain: boolean;
  fee_rate: number; // Platform commission rate (0.02 = 2%)
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    max_products: 1,
    max_orders: 50,
    allow_store_mode: false,
    allow_custom_domain: false,
    fee_rate: 0.02, // 2% platform fee
  },
  starter: {
    max_products: 50,
    max_orders: 500,
    allow_store_mode: true,
    allow_custom_domain: true, // Starter users can use custom domain
    fee_rate: 0.015, // 1.5% platform fee
  },
  premium: {
    max_products: 500,
    max_orders: 5000,
    allow_store_mode: true,
    allow_custom_domain: true,
    fee_rate: 0.01, // 1% platform fee
  },
  custom: {
    max_products: Infinity,
    max_orders: Infinity,
    allow_store_mode: true,
    allow_custom_domain: true,
    fee_rate: 0, // Custom deal, no standard fee
  },
};

// ============================================================================
// ERROR CODES
// ============================================================================
export const LIMIT_CODES = {
  ORDER: 'LIMIT_REACHED_ORDER',
  PRODUCT: 'LIMIT_REACHED_PRODUCT',
} as const;

export interface LimitError {
  code: string;
  message: string;
  limit: number;
  current: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  error?: LimitError;
  usage?: {
    current: number;
    limit: number;
    percentage: number;
  };
}

// ============================================================================
// HELPER: Get start of current month (UTC)
// ============================================================================
function getMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

// ============================================================================
// HELPER: Get monthly order count for store
// ============================================================================
async function getMonthlyOrderCount(
  db: ReturnType<typeof drizzle>,
  storeId: number
): Promise<number> {
  const monthStart = getMonthStart();
  
  const result = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        eq(orders.storeId, storeId),
        gte(orders.createdAt, monthStart)
      )
    );
  
  return result[0]?.count ?? 0;
}

// ============================================================================
// HELPER: Get active product count for store
// ============================================================================
async function getActiveProductCount(
  db: ReturnType<typeof drizzle>,
  storeId: number
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true)
      )
    );
  
  return result[0]?.count ?? 0;
}

// ============================================================================
// HELPER: Get store plan type
// ============================================================================
async function getStorePlan(
  db: ReturnType<typeof drizzle>,
  storeId: number
): Promise<PlanType> {
  const result = await db
    .select({ planType: stores.planType })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  return (result[0]?.planType as PlanType) || 'free';
}

// ============================================================================
// MAIN: Check usage limit
// ============================================================================
export async function checkUsageLimit(
  dbBinding: D1Database | ReturnType<typeof drizzle>,
  storeId: number,
  type: 'order' | 'product'
): Promise<LimitCheckResult> {
  // Handle both D1Database and drizzle instances
  const db = 'prepare' in dbBinding 
    ? drizzle(dbBinding as D1Database) 
    : dbBinding as ReturnType<typeof drizzle>;
  
  const planType = await getStorePlan(db, storeId);
  const limits = PLAN_LIMITS[planType];
  
  if (type === 'order') {
    const currentCount = await getMonthlyOrderCount(db, storeId);
    const maxOrders = limits.max_orders;
    
    if (currentCount >= maxOrders) {
      return {
        allowed: false,
        error: {
          code: LIMIT_CODES.ORDER,
          message: `Monthly order limit reached (${maxOrders}). Upgrade to accept more orders.`,
          limit: maxOrders,
          current: currentCount,
        },
        usage: {
          current: currentCount,
          limit: maxOrders,
          percentage: 100,
        },
      };
    }
    
    return {
      allowed: true,
      usage: {
        current: currentCount,
        limit: maxOrders,
        percentage: Math.round((currentCount / maxOrders) * 100),
      },
    };
  }
  
  if (type === 'product') {
    const currentCount = await getActiveProductCount(db, storeId);
    const maxProducts = limits.max_products;
    
    if (currentCount >= maxProducts) {
      return {
        allowed: false,
        error: {
          code: LIMIT_CODES.PRODUCT,
          message: `Product limit reached (${maxProducts}). Upgrade to add more products.`,
          limit: maxProducts,
          current: currentCount,
        },
        usage: {
          current: currentCount,
          limit: maxProducts,
          percentage: 100,
        },
      };
    }
    
    return {
      allowed: true,
      usage: {
        current: currentCount,
        limit: maxProducts,
        percentage: Math.round((currentCount / maxProducts) * 100),
      },
    };
  }
  
  // Default: allow (shouldn't reach here)
  return { allowed: true };
}

// ============================================================================
// UTILITY: Get usage stats for dashboard
// ============================================================================
export async function getUsageStats(
  dbBinding: D1Database,
  storeId: number
): Promise<{
  planType: PlanType;
  orders: { current: number; limit: number; percentage: number };
  products: { current: number; limit: number; percentage: number };
}> {
  const db = drizzle(dbBinding);
  const planType = await getStorePlan(db, storeId);
  const limits = PLAN_LIMITS[planType];
  
  const orderCount = await getMonthlyOrderCount(db, storeId);
  const productCount = await getActiveProductCount(db, storeId);
  
  return {
    planType,
    orders: {
      current: orderCount,
      limit: limits.max_orders,
      percentage: limits.max_orders === Infinity ? 0 : Math.round((orderCount / limits.max_orders) * 100),
    },
    products: {
      current: productCount,
      limit: limits.max_products,
      percentage: limits.max_products === Infinity ? 0 : Math.round((productCount / limits.max_products) * 100),
    },
  };
}

// ============================================================================
// UTILITY: Get bulk usage stats for admin dashboard (efficient N stores query)
// ============================================================================
export async function getBulkUsageStats(
  dbBinding: D1Database,
  storeIds: number[]
): Promise<Map<number, { orders: number; products: number }>> {
  // Return empty map for empty input
  if (storeIds.length === 0) return new Map();
  
  // Initialize result map with zeros for all stores
  const result = new Map<number, { orders: number; products: number }>();
  storeIds.forEach(id => result.set(id, { orders: 0, products: 0 }));
  
  try {
    const db = drizzle(dbBinding);
    const monthStart = getMonthStart();
    
    // Get monthly order counts for all stores in one query
    const orderCounts = await db
      .select({ 
        storeId: orders.storeId, 
        count: count() 
      })
      .from(orders)
      .where(gte(orders.createdAt, monthStart))
      .groupBy(orders.storeId);
    
    // Get active product counts for all stores in one query
    const productCounts = await db
      .select({ 
        storeId: products.storeId, 
        count: count() 
      })
      .from(products)
      .where(eq(products.isPublished, true))
      .groupBy(products.storeId);
    
    // Fill in order counts
    orderCounts.forEach(row => {
      const existing = result.get(row.storeId);
      if (existing) {
        existing.orders = row.count;
      }
    });
    
    // Fill in product counts
    productCounts.forEach(row => {
      const existing = result.get(row.storeId);
      if (existing) {
        existing.products = row.count;
      }
    });
  } catch (error) {
    console.error('[getBulkUsageStats] Error fetching usage stats:', error);
    // Return zeros on error - don't crash the page
  }
  
  return result;
}

// ============================================================================
// UTILITY: Check if store can use store mode
// ============================================================================
export function canUseStoreMode(planType: PlanType): boolean {
  return PLAN_LIMITS[planType].allow_store_mode;
}

// ============================================================================
// UTILITY: Get platform fee rate for plan
// ============================================================================
export function getPlatformFeeRate(planType: PlanType): number {
  return PLAN_LIMITS[planType].fee_rate;
}

// ============================================================================
// UTILITY: Check if store can use custom domain
// ============================================================================
export function canUseCustomDomain(planType: PlanType): boolean {
  return PLAN_LIMITS[planType].allow_custom_domain;
}

// ============================================================================
// UTILITY: Check if store can use AI features
// ============================================================================
export function canUseAI(planType: PlanType): boolean {
  return planType !== 'free';
}

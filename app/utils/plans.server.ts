/**
 * Plan Limits Service
 * 
 * Central logic for subscription tier usage limits.
 * 
 * BUSINESS CRITICAL: This ensures Free tier users cannot exceed limits.
 * - Free: 1 product, 50 orders/month, unlimited visitors
 * - Starter: 50 products, 500 orders/month
 * - Premium: 500 products, 5000 orders/month
 * - Custom: Unlimited
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, count, sql } from 'drizzle-orm';
import { stores, orders, products, messages, conversations, agents } from '@db/schema';

// ============================================================================
// PLAN CONFIGURATION
// ============================================================================
export type PlanType = 'free' | 'starter' | 'premium' | 'business';

// Plan display names (Bengali)
export const PLAN_NAMES: Record<PlanType, { en: string; bn: string }> = {
  free: { en: 'Free', bn: 'ফ্রি' },
  starter: { en: 'Starter', bn: 'স্টার্টার' },
  premium: { en: 'Premium', bn: 'প্রিমিয়াম' },
  business: { en: 'Business', bn: 'বিজনেস' },
};

// Plan prices in BDT
export const PLAN_PRICES: Record<PlanType, number> = {
  free: 0,
  starter: 499,
  premium: 1999,
  business: 4999, // Base price, can be customized
};

export interface PlanLimits {
  max_products: number;
  max_orders: number;
  max_visitors: number;      // Monthly unique visitors
  max_storage_mb: number;    // Image storage in MB
  max_ai_messages: number;   // Monthly AI conversation messages
  max_staff: number;         // Team members
  allow_store_mode: boolean;
  allow_custom_domain: boolean;
  allow_capi: boolean;       // Facebook Conversion API
  allow_priority_support: boolean;
  fee_rate: number;          // Platform commission rate (0.02 = 2%)
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    max_products: 1,
    max_orders: 50,
    max_visitors: Infinity, // No limit - tracking for analytics only
    max_storage_mb: 100,
    max_ai_messages: 10,
    max_staff: 1,
    allow_store_mode: false,
    allow_custom_domain: false,
    allow_capi: false,
    allow_priority_support: false,
    fee_rate: 0.02, // 2% platform fee
  },
  starter: {
    max_products: 50,
    max_orders: 500,
    max_visitors: Infinity, // No limit - tracking for analytics only
    max_storage_mb: 500,
    max_ai_messages: 100,
    max_staff: 2,
    allow_store_mode: true,
    allow_custom_domain: true,
    allow_capi: false,
    allow_priority_support: false,
    fee_rate: 0.015, // 1.5% platform fee
  },
  premium: {
    max_products: 200,
    max_orders: 3000,
    max_visitors: Infinity, // No limit - tracking for analytics only
    max_storage_mb: 2048, // 2GB
    max_ai_messages: 1000,
    max_staff: 5,
    allow_store_mode: true,
    allow_custom_domain: true,
    allow_capi: true,
    allow_priority_support: true,
    fee_rate: 0.01, // 1% platform fee
  },
  business: {
    max_products: 1000,
    max_orders: 25000,
    max_visitors: Infinity, // No limit - tracking for analytics only
    max_storage_mb: 10240, // 10GB
    max_ai_messages: Infinity,
    max_staff: 15,
    allow_store_mode: true,
    allow_custom_domain: true,
    allow_capi: true,
    allow_priority_support: true,
    fee_rate: 0.005, // 0.5% platform fee
  },
};

// Legacy alias for backward compatibility
export const PLAN_LIMITS_LEGACY: Record<string, PlanLimits> = {
  ...PLAN_LIMITS,
  custom: PLAN_LIMITS.business, // Map old 'custom' to new 'business'
};

// ============================================================================
// ERROR CODES
// ============================================================================
export const LIMIT_CODES = {
  ORDER: 'LIMIT_REACHED_ORDER',
  PRODUCT: 'LIMIT_REACHED_PRODUCT',
  VISITOR: 'LIMIT_REACHED_VISITOR',
  STORAGE: 'LIMIT_REACHED_STORAGE',
  AI: 'LIMIT_REACHED_AI',
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
// HELPER: Get monthly AI message count for store
// ============================================================================
async function getMonthlyAiMessageCount(
  db: ReturnType<typeof drizzle>,
  storeId: number
): Promise<number> {
  const monthStart = getMonthStart();
  
  // Count user messages for this store's agent created this month
  const result = await db
    .select({ count: count() })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .innerJoin(agents, eq(conversations.agentId, agents.id))
    .where(
      and(
        eq(agents.storeId, storeId),
        eq(messages.role, 'user'),
        gte(messages.createdAt, monthStart)
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
  type: 'order' | 'product' | 'ai_message'
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
  
  if (type === 'ai_message') {
    const currentCount = await getMonthlyAiMessageCount(db, storeId);
    const maxMessages = limits.max_ai_messages;
    
    if (currentCount >= maxMessages) {
      return {
        allowed: false,
        error: {
          code: LIMIT_CODES.AI,
          message: `Monthly AI message limit reached (${maxMessages}). Upgrade for more AI capacity.`,
          limit: maxMessages,
          current: currentCount,
        },
        usage: {
          current: currentCount,
          limit: maxMessages,
          percentage: 100,
        },
      };
    }
    
    return {
      allowed: true,
      usage: {
        current: currentCount,
        limit: maxMessages,
        percentage: maxMessages === Infinity ? 0 : Math.round((currentCount / maxMessages) * 100),
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
  visitors: { current: number; limit: number; percentage: number };
}> {
  const db = drizzle(dbBinding);
  const planType = await getStorePlan(db, storeId);
  const limits = PLAN_LIMITS[planType];
  
  const orderCount = await getMonthlyOrderCount(db, storeId);
  const productCount = await getActiveProductCount(db, storeId);
  
  // Get visitor count from stores table
  const storeResult = await db
    .select({ monthlyVisitorCount: stores.monthlyVisitorCount })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const visitorCount = storeResult[0]?.monthlyVisitorCount ?? 0;
  
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
    visitors: {
      current: visitorCount,
      limit: limits.max_visitors,
      percentage: limits.max_visitors === Infinity ? 0 : Math.round((visitorCount / limits.max_visitors) * 100),
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

// ============================================================================
// UTILITY: Check if store can use CAPI (Conversion API)
// ============================================================================
export function canUseCAPI(planType: PlanType): boolean {
  return PLAN_LIMITS[planType].allow_capi;
}

// ============================================================================
// UTILITY: Check if store has priority support
// ============================================================================
export function hasPrioritySupport(planType: PlanType): boolean {
  return PLAN_LIMITS[planType].allow_priority_support;
}

// ============================================================================
// UTILITY: Get plan limits safely (with fallback to free for invalid plans)
// ============================================================================
export function getPlanLimitsSafe(planType: string): PlanLimits {
  if (planType in PLAN_LIMITS) {
    return PLAN_LIMITS[planType as PlanType];
  }
  // Check legacy alias
  if (planType in PLAN_LIMITS_LEGACY) {
    return PLAN_LIMITS_LEGACY[planType];
  }
  // Fallback to free
  console.warn(`[PLANS] Unknown plan type "${planType}", falling back to free`);
  return PLAN_LIMITS.free;
}

// ============================================================================
// UTILITY: Check visitor limit (to be used with visitor tracking)
// ============================================================================
export function checkVisitorLimit(
  planType: PlanType,
  currentVisitors: number
): LimitCheckResult {
  const limits = PLAN_LIMITS[planType];
  const maxVisitors = limits.max_visitors;
  
  const percentage = Math.round((currentVisitors / maxVisitors) * 100);
  
  if (currentVisitors >= maxVisitors) {
    return {
      allowed: false,
      error: {
        code: LIMIT_CODES.VISITOR,
        message: `Visitor limit reached (${maxVisitors.toLocaleString()}). Upgrade for more traffic.`,
        limit: maxVisitors,
        current: currentVisitors,
      },
      usage: {
        current: currentVisitors,
        limit: maxVisitors,
        percentage: 100,
      },
    };
  }
  
  return {
    allowed: true,
    usage: {
      current: currentVisitors,
      limit: maxVisitors,
      percentage,
    },
  };
}

// ============================================================================
// UTILITY: Get warning level for usage percentage
// ============================================================================
export type WarningLevel = 'none' | 'warning' | 'critical' | 'exceeded';

export function getWarningLevel(percentage: number): WarningLevel {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'none';
}

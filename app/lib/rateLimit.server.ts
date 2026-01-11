/**
 * Rate Limiting Service for AI Features & Auth
 * 
 * Uses Cloudflare KV to track usage.
 * Features:
 * - AI usage per store (Daily limit)
 * - Auth attempts per IP (Hourly limit)
 */

import type { PlanType, AIPlanType } from '~/utils/plans.server';
import { STORE_AI_DAILY_LIMITS, AI_PLAN_LIMITS } from '~/utils/plans.server';
import { checkUsageLimit } from '~/utils/plans.server';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

// Rate limits are now imported from plans.server.ts
// Re-export for backward compatibility if needed, or remove
// const AI_RATE_LIMITS = STORE_AI_DAILY_LIMITS;

// Auth Limits (per hour)
const AUTH_LIMITS = {
  login: 10,     // 10 failed attempts per hour
  register: 5,   // 5 registration attempts per hour
};

// KV key format: ai_usage:{storeId}:{date}
export function getUsageKey(storeId: number): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `ai_usage:${storeId}:${today}`;
}

/**
 * Get current AI usage for a store (Read-only)
 */
export async function getStoreAIUsage(kv: KVNamespace | undefined, storeId: number): Promise<number> {
  if (!kv) return 0;
  
  const key = getUsageKey(storeId);
  const currentUsage = await kv.get(key);
  return currentUsage ? parseInt(currentUsage, 10) : 0;
}

/**
 * Check if store has remaining AI requests
 * Supports Hybrid: Daily (KV) for trials, Monthly (D1) for paid plans.
 */
export async function checkAIRateLimit(
  kv: KVNamespace | undefined,
  dbBinding: D1Database | undefined,
  storeId: number,
  planType: PlanType,
  aiPlan: AIPlanType | null
): Promise<{ allowed: boolean; remaining: number; limit: number; type: 'daily' | 'monthly' }> {
  
  // 1. If User has Paid AI Plan -> Check Monthly Limit (D1)
  if (aiPlan) {
    if (!dbBinding) {
       // Fallback/Error if DB not provided but AI plan exists? 
       // Should allow or block? Let's block to be safe, or allow on error.
       console.error('[Rate Limit] DB not provided for AI Plan check');
       return { allowed: false, remaining: 0, limit: 0, type: 'monthly' };
    }

    // Reuse existing logic from plans.server implementation
    const result = await checkUsageLimit(dbBinding, storeId, 'ai_message');
    
    if (!result.allowed && result.error) {
        return { 
            allowed: false, 
            remaining: 0, 
            limit: result.error.limit,
            type: 'monthly'
        };
    }
    
    // Calculate remaining from usage result
    const usage = result.usage?.current || 0;
    const limit = result.usage?.limit || AI_PLAN_LIMITS[aiPlan];
    
    return {
        allowed: true,
        remaining: Math.max(0, limit - usage),
        limit,
        type: 'monthly'
    };
  }

  // 2. If User has NO AI Plan -> Check Daily Trial Limit (KV)
  const limit = STORE_AI_DAILY_LIMITS[planType];
  
  // Unlimited for some logic? No, STORE_AI_DAILY_LIMITS are fixed.
  // Unless we want 'business' to mean something else. 
  // Currently defined as: free:1, starter:5, premium:30, business:100.
  
  if (!kv) {
    console.warn('[Rate Limit] KV namespace not configured, allowing request');
    return { allowed: true, remaining: limit, limit, type: 'daily' };
  }

  const currentUsage = await getStoreAIUsage(kv, storeId);
  const remaining = Math.max(0, limit - currentUsage);

  return {
    allowed: currentUsage < limit,
    remaining,
    limit,
    type: 'daily'
  };
}

/**
 * Increment AI usage count for store
 * ONLY increments KV (Daily). D1 (Monthly) is auto-incremented by message insertion.
 */
export async function incrementAIUsage(
    kv: KVNamespace | undefined, 
    storeId: number,
    isDailyMode: boolean = true
) {
  if (!isDailyMode) return; // Don't increment KV if we are on Monthly plan usage
  if (!kv) return;
  
  const key = getUsageKey(storeId);
  const currentUsage = await getStoreAIUsage(kv, storeId);
  
  // Expire after 24 hours (86400 seconds)
  await kv.put(key, (currentUsage + 1).toString(), { expirationTtl: 86400 });
}


// ============================================================================
// AUTH RATE LIMITING (IP Based)
// ============================================================================

function getAuthKey(ip: string, type: 'login' | 'register'): string {
  // Key format: auth:{type}:{ip}
  // Sanitize IP to replace colons for KV safety if needed, though KV supports special chars generally.
  return `auth:${type}:${ip.replace(/:/g, '_')}`;
}

/**
 * Check and Increment Auth Rate Limit
 * Returns true if allowed, false if blocked.
 * Automatically increments count.
 */
export async function checkAuthRateLimit(
  kv: KVNamespace | undefined,
  ip: string,
  type: 'login' | 'register'
): Promise<{ allowed: boolean; remaining: number, resetInSeconds: number }> {
    if (!kv) {
      console.warn('[Rate Limit] KV namespace not configured, allowing auth request');
      return { allowed: true, remaining: 999, resetInSeconds: 0 };
    }

    const limit = AUTH_LIMITS[type];
    const key = getAuthKey(ip, type);
    const countStr = await kv.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= limit) {
        return { allowed: false, remaining: 0, resetInSeconds: 3600 };
    }

    // Increment
    // Set strictly to 1 hour (3600) from first attempt or refresh? 
    // Simple approach: refresh TTL on every write to keep window moving if attacks persist.
    await kv.put(key, (count + 1).toString(), { expirationTtl: 3600 });

    return { allowed: true, remaining: limit - (count + 1), resetInSeconds: 3600 };
}

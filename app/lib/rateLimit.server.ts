/**
 * Rate Limiting Service for AI Features
 * 
 * Uses Cloudflare KV to track daily AI usage per store.
 * Free users: 5 requests/day
 * Paid users: Unlimited
 */

import type { PlanType } from '~/utils/plans.server';

// Rate limits per plan
const AI_RATE_LIMITS: Record<PlanType, number> = {
  free: 5,      // 5 AI requests per day
  starter: 100, // 100 per day (effectively unlimited for most)
  premium: -1,  // Unlimited
  custom: -1,   // Unlimited
};

// KV key format: ai_usage:{storeId}:{date}
function getUsageKey(storeId: number): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `ai_usage:${storeId}:${today}`;
}

/**
 * Check if store has remaining AI requests
 */
export async function checkAIRateLimit(
  kv: KVNamespace | undefined,
  storeId: number,
  planType: PlanType
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = AI_RATE_LIMITS[planType];
  
  // Unlimited for premium/custom
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  // If KV not configured, allow but log warning
  if (!kv) {
    console.warn('[Rate Limit] KV namespace not configured, allowing request');
    return { allowed: true, remaining: limit, limit };
  }

  const key = getUsageKey(storeId);
  const currentUsage = await kv.get(key);
  const usageCount = currentUsage ? parseInt(currentUsage, 10) : 0;
  const remaining = Math.max(0, limit - usageCount);

  return {
    allowed: usageCount < limit,
    remaining,
    limit,
  };
}

/**
 * Increment AI usage count for store
 */
export async function incrementAIUsage(
  kv: KVNamespace | undefined,
  storeId: number
): Promise<void> {
  if (!kv) {
    console.warn('[Rate Limit] KV namespace not configured, skipping increment');
    return;
  }

  const key = getUsageKey(storeId);
  const currentUsage = await kv.get(key);
  const newCount = (currentUsage ? parseInt(currentUsage, 10) : 0) + 1;

  // TTL: 24 hours (86400 seconds) to auto-expire at end of day
  await kv.put(key, String(newCount), { expirationTtl: 86400 });
}

/**
 * Get current AI usage for store (for display in UI)
 */
export async function getAIUsageStats(
  kv: KVNamespace | undefined,
  storeId: number,
  planType: PlanType
): Promise<{ used: number; limit: number; unlimited: boolean }> {
  const limit = AI_RATE_LIMITS[planType];

  if (limit === -1) {
    return { used: 0, limit: -1, unlimited: true };
  }

  if (!kv) {
    return { used: 0, limit, unlimited: false };
  }

  const key = getUsageKey(storeId);
  const currentUsage = await kv.get(key);
  const used = currentUsage ? parseInt(currentUsage, 10) : 0;

  return { used, limit, unlimited: false };
}

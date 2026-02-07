/**
 * Rate Limiting Service for AI Features & Auth
 * 
 * Uses Cloudflare KV to track usage.
 * Features:
 * - AI usage per store (Daily limit)
 * - Auth attempts per IP (Hourly limit)
 */

// Rate limits are now imported from plans.server.ts
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

// checkAIRateLimit removed as it was unused and relied on old AI Plans.
// Use requireCredits from ai-credits.server instead for limit checks.

/**
 * Increment AI usage count for store
 * ONLY increments KV (Daily). D1 (Monthly) is auto-incremented by message insertion.
 */
export async function incrementAIUsage(
    kv: KVNamespace | undefined, 
    storeId: number,
    _isDailyMode: boolean = true
) {
  // isDailyMode ignored, just tracking usage stats
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

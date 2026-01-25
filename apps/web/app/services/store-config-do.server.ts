/**
 * Store Config Cache DO Service - Helper functions for fast store config access
 * 
 * Problem solved:
 * Every request ──► DB query for store config ──► Slow! 🐢
 * 
 * Solution:
 * First request ──► DB query ──► Cache in DO
 * Next 59 requests ──► DO memory ──► Instant! ✅
 * 
 * Usage:
 * ```ts
 * import { getStoreConfig, invalidateStoreConfig } from '~/services/store-config-do.server';
 * 
 * // In loader
 * const config = await getStoreConfig(env, storeId);
 * 
 * // After store settings update
 * await invalidateStoreConfig(env, storeId);
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface StoreConfig {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
  logo?: string;
  favicon?: string;
  description?: string;
  currency: string;
  locale: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  settings: Record<string, unknown>;
  theme: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StoreConfigResponse {
  success: boolean;
  config?: StoreConfig;
  cached?: boolean;
  stale?: boolean;
  cacheAge?: number;
  expiresIn?: number;
  error?: string;
}

export interface CacheStatus {
  cached: boolean;
  storeId: number;
  cacheAge?: number;
  expiresIn?: number;
  isExpired?: boolean;
  isStale?: boolean;
  ttlMs?: number;
  maxAgeMs?: number;
  fetchedAt?: string;
  expiresAt?: string;
}

interface Env {
  STORE_CONFIG_SERVICE: Fetcher;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get store config (from cache or DB)
 * Uses stale-while-revalidate pattern for optimal performance
 */
export async function getStoreConfig(
  env: Env, 
  storeId: number
): Promise<StoreConfigResponse> {
  try {
    const response = await env.STORE_CONFIG_SERVICE.fetch(
      `http://internal/do/${storeId}/get?storeId=${storeId}`,
      { method: 'GET' }
    );
    
    return await response.json() as StoreConfigResponse;
  } catch (error) {
    console.error('getStoreConfig error:', error);
    return { success: false, error: 'Failed to get store config' };
  }
}

/**
 * Invalidate store config cache
 * Call this after updating store settings
 */
export async function invalidateStoreConfig(
  env: Env, 
  storeId: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await env.STORE_CONFIG_SERVICE.fetch(
      `http://internal/do/${storeId}/invalidate`,
      { method: 'POST' }
    );
    
    return await response.json() as { success: boolean; message?: string };
  } catch (error) {
    console.error('invalidateStoreConfig error:', error);
    return { success: false };
  }
}

/**
 * Force refresh store config from DB
 * Useful after major config changes
 */
export async function refreshStoreConfig(
  env: Env, 
  storeId: number
): Promise<StoreConfigResponse> {
  try {
    const response = await env.STORE_CONFIG_SERVICE.fetch(
      `http://internal/do/${storeId}/refresh?storeId=${storeId}`,
      { method: 'POST' }
    );
    
    return await response.json() as StoreConfigResponse;
  } catch (error) {
    console.error('refreshStoreConfig error:', error);
    return { success: false, error: 'Failed to refresh store config' };
  }
}

/**
 * Get cache status for debugging
 */
export async function getStoreConfigCacheStatus(
  env: Env, 
  storeId: number
): Promise<CacheStatus> {
  try {
    const response = await env.STORE_CONFIG_SERVICE.fetch(
      `http://internal/do/${storeId}/status`,
      { method: 'GET' }
    );
    
    return await response.json() as CacheStatus;
  } catch (error) {
    console.error('getStoreConfigCacheStatus error:', error);
    return { cached: false, storeId };
  }
}

/**
 * Get store config with fallback to direct DB query
 * Use this for critical paths where cache failure shouldn't break the app
 */
export async function getStoreConfigWithFallback(
  env: Env & { DB: D1Database }, 
  storeId: number
): Promise<StoreConfig | null> {
  // Try cache first
  const cacheResult = await getStoreConfig(env, storeId);
  
  if (cacheResult.success && cacheResult.config) {
    return cacheResult.config;
  }
  
  // Fallback to direct DB query
  console.warn(`Store config cache miss for store ${storeId}, falling back to DB`);
  
  try {
    const result = await env.DB.prepare(`
      SELECT 
        id, name, slug, domain, custom_domain as customDomain,
        logo, favicon, description, currency, locale, timezone,
        status, plan, settings, theme, created_at as createdAt, updated_at as updatedAt
      FROM stores 
      WHERE id = ?
    `).bind(storeId).first<{
      id: number;
      name: string;
      slug: string;
      domain: string | null;
      customDomain: string | null;
      logo: string | null;
      favicon: string | null;
      description: string | null;
      currency: string;
      locale: string;
      timezone: string;
      status: string;
      plan: string;
      settings: string | null;
      theme: string | null;
      createdAt: string;
      updatedAt: string;
    }>();
    
    if (!result) {
      return null;
    }
    
    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      domain: result.domain || undefined,
      customDomain: result.customDomain || undefined,
      logo: result.logo || undefined,
      favicon: result.favicon || undefined,
      description: result.description || undefined,
      currency: result.currency || 'BDT',
      locale: result.locale || 'bn-BD',
      timezone: result.timezone || 'Asia/Dhaka',
      status: (result.status as StoreConfig['status']) || 'active',
      plan: (result.plan as StoreConfig['plan']) || 'free',
      settings: result.settings ? JSON.parse(result.settings) : {},
      theme: result.theme ? JSON.parse(result.theme) : {},
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  } catch (error) {
    console.error('getStoreConfigWithFallback DB error:', error);
    return null;
  }
}

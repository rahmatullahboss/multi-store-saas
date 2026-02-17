/**
 * Store Config Cache Worker - Durable Objects for Fast Store Config Access
 * 
 * Solves the repeated DB query problem:
 * Every request ──► DB query for store config ──► Slow! 🐢
 * 
 * Solution:
 * First request ──► DB query ──► Cache in DO
 * Next 59 requests ──► DO memory ──► Instant! ✅
 * 
 * ============================================================================
 * ARCHITECTURE
 * ============================================================================
 * 
 * DO ID Pattern: store-{storeId}
 * - One DO per store
 * - 1-minute TTL in-memory cache
 * - Instant invalidation on config update
 * - Fetches from D1 on cache miss
 * 
 * FREE TIER COMPATIBLE:
 * - In-memory cache (no storage cost)
 * - Minimal D1 queries
 */

import { DurableObject } from "cloudflare:workers";

// ============================================================================
// CONSTANTS
// ============================================================================

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const CONFIG = {
  // Cache TTL (1 minute)
  CACHE_TTL_MS: 1 * MINUTES,
  
  // Max cache age before forced refresh (5 minutes)
  MAX_CACHE_AGE_MS: 5 * MINUTES,
  
  // Stale-while-revalidate window
  STALE_TTL_MS: 30 * SECONDS,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface StoreConfig {
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

interface CacheEntry {
  config: StoreConfig;
  fetchedAt: number;
  expiresAt: number;
}

interface Env {
  STORE_CONFIG: DurableObjectNamespace;
  DB: D1Database;
  WORKER_ENV?: string;
}

// ============================================================================
// STORE CONFIG CACHE DURABLE OBJECT
// ============================================================================

export class StoreConfigCache extends DurableObject<Env> {
  private cache: CacheEntry | null = null;
  private storeId: number = 0;
  private fetchPromise: Promise<StoreConfig | null> | null = null;
  private readonly isProd: boolean;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.isProd = env.WORKER_ENV === 'production';
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/get':
          return await this.getConfig(url.searchParams);
          
        case '/invalidate':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.invalidateCache();
          
        case '/refresh':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return await this.forceRefresh(url.searchParams);
          
        case '/status':
          return this.getCacheStatus();
          
        case '/health':
          return Response.json({ 
            status: 'ok', 
            cached: this.cache !== null,
            storeId: this.storeId,
          });
        
        case '/test-db':
          if (this.isProd) {
            return Response.json({ error: 'Not found' }, { status: 404 });
          }
          // Direct DB test
          try {
            const result = await this.env.DB.prepare("SELECT id, name FROM stores LIMIT 1").first();
            return Response.json({ success: true, result });
          } catch (dbErr) {
            return Response.json({ success: false, error: String(dbErr) });
          }
          
        default:
          return Response.json({ error: 'Not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('StoreConfigCache error:', error);
      return Response.json({ 
        error: 'Internal error', 
        details: error instanceof Error ? error.message : String(error),
        stack: this.isProd ? undefined : (error instanceof Error ? error.stack : undefined)
      }, { status: 500 });
    }
  }

  /**
   * Get store config (from cache or DB)
   */
  private async getConfig(params: URLSearchParams): Promise<Response> {
    const storeIdParam = params.get('storeId');
    if (!storeIdParam) {
      return Response.json({ 
        success: false, 
        error: 'storeId required' 
      }, { status: 400 });
    }
    
    const storeId = parseInt(storeIdParam, 10);
    if (isNaN(storeId)) {
      return Response.json({ 
        success: false, 
        error: 'Invalid storeId' 
      }, { status: 400 });
    }
    
    this.storeId = storeId;
    const now = Date.now();
    
    // Check cache
    if (this.cache) {
      const cacheAge = now - this.cache.fetchedAt;
      
      // Fresh cache - return immediately
      if (now < this.cache.expiresAt) {
        return Response.json({ 
          success: true, 
          config: this.cache.config,
          cached: true,
          cacheAge,
          expiresIn: this.cache.expiresAt - now,
        });
      }
      
      // Stale cache - return stale but refresh in background
      if (cacheAge < CONFIG.MAX_CACHE_AGE_MS) {
        // Trigger background refresh
        this.ctx.waitUntil(this.refreshCache(storeId));
        
        return Response.json({ 
          success: true, 
          config: this.cache.config,
          cached: true,
          stale: true,
          cacheAge,
        });
      }
    }
    
    // No cache or too stale - fetch synchronously
    const config = await this.fetchFromDB(storeId);
    
    if (!config) {
      return Response.json({ 
        success: false, 
        error: 'Store not found' 
      }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      config,
      cached: false,
    });
  }

  /**
   * Fetch store config from D1 database
   */
  private async fetchFromDB(storeId: number): Promise<StoreConfig | null> {
    // Prevent duplicate fetches
    if (this.fetchPromise) {
      return this.fetchPromise;
    }
    
    this.fetchPromise = (async () => {
      try {
        // Query based on actual schema columns
        const result = await this.env.DB.prepare(`
          SELECT 
            id, name, subdomain, custom_domain,
            logo, favicon, currency, 
            plan_type, subscription_status, usage_limits,
            is_active, theme_config, created_at, updated_at
          FROM stores 
          WHERE id = ?
        `).bind(storeId).first<{
          id: number;
          name: string;
          subdomain: string;
          custom_domain: string | null;
          logo: string | null;
          favicon: string | null;
          currency: string | null;
          plan_type: string | null;
          subscription_status: string | null;
          usage_limits: string | null;
          is_active: number | null;
          theme_config: string | null;
          created_at: number | null;
          updated_at: number | null;
        }>();
        
        if (!result) {
          return null;
        }
        
        const config: StoreConfig = {
          id: result.id,
          name: result.name,
          slug: result.subdomain,
          domain: result.subdomain ? `${result.subdomain}.ozzyl.com` : undefined,
          customDomain: result.custom_domain || undefined,
          logo: result.logo || undefined,
          favicon: result.favicon || undefined,
          description: undefined,
          currency: result.currency || 'BDT',
          locale: 'bn-BD',
          timezone: 'Asia/Dhaka',
          status: result.is_active === 1 ? 'active' : 'inactive',
          plan: (result.plan_type as StoreConfig['plan']) || 'free',
          settings: result.usage_limits ? JSON.parse(result.usage_limits) : {},
          theme: result.theme_config ? JSON.parse(result.theme_config) : {},
          createdAt: result.created_at ? new Date(result.created_at * 1000).toISOString() : new Date().toISOString(),
          updatedAt: result.updated_at ? new Date(result.updated_at * 1000).toISOString() : new Date().toISOString(),
        };
        
        // Update cache
        const now = Date.now();
        this.cache = {
          config,
          fetchedAt: now,
          expiresAt: now + CONFIG.CACHE_TTL_MS,
        };
        
        return config;
      } catch (error) {
        console.error('Error fetching store config:', error);
        throw error;
      } finally {
        this.fetchPromise = null;
      }
    })();
    
    return this.fetchPromise;
  }

  /**
   * Refresh cache in background
   */
  private async refreshCache(storeId: number): Promise<void> {
    try {
      await this.fetchFromDB(storeId);
      if (!this.isProd) {
        console.log(`Store config cache refreshed for store ${storeId}`);
      }
    } catch (error) {
      console.error(`Failed to refresh store config cache for store ${storeId}:`, error);
    }
  }

  /**
   * Invalidate cache (called when store config is updated)
   */
  private async invalidateCache(): Promise<Response> {
    this.cache = null;
    
    if (!this.isProd) {
      console.log(`Store config cache invalidated for store ${this.storeId}`);
    }
    
    return Response.json({ 
      success: true, 
      message: 'Cache invalidated',
      storeId: this.storeId,
    });
  }

  /**
   * Force refresh cache from DB
   */
  private async forceRefresh(params: URLSearchParams): Promise<Response> {
    const storeIdParam = params.get('storeId');
    if (!storeIdParam) {
      return Response.json({ 
        success: false, 
        error: 'storeId required' 
      }, { status: 400 });
    }
    
    const storeId = parseInt(storeIdParam, 10);
    this.storeId = storeId;
    
    // Clear cache and fetch fresh
    this.cache = null;
    const config = await this.fetchFromDB(storeId);
    
    if (!config) {
      return Response.json({ 
        success: false, 
        error: 'Store not found' 
      }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      config,
      message: 'Cache refreshed',
    });
  }

  /**
   * Get cache status
   */
  private getCacheStatus(): Response {
    const now = Date.now();
    
    if (!this.cache) {
      return Response.json({
        cached: false,
        storeId: this.storeId,
      });
    }
    
    const cacheAge = now - this.cache.fetchedAt;
    const isExpired = now > this.cache.expiresAt;
    const isStale = isExpired && cacheAge < CONFIG.MAX_CACHE_AGE_MS;
    
    return Response.json({
      cached: true,
      storeId: this.storeId,
      cacheAge,
      expiresIn: Math.max(0, this.cache.expiresAt - now),
      isExpired,
      isStale,
      ttlMs: CONFIG.CACHE_TTL_MS,
      maxAgeMs: CONFIG.MAX_CACHE_AGE_MS,
      fetchedAt: new Date(this.cache.fetchedAt).toISOString(),
      expiresAt: new Date(this.cache.expiresAt).toISOString(),
    });
  }
}

// ============================================================================
// WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Route: /do/:storeId/* - Forward to Durable Object
    const match = url.pathname.match(/^\/do\/(\d+)(\/.*)$/);
    if (match) {
      const storeId = match[1];
      const doPath = match[2] || '/';

      if (env.WORKER_ENV !== 'production') {
        const origin = request.headers.get('Origin') || 'unknown';
        const referer = request.headers.get('Referer') || 'unknown';
        console.log(`[StoreConfig] Request for store ${storeId} from ${origin} (Ref: ${referer})`);
      }
      
      const id = env.STORE_CONFIG.idFromName(`store-${storeId}`);
      const stub = env.STORE_CONFIG.get(id);
      
      // Forward request to DO with modified URL
      const doUrl = new URL(request.url);
      doUrl.pathname = doPath;
      doUrl.searchParams.set('storeId', storeId);
      
      return stub.fetch(new Request(doUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }));
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'store-config' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};

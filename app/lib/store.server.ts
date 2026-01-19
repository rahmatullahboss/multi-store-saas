/**
 * Store Resolution Helper
 * 
 * Resolves the current store from context or database for storefront routes.
 * Used by public-facing routes like product pages, cart, checkout.
 * 
 * Supports two modes:
 * - Landing Mode: Only landing pages and custom pages are accessible
 * - Store Mode: Full e-commerce (products, collections, cart, checkout)
 */

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, type Store } from '@db/schema';
import { 
  resolveTemplate, 
  type TemplateResolution,
  type ThemeSettings,
  type TemplateKey,
} from './template-resolver.server';
import { ensureTheme } from './theme-seeding.server';

// ============================================================================
// TYPES
// ============================================================================

export type StoreMode = 'landing' | 'store';

export interface StoreContext {
  storeId: number;
  store: Store;
  mode: StoreMode;
}

export interface StoreContextWithTemplate extends StoreContext {
  template: TemplateResolution | null;
  theme: ThemeSettings | null;
}

// ============================================================================
// MODE UTILITIES
// ============================================================================

/**
 * Check if store is in store mode (full e-commerce enabled)
 */
export function isStoreModeEnabled(store: Store): boolean {
  // Check the storeMode field - defaults to 'landing' if not set
  const mode = (store as unknown as { storeMode?: string }).storeMode;
  return mode === 'store';
}

/**
 * Check if a route is allowed in the current store mode
 * Landing mode: only /, /p/:slug (landing pages)
 * Store mode: all routes enabled
 */
export function isRouteAllowedForMode(pathname: string, mode: StoreMode): boolean {
  if (mode === 'store') {
    // All routes allowed in store mode
    return true;
  }
  
  // Landing mode - only allow landing pages and custom pages
  const landingOnlyPatterns = [
    /^\/$/,                    // Home (landing)
    /^\/p\/[^/]+$/,           // Landing pages /p/:slug
    /^\/o\/[^/]+$/,           // Offer pages /o/:slug
    /^\/pages\/[^/]+$/,       // Custom pages /pages/:slug (Shopify-style)
    /^\/about$/,
    /^\/contact$/,
    /^\/policies\/.*/,
    /^\/privacy$/,
    /^\/terms$/,
    /^\/refund$/,
  ];
  
  return landingOnlyPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Get restricted routes for landing mode (for error messaging)
 */
export function getRestrictedRoutes(): string[] {
  return [
    '/products',
    '/products/:id',
    '/collections',
    '/collections/:slug',
    '/cart',
    '/checkout',
    '/account',
  ];
}

// ============================================================================
// STORE RESOLUTION
// ============================================================================

/**
 * Get store from context or resolve from database
 * 
 * In development (localhost), defaults to first active store.
 * In production, store is resolved by tenant middleware.
 */
export async function resolveStore(
  context: { storeId?: number; store?: Store | null; cloudflare: { env: { DB: D1Database } } },
  request: Request
): Promise<StoreContext | null> {
  // If store is already resolved in context
  if (context.storeId && context.storeId > 0 && context.store) {
    const mode = isStoreModeEnabled(context.store) ? 'store' : 'landing';
    return {
      storeId: context.storeId,
      store: context.store,
      mode,
    };
  }

  // Otherwise, resolve from database (development fallback)
  const db = drizzle(context.cloudflare.env.DB);
  
  // Check for store query param in development
  const url = new URL(request.url);
  const storeParam = url.searchParams.get('store');
  
  let store: Store | undefined;

  if (storeParam) {
    // Find by subdomain
    const result = await db
      .select()
      .from(stores)
      .where(eq(stores.subdomain, storeParam))
      .limit(1);
    store = result[0];
  }
  
  // If no store param or not found, get first active store
  if (!store) {
    const result = await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, true))
      .limit(1);
    store = result[0];
  }

  if (!store) {
    return null;
  }

  const mode = isStoreModeEnabled(store) ? 'store' : 'landing';

  return {
    storeId: store.id,
    store,
    mode,
  };
}

// ============================================================================
// TEMPLATE-AWARE STORE RESOLUTION
// ============================================================================

/**
 * Resolve store with template data for a specific page type
 * Auto-seeds theme if store is in store mode but has no theme
 */
export async function resolveStoreWithTemplate(
  context: { storeId?: number; store?: Store | null; cloudflare: { env: { DB: D1Database } } },
  request: Request,
  templateKey: TemplateKey
): Promise<StoreContextWithTemplate | null> {
  const storeContext = await resolveStore(context, request);
  
  if (!storeContext) {
    return null;
  }
  
  // Only resolve template if in store mode
  if (storeContext.mode !== 'store') {
    return {
      ...storeContext,
      template: null,
      theme: null,
    };
  }
  
  const db = context.cloudflare.env.DB;
  
  // Ensure store has a theme (auto-seed if needed)
  await ensureTheme(db, storeContext.storeId);
  
  // Resolve template for the requested page type
  const template = await resolveTemplate(db, storeContext.storeId, templateKey);
  
  return {
    ...storeContext,
    template,
    theme: template?.settings || null,
  };
}

/**
 * Middleware-style check for route access
 * Returns error response if route not allowed for store mode
 */
export function checkRouteAccess(
  pathname: string, 
  mode: StoreMode
): { allowed: true } | { allowed: false; redirectTo: string; message: string } {
  if (isRouteAllowedForMode(pathname, mode)) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    redirectTo: '/',
    message: 'This feature requires upgrading to Store Mode. Please upgrade your plan to access products, cart, and checkout.',
  };
}

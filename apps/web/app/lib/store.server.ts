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

import { eq, and, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, type Store } from '@db/schema';
import {
  type ResolvedSection,
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
    /^\/$/, // Home (landing)
    /^\/p\/[^/]+$/, // Landing pages /p/:slug
    /^\/o\/[^/]+$/, // Offer pages /o/:slug
    /^\/pages\/[^/]+$/, // Custom pages /pages/:slug (Shopify-style)
    /^\/about$/,
    /^\/contact$/,
    /^\/policies\/.*/,
    /^\/privacy$/,
    /^\/terms$/,
    /^\/refund$/,
  ];

  return landingOnlyPatterns.some((pattern) => pattern.test(pathname));
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
    // Find by subdomain (exclude soft-deleted stores)
    const result = await db
      .select()
      .from(stores)
      .where(and(eq(stores.subdomain, storeParam), isNull(stores.deletedAt)))
      .limit(1);
    store = result[0];
  }

  // If no store param or not found, get first active store (exclude soft-deleted)
  if (!store) {
    const result = await db
      .select()
      .from(stores)
      .where(and(eq(stores.isActive, true), isNull(stores.deletedAt)))
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

  // FALLBACK: If no published template, try to build from themeConfig
  if (!template || !template.sections || template.sections.length === 0) {
    const themeConfigFallback = buildTemplateFromThemeConfig(storeContext.store, templateKey);
    if (themeConfigFallback) {
      return {
        ...storeContext,
        template: themeConfigFallback,
        theme: themeConfigFallback.settings || null,
      };
    }
  }

  return {
    ...storeContext,
    template,
    theme: template?.settings || null,
  };
}

/**
 * Build template resolution from legacy themeConfig (fallback)
 * This ensures backward compatibility during migration
 */
function buildTemplateFromThemeConfig(
  store: Store,
  templateKey: TemplateKey
): TemplateResolution | null {
  try {
    const themeConfigRaw = (store as unknown as { themeConfig?: string }).themeConfig;
    if (!themeConfigRaw) return null;

    const themeConfig =
      typeof themeConfigRaw === 'string' ? JSON.parse(themeConfigRaw) : themeConfigRaw;

    // Only handle 'home' template for now
    if (templateKey !== 'home') return null;

    // Get sections from themeConfig
    const sections = themeConfig.sections || [];
    if (sections.length === 0) return null;

    // Build settings from themeConfig
    const settings: ThemeSettings = {
      colors: {
        primary: themeConfig.primaryColor || '#000000',
        secondary: themeConfig.accentColor || '#666666',
        accent: themeConfig.accentColor || '#ff6b00',
        background: themeConfig.backgroundColor || '#ffffff',
        text: themeConfig.textColor || '#333333',
        muted: themeConfig.mutedColor || '#f5f5f5',
      },
      typography: {
        fontFamily: themeConfig.typography?.fontFamily || 'Inter',
        headingFont: themeConfig.typography?.headingFont || 'Inter',
        baseFontSize: themeConfig.typography?.baseFontSize || '16px',
      },
      layout: {
        containerWidth: themeConfig.layout?.containerWidth || '1280px',
        sidebarPosition: themeConfig.layout?.sidebarPosition || 'left',
      },
    };

    // Convert sections to ResolvedSection format
    const resolvedSections: ResolvedSection[] = sections.map(
      (
        section: { id: string; type: string; settings?: Record<string, unknown> },
        index: number
      ) => ({
        id: section.id || `section_${index}`,
        type: section.type,
        sortOrder: index,
        enabled: true,
        props: section.settings || {},
        blocks: [],
      })
    );

    // Build full TemplateResolution structure
    return {
      theme: {
        id: `fallback_theme_${store.id}`,
        shopId: store.id,
        name: 'Fallback Theme',
        presetId: themeConfig.templateId || 'starter-store',
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      template: {
        id: `fallback_${store.id}_${templateKey}`,
        shopId: store.id,
        themeId: `fallback_theme_${store.id}`,
        templateKey,
        title: templateKey === 'home' ? 'Home Page' : templateKey,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      sections: resolvedSections,
      settings,
    };
  } catch (error) {
    console.error('Failed to build template from themeConfig:', error);
    return null;
  }
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
    message:
      'This feature requires upgrading to Store Mode. Please upgrade your plan to access products, cart, and checkout.',
  };
}

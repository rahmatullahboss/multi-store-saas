/**
 * Template Resolution Service
 * 
 * Resolves and fetches published template sections for storefront rendering.
 * This is the core of the Shopify-like template system.
 * 
 * Flow:
 * 1. Resolve active theme for store
 * 2. Get template by page type (home, product, collection, etc.)
 * 3. Fetch published sections and theme settings
 * 4. Build render context based on page type
 */

import { eq, and, asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import {
  themes,
  themeTemplates,
  templateSectionsPublished,
  themeSettingsPublished,
  type Theme,
  type ThemeTemplate,
  type TemplateSectionPublished,
  type TemplateKey,
} from '@db/schema';
import type { Store } from '@db/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeSettings {
  // Colors
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  
  // Typography
  headingFont?: string;
  bodyFont?: string;
  
  // Header settings
  headerStyle?: 'transparent' | 'solid' | 'sticky';
  showAnnouncement?: boolean;
  announcementText?: string;
  
  // Footer settings
  footerStyle?: 'minimal' | 'detailed' | 'mega';
  showNewsletter?: boolean;
  
  // Global
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonStyle?: 'solid' | 'outline' | 'ghost';
  
  // Custom CSS
  customCss?: string;
  
  // Raw settings for extensibility
  [key: string]: unknown;
}

export interface ResolvedSection {
  id: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  props: Record<string, unknown>;
  blocks?: Array<{
    id: string;
    type: string;
    props: Record<string, unknown>;
  }>;
}

export interface TemplateResolution {
  theme: Theme;
  template: ThemeTemplate;
  sections: ResolvedSection[];
  settings: ThemeSettings;
}

// ============================================================================
// RENDER CONTEXT - Unified context passed to all sections
// ============================================================================

interface BaseContext {
  shop: Store;
  theme: ThemeSettings;
  currency: string;
}

export interface HomeContext extends BaseContext {
  kind: 'home';
  featuredProducts?: unknown[];
  collections?: unknown[];
}

export interface ProductContext extends BaseContext {
  kind: 'product';
  product: unknown;
  variants?: unknown[];
  relatedProducts?: unknown[];
}

export interface CollectionContext extends BaseContext {
  kind: 'collection';
  collection: unknown;
  products: unknown[];
  filters?: unknown;
  pagination?: { page: number; totalPages: number };
}

export interface CartContext extends BaseContext {
  kind: 'cart';
  cart: {
    items: unknown[];
    subtotal: number;
    total: number;
  };
}

export interface CheckoutContext extends BaseContext {
  kind: 'checkout';
  cart: {
    items: unknown[];
    subtotal: number;
    total: number;
  };
  shippingOptions?: unknown[];
  paymentMethods?: unknown[];
}

export interface PageContext extends BaseContext {
  kind: 'page';
  page: {
    title: string;
    slug: string;
    content?: string;
  };
}

export type RenderContext = 
  | HomeContext 
  | ProductContext 
  | CollectionContext 
  | CartContext 
  | CheckoutContext 
  | PageContext;

// ============================================================================
// TEMPLATE RESOLUTION FUNCTIONS
// ============================================================================

/**
 * Get the active theme for a store
 */
export async function getActiveTheme(
  db: D1Database,
  storeId: number
): Promise<Theme | null> {
  const drizzleDb = drizzle(db);
  
  const result = await drizzleDb
    .select()
    .from(themes)
    .where(and(
      eq(themes.shopId, storeId),
      eq(themes.isActive, 1)
    ))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get template for a specific page type
 */
export async function getTemplateByKey(
  db: D1Database,
  themeId: string,
  templateKey: TemplateKey
): Promise<ThemeTemplate | null> {
  const drizzleDb = drizzle(db);
  
  const result = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(and(
      eq(themeTemplates.themeId, themeId),
      eq(themeTemplates.templateKey, templateKey)
    ))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get published sections for a template
 */
export async function getPublishedSections(
  db: D1Database,
  templateId: string
): Promise<ResolvedSection[]> {
  const drizzleDb = drizzle(db);
  
  const sections = await drizzleDb
    .select()
    .from(templateSectionsPublished)
    .where(eq(templateSectionsPublished.templateId, templateId))
    .orderBy(asc(templateSectionsPublished.sortOrder));
  
  return sections.map((section) => ({
    id: section.id,
    type: section.type,
    enabled: section.enabled === 1,
    sortOrder: section.sortOrder,
    props: parseJson(section.propsJson),
    blocks: parseJson(section.blocksJson),
  }));
}

/**
 * Get published theme settings
 */
export async function getPublishedThemeSettings(
  db: D1Database,
  themeId: string
): Promise<ThemeSettings> {
  const drizzleDb = drizzle(db);
  
  const result = await drizzleDb
    .select()
    .from(themeSettingsPublished)
    .where(eq(themeSettingsPublished.themeId, themeId))
    .limit(1);
  
  if (!result[0]) {
    return getDefaultThemeSettings();
  }
  
  return {
    ...getDefaultThemeSettings(),
    ...parseJson(result[0].settingsJson),
  };
}

/**
 * Main resolution function - gets everything needed to render a page
 */
export async function resolveTemplate(
  db: D1Database,
  storeId: number,
  templateKey: TemplateKey
): Promise<TemplateResolution | null> {
  // 1. Get active theme
  const theme = await getActiveTheme(db, storeId);
  
  if (!theme) {
    // No theme configured - return null to trigger fallback rendering
    return null;
  }
  
  // 2. Get template for this page type
  const template = await getTemplateByKey(db, theme.id, templateKey);
  
  if (!template) {
    // Template not found for this page type
    return null;
  }
  
  // 3. Fetch published sections and settings in parallel
  const [sections, settings] = await Promise.all([
    getPublishedSections(db, template.id),
    getPublishedThemeSettings(db, theme.id),
  ]);
  
  return {
    theme,
    template,
    sections: sections.filter(s => s.enabled), // Only return enabled sections
    settings,
  };
}

/**
 * Check if store has template system enabled
 */
export async function hasTemplateSystem(
  db: D1Database,
  storeId: number
): Promise<boolean> {
  const theme = await getActiveTheme(db, storeId);
  return theme !== null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseJson<T = Record<string, unknown>>(json: string | null | undefined): T {
  if (!json) return {} as T;
  try {
    return JSON.parse(json);
  } catch {
    return {} as T;
  }
}

function getDefaultThemeSettings(): ThemeSettings {
  return {
    primaryColor: '#000000',
    accentColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headerStyle: 'solid',
    showAnnouncement: false,
    footerStyle: 'minimal',
    showNewsletter: false,
    borderRadius: 'md',
    buttonStyle: 'solid',
  };
}

// ============================================================================
// TEMPLATE KEY FROM ROUTE - Maps URL patterns to template keys
// ============================================================================

export function getTemplateKeyFromPath(pathname: string): TemplateKey {
  // Normalize pathname
  const path = pathname.toLowerCase().replace(/\/$/, '');
  
  // Match routes to template keys
  if (path === '' || path === '/') {
    return 'home';
  }
  
  if (path.startsWith('/products/') || path.match(/^\/products\/[^/]+$/)) {
    return 'product';
  }
  
  if (path.startsWith('/collections/') || path.match(/^\/collections\/[^/]+$/)) {
    return 'collection';
  }
  
  if (path === '/cart') {
    return 'cart';
  }
  
  if (path === '/checkout') {
    return 'checkout';
  }
  
  if (path === '/search') {
    return 'search';
  }
  
  if (path.startsWith('/account')) {
    return 'account';
  }
  
  // Default to custom page
  return 'page';
}

// ============================================================================
// BUILD RENDER CONTEXT - Creates the context object for section rendering
// ============================================================================

export function buildRenderContext(
  kind: TemplateKey,
  shop: Store,
  settings: ThemeSettings,
  data: Record<string, unknown> = {}
): RenderContext {
  const base: BaseContext = {
    shop,
    theme: settings,
    currency: shop.currency || 'BDT',
  };
  
  switch (kind) {
    case 'home':
      return {
        ...base,
        kind: 'home',
        featuredProducts: data.featuredProducts as unknown[] || [],
        collections: data.collections as unknown[] || [],
      };
    
    case 'product':
      return {
        ...base,
        kind: 'product',
        product: data.product,
        variants: data.variants as unknown[] || [],
        relatedProducts: data.relatedProducts as unknown[] || [],
      };
    
    case 'collection':
      return {
        ...base,
        kind: 'collection',
        collection: data.collection,
        products: data.products as unknown[] || [],
        filters: data.filters,
        pagination: data.pagination as { page: number; totalPages: number },
      };
    
    case 'cart':
      return {
        ...base,
        kind: 'cart',
        cart: data.cart as CartContext['cart'] || { items: [], subtotal: 0, total: 0 },
      };
    
    case 'checkout':
      return {
        ...base,
        kind: 'checkout',
        cart: data.cart as CheckoutContext['cart'] || { items: [], subtotal: 0, total: 0 },
        shippingOptions: data.shippingOptions as unknown[],
        paymentMethods: data.paymentMethods as unknown[],
      };
    
    case 'page':
    default:
      return {
        ...base,
        kind: 'page',
        page: data.page as PageContext['page'] || { title: '', slug: '' },
      };
  }
}

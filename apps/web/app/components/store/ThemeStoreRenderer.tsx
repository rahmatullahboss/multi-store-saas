/**
 * Theme-Aware Store Renderer
 *
 * This component bridges the gap between the new Shopify OS 2.0 theme system
 * and the storefront rendering. It uses ThemeBridge to render sections
 * designed with the new theme system.
 *
 * Usage:
 * ```tsx
 * <ThemeStoreRenderer
 *   themeId="luxe-boutique"
 *   sections={template.sections}
 *   store={{ id, name, currency }}
 *   products={products}
 *   collections={collections}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { getThemeBridge } from '~/lib/theme-engine/ThemeBridge';
import type {
  SectionContext,
  SerializedProduct,
  SerializedCollection,
  ThemeConfig,
  // CartData - reserved for future use
} from '~/lib/theme-engine/types';
import { SectionErrorBoundary } from '~/components/shared/SectionErrorBoundary';

// ============================================================================
// TYPES
// ============================================================================

interface ThemeStoreRendererProps {
  /** Theme ID to use for rendering (e.g., 'luxe-boutique', 'tech-modern') */
  themeId: string;

  /** Sections to render - can be from published template or editor state */
  sections: Array<{
    id: string;
    type: string;
    settings?: Record<string, unknown>;
    blocks?: Array<{
      id: string;
      type: string;
      settings?: Record<string, unknown>;
    }>;
    disabled?: boolean;
    enabled?: boolean;
  }>;

  /** Store information */
  store: {
    id: number;
    name: string;
    currency: string;
    logo?: string | null;
    defaultLanguage?: 'en' | 'bn';
  };

  /** Page type for context */
  pageType?: 'index' | 'product' | 'collection' | 'cart' | 'checkout' | 'page' | 'search';

  /** Page handle (URL slug) */
  pageHandle?: string;

  /** Products data for product-related sections */
  products?: SerializedProduct[];

  /** Collections data for collection-related sections */
  collections?: SerializedCollection[];

  /** Current product (for product pages) */
  product?: SerializedProduct;

  /** Current collection (for collection pages) */
  collection?: SerializedCollection;

  /** Cart data */
  cart?: {
    items: Array<{
      id: number;
      productId: number;
      title: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }>;
    itemCount: number;
    total: number;
  };

  /** Link generator function */
  getLink?: (path: string) => string;

  /** Navigation handler */
  onNavigate?: (path: string) => void;

  /** Is this a preview mode */
  isPreview?: boolean;

  /** Additional className */
  className?: string;

  /** Skip header/footer sections */
  skipHeaderFooter?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ThemeStoreRenderer({
  themeId,
  sections,
  store,
  pageType = 'index',
  pageHandle,
  products = [],
  collections = [],
  product,
  collection,
  cart,
  getLink,
  onNavigate,
  isPreview = false,
  className,
  skipHeaderFooter = false,
}: ThemeStoreRendererProps) {
  // Get the theme bridge for the specified theme
  const themeBridge = useMemo(() => {
    try {
      return getThemeBridge(themeId);
    } catch (e) {
      console.error(`Failed to load theme: ${themeId}`, e);
      return null;
    }
  }, [themeId]);

  // Get theme config for context
  const themeConfig = themeBridge?.getConfig();

  // Default theme config fallback
  const defaultThemeConfig: ThemeConfig = {
    name: themeId,
    version: '1.0.0',
    colors: {
      primary: '#1a1a1a',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#1a1a1a',
      textMuted: '#6b7280',
      border: '#e5e7eb',
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      baseFontSize: 16,
      lineHeight: 1.5,
    },
    spacing: {
      unit: 4,
      containerMaxWidth: '1280px',
      containerPadding: '1rem',
    },
    borders: {
      radius: '0.5rem',
      radiusLarge: '1rem',
      width: '1px',
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
    },
    buttons: {
      borderRadius: '0.5rem',
      fontWeight: '500',
    },
    cards: {
      borderRadius: '0.5rem',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '1rem',
    },
    animation: {
      duration: '200ms',
      easing: 'ease-out',
    },
  };

  // Build section context
  const context: SectionContext = useMemo(
    () => ({
      store: {
        id: store.id,
        name: store.name,
        currency: store.currency,
        logo: store.logo,
        defaultLanguage: store.defaultLanguage || 'en',
      },
      page: {
        type: pageType,
        handle: pageHandle,
      },
      theme: themeConfig || defaultThemeConfig,
      products,
      collections,
      product,
      collection,
      cart: cart
        ? {
            items: cart.items.map((item) => ({
              id: String(item.id),
              productId: item.productId,
              title: item.title,
              quantity: item.quantity,
              price: item.price,
              image: item.imageUrl,
            })),
            itemCount: cart.itemCount,
            subtotal: cart.total,
            total: cart.total,
          }
        : { items: [], itemCount: 0, subtotal: 0, total: 0 },
      isPreview,
      getLink: getLink || ((path) => path),
      onNavigate,
    }),
    [
      store,
      pageType,
      pageHandle,
      themeConfig,
      defaultThemeConfig,
      products,
      collections,
      product,
      collection,
      cart,
      isPreview,
      getLink,
      onNavigate,
    ]
  );

  // If no theme bridge, show error in dev
  if (!themeBridge) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          Theme "{themeId}" not found. Available themes: starter-store, daraz, bdshop, ghorer-bazar,
          luxe-boutique, tech-modern
        </div>
      );
    }
    return null;
  }

  // Get the section registry from the theme
  const sectionRegistry = themeBridge.getSectionRegistry();

  // Filter and process sections
  const renderableSections = useMemo(() => {
    let filtered = sections.filter((s) => {
      // Check if enabled (support both 'enabled' and 'disabled' flags)
      if (s.enabled === false || s.disabled === true) return false;
      return true;
    });

    // Optionally skip header/footer
    if (skipHeaderFooter) {
      filtered = filtered.filter(
        (s) => s.type !== 'header' && s.type !== 'footer' && s.type !== 'announcement-bar'
      );
    }

    return filtered;
  }, [sections, skipHeaderFooter]);

  // Separate sections by type
  const headerSections = renderableSections.filter(
    (s) => s.type === 'header' || s.type === 'announcement-bar'
  );
  const bodySections = renderableSections.filter(
    (s) => s.type !== 'header' && s.type !== 'footer' && s.type !== 'announcement-bar'
  );
  const footerSections = renderableSections.filter((s) => s.type === 'footer');

  // Render a single section
  const renderSection = (section: (typeof sections)[0]) => {
    // Try direct lookup first
    let registeredSection = sectionRegistry[section.type];

    // If not found, try mapping old type to new type
    if (!registeredSection) {
      const mappedType = SECTION_TYPE_MAP[section.type];
      if (mappedType && sectionRegistry[mappedType]) {
        registeredSection = sectionRegistry[mappedType];
        console.warn(`[ThemeStoreRenderer] Mapped legacy section type "${section.type}" -> "${mappedType}"`);
      }
    }

    if (!registeredSection) {
      if (process.env.NODE_ENV === 'development') {
        return (
          <div
            key={section.id}
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm"
          >
            Section type "{section.type}" not found in theme "{themeId}". 
            Available types: {Object.keys(sectionRegistry).join(', ')}
          </div>
        );
      }
      return null;
    }

    const SectionComponent = registeredSection.component;
    const schema = registeredSection.schema;

    // Resolve settings with defaults
    const resolvedSettings: Record<string, unknown> = {};

    // Apply defaults from schema
    for (const setting of schema.settings) {
      if (setting.id && setting.default !== undefined) {
        resolvedSettings[setting.id] = setting.default;
      }
    }

    // Override with section settings
    if (section.settings) {
      Object.assign(resolvedSettings, section.settings);
    }

    // Prepare blocks with defaults
    const blocks = (section.blocks || []).map((block) => {
      const blockDef = schema.blocks?.find((b) => b.type === block.type);
      const blockSettings: Record<string, unknown> = {};

      if (blockDef) {
        for (const setting of blockDef.settings) {
          if (setting.id && setting.default !== undefined) {
            blockSettings[setting.id] = setting.default;
          }
        }
      }

      return {
        ...block,
        settings: { ...blockSettings, ...block.settings },
      };
    });

    return (
      <SectionErrorBoundary key={section.id} sectionType={section.type} sectionId={section.id}>
        <SectionComponent
          section={{
            id: section.id,
            type: section.type,
            settings: resolvedSettings,
            blocks,
          }}
          context={context}
          settings={resolvedSettings}
          blocks={blocks}
        />
      </SectionErrorBoundary>
    );
  };

  return (
    <div
      className={`theme-store-renderer theme-${themeId} ${className || ''}`}
      style={{
        fontFamily: (themeConfig || defaultThemeConfig).typography?.fontFamily,
        backgroundColor: (themeConfig || defaultThemeConfig).colors?.background,
      }}
    >
      {/* Header */}
      {headerSections.map(renderSection)}

      {/* Main Content */}
      <main className="main-content">{bodySections.map(renderSection)}</main>

      {/* Footer */}
      {footerSections.map(renderSection)}
    </div>
  );
}

// ============================================================================
// HELPER: Convert old section format to new format
// ============================================================================

/**
 * Converts sections from the old template-resolver format to the new theme format
 */
export function convertResolvedSectionsToThemeFormat(
  resolvedSections: Array<{
    id: string;
    type: string;
    enabled: boolean;
    props?: Record<string, unknown>;
    blocks?: Array<{
      id: string;
      type: string;
      settings?: Record<string, unknown>;
    }>;
  }>
): ThemeStoreRendererProps['sections'] {
  return resolvedSections.map((section) => ({
    id: section.id,
    type: section.type,
    enabled: section.enabled,
    settings: section.props || {},
    blocks: section.blocks || [],
  }));
}

// ============================================================================
// SECTION TYPE MAPPING
// ============================================================================

/**
 * Maps old unified section types to new theme section types
 * Use this when migrating from old system
 */
export const SECTION_TYPE_MAP: Record<string, string> = {
  // Old unified section types -> New theme section types
  // Homepage sections
  hero: 'hero-banner',
  'featured-products': 'featured-collection',
  'product-grid': 'featured-collection',
  'collection-list': 'categories-grid',
  'category-list': 'categories-grid',
  'shop-by-category': 'categories-grid',
  
  // Trust/Features sections
  'trust-badges': 'trust-badges',
  features: 'trust-badges',
  
  // Newsletter (maps to rich-text if newsletter not available)
  newsletter: 'rich-text',
  
  // FAQ
  faq: 'rich-text',
  
  // Product page sections  
  'product-info': 'product-main',
  'product-gallery': 'product-main',
  'product-header': 'product-main',
  'product-description': 'rich-text',
  'product-reviews': 'rich-text',
  'related-products': 'featured-collection',
  
  // Cart page sections
  'cart-items': 'cart-items',
  'cart-summary': 'cart-summary',
  
  // Collection page sections
  'collection-header': 'collection-header',
  'collection-grid': 'collection-grid',
  
  // Banner sections
  banner: 'sale-banner',
  'promo-banner': 'sale-banner',

  // Rich text sections
  'rich-text': 'rich-text',
  story: 'rich-text',
  'about-us': 'rich-text',
};

/**
 * Maps new theme section types to old unified section types
 * Use this for backward compatibility
 */
export const REVERSE_SECTION_TYPE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_TYPE_MAP).map(([old, newType]) => [newType, old])
);

export default ThemeStoreRenderer;

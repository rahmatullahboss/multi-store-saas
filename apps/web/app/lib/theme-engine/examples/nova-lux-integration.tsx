/**
 * Nova Lux Theme Engine Integration Example
 *
 * This file demonstrates how to integrate the new Shopify OS 2.0
 * style theme engine with the existing Nova Lux template.
 *
 * Key concepts:
 * 1. Theme configuration
 * 2. Template loading
 * 3. Section rendering
 * 4. Metafield-driven content
 */

import React from 'react';
import type { ThemeConfig, SerializedProduct, SerializedCollection } from '~/lib/theme-engine';
import {
  PageRenderer,
  LazyPageRenderer,
  getSectionRegistry,
  getProductTemplateVariant,
  buildSectionContext,
} from '~/lib/theme-engine';

// ============================================================================
// NOVA LUX THEME CONFIGURATION
// ============================================================================

/**
 * Nova Lux theme configuration
 * This defines all the visual properties for the theme
 */
const NOVA_LUX_THEME: ThemeConfig = {
  name: 'Nova Lux',
  version: '2.0.0',

  colors: {
    primary: '#1a1a2e', // Deep navy
    secondary: '#16213e',
    accent: '#e94560', // Coral pink
    background: '#0f0f1a', // Dark background
    surface: '#1a1a2e', // Card background
    text: '#ffffff',
    textMuted: '#a0a0a0',
    border: 'rgba(255,255,255,0.1)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyHeading: "'Playfair Display', serif",
    baseFontSize: 16,
    lineHeight: 1.6,
    headingLineHeight: 1.2,
  },

  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1rem',
  },

  borders: {
    radius: '0.75rem',
    radiusLarge: '1rem',
    width: '1px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },

  buttons: {
    borderRadius: '0.5rem',
    fontWeight: '600',
    textTransform: 'none',
  },

  cards: {
    borderRadius: '0.75rem',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.4)',
    padding: '1.5rem',
  },

  animation: {
    duration: '200ms',
    easing: 'ease-in-out',
  },
};

/**
 * Light variant of Nova Lux
 */
const NOVA_LUX_LIGHT_THEME: ThemeConfig = {
  ...NOVA_LUX_THEME,
  name: 'Nova Lux Light',
  colors: {
    ...NOVA_LUX_THEME.colors,
    primary: '#1a1a2e',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    border: 'rgba(0,0,0,0.1)',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
};

// ============================================================================
// NOVA LUX PAGE COMPONENTS
// ============================================================================

interface NovaLuxPageProps {
  store: {
    id: number;
    name: string;
    logo?: string | null;
    currency: string;
    defaultLanguage?: 'en' | 'bn';
  };
  products?: SerializedProduct[];
  collections?: SerializedCollection[];
  product?: SerializedProduct;
  collection?: SerializedCollection;
  isDarkMode?: boolean;
  isPreview?: boolean;
  getLink?: (path: string) => string;
  onNavigate?: (path: string) => void;
}

/**
 * Nova Lux Homepage using Theme Engine
 */
export function NovaLuxHomePage({
  store,
  products = [],
  collections = [],
  isDarkMode = true,
  isPreview = false,
  getLink = (path) => path,
  onNavigate,
}: NovaLuxPageProps) {
  const theme = isDarkMode ? NOVA_LUX_THEME : NOVA_LUX_LIGHT_THEME;
  const registry = getSectionRegistry();

  return (
    <LazyPageRenderer
      registry={registry}
      store={store}
      theme={theme}
      pageType="index"
      products={products}
      collections={collections}
      isPreview={isPreview}
      getLink={getLink}
      onNavigate={onNavigate}
    />
  );
}

/**
 * Nova Lux Product Page using Theme Engine
 * Automatically selects template variant based on product type
 */
export function NovaLuxProductPage({
  store,
  product,
  products = [],
  collections = [],
  isDarkMode = true,
  isPreview = false,
  getLink = (path) => path,
  onNavigate,
}: NovaLuxPageProps & { product: SerializedProduct }) {
  const theme = isDarkMode ? NOVA_LUX_THEME : NOVA_LUX_LIGHT_THEME;
  const registry = getSectionRegistry();

  // Automatically detect product type and select appropriate template
  const templateType = getProductTemplateVariant(product);

  return (
    <LazyPageRenderer
      templateType={templateType}
      registry={registry}
      store={store}
      theme={theme}
      pageType="product"
      product={product}
      products={products}
      collections={collections}
      isPreview={isPreview}
      getLink={getLink}
      onNavigate={onNavigate}
    />
  );
}

/**
 * Nova Lux Collection Page using Theme Engine
 */
export function NovaLuxCollectionPage({
  store,
  collection,
  products = [],
  collections = [],
  isDarkMode = true,
  isPreview = false,
  getLink = (path) => path,
  onNavigate,
}: NovaLuxPageProps & { collection: SerializedCollection }) {
  const theme = isDarkMode ? NOVA_LUX_THEME : NOVA_LUX_LIGHT_THEME;
  const registry = getSectionRegistry();

  return (
    <LazyPageRenderer
      registry={registry}
      store={store}
      theme={theme}
      pageType="collection"
      collection={collection}
      products={products}
      collections={collections}
      isPreview={isPreview}
      getLink={getLink}
      onNavigate={onNavigate}
    />
  );
}

/**
 * Nova Lux Cart Page using Theme Engine
 */
export function NovaLuxCartPage({
  store,
  products = [],
  isDarkMode = true,
  isPreview = false,
  getLink = (path) => path,
  onNavigate,
}: NovaLuxPageProps) {
  const theme = isDarkMode ? NOVA_LUX_THEME : NOVA_LUX_LIGHT_THEME;
  const registry = getSectionRegistry();

  return (
    <LazyPageRenderer
      registry={registry}
      store={store}
      theme={theme}
      pageType="cart"
      products={products}
      isPreview={isPreview}
      getLink={getLink}
      onNavigate={onNavigate}
    />
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Basic usage in a route
 *
 * ```tsx
 * // app/routes/store.$subdomain._index.tsx
 *
 * import { NovaLuxHomePage } from '~/lib/theme-engine/examples/nova-lux-integration';
 *
 * export default function StorePage() {
 *   const { store, products, collections } = useLoaderData<typeof loader>();
 *
 *   return (
 *     <NovaLuxHomePage
 *       store={store}
 *       products={products}
 *       collections={collections}
 *     />
 *   );
 * }
 * ```
 */

/**
 * Example: Product page with automatic template selection
 *
 * ```tsx
 * // app/routes/store.$subdomain.products.$handle.tsx
 *
 * import { NovaLuxProductPage } from '~/lib/theme-engine/examples/nova-lux-integration';
 *
 * export default function ProductPage() {
 *   const { store, product, relatedProducts } = useLoaderData<typeof loader>();
 *
 *   // Template is automatically selected based on product type:
 *   // - Fashion products → product.fashion template (with size chart, fabric info)
 *   // - Electronics → product.electronics template (with specs, warranty)
 *   // - Others → default product template
 *
 *   return (
 *     <NovaLuxProductPage
 *       store={store}
 *       product={product}
 *       products={relatedProducts}
 *     />
 *   );
 * }
 * ```
 */

/**
 * Example: Custom template with overrides
 *
 * ```tsx
 * import { PageRenderer, getSectionRegistry } from '~/lib/theme-engine';
 * import { NOVA_LUX_THEME } from '~/lib/theme-engine/examples/nova-lux-integration';
 *
 * // Custom template with merchant overrides
 * const customTemplate = {
 *   name: 'Custom Homepage',
 *   sections: {
 *     hero: {
 *       id: 'hero',
 *       type: 'hero',
 *       settings: {
 *         heading: 'Custom Heading',
 *         layout: 'full_width',
 *       },
 *     },
 *     // ... more sections
 *   },
 *   order: ['hero'],
 * };
 *
 * function CustomHomePage({ store, products }) {
 *   return (
 *     <PageRenderer
 *       template={customTemplate}
 *       registry={getSectionRegistry()}
 *       store={store}
 *       theme={NOVA_LUX_THEME}
 *       pageType="index"
 *       products={products}
 *     />
 *   );
 * }
 * ```
 */

// ============================================================================
// EXPORT
// ============================================================================

// Export theme configs
export { NOVA_LUX_THEME, NOVA_LUX_LIGHT_THEME };

// ============================================================================
// NEW TEMPLATE FACTORY EXAMPLES (Phase 1 Migration)
// ============================================================================

/**
 * Example: Using createHybridTemplate for gradual migration
 *
 * This creates a template that can switch between the legacy system
 * and the new BaseTemplate system based on store configuration.
 *
 * ```tsx
 * // In store-registry.ts or a template file
 *
 * import { createHybridTemplate } from '~/lib/theme-engine';
 * import { NovaLuxTemplate as LegacyNovaLux } from '~/components/store-templates/nova-lux';
 * import { NovaLuxHeader } from '~/components/store-templates/nova-lux/sections/Header';
 * import { NovaLuxFooter } from '~/components/store-templates/nova-lux/sections/Footer';
 *
 * // Create hybrid template that supports both old and new systems
 * export const NovaLuxTemplate = createHybridTemplate({
 *   templateId: 'nova-lux',
 *   LegacyComponent: LegacyNovaLux,
 *   Header: NovaLuxHeader,
 *   Footer: NovaLuxFooter,
 *   // mode: 'when-enabled' means stores can opt-in via config.useNewThemeEngine
 *   mode: 'when-enabled',
 * });
 *
 * // Usage is unchanged - works with existing routes
 * <NovaLuxTemplate {...storeProps} />
 * ```
 */

/**
 * Example: Using createTemplateFromDefinition for full migration
 *
 * This creates a new-style template from an existing template definition.
 *
 * ```tsx
 * import { createTemplateFromDefinition, STORE_TEMPLATES } from '~/lib/theme-engine';
 *
 * // Find the nova-lux template definition
 * const novaLuxDef = STORE_TEMPLATES.find(t => t.id === 'nova-lux')!;
 *
 * // Create new-style template component
 * const { Component: NovaLuxV2 } = createTemplateFromDefinition(novaLuxDef);
 *
 * // Use in routes
 * function StoreHomePage() {
 *   const data = useLoaderData<typeof loader>();
 *   return <NovaLuxV2 {...data} />;
 * }
 * ```
 */

/**
 * Example: Using getTemplateComponent for dynamic template loading
 *
 * This is useful when you need to load a template dynamically based on store settings.
 *
 * ```tsx
 * import { getTemplateComponent } from '~/lib/theme-engine';
 *
 * function DynamicStorePage({ store, ...props }) {
 *   // Get template based on store's selected template
 *   const { Component: StoreTemplate } = getTemplateComponent(store.templateId);
 *
 *   return <StoreTemplate storeName={store.name} {...props} />;
 * }
 * ```
 */

/**
 * Example: Using BaseTemplate directly with custom configuration
 *
 * This gives you full control over the template rendering.
 *
 * ```tsx
 * import { BaseTemplate, getThemeConfigForTemplate } from '~/lib/theme-engine';
 * import { NovaLuxHeader } from '~/components/store-templates/nova-lux/sections/Header';
 * import { NovaLuxFooter } from '~/components/store-templates/nova-lux/sections/Footer';
 *
 * function CustomNovaLuxPage(props: StoreTemplateProps) {
 *   const themeConfig = getThemeConfigForTemplate('nova-lux');
 *
 *   return (
 *     <BaseTemplate
 *       {...props}
 *       templateId="nova-lux"
 *       themeConfig={themeConfig}
 *       Header={NovaLuxHeader}
 *       Footer={NovaLuxFooter}
 *       className="custom-nova-lux"
 *     />
 *   );
 * }
 * ```
 */

/**
 * Example: Converting a store to use the new theme engine
 *
 * To enable the new theme engine for a store, add this to their config:
 *
 * ```json
 * {
 *   "useNewThemeEngine": true,
 *   "sections": [
 *     {
 *       "id": "hero-1",
 *       "type": "hero",
 *       "settings": {
 *         "heading": "Welcome to Our Store",
 *         "primaryAction": { "label": "Shop Now", "url": "/#products" }
 *       }
 *     },
 *     {
 *       "id": "products-1",
 *       "type": "product-grid",
 *       "settings": {
 *         "heading": "Featured Products",
 *         "productCount": 8
 *       }
 *     }
 *   ]
 * }
 * ```
 *
 * The hybrid template will automatically use the new BaseTemplate system
 * when it sees `useNewThemeEngine: true` in the config.
 */

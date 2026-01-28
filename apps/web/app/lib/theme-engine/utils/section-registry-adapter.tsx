/**
 * Section Registry Adapter - Bridges new theme engine with existing sections
 *
 * This adapter:
 * - Converts existing section definitions to new schema format
 * - Registers all available sections
 * - Provides lookup by section type
 * - Supports both old and new section formats
 */

import type { ComponentType } from 'react';
import type {
  RegisteredSection,
  SectionSchema,
  SectionComponentProps,
  SettingDefinition,
} from '../types';
import { SECTION_SCHEMAS } from '../schemas/section-schemas';

// ============================================================================
// LEGACY SECTION IMPORTS
// ============================================================================

// Import existing section components from store-sections
// These will be adapted to work with the new system

// Homepage sections
import HeroSection from '~/components/store-sections/HeroSection';
import { ProductGridSection } from '~/components/store-sections/ProductGridSection';
import NewsletterSection from '~/components/store-sections/NewsletterSection';
import CategorySection from '~/components/store-sections/CategorySection';
import ProductScrollSection from '~/components/store-sections/ProductScrollSection';
import FeaturesSection from '~/components/store-sections/FeaturesSection';
import BannerSection from '~/components/store-sections/BannerSection';
import FAQSection from '~/components/store-sections/FAQSection';
import RichTextSection from '~/components/store-sections/RichTextSection';
import ModernHeroSection from '~/components/store-sections/ModernHeroSection';
import ModernFeaturesSection from '~/components/store-sections/ModernFeaturesSection';

// Product page sections
import { ProductHeaderSection } from '~/components/store-sections/ProductHeaderSection';
import { ProductGallerySection } from '~/components/store-sections/ProductGallerySection';
import { ProductInfoSection } from '~/components/store-sections/ProductInfoSection';
import { ProductReviewsSection } from '~/components/store-sections/ProductReviewsSection';
import { ProductDescriptionSection } from '~/components/store-sections/ProductDescriptionSection';
import { RelatedProductsSection } from '~/components/store-sections/RelatedProductsSection';

// Collection page sections
import { CollectionHeaderSection } from '~/components/store-sections/CollectionHeaderSection';

// Cart page sections
import { CartItemsSection } from '~/components/store-sections/CartItemsSection';
import { CartSummarySection } from '~/components/store-sections/CartSummarySection';

// ============================================================================
// SECTION WRAPPER
// ============================================================================

/**
 * Wrapper component that adapts old section props to new format
 */
function createSectionWrapper(
  LegacyComponent: ComponentType<any>,
  defaultSettings: Record<string, unknown> = {}
): ComponentType<SectionComponentProps> {
  return function WrappedSection({ section, context, settings, blocks }: SectionComponentProps) {
    // Merge default settings with resolved settings
    const mergedSettings = { ...defaultSettings, ...settings };

    // Convert new context format to legacy props format
    const legacyProps = {
      // Settings
      settings: mergedSettings,
      ...mergedSettings,

      // Data
      products: context.products || [],
      categories: context.collections?.map((c) => c.title) || [],
      product: context.product,
      collection: context.collection,

      // Store info
      storeId: context.store.id,
      storeName: context.store.name,
      currency: context.store.currency,

      // Theme
      theme: context.theme,
      colors: {
        primary: context.theme.colors.primary,
        accent: context.theme.colors.accent,
        background: context.theme.colors.background,
        text: context.theme.colors.text,
        muted: context.theme.colors.textMuted,
        cardBg: context.theme.colors.surface,
      },

      // Navigation
      getLink: context.getLink,
      onNavigate: context.onNavigate,

      // Preview mode
      isPreview: context.isPreview,

      // Blocks (if any)
      blocks: blocks || section.blocks || [],
    };

    return <LegacyComponent {...legacyProps} />;
  };
}

// ============================================================================
// SCHEMA CONVERTERS
// ============================================================================

/**
 * Create a minimal schema for legacy sections
 */
function createLegacySchema(
  name: string,
  description: string,
  allowedPages: ('index' | 'product' | 'collection' | 'cart' | 'page')[] = ['index']
): SectionSchema {
  return {
    name,
    tag: 'section',
    settings: [
      {
        type: 'header',
        id: 'content_header',
        label: 'Content',
      },
      {
        type: 'text',
        id: 'heading',
        label: 'Heading',
        default: '',
      },
      {
        type: 'textarea',
        id: 'subheading',
        label: 'Subheading',
        default: '',
      },
      {
        type: 'header',
        id: 'style_header',
        label: 'Style',
      },
      {
        type: 'range',
        id: 'padding_top',
        label: 'Top Padding',
        min: 0,
        max: 100,
        step: 4,
        unit: 'px',
        default: 40,
      },
      {
        type: 'range',
        id: 'padding_bottom',
        label: 'Bottom Padding',
        min: 0,
        max: 100,
        step: 4,
        unit: 'px',
        default: 40,
      },
    ],
    enabled_on: {
      templates: allowedPages as any[],
      groups: ['body'],
    },
  };
}

// ============================================================================
// SECTION REGISTRY
// ============================================================================

/**
 * Build the complete section registry
 */
export function buildSectionRegistry(): Record<string, RegisteredSection> {
  const registry: Record<string, RegisteredSection> = {};

  // Homepage sections
  registry['hero'] = {
    type: 'hero',
    schema:
      SECTION_SCHEMAS['hero'] || createLegacySchema('Hero Banner', 'Large hero banner', ['index']),
    component: createSectionWrapper(HeroSection),
  };

  registry['modern-hero'] = {
    type: 'modern-hero',
    schema: createLegacySchema('Modern Hero', 'Premium hero with floating card', ['index']),
    component: createSectionWrapper(ModernHeroSection),
  };

  registry['product-grid'] = {
    type: 'product-grid',
    schema:
      SECTION_SCHEMAS['product-grid'] ||
      createLegacySchema('Product Grid', 'Grid of products', ['index', 'collection']),
    component: createSectionWrapper(ProductGridSection),
  };

  registry['collection-list'] = {
    type: 'collection-list',
    schema:
      SECTION_SCHEMAS['collection-list'] ||
      createLegacySchema('Collection List', 'List of collections', ['index']),
    component: createSectionWrapper(CategorySection),
  };

  registry['category-list'] = {
    type: 'category-list',
    schema:
      SECTION_SCHEMAS['collection-list'] ||
      createLegacySchema('Category List', 'List of categories', ['index']),
    component: createSectionWrapper(CategorySection),
  };

  registry['product-scroll'] = {
    type: 'product-scroll',
    schema: createLegacySchema('Product Scroll', 'Horizontal product scroll', ['index', 'product']),
    component: createSectionWrapper(ProductScrollSection),
  };

  registry['features'] = {
    type: 'features',
    schema: createLegacySchema('Features', 'Feature highlights', ['index', 'product']),
    component: createSectionWrapper(FeaturesSection),
  };

  registry['modern-features'] = {
    type: 'modern-features',
    schema: createLegacySchema('Premium Features', 'Why choose us section', ['index']),
    component: createSectionWrapper(ModernFeaturesSection),
  };

  registry['banner'] = {
    type: 'banner',
    schema: createLegacySchema('Banner', 'Promotional banner', ['index', 'collection']),
    component: createSectionWrapper(BannerSection),
  };

  registry['newsletter'] = {
    type: 'newsletter',
    schema:
      SECTION_SCHEMAS['newsletter'] || createLegacySchema('Newsletter', 'Email signup', ['index']),
    component: createSectionWrapper(NewsletterSection),
  };

  registry['faq'] = {
    type: 'faq',
    schema:
      SECTION_SCHEMAS['faq'] ||
      createLegacySchema('FAQ', 'Frequently asked questions', ['index', 'product', 'page']),
    component: createSectionWrapper(FAQSection),
  };

  registry['rich-text'] = {
    type: 'rich-text',
    schema:
      SECTION_SCHEMAS['rich-text'] ||
      createLegacySchema('Rich Text', 'Text content block', [
        'index',
        'product',
        'collection',
        'page',
      ]),
    component: createSectionWrapper(RichTextSection),
  };

  // Product page sections
  registry['product-header'] = {
    type: 'product-header',
    schema: createLegacySchema('Product Header', 'Product title and breadcrumb', ['product']),
    component: createSectionWrapper(ProductHeaderSection),
  };

  registry['product-gallery'] = {
    type: 'product-gallery',
    schema: createLegacySchema('Product Gallery', 'Product images', ['product']),
    component: createSectionWrapper(ProductGallerySection),
  };

  registry['product-info'] = {
    type: 'product-info',
    schema:
      SECTION_SCHEMAS['product-info'] ||
      createLegacySchema('Product Info', 'Product details and add to cart', ['product']),
    component: createSectionWrapper(ProductInfoSection),
  };

  registry['product-description'] = {
    type: 'product-description',
    schema: createLegacySchema('Product Description', 'Product description', ['product']),
    component: createSectionWrapper(ProductDescriptionSection),
  };

  registry['product-reviews'] = {
    type: 'product-reviews',
    schema: createLegacySchema('Product Reviews', 'Customer reviews', ['product']),
    component: createSectionWrapper(ProductReviewsSection),
  };

  registry['related-products'] = {
    type: 'related-products',
    schema:
      SECTION_SCHEMAS['related-products'] ||
      createLegacySchema('Related Products', 'Similar products', ['product']),
    component: createSectionWrapper(RelatedProductsSection),
  };

  // Collection page sections
  registry['collection-header'] = {
    type: 'collection-header',
    schema: createLegacySchema('Collection Header', 'Collection title and description', [
      'collection',
    ]),
    component: createSectionWrapper(CollectionHeaderSection),
  };

  // Cart page sections
  registry['cart-items'] = {
    type: 'cart-items',
    schema:
      SECTION_SCHEMAS['cart-items'] ||
      createLegacySchema('Cart Items', 'Cart line items', ['cart']),
    component: createSectionWrapper(CartItemsSection),
  };

  registry['cart-footer'] = {
    type: 'cart-footer',
    schema:
      SECTION_SCHEMAS['cart-footer'] ||
      createLegacySchema('Cart Footer', 'Cart summary and checkout', ['cart']),
    component: createSectionWrapper(CartSummarySection),
  };

  registry['cart-summary'] = {
    type: 'cart-summary',
    schema:
      SECTION_SCHEMAS['cart-footer'] || createLegacySchema('Cart Summary', 'Cart totals', ['cart']),
    component: createSectionWrapper(CartSummarySection),
  };

  return registry;
}

// ============================================================================
// SINGLETON REGISTRY
// ============================================================================

let _registry: Record<string, RegisteredSection> | null = null;

/**
 * Get the section registry (singleton)
 */
export function getSectionRegistry(): Record<string, RegisteredSection> {
  if (!_registry) {
    _registry = buildSectionRegistry();
  }
  return _registry;
}

/**
 * Register a custom section
 */
export function registerSection(section: RegisteredSection): void {
  const registry = getSectionRegistry();
  registry[section.type] = section;
}

/**
 * Get a section by type
 */
export function getSection(type: string): RegisteredSection | undefined {
  return getSectionRegistry()[type];
}

/**
 * Get all section types
 */
export function getAllSectionTypes(): string[] {
  return Object.keys(getSectionRegistry());
}

/**
 * Get sections available for a page type
 */
export function getSectionsForPage(pageType: string): RegisteredSection[] {
  const registry = getSectionRegistry();

  return Object.values(registry).filter((section) => {
    const enabledTemplates = section.schema.enabled_on?.templates || [];
    return enabledTemplates.length === 0 || enabledTemplates.includes(pageType as any);
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export const SectionRegistryAdapter = {
  buildSectionRegistry,
  getSectionRegistry,
  registerSection,
  getSection,
  getAllSectionTypes,
  getSectionsForPage,
};

export default SectionRegistryAdapter;

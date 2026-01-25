/**
 * Store Section Renderer
 * 
 * Renders published template sections for storefront pages.
 * Uses the unified section registry and injects render context
 * for dynamic data binding.
 * 
 * Usage:
 * ```tsx
 * <StoreSectionRenderer
 *   sections={template.sections}
 *   context={{ kind: 'product', shop, theme, product }}
 * />
 * ```
 */

import React from 'react';
import { 
  UNIFIED_SECTION_REGISTRY, 
  type UnifiedSectionType 
} from '~/lib/unified-sections/registry';
import type { RenderContext, ResolvedSection, ThemeSettings } from '~/lib/template-resolver.server';

// ============================================================================
// TYPES
// ============================================================================

interface StoreSectionRendererProps {
  /** Published sections from template resolution */
  sections: ResolvedSection[];
  /** Render context with page-specific data */
  context: RenderContext;
  /** Optional className for wrapper */
  className?: string;
}

// ============================================================================
// SECTION COMPONENT MAP
// ============================================================================

// Lazy-loaded section components for store templates
const STORE_SECTION_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  // Hero sections
  'hero': React.lazy(() => import('./sections/home/HeroSection')),
  
  // Product sections
  'featured-products': React.lazy(() => import('./sections/home/FeaturedProductsSection')),
  'product-grid': React.lazy(() => import('./sections/home/ProductGridSection')),
  'collection-list': React.lazy(() => import('./sections/home/CollectionListSection')),
  'related-products': React.lazy(() => import('./sections/product/RelatedProductsSection')),
  
  // Product page sections (used by DEFAULT_PRODUCT_SECTIONS)
  'product-header': React.lazy(() => import('./sections/product/ProductHeaderSection')),
  'product-gallery': React.lazy(() => import('./sections/product/ProductGallerySection')),
  'product-info': React.lazy(() => import('./sections/product/ProductInfoSection')),
  'product-main': React.lazy(() => import('./sections/product/ProductMainSection')),
  'product-description': React.lazy(() => import('./sections/product/ProductDescriptionSection')),
  'product-reviews': React.lazy(() => import('./sections/product/ProductReviewsSection')),
  
  // Cart sections
  'cart-items': React.lazy(() => import('./sections/cart/CartItemsSection')),
  'cart-summary': React.lazy(() => import('./sections/cart/CartSummarySection')),
  'cart-upsell': React.lazy(() => import('./sections/cart/CartUpsellSection')),
  
  // Checkout sections
  'checkout-form': React.lazy(() => import('./sections/checkout/CheckoutFormSection')),
  'checkout-summary': React.lazy(() => import('./sections/checkout/CheckoutSummarySection')),
  
  // Collection sections
  'collection-header': React.lazy(() => import('./sections/collection/CollectionHeaderSection')),
  
  // Content sections
  'trust-badges': React.lazy(() => import('./sections/common/TrustBadgesSection')),
  'newsletter': React.lazy(() => import('./sections/common/NewsletterSection')),
  'rich-text': React.lazy(() => import('./sections/common/RichTextSection')),
  'features': React.lazy(() => import('./sections/common/FeaturesSection')),
  'testimonials': React.lazy(() => import('./sections/common/TestimonialsSection')),
  'faq': React.lazy(() => import('./sections/common/FAQSection')),
};

// ============================================================================
// FALLBACK COMPONENT
// ============================================================================

function SectionLoadingFallback() {
  return (
    <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-32 rounded-lg" />
  );
}

function SectionErrorFallback({ type }: { type: string }) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
      Section type "{type}" is not implemented yet
    </div>
  );
}

// Error boundary wrapper for individual sections
class ErrorBoundarySection extends React.Component<
  { type: string; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { type: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Section "${this.props.type}" error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // In production, silently skip broken sections
      if (process.env.NODE_ENV !== 'development') {
        return null;
      }
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          Section "{this.props.type}" failed to render: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StoreSectionRenderer({ 
  sections, 
  context, 
  className 
}: StoreSectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  const enabledSections = sections.filter(s => s.enabled);

  return (
    <div className={className}>
      {enabledSections.map((section) => {
        const SectionComponent = STORE_SECTION_COMPONENTS[section.type];
        
        if (!SectionComponent) {
          // Check if section type exists in registry but component not implemented
          const definition = UNIFIED_SECTION_REGISTRY[section.type as UnifiedSectionType];
          if (definition) {
            return <SectionErrorFallback key={section.id} type={section.type} />;
          }
          return null;
        }
        
        return (
          <React.Suspense key={section.id} fallback={<SectionLoadingFallback />}>
            <ErrorBoundarySection type={section.type}>
              <SectionComponent
                sectionId={section.id}
                props={section.props || {}}
                blocks={section.blocks}
                context={context}
              />
            </ErrorBoundarySection>
          </React.Suspense>
        );
      })}
    </div>
  );
}

// ============================================================================
// HELPER: Get sections allowed for a template key
// ============================================================================

export function getSectionsForTemplateKey(templateKey: string): UnifiedSectionType[] {
  return Object.entries(UNIFIED_SECTION_REGISTRY)
    .filter(([_, def]) => def.allowedPages.includes(templateKey as any))
    .map(([type]) => type as UnifiedSectionType);
}

// ============================================================================
// HELPER: Create default section instances for a template
// ============================================================================

export function getDefaultSectionsForTemplate(templateKey: string): Array<{
  type: UnifiedSectionType;
  enabled: boolean;
  props: Record<string, unknown>;
}> {
  const allowed = getSectionsForTemplateKey(templateKey);
  
  // Return commonly used sections with defaults based on template type
  switch (templateKey) {
    case 'home':
      return [
        { type: 'hero', enabled: true, props: UNIFIED_SECTION_REGISTRY['hero'].defaultProps },
        { type: 'featured-products', enabled: true, props: { title: 'Featured Products', productCount: 8 } },
        { type: 'collection-list', enabled: true, props: { title: 'Shop by Category' } },
        { type: 'trust-badges', enabled: true, props: UNIFIED_SECTION_REGISTRY['trust-badges'].defaultProps },
        { type: 'newsletter', enabled: true, props: UNIFIED_SECTION_REGISTRY['newsletter'].defaultProps },
      ];
    case 'product':
      return [
        { type: 'product-main', enabled: true, props: {} },
        { type: 'product-description', enabled: true, props: {} },
        { type: 'product-reviews', enabled: true, props: {} },
        { type: 'related-products', enabled: true, props: { title: 'You May Also Like', productCount: 4 } },
      ];
    case 'collection':
      return [
        { type: 'collection-header', enabled: true, props: {} },
        { type: 'product-grid', enabled: true, props: { columns: 4, productsPerPage: 12 } },
      ];
    case 'cart':
      return [
        { type: 'cart-items', enabled: true, props: {} },
        { type: 'cart-summary', enabled: true, props: {} },
        { type: 'cart-upsell', enabled: true, props: { title: 'You might also like' } },
      ];
    case 'checkout':
      return [
        { type: 'checkout-form', enabled: true, props: {} },
        { type: 'checkout-summary', enabled: true, props: {} },
      ];
    default:
      return [];
  }
}

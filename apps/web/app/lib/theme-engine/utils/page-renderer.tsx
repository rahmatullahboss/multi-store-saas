/**
 * Dynamic Page Renderer - Shopify OS 2.0 Compatible Page Rendering
 *
 * This component:
 * - Loads the appropriate template for the page type
 * - Renders sections in order
 * - Handles section visibility based on metafields
 * - Passes context and resolved settings to sections
 * - Wraps each section in error boundary for graceful degradation
 */

import React, { useMemo } from 'react';
import type {
  TemplateJSON,
  SectionInstance,
  SectionContext,
  ThemeConfig,
  SerializedProduct,
  SerializedCollection,
  RegisteredSection,
  PageType,
  SectionSchema,
} from '../types';
import {
  resolveSectionSettings,
  isSectionVisible,
  getOrderedSections,
  buildSectionContext,
} from './template-engine';
import {
  SectionErrorBoundary,
  SectionLoadingFallback,
} from '~/components/shared/SectionErrorBoundary';

// ============================================================================
// SECTION RENDERER
// ============================================================================

interface SectionRendererProps {
  section: SectionInstance;
  registry: Record<string, RegisteredSection>;
  context: SectionContext;
}

/**
 * Render a single section from the template
 */
function SectionRendererComponent({
  section,
  registry,
  context,
}: SectionRendererProps): JSX.Element | null {
  // Get the registered section
  const registeredSection = registry[section.type];

  if (!registeredSection) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Section type "${section.type}" not found in registry`);
    }
    return null;
  }

  // Check visibility
  if (!isSectionVisible(section, context)) {
    return null;
  }

  // Resolve settings with defaults and bindings
  const resolvedSettings = resolveSectionSettings(section, registeredSection.schema, context);

  // Get the component
  const SectionComponent = registeredSection.component;

  // Build wrapper classes
  const wrapperClass = [
    'section',
    `section-${section.type}`,
    section.disabled ? 'section--disabled' : '',
    registeredSection.schema.class || '',
  ]
    .filter(Boolean)
    .join(' ');

  // Build wrapper styles for padding
  const paddingTop = resolvedSettings.padding_top as number | undefined;
  const paddingBottom = resolvedSettings.padding_bottom as number | undefined;
  const backgroundColor = resolvedSettings.background_color as string | undefined;
  const textColor = resolvedSettings.text_color as string | undefined;

  const wrapperStyle: React.CSSProperties = {};
  if (paddingTop !== undefined) wrapperStyle.paddingTop = `${paddingTop}px`;
  if (paddingBottom !== undefined) wrapperStyle.paddingBottom = `${paddingBottom}px`;
  if (backgroundColor) wrapperStyle.backgroundColor = backgroundColor;
  if (textColor) wrapperStyle.color = textColor;

  // Determine the wrapper tag
  const WrapperTag = (registeredSection.schema.tag || 'section') as keyof JSX.IntrinsicElements;

  return (
    <SectionErrorBoundary key={section.id} sectionType={section.type} sectionId={section.id}>
      <WrapperTag
        id={`section-${section.id}`}
        className={wrapperClass}
        style={wrapperStyle}
        data-section-type={section.type}
        data-section-id={section.id}
      >
        <SectionComponent
          section={section}
          context={context}
          settings={resolvedSettings}
          blocks={section.blocks || []}
        />
      </WrapperTag>
    </SectionErrorBoundary>
  );
}

// ============================================================================
// PAGE RENDERER
// ============================================================================

interface PageRendererProps {
  // Template to render
  template: TemplateJSON;

  // Section registry
  registry: Record<string, RegisteredSection>;

  // Store info
  store: {
    id: number;
    name: string;
    logo?: string | null;
    currency: string;
    defaultLanguage?: 'en' | 'bn';
  };

  // Theme configuration
  theme: ThemeConfig;

  // Page info
  pageType: PageType;
  pageHandle?: string;

  // Data
  products?: SerializedProduct[];
  collections?: SerializedCollection[];
  product?: SerializedProduct;
  collection?: SerializedCollection;

  // Navigation
  getLink: (path: string) => string;
  onNavigate?: (path: string) => void;

  // Preview mode
  isPreview?: boolean;

  // Custom header/footer (if not using template sections)
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;

  // Skip header/footer sections (use custom ones)
  skipHeaderFooter?: boolean;
}

/**
 * Render a complete page from template
 */
function PageRendererComponent({
  template,
  registry,
  store,
  theme,
  pageType,
  pageHandle,
  products,
  collections,
  product,
  collection,
  getLink,
  onNavigate,
  isPreview,
  customHeader,
  customFooter,
  skipHeaderFooter,
}: PageRendererProps): JSX.Element {
  // Build context
  const context = useMemo(
    () =>
      buildSectionContext({
        store,
        theme,
        pageType,
        pageHandle,
        products,
        collections,
        product,
        collection,
        isPreview,
        getLink,
        onNavigate,
      }),
    [
      store,
      theme,
      pageType,
      pageHandle,
      products,
      collections,
      product,
      collection,
      isPreview,
      getLink,
      onNavigate,
    ]
  );

  // Get ordered sections
  const sections = useMemo(() => {
    const ordered = getOrderedSections(template);

    if (skipHeaderFooter) {
      return ordered.filter(
        (s) => s.type !== 'header' && s.type !== 'footer' && s.type !== 'announcement-bar'
      );
    }

    return ordered;
  }, [template, skipHeaderFooter]);

  // Separate header, body, and footer sections
  const headerSections = useMemo(
    () => sections.filter((s) => s.type === 'header' || s.type === 'announcement-bar'),
    [sections]
  );

  const bodySections = useMemo(
    () =>
      sections.filter(
        (s) => s.type !== 'header' && s.type !== 'footer' && s.type !== 'announcement-bar'
      ),
    [sections]
  );

  const footerSections = useMemo(() => sections.filter((s) => s.type === 'footer'), [sections]);

  return (
    <div
      className={`page page--${pageType} ${template.wrapper || ''}`}
      data-template={template.name}
    >
      {/* Header */}
      {customHeader ||
        headerSections.map((section) => (
          <SectionRendererComponent
            key={section.id}
            section={section}
            registry={registry}
            context={context}
          />
        ))}

      {/* Main Content */}
      <main className="main-content">
        {bodySections.map((section) => (
          <SectionRendererComponent
            key={section.id}
            section={section}
            registry={registry}
            context={context}
          />
        ))}
      </main>

      {/* Footer */}
      {customFooter ||
        footerSections.map((section) => (
          <SectionRendererComponent
            key={section.id}
            section={section}
            registry={registry}
            context={context}
          />
        ))}
    </div>
  );
}

// ============================================================================
// LAZY PAGE RENDERER (with template loading)
// ============================================================================

interface LazyPageRendererProps extends Omit<PageRendererProps, 'template'> {
  templateType?: string;
  templateOverride?: TemplateJSON;
}

/**
 * Page renderer that lazily loads the template
 * Use this when you don't have the template pre-loaded
 */
function LazyPageRendererComponent({
  templateType,
  templateOverride,
  ...props
}: LazyPageRendererProps): JSX.Element {
  const [template, setTemplate] = React.useState<TemplateJSON | null>(templateOverride || null);
  const [loading, setLoading] = React.useState(!templateOverride);

  React.useEffect(() => {
    if (templateOverride) {
      setTemplate(templateOverride);
      setLoading(false);
      return;
    }

    // Dynamic import based on template type
    const loadTemplate = async () => {
      try {
        let loaded: TemplateJSON;

        switch (templateType || props.pageType) {
          case 'index':
            loaded = (await import('../templates/default/index.json'))
              .default as unknown as TemplateJSON;
            break;
          case 'product':
          case 'product.fashion':
          case 'product.electronics':
            // Use product template type detection if we have a product
            if (props.product) {
              const tags = props.product.tags || [];
              const category = props.product.category?.toLowerCase() || '';

              if (
                ['clothing', 'fashion', 'apparel'].some(
                  (kw) => category.includes(kw) || tags.some((t) => t.toLowerCase().includes(kw))
                )
              ) {
                loaded = (await import('../templates/alternate/product.fashion.json'))
                  .default as unknown as TemplateJSON;
              } else if (
                ['electronics', 'gadget', 'tech'].some(
                  (kw) => category.includes(kw) || tags.some((t) => t.toLowerCase().includes(kw))
                )
              ) {
                loaded = (await import('../templates/alternate/product.electronics.json'))
                  .default as unknown as TemplateJSON;
              } else {
                loaded = (await import('../templates/default/product.json'))
                  .default as unknown as TemplateJSON;
              }
            } else {
              loaded = (await import('../templates/default/product.json'))
                .default as unknown as TemplateJSON;
            }
            break;
          case 'collection':
            loaded = (await import('../templates/default/collection.json'))
              .default as unknown as TemplateJSON;
            break;
          case 'cart':
            loaded = (await import('../templates/default/cart.json'))
              .default as unknown as TemplateJSON;
            break;
          default:
            loaded = (await import('../templates/default/index.json'))
              .default as unknown as TemplateJSON;
        }

        setTemplate(loaded);
      } catch (e) {
        console.error('Failed to load template:', e);
        // Fallback to a minimal template
        setTemplate({
          name: 'Fallback',
          sections: {},
          order: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateType, templateOverride, props.pageType, props.product]);

  if (loading || !template) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner" />
      </div>
    );
  }

  return <PageRendererComponent template={template} {...props} />;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to get section context in a section component
 */
export function useSectionContext(): SectionContext | null {
  // This would be provided by a context provider wrapping the page
  // For now, return null - components should receive context via props
  return null;
}

/**
 * Hook to get resolved setting value with type safety
 */
export function useSetting<T>(settings: Record<string, unknown>, key: string, defaultValue: T): T {
  const value = settings[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value as T;
}

// ============================================================================
// EXPORT
// ============================================================================

export const SectionRenderer = SectionRendererComponent;
export const PageRenderer = PageRendererComponent;
export const LazyPageRenderer = LazyPageRendererComponent;

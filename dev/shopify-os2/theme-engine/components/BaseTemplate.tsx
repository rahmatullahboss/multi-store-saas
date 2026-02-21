/**
 * Base Template Component
 *
 * Unified component that all 16 templates can use to render their homepage.
 * This bridges the gap between the new theme engine and existing template system.
 *
 * Architecture:
 * 1. Takes theme config (colors, fonts) as props
 * 2. Loads sections from DB or falls back to defaults
 * 3. Uses existing SECTION_REGISTRY for rendering
 * 4. Provides consistent behavior across all templates
 *
 * Usage:
 * ```tsx
 * <BaseTemplate
 *   templateId="nova-lux"
 *   themeConfig={novaLuxThemeConfig}
 *   storeProps={storeProps}
 *   Header={NovaLuxHeader}
 *   Footer={NovaLuxFooter}
 * />
 * ```
 */

import React, { useMemo, Suspense, type ComponentType } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import type { StoreSection } from '~/components/store-sections/registry';
import type { ThemeConfig } from '../types';
import type {
  StoreTemplateProps,
  StoreHeaderProps,
  StoreFooterProps,
  StoreTemplateTheme,
} from '~/templates/store-registry';
import {
  convertToStoreTemplateTheme,
  themeConfigToCSSVariables,
  getGoogleFontsUrl,
} from '../utils/theme-config-converter';

// ============================================================================
// TYPES
// ============================================================================

export interface BaseTemplateProps extends StoreTemplateProps {
  /**
   * Template identifier (e.g., 'nova-lux', 'daraz')
   */
  templateId: string;

  /**
   * Theme configuration (new format with full config)
   */
  themeConfig: ThemeConfig;

  /**
   * Header component to render
   * If not provided, a minimal default is used
   */
  Header?: ComponentType<StoreHeaderProps>;

  /**
   * Footer component to render
   * If not provided, a minimal default is used
   */
  Footer?: ComponentType<StoreFooterProps>;

  /**
   * Custom ProductCard component for sections
   * If not provided, uses default from section components
   */
  ProductCard?: ComponentType<any>;

  /**
   * Custom sections to render instead of config.sections
   */
  customSections?: StoreSection[];

  /**
   * Class name for the main container
   */
  className?: string;

  /**
   * Additional inline styles for the main container
   */
  style?: React.CSSProperties;

  /**
   * Announcement bar content (optional)
   */
  announcementBar?: {
    text: string;
    link?: string;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BaseTemplate({
  // Template identity
  templateId,
  themeConfig,
  Header,
  Footer,
  ProductCard,
  customSections,
  className,
  style,
  announcementBar,

  // Standard store props
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  footerConfig,
  businessInfo,
  planType,
  isPreview,
  collections,
  reviews,
  banners,
  flashSale,
  flashSaleProducts,
  promotions,
  announcement,
  testimonials,
}: BaseTemplateProps) {
  // Convert ThemeConfig to legacy StoreTemplateTheme for backwards compat
  const legacyTheme = useMemo(() => convertToStoreTemplateTheme(themeConfig), [themeConfig]);

  // Get CSS variables for theme
  const cssVariables = useMemo(() => themeConfigToCSSVariables(themeConfig), [themeConfig]);

  // Get Google Fonts URL
  const fontsUrl = useMemo(() => {
    // Safely access typography with defaults
    const heading =
      themeConfig.typography?.fontFamilyHeading ||
      themeConfig.typography?.fontFamily ||
      "'Inter', sans-serif";
    const body = themeConfig.typography?.fontFamily || "'Inter', sans-serif";
    // Extract font names from font-family strings
    const extractFontName = (fontFamily: string): string => {
      const match = fontFamily.match(/'([^']+)'/);
      return match ? match[1] : fontFamily.split(',')[0].trim();
    };
    return getGoogleFontsUrl({
      heading: extractFontName(heading),
      body: extractFontName(body),
    });
  }, [themeConfig]);

  // Determine sections to render
  const sections = useMemo(() => {
    if (customSections) return customSections;
    if (config?.sections && Array.isArray(config.sections)) return config.sections;
    return DEFAULT_SECTIONS;
  }, [customSections, config?.sections]);

  // Valid categories
  const validCategories = useMemo(
    () => categories.filter((c): c is string => Boolean(c)),
    [categories]
  );

  // Announcement text (from props or config)
  const announcementText =
    announcementBar?.text || announcement?.text || config?.announcement?.text;

  // Header height calculation for spacer
  const headerHeight = useMemo(() => {
    // Base header height
    let height = 66;
    // Add space for announcement bar if present
    if (announcementText) {
      height += 38;
    }
    // Add extra on desktop
    return {
      mobile: height,
      desktop: height + 16,
    };
  }, [announcementText]);

  // Combined styles
  const containerStyles: React.CSSProperties = useMemo(
    () => ({
      ...cssVariables,
      backgroundColor: themeConfig.colors.background,
      color: themeConfig.colors.text,
      fontFamily: themeConfig.typography?.fontFamily || "'Inter', sans-serif",
      minHeight: '100vh',
      ...style,
    }),
    [cssVariables, themeConfig, style]
  );

  // Render section
  const renderSection = (section: StoreSection) => {
    const sectionDef = SECTION_REGISTRY[section.type];
    if (!sectionDef) {
      console.warn(`Section type "${section.type}" not found in registry`);
      return null;
    }

    const SectionComponent = sectionDef.component;
    if (!SectionComponent) return null;

    return (
      <SectionComponent
        key={section.id}
        settings={section.settings}
        theme={legacyTheme}
        products={products}
        categories={validCategories}
        storeId={storeId}
        currency={currency}
        store={{
          name: storeName,
          email: businessInfo?.email,
          phone: businessInfo?.phone,
          address: businessInfo?.address,
          currency: currency,
        }}
        ProductCardComponent={ProductCard}
        isPreview={isPreview}
        // Pass additional context
        collections={collections}
        reviews={reviews}
        banners={banners}
        flashSale={flashSale}
        flashSaleProducts={flashSaleProducts}
        promotions={promotions}
        testimonials={testimonials}
      />
    );
  };

  // Content to render inside providers
  const content = (
    <div
      className={`base-template pb-16 md:pb-0 ${className || ''}`}
      style={containerStyles}
      data-template={templateId}
    >
      {/* Google Fonts */}
      {fontsUrl && <link href={fontsUrl} rel="stylesheet" />}

      {/* Header */}
      {Header && (
        <Header
          storeName={storeName}
          logo={logo}
          categories={validCategories}
          currentCategory={currentCategory}
          socialLinks={socialLinks}
          config={config}
          isPreview={isPreview}
          announcement={announcement || (config?.announcement as any)}
          businessInfo={businessInfo}
        />
      )}

      {/* Header spacer */}
      <div
        className={announcementText ? 'h-[104px] lg:h-[120px]' : 'h-[66px] lg:h-[82px]'}
        aria-hidden="true"
      />

      {/* Main content - sections */}
      <main>{sections.map(renderSection)}</main>

      {/* Floating buttons (WhatsApp, Call) */}
      {!isPreview && <FloatingButtons config={config} storeName={storeName} theme={legacyTheme} />}

      {/* Footer */}
      {Footer && (
        <Footer
          storeName={storeName}
          logo={logo}
          socialLinks={socialLinks}
          footerConfig={footerConfig}
          businessInfo={businessInfo}
          categories={validCategories}
          planType={planType}
          themeColors={legacyTheme}
          isPreview={isPreview}
        />
      )}

      {/* Template-specific animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );

  // Wrap with providers
  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>{() => content}</ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// FLOATING BUTTONS COMPONENT
// ============================================================================

interface FloatingButtonsProps {
  config: StoreTemplateProps['config'];
  storeName: string;
  theme: StoreTemplateTheme;
}

function FloatingButtons({ config, storeName, theme }: FloatingButtonsProps) {
  if (!config) return null;

  const hasWhatsApp = config.floatingWhatsappEnabled && config.floatingWhatsappNumber;
  const hasCall = config.floatingCallEnabled && config.floatingCallNumber;

  if (!hasWhatsApp && !hasCall) return null;

  // Format phone number for WhatsApp (BD format)
  const formatWhatsAppNumber = (phone: string): string => {
    return phone.replace(/\D/g, '').replace(/^01/, '8801');
  };

  return (
    <>
      {hasWhatsApp && (
        <a
          href={`https://wa.me/${formatWhatsAppNumber(config.floatingWhatsappNumber!)}?text=${encodeURIComponent(
            config.floatingWhatsappMessage || `Hello ${storeName}, I'd like to know...`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
          title="Message on WhatsApp"
        >
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
        </a>
      )}

      {hasCall && (
        <a
          href={`tel:${config.floatingCallNumber}`}
          className={`fixed bottom-20 md:bottom-8 ${hasWhatsApp ? 'right-20' : 'right-4'} z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110`}
          style={{ backgroundColor: theme.accent }}
          title="Call us"
        >
          <svg
            className="h-7 w-7"
            style={{ color: theme.background }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: theme.accent }}
          />
        </a>
      )}
    </>
  );
}

// ============================================================================
// PREVIEW MODE WRAPPER
// ============================================================================

interface PreviewWrapperProps {
  children: React.ReactNode;
  templateId: string;
  themeConfig: ThemeConfig;
}

/**
 * Wrapper for preview mode that adds a preview indicator
 */
export function PreviewWrapper({ children, templateId, themeConfig }: PreviewWrapperProps) {
  return (
    <div className="relative">
      {/* Preview mode indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-50 py-2 text-center text-xs font-bold tracking-widest uppercase"
        style={{
          backgroundColor: themeConfig.colors.primary,
          color: themeConfig.colors.background,
        }}
      >
        Preview Mode - {templateId}
      </div>
      {/* Add padding for preview bar */}
      <div className="pt-8">{children}</div>
    </div>
  );
}

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export default BaseTemplate;

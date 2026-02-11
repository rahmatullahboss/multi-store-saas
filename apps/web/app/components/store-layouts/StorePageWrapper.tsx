/**
 * StorePageWrapper Component - IMPROVED VERSION
 *
 * Provides template-consistent header, footer, and styling wrapper
 * for non-homepage store pages (cart, product detail, checkout, etc.)
 *
 * Improvements:
 * - Memoized expensive calculations (CSS variables, theme detection)
 * - Error boundaries for header/footer failures
 * - Optimized re-renders with React.memo
 * - Better type safety
 */

import React, { type ReactNode, Suspense, useMemo } from 'react';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';
// import { StorePushPrompt } from '~/components/store/StorePushPrompt';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { getStoreTemplate, type StoreTemplateTheme } from '~/templates/store-registry';
import { MobileBottomNav } from '~/components/store/MobileBottomNav';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import type { SocialLinks, ThemeConfig, FooterConfig } from '@db/types';

interface StorePageWrapperProps {
  children: ReactNode;
  /** When true, do not render legacy template header/footer. Use when ThemeStoreRenderer renders header/footer sections. */
  hideHeaderFooter?: boolean;
  storeName: string;
  storeId: number;
  logo?: string | null;
  templateId: string;
  theme?: StoreTemplateTheme;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  cartCount?: number;
  categories?: (string | null)[];
  currentCategory?: string | null;
  config?: ThemeConfig | null;
  footerConfig?: FooterConfig | null;
  planType?: string;
  tagline?: string | null;
  storeDescription?: string | null;
  isPreview?: boolean;
  customer?: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
  // AI Chat props
  isCustomerAiEnabled?: boolean;
  aiCredits?: number;
  accentColor?: string;
  agentName?: string;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class HeaderErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[StorePageWrapper] Header error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

class FooterErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[StorePageWrapper] Footer error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function StorePageWrapperComponent({
  children,
  hideHeaderFooter = false,
  storeName,
  storeId,
  logo,
  templateId,
  theme,
  // currency = 'BDT',
  socialLinks,
  businessInfo,
  cartCount = 0,
  categories = [],
  currentCategory,
  config,
  footerConfig,
  planType = 'free',
  tagline,
  storeDescription,
  isPreview = false,
  customer,
  // AI props
  isCustomerAiEnabled = false,
  aiCredits = 0,
  accentColor,
  agentName,
}: StorePageWrapperProps) {
  // Memoize template lookup (expensive operation)
  const template = useMemo(() => getStoreTemplate(templateId), [templateId]);

  // Memoize theme resolution
  const resolvedTheme = useMemo(() => theme || template.theme, [theme, template.theme]);

  // Memoize dark theme detection
  const isDarkTheme = useMemo(
    () => templateId === 'modern-premium' || templateId === 'tech-modern',
    [templateId]
  );

  // Memoize background class
  const bgClass = useMemo(
    () => (isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'),
    [isDarkTheme]
  );

  // Memoize CSS variables generation (prevents re-render on every render)
  const cssVariables = useMemo(() => {
    const headingFont = template.fonts?.heading || 'Inter, sans-serif';
    const bodyFont = template.fonts?.body || 'Inter, sans-serif';

    return `
      :root {
        --color-primary: ${resolvedTheme.primary};
        --color-accent: ${resolvedTheme.accent};
        --color-background: ${resolvedTheme.background};
        --color-text: ${resolvedTheme.text};
        --color-muted: ${resolvedTheme.muted};
        --color-card-bg: ${resolvedTheme.cardBg};
        --color-header-bg: ${resolvedTheme.headerBg};
        --color-footer-bg: ${resolvedTheme.footerBg};
        --color-footer-text: ${resolvedTheme.footerText};
        --font-heading: ${headingFont};
        --font-body: ${bodyFont};
      }
      
      body {
        font-family: var(--font-body);
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
    `;
  }, [
    resolvedTheme.primary,
    resolvedTheme.accent,
    resolvedTheme.background,
    resolvedTheme.text,
    resolvedTheme.muted,
    resolvedTheme.cardBg,
    resolvedTheme.headerBg,
    resolvedTheme.footerBg,
    resolvedTheme.footerText,
    template.fonts?.heading,
    template.fonts?.body,
  ]);

  // Memoize background decorations (only for light themes)
  const backgroundDecorations = useMemo(() => {
    if (isDarkTheme) return null;

    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-32 -right-20 h-72 w-72 rounded-full blur-3xl opacity-60"
          style={{ backgroundColor: `${resolvedTheme.accent}30` }}
        />
        <div
          className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full blur-3xl opacity-60"
          style={{ backgroundColor: `${resolvedTheme.primary}30` }}
        />
      </div>
    );
  }, [isDarkTheme, resolvedTheme.accent, resolvedTheme.primary]);

  // Memoize header props to prevent re-renders
  const headerProps = useMemo(
    () => ({
      storeName,
      logo,
      isPreview,
      config,
      categories,
      currentCategory,
      socialLinks,
    }),
    [storeName, logo, isPreview, config, categories, currentCategory, socialLinks]
  );

  // Memoize fallback header props
  const fallbackHeaderProps = useMemo(
    () => ({
      storeName,
      logo,
      theme: resolvedTheme,
      templateId,
      cartCount,
      storeId,
      config,
      customer,
    }),
    [storeName, logo, resolvedTheme, templateId, cartCount, storeId, config, customer]
  );

  // Memoize footer props
  const footerProps = useMemo(
    () => ({
      storeName,
      logo,
      socialLinks,
      footerConfig,
      businessInfo,
      categories,
      planType,
      isPreview,
    }),
    [storeName, logo, socialLinks, footerConfig, businessInfo, categories, planType, isPreview]
  );

  // Memoize fallback footer props
  const fallbackFooterProps = useMemo(
    () => ({
      storeName,
      logo,
      theme: resolvedTheme,
      templateId,
      socialLinks,
      businessInfo,
      planType,
      tagline,
      storeDescription,
      showPoweredBy: footerConfig?.showPoweredBy ?? true,
      config,
      isPreview,
    }),
    [
      storeName,
      logo,
      resolvedTheme,
      templateId,
      socialLinks,
      businessInfo,
      planType,
      tagline,
      storeDescription,
      footerConfig?.showPoweredBy,
      config,
      isPreview,
    ]
  );

  // Memoize mobile nav theme
  const mobileNavTheme = useMemo(
    () => ({
      primary: resolvedTheme.primary,
      accent: resolvedTheme.accent,
      background: resolvedTheme.background,
      text: resolvedTheme.text,
      muted: resolvedTheme.muted,
      cardBg: resolvedTheme.cardBg,
      border: resolvedTheme.cardBorder ?? 'rgba(0,0,0,0.08)',
    }),
    [
      resolvedTheme.primary,
      resolvedTheme.accent,
      resolvedTheme.background,
      resolvedTheme.text,
      resolvedTheme.muted,
      resolvedTheme.cardBg,
      resolvedTheme.cardBorder,
    ]
  );

  // Error handlers
  const handleHeaderError = React.useCallback((error: Error) => {
    console.error('[StorePageWrapper] Header failed to render:', error);
  }, []);

  const handleFooterError = React.useCallback((error: Error) => {
    console.error('[StorePageWrapper] Footer failed to render:', error);
  }, []);

  return (
    <WishlistProvider>
      {/* Inject CSS variables globally - using key to prevent re-injection */}
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        {/* Background Decorations (light mode only) */}
        {backgroundDecorations}

        {/* Header - SSR Safe with Error Boundary */}
        {!hideHeaderFooter && (
          <Suspense fallback={<HeaderSkeleton />}>
            <HeaderErrorBoundary
              fallback={<StoreHeader {...fallbackHeaderProps} />}
              onError={handleHeaderError}
            >
              {template.Header ? (
                <template.Header {...headerProps} />
              ) : (
                <StoreHeader {...fallbackHeaderProps} />
              )}
            </HeaderErrorBoundary>
          </Suspense>
        )}

        {/* Main Content */}
        <main className="relative z-10">
            {/* <StorePushPrompt storeName={storeName} /> */}
          {children}
        </main>

        {/* Footer - SSR Safe with Error Boundary */}
        {!hideHeaderFooter && (
          <Suspense fallback={<FooterSkeleton />}>
            <FooterErrorBoundary
              fallback={<StoreFooter {...fallbackFooterProps} />}
              onError={handleFooterError}
            >
              {template.Footer ? (
                <template.Footer {...footerProps} />
              ) : (
                <StoreFooter {...fallbackFooterProps} />
              )}
            </FooterErrorBoundary>
          </Suspense>
        )}

        {!isPreview && !hideHeaderFooter && (
          <FloatingContactButtons
            whatsappEnabled={config?.floatingWhatsappEnabled}
            whatsappNumber={
              config?.floatingWhatsappNumber ||
              socialLinks?.whatsapp ||
              businessInfo?.phone ||
              undefined
            }
            whatsappMessage={config?.floatingWhatsappMessage || undefined}
            callEnabled={config?.floatingCallEnabled}
            callNumber={config?.floatingCallNumber || businessInfo?.phone || undefined}
            storeName={storeName}
            // AI Chat props
            aiEnabled={isCustomerAiEnabled}
            aiCredits={aiCredits}
            storeId={storeId}
            accentColor={accentColor}
            agentName={agentName}
          />
        )}

        {/* Mobile Bottom Navigation - DC Store Style */}
        <MobileBottomNav storeName={storeName} theme={mobileNavTheme} wishlistEnabled={true} />
      </div>
    </WishlistProvider>
  );
}

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function HeaderSkeleton() {
  return (
    <div className="h-16 bg-gray-100 animate-pulse" role="progressbar" aria-label="Loading header">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="flex-1 h-4 bg-gray-200 rounded" />
        <div className="w-24 h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className="h-32 bg-gray-100 animate-pulse" role="progressbar" aria-label="Loading footer">
      <div className="h-full max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="h-4 bg-gray-200 rounded col-span-2" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

// Memoize the entire component to prevent unnecessary re-renders
export const StorePageWrapper = React.memo(StorePageWrapperComponent);

// Re-export for convenience
export { StoreHeader } from './StoreHeader';
export { StoreFooter } from './StoreFooter';

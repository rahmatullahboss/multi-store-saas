/**
 * StorePageWrapper Component
 *
 * Provides template-consistent header, footer, and styling wrapper
 * for non-homepage store pages (cart, product detail, checkout, etc.)
 */

import { type ReactNode, Suspense } from 'react';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';
import { StorePushPrompt } from '~/components/store/StorePushPrompt';
import { WishlistProvider } from '~/contexts/WishlistContext';
import {
  getStoreTemplate,
  getStoreTemplateTheme,
  type StoreTemplateTheme,
} from '~/templates/store-registry';
import type { SocialLinks, ThemeConfig, FooterConfig } from '@db/types';

interface StorePageWrapperProps {
  children: ReactNode;
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
}

export function StorePageWrapper({
  children,
  storeName,
  storeId,
  logo,
  templateId,
  theme,
  currency = 'BDT',
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
}: StorePageWrapperProps) {
  // Get template from registry
  const template = getStoreTemplate(templateId);
  const resolvedTheme = theme || template.theme;

  // Determine background and text colors based on template
  const isDarkTheme = templateId === 'modern-premium' || templateId === 'tech-modern';

  const bgClass = isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';

  return (
    <WishlistProvider>
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        {/* Background Decorations (light mode only) */}
        {!isDarkTheme && (
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
        )}

        {/* Header - SSR Safe */}
        <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
          {template.Header ? (
            <template.Header
              storeName={storeName}
              logo={logo}
              isPreview={isPreview}
              config={config}
              categories={categories}
              currentCategory={currentCategory}
              socialLinks={socialLinks}
            />
          ) : (
            <StoreHeader
              storeName={storeName}
              logo={logo}
              theme={resolvedTheme}
              templateId={templateId}
              cartCount={cartCount}
              storeId={storeId}
              config={config}
              customer={customer}
            />
          )}
        </Suspense>

        {/* Main Content */}
        <main className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <StorePushPrompt storeName={storeName} />
          </div>
          {children}
        </main>

        {/* Footer - SSR Safe */}
        <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
          {template.Footer ? (
            <template.Footer
              storeName={storeName}
              logo={logo}
              socialLinks={socialLinks}
              footerConfig={footerConfig}
              businessInfo={businessInfo}
              categories={categories}
              planType={planType}
              isPreview={isPreview}
            />
          ) : (
            <StoreFooter
              storeName={storeName}
              logo={logo}
              theme={resolvedTheme}
              templateId={templateId}
              socialLinks={socialLinks}
              businessInfo={businessInfo}
              planType={planType}
              tagline={tagline}
              storeDescription={storeDescription}
              showPoweredBy={footerConfig?.showPoweredBy ?? true}
              config={config}
              isPreview={isPreview}
            />
          )}
        </Suspense>
      </div>
    </WishlistProvider>
  );
}

// Re-export for convenience
export { StoreHeader } from './StoreHeader';
export { StoreFooter } from './StoreFooter';

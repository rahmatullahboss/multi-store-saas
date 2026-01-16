/**
 * StorePageWrapper Component
 * 
 * Provides template-consistent header, footer, and styling wrapper
 * for non-homepage store pages (cart, product detail, checkout, etc.)
 */

import type { ReactNode } from 'react';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';
import { getStoreTemplate, getStoreTemplateTheme, type StoreTemplateTheme } from '~/templates/store-registry';
import type { SocialLinks, ThemeConfig, FooterConfig } from '@db/types';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';

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
  isPreview = false,
  customer,
}: StorePageWrapperProps) {
  // Get template from registry
  const template = getStoreTemplate(templateId);
  const resolvedTheme = theme || template.theme;
  
  // Determine background and text colors based on template
  const isDarkTheme = templateId === 'modern-premium' || templateId === 'tech-modern';
  
  const bgClass = isDarkTheme 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-900';

  return (
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

      {/* Header */}
      <ClientOnly fallback={<SkeletonLoader />}>
        {() => (
          template.Header ? (
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
              customer={customer}
            />
          )
        )}
      </ClientOnly>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <ClientOnly fallback={<div className="h-40" />}>
        {() => (
          template.Footer ? (
            <template.Footer
              storeName={storeName}
              logo={logo}
              socialLinks={socialLinks}
              footerConfig={footerConfig}
              businessInfo={businessInfo}
              categories={categories}
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
              showPoweredBy={footerConfig?.showPoweredBy ?? true}
            />
          )
        )}
      </ClientOnly>
    </div>
  );
}

// Re-export for convenience
export { StoreHeader } from './StoreHeader';
export { StoreFooter } from './StoreFooter';

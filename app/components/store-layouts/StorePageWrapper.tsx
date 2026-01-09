/**
 * StorePageWrapper Component
 * 
 * Provides template-consistent header, footer, and styling wrapper
 * for non-homepage store pages (cart, product detail, checkout, etc.)
 */

import type { ReactNode } from 'react';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';
import { getStoreTemplateTheme, type StoreTemplateTheme } from '~/templates/store-registry';
import type { SocialLinks } from '@db/types';

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
}: StorePageWrapperProps) {
  // Get theme from registry if not provided
  const resolvedTheme = theme || getStoreTemplateTheme(templateId);
  
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
      <StoreHeader
        storeName={storeName}
        logo={logo}
        theme={resolvedTheme}
        templateId={templateId}
        cartCount={cartCount}
      />

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <StoreFooter
        storeName={storeName}
        logo={logo}
        theme={resolvedTheme}
        templateId={templateId}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      />
    </div>
  );
}

// Re-export for convenience
export { StoreHeader } from './StoreHeader';
export { StoreFooter } from './StoreFooter';

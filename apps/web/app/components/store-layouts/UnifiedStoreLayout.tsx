/**
 * UnifiedStoreLayout Component
 *
 * Template-system-aware layout that:
 * 1. Uses new template system (themes/templates/sections) if available
 * 2. Falls back to legacy store-registry templates if not
 *
 * This component eliminates the need for per-template conditionals
 * in route files (isDaraz, isBDShop, isRovo, etc.)
 */

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import type { Store } from '@db/schema';
import type { SocialLinks, FooterConfig } from '@db/types';
import type { ThemeSettings, ResolvedSection, RenderContext } from '~/lib/template-resolver.server';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';
import { StorePageWrapper } from './StorePageWrapper';
import { MobileBottomNav } from '~/components/store/MobileBottomNav';
import {
  getStoreTemplateTheme,
  DEFAULT_STORE_TEMPLATE_ID,
} from '~/templates/store-registry';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedStoreLayoutProps {
  children?: ReactNode;

  // Store context
  store: Store;
  storeId: number;

  // Template system (new)
  templateSections?: ResolvedSection[];
  themeSettings?: ThemeSettings;
  renderContext?: RenderContext;

  // Legacy system fallback
  legacyTemplateId?: string;

  // Common props
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  footerConfig?: FooterConfig | null;
  categories?: (string | null)[];
  currentCategory?: string | null;
  cartCount?: number;
  planType?: string;
  customer?: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;

  // Mode
  isPreview?: boolean;
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LayoutLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b" />
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <div className="h-64 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// UNIFIED STORE LAYOUT
// ============================================================================

export function UnifiedStoreLayout({
  children,
  store,
  storeId,
  templateSections,
  themeSettings,
  renderContext,
  legacyTemplateId,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  footerConfig,
  categories = [],
  currentCategory,
  cartCount = 0,
  planType = 'free',
  customer,
  isPreview = false,
}: UnifiedStoreLayoutProps) {
  // Determine if we're using the new template system
  const useNewTemplateSystem = templateSections && templateSections.length > 0;

  // ============================================================================
  // NEW TEMPLATE SYSTEM RENDERING
  // ============================================================================
  if (useNewTemplateSystem && themeSettings && renderContext) {
    return (
      <Suspense fallback={<LayoutLoadingFallback />}>
        <NewTemplateSystemLayout
          store={store}
          storeId={storeId}
          sections={templateSections}
          settings={themeSettings}
          context={renderContext}
          currency={currency}
          socialLinks={socialLinks}
          businessInfo={businessInfo}
          footerConfig={footerConfig}
          categories={categories}
          currentCategory={currentCategory}
          cartCount={cartCount}
          planType={planType}
          customer={customer}
          isPreview={isPreview}
        >
          {children}
        </NewTemplateSystemLayout>
      </Suspense>
    );
  }

  // ============================================================================
  // LEGACY TEMPLATE SYSTEM FALLBACK
  // ============================================================================
  const templateId = legacyTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(templateId);

  return (
    <Suspense fallback={<LayoutLoadingFallback />}>
      <StorePageWrapper
        storeName={store.name}
        storeId={storeId}
        logo={store.logo}
        templateId={templateId}
        theme={theme}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        cartCount={cartCount}
        categories={categories}
        currentCategory={currentCategory}
        footerConfig={footerConfig}
        planType={planType}
        isPreview={isPreview}
        customer={customer}
      >
        {children}
      </StorePageWrapper>
    </Suspense>
  );
}

// ============================================================================
// NEW TEMPLATE SYSTEM LAYOUT (Internal Component)
// ============================================================================

interface NewTemplateSystemLayoutProps {
  children?: ReactNode;
  store: Store;
  storeId: number;
  sections: ResolvedSection[];
  settings: ThemeSettings;
  context: RenderContext;
  currency: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  footerConfig?: FooterConfig | null;
  categories?: (string | null)[];
  currentCategory?: string | null;
  cartCount?: number;
  planType?: string;
  customer?: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
  isPreview?: boolean;
}

function NewTemplateSystemLayout({
  children,
  store,
  storeId,
  sections,
  settings,
  context,
  currency,
  socialLinks,
  businessInfo,
  footerConfig,
  categories = [],
  currentCategory,
  cartCount = 0,
  planType = 'free',
  customer,
  isPreview = false,
}: NewTemplateSystemLayoutProps) {
  // Extract colors from theme settings
  const bgColor = settings.backgroundColor || '#FFFFFF';
  const textColor = settings.textColor || '#1F2937';
  const primaryColor = settings.primaryColor || '#000000';
  const accentColor = settings.accentColor || '#6366F1';

  // Filter categories for header
  const filteredCategories = categories.filter((c): c is string => c !== null);

  // Prepare section renderer props based on context
  const sectionProps = buildSectionProps(context, {
    storeId,
    storeName: store.name,
    currency,
    socialLinks,
    businessInfo,
    categories: filteredCategories,
  });

  // Convert ResolvedSection[] to format expected by SectionRenderer
  const sectionsForRenderer = sections.map((section) => ({
    id: section.id,
    type: section.type,
    settings: section.props,
    blocks: section.blocks,
  }));

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Theme CSS Variables */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --theme-primary: ${primaryColor};
            --theme-accent: ${accentColor};
            --theme-background: ${bgColor};
            --theme-text: ${textColor};
            --theme-heading-font: ${settings.headingFont || 'Inter'};
            --theme-body-font: ${settings.bodyFont || 'Inter'};
          }
        `,
        }}
      />

      {/* Announcement Bar */}
      {settings.showAnnouncement && settings.announcementText && (
        <div
          className="py-2 px-4 text-center text-sm"
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
        >
          {settings.announcementText}
        </div>
      )}

      {/* Header - Uses dynamic header section if available, otherwise default */}
      <TemplateHeader
        store={store}
        settings={settings}
        categories={filteredCategories}
        currentCategory={currentCategory}
        socialLinks={socialLinks}
        cartCount={cartCount}
        customer={customer}
        isPreview={isPreview}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* Render template sections */}
        <SectionRenderer sections={sectionsForRenderer} {...sectionProps} />

        {/* Children (for route-specific content that's not section-based) */}
        {children}
      </main>

      {/* Footer */}
      <TemplateFooter
        store={store}
        settings={settings}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        footerConfig={footerConfig}
        categories={filteredCategories}
        planType={planType}
      />

      {/* Mobile Bottom Navigation - DC Store Style */}
      <MobileBottomNav
        storeName={store.name}
        theme={{
          primary: settings.primaryColor || primaryColor,
          accent: settings.accentColor || accentColor,
          background: settings.backgroundColor || bgColor,
          text: settings.textColor || textColor,
          cardBg: settings.backgroundColor || bgColor,
        }}
        wishlistEnabled={true}
        isPreview={isPreview}
      />
    </div>
  );
}

// ============================================================================
// TEMPLATE HEADER (Dynamic)
// ============================================================================

interface TemplateHeaderProps {
  store: Store;
  settings: ThemeSettings;
  categories: string[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  cartCount: number;
  customer?: { id: number; name: string | null; email: string | null } | null;
  isPreview?: boolean;
}

function TemplateHeader({
  store,
  settings,
  categories,
  currentCategory,
  socialLinks: _socialLinks,
  cartCount,
  customer,
  isPreview: _isPreview,
}: TemplateHeaderProps) {
  const headerStyle = settings.headerStyle || 'solid';
  const isSticky = headerStyle === 'sticky';
  const isTransparent = headerStyle === 'transparent';

  const headerBg = isTransparent
    ? 'bg-transparent'
    : settings.backgroundColor === '#FFFFFF' || !settings.backgroundColor
      ? 'bg-white'
      : '';

  return (
    <header
      className={`
        ${isSticky ? 'sticky top-0 z-50' : 'relative'}
        ${headerBg}
        ${!isTransparent ? 'border-b border-gray-200' : ''}
        transition-all duration-300
      `}
      style={
        !isTransparent ? { backgroundColor: settings.backgroundColor || '#FFFFFF' } : undefined
      }
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Store Name */}
          <a href="/" className="flex items-center gap-2">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-auto object-contain" />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: settings.primaryColor || '#000000' }}
              >
                {store.name}
              </span>
            )}
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: settings.textColor || '#1F2937' }}
            >
              Home
            </a>
            {categories.slice(0, 5).map((category) => (
              <a
                key={category}
                href={`/collections/${encodeURIComponent(category.toLowerCase())}`}
                className={`text-sm font-medium hover:opacity-70 transition-opacity ${
                  currentCategory === category ? 'underline underline-offset-4' : ''
                }`}
                style={{ color: settings.textColor || '#1F2937' }}
              >
                {category}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="p-2 hover:opacity-70 transition-opacity">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Cart */}
            <a href="/cart" className="p-2 hover:opacity-70 transition-opacity relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ backgroundColor: settings.accentColor || '#6366F1' }}
                >
                  {cartCount}
                </span>
              )}
            </a>

            {/* User */}
            {customer ? (
              <a href="/account" className="p-2 hover:opacity-70 transition-opacity">
                <span className="text-sm font-medium">{customer.name || 'Account'}</span>
              </a>
            ) : (
              <a href="/account/login" className="p-2 hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// TEMPLATE FOOTER (Dynamic)
// ============================================================================

interface TemplateFooterProps {
  store: Store;
  settings: ThemeSettings;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  footerConfig?: FooterConfig | null;
  categories: string[];
  planType?: string;
}

function TemplateFooter({
  store,
  settings,
  socialLinks,
  businessInfo,
  footerConfig,
  categories,
  planType = 'free',
}: TemplateFooterProps) {
  const footerStyle = settings.footerStyle || 'minimal';
  const showNewsletter = settings.showNewsletter ?? false;
  const showPoweredBy = footerConfig?.showPoweredBy ?? planType === 'free';

  // Footer background - typically darker
  const footerBg = isColorDark(settings.backgroundColor || '#FFFFFF')
    ? settings.backgroundColor
    : '#1F2937';
  const footerText = isColorDark(footerBg || '#1F2937') ? '#FFFFFF' : '#1F2937';

  return (
    <footer style={{ backgroundColor: footerBg, color: footerText }}>
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="border-b border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-sm opacity-70 mb-4">
              Get updates on new products and special offers
            </p>
            <form className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: settings.accentColor || '#6366F1', color: '#FFFFFF' }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`grid gap-8 ${footerStyle === 'detailed' ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}
          >
            {/* Brand Column */}
            <div>
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-8 w-auto mb-4" />
              ) : (
                <h4 className="text-lg font-bold mb-4">{store.name}</h4>
              )}
              {footerConfig?.description && (
                <p className="text-sm opacity-70">{footerConfig.description}</p>
              )}
              {businessInfo && (
                <div className="mt-4 space-y-1 text-sm opacity-70">
                  {businessInfo.phone && <p>📞 {businessInfo.phone}</p>}
                  {businessInfo.email && <p>✉️ {businessInfo.email}</p>}
                  {businessInfo.address && <p>📍 {businessInfo.address}</p>}
                </div>
              )}
            </div>

            {/* Quick Links */}
            {footerStyle === 'detailed' && (
              <>
                <div>
                  <h5 className="font-semibold mb-4">Quick Links</h5>
                  <ul className="space-y-2 text-sm opacity-70">
                    <li>
                      <a href="/" className="hover:opacity-100 transition-opacity">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="/products" className="hover:opacity-100 transition-opacity">
                        Products
                      </a>
                    </li>
                    <li>
                      <a href="/about" className="hover:opacity-100 transition-opacity">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="/contact" className="hover:opacity-100 transition-opacity">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold mb-4">Categories</h5>
                  <ul className="space-y-2 text-sm opacity-70">
                    {categories.slice(0, 5).map((cat) => (
                      <li key={cat}>
                        <a
                          href={`/collections/${encodeURIComponent(cat.toLowerCase())}`}
                          className="hover:opacity-100 transition-opacity"
                        >
                          {cat}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Social Links */}
            <div>
              <h5 className="font-semibold mb-4">Follow Us</h5>
              <div className="flex gap-4">
                {socialLinks?.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                    </svg>
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2.16c3.2,0,3.58.01,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s-.01,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.17,8.8,2.16,12,2.16ZM12,0C8.74,0,8.33.01,7.05.07c-4.27.2-6.78,2.71-6.98,6.98C.01,8.33,0,8.74,0,12s.01,3.67.07,4.95c.2,4.27,2.71,6.78,6.98,6.98,1.28.06,1.69.07,4.95.07s3.67-.01,4.95-.07c4.27-.2,6.78-2.71,6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.27-2.71-6.78-6.98-6.98C15.67.01,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.41,4.15a1.44,1.44,0,1,0,1.44,1.44A1.44,1.44,0,0,0,18.41,4.15Z" />
                    </svg>
                  </a>
                )}
                {socialLinks?.whatsapp && (
                  <a
                    href={`https://wa.me/${socialLinks.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.47,14.38c-.29-.15-1.7-.84-1.97-.93s-.46-.15-.65.15-.74.93-.91,1.12-.34.22-.63.07a7.91,7.91,0,0,1-2.32-1.43,8.71,8.71,0,0,1-1.6-2c-.17-.29,0-.45.13-.59s.29-.34.43-.51a1.94,1.94,0,0,0,.29-.49.54.54,0,0,0,0-.51c-.07-.15-.65-1.56-.89-2.14s-.47-.49-.65-.5-.36,0-.55,0a1.06,1.06,0,0,0-.77.36,3.22,3.22,0,0,0-1,2.39,5.59,5.59,0,0,0,1.17,2.97,12.79,12.79,0,0,0,4.91,4.34,15.33,15.33,0,0,0,1.64.61,3.93,3.93,0,0,0,1.81.11,2.95,2.95,0,0,0,1.93-1.36,2.39,2.39,0,0,0,.17-1.36C17.94,14.53,17.76,14.45,17.47,14.38Zm-5.36,7.34h0a9.87,9.87,0,0,1-5-1.37l-.36-.21L2.91,21.27l1.15-4.21-.23-.37a9.91,9.91,0,1,1,8.28,5Z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-70">
          <p>
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="/policies/privacy" className="hover:opacity-100 transition-opacity">
              Privacy Policy
            </a>
            <a href="/policies/terms" className="hover:opacity-100 transition-opacity">
              Terms of Service
            </a>
            <a href="/policies/refund" className="hover:opacity-100 transition-opacity">
              Refund Policy
            </a>
          </div>
        </div>

        {/* Powered by Ozzyl */}
        {showPoweredBy && (
          <div className="text-center mt-4 text-xs opacity-50">
            Powered by{' '}
            <a
              href="https://ozzyl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100"
            >
              Ozzyl
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a color is dark (for contrast calculations)
 */
function isColorDark(color: string): boolean {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  return false;
}

/**
 * Build section renderer props from render context
 */
function buildSectionProps(
  context: RenderContext,
  common: {
    storeId: number;
    storeName: string;
    currency: string;
    socialLinks?: SocialLinks | null;
    businessInfo?: { phone?: string; email?: string; address?: string } | null;
    categories: string[];
  }
) {
  const base = {
    storeId: common.storeId,
    storeName: common.storeName,
    currency: common.currency,
    socialLinks: common.socialLinks,
    businessInfo: common.businessInfo,
    categories: common.categories,
    theme: context.theme,
  };

  switch (context.kind) {
    case 'home':
      return {
        ...base,
        products: context.featuredProducts || [],
      };

    case 'product':
      return {
        ...base,
        product: context.product,
        relatedProducts: context.relatedProducts || [],
      };

    case 'collection':
      return {
        ...base,
        products: context.products || [],
        collection: context.collection,
      };

    case 'cart':
      return {
        ...base,
        cart: context.cart,
      };

    case 'checkout':
      return {
        ...base,
        cart: context.cart,
        shippingOptions: context.shippingOptions,
        paymentMethods: context.paymentMethods,
      };

    case 'page':
    default:
      return {
        ...base,
        page: context.page,
      };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { TemplateHeader, TemplateFooter };

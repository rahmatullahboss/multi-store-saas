/**
 * Luxe Boutique Store Template
 * 
 * Elegant design for fashion, jewelry & luxury goods.
 * Features: Black + Gold accents, serif typography, refined animations.
 */

import { Link } from '@remix-run/react';
import { ShoppingBag, Search, Menu, X, Heart, ChevronRight, Instagram, Facebook, Mail, Home as HomeIcon, Grid3X3, User, Phone, MessageCircle, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
// import { LanguageSelector } from '~/components/LanguageSelector'; // Temporarily disabled - Bengali is default

import { LUXE_BOUTIQUE_THEME } from './theme';
import { LuxeBoutiqueHeader } from './sections/Header';
import { LuxeBoutiqueFooter } from './sections/Footer';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function LuxeBoutiqueTemplate({
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
  planType = 'free',
  isPreview,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();
  const count = useCartCount();

  // Filter valid categories
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: LUXE_BOUTIQUE_THEME.background, fontFamily: "'Inter', sans-serif" }}>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <LuxeBoutiqueHeader 
        storeName={storeName} 
        logo={logo} 
        categories={validCategories} 
        currentCategory={currentCategory}
        count={count}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
      />

      {/* ==================== DYNAMIC SECTIONS ==================== */}
      {(config?.sections ?? DEFAULT_SECTIONS).map((section: any) => {
        const SectionComponent = SECTION_REGISTRY[section.type]?.component;
        if (!SectionComponent) return null;
        
        return (
          <SectionComponent
            key={section.id}
            settings={section.settings}
            theme={LUXE_BOUTIQUE_THEME}
            products={products}
            categories={categories}
            storeId={storeId}
            currency={currency}
            store={{
              name: storeName,
              email: businessInfo?.email,
              phone: businessInfo?.phone,
              address: businessInfo?.address,
              currency: currency
            }}
          />
        );
      })}


      {/* ==================== CATEGORY PILLS (Mobile) ==================== */}
      {validCategories.length > 0 && (
        <div className="lg:hidden overflow-x-auto py-4 px-4 border-b" style={{ borderColor: '#e5e5e5' }}>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all"
              style={{
                backgroundColor: !currentCategory ? LUXE_BOUTIQUE_THEME.primary : 'transparent',
                color: !currentCategory ? 'white' : LUXE_BOUTIQUE_THEME.text,
                borderColor: !currentCategory ? LUXE_BOUTIQUE_THEME.primary : '#d1d5db',
              }}
            >
              All
            </Link>
            {validCategories.map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all"
                style={{
                  backgroundColor: currentCategory === category ? LUXE_BOUTIQUE_THEME.primary : 'transparent',
                  color: currentCategory === category ? 'white' : LUXE_BOUTIQUE_THEME.text,
                  borderColor: currentCategory === category ? LUXE_BOUTIQUE_THEME.primary : '#d1d5db',
                }}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}



        <LuxeBoutiqueFooter 
          storeName={storeName} 
          socialLinks={socialLinks || undefined} 
          footerConfig={footerConfig || undefined} 
          businessInfo={businessInfo}
          planType={planType}
          categories={validCategories}
        />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <HomeIcon className="w-5 h-5" style={{ color: !currentCategory ? LUXE_BOUTIQUE_THEME.accent : LUXE_BOUTIQUE_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: !currentCategory ? LUXE_BOUTIQUE_THEME.accent : LUXE_BOUTIQUE_THEME.muted }}>Home</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <Grid3X3 className="w-5 h-5" style={{ color: LUXE_BOUTIQUE_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: LUXE_BOUTIQUE_THEME.muted }}>Shop</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: LUXE_BOUTIQUE_THEME.muted }} />
            <span 
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: LUXE_BOUTIQUE_THEME.accent, color: LUXE_BOUTIQUE_THEME.primary }}
            >
              {count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: LUXE_BOUTIQUE_THEME.muted }}>Bag</span>
          </Link>
          {!isPreview && (
            <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
              <User className="w-5 h-5" style={{ color: LUXE_BOUTIQUE_THEME.muted }} />
              <span className="text-[10px] font-medium" style={{ color: LUXE_BOUTIQUE_THEME.muted }}>Account</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Floating Contact Buttons */}
      {!isPreview && (
        <>
          {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
            <a
              href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `Hello ${storeName}, I'd like to know...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
              title="Message on WhatsApp"
            >
              <MessageCircle className="h-7 w-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
            </a>
          )}
          {config?.floatingCallEnabled && config?.floatingCallNumber && (
            <a
              href={`tel:${config.floatingCallNumber}`}
              className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
              title="Call us"
            >
              <Phone className="h-7 w-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
            </a>
          )}
        </>
      )}
    </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================


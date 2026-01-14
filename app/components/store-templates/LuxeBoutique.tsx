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

// ============================================================================
// LUXE BOUTIQUE THEME CONSTANTS
// ============================================================================
const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  accentHover: '#b8944f',
  background: '#faf9f7',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  cardBg: '#ffffff',
  headerBg: '#ffffff',
  footerBg: '#1a1a1a',
  footerText: '#faf9f7',
};

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
            <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: THEME.background, fontFamily: "'Inter', sans-serif" }}>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ==================== HEADER ==================== */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: THEME.headerBg, borderColor: '#e5e5e5' }}
      >
        {/* Announcement Bar */}
        {config?.announcement?.text && (
          <div 
            className="text-center py-2 text-sm"
            style={{ backgroundColor: THEME.primary, color: THEME.footerText }}
          >
            {config.announcement.link ? (
              <a href={config.announcement.link} className="hover:underline">
                {config.announcement.text}
              </a>
            ) : (
              config.announcement.text
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 lg:h-12 object-contain" />
              ) : (
                <span 
                  className="text-xl lg:text-2xl font-semibold tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif", color: THEME.primary }}
                >
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to="/"
                className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                style={{ 
                  color: !currentCategory ? THEME.accent : THEME.text,
                  borderBottom: !currentCategory ? `2px solid ${THEME.accent}` : 'none',
                  paddingBottom: '4px'
                }}
              >
                {t('allProducts')}
              </Link>
              {validCategories.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                  style={{ 
                    color: currentCategory === category ? THEME.accent : THEME.text,
                    borderBottom: currentCategory === category ? `2px solid ${THEME.accent}` : 'none',
                    paddingBottom: '4px'
                  }}
                >
                  {category}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              {/* <LanguageSelector variant="toggle" size="sm" showFlag={true} showName={false} /> */} {/* Temporarily disabled - Bengali is default */}
              <button 
                className="p-2 rounded-full transition-colors hover:bg-gray-100"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-5 h-5" style={{ color: THEME.text }} />
              </button>
              <button className="hidden sm:block p-2 rounded-full transition-colors hover:bg-gray-100">
                <Heart className="w-5 h-5" style={{ color: THEME.text }} />
              </button>
              <Link 
                to="/cart" 
                className="p-2 rounded-full transition-colors hover:bg-gray-100 relative"
              >
                <ShoppingBag className="w-5 h-5" style={{ color: THEME.text }} />
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: THEME.accent, color: THEME.primary }}
                >
                  {count}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full bg-white border-b border-gray-200 py-4 px-4 shadow-lg">
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-black"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-lg">
            <nav className="py-4">
              <Link 
                to="/"
                className="block px-6 py-3 text-sm font-medium uppercase tracking-wide"
                style={{ color: !currentCategory ? THEME.accent : THEME.text }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('allProducts')}
              </Link>
              {validCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="block px-6 py-3 text-sm font-medium uppercase tracking-wide"
                  style={{ color: currentCategory === category ? THEME.accent : THEME.text }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Gold Accent Line */}
        <div className="h-0.5" style={{ backgroundColor: THEME.accent }} />
      </header>

      {/* ==================== DYNAMIC SECTIONS ==================== */}
      {(config?.sections ?? DEFAULT_SECTIONS).map((section: any) => {
        const SectionComponent = SECTION_REGISTRY[section.type]?.component;
        if (!SectionComponent) return null;
        
        return (
          <SectionComponent
            key={section.id}
            settings={section.settings}
            theme={THEME}
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
                backgroundColor: !currentCategory ? THEME.primary : 'transparent',
                color: !currentCategory ? 'white' : THEME.text,
                borderColor: !currentCategory ? THEME.primary : '#d1d5db',
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
                  backgroundColor: currentCategory === category ? THEME.primary : 'transparent',
                  color: currentCategory === category ? 'white' : THEME.text,
                  borderColor: currentCategory === category ? THEME.primary : '#d1d5db',
                }}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}



        {/* Footer */}
        <footer style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}>
          {/* Main Footer */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h4 
                className="text-xl font-semibold mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {storeName}
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">
                {footerConfig?.description || 'Curating exceptional products for discerning customers.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-medium uppercase text-sm tracking-wider mb-4" style={{ color: THEME.accent }}>
                Quick Links
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/?category=all" className="text-white/70 hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/about" className="text-white/70 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="font-medium uppercase text-sm tracking-wider mb-4" style={{ color: THEME.accent }}>
                Contact Us
              </h5>
              <ul className="space-y-2 text-sm text-white/70">
                {businessInfo?.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {businessInfo.email}
                  </li>
                )}
                {businessInfo?.phone && (
                  <li>{businessInfo.phone}</li>
                )}
                {businessInfo?.address && (
                  <li>{businessInfo.address}</li>
                )}
              </ul>

              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                {socialLinks?.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Branding */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-2">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            
            {/* Viral Loop / Branding */}
            {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
              <div className="pt-2">
                <a 
                  href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-white/30 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
                  style={{ color: THEME.accent }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>Powered by</span>
                  <span className="font-bold tracking-tight text-sm">Ozzyl</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <HomeIcon className="w-5 h-5" style={{ color: !currentCategory ? THEME.accent : THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: !currentCategory ? THEME.accent : THEME.muted }}>Home</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <Grid3X3 className="w-5 h-5" style={{ color: THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Shop</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: THEME.muted }} />
            <span 
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: THEME.accent, color: THEME.primary }}
            >
              {count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Bag</span>
          </Link>
          {!isPreview && (
            <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
              <User className="w-5 h-5" style={{ color: THEME.muted }} />
              <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Account</span>
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


/**
 * NovaLux Premium Store Template
 * 
 * World-class luxury ecommerce template inspired by Shopify Prestige,
 * Squarespace Fulton, and 2024 design trends.
 * 
 * Features:
 * - Transparent-to-solid header on scroll
 * - Rose Gold + Charcoal luxury color palette
 * - Elegant product cards with hover animations
 * - Mobile-first responsive design
 * - Full AI compatibility (per TEMPLATE_BUILDING_GUIDE.md)
 */

import { Link } from '@remix-run/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Heart, 
  ChevronRight, 
  Star, 
  Instagram, 
  Facebook, 
  Twitter,
  Mail, 
  Phone,
  MapPin,
  Home as HomeIcon, 
  Grid3X3, 
  User, 
  ShoppingCart, 
  MessageCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { NOVALUX_THEME } from './NovaLuxTheme';

// ============================================================================
// THEME CONSTANTS (AI-compatible - use config overrides when available)
// ============================================================================
const THEME = {
  primary: NOVALUX_THEME.primary,
  accent: NOVALUX_THEME.accent,
  accentHover: NOVALUX_THEME.accentHover,
  accentLight: NOVALUX_THEME.accentLight,
  background: NOVALUX_THEME.background,
  text: NOVALUX_THEME.text,
  muted: NOVALUX_THEME.muted,
  cardBg: NOVALUX_THEME.cardBg,
  headerBg: NOVALUX_THEME.headerBgSolid,
  footerBg: NOVALUX_THEME.footerBg,
  footerText: NOVALUX_THEME.footerText,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function NovaLuxTemplate({
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
  isPreview,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();
  const count = useCartCount();

  // Handle scroll for transparent-to-solid header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter valid categories
  const validCategories = categories.filter((c): c is string => Boolean(c));

  // Get announcement from config
  const announcement = config?.announcement;

  return (
    <div 
      className="min-h-screen pb-16 md:pb-0" 
      style={{ 
        backgroundColor: THEME.background, 
        fontFamily: NOVALUX_THEME.fontBody 
      }}
    >
      {/* Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" 
        rel="stylesheet" 
      />

      {/* ==================== HEADER ==================== */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ 
          backgroundColor: isScrolled ? NOVALUX_THEME.headerBgSolid : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          boxShadow: isScrolled ? NOVALUX_THEME.headerShadow : 'none',
          borderBottom: isScrolled ? `1px solid ${NOVALUX_THEME.border}` : 'none'
        }}
      >
        {/* Announcement Bar */}
        {announcement?.text && (
          <div 
            className="text-center py-2.5 text-sm font-medium transition-all"
            style={{ 
              background: NOVALUX_THEME.accentGradient, 
              color: THEME.primary 
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {announcement.link ? (
                <a href={announcement.link} className="hover:underline">
                  {announcement.text}
                </a>
              ) : (
                announcement.text
              )}
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: THEME.primary }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: THEME.primary }} />
              )}
            </button>

            {/* Left Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                to="/"
                className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                style={{ 
                  color: !currentCategory ? THEME.accent : THEME.text,
                }}
              >
                {t('allProducts')}
              </Link>
              {validCategories.slice(0, 3).map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                  style={{ 
                    color: currentCategory === category ? THEME.accent : THEME.text,
                  }}
                >
                  {category}
                </Link>
              ))}
            </nav>

            {/* Logo (Centered) */}
            <Link to="/" className="flex items-center justify-center">
              {logo ? (
                <img 
                  src={logo} 
                  alt={storeName} 
                  className="h-10 lg:h-12 object-contain" 
                />
              ) : (
                <span 
                  className="text-2xl lg:text-3xl font-semibold tracking-wider"
                  style={{ 
                    fontFamily: NOVALUX_THEME.fontHeading, 
                    color: THEME.primary 
                  }}
                >
                  {storeName}
                </span>
              )}
            </Link>

            {/* Right Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {validCategories.slice(3, 6).map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                  style={{ 
                    color: currentCategory === category ? THEME.accent : THEME.text,
                  }}
                >
                  {category}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              <button 
                className="p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" style={{ color: THEME.text }} />
              </button>
              <button 
                className="hidden sm:flex p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" style={{ color: THEME.text }} />
              </button>
              <Link 
                to="/cart" 
                className="p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100 relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" style={{ color: THEME.text }} />
                {count > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center animate-pulse"
                    style={{ 
                      background: NOVALUX_THEME.accentGradient, 
                      color: THEME.primary 
                    }}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div 
            className="absolute inset-x-0 top-full py-6 px-4 shadow-xl animate-fadeIn"
            style={{ backgroundColor: THEME.cardBg }}
          >
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME.muted }} />
              <input
                type="text"
                placeholder={t('searchProducts') || "Search for products..."}
                className="w-full pl-12 pr-4 py-4 text-lg border-b-2 focus:outline-none transition-colors"
                style={{ 
                  borderColor: NOVALUX_THEME.border,
                  fontFamily: NOVALUX_THEME.fontBody
                }}
                autoFocus
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() => setSearchOpen(false)}
              >
                <X className="w-5 h-5" style={{ color: THEME.muted }} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 top-[64px] bg-white z-40 animate-slideIn overflow-y-auto"
            style={{ backgroundColor: THEME.cardBg }}
          >
            <nav className="py-6 px-4 space-y-1">
              <Link 
                to="/"
                className="flex items-center justify-between px-4 py-4 rounded-xl font-medium transition-all"
                style={{ 
                  backgroundColor: !currentCategory ? THEME.accentLight : 'transparent',
                  color: !currentCategory ? THEME.accent : THEME.text 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="uppercase tracking-wider text-sm">{t('allProducts')}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
              {validCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="flex items-center justify-between px-4 py-4 rounded-xl font-medium transition-all"
                  style={{ 
                    backgroundColor: currentCategory === category ? THEME.accentLight : 'transparent',
                    color: currentCategory === category ? THEME.accent : THEME.text 
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="uppercase tracking-wider text-sm">{category}</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Footer */}
            <div className="px-4 py-6 border-t" style={{ borderColor: NOVALUX_THEME.border }}>
              <div className="flex items-center justify-center gap-4">
                {socialLinks?.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-colors"
                    style={{ backgroundColor: THEME.accentLight }}
                  >
                    <Instagram className="w-5 h-5" style={{ color: THEME.accent }} />
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-colors"
                    style={{ backgroundColor: THEME.accentLight }}
                  >
                    <Facebook className="w-5 h-5" style={{ color: THEME.accent }} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accent Line */}
        <div 
          className="h-[2px] w-full transition-opacity duration-300"
          style={{ 
            background: NOVALUX_THEME.accentGradient,
            opacity: isScrolled ? 0 : 1
          }} 
        />
      </header>

      {/* Header Spacer */}
      <div className={`${announcement?.text ? 'h-[104px] lg:h-[120px]' : 'h-[66px] lg:h-[82px]'}`} />

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
            ProductCardComponent={NovaLuxProductCard}
          />
        );
      })}

      {/* ==================== CATEGORY PILLS (Mobile) ==================== */}
      {validCategories.length > 0 && (
        <div 
          className="lg:hidden overflow-x-auto py-4 px-4 border-b scrollbar-hide"
          style={{ borderColor: NOVALUX_THEME.border }}
        >
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300"
              style={{
                background: !currentCategory ? NOVALUX_THEME.accentGradient : 'transparent',
                color: !currentCategory ? THEME.primary : THEME.text,
                border: !currentCategory ? 'none' : `1px solid ${NOVALUX_THEME.border}`,
              }}
            >
              All
            </Link>
            {validCategories.map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300"
                style={{
                  background: currentCategory === category ? NOVALUX_THEME.accentGradient : 'transparent',
                  color: currentCategory === category ? THEME.primary : THEME.text,
                  border: currentCategory === category ? 'none' : `1px solid ${NOVALUX_THEME.border}`,
                }}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ==================== FOOTER ==================== */}
      <footer style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}>
        {/* Newsletter Section */}
        <div 
          className="py-16 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 
              className="text-3xl lg:text-4xl font-semibold mb-4"
              style={{ fontFamily: NOVALUX_THEME.fontHeading }}
            >
              {(config as any)?.newsletter?.heading || 'Join the NovaLux Family'}
            </h3>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              {(config as any)?.newsletter?.subheading || 'Subscribe for exclusive offers, early access to new arrivals, and curated content.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ 
                  background: NOVALUX_THEME.accentGradient, 
                  color: THEME.primary,
                  boxShadow: NOVALUX_THEME.buttonShadow
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h4 
                className="text-2xl font-semibold mb-4"
                style={{ fontFamily: NOVALUX_THEME.fontHeading }}
              >
                {storeName}
              </h4>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                {footerConfig?.description || 'Curating exceptional products for those who appreciate the finer things in life.'}
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks?.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 
                className="font-semibold uppercase text-sm tracking-wider mb-6"
                style={{ color: THEME.accent }}
              >
                Quick Links
              </h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/?category=all" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h5 
                className="font-semibold uppercase text-sm tracking-wider mb-6"
                style={{ color: THEME.accent }}
              >
                Customer Service
              </h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/shipping" className="text-white/70 hover:text-white transition-colors">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-white/70 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 
                className="font-semibold uppercase text-sm tracking-wider mb-6"
                style={{ color: THEME.accent }}
              >
                Get in Touch
              </h5>
              <ul className="space-y-4 text-sm">
                {businessInfo?.email && (
                  <li className="flex items-center gap-3 text-white/70">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(196, 163, 90, 0.15)' }}
                    >
                      <Mail className="w-4 h-4" style={{ color: THEME.accent }} />
                    </div>
                    <span>{businessInfo.email}</span>
                  </li>
                )}
                {businessInfo?.phone && (
                  <li className="flex items-center gap-3 text-white/70">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(196, 163, 90, 0.15)' }}
                    >
                      <Phone className="w-4 h-4" style={{ color: THEME.accent }} />
                    </div>
                    <span>{businessInfo.phone}</span>
                  </li>
                )}
                {businessInfo?.address && (
                  <li className="flex items-start gap-3 text-white/70">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(196, 163, 90, 0.15)' }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: THEME.accent }} />
                    </div>
                    <span>{businessInfo.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div 
          className="border-t py-6"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Crafted with <span className="text-red-400">❤️</span> for luxury seekers
            </p>
          </div>
        </div>
      </footer>

      {/* ==================== MOBILE BOTTOM NAVIGATION ==================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-16">
          <Link to="/" className="flex flex-col items-center gap-1 py-2 px-4">
            <HomeIcon 
              className="w-5 h-5 transition-colors" 
              style={{ color: !currentCategory ? THEME.accent : THEME.muted }} 
            />
            <span 
              className="text-[10px] font-medium"
              style={{ color: !currentCategory ? THEME.accent : THEME.muted }}
            >
              Home
            </span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <Grid3X3 className="w-5 h-5" style={{ color: THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Browse</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-1 py-2 px-4 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: THEME.muted }} />
            {count > 0 && (
              <span 
                className="absolute top-0 right-2 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: NOVALUX_THEME.accentGradient, color: THEME.primary }}
              >
                {count}
              </span>
            )}
            <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Cart</span>
          </Link>
          {!isPreview && (
            <Link to="/auth/login" className="flex flex-col items-center gap-1 py-2 px-4">
              <User className="w-5 h-5" style={{ color: THEME.muted }} />
              <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Account</span>
            </Link>
          )}
        </div>
      </nav>

      {/* ==================== FLOATING CONTACT BUTTONS ==================== */}
      {!isPreview && (
        <>
          {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
            <a
              href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `Hello ${storeName}, I'd like to know...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
              title="Message on WhatsApp"
            >
              <MessageCircle className="h-7 w-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
            </a>
          )}
          {config?.floatingCallEnabled && config?.floatingCallNumber && (
            <a
              href={`tel:${config.floatingCallNumber}`}
              className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110`}
              style={{ background: NOVALUX_THEME.accentGradient }}
              title="Call us"
            >
              <Phone className="h-7 w-7" style={{ color: THEME.primary }} />
              <span 
                className="absolute inset-0 rounded-full animate-ping opacity-25"
                style={{ backgroundColor: THEME.accent }}
              />
            </a>
          )}
        </>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .animate-slideIn { animation: slideIn 0.3s ease forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ============================================================================
// NOVALUX PRODUCT CARD COMPONENT
// ============================================================================
interface NovaLuxProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}

function NovaLuxProductCard({ product, storeId, formatPrice, isPreview }: NovaLuxProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500"
      style={{ 
        boxShadow: isHovered ? NOVALUX_THEME.cardShadowHover : NOVALUX_THEME.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: NOVALUX_THEME.backgroundAlt }}
          >
            <span className="text-6xl">✨</span>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)' }}
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div 
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{ 
              background: NOVALUX_THEME.accentGradient, 
              color: THEME.primary 
            }}
          >
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Heart 
            className="w-5 h-5 transition-all duration-300" 
            style={{ 
              color: isLiked ? '#ef4444' : THEME.muted,
              fill: isLiked ? '#ef4444' : 'none'
            }} 
          />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            className="w-full py-3 rounded-xl font-semibold text-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              background: 'rgba(255,255,255,0.95)', 
              color: THEME.primary,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
            isPreview={isPreview}
          >
            Quick Add
          </AddToCartButton>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <span 
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: THEME.accent }}
          >
            {product.category}
          </span>
        )}
        
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 
            className="font-medium mt-2 mb-3 line-clamp-2 transition-colors duration-300 hover:opacity-70"
            style={{ 
              fontFamily: NOVALUX_THEME.fontHeading, 
              color: THEME.text,
              fontSize: '1.125rem',
              lineHeight: '1.4'
            }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className="w-3.5 h-3.5" 
              style={{ 
                color: THEME.accent, 
                fill: i < 4 ? THEME.accent : 'none' 
              }} 
            />
          ))}
          <span className="text-xs ml-1" style={{ color: THEME.muted }}>(24)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span 
            className="text-lg font-semibold"
            style={{ color: THEME.primary }}
          >
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span 
              className="text-sm line-through"
              style={{ color: THEME.muted }}
            >
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

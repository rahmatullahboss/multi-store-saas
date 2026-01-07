/**
 * Artisan Market Store Template
 * 
 * Warm, organic design for handmade & artisanal products.
 * Features: Brown + Amber accents, rustic typography, textured backgrounds.
 */

import { Link } from '@remix-run/react';
import { ShoppingBasket, Search, Menu, X, Heart, Leaf, ChevronRight, Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { LanguageSelector } from '~/components/LanguageSelector';

// ============================================================================
// ARTISAN MARKET THEME CONSTANTS
// ============================================================================
const THEME = {
  primary: '#3d2f2f',
  accent: '#b45309',
  accentHover: '#92400e',
  accentLight: '#fef3c7',
  background: '#fefbf6',
  text: '#3d2f2f',
  muted: '#78716c',
  cardBg: '#ffffff',
  headerBg: '#fefbf6',
  footerBg: '#3d2f2f',
  footerText: '#fefbf6',
  cream: '#fdf8f0',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function ArtisanMarketTemplate({
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
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();

  // Filter valid categories
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.background, fontFamily: "'Work Sans', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ==================== HEADER ==================== */}
      <header 
        className="sticky top-0 z-50"
        style={{ backgroundColor: THEME.headerBg }}
      >
        {/* Announcement Bar with organic shape */}
        {config?.announcement?.text && (
          <div 
            className="text-center py-2.5 text-sm font-medium"
            style={{ backgroundColor: THEME.accentLight, color: THEME.accent }}
          >
            <Leaf className="inline w-4 h-4 mr-2" />
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
              className="lg:hidden p-2 -ml-2 rounded-full hover:bg-amber-50 transition-colors"
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
                  className="text-2xl lg:text-3xl font-semibold"
                  style={{ fontFamily: "'Newsreader', serif", color: THEME.primary }}
                >
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              <Link 
                to="/"
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{ 
                  backgroundColor: !currentCategory ? THEME.accentLight : 'transparent',
                  color: !currentCategory ? THEME.accent : THEME.text,
                }}
              >
                {t('allProducts')}
              </Link>
              {validCategories.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-amber-50"
                  style={{ 
                    backgroundColor: currentCategory === category ? THEME.accentLight : 'transparent',
                    color: currentCategory === category ? THEME.accent : THEME.text,
                  }}
                >
                  {category}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <LanguageSelector variant="toggle" size="sm" showFlag={true} showName={false} />
              <button className="p-2.5 rounded-full transition-colors hover:bg-amber-50">
                <Search className="w-5 h-5" style={{ color: THEME.text }} />
              </button>
              <button className="hidden sm:block p-2.5 rounded-full transition-colors hover:bg-amber-50">
                <Heart className="w-5 h-5" style={{ color: THEME.text }} />
              </button>
              <Link 
                to="/cart" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-colors"
                style={{ backgroundColor: THEME.accent, color: 'white' }}
              >
                <ShoppingBasket className="w-5 h-5" />
                <span className="hidden sm:inline">Basket</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">0</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Border */}
        <div className="h-1 w-full" style={{ 
          background: `linear-gradient(90deg, transparent 0%, ${THEME.accent}40 50%, transparent 100%)` 
        }} />

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t" style={{ borderColor: '#e7e5e4', backgroundColor: THEME.cream }}>
            <nav className="py-4 px-4 space-y-1">
              <Link 
                to="/"
                className="flex items-center justify-between px-4 py-3 rounded-xl font-medium"
                style={{ 
                  backgroundColor: !currentCategory ? THEME.accentLight : 'transparent',
                  color: !currentCategory ? THEME.accent : THEME.text 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('allProducts')}
                <ChevronRight className="w-5 h-5" />
              </Link>
              {validCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl font-medium"
                  style={{ 
                    backgroundColor: currentCategory === category ? THEME.accentLight : 'transparent',
                    color: currentCategory === category ? THEME.accent : THEME.text 
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden" style={{ backgroundColor: THEME.cream }}>
        {/* Decorative Pattern Background */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1.5" fill={THEME.accent} opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: THEME.accentLight, color: THEME.accent }}
              >
                <Leaf className="w-4 h-4" />
                Handcrafted with Love
              </div>
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 leading-tight"
                style={{ fontFamily: "'Newsreader', serif", color: THEME.primary }}
              >
                {config?.bannerText || `Artisan Goods from ${storeName}`}
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: THEME.muted }}>
                Each piece tells a story. Discover unique handmade products crafted by skilled artisans using traditional techniques.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/#products"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: THEME.accent, color: 'white' }}
                >
                  Browse Products
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold border-2 transition-all hover:bg-amber-50"
                  style={{ borderColor: THEME.accent, color: THEME.accent }}
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              {config?.bannerUrl ? (
                <div className="relative">
                  <img 
                    src={config.bannerUrl} 
                    alt="Featured Product" 
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                  {/* Decorative frame */}
                  <div 
                    className="absolute -inset-3 rounded-3xl border-2 -z-10"
                    style={{ borderColor: THEME.accent, opacity: 0.3 }}
                  />
                </div>
              ) : (
                <div 
                  className="aspect-[4/3] rounded-3xl flex items-center justify-center"
                  style={{ backgroundColor: THEME.accentLight }}
                >
                  <div className="text-center">
                    <div className="text-8xl mb-4">🧺</div>
                    <p className="text-lg font-medium" style={{ color: THEME.accent }}>
                      Authentic Handmade Goods
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Curved Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 60H1440V30C1440 30 1200 0 720 0C240 0 0 30 0 30V60Z" 
              fill={THEME.background}
            />
          </svg>
        </div>
      </section>

      {/* ==================== CATEGORY PILLS ==================== */}
      {validCategories.length > 0 && (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all"
                style={{
                  backgroundColor: !currentCategory ? THEME.accent : 'transparent',
                  color: !currentCategory ? 'white' : THEME.primary,
                  borderColor: !currentCategory ? THEME.accent : '#d6d3d1',
                }}
              >
                All Products
              </Link>
              {validCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all hover:border-amber-600"
                  style={{
                    backgroundColor: currentCategory === category ? THEME.accent : 'transparent',
                    color: currentCategory === category ? 'white' : THEME.primary,
                    borderColor: currentCategory === category ? THEME.accent : '#d6d3d1',
                  }}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PRODUCTS GRID ==================== */}
      <section id="products" className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 
              className="text-3xl lg:text-4xl font-semibold mb-3"
              style={{ fontFamily: "'Newsreader', serif", color: THEME.primary }}
            >
              {currentCategory || 'Our Products'}
            </h2>
            <p style={{ color: THEME.muted }}>
              Handpicked artisan goods, made with care
            </p>
            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-16 h-0.5" style={{ backgroundColor: THEME.accent, opacity: 0.3 }} />
              <Leaf className="w-5 h-5" style={{ color: THEME.accent }} />
              <div className="w-16 h-0.5" style={{ backgroundColor: THEME.accent, opacity: 0.3 }} />
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ArtisanProductCard 
                  key={product.id} 
                  product={product} 
                  storeId={storeId}
                  formatPrice={formatPrice}
                  isPreview={isPreview}
                />
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-16 rounded-3xl"
              style={{ backgroundColor: THEME.cream }}
            >
              <div className="text-6xl mb-4">🌿</div>
              <p className="text-lg font-medium" style={{ color: THEME.text }}>
                No products found
              </p>
              <p className="text-sm mt-1" style={{ color: THEME.muted }}>
                Check back soon for new handcrafted items.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== STORY SECTION ==================== */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: THEME.cream }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Leaf className="w-12 h-12 mx-auto mb-6" style={{ color: THEME.accent }} />
          <h2 
            className="text-3xl lg:text-4xl font-semibold mb-6"
            style={{ fontFamily: "'Newsreader', serif", color: THEME.primary }}
          >
            Handcrafted with Passion
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: THEME.muted }}>
            Every product in our collection is made by skilled artisans who pour their heart and soul into their craft. 
            We believe in sustainable practices, fair wages, and preserving traditional techniques that have been 
            passed down through generations.
          </p>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 
                className="text-2xl font-semibold mb-4"
                style={{ fontFamily: "'Newsreader', serif" }}
              >
                {storeName}
              </h3>
              <p className="text-white/70 mb-6 max-w-md leading-relaxed">
                {footerConfig?.description || 'Connecting artisans with appreciators of handcrafted beauty. Every purchase supports traditional craftsmanship.'}
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks?.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: THEME.accent }}>
                Explore
              </h5>
              <ul className="space-y-3 text-white/70">
                <li><Link to="/" className="hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="/artisans" className="hover:text-white transition-colors">Meet the Artisans</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: THEME.accent }}>
                Get in Touch
              </h5>
              <ul className="space-y-3 text-white/70">
                {businessInfo?.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{businessInfo.email}</span>
                  </li>
                )}
                {businessInfo?.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{businessInfo.phone}</span>
                  </li>
                )}
                {businessInfo?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{businessInfo.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white/50">
            <p className="flex items-center justify-center gap-2">
              Made with <span className="text-red-400">❤️</span> by passionate artisans
            </p>
            <p className="mt-2">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// ARTISAN PRODUCT CARD COMPONENT
// ============================================================================
interface ArtisanProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}

function ArtisanProductCard({ product, storeId, formatPrice, isPreview }: ArtisanProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      style={{ border: '1px solid #e7e5e4' }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: THEME.cream }}
          >
            <span className="text-6xl">🫙</span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div 
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: THEME.accent, color: 'white' }}
          >
            {discountPercent}% Off
          </div>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Heart 
            className="w-5 h-5 transition-colors" 
            style={{ 
              color: isLiked ? '#ef4444' : THEME.muted,
              fill: isLiked ? '#ef4444' : 'none'
            }} 
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-6">
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
            className="font-semibold mt-2 mb-3 line-clamp-2 hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Newsreader', serif", color: THEME.text, fontSize: '1.125rem' }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-semibold" style={{ color: THEME.primary }}>
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through" style={{ color: THEME.muted }}>
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <AddToCartButton
          productId={product.id}
          storeId={storeId}
          className="w-full py-3 rounded-full font-medium transition-all hover:scale-[1.02]"
          style={{ backgroundColor: THEME.accent, color: 'white' }}
          isPreview={isPreview}
        >
          Add to Basket
        </AddToCartButton>
      </div>
    </div>
  );
}

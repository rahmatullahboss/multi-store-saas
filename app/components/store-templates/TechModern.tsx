/**
 * Tech Modern Store Template
 * 
 * Clean, bold design for electronics & tech products.
 * Features: Slate + Blue accents, modern typography, gradient backgrounds.
 */

import { Link } from '@remix-run/react';
import { ShoppingCart, Search, Menu, X, Zap, ChevronRight, Star, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useState } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';

// ============================================================================
// TECH MODERN THEME CONSTANTS
// ============================================================================
const THEME = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentLight: '#dbeafe',
  background: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  cardBg: '#ffffff',
  headerBg: '#ffffff',
  footerBg: '#0f172a',
  footerText: '#f8fafc',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function TechModernTemplate({
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
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const formatPrice = useFormatPrice();
  const t = useTranslation();

  // Filter valid categories
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.background, fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ==================== HEADER ==================== */}
      <header 
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{ backgroundColor: THEME.headerBg, borderColor: '#e2e8f0' }}
      >
        {/* Top Bar */}
        {config?.announcement?.text && (
          <div 
            className="text-center py-2 text-sm font-medium"
            style={{ backgroundColor: THEME.accent, color: 'white' }}
          >
            <Zap className="inline w-4 h-4 mr-2" />
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
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 lg:h-10 object-contain" />
              ) : (
                <span 
                  className="text-xl lg:text-2xl font-bold flex items-center gap-2"
                  style={{ color: THEME.primary }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: THEME.accent }}
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                to="/"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: !currentCategory ? THEME.accentLight : 'transparent',
                  color: !currentCategory ? THEME.accent : THEME.text,
                }}
              >
                All Products
              </Link>
              {validCategories.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ 
                    backgroundColor: currentCategory === category ? THEME.accentLight : 'transparent',
                    color: currentCategory === category ? THEME.accent : THEME.text,
                  }}
                >
                  {category}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Cart Button */}
            <Link 
              to="/cart" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: THEME.accent, color: 'white' }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">0</span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Mobile Nav */}
            <nav className="py-2">
              <Link 
                to="/"
                className="flex items-center justify-between px-4 py-3 font-medium"
                style={{ color: !currentCategory ? THEME.accent : THEME.text }}
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
                <ChevronRight className="w-5 h-5" />
              </Link>
              {validCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="flex items-center justify-between px-4 py-3 font-medium"
                  style={{ color: currentCategory === category ? THEME.accent : THEME.text }}
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
      <section className="relative overflow-hidden" style={{ background: THEME.gradient }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: THEME.accent }}
              >
                <Zap className="w-4 h-4" />
                New Arrivals
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {config?.bannerText || `Next-Gen Tech from ${storeName}`}
              </h1>
              <p className="text-lg text-white/70 mb-8 max-w-lg">
                Discover the latest innovations in technology. Premium quality, unbeatable prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/#products"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: THEME.accent, color: 'white' }}
                >
                  {t('buyNow')}
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all"
                >
                  Learn More
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-white/60 text-sm">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-white/60 text-sm">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold flex items-center gap-1">
                    4.9 <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-white/60 text-sm">Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              {config?.bannerUrl ? (
                <img 
                  src={config.bannerUrl} 
                  alt="Featured Product" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center">
                  <div className="text-8xl">🔌</div>
                </div>
              )}
              {/* Floating Elements */}
              <div 
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full"
                style={{ backgroundColor: THEME.accent, opacity: 0.3 }}
              />
              <div 
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full"
                style={{ backgroundColor: THEME.accent, opacity: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 50L48 55C96 60 192 70 288 70C384 70 480 60 576 55C672 50 768 50 864 55C960 60 1056 70 1152 70C1248 70 1344 60 1392 55L1440 50V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" 
              fill={THEME.background}
            />
          </svg>
        </div>
      </section>

      {/* ==================== CATEGORY TABS ==================== */}
      {validCategories.length > 0 && (
        <div className="bg-white border-b border-gray-200 sticky top-16 lg:top-20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 py-2 overflow-x-auto">
              <Link
                to="/"
                className="flex-shrink-0 px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: !currentCategory ? THEME.accent : 'transparent',
                  color: !currentCategory ? 'white' : THEME.muted,
                }}
              >
                All
              </Link>
              {validCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="flex-shrink-0 px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                  style={{
                    backgroundColor: currentCategory === category ? THEME.accent : 'transparent',
                    color: currentCategory === category ? 'white' : THEME.muted,
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
      <section id="products" className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 
                className="text-2xl lg:text-3xl font-bold"
                style={{ color: THEME.primary }}
              >
                {currentCategory || 'All Products'}
              </h2>
              <p className="text-sm mt-1" style={{ color: THEME.muted }}>
                {products.length} products available
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <TechProductCard 
                  key={product.id} 
                  product={product} 
                  storeId={storeId}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium" style={{ color: THEME.text }}>
                No products found
              </p>
              <p className="text-sm mt-1" style={{ color: THEME.muted }}>
                Try a different category or check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: THEME.accent }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">{storeName}</span>
              </div>
              <p className="text-white/60 max-w-md mb-6">
                {footerConfig?.description || 'Your trusted destination for cutting-edge technology and electronics.'}
              </p>
              
              {/* Newsletter */}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-semibold transition-colors"
                  style={{ backgroundColor: THEME.accent, color: 'white' }}
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-3 text-white/60">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <ul className="space-y-3 text-white/60 text-sm">
                {businessInfo?.email && <li>{businessInfo.email}</li>}
                {businessInfo?.phone && <li>{businessInfo.phone}</li>}
              </ul>
              
              <div className="flex gap-3 mt-6">
                {socialLinks?.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                <a className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// TECH PRODUCT CARD COMPONENT
// ============================================================================
interface TechProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
}

function TechProductCard({ product, storeId, formatPrice }: TechProductCardProps) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div 
      className="group bg-white rounded-2xl border-2 border-transparent overflow-hidden transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">📱</span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div 
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#ef4444', color: 'white' }}
          >
            {discountPercent}% OFF
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: THEME.accent }}>
            {product.category}
          </span>
        )}
        
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold mt-1 mb-2 line-clamp-2 hover:text-blue-600 transition-colors" style={{ color: THEME.text }}>
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          ))}
          <span className="text-sm ml-1" style={{ color: THEME.muted }}>(24)</span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold" style={{ color: THEME.primary }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm line-through ml-2" style={{ color: THEME.muted }}>
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            className="p-3 rounded-xl transition-all hover:scale-110"
            style={{ backgroundColor: THEME.accent, color: 'white' }}
          >
            <ShoppingCart className="w-5 h-5" />
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Tech Modern Store Template
 * 
 * Clean, bold design for electronics & tech products.
 * Features: Slate + Blue accents, modern typography, gradient backgrounds.
 */

import { Link } from '@remix-run/react';
import { ShoppingCart, Search, Menu, X, Zap, ChevronRight, Star, Twitter, Linkedin, Youtube, Home as HomeIcon, Grid3X3, User, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';

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
  isPreview,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();

  // Filter valid categories
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: THEME.background, fontFamily: "'Inter', sans-serif" }}>
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

            {/* Language Selector */}
            {/* <LanguageSelector variant="toggle" size="sm" showFlag={true} showName={false} /> */} {/* Temporarily disabled - Bengali is default */}

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


      {/* ==================== DYNAMIC SECTIONS ==================== */}
      {(config?.sections ?? [
         {
           id: 'hero',
           type: 'hero',
           settings: {
             heading: config?.bannerText || `Next-Gen Tech from ${storeName}`,
             subheading: 'Discover the latest innovations. Premium quality, unbeatable prices.',
             primaryAction: { label: t('buyNow'), url: '/#products' },
             image: config?.bannerUrl,
             layout: 'standard',
             alignment: 'left'
           }
         },
         {
           id: 'categories',
           type: 'category-list',
           settings: {
             layout: 'tabs',
             limit: 10
           }
         },
         {
           id: 'products',
           type: 'product-grid',
           settings: {
             heading: currentCategory || 'All Products',
             productCount: 12,
             paddingTop: 'large',
             paddingBottom: 'large'
           }
         }
       ]).map((section: any) => {
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
            ProductCardComponent={section.type === 'product-grid' ? TechProductCard : undefined}
          />
        );
      })}


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
            <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Categories</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: THEME.muted }} />
            <span 
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: THEME.accent }}
            >
              0
            </span>
            <span className="text-[10px] font-medium" style={{ color: THEME.muted }}>Cart</span>
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
  );
}

// ============================================================================
// TECH PRODUCT CARD COMPONENT
// ============================================================================
interface TechProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}

function TechProductCard({ product, storeId, formatPrice, isPreview }: TechProductCardProps) {
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
            isPreview={isPreview}
          >
            <ShoppingCart className="w-5 h-5" />
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

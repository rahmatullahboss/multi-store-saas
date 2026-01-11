/**
 * Modern Premium Template
 * 
 * A premium e-commerce template with modern UI design.
 * Features dark mode support, glassmorphism, and smooth animations.
 */

import { Link } from '@remix-run/react';
import { useState, useRef } from 'react';
import { Menu, X, Search, ShoppingCart, ChevronRight, ChevronLeft, Shirt, Watch, Laptop, ShoppingBag, Sparkles, LayoutGrid } from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { getSectionDefinition } from '~/components/store-sections/registry';

// Define ModernProductCard component (Custom for this theme)
function ModernProductCard({ product, storeId, currency, formatPrice, theme }: any) {
  const primaryColor = theme.primary || '#f59e0b';
  
  const getDiscountPercentage = (price: number, compareAtPrice: number | null) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const discount = getDiscountPercentage(product.price, product.compareAtPrice);

  return (
    <article
      className="group relative overflow-hidden rounded-xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-amber-500/60"
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square sm:aspect-[5/4] overflow-hidden rounded-t-xl sm:rounded-t-3xl">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-500" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-md text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                -{discount}% OFF
              </span>
            </div>
          )}

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
              <span className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 shadow text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-3 sm:py-1 rounded">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-1.5 sm:p-3 space-y-0.5 sm:space-y-2">
          <h3 className="text-sm sm:text-lg font-semibold sm:font-bold leading-tight line-clamp-2">
            {product.title}
          </h3>
          <p className="hidden sm:block text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>
      </Link>

      {/* Footer with Price and Button */}
      <div className="p-1.5 sm:p-3 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold" style={{ color: primaryColor }}>
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <AddToCartButton 
            productId={product.id}
            storeId={storeId}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Add to Cart
          </AddToCartButton>
          
          <AddToCartButton 
            productId={product.id}
            storeId={storeId}
            mode="buy_now"
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Order Now
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}

const DEFAULT_MODERN_SECTIONS = [
  {
    id: 'hero',
    type: 'modern-hero',
    settings: {
      heading: 'Premium Quality Products',
      subheading: 'Discover our amazing collection with the best quality and prices.',
      primaryAction: { label: 'Shop Now', url: '/products' },
      secondaryAction: { label: 'Browse Categories', url: '/about' },
      badge: 'New Collection'
    }
  },
  {
    id: 'category-list',
    type: 'category-list',
    settings: {
      layout: 'pills',
      limit: 6
    }
  },
  {
    id: 'new-arrivals',
    type: 'product-grid',
    settings: {
      heading: 'New Arrivals',
      productCount: 8,
      paddingTop: 'large',
      paddingBottom: 'large'
    }
  },
  {
    id: 'trending',
    type: 'product-scroll',
    settings: {
      heading: 'Trending Now',
      limit: 8
    }
  },
  {
    id: 'newsletter',
    type: 'newsletter',
    settings: {
      heading: 'Stay Updated',
      subheading: 'Subscribe to get special offers, free giveaways, and updates.'
    }
  },
  {
    id: 'features',
    type: 'modern-features',
    settings: {
      heading: 'Why Choose Us?',
      subheading: "We're committed to providing the best shopping experience"
    }
  }
];


export function ModernPremiumTemplate({
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  businessInfo,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const primaryColor = config?.primaryColor || '#f59e0b';
  const accentColor = config?.accentColor || '#f59e0b';
  


  // Category icons mapping
  const getCategoryIcon = (category: string | null, index: number) => {
    const icons = [LayoutGrid, Shirt, Watch, Laptop, ShoppingBag, Sparkles];
    return icons[index % icons.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Background Decorations (light mode only) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 dark:hidden">
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl" />
      </div>

      {/* Announcement Bar */}
      {config?.announcement && (
        <div 
          className="text-white text-center py-2.5 text-sm font-medium relative z-20"
          style={{ backgroundColor: primaryColor }}
        >
          {config.announcement.link ? (
            <Link to={config.announcement.link} className="hover:underline">
              {config.announcement.text}
            </Link>
          ) : (
            config.announcement.text
          )}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 lg:px-10">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-1 justify-center md:flex-none md:justify-start md:mr-6">
            {logo && (
              <img src={logo} alt={storeName} className="h-8 w-8 object-contain" />
            )}
            <span className="text-xl font-bold tracking-tight">{storeName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium transition-colors" style={{ color: primaryColor }}>
              Shop
            </Link>
            <Link to="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {/* Search */}
            {searchOpen ? (
              <div className="absolute left-0 right-0 top-0 z-50 flex h-16 items-center gap-2 bg-white dark:bg-gray-900 px-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              <span 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: primaryColor }}
                id="cart-count"
              >
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Home
              </Link>
              <Link 
                to="/products" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Sections Loop */}
      {(config?.sections ?? DEFAULT_MODERN_SECTIONS).map((section: any) => {
        const SectionComponent = getSectionDefinition(section.type)?.component;
        if (!SectionComponent) return null;

        // Custom ProductCard for grids in this theme
        const productCardComponent = section.type === 'product-grid' || section.type === 'product-scroll' 
          ? ModernProductCard 
          : undefined;

        return (
          <SectionComponent
            key={section.id}
            settings={section.settings}
            theme={{
              primary: primaryColor,
              accent: accentColor,
            }}
            products={products}
            categories={categories}
            currentCategory={currentCategory}
            storeId={storeId}
            currency={currency}
            formatPrice={formatPrice}
            ProductCardComponent={productCardComponent}
          />
        );
      })}

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4 text-center md:text-left">
              <Link to="/" className="text-xl font-bold inline-flex items-center gap-2">
                {logo && <img src={logo} alt={storeName} className="h-8 w-8 object-contain" />}
                {storeName}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quality products with excellent customer service.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                  <span className="text-lg">📸</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                  <span className="text-lg">🐦</span>
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/products?sort=newest" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link to="/products?sort=popular" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link to="/products?sale=true" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Sale</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/returns" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/track-order" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                {businessInfo?.email && (
                  <li className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                    📧 {businessInfo.email}
                  </li>
                )}
                {businessInfo?.phone && (
                  <li className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                    📞 {businessInfo.phone}
                  </li>
                )}
                {businessInfo?.address && (
                  <li className="flex items-start justify-center md:justify-start gap-2 text-sm text-gray-500">
                    📍 {businessInfo.address}
                  </li>
                )}
                {!businessInfo?.email && !businessInfo?.phone && !businessInfo?.address && (
                  <>
                    <li className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">📧 support@store.com</li>
                    <li className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">📞 +880 1XXX-XXXXXX</li>
                  </>
                )}
              </ul>
              {/* Social Links */}
              {(socialLinks?.facebook || socialLinks?.instagram || socialLinks?.whatsapp) && (
                <div className="flex justify-center md:justify-start gap-4 mt-4">
                  {socialLinks?.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {socialLinks?.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  )}
                  {socialLinks?.whatsapp && (
                    <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} {storeName}. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link to="/about" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  About Us
                </Link>
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

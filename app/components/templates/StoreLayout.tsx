/**
 * Store Layout - Full E-commerce Template
 * 
 * Clean, minimal, whitespace-heavy design (Shopify Dawn style)
 * Features:
 * - Header with logo and cart
 * - Hero banner
 * - Product grid
 * - Footer
 */

import { Link, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import type { ThemeConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { getThemeColors } from '~/lib/theme';

// Serialized product type
interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string | null;
}

interface StoreLayoutProps {
  storeName: string;
  storeId: number;
  logo?: string | null;
  theme?: string | null;
  products: SerializedProduct[];
  categories: (string | null)[];
  currentCategory?: string | null;
  config: ThemeConfig | null;
  currency: string;
}

export function StoreLayout({
  storeName,
  storeId,
  logo,
  theme,
  products,
  categories,
  currentCategory,
  config,
  currency,
}: StoreLayoutProps) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get preset theme colors (falls back to config colors if no theme set)
  const themeColors = getThemeColors(theme);
  const primaryColor = config?.primaryColor || themeColors.primary;
  const accentColor = config?.accentColor || themeColors.accent;
  const isDarkTheme = theme === 'dark';

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      {config?.announcement && (
        <div
          className="text-white text-center py-2.5 px-4 text-sm font-medium"
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container-store">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {logo ? (
                <OptimizedImage
                  src={logo}
                  alt={storeName}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {storeName[0]}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                {storeName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition">
                Home
              </Link>
              <Link to="/?all=true" className="text-gray-600 hover:text-gray-900 font-medium transition">
                All Products
              </Link>
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat}
                  to={`/?category=${encodeURIComponent(cat!)}`}
                  className="text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Cart Button */}
            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-900 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/?all=true"
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/?category=${encodeURIComponent(cat!)}`}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      {config?.bannerUrl && (
        <section className="relative h-[300px] md:h-[450px] overflow-hidden">
          <OptimizedImage
            src={config.bannerUrl}
            alt="Store Banner"
            width={1400}
            height={450}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="container-store">
              <div className="max-w-lg text-white">
                {config.bannerText && (
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    {config.bannerText}
                  </h1>
                )}
                <Link
                  to="/?all=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Shop Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills */}
      {categories.length > 0 && (
        <nav className="bg-gray-50 border-b border-gray-100">
          <div className="container-store py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <Link
                to="/"
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  !currentCategory
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                style={!currentCategory ? { backgroundColor: primaryColor } : {}}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/?category=${encodeURIComponent(cat!)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    currentCategory === cat
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                  style={currentCategory === cat ? { backgroundColor: primaryColor } : {}}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products Section */}
      <main className="container-store py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {currentCategory || 'Featured Products'}
          </h2>
          <span className="text-gray-500">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Check back soon for new arrivals!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeId={storeId}
                currency={currency}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        )}
      </main>

      {/* Collections Grid */}
      {config?.collections && config.collections.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container-store">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {config.collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/?category=${encodeURIComponent(collection.name)}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200"
                >
                  {collection.imageUrl && (
                    <OptimizedImage
                      src={collection.imageUrl}
                      alt={collection.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-semibold text-lg">{collection.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container-store py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {logo ? (
                  <OptimizedImage
                    src={logo}
                    alt={storeName}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain rounded"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {storeName[0]}
                  </div>
                )}
                <span className="text-xl font-bold text-white">{storeName}</span>
              </div>
              <p className="text-sm text-gray-400">
                Quality products, delivered to your door.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/?all=true" className="hover:text-white transition">All Products</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/?category=${encodeURIComponent(cat!)}`}
                      className="hover:text-white transition"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <a href="mailto:support@store.com" className="hover:text-white transition">
                    support@store.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <a href="tel:+8801XXXXXXXX" className="hover:text-white transition">
                    +880 1XXX-XXXXXX
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <p className="mt-2">
              Powered by <span className="text-blue-400">Multi-Store SaaS</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================
interface ProductCardProps {
  product: SerializedProduct;
  storeId: number;
  currency: string;
  primaryColor: string;
}

function ProductCard({ product, storeId, currency, primaryColor }: ProductCardProps) {
  const fetcher = useFetcher();
  const isAdding = fetcher.state !== 'idle';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {product.imageUrl ? (
          <OptimizedImage
            src={product.imageUrl}
            alt={product.title}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold" style={{ color: primaryColor }}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            // Quick add to cart (simplified)
            alert('Added to cart! (Cart feature coming soon)');
          }}
          disabled={isAdding}
          className="w-full py-2.5 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}

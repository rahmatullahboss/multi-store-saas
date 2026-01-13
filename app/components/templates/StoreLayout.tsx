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
import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { getThemeColors, getFontConfig } from '~/lib/theme';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
// import { LanguageSelector } from '~/components/LanguageSelector'; // Temporarily disabled - Bengali is default
import { WhatsAppButton } from '~/components/WhatsAppButton';

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
  fontFamily?: string | null;
  products: SerializedProduct[];
  categories: (string | null)[];
  currentCategory?: string | null;
  config: ThemeConfig | null;
  currency: string;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  planType?: string;
}

export function StoreLayout({
  storeName,
  storeId,
  logo,
  theme,
  fontFamily,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  footerConfig,
  businessInfo,
  planType = 'free',
}: StoreLayoutProps) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Format price using context (responds to language/currency toggle)
  const formatPrice = useFormatPrice();
  
  // Get translations based on current locale
  const { t } = useTranslation();

  // Get preset theme colors (falls back to config colors if no theme set)
  const themeColors = getThemeColors(theme);
  const primaryColor = config?.primaryColor || themeColors.primary;
  const accentColor = config?.accentColor || themeColors.accent;
  const isDarkTheme = theme === 'dark';
  
  // Get font configuration
  const fontConfig = getFontConfig(fontFamily);

  return (
    <>
      {/* Google Fonts Link */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontConfig.url} rel="stylesheet" />
      
      <div className="min-h-screen bg-white" style={{ fontFamily: fontConfig.family }}>
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
              <span className="text-lg sm:text-xl font-bold text-gray-900 block">
                {storeName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition">
                {t('home')}
              </Link>
              <Link to="/?all=true" className="text-gray-600 hover:text-gray-900 font-medium transition">
                {t('allProducts')}
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

            {/* Language Toggle & Cart Button */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Selector */}
              {/* <LanguageSelector variant="toggle" size="sm" className="hidden sm:flex" /> */} {/* Temporarily disabled - Bengali is default */}
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
            {currentCategory || t('featuredProducts')}
          </h2>
          <span className="text-gray-500">
            {products.length} {products.length === 1 ? t('product') : t('products')}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noProductsFound')}</h3>
            <p className="text-gray-500 mb-6">{t('checkBackSoon')}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {t('browseAllProducts')}
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
              {t('shopByCategory')}
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
              <p className="text-sm text-gray-400 mb-4">
                {footerConfig?.description || 'Quality products, delivered to your door.'}
              </p>
              
              {/* Social Links */}
              {(socialLinks?.facebook || socialLinks?.instagram || socialLinks?.whatsapp) && (
                <div className="flex items-center gap-3 mt-4">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition"
                      aria-label="Facebook"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition"
                      aria-label="Instagram"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {socialLinks.whatsapp && (
                    <a
                      href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                      aria-label="WhatsApp"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/?all=true" className="hover:text-white transition">All Products</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                {footerConfig?.links?.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} className="hover:text-white transition">{link.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/policies/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/policies/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/policies/refund" className="hover:text-white transition">Refund Policy</Link></li>
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
                {businessInfo?.email && (
                  <li className="flex items-center gap-2">
                    <span>📧</span>
                    <a href={`mailto:${businessInfo.email}`} className="hover:text-white transition">
                      {businessInfo.email}
                    </a>
                  </li>
                )}
                {businessInfo?.phone && (
                  <li className="flex items-center gap-2">
                    <span>📞</span>
                    <a href={`tel:${businessInfo.phone}`} className="hover:text-white transition">
                      {businessInfo.phone}
                    </a>
                  </li>
                )}
                {businessInfo?.address && (
                  <li className="flex items-start gap-2">
                    <span>📍</span>
                    <span className="text-gray-400">{businessInfo.address}</span>
                  </li>
                )}
                {!businessInfo?.email && !businessInfo?.phone && (
                  <li className="text-gray-500">Contact info not set</li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            {(footerConfig?.showPoweredBy !== false) && (
              <p className="mt-2">
                Powered by <span className="text-blue-400">Ozzyl</span>
              </p>
            )}
          </div>

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-4 border-t border-gray-800 flex justify-center items-center">
              <a 
                href="https://ozzy.com?utm_source=store-layout-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-400">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      {socialLinks?.whatsapp && (
        <WhatsAppButton
          phoneNumber={socialLinks.whatsapp}
          storeName={storeName}
        />
      )}
    </div>
    </>
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

  // Format price using context (responds to language/currency toggle)
  const formatPrice = useFormatPrice();
  
  // Get translations
  const { t } = useTranslation();

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
          {isAdding ? t('adding') : t('addToCart')}
        </button>
      </div>
    </article>
  );
}


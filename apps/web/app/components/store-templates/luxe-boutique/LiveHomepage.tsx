import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import {
  Home as HomeIcon,
  Grid3X3,
  User,
  ShoppingCart,
  ShoppingBag,
  Search,
  Heart,
  Menu,
  X,
} from 'lucide-react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { AddToCartButton } from '~/components/AddToCartButton';
import { buildProxyImageUrl, optimizeUnsplashUrl } from '~/utils/imageOptimization';
import { useTranslation } from '~/contexts/LanguageContext';

import { LUXE_BOUTIQUE_THEME } from './theme';
import { LuxeBoutiqueFooter } from './sections/Footer';

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop';

export function LiveLuxeBoutiqueHomepage({
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
  aiCredits,
  isCustomerAiEnabled,
  customer,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useTranslation();

  const count = useCartCount();

  const validCategories = categories?.filter((c): c is string => Boolean(c)) || [];

  const theme = {
    ...LUXE_BOUTIQUE_THEME,
    primary: config?.primaryColor || LUXE_BOUTIQUE_THEME.primary,
    accent: config?.accentColor || LUXE_BOUTIQUE_THEME.accent,
  };

  const heroImage = config?.bannerUrl || DEFAULT_HERO_IMAGE;
  const heroBgUrl = heroImage.includes('unsplash.com')
    ? optimizeUnsplashUrl(heroImage, { width: 1600, height: 900, quality: 80, format: 'webp' })
    : buildProxyImageUrl(heroImage, { width: 1600, height: 900, quality: 78 });
  const heroHeading = config?.bannerText || 'Redefining Elegance';
  const heroSubheading =
    (config as any)?.bannerSubtext ||
    'Discover a world of timeless style and uncompromising quality.';
  const heroCta = (config as any)?.bannerCtaText || 'Shop Collection';
  const heroOverlayOpacity = (config as any)?.heroOverlayOpacity ?? 0.4;

  const featuredProducts = products?.slice(0, 8) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDiscount = (price: number, compareAtPrice: number | null) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round((1 - price / compareAtPrice) * 100);
  };

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: theme.background,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <link
                href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
              />

              {/* Header */}
              <header
                className="sticky top-0 z-50 border-b"
                style={{ backgroundColor: theme.headerBg, borderColor: '#e5e5e5' }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16 lg:h-20">
                    <button
                      className="lg:hidden p-2 -ml-2"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <Link to="/" className="flex items-center">
                      {logo ? (
                        <img src={logo} alt={storeName} className="h-10 lg:h-12 object-contain" />
                      ) : (
                        <span
                          className="text-xl lg:text-2xl font-semibold tracking-wide"
                          style={{ fontFamily: "'Playfair Display', serif", color: theme.primary }}
                        >
                          {storeName}
                        </span>
                      )}
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                      <Link
                        to="/"
                        className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                        style={{ color: theme.text }}
                      >
                        {t('allProducts') || 'All Products'}
                      </Link>
                      {validCategories.slice(0, 5).map((category) => (
                        <Link
                          key={category}
                          to={`/products/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                          className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                          style={{ color: theme.text }}
                        >
                          {category}
                        </Link>
                      ))}
                    </nav>

                    <div className="flex items-center gap-3">
                      <button
                        className="p-2 rounded-full transition-colors hover:bg-gray-100"
                        onClick={() => setSearchOpen(!searchOpen)}
                      >
                        <Search className="w-5 h-5" style={{ color: theme.text }} />
                      </button>
                      <button className="hidden sm:block p-2 rounded-full transition-colors hover:bg-gray-100">
                        <Heart className="w-5 h-5" style={{ color: theme.text }} />
                      </button>
                      <Link
                        to="/cart"
                        className="p-2 rounded-full transition-colors hover:bg-gray-100 relative"
                      >
                        <ShoppingBag className="w-5 h-5" style={{ color: theme.text }} />
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                          style={{ backgroundColor: theme.accent, color: theme.primary }}
                        >
                          {count}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

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

                {mobileMenuOpen && (
                  <div className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-lg">
                    <nav className="py-4">
                      <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
                        style={{ color: theme.text }}
                      >
                        {t('allProducts') || 'All Products'}
                      </Link>
                      {validCategories.map((category) => (
                        <Link
                          key={category}
                          to={`/products/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
                          style={{ color: theme.text }}
                        >
                          {category}
                        </Link>
                      ))}
                    </nav>
                  </div>
                )}

                <div className="h-0.5" style={{ backgroundColor: theme.accent }} />
              </header>

              {/* Hero Section - 80vh */}
              <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${heroBgUrl})`,
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: `rgba(0, 0, 0, ${heroOverlayOpacity})`,
                    }}
                  />
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                  <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
                    {heroHeading}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 font-light tracking-wide opacity-90">
                    {heroSubheading}
                  </p>
                  <Link
                    to="/products"
                    className="px-10 py-4 bg-white text-black uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#c9a961] hover:text-white transition-colors"
                  >
                    {heroCta}
                  </Link>
                </div>
              </section>

              {/* Featured Products */}
              <section className="py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <span
                      className="text-xs uppercase tracking-[0.2em] block mb-4"
                      style={{ color: theme.accent }}
                    >
                      {t('curatedSelection') || 'Curated Selection'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif" style={{ color: theme.text }}>
                      {t('featuredArrivals') || 'Featured Arrivals'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                    {featuredProducts.map((product) => {
                      const discount = getDiscount(product.price, product.compareAtPrice ?? null);
                      return (
                        <div key={product.id} className="group cursor-pointer">
                          <Link to={`/products/${product.id}`} className="block">
                            <div
                              className="aspect-[3/4] overflow-hidden mb-4 relative"
                              style={{ backgroundColor: theme.cardBg }}
                            >
                              {product.imageUrl ? (
                                <img
                                  src={buildProxyImageUrl(product.imageUrl, {
                                    width: 640,
                                    quality: 75,
                                  })}
                                  alt={product.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center"
                                  style={{ color: theme.muted }}
                                >
                                  No Image
                                </div>
                              )}
                              {discount > 0 && (
                                <div
                                  className="absolute top-4 left-4 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5"
                                  style={{ backgroundColor: theme.accent, color: theme.primary }}
                                >
                                  -{discount}%
                                </div>
                              )}
                            </div>
                            <h3
                              className="text-sm mb-1 group-hover:opacity-60 transition-opacity"
                              style={{ color: theme.text, fontFamily: "'Inter', sans-serif" }}
                            >
                              {product.title}
                            </h3>
                            <p className="text-sm" style={{ color: theme.muted }}>
                              {formatPrice(product.price)}
                              {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <span className="ml-2 line-through opacity-60">
                                  {formatPrice(product.compareAtPrice)}
                                </span>
                              )}
                            </p>
                          </Link>
                          <div className="mt-2">
                            <AddToCartButton
                              productId={product.id}
                              storeId={storeId}
                              quantity={1}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center mt-16">
                    <Link
                      to="/products"
                      className="inline-block border-b border-black pb-1 uppercase tracking-[0.15em] text-sm hover:opacity-60 transition-opacity"
                    >
                      {t('viewAllProducts') || 'View All Products'}
                    </Link>
                  </div>
                </div>
              </section>

              {/* Why Choose Us */}
              <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-12">
                    <h2
                      className="text-3xl md:text-4xl font-serif mb-3"
                      style={{ color: theme.text }}
                    >
                      {t('whyChooseUs') || 'Why Choose Us'}
                    </h2>
                    <p className="text-sm md:text-base text-[#6b6b6b]">
                      {t('whyChooseSubtitle') || 'A premium experience from order to delivery.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 border border-[#ece7de] bg-[#faf9f7] text-center">
                      <div className="text-2xl mb-3">✨</div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>
                        {t('premiumQuality') || 'Premium Quality'}
                      </h3>
                      <p className="text-sm text-[#6b6b6b]">
                        {t('premiumQualityDesc') || 'Carefully curated luxury selection.'}
                      </p>
                    </div>
                    <div className="p-8 border border-[#ece7de] bg-[#faf9f7] text-center">
                      <div className="text-2xl mb-3">⚡</div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>
                        {t('fastDelivery') || 'Fast Delivery'}
                      </h3>
                      <p className="text-sm text-[#6b6b6b]">
                        {t('fastDeliveryDesc') || 'Quick and reliable nationwide shipping.'}
                      </p>
                    </div>
                    <div className="p-8 border border-[#ece7de] bg-[#faf9f7] text-center">
                      <div className="text-2xl mb-3">💬</div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>
                        {t('support247') || '24/7 Support'}
                      </h3>
                      <p className="text-sm text-[#6b6b6b]">
                        {t('support247Desc') || 'Dedicated support whenever you need us.'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <LuxeBoutiqueFooter
                storeName={storeName}
                storeId={storeId}
                socialLinks={socialLinks || undefined}
                footerConfig={footerConfig || undefined}
                businessInfo={businessInfo || undefined}
                planType={planType}
                categories={validCategories}
              />

              {/* Mobile Bottom Navigation */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <div className="flex items-center justify-around h-14">
                  <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
                    <HomeIcon
                      className="w-5 h-5"
                      style={{
                        color: !currentCategory ? theme.accent : theme.muted,
                      }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: !currentCategory ? theme.accent : theme.muted,
                      }}
                    >
                      Home
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                  >
                    <Grid3X3 className="w-5 h-5" style={{ color: theme.muted }} />
                    <span className="text-[10px] font-medium" style={{ color: theme.muted }}>
                      Shop
                    </span>
                  </button>
                  <Link
                    to="/cart"
                    className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
                  >
                    <ShoppingCart className="w-5 h-5" style={{ color: theme.muted }} />
                    <span
                      className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: theme.accent,
                        color: theme.primary,
                      }}
                    >
                      {count}
                    </span>
                  </Link>
                  <Link
                    to={customer ? '/account' : '/auth/login'}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                  >
                    <User className="w-5 h-5" style={{ color: theme.muted }} />
                    <span className="text-[10px] font-medium" style={{ color: theme.muted }}>
                      {customer ? 'Account' : 'Login'}
                    </span>
                  </Link>
                </div>
              </nav>

              {!isPreview && (
                <FloatingContactButtons
                  whatsappEnabled={config?.floatingWhatsappEnabled}
                  whatsappNumber={
                    config?.floatingWhatsappNumber ||
                    socialLinks?.whatsapp ||
                    businessInfo?.phone ||
                    undefined
                  }
                  whatsappMessage={config?.floatingWhatsappMessage || undefined}
                  callEnabled={config?.floatingCallEnabled}
                  callNumber={config?.floatingCallNumber || businessInfo?.phone || undefined}
                  storeName={storeName}
                  aiEnabled={isCustomerAiEnabled}
                  aiCredits={aiCredits}
                  storeId={storeId}
                  accentColor={config?.accentColor || config?.primaryColor || theme.accent}
                />
              )}
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

export { LuxeBoutiqueHeader } from './sections/Header';
export { LuxeBoutiqueFooter } from './sections/Footer';

import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Home as HomeIcon, Grid3X3, User, ShoppingCart, ArrowRight } from 'lucide-react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { AddToCartButton } from '~/components/AddToCartButton';
import { buildProxyImageUrl } from '~/utils/imageOptimization';

import { LUXE_BOUTIQUE_THEME } from './theme';
import { LuxeBoutiqueHeader } from './sections/Header';
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

  const count = useCartCount();

  const validCategories = categories?.filter((c): c is string => Boolean(c)) || [];

  const theme = {
    ...LUXE_BOUTIQUE_THEME,
    primary: config?.primaryColor || LUXE_BOUTIQUE_THEME.primary,
    accent: config?.accentColor || LUXE_BOUTIQUE_THEME.accent,
  };

  const heroImage = config?.bannerUrl || DEFAULT_HERO_IMAGE;
  const heroHeading = config?.bannerText || 'Timeless Elegance';
  const heroSubheading =
    config?.heroSubheading || 'Discover our curated collection of luxury pieces';

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
                isPreview={isPreview}
                customer={customer}
              />

              {/* Hero Section - Hardcoded */}
              <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
                <div className="absolute inset-0">
                  <img src={heroImage} alt={heroHeading} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                  <div className="max-w-2xl">
                    <h1
                      className="text-4xl lg:text-5xl font-semibold text-white mb-4"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {heroHeading}
                    </h1>
                    <p className="text-lg text-white/90 mb-8">{heroSubheading}</p>
                    <Link
                      to="/products"
                      className="inline-block px-8 py-3 text-sm font-medium uppercase tracking-wider transition-all hover:opacity-90"
                      style={{ backgroundColor: theme.accent, color: theme.primary }}
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </section>

              {/* Categories Section - Hardcoded */}
              {validCategories.length > 0 && (
                <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
                  <div className="max-w-7xl mx-auto">
                    <h2
                      className="text-2xl font-semibold text-center mb-8"
                      style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}
                    >
                      Shop by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {validCategories.slice(0, 8).map((category) => (
                        <PreviewSafeLink
                          key={category}
                          to={`/products/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                          isPreview={isPreview}
                          className="relative aspect-square rounded-lg overflow-hidden group"
                        >
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: theme.primary }}
                          >
                            <span
                              className="text-white font-medium text-center px-4"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {category}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        </PreviewSafeLink>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Featured Products - Hardcoded */}
              {featuredProducts.length > 0 && (
                <section className="py-12 px-4" style={{ backgroundColor: theme.cardBg }}>
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <h2
                        className="text-2xl font-semibold"
                        style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}
                      >
                        Featured Products
                      </h2>
                      <PreviewSafeLink
                        to="/products"
                        isPreview={isPreview}
                        className="text-sm font-medium flex items-center gap-1"
                        style={{ color: theme.accent }}
                      >
                        View All <ArrowRight className="w-4 h-4" />
                      </PreviewSafeLink>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {featuredProducts.map((product) => {
                        const discount = getDiscount(product.price, product.compareAtPrice ?? null);
                        return (
                          <div key={product.id} className="group">
                            <PreviewSafeLink
                              to={`/products/${product.id}`}
                              isPreview={isPreview}
                              className="block"
                            >
                              <div
                                className="relative aspect-[3/4] overflow-hidden mb-3"
                                style={{ backgroundColor: theme.background }}
                              >
                                {product.imageUrl ? (
                                  <img
                                    src={buildProxyImageUrl(product.imageUrl, {
                                      width: 400,
                                      height: 533,
                                    })}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/50">
                                    No Image
                                  </div>
                                )}
                                {discount > 0 && (
                                  <span
                                    className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white"
                                    style={{ backgroundColor: theme.accent, color: theme.primary }}
                                  >
                                    -{discount}%
                                  </span>
                                )}
                              </div>
                              <h3
                                className="text-sm font-medium mb-1 line-clamp-2"
                                style={{ color: theme.text }}
                              >
                                {product.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold" style={{ color: theme.primary }}>
                                  {formatPrice(product.price)}
                                </span>
                                {product.compareAtPrice &&
                                  product.compareAtPrice > product.price && (
                                    <span
                                      className="text-sm line-through"
                                      style={{ color: theme.muted }}
                                    >
                                      {formatPrice(product.compareAtPrice)}
                                    </span>
                                  )}
                              </div>
                            </PreviewSafeLink>
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
                  </div>
                </section>
              )}

              {/* Why Choose Us - Hardcoded */}
              <section className="py-16 px-4" style={{ backgroundColor: '#faf9f7' }}>
                <div className="max-w-7xl mx-auto">
                  <h2
                    className="text-2xl font-semibold text-center mb-12"
                    style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}
                  >
                    Why Choose Us
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div
                        className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Shield className="w-8 h-8" style={{ color: theme.primary }} />
                      </div>
                      <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                        Premium Quality
                      </h3>
                      <p className="text-sm" style={{ color: theme.muted }}>
                        Carefully curated products that meet our high standards
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Truck className="w-8 h-8" style={{ color: theme.primary }} />
                      </div>
                      <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                        Fast Delivery
                      </h3>
                      <p className="text-sm" style={{ color: theme.muted }}>
                        Quick and reliable shipping to your doorstep
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <RotateCcw className="w-8 h-8" style={{ color: theme.primary }} />
                      </div>
                      <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                        Easy Returns
                      </h3>
                      <p className="text-sm" style={{ color: theme.muted }}>
                        Hassle-free return policy within 7 days
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
                  <PreviewSafeLink
                    to="/"
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                    isPreview={isPreview}
                  >
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
                  </PreviewSafeLink>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                  >
                    <Grid3X3 className="w-5 h-5" style={{ color: theme.muted }} />
                    <span className="text-[10px] font-medium" style={{ color: theme.muted }}>
                      Shop
                    </span>
                  </button>
                  <PreviewSafeLink
                    to="/cart"
                    className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
                    isPreview={isPreview}
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
                  </PreviewSafeLink>
                  <PreviewSafeLink
                    to={customer ? '/account' : '/auth/login'}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                    isPreview={isPreview}
                  >
                    <User className="w-5 h-5" style={{ color: theme.muted }} />
                    <span className="text-[10px] font-medium" style={{ color: theme.muted }}>
                      {customer ? 'Account' : 'Login'}
                    </span>
                  </PreviewSafeLink>
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

// Icons (inline to avoid extra imports)
function Shield({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function Truck({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function RotateCcw({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
      />
    </svg>
  );
}

export { LuxeBoutiqueHeader } from './sections/Header';
export { LuxeBoutiqueFooter } from './sections/Footer';

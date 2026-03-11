/**
 * DC Store Template
 * 
 * Based on the original DC Store design with golden gradient theme.
 * Features warm off-white backgrounds, amber primary colors, and rose accents.
 */

import { Truck, Shield, RotateCcw, ArrowRight, LayoutGrid, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StoreTemplateProps, StoreCategory } from '~/templates/store-registry';
import { DC_STORE_FONTS, resolveDCStoreTheme } from './theme';
import { DCStoreHeader } from './sections/Header';
import { DCStoreFooter } from './sections/Footer';
import { DCProductCard } from './sections/ProductCard';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { LazySection } from '~/components/LazySection';
import {
  buildProxyImageUrl,
  generateProxySrcset,
  generateSrcset,
  optimizeUnsplashUrl,
} from '~/utils/imageOptimization';
import { getHeroBehavior } from '~/lib/hero-slides';

// ============================================================================
// MAIN TEMPLATE COMPONENT
// ============================================================================
export function DCStoreTemplate({
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  socialLinks,
  footerConfig,
  businessInfo,
  planType,
  isPreview = false,
  aiCredits,
  isCustomerAiEnabled,
  customer,
}: StoreTemplateProps) {
  const theme = resolveDCStoreTheme(config);

  // Logic for homepage sections
  const validCategories = (categories || []).filter(Boolean);

  // Filter products based on homepage logic
  const safeProducts = products || [];
  const featuredProducts = safeProducts.slice(0, 8);
  const trendingProducts = safeProducts.slice(8, 12);

  const heroBehavior = getHeroBehavior(config);
  const fallbackHero =
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1200&auto=format&fit=crop';
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImage =
    heroBehavior.slides[heroIndex]?.imageUrl ||
    heroBehavior.slides[0]?.imageUrl ||
    config?.bannerUrl ||
    fallbackHero;
    
  const isCarouselMode = heroBehavior.isCarousel && heroBehavior.slides.length > 1;
  const currentSlide = heroBehavior.slides[heroIndex];

  const rawHeading = isCarouselMode
    ? (currentSlide?.heading || 'Premium Quality Products')
    : (currentSlide?.heading ?? config?.bannerText ?? 'Premium Quality Products');
  const heroHeading = rawHeading || null;

  const heroSubheading = isCarouselMode
    ? (currentSlide?.subheading || 'Exclusive collection of world-class products.')
    : (currentSlide?.subheading ?? config?.heroSubheading ?? 'Exclusive collection of world-class products.');

  const heroButtonText = isCarouselMode
    ? (currentSlide?.ctaText || 'Shop Now')
    : (currentSlide?.ctaText ?? config?.heroButtonText ?? 'Shop Now');

  const heroButtonLink = currentSlide?.ctaLink || '/products';

  useEffect(() => {
    if (!heroBehavior.isCarousel || !heroBehavior.autoplay) return;
    if (heroBehavior.slides.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBehavior.slides.length);
    }, heroBehavior.delayMs);
    return () => clearInterval(timer);
  }, [
    heroBehavior.autoplay,
    heroBehavior.delayMs,
    heroBehavior.isCarousel,
    heroBehavior.slides.length,
  ]);

  const isUnsplashHero = heroImage.includes('unsplash.com');
  const heroSrc = isUnsplashHero
    ? optimizeUnsplashUrl(heroImage, { width: 1600, height: 900, quality: 80, format: 'webp' })
    : buildProxyImageUrl(heroImage, { width: 1600, height: 900, quality: 78 });
  const heroSrcSet = isUnsplashHero
    ? generateSrcset(heroImage, [640, 960, 1280, 1600])
    : generateProxySrcset(heroImage, [640, 960, 1280, 1600], 78);

  return (
    <div
      className="min-h-screen flex flex-col w-full m-0 p-0 relative"
      style={{ backgroundColor: theme.background, fontFamily: DC_STORE_FONTS.body }}
    >
      {/* Background decorations - Matches dc-store exactly */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      {/* Header */}
      <DCStoreHeader
        storeName={storeName ?? ''}
        logo={logo}
        isPreview={isPreview}
        config={config}
        categories={categories || []}
        currentCategory={currentCategory}
        socialLinks={socialLinks ? {
          facebook: socialLinks.facebook ?? undefined,
          instagram: socialLinks.instagram ?? undefined,
          whatsapp: socialLinks.whatsapp ?? undefined,
          twitter: socialLinks.twitter ?? undefined,
          youtube: socialLinks.youtube ?? undefined,
          linkedin: socialLinks.linkedin ?? undefined,
        } : undefined}
        variant={!currentCategory ? 'overlay' : 'default'}
        customer={customer}
        themeColors={theme}
      />

      <main className="relative z-10">
        {/* Hero Section */}
        {!currentCategory && (
          <section className="relative w-full max-w-7xl mx-auto px-4 lg:px-10 pt-4 lg:pt-8">
            <div className="relative overflow-hidden rounded-2xl min-h-[450px] sm:min-h-[550px] lg:min-h-[650px] flex items-center shadow-xl">
              <img
                src={heroSrc}
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover object-center"
                srcSet={heroSrcSet}
                sizes="100vw"
                loading="eager"
              />
              
              {/* Premium Gradient Overlay */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{ background: theme.heroOverlay }}
              />

              {/* Content Overlay */}
              <div className="relative z-10 w-full lg:w-2/3 px-6 lg:pl-16 flex flex-col items-start gap-4 sm:gap-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs sm:text-sm font-bold tracking-wide uppercase backdrop-blur-sm">
                  <span className="size-2 rounded-full bg-primary animate-pulse" style={{ backgroundColor: theme.primary }} />
                  New Collection
                </div>

                <h1 className="text-white text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tighter">
                  Premium Quality
                  <br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: theme.brandGradient }}>Products</span>
                </h1>

                <p className="text-gray-200 text-base sm:text-lg lg:text-xl max-w-md leading-relaxed opacity-90">
                  {heroSubheading}
                </p>

                <div className="flex flex-wrap gap-3 sm:gap-4 mt-2">
                  <PreviewSafeLink
                    to={heroButtonLink}
                    isPreview={isPreview}
                    className="h-11 sm:h-12 px-6 sm:px-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                    style={{ backgroundColor: theme.primary, color: '#fff' }}
                  >
                    {heroButtonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </PreviewSafeLink>
                  <PreviewSafeLink
                    to="/categories"
                    isPreview={isPreview}
                    className="h-11 sm:h-12 px-6 sm:px-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 transition-all"
                  >
                    Browse Categories
                  </PreviewSafeLink>
                </div>
              </div>

              {/* Floating Glassmorphism Product Card */}
              <div className="absolute bottom-6 right-6 hidden lg:flex gap-4">
                <div className="w-64 p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-2xl">
                  <div
                    className="size-16 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                    style={{
                      backgroundImage: `url("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop")`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">Featured Item</p>
                    <p className="text-xs font-bold" style={{ color: theme.primary }}>Best Seller</p>
                  </div>
                  <PreviewSafeLink
                    to="/products"
                    isPreview={isPreview}
                    className="size-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-primary transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </PreviewSafeLink>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Horizontal Category Chips */}
        {validCategories.length > 0 && !currentCategory && (
          <section className="max-w-7xl mx-auto px-4 lg:px-10 py-6 overflow-hidden">
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-medium text-sm transition-all bg-black text-white"
              >
                <LayoutGrid className="h-4 w-4" />
                All
              </PreviewSafeLink>
              {validCategories.map((cat, idx) => {
                const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : cat;
                if (!title) return null;
                return (
                  <PreviewSafeLink
                    key={idx}
                    to={`/products/${encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                    isPreview={isPreview}
                    className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-medium text-sm transition-all bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                    style={{ '--hover-color': theme.primary } as any}
                  >
                    {title}
                  </PreviewSafeLink>
                );
              })}
              <PreviewSafeLink
                to="/products?sort=newest"
                isPreview={isPreview}
                className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-medium text-sm transition-all bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
              >
                <Sparkles className="h-4 w-4" />
                Newest
              </PreviewSafeLink>
            </div>
          </section>
        )}

        {/* Featured Products Grid */}
        <section className="max-w-7xl mx-auto px-4 lg:px-10 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: theme.primary }} />
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {currentCategory ? currentCategory : 'New Arrivals'}
              </h2>
            </div>
            <PreviewSafeLink
              to="/products"
              isPreview={isPreview}
              className="text-gray-500 hover:text-black flex items-center gap-1 text-sm font-medium transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
            </PreviewSafeLink>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <DCProductCard
                key={product.id}
                product={product}
                storeId={parseInt(storeId ?? '0', 10)}
                isPreview={isPreview}
                theme={theme}
              />
            ))}
          </div>

          {!currentCategory && (
            <div className="text-center mt-12">
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: theme.primary }}
              >
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </PreviewSafeLink>
            </div>
          )}
        </section>

        {/* Trending Section (If not a specific category) */}
        {!currentCategory && trendingProducts.length > 0 && (
          <section className="py-16 px-4 lg:px-10" style={{ backgroundColor: '#fdfbf7' }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 rounded-sm bg-rose-500" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Trending Now</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {trendingProducts.map((product) => (
                  <DCProductCard
                    key={product.id}
                    product={product}
                    storeId={parseInt(storeId ?? '0', 10)}
                    isPreview={isPreview}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust Badges */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-white shadow-sm border border-gray-100">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: theme.primary + '15' }}>
                  <Truck className="w-8 h-8" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Fast Delivery</h3>
                  <p className="text-gray-500 text-sm">Reliable shipping across Bangladesh</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-white shadow-sm border border-gray-100">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: theme.primary + '15' }}>
                  <Shield className="w-8 h-8" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Secure Payment</h3>
                  <p className="text-gray-500 text-sm">100% safe and secure transactions</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-white shadow-sm border border-gray-100">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: theme.primary + '15' }}>
                  <RotateCcw className="w-8 h-8" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Easy Return</h3>
                  <p className="text-gray-500 text-sm">Simple 7-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <DCStoreFooter
        storeName={storeName ?? ''}
        logo={logo}
        socialLinks={socialLinks ? {
          facebook: socialLinks.facebook ?? undefined,
          instagram: socialLinks.instagram ?? undefined,
          whatsapp: socialLinks.whatsapp ?? undefined,
          twitter: socialLinks.twitter ?? undefined,
          youtube: socialLinks.youtube ?? undefined,
          linkedin: socialLinks.linkedin ?? undefined,
        } : undefined}
        footerConfig={footerConfig}
        businessInfo={businessInfo ? {
          phone: businessInfo.phone ?? undefined,
          email: businessInfo.email ?? undefined,
          address: businessInfo.address ?? undefined,
        } : undefined}
        categories={categories}
        planType={planType}
        isPreview={isPreview}
        themeColors={theme}
        config={config}
      />

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
          storeId={parseInt(storeId ?? '0', 10)}
          accentColor={theme.primary}
        />
      )}
    </div>
  );
}

// Export Header and Footer for registry
export { DCStoreHeader } from './sections/Header';
export { DCStoreFooter } from './sections/Footer';

// Default export
export default DCStoreTemplate;

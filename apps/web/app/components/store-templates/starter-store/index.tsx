/**
 * Starter Store Template
 *
 * A complete, immersive e-commerce template.
 * Unifies Preview and Live modes using shared components and routing.
 */

import { Truck, Shield, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { STARTER_STORE_THEME, STARTER_STORE_FONTS } from './theme';
import { StarterStoreHeader } from './sections/Header';
import { StarterStoreFooter } from './sections/Footer';
import { StarterProductCard } from './sections/ProductCard';
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

const theme = STARTER_STORE_THEME;

// ============================================================================
// MAIN TEMPLATE COMPONENT
// ============================================================================
export function StarterStoreTemplate({
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
  // Logic for homepage sections
  const validCategories = categories.filter(Boolean) as string[];

  // Filter products based on homepage logic
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  const heroBehavior = getHeroBehavior(config);
  const fallbackHero =
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop';
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImage =
    heroBehavior.slides[heroIndex]?.imageUrl ||
    heroBehavior.slides[0]?.imageUrl ||
    config?.bannerUrl ||
    fallbackHero;
  // Heading from slide or config - if empty string, no text overlay
  const rawHeading = heroBehavior.slides[heroIndex]?.heading ?? config?.bannerText ?? '';
  const heroHeading = rawHeading || null; // null if empty string
  const heroSubheading =
    heroBehavior.slides[heroIndex]?.subheading ?? config?.heroSubheading ?? null;
  const heroButtonText = heroBehavior.slides[heroIndex]?.ctaText ?? config?.heroButtonText ?? null;
  const heroButtonLink = heroBehavior.slides[heroIndex]?.ctaLink ?? '/products';

  // Show text content only if there's a heading
  const showHeroText = Boolean(heroHeading);

  // Overlay opacity: 0 = no overlay (full image), 0.4 = default dark overlay
  // Users can set heroOverlayOpacity in config (0 to 1)
  const heroOverlayOpacity = showHeroText
    ? (config?.heroOverlayOpacity ?? 0.4) // Default to 40% if showing text for readability
    : (config?.heroOverlayOpacity ?? 0); // Default to 0% (no overlay) if no text

  useEffect(() => {
    if (!heroBehavior.isCarousel || !heroBehavior.autoplay) return;
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

  useEffect(() => {
    if (heroIndex >= heroBehavior.slides.length) {
      setHeroIndex(0);
    }
  }, [heroBehavior.slides.length, heroIndex]);

  const isUnsplashHero = heroImage.includes('unsplash.com');
  const heroSrc = isUnsplashHero
    ? optimizeUnsplashUrl(heroImage, { width: 1600, height: 900, quality: 80, format: 'webp' })
    : buildProxyImageUrl(heroImage, { width: 1600, height: 900, quality: 78 });
  const heroSrcSet = isUnsplashHero
    ? generateSrcset(heroImage, [640, 960, 1280, 1600])
    : generateProxySrcset(heroImage, [640, 960, 1280, 1600], 78);

  return (
    <div
      className="min-h-screen flex flex-col w-full m-0 p-0"
      style={{ backgroundColor: theme.background, fontFamily: STARTER_STORE_FONTS.body }}
    >
      {/* Header */}
      <StarterStoreHeader
        storeName={storeName}
        logo={logo}
        isPreview={isPreview}
        categories={categories}
        currentCategory={currentCategory}
        socialLinks={socialLinks}
        variant={!currentCategory ? 'overlay' : 'default'}
        customer={customer}
      />

      <main>
        {/* Hero Banner */}
        <section className="relative h-[50vh] md:h-[70vh]">
          <img
            src={heroSrc}
            alt="Hero"
            className="w-full h-full object-cover"
            srcSet={heroSrcSet}
            sizes="100vw"
            loading="eager"
            {...({ fetchpriority: 'high' } as Record<string, unknown>)}
            decoding="async"
          />
          {/* Overlay - opacity is configurable, defaults to 0 (no overlay) if no text */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor:
                heroOverlayOpacity > 0 ? `rgba(0, 0, 0, ${heroOverlayOpacity})` : 'transparent',
            }}
          >
            {showHeroText && (
              <div className="text-center text-white px-4">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{heroHeading}</h1>
                {heroSubheading && <p className="text-lg mb-6 opacity-90">{heroSubheading}</p>}
                {heroButtonText && (
                  <PreviewSafeLink
                    to={heroButtonLink}
                    isPreview={isPreview}
                    className="inline-block px-8 py-3 rounded-lg font-medium transition hover:opacity-90"
                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                  >
                    {heroButtonText}
                  </PreviewSafeLink>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        {validCategories.length > 0 && !currentCategory && (
          <LazySection minHeight="420px">
            <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: theme.text }}>
                  ক্যাটাগরি
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {validCategories.slice(0, 4).map((cat) => (
                    <PreviewSafeLink
                      key={cat}
                      to={`/?category=${encodeURIComponent(cat)}`}
                      isPreview={isPreview}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ backgroundColor: theme.cardBg }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex items-end justify-center p-4">
                        <span className="text-white font-semibold text-lg">{cat}</span>
                      </div>
                    </PreviewSafeLink>
                  ))}
                </div>
              </div>
            </section>
          </LazySection>
        )}

        {/* Featured Products */}
        {!currentCategory && featuredProducts.length > 0 && (
          <LazySection minHeight="520px">
            <section className="py-12 px-4" style={{ backgroundColor: theme.cardBg }}>
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                    ফিচার্ড পণ্য
                  </h2>
                  <PreviewSafeLink
                    to="/products"
                    isPreview={isPreview}
                    className="text-sm font-medium hover:underline"
                    style={{ color: theme.primary }}
                  >
                    সব দেখুন →
                  </PreviewSafeLink>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {featuredProducts.map((product) => (
                    <StarterProductCard
                      key={product.id}
                      product={product}
                      storeId={storeId}
                      isPreview={isPreview}
                    />
                  ))}
                </div>
              </div>
            </section>
          </LazySection>
        )}

        {/* Sale Banner - Removed as per user request */}

        {/* New Arrivals */}
        {!currentCategory && newArrivals.length > 0 && (
          <LazySection minHeight="520px">
            <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                    নতুন এসেছে
                  </h2>
                  <PreviewSafeLink
                    to="/products"
                    isPreview={isPreview}
                    className="text-sm font-medium hover:underline"
                    style={{ color: theme.primary }}
                  >
                    সব দেখুন →
                  </PreviewSafeLink>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {newArrivals.map((product) => (
                    <StarterProductCard
                      key={product.id}
                      product={product}
                      storeId={storeId}
                      isPreview={isPreview}
                    />
                  ))}
                </div>
              </div>
            </section>
          </LazySection>
        )}

        {/* Filtered Products (if category selected) */}
        {currentCategory && products.length > 0 && (
          <LazySection minHeight="520px">
            <section className="py-12 px-4" style={{ backgroundColor: theme.cardBg }}>
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text }}>
                  {currentCategory} ({products.length} পণ্য)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <StarterProductCard
                      key={product.id}
                      product={product}
                      storeId={storeId}
                      isPreview={isPreview}
                    />
                  ))}
                </div>
              </div>
            </section>
          </LazySection>
        )}

        {/* Trust Badges */}
        <LazySection minHeight="320px">
          <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  className="flex items-center gap-4 p-6 rounded-xl"
                  style={{ backgroundColor: theme.cardBg }}
                >
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: theme.primary + '15' }}
                  >
                    <Truck className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: theme.text }}>
                      {config?.trustBadge1Title || 'দ্রুত ডেলিভারি'}
                    </h3>
                    <p className="text-sm" style={{ color: theme.muted }}>
                      {config?.trustBadge1Desc || 'ঢাকায় ১-২ দিনে'}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-4 p-6 rounded-xl"
                  style={{ backgroundColor: theme.cardBg }}
                >
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: theme.primary + '15' }}
                  >
                    <Shield className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: theme.text }}>
                      {config?.trustBadge2Title || 'নিরাপদ পেমেন্ট'}
                    </h3>
                    <p className="text-sm" style={{ color: theme.muted }}>
                      {config?.trustBadge2Desc || '১০০% সিকিউর'}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-4 p-6 rounded-xl"
                  style={{ backgroundColor: theme.cardBg }}
                >
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: theme.primary + '15' }}
                  >
                    <RotateCcw className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: theme.text }}>
                      {config?.trustBadge3Title || 'ইজি রিটার্ন'}
                    </h3>
                    <p className="text-sm" style={{ color: theme.muted }}>
                      {config?.trustBadge3Desc || '৭ দিনের মধ্যে'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </LazySection>
      </main>

      {/* Footer */}
      <StarterStoreFooter
        storeName={storeName}
        logo={logo}
        socialLinks={socialLinks}
        footerConfig={footerConfig}
        businessInfo={businessInfo}
        categories={categories}
        planType={planType}
        isPreview={isPreview}
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
          storeId={storeId}
          accentColor={config?.primaryColor || undefined}
        />
      )}
    </div>
  );
}

// Export Header and Footer for registry (used by StorePageWrapper for other pages)
export { StarterStoreHeader } from './sections/Header';
export { StarterStoreFooter } from './sections/Footer';

// Default export
export default StarterStoreTemplate;

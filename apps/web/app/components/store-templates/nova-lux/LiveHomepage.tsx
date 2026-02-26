import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Star, Heart } from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps } from '~/templates/store-registry';
import type { SectionInstance } from '~/lib/theme-engine-types';
import { AddToCartButton } from '~/components/AddToCartButton';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { buildProxyImageUrl, generateProxySrcset } from '~/utils/imageOptimization';
import { getHeroBehavior } from '~/lib/hero-slides';

import { NOVALUX_THEME } from './theme';
import { NovaLuxHeader } from './sections/Header';
import { NovaLuxFooter } from './sections/Footer';

const NOVA_LUX_DEFAULT_SECTIONS = DEFAULT_SECTIONS.filter(
  (section) =>
    !['banner', 'rich-text', 'newsletter', 'features', 'modern-features'].includes(section.type)
);

const DEDUPE_SECTION_GROUPS: Record<string, string> = {
  hero: 'hero',
  'modern-hero': 'hero',
  'zenith-hero': 'hero',
  'turbo-hero': 'hero',
  video: 'hero',
  banner: 'hero',
  features: 'features',
  'modern-features': 'features',
};

function getSectionGroup(type: string) {
  return DEDUPE_SECTION_GROUPS[type] || type;
}

function dedupeSectionsByType(sections: SectionInstance[]) {
  const seen = new Set<string>();
  const deduped: SectionInstance[] = [];

  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const section = sections[index];
    const group = getSectionGroup(section.type);
    if (DEDUPE_SECTION_GROUPS[section.type]) {
      if (seen.has(group)) {
        continue;
      }
      seen.add(group);
    }
    deduped.push(section);
  }

  return deduped.reverse();
}

// ============================================================================
// NOVALUX PRODUCT CARD COMPONENT (Live)
// ============================================================================
interface NovaLuxProductCardProps {
  product: NonNullable<StoreTemplateProps['products']>[0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}

export function NovaLuxProductCard({
  product,
  storeId,
  formatPrice,
  isPreview,
}: NovaLuxProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const {
    price,
    compareAtPrice: displayCompareAt,
    isFlashSale,
    isOnSale,
    discountPercentage,
  } = useProductPrice(product);

  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    text: NOVALUX_THEME.text,
    muted: NOVALUX_THEME.muted,
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        boxShadow: isHovered ? NOVALUX_THEME.cardShadowHover : NOVALUX_THEME.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 75 })}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 75)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: NOVALUX_THEME.backgroundAlt }}
          >
            <span className="text-6xl">✨</span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)' }}
        />

        {isOnSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: isFlashSale ? '#EF4444' : NOVALUX_THEME.accentGradient,
              color: isFlashSale ? 'white' : THEME.primary,
            }}
          >
            {isFlashSale && <span className="mr-1">⚡</span>}
            {discountPercentage}% OFF
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Heart
            className="w-5 h-5 transition-all duration-300"
            style={{
              color: isLiked ? '#ef4444' : THEME.muted,
              fill: isLiked ? '#ef4444' : 'none',
            }}
          />
        </button>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            productPrice={price}
            productName={product.title}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.95)',
              color: THEME.primary,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            isPreview={isPreview}
          >
            Add to Cart
          </AddToCartButton>
        </div>
      </Link>

      <div className="p-5">
        {product.category && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: THEME.accent }}
          >
            {product.category}
          </span>
        )}

        <Link to={`/product/${product.id}`}>
          <h3
            className="font-medium mt-2 mb-3 line-clamp-2 transition-colors duration-300 hover:opacity-70"
            style={{
              fontFamily: NOVALUX_THEME.fontHeading,
              color: THEME.text,
              fontSize: '1.125rem',
              lineHeight: '1.4',
            }}
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              style={{
                color: THEME.accent,
                fill: i < 4 ? THEME.accent : 'none',
              }}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: THEME.muted }}>
            (24)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold" style={{ color: THEME.primary }}>
              {formatPrice(price)}
            </span>
            {isOnSale && displayCompareAt && (
              <span className="block text-xs line-through mt-0.5" style={{ color: THEME.muted }}>
                {formatPrice(displayCompareAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LIVE HOMEPAGE
// ============================================================================
export function LiveNovaLuxHomepage({
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
  aiCredits,
  isCustomerAiEnabled,
  customer,
}: StoreTemplateProps) {
  useEffect(() => {
    // Scroll listener removed as isScrolled was unused
  }, []);

  const validCategories = (categories || []).filter(Boolean);
  const announcement = config?.announcement;
  const heroBehavior = getHeroBehavior(config);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!heroBehavior.isCarousel || !heroBehavior.autoplay || heroBehavior.slides.length < 2) return;
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

  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    accentHover: NOVALUX_THEME.accentHover,
    accentLight: NOVALUX_THEME.accentLight,
    background: NOVALUX_THEME.background,
    text: NOVALUX_THEME.text,
    muted: NOVALUX_THEME.muted,
    cardBg: NOVALUX_THEME.cardBg,
    headerBg: NOVALUX_THEME.headerBgSolid,
    footerBg: NOVALUX_THEME.footerBg,
    footerText: NOVALUX_THEME.footerText,
  };

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: THEME.background,
                fontFamily: NOVALUX_THEME.fontBody,
              }}
            >
              <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
                rel="stylesheet"
              />

              <NovaLuxHeader
                storeName={storeName ?? ''}
                logo={logo}
                categories={categories || []}
                currentCategory={currentCategory}
                config={config}
                customer={customer}
              />

              {!(
                config?.sections?.[0]?.type &&
                ['hero', 'modern-hero', 'zenith-hero', 'turbo-hero', 'video', 'banner'].includes(
                  config.sections[0].type
                )
              ) && (
                <div
                  className={`${announcement?.text ? 'h-[104px] lg:h-[120px]' : 'h-[66px] lg:h-[82px]'}`}
                />
              )}

              {/* BUG FIX: Previously sections were rendered TWICE. Now rendered only once. */}
              {(config?.sections?.length
                ? dedupeSectionsByType(config.sections)
                : NOVA_LUX_DEFAULT_SECTIONS
              ).map((section: SectionInstance, index: number) => {
                const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                if (!SectionComponent) return null;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resolvedSettings: any =
                  section.type === 'category-list' || section.type === 'shop-by-category'
                    ? {
                        ...section.settings,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        categoryImageMap: ((config as any)?.categoryImageMap || {}) as Record<
                          string,
                          string
                        >,
                      }
                    : { ...section.settings };

                if (
                  ['hero', 'modern-hero', 'zenith-hero', 'turbo-hero'].includes(section.type) &&
                  !resolvedSettings.image
                ) {
                  const activeHeroSlide =
                    heroBehavior.slides[heroIndex] || heroBehavior.slides[0] || null;
                  // Try heroBanner slides first, then bannerUrl, then default
                  const heroBannerImage = activeHeroSlide?.imageUrl || null;
                  resolvedSettings.image =
                    heroBannerImage ||
                    config?.bannerUrl ||
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop';

                  // Also pass heroBanner slides & heading/subheading from unified settings
                  if (!resolvedSettings.heading && activeHeroSlide?.heading) {
                    resolvedSettings.heading = activeHeroSlide.heading;
                  }
                  if (!resolvedSettings.subheading && activeHeroSlide?.subheading) {
                    resolvedSettings.subheading = activeHeroSlide.subheading;
                  }
                  if (!resolvedSettings.ctaText && activeHeroSlide?.ctaText) {
                    resolvedSettings.ctaText = activeHeroSlide.ctaText;
                  }
                  if (!resolvedSettings.ctaLink && activeHeroSlide?.ctaLink) {
                    resolvedSettings.ctaLink = activeHeroSlide.ctaLink;
                  }
                }

                const isFirstSection = index === 0;
                const isHeroSection = [
                  'hero',
                  'modern-hero',
                  'zenith-hero',
                  'turbo-hero',
                  'video',
                  'banner',
                ].includes(section.type);

                return (
                  <div
                    key={section.id}
                    className={isFirstSection && isHeroSection ? 'mt-4 md:mt-6' : ''}
                  >
                    <SectionComponent
                      settings={resolvedSettings}
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
                        currency: currency,
                      }}
                      ProductCardComponent={NovaLuxProductCard}
                    />
                  </div>
                );
              })}

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
                  accentColor={config?.primaryColor || NOVALUX_THEME.accent}
                />
              )}

              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>

              <NovaLuxFooter
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
                categories={validCategories}
                showNewsletter={false}
              />
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

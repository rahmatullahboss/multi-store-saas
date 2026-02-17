import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Home as HomeIcon, Grid3X3, User, ShoppingCart } from 'lucide-react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { getHeroBehavior } from '~/lib/hero-slides';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';

import { LUXE_BOUTIQUE_THEME } from './theme';
import { LuxeBoutiqueHeader } from './sections/Header';
import { LuxeBoutiqueFooter } from './sections/Footer';

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
  const heroBehavior = getHeroBehavior(config);
  const [heroIndex, setHeroIndex] = useState(0);

  const count = useCartCount();

  const validCategories = categories.filter((c): c is string => Boolean(c));

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

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: LUXE_BOUTIQUE_THEME.background,
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

              {((config?.sections?.length ? config.sections : DEFAULT_SECTIONS) || [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .reduce((acc: any[], section: any) => {
                  if (section.type === 'header' || section.type === 'footer') {
                    return acc;
                  }

                  const sectionId = String(section.id || '').toLowerCase();
                  const heading = String(section?.settings?.heading || '').toLowerCase();
                  const isStorySection =
                    section.type === 'rich-text' &&
                    (sectionId.includes('story') ||
                      sectionId.includes('power-story') ||
                      heading.includes('our story') ||
                      heading.includes('power story'));

                  if (isStorySection) {
                    return acc;
                  }

                  const hasHero = acc.some(
                    (item) => item.type === 'hero' || item.type === 'modern-hero'
                  );
                  const isHero = section.type === 'hero' || section.type === 'modern-hero';
                  if (isHero && hasHero) {
                    return acc;
                  }

                  const hasWhyChoose = acc.some(
                    (item) => item.type === 'features' || item.type === 'modern-features'
                  );
                  const isWhyChooseType =
                    section.type === 'features' || section.type === 'modern-features';
                  if (isWhyChooseType && hasWhyChoose) {
                    return acc;
                  }

                  const isWhyChooseSection = isWhyChooseType && heading.includes('why choose');

                  if (isWhyChooseSection) {
                    acc.push({
                      ...section,
                      settings: {
                        ...section.settings,
                        backgroundColor: '#faf9f7',
                        lightTheme: true,
                      },
                    });
                    return acc;
                  }

                  acc.push(section);
                  return acc;
                }, [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .sort((a: Record<string, any>, b: Record<string, any>) => {
                  const aHeading = String(a?.settings?.heading || '').toLowerCase();
                  const bHeading = String(b?.settings?.heading || '').toLowerCase();
                  const aIsWhyChoose =
                    (a?.type === 'features' || a?.type === 'modern-features') &&
                    (aHeading.includes('why choose') || aHeading.includes('why shop'));
                  const bIsWhyChoose =
                    (b?.type === 'features' || b?.type === 'modern-features') &&
                    (bHeading.includes('why choose') || bHeading.includes('why shop'));

                  if (aIsWhyChoose && !bIsWhyChoose) return 1;
                  if (!aIsWhyChoose && bIsWhyChoose) return -1;
                  return 0;
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((section: any) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  if (!SectionComponent) return null;
                  const isHeroSection = section.type === 'hero' || section.type === 'modern-hero';
                  const heroSlide = heroBehavior.slides[heroIndex];
                  const shouldApplyHeroSlide = isHeroSection && Boolean(heroSlide?.imageUrl);
                  const sectionSettings = shouldApplyHeroSlide
                    ? {
                        ...section.settings,
                        image: heroSlide.imageUrl,
                        heading:
                          heroSlide.heading || section.settings?.heading || config?.bannerText,
                        subheading: heroSlide.subheading || section.settings?.subheading,
                        primaryAction: heroSlide.ctaText
                          ? {
                              ...(section.settings?.primaryAction || {}),
                              label: heroSlide.ctaText,
                              url:
                                heroSlide.ctaLink ||
                                section.settings?.primaryAction?.url ||
                                '/products',
                            }
                          : section.settings?.primaryAction,
                      }
                    : section.settings;

                  return (
                    <SectionComponent
                      key={section.id}
                      settings={sectionSettings}
                      theme={LUXE_BOUTIQUE_THEME}
                      products={products}
                      categories={categories}
                      storeId={storeId}
                      currency={currency}
                      isPreview={isPreview}
                      store={{
                        name: storeName,
                        email: businessInfo?.email,
                        phone: businessInfo?.phone,
                        address: businessInfo?.address,
                        currency: currency,
                      }}
                    />
                  );
                })}

              {validCategories.length > 0 && (
                <div
                  className="lg:hidden overflow-x-auto py-4 px-4 border-b"
                  style={{ borderColor: '#e5e5e5' }}
                >
                  <div className="flex gap-2">
                    <PreviewSafeLink
                      to="/"
                      className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all"
                      style={{
                        backgroundColor: !currentCategory
                          ? LUXE_BOUTIQUE_THEME.primary
                          : 'transparent',
                        color: !currentCategory ? 'white' : LUXE_BOUTIQUE_THEME.text,
                        borderColor: !currentCategory ? LUXE_BOUTIQUE_THEME.primary : '#d1d5db',
                      }}
                      isPreview={isPreview}
                    >
                      All
                    </PreviewSafeLink>
                    {validCategories.map((category) => (
                      <PreviewSafeLink
                        key={category}
                        to={`/products/${encodeURIComponent(category.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                        className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all"
                        style={{
                          backgroundColor:
                            currentCategory === category
                              ? LUXE_BOUTIQUE_THEME.primary
                              : 'transparent',
                          color: currentCategory === category ? 'white' : LUXE_BOUTIQUE_THEME.text,
                          borderColor:
                            currentCategory === category ? LUXE_BOUTIQUE_THEME.primary : '#d1d5db',
                        }}
                        isPreview={isPreview}
                      >
                        {category}
                      </PreviewSafeLink>
                    ))}
                  </div>
                </div>
              )}

              <LuxeBoutiqueFooter
                storeName={storeName}
                socialLinks={socialLinks || undefined}
                footerConfig={footerConfig || undefined}
                businessInfo={businessInfo || undefined}
                planType={planType}
                categories={validCategories}
              />

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
                        color: !currentCategory
                          ? LUXE_BOUTIQUE_THEME.accent
                          : LUXE_BOUTIQUE_THEME.muted,
                      }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: !currentCategory
                          ? LUXE_BOUTIQUE_THEME.accent
                          : LUXE_BOUTIQUE_THEME.muted,
                      }}
                    >
                      Home
                    </span>
                  </PreviewSafeLink>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                  >
                    <Grid3X3 className="w-5 h-5" style={{ color: LUXE_BOUTIQUE_THEME.muted }} />
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: LUXE_BOUTIQUE_THEME.muted }}
                    >
                      Shop
                    </span>
                  </button>
                  <PreviewSafeLink
                    to="/cart"
                    className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
                    isPreview={isPreview}
                  >
                    <ShoppingCart
                      className="w-5 h-5"
                      style={{ color: LUXE_BOUTIQUE_THEME.muted }}
                    />
                    <span
                      className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: LUXE_BOUTIQUE_THEME.accent,
                        color: LUXE_BOUTIQUE_THEME.primary,
                      }}
                    >
                      {count}
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: LUXE_BOUTIQUE_THEME.muted }}
                    >
                      Bag
                    </span>
                  </PreviewSafeLink>
                  {!isPreview && (
                    <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
                      <User className="w-5 h-5" style={{ color: LUXE_BOUTIQUE_THEME.muted }} />
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: LUXE_BOUTIQUE_THEME.muted }}
                      >
                        Account
                      </span>
                    </Link>
                  )}
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
                  accentColor={config?.primaryColor || LUXE_BOUTIQUE_THEME.accent}
                />
              )}
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

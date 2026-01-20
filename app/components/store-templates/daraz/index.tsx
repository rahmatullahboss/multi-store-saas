/**
 * Daraz Template
 * 
 * A Daraz Bangladesh-inspired e-commerce template with:
 * - Orange theme header (#F85606)
 * - Hero carousel with promotional banners
 * - Flash sale horizontal scroll section
 * - Category grid navigation
 * - Product grid layout (Just For You)
 * - Multi-column footer with payment badges
 */

import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { DARAZ_THEME } from './theme';
import { DarazHeader } from './sections/Header';
import { DarazFooter } from './sections/Footer';
import { DarazHeroCarousel } from './sections/HeroCarousel';
import { DarazFlashSale } from './sections/FlashSale';
import { DarazCategoryGrid } from './sections/CategoryGrid';
import { DarazProductGrid } from './sections/ProductCard';

interface SectionConfig {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

export function DarazTemplate({
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

  // Get products for different sections
  const allProducts = currentCategory 
    ? products.filter(p => p.category === currentCategory) 
    : products;
  
  // Split products for flash sale and main grid
  const flashSaleProducts = products.slice(0, 10);
  const gridProducts = currentCategory ? allProducts : products.slice(10);

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div 
              className="min-h-screen pb-16 md:pb-0"
              style={{ 
                backgroundColor: DARAZ_THEME.background, 
                fontFamily: "'Roboto', 'NotoSans', Arial, sans-serif" 
              }}
            >
              {/* Header */}
              <DarazHeader
                storeName={storeName}
                logo={logo}
                categories={categories}
                currentCategory={currentCategory}
                isPreview={isPreview}
                config={config}
              />

              {/* Main Content */}
              <main className="max-w-7xl mx-auto px-4 py-4 min-h-[60vh]">
                
                {/* Hero Carousel - Only on homepage without category filter */}
                {!currentCategory && (
                  <DarazHeroCarousel
                    storeName={storeName}
                    showAppWidget={!isPreview}
                    banners={config?.bannerUrl ? [
                      {
                        id: 'main',
                        image: config.bannerUrl,
                        title: config.bannerText || 'Amazing Deals Await!',
                        subtitle: 'Shop the best products at unbeatable prices',
                        link: '/?category=all',
                        buttonText: 'Shop Now'
                      }
                    ] : undefined}
                  />
                )}

                {/* Flash Sale Section - Only on homepage */}
                {!currentCategory && flashSaleProducts.length > 0 && (
                  <DarazFlashSale 
                    products={flashSaleProducts}
                    currency={currency}
                    title="Flash Sale"
                    showTimer={false}
                  />
                )}

                {/* Category Grid - Only on homepage */}
                {!currentCategory && (
                  <DarazCategoryGrid 
                    categories={categories}
                    maxCategories={16}
                  />
                )}

                {/* Product Grid */}
                <DarazProductGrid
                  products={currentCategory ? allProducts : gridProducts}
                  currency={currency}
                  title={currentCategory || 'Just For You'}
                  columns={6}
                />

                {/* Additional Sections from Config */}
                {((config?.sections ?? []) as SectionConfig[]).map((section) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  if (!SectionComponent) return null;
                  
                  // Skip sections we're handling natively
                  if (['hero', 'product-scroll', 'category-list', 'product-grid'].includes(section.type)) {
                    return null;
                  }
                  
                  return (
                    <SectionComponent
                      key={section.id}
                      settings={section.settings}
                      theme={DARAZ_THEME}
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
                    />
                  );
                })}

                {/* Features Section - Static */}
                {!currentCategory && (
                  <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 
                      className="text-lg font-bold mb-6 text-center"
                      style={{ color: DARAZ_THEME.text }}
                    >
                      Why Shop With Us
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { icon: '🚚', title: 'Fast Delivery', desc: 'Nationwide shipping' },
                        { icon: '🔒', title: 'Secure Payment', desc: 'Multiple options' },
                        { icon: '🔄', title: 'Easy Returns', desc: '7-day return policy' },
                        { icon: '💬', title: '24/7 Support', desc: 'Always here to help' }
                      ].map((feature, i) => (
                        <div key={i} className="text-center">
                          <span className="text-3xl mb-2 block">{feature.icon}</span>
                          <h3 className="font-semibold text-sm" style={{ color: DARAZ_THEME.text }}>
                            {feature.title}
                          </h3>
                          <p className="text-xs" style={{ color: DARAZ_THEME.textSecondary }}>
                            {feature.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </main>

              {/* Footer */}
              <DarazFooter
                storeName={storeName}
                logo={logo}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                categories={categories}
              />

              {/* Floating Contact Buttons */}
              {!isPreview && (
                <>
                  {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
                    <a
                      href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `হ্যালো ${storeName}, আমি জানতে চাই...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer"
                      title="WhatsApp এ মেসেজ করুন"
                    >
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.89-1.535A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.137 0-4.146-.535-5.904-1.475l-.417-.253-4.329 1.136 1.157-4.229-.269-.428A9.968 9.968 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
                      </svg>
                    </a>
                  )}
                  {config?.floatingCallEnabled && config?.floatingCallNumber && (
                    <a
                      href={`tel:${config.floatingCallNumber}`}
                      className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer`}
                      title="কল করুন"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  )}
                </>
              )}

              {/* Scrollbar Hide CSS */}
              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

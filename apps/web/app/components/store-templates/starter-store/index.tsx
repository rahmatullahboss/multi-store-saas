/**
 * Starter Store Template
 *
 * A complete, immersive e-commerce template.
 * Unifies Preview and Live modes using shared components and routing.
 */

import { Truck, Shield, RotateCcw } from 'lucide-react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { STARTER_STORE_THEME, STARTER_STORE_FONTS } from './theme';
import { StarterStoreHeader } from './sections/Header';
import { StarterStoreFooter } from './sections/Footer';
import { StarterProductCard } from './sections/ProductCard';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';

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
}: StoreTemplateProps) {
  // Logic for homepage sections
  const validCategories = categories.filter(Boolean) as string[];

  // Filter products based on homepage logic
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div
      className="min-h-screen flex flex-col w-full m-0 p-0"
      style={{ backgroundColor: theme.background, fontFamily: STARTER_STORE_FONTS.body }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <StarterStoreHeader
        storeName={storeName}
        logo={logo}
        isPreview={isPreview}
        categories={categories}
        currentCategory={currentCategory}
        socialLinks={socialLinks}
      />

      <main>
        {/* Hero Banner */}
        <section className="relative h-[50vh] md:h-[70vh]">
          <img
            src={
              config?.bannerUrl ||
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop'
            }
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {config?.bannerText || `${storeName} এ স্বাগতম`}
              </h1>
              <p className="text-lg mb-6 opacity-90">সেরা মানের পণ্য, সেরা দামে</p>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="inline-block px-8 py-3 rounded-lg font-medium transition hover:opacity-90"
                style={{ backgroundColor: theme.accent, color: '#fff' }}
              >
                শপিং করুন
              </PreviewSafeLink>
            </div>
          </div>
        </section>

        {/* Categories */}
        {validCategories.length > 0 && !currentCategory && (
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
        )}

        {/* Featured Products */}
        {!currentCategory && featuredProducts.length > 0 && (
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
        )}

        {/* Sale Banner */}
        {!currentCategory && (
          <section className="py-16 px-4" style={{ backgroundColor: theme.accent }}>
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">🎉 বিশেষ ছাড় চলছে!</h2>
              <p className="text-lg mb-6 opacity-90">সীমিত সময়ের জন্য ৫০% পর্যন্ত ছাড়</p>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="inline-block px-8 py-3 rounded-lg font-medium bg-white transition hover:opacity-90"
                style={{ color: theme.accent }}
              >
                সেল দেখুন
              </PreviewSafeLink>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {!currentCategory && newArrivals.length > 0 && (
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
        )}

        {/* Filtered Products (if category selected) */}
        {currentCategory && products.length > 0 && (
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
        )}

        {/* Trust Badges */}
        <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="flex items-center gap-4 p-6 rounded-xl"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: theme.primary + '15' }}>
                  <Truck className="w-6 h-6" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: theme.text }}>
                    দ্রুত ডেলিভারি
                  </h3>
                  <p className="text-sm" style={{ color: theme.muted }}>
                    ঢাকায় ১-২ দিনে
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-4 p-6 rounded-xl"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: theme.primary + '15' }}>
                  <Shield className="w-6 h-6" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: theme.text }}>
                    নিরাপদ পেমেন্ট
                  </h3>
                  <p className="text-sm" style={{ color: theme.muted }}>
                    ১০০% সিকিউর
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-4 p-6 rounded-xl"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: theme.primary + '15' }}>
                  <RotateCcw className="w-6 h-6" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: theme.text }}>
                    ইজি রিটার্ন
                  </h3>
                  <p className="text-sm" style={{ color: theme.muted }}>
                    ৭ দিনের মধ্যে
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
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
    </div>
  );
}

// Export Header and Footer for registry (used by StorePageWrapper for other pages)
export { StarterStoreHeader } from './sections/Header';
export { StarterStoreFooter } from './sections/Footer';

// Default export
export default StarterStoreTemplate;

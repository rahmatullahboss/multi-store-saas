/**
 * Starter Store Template - Modern Conversion-Optimized Design
 *
 * A complete, immersive e-commerce template with:
 * - Hero section with gradient background
 * - Trust/Announcement bar
 * - Featured categories with horizontal scroll
 * - Featured products grid
 * - Promotional banners
 * - Best sellers / New arrivals tabs
 * - Newsletter signup
 */

import {
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  ChevronRight,
  Tag,
  Zap,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StoreTemplateProps, StoreCategory } from '~/templates/store-registry';
import { STARTER_STORE_FONTS, resolveStarterStoreTheme } from './theme';
import { StarterStoreHeader } from './sections/Header';
import { StarterStoreFooter } from './sections/Footer';
import { StarterProductCard } from './sections/ProductCard';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { LazySection } from '~/components/LazySection';
import { buildProxyImageUrl } from '~/utils/imageOptimization';

// Default category icons/emojis
const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '📱',
  Fashion: '👗',
  Home: '🏠',
  Beauty: '💄',
  'Health & Beauty': '💄',
  Food: '🍔',
  Sports: '⚽',
  Books: '📚',
  Toys: '🧸',
  Other: '📦',
};

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({
  isPreview,
  storeName,
}: {
  isPreview: boolean;
  storeName: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Shop the Best Collection
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg mx-auto md:mx-0">
              Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </PreviewSafeLink>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-colors"
              >
                View Collections
              </PreviewSafeLink>
            </div>
          </div>
          {/* Right Content - Abstract/Product Showcase */}
          <div className="flex-1 relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Abstract shapes */}
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-amber-400/20 rounded-full blur-2xl" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl md:text-9xl mb-4">🛍️</div>
                  <p className="text-white/60 text-sm font-medium">{storeName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

// ============================================================================
// TRUST BAR SECTION
// ============================================================================
function TrustBarSection() {
  const trustItems = [
    { icon: Truck, title: 'Free Delivery', subtitle: 'Orders over ৳1000' },
    { icon: RotateCcw, title: 'Easy Returns', subtitle: '7-day return policy' },
    { icon: Shield, title: 'Secure Payment', subtitle: '100% protected' },
    { icon: Headphones, title: '24/7 Support', subtitle: 'Always here to help' },
  ];

  return (
    <section className="bg-indigo-50 py-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 md:gap-0 md:justify-between min-w-max md:min-w-0">
          {trustItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 px-4 md:px-0">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <item.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURED CATEGORIES SECTION
// ============================================================================
function FeaturedCategoriesSection({
  categories,
  isPreview,
}: {
  categories: (string | StoreCategory | null)[];
  isPreview: boolean;
}) {
  const validCategories = categories.filter(Boolean);
  if (validCategories.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
          <PreviewSafeLink
            to="/products"
            isPreview={isPreview}
            className="hidden md:flex items-center gap-1 text-indigo-600 font-medium hover:underline"
          >
            View All <ChevronRight className="w-4 h-4" />
          </PreviewSafeLink>
        </div>
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
          {validCategories.slice(0, 8).map((cat, idx) => {
            const isObject = typeof cat === 'object' && cat !== null;
            const category = isObject ? (cat as StoreCategory) : null;
            const title = category?.title || (cat as string);
            const imageUrl = category?.imageUrl || null;
            const icon = CATEGORY_ICONS[title] || '📦';
            const id = category?.slug || title || idx;

            if (!title) return null;

            return (
              <PreviewSafeLink
                key={id}
                to={`/products/${encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                isPreview={isPreview}
                className="flex-shrink-0 w-40 md:w-auto snap-start"
              >
                <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-indigo-50 hover:shadow-md transition-all duration-300 group cursor-pointer h-full">
                  {imageUrl ? (
                    <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden">
                      <img
                        src={buildProxyImageUrl(imageUrl, { width: 128, height: 128 })}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="text-4xl mb-3">{icon}</div>
                  )}
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {title}
                  </h3>
                </div>
              </PreviewSafeLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRODUCT GRID SECTION
// ============================================================================
function ProductGridSection({
  title,
  products,
  storeId,
  isPreview,
  theme,
  showViewAll = true,
  bgColor = 'bg-gray-50',
}: {
  title: string;
  products: StoreTemplateProps['products'];
  storeId?: number;
  isPreview: boolean;
  theme: ReturnType<typeof resolveStarterStoreTheme>;
  showViewAll?: boolean;
  bgColor?: string;
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className={`py-12 md:py-16 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          {showViewAll && (
            <PreviewSafeLink
              to="/products"
              isPreview={isPreview}
              className="flex items-center gap-1 text-indigo-600 font-medium hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </PreviewSafeLink>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <StarterProductCard
              key={product.id}
              product={product}
              storeId={storeId}
              isPreview={isPreview}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROMOTIONAL BANNER SECTION
// ============================================================================
function PromotionalBannerSection({ isPreview }: { isPreview: boolean }) {
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Left Banner - Discount */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 md:p-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-4">
                <Tag className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Limited Offer</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Get 20% OFF
              </h3>
              <p className="text-white/80 mb-4">On your first order</p>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </PreviewSafeLink>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />
          </div>
          {/* Right Banner - Free Delivery */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 md:p-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-4">
                <Zap className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Free Shipping</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Free Delivery
              </h3>
              <p className="text-white/80 mb-4">On orders over ৳1000</p>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="inline-flex items-center gap-2 bg-white text-amber-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </PreviewSafeLink>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TABBED PRODUCTS SECTION (Best Sellers / New Arrivals)
// ============================================================================
function TabbedProductsSection({
  bestSellers,
  newArrivals,
  storeId,
  isPreview,
  theme,
}: {
  bestSellers: StoreTemplateProps['products'];
  newArrivals: StoreTemplateProps['products'];
  storeId?: number;
  isPreview: boolean;
  theme: ReturnType<typeof resolveStarterStoreTheme>;
}) {
  const [activeTab, setActiveTab] = useState<'bestSellers' | 'newArrivals'>('bestSellers');
  
  const hasBestSellers = bestSellers && bestSellers.length > 0;
  const hasNewArrivals = newArrivals && newArrivals.length > 0;
  
  if (!hasBestSellers && !hasNewArrivals) return null;

  const activeProducts = activeTab === 'bestSellers' ? bestSellers : newArrivals;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tab Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {hasBestSellers && (
              <button
                onClick={() => setActiveTab('bestSellers')}
                className={`text-xl md:text-2xl font-bold transition-colors ${
                  activeTab === 'bestSellers' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Best Sellers
              </button>
            )}
            {hasBestSellers && hasNewArrivals && (
              <span className="text-gray-300">|</span>
            )}
            {hasNewArrivals && (
              <button
                onClick={() => setActiveTab('newArrivals')}
                className={`text-xl md:text-2xl font-bold transition-colors ${
                  activeTab === 'newArrivals' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                New Arrivals
              </button>
            )}
          </div>
          <PreviewSafeLink
            to="/products"
            isPreview={isPreview}
            className="flex items-center gap-1 text-indigo-600 font-medium hover:underline"
          >
            View All <ChevronRight className="w-4 h-4" />
          </PreviewSafeLink>
        </div>
        {/* Product Grid */}
        {activeProducts && activeProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {activeProducts.map((product) => (
              <StarterProductCard
                key={product.id}
                product={product}
                storeId={storeId}
                isPreview={isPreview}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// NEWSLETTER SECTION
// ============================================================================
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-indigo-600 to-indigo-700">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stay Updated</h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Subscribe to our newsletter for exclusive deals, new arrivals, and special offers.
        </p>
        {submitted ? (
          <div className="bg-white/10 rounded-xl p-6">
            <p className="text-white font-medium">🎉 Thank you for subscribing!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
        <p className="text-white/50 text-xs mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN TEMPLATE COMPONENT
// ============================================================================
export function StarterStoreTemplate({
  storeName = 'Store',
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
  const theme = resolveStarterStoreTheme(config);
  const validCategories = categories?.filter(Boolean) || [];
  const allProducts = products || [];

  // Normalize social links to match expected type (convert null to undefined)
  const normalizedSocialLinks = socialLinks
    ? {
        facebook: socialLinks.facebook ?? undefined,
        instagram: socialLinks.instagram ?? undefined,
        whatsapp: socialLinks.whatsapp ?? undefined,
        twitter: socialLinks.twitter ?? undefined,
        youtube: socialLinks.youtube ?? undefined,
        linkedin: socialLinks.linkedin ?? undefined,
      }
    : undefined;

  // Normalize business info to match expected type (convert null to undefined)
  const normalizedBusinessInfo = businessInfo
    ? {
        phone: businessInfo.phone ?? undefined,
        email: businessInfo.email ?? undefined,
        address: businessInfo.address ?? undefined,
      }
    : undefined;

  // Convert storeId to number for FloatingContactButtons (if it's a string)
  const numericStoreId = storeId ? parseInt(storeId, 10) : undefined;

  // Split products for different sections
  const featuredProducts = allProducts.slice(0, 4);
  const bestSellers = allProducts.slice(0, 4);
  const newArrivals = allProducts.slice(4, 8);

  // Category page view
  if (currentCategory) {
    return (
      <div
        className="min-h-screen flex flex-col w-full"
        style={{ backgroundColor: '#ffffff', fontFamily: STARTER_STORE_FONTS.body }}
      >
        <StarterStoreHeader
          storeName={storeName}
          logo={logo}
          isPreview={isPreview}
          config={config}
          categories={categories}
          currentCategory={currentCategory}
          socialLinks={normalizedSocialLinks}
          variant="default"
          customer={customer}
          themeColors={theme}
        />
        <main className="flex-1">
          <section className="py-12 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                {currentCategory} ({allProducts.length} products)
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {allProducts.map((product) => (
                  <StarterProductCard
                    key={product.id}
                    product={product}
                    storeId={numericStoreId}
                    isPreview={isPreview}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </section>
        </main>
        <StarterStoreFooter
          storeName={storeName}
          logo={logo}
          socialLinks={normalizedSocialLinks}
          footerConfig={footerConfig}
          businessInfo={normalizedBusinessInfo}
          categories={categories}
          planType={planType}
          isPreview={isPreview}
          themeColors={theme}
          config={config}
        />
      </div>
    );
  }

  // Homepage view
  return (
    <div
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: '#ffffff', fontFamily: STARTER_STORE_FONTS.body }}
    >
      {/* Header */}
      <StarterStoreHeader
        storeName={storeName}
        logo={logo}
        isPreview={isPreview}
        config={config}
        categories={categories}
        currentCategory={currentCategory}
        socialLinks={normalizedSocialLinks}
        variant="overlay"
        customer={customer}
        themeColors={theme}
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection isPreview={isPreview} storeName={storeName || 'Store'} />

        {/* 2. Trust Bar */}
        <TrustBarSection />

        {/* 3. Featured Categories */}
        {validCategories.length > 0 && (
          <LazySection minHeight="280px">
            <FeaturedCategoriesSection categories={validCategories} isPreview={isPreview} />
          </LazySection>
        )}

        {/* 4. Featured Products */}
        {featuredProducts.length > 0 && (
          <LazySection minHeight="480px">
            <ProductGridSection
              title="Featured Products"
              products={featuredProducts}
              storeId={numericStoreId}
              isPreview={isPreview}
              theme={theme}
              bgColor="bg-gray-50"
            />
          </LazySection>
        )}

        {/* 5. Promotional Banners */}
        <LazySection minHeight="220px">
          <PromotionalBannerSection isPreview={isPreview} />
        </LazySection>

        {/* 6. Best Sellers / New Arrivals Tabs */}
        {(bestSellers.length > 0 || newArrivals.length > 0) && (
          <LazySection minHeight="480px">
            <TabbedProductsSection
              bestSellers={bestSellers}
              newArrivals={newArrivals}
              storeId={numericStoreId}
              isPreview={isPreview}
              theme={theme}
            />
          </LazySection>
        )}

        {/* 7. Newsletter Section */}
        <LazySection minHeight="300px">
          <NewsletterSection />
        </LazySection>
      </main>

      {/* Footer */}
      <StarterStoreFooter
        storeName={storeName}
        logo={logo}
        socialLinks={normalizedSocialLinks}
        footerConfig={footerConfig}
        businessInfo={normalizedBusinessInfo}
        categories={categories}
        planType={planType}
        isPreview={isPreview}
        themeColors={theme}
        config={config}
      />

      {/* Floating Contact Buttons */}
      {!isPreview && (
        <FloatingContactButtons
          whatsappEnabled={config?.floatingWhatsappEnabled}
          whatsappNumber={
            config?.floatingWhatsappNumber ||
            normalizedSocialLinks?.whatsapp ||
            normalizedBusinessInfo?.phone ||
            undefined
          }
          whatsappMessage={config?.floatingWhatsappMessage || undefined}
          callEnabled={config?.floatingCallEnabled}
          callNumber={config?.floatingCallNumber || normalizedBusinessInfo?.phone || undefined}
          storeName={storeName}
          aiEnabled={isCustomerAiEnabled}
          aiCredits={aiCredits}
          storeId={numericStoreId}
          accentColor={theme.primary}
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

/**
 * Tech Modern Store Template
 *
 * Clean, bold design for electronics & tech products.
 * Features: Slate + Blue accents, modern typography, gradient backgrounds.
 */

import { Link } from '@remix-run/react';
import { ShoppingCart, Search, Menu, X, Zap, ChevronRight, ArrowRight, User, Heart,
  Instagram, Facebook, Twitter, Smartphone, Laptop, Watch, Headphones, Speaker,
  Linkedin, Youtube, Star, Grid3X3, Home as HomeIcon, Phone, MessageCircle
} from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import { useState } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';

import { TECH_MODERN_THEME } from './theme';
import { TechModernHeader } from './sections/Header';
import { TechModernFooter } from './sections/Footer';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function TechModernTemplate({
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
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();
  const count = useCartCount();

  // Filter valid categories
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: TECH_MODERN_THEME.background, fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <TechModernHeader 
        storeName={storeName} 
        logo={logo} 
        categories={validCategories} 
        currentCategory={currentCategory}
        config={config}
        count={count}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />


      {/* ==================== DYNAMIC SECTIONS ==================== */}
      {(config?.sections ?? [
         {
           id: 'hero',
           type: 'hero',
           settings: {
             heading: config?.bannerText || `Next-Gen Tech from ${storeName}`,
             subheading: 'Discover the latest innovations. Premium quality, unbeatable prices.',
             primaryAction: { label: t('buyNow'), url: '/#products' },
             image: config?.bannerUrl,
             layout: 'standard',
             alignment: 'left'
           }
         },
         {
           id: 'categories',
           type: 'category-list',
           settings: {
             layout: 'tabs',
             limit: 10
           }
         },
         {
           id: 'products',
           type: 'product-grid',
           settings: {
             heading: currentCategory || 'All Products',
             productCount: 12,
             paddingTop: 'large',
             paddingBottom: 'large'
           }
         }
       ]).map((section: any) => {
        const SectionComponent = SECTION_REGISTRY[section.type]?.component;
        if (!SectionComponent) return null;

        return (
          <SectionComponent
            key={section.id}
            settings={section.settings}
            theme={TECH_MODERN_THEME}
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
            ProductCardComponent={section.type === 'product-grid' ? TechProductCard : undefined}
          />
        );
      })}


      <TechModernFooter 
        storeName={storeName} 
        footerConfig={footerConfig} 
        businessInfo={businessInfo} 
        socialLinks={socialLinks} 
        planType={planType}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <ArrowRight className="w-5 h-5" style={{ color: !currentCategory ? TECH_MODERN_THEME.accent : TECH_MODERN_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: !currentCategory ? TECH_MODERN_THEME.accent : TECH_MODERN_THEME.muted }}>Home</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <ArrowRight className="w-5 h-5" style={{ color: TECH_MODERN_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: TECH_MODERN_THEME.muted }}>Categories</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: TECH_MODERN_THEME.muted }} />
            <span
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: TECH_MODERN_THEME.accent }}
            >
              {count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: TECH_MODERN_THEME.muted }}>Cart</span>
          </Link>
          {!isPreview && (
            <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
              <User className="w-5 h-5" style={{ color: TECH_MODERN_THEME.muted }} />
              <span className="text-[10px] font-medium" style={{ color: TECH_MODERN_THEME.muted }}>Account</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Floating Contact Buttons */}
      {!isPreview && (
        <>
          {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
            <a
              href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `Hello ${storeName}, I'd like to know...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
              title="Message on WhatsApp"
            >
              <ArrowRight className="h-7 w-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
            </a>
          )}
          {config?.floatingCallEnabled && config?.floatingCallNumber && (
            <a
              href={`tel:${config.floatingCallNumber}`}
              className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
              title="Call us"
            >
              <ArrowRight className="h-7 w-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
            </a>
          )}
        </>
      )}
    </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// TECH PRODUCT CARD COMPONENT
// ============================================================================
function TechProductCard({ product, storeId, formatPrice, isPreview }: { product: any, storeId: number, formatPrice: (price: number) => string, isPreview?: boolean }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const { price, compareAtPrice: displayCompareAt, isFlashSale, isOnSale, discountPercentage } = useProductPrice(product);

  return (
    <div
      className="group bg-white rounded-2xl border-2 border-transparent overflow-hidden transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">📱</span>
          </div>
        )}

        {/* Discount Badge */}
        {isOnSale && (
          <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${isFlashSale ? 'bg-red-500 text-white' : 'bg-cyan-500 text-black'}`}>
            {isFlashSale ? 'Flash Sale' : `-${discountPercentage}%`}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isLiked ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-black/50 text-white hover:bg-cyan-500 hover:text-black'
          }`}
        >
          <Heart size={16} className={isLiked ? "fill-current" : ""} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: TECH_MODERN_THEME.accent }}>
            {product.category}
          </span>
        )}
        
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold mt-1 mb-2 line-clamp-2 hover:text-blue-600 transition-colors" style={{ color: TECH_MODERN_THEME.text }}>
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          ))}
          <span className="text-sm ml-1" style={{ color: TECH_MODERN_THEME.muted }}>(24)</span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold" style={{ color: TECH_MODERN_THEME.primary }}>
              {formatPrice(price)}
            </span>
            {isOnSale && displayCompareAt && (
              <span className="text-sm line-through ml-2" style={{ color: TECH_MODERN_THEME.muted }}>
                {formatPrice(displayCompareAt)}
              </span>
            )}
          </div>
          
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            productPrice={price}
            productName={product.title}
            className="p-3 rounded-xl transition-all hover:scale-110"
            style={{ backgroundColor: TECH_MODERN_THEME.accent, color: 'white' }}
            isPreview={isPreview}
          >
            <ShoppingCart className="w-5 h-5" />
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

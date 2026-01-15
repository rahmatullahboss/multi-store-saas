/**
 * AuroraMinimal Premium Store Template (2025 Edition)
 * 
 * Ultra-premium minimalist ecommerce template featuring:
 * - Warm Rose + Cool Sage split-tone gradients
 * - Glassmorphism header with scroll effects
 * - Elegant product cards with hover animations
 * - Mobile-first responsive design
 * - Full AI compatibility (per TEMPLATE_BUILDING_GUIDE.md)
 */

import { Link } from '@remix-run/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Heart, 
  ChevronRight, 
  Star, 
  Instagram, 
  Facebook, 
  Twitter,
  Mail, 
  Phone,
  MapPin,
  Home as HomeIcon, 
  Grid3X3, 
  User, 
  ShoppingCart, 
  MessageCircle,
  ArrowRight,
  Sparkles,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { AURORA_THEME } from './theme';
import { AuroraMinimalHeader } from './sections/Header';
import { AuroraMinimalFooter } from './sections/Footer';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { useWishlist } from '~/hooks/useWishlist';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';

// ============================================================================
// THEME CONSTANTS (AI-compatible - use config overrides when available)
// ============================================================================
const THEME = {
  primary: AURORA_THEME.primary,
  accent: AURORA_THEME.accent,
  accentSecondary: AURORA_THEME.accentSecondary,
  background: AURORA_THEME.background,
  text: AURORA_THEME.text,
  muted: AURORA_THEME.textMuted,
  cardBg: AURORA_THEME.cardBg,
  headerBg: AURORA_THEME.headerBgSolid,
  footerBg: AURORA_THEME.footerBg,
  footerText: AURORA_THEME.footerText,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function AuroraMinimalTemplate({
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();
  const count = useCartCount();

  // Handle scroll for glassmorphism header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter valid categories
  const validCategories = categories.filter((c): c is string => Boolean(c));

  // Get announcement from config
  const announcement = config?.announcement;

  return (
    <StoreConfigProvider config={config}>
      <ClientOnly fallback={<SkeletonLoader />}>
        {() => (
          <WishlistProvider>
            <div 
              className="min-h-screen pb-16 md:pb-0" 
              style={{ 
                backgroundColor: THEME.background, 
                fontFamily: AURORA_THEME.fontBody,
                color: THEME.text
              }}
            >
              {/* Google Fonts */}
              <link 
                href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" 
                rel="stylesheet" 
              />

              <AuroraMinimalHeader 
                storeName={storeName} 
                logo={logo} 
                categories={validCategories} 
                currentCategory={currentCategory}
                count={count}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
                isScrolled={isScrolled}
                announcement={announcement}
                socialLinks={socialLinks}
              />

              {/* Header Spacer */}
              <div className={`${announcement?.text ? 'h-[107px] lg:h-[123px]' : 'h-[67px] lg:h-[83px]'}`} />

              {/* ==================== DYNAMIC SECTIONS ==================== */}
              {(config?.sections ?? DEFAULT_SECTIONS).map((section: any) => {
                const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                if (!SectionComponent) return null;
                
                return (
                  <SectionComponent
                    key={section.id}
                    settings={section.settings}
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
                      currency: currency
                    }}
                    ProductCardComponent={AuroraProductCard}
                  />
                );
              })}

              {/* ==================== CATEGORY PILLS (Mobile) ==================== */}
              {validCategories.length > 0 && (
                <div 
                  className="lg:hidden overflow-x-auto py-4 px-4 border-b scrollbar-hide"
                  style={{ borderColor: AURORA_THEME.border }}
                >
                  <div className="flex gap-2">
                    <Link
                      to="/"
                      className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300"
                      style={{
                        background: !currentCategory ? AURORA_THEME.auroraGradient : 'transparent',
                        color: !currentCategory ? THEME.primary : THEME.text,
                        border: !currentCategory ? 'none' : `1px solid ${AURORA_THEME.border}`,
                      }}
                    >
                      All
                    </Link>
                    {validCategories.map((category) => (
                      <Link
                        key={category}
                        to={`/?category=${encodeURIComponent(category)}`}
                        className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300"
                        style={{
                          background: currentCategory === category ? AURORA_THEME.auroraGradient : 'transparent',
                          color: currentCategory === category ? THEME.primary : THEME.text,
                          border: currentCategory === category ? 'none' : `1px solid ${AURORA_THEME.border}`,
                        }}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== NEWSLETTER SECTION ==================== */}
              <section 
                className="relative py-20 overflow-hidden"
                style={{ background: AURORA_THEME.auroraGradient }}
              >
                {/* Decorative Blurs */}
                <div 
                  className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30"
                  style={{ backgroundColor: AURORA_THEME.accent }}
                />
                <div 
                  className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30"
                  style={{ backgroundColor: AURORA_THEME.accentSecondary }}
                />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h3 
                    className="text-3xl lg:text-5xl font-bold mb-4"
                    style={{ fontFamily: AURORA_THEME.fontHeading, color: THEME.primary }}
                  >
                    {(config as any)?.newsletter?.heading || 'Join Our Journey'}
                  </h3>
                  <p className="text-lg mb-8 max-w-lg mx-auto opacity-80" style={{ color: THEME.primary }}>
                    {(config as any)?.newsletter?.subheading || 'Be the first to discover new arrivals and exclusive offers.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-4 rounded-full bg-white/80 backdrop-blur-sm border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        boxShadow: AURORA_THEME.cardShadow,
                      }}
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105"
                      style={{ 
                        backgroundColor: THEME.primary, 
                        color: THEME.footerText,
                        boxShadow: '0 8px 30px rgba(44, 44, 44, 0.3)'
                      }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </section>

              <AuroraMinimalFooter 
                storeName={storeName} 
                footerConfig={footerConfig} 
                businessInfo={businessInfo} 
                socialLinks={socialLinks} 
                planType={planType}
                themeColors={THEME}
              />

              {/* ==================== MOBILE BOTTOM NAVIGATION ==================== */}
              <nav 
                className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
                style={{ 
                  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
                  borderColor: AURORA_THEME.border 
                }}
              >
                <div className="flex items-center justify-around h-16">
                  <Link to="/" className="flex flex-col items-center gap-1 py-2 px-4">
                    <div 
                      className="p-1.5 rounded-xl transition-all"
                      style={{ 
                        background: !currentCategory ? AURORA_THEME.auroraGradient : 'transparent'
                      }}
                    >
                      <HomeIcon 
                        className="w-5 h-5 transition-colors" 
                        style={{ color: !currentCategory ? THEME.primary : THEME.muted }} 
                      />
                    </div>
                    <span 
                      className="text-[10px] font-semibold"
                      style={{ color: !currentCategory ? THEME.primary : THEME.muted }}
                    >
                      Home
                    </span>
                  </Link>
                  <button 
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-1 py-2 px-4"
                  >
                    <div className="p-1.5 rounded-xl">
                      <Grid3X3 className="w-5 h-5" style={{ color: THEME.muted }} />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: THEME.muted }}>Browse</span>
                  </button>
                  <Link to="/cart" className="flex flex-col items-center gap-1 py-2 px-4 relative">
                    <div className="p-1.5 rounded-xl">
                      <ShoppingCart className="w-5 h-5" style={{ color: THEME.muted }} />
                    </div>
                    {count > 0 && (
                      <span 
                        className="absolute top-0 right-2 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: AURORA_THEME.auroraGradient, color: THEME.primary }}
                      >
                        {count}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold" style={{ color: THEME.muted }}>Cart</span>
                  </Link>
                  {!isPreview && (
                    <Link to="/auth/login" className="flex flex-col items-center gap-1 py-2 px-4">
                      <div className="p-1.5 rounded-xl">
                        <User className="w-5 h-5" style={{ color: THEME.muted }} />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: THEME.muted }}>Account</span>
                    </Link>
                  )}
                </div>
              </nav>

              {/* ==================== FLOATING CONTACT BUTTONS ==================== */}
              {!isPreview && (
                <>
                  {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
                    <a
                      href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `Hello ${storeName}, I'd like to know...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
                      title="Message on WhatsApp"
                    >
                      <MessageCircle className="h-7 w-7 text-white" />
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
                    </a>
                  )}
                  {config?.floatingCallEnabled && config?.floatingCallNumber && (
                    <a
                      href={`tel:${config.floatingCallNumber}`}
                      className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110`}
                      style={{ background: AURORA_THEME.auroraGradient }}
                      title="Call us"
                    >
                      <Phone className="h-7 w-7" style={{ color: THEME.primary }} />
                      <span 
                        className="absolute inset-0 rounded-full animate-ping opacity-25"
                        style={{ background: AURORA_THEME.auroraGradient }}
                      />
                    </a>
                  )}
                </>
              )}

              {/* Custom Animations */}
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                  from { opacity: 0; transform: translateX(-100%); }
                  to { opacity: 1; transform: translateX(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                .animate-slideIn { animation: slideIn 0.3s ease forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </div>
          </WishlistProvider>
        )}
      </ClientOnly>
    </StoreConfigProvider>
  );
}

// ============================================================================
// AURORA PRODUCT CARD COMPONENT
// ============================================================================
interface AuroraProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
  addToCartText?: string;
  showWishlist?: boolean;
}

export function AuroraProductCard({ product, storeId, formatPrice, isPreview, addToCartText, showWishlist }: AuroraProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { price, compareAtPrice: displayCompareAt, isFlashSale, isOnSale, discountPercentage } = useProductPrice(product);
  const isLiked = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500"
      style={{ 
        boxShadow: isHovered ? AURORA_THEME.cardShadowHover : AURORA_THEME.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: AURORA_THEME.backgroundAlt }}
          >
            <span className="text-6xl">✨</span>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%)' }}
        />

        {/* Discount Badge */}
        {isOnSale && (
          <div 
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{ 
              background: isFlashSale ? '#EF4444' : AURORA_THEME.auroraGradient, // Red for flash sale
              color: isFlashSale ? 'white' : THEME.primary 
            }}
          >
            {isFlashSale && <span className="mr-1">⚡</span>}
            -{discountPercentage}%
          </div>
        )}

        {/* Quick View Button */}
        <div 
          className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
        >
          <button
            className="w-full py-3 rounded-2xl backdrop-blur-md flex items-center justify-center gap-2 text-sm font-semibold transition-all"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: THEME.primary
            }}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>
      </Link>

      {/* Wishlist Button */}
      {showWishlist !== false && (
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10"
        style={{ 
          backgroundColor: isLiked ? AURORA_THEME.accent : 'rgba(255,255,255,0.9)',
          boxShadow: AURORA_THEME.cardShadow
        }}
      >
        <Heart 
          className={`w-5 h-5 transition-all ${isLiked ? 'fill-current' : ''}`}
          style={{ color: isLiked ? THEME.primary : THEME.muted }}
        />
      </button>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <span 
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: AURORA_THEME.accent }}
          >
            {product.category}
          </span>
        )}

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 
            className="text-lg font-semibold mt-1 mb-2 line-clamp-2 transition-colors hover:opacity-70"
            style={{ fontFamily: AURORA_THEME.fontHeading, color: THEME.primary }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span 
            className="text-xl font-bold"
            style={{ color: THEME.primary }}
          >
            {formatPrice(price)}
          </span>
          {isOnSale && displayCompareAt && (
            <span className="text-sm line-through" style={{ color: THEME.muted }}>
              {formatPrice(displayCompareAt)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {!isPreview ? (
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            productName={product.title}
            productPrice={price}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              background: AURORA_THEME.auroraGradient,
              color: THEME.primary,
              boxShadow: AURORA_THEME.buttonShadow
            }}
          >
            {addToCartText || 'Add to Cart'}
          </AddToCartButton>
        ) : (
          <button
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300"
            style={{ 
              background: AURORA_THEME.auroraGradient,
              color: THEME.primary,
              boxShadow: AURORA_THEME.buttonShadow
            }}
            disabled
          >
            {addToCartText || 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}

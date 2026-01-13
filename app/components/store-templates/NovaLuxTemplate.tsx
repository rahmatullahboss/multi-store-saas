/**
 * NovaLux Premium Store Template
 * 
 * World-class luxury ecommerce template inspired by Shopify Prestige,
 * Squarespace Fulton, and 2024 design trends.
 * 
 * Features:
 * - Transparent-to-solid header on scroll
 * - Rose Gold + Charcoal luxury color palette
 * - Elegant product cards with hover animations
 * - Mobile-first responsive design
 * - Full AI compatibility (per TEMPLATE_BUILDING_GUIDE.md)
 */

import { NovaLuxHeader } from '~/components/store-layouts/templates/NovaLuxHeader';
import { NovaLuxFooter } from '~/components/store-layouts/templates/NovaLuxFooter';
import { Link, useSearchParams } from '@remix-run/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  ArrowRight,
  Star,
  Quote,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
  Home as HomeIcon,
  Grid3X3,
  ShoppingCart,
  User,
  MessageCircle,
  Heart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';

import { NOVALUX_THEME } from './NovaLuxTheme';
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function NovaLuxTemplate({
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();
  const count = useCartCount();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  // Handle scroll for transparent-to-solid header
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
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div 
              className="min-h-screen pb-16 md:pb-0" 
              style={{ 
                backgroundColor: THEME.background, 
                fontFamily: NOVALUX_THEME.fontBody 
              }}
            >
              {/* Google Fonts */}
              <link 
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" 
                rel="stylesheet" 
              />

              <NovaLuxHeader 
                storeName={storeName} 
                logo={logo} 
                categories={categories} 
                currentCategory={currentCategory}
                socialLinks={socialLinks}
                config={config}
              />

              {/* Header Spacer */}
              <div className={`${announcement?.text ? 'h-[104px] lg:h-[120px]' : 'h-[66px] lg:h-[82px]'}`} />

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
                    ProductCardComponent={NovaLuxProductCard}
                  />
                );
              })}


              {/* ==================== FLOATING CONTACT BUTTONS ==================== */}
              {!isPreview && (
                <>
                  {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
                    <a
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
                      style={{ background: NOVALUX_THEME.accentGradient }}
                      title="Call us"
                    >
                      <Phone className="h-7 w-7" style={{ color: THEME.primary }} />
                      <span 
                        className="absolute inset-0 rounded-full animate-ping opacity-25"
                        style={{ backgroundColor: THEME.accent }}
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
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
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

// ============================================================================
// NOVALUX PRODUCT CARD COMPONENT
// ============================================================================
interface NovaLuxProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}

function NovaLuxProductCard({ product, storeId, formatPrice, isPreview }: NovaLuxProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const { price, compareAtPrice: displayCompareAt, isFlashSale, isOnSale, discountPercentage } = useProductPrice(product);

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500"
      style={{ 
        boxShadow: isHovered ? NOVALUX_THEME.cardShadowHover : NOVALUX_THEME.cardShadow,
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
            style={{ backgroundColor: NOVALUX_THEME.backgroundAlt }}
          >
            <span className="text-6xl">✨</span>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)' }}
        />

        {/* Discount Badge */}
        {isOnSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: isFlashSale ? '#EF4444' : NOVALUX_THEME.accentGradient,
              color: isFlashSale ? 'white' : THEME.primary
            }}
          >
            {isFlashSale && <span className="mr-1">⚡</span>}
            {discountPercentage}% OFF
          </div>
        )}

        {/* Wishlist Button */}
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
              fill: isLiked ? '#ef4444' : 'none'
            }}
          />
        </button>

        {/* Quick Add Button */}
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
            isPreview={isPreview}
          >
            Quick Add
          </AddToCartButton>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: THEME.accent }}
          >
            {product.category}
          </span>
        )}

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3
            className="font-medium mt-2 mb-3 line-clamp-2 transition-colors duration-300 hover:opacity-70"
            style={{
              fontFamily: NOVALUX_THEME.fontHeading,
              color: THEME.text,
              fontSize: '1.125rem',
              lineHeight: '1.4'
            }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              style={{
                color: THEME.accent,
                fill: i < 4 ? THEME.accent : 'none'
              }}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: THEME.muted }}>(24)</span>
        </div>

        {/* Price */}
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

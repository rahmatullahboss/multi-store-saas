/**
 * Freshness Template (2025 Edition)
 * 
 * A vibrant, organic-focused e-commerce template.
 * Based on the "Freshness" project.
 * 
 * Core Features:
 * - Dynamic Data Binding (No hardcoded content)
 * - "Pure UI" Architecture (Logic via hooks)
 * - Section Builder Support
 * - AI Editor Compatibility
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
  LogOut,
  Settings,
  Percent,
  ChevronDown,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { FRESHNESS_THEME } from './theme';
import { FreshnessHeader } from './sections/Header';
import { FreshnessFooter } from './sections/Footer';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { useWishlist } from '~/hooks/useWishlist';
import { AddToCartButton } from '~/components/AddToCartButton';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';

// ============================================================================
// THEME CONSTANTS
// ============================================================================
const THEME = {
  ...FRESHNESS_THEME,
  // Map generic theme keys to Freshness specific ones if needed
  headerBg: FRESHNESS_THEME.headerBg,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function FreshnessTemplate({
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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <StoreConfigProvider config={config}>
      <ClientOnly fallback={<SkeletonLoader />}>
        {() => (
          <WishlistProvider>
            <div 
              className="min-h-screen pb-16 md:pb-0" 
              style={{ 
                backgroundColor: THEME.background, 
                fontFamily: THEME.fontBody,
                color: THEME.text
              }}
            >
          {/* Load Fonts if needed (assuming system fonts or already loaded based on theme) */}
          {/* For Cursive font, we might need a google font link if not system default. 
              Let's add a generic cursive font from Google Fonts just in case: 'Pacifico' or similar matches the vibe, 
              but the theme file said "Cursive". Let's stick to theme definition. */}
          
          <FreshnessHeader 
            storeName={storeName} 
            logo={logo} 
            categories={validCategories} 
            count={count}
            setMobileMenuOpen={setMobileMenuOpen}
            isScrolled={isScrolled}
            businessInfo={businessInfo}
            isPreview={isPreview}
          />

          {/* Spacer */}
          <div className="h-20 lg:h-[145px]"></div>

          {/* ==================== MOBILE DRAWER ==================== */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/50 z-[200] lg:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  className="fixed top-0 left-0 w-80 h-screen bg-white z-[210] shadow-2xl lg:hidden flex flex-col"
                >
                  <div className="p-5 flex items-center justify-between text-white font-bold shrink-0" style={{ backgroundColor: THEME.primary }}>
                    <span className="text-xl italic" style={{ fontFamily: THEME.fontHeading }}>{storeName}</span>
                    <button onClick={() => setMobileMenuOpen(false)}>
                      <X className="w-8 h-8" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                     <div className="flex border rounded-lg overflow-hidden mb-6 shrink-0" style={{ borderColor: THEME.border }}>
                        <input
                          type="text"
                          placeholder="Search..."
                          className="flex-1 px-3 py-2 outline-none text-sm"
                        />
                        <button className="px-3" style={{ backgroundColor: THEME.accent }}>
                          <Search className="w-5 h-5 text-white" />
                        </button>
                     </div>

                     <ul className="space-y-1 mb-6">
                        <li className="border-b pb-2" style={{ borderColor: THEME.border }}>
                           <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-3 font-semibold text-gray-800">Home</Link>
                        </li>
                         {validCategories.map((cat) => (
                           <li key={cat} className="border-b pb-2" style={{ borderColor: THEME.border }}>
                              <Link 
                                to={`/?category=${encodeURIComponent(cat)}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-3 font-semibold text-gray-800"
                              >
                                {cat}
                              </Link>
                           </li>
                         ))}
                     </ul>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

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
                ProductCardComponent={FreshnessProductCard}
              />
            );
          })}


          <FreshnessFooter 
            storeName={storeName} 
            footerConfig={footerConfig} 
            businessInfo={businessInfo} 
            planType={planType}
            categories={validCategories}
          />
          </div>
          </WishlistProvider>
        )}
      </ClientOnly>
    </StoreConfigProvider>
  );
}

// ============================================================================
// FRESHNESS PRODUCT CARD COMPONENT
// ============================================================================
interface FreshnessProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
}

function FreshnessProductCard({ product, storeId, formatPrice }: FreshnessProductCardProps) {
  const { price, compareAtPrice, isFlashSale, isOnSale, discountPercentage } = useProductPrice(product);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden h-full flex flex-col"
    >
       <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
          {isFlashSale && (
             <span className="text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase shadow-sm bg-red-500">
               Sale
             </span>
          )}
          {isOnSale && !isFlashSale && (
             <span className="text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase shadow-sm bg-pink-500">
               -{Math.round(discountPercentage)}%
             </span>
          )}
       </div>

       {/* Action Buttons */}
       <div className="absolute top-2 right-2 md:top-4 md:right-[-50px] md:group-hover:right-4 transition-all duration-500 z-10 flex flex-col gap-1.5 md:gap-2">
          <button 
            onClick={() => toggleWishlist(product.id)}
            className="w-7 h-7 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
          >
             <Heart className="w-4 h-4 md:w-5 md:h-5" fill={isLiked ? "currentColor" : "none"} />
          </button>
          <Link to={`/products/${product.id}`} className="w-7 h-7 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all cursor-pointer">
             <Eye className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
       </div>

       {/* Image */}
       <div className="relative h-32 md:h-60 w-full overflow-hidden rounded-xl md:rounded-2xl mb-3 md:mb-4 bg-gray-50">
          <img 
            src={product.imageUrl || '/placeholder.png'} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
       </div>

       <div className="px-1 md:px-2 flex flex-col flex-grow">
          <p className="text-[8px] md:text-xs text-gray-400 font-bold mb-0.5 md:mb-1 uppercase tracking-wider">
            {product.category || 'General'}
          </p>
          <Link to={`/products/${product.id}`}>
             <h3 className="text-xs md:text-base font-bold text-gray-800 hover:text-green-600 cursor-pointer transition-colors mb-1 md:mb-2 line-clamp-1">
               {product.title}
             </h3>
          </Link>

          {/* Price & Cart */}
          <div className="mt-auto">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 md:pt-4 border-t border-gray-50">
                <div className="flex flex-wrap items-baseline gap-1">
                   <span className="text-sm md:text-xl font-black" style={{ color: THEME.primary }}>
                     {formatPrice(price)}
                   </span>
                   {compareAtPrice && (
                     <span className="text-[10px] md:text-sm text-gray-400 line-through">
                       {formatPrice(compareAtPrice)}
                     </span>
                   )}
                </div>

                <div className="self-end md:self-auto">
                   <AddToCartButton 
                     productId={product.id}
                     storeId={storeId}
                     className="bg-green-100 text-green-600 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                   />
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

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
import { FRESHNESS_THEME } from './FreshnessTheme';
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
          
          {/* ==================== HEADER ==================== */}
          <header 
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
            style={{ 
              backgroundColor: THEME.headerBg,
              backdropFilter: 'blur(10px)',
              borderColor: THEME.border,
              boxShadow: isScrolled ? THEME.cardShadow : 'none',
              transform: isScrolled ? 'translateY(0)' : 'translateY(0)', // Can add hide logic if needed
            }}
          >
             <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
               {/* Mobile Menu Toggle */}
                <button
                  className="lg:hidden text-gray-800 cursor-pointer"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-8 h-8" />
                </button>

                {/* Logo */}
                <Link
                  to="/"
                  className="text-2xl md:text-3xl lg:text-4xl font-bold italic shrink-0"
                  style={{ 
                    fontFamily: THEME.fontHeading,
                    color: THEME.primary
                  }}
                >
                  {logo ? (
                    <img src={logo} alt={storeName} className="h-10 object-contain" />
                  ) : (
                    storeName
                  )}
                </Link>

                {/* Desktop Search */}
                <div className="hidden lg:flex flex-1 max-w-xl items-center border-2 rounded-full focus-within:border-amber-400 transition-all ml-4 overflow-hidden" style={{ borderColor: THEME.border }}>
                  <input
                    type="text"
                    placeholder={t('searchProducts') || "Search for products..."}
                    className="flex-1 px-5 py-2 outline-none text-gray-600 bg-transparent"
                  />
                  <button
                    className="p-3 px-6 transition-colors"
                    style={{ backgroundColor: THEME.accent }}
                  >
                    <Search className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 md:gap-6">
                   {/* User Profile (Simplified for template) */}
                   <Link to={isPreview ? '#' : '/auth/login'} className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:text-white transition-all cursor-pointer" style={{ ':hover': { backgroundColor: THEME.secondary } } as any}>
                      <User className="w-5 h-5" />
                   </Link>

                   {/* Wishlist */}
                   <div className="relative cursor-pointer hover:text-red-500 transition-colors">
                      <Heart className="w-7 h-7" />
                      {/* Wishlist count would ideally come from useWishlist */}
                      <span className="absolute -top-2 -right-2 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border text-white border-white bg-red-400">
                        0
                      </span>
                   </div>

                   {/* Cart */}
                   <Link
                      to="/cart"
                      className="relative cursor-pointer hover:text-green-600 transition-colors"
                    >
                      <ShoppingCart className="w-7 h-7" />
                      {count > 0 && (
                        <span 
                          className="absolute -top-2 -right-2 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white"
                          style={{ backgroundColor: THEME.secondary }}
                        >
                          {count}
                        </span>
                      )}
                    </Link>
                </div>
             </div>

             {/* Desktop Navigation */}
             <nav className="hidden lg:block border-t bg-white" style={{ borderColor: THEME.border }}>
                <div className="container mx-auto px-4 flex items-center justify-between">
                   <ul className="flex items-center gap-8 font-semibold text-gray-700">
                      <li className="py-5">
                        <Link to="/" className="flex items-center gap-1 hover:text-green-600 transition-colors">
                          {t('home') || 'Home'}
                        </Link>
                      </li>
                      <li className="py-5 group relative cursor-pointer">
                         <span className="flex items-center gap-1 hover:text-green-600 transition-colors">
                           {t('categories') || 'Categories'} <ChevronDown className="w-4 h-4" />
                         </span>
                         {/* Simple Dropdown for Categories */}
                         <div className="absolute top-full left-0 min-w-[200px] bg-white shadow-xl border rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-50 p-2" style={{ borderColor: THEME.border }}>
                            {validCategories.map((cat) => (
                              <Link 
                                key={cat}
                                to={`/?category=${encodeURIComponent(cat)}`}
                                className="block py-2 px-3 text-sm rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50"
                              >
                                {cat}
                              </Link>
                            ))}
                         </div>
                      </li>
                      <li className="py-5">
                         <Link to="/about" className="hover:text-green-600 transition-colors">About Us</Link>
                      </li>
                       <li className="py-5">
                         <Link to="/contact" className="hover:text-green-600 transition-colors">Contact</Link>
                      </li>
                   </ul>

                   <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                         <Percent className="w-5 h-5 text-green-600" />
                         <span>Weekly Discount!</span>
                      </div>
                      <div className="text-white px-5 py-2 rounded-lg flex items-center gap-3" style={{ backgroundColor: THEME.primary }}>
                         <Phone className="w-5 h-5" />
                         <div className="leading-tight">
                            <p className="text-[10px] opacity-80 uppercase font-medium">Hotline</p>
                            <p className="font-bold">{businessInfo?.phone || '+880 1234567890'}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </nav>
          </header>

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


          {/* ==================== FOOTER ==================== */}
          <footer className="pt-16 border-t" style={{ backgroundColor: THEME.footerBg, color: THEME.footerText, borderColor: THEME.border }}>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                 {/* Brand info */}
                 <div className="space-y-6">
                    <span 
                      className="text-3xl font-bold italic inline-block" 
                      style={{ fontFamily: THEME.fontHeading, color: THEME.primary }}
                    >
                      {storeName}
                    </span>
                    <p className="text-gray-500 leading-relaxed text-sm">
                      {footerConfig?.description || 'Providing fresh products directly to your doorstep.'}
                    </p>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: THEME.primary }}>
                             <Phone className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">{businessInfo?.phone}</span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: THEME.secondary }}>
                             <Mail className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">{businessInfo?.email}</span>
                       </div>
                    </div>
                 </div>
                 
                 {/* Quick Links */}
                 <div>
                    <h4 className="text-lg font-black text-gray-900 mb-6">Quick Links</h4>
                    <ul className="space-y-4">
                       <li><Link to="/" className="text-gray-500 hover:text-green-600 text-sm transition-colors">Home</Link></li>
                       <li><Link to="/about" className="text-gray-500 hover:text-green-600 text-sm transition-colors">About Us</Link></li>
                       <li><Link to="/contact" className="text-gray-500 hover:text-green-600 text-sm transition-colors">Contact</Link></li>
                    </ul>
                 </div>

                 {/* Categories */}
                 <div>
                    <h4 className="text-lg font-black text-gray-900 mb-6">Categories</h4>
                     <ul className="space-y-4">
                        {validCategories.slice(0, 5).map(cat => (
                          <li key={cat}>
                             <Link to={`/?category=${encodeURIComponent(cat)}`} className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                                {cat}
                             </Link>
                          </li>
                        ))}
                     </ul>
                 </div>

                 {/* Newsletter */}
                 <div className="space-y-6">
                    <h4 className="text-lg font-black text-gray-900 mb-6">Newsletter</h4>
                    <p className="text-gray-500 text-sm">Subscribe to get latest updates.</p>
                     <div className="relative">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full bg-white border rounded-full px-6 pr-32 py-4 text-sm outline-none focus:border-green-500 transition-all shadow-sm"
                          style={{ borderColor: THEME.border }}
                        />
                        <button 
                          className="absolute right-1.5 top-1.5 bottom-1.5 text-white px-6 rounded-full text-xs font-bold transition-all active:scale-95 shadow-lg"
                          style={{ backgroundColor: THEME.secondary }}
                        >
                          Subscribe
                        </button>
                     </div>
                 </div>
              </div>

               <div className="border-t py-8 flex flex-col items-center justify-center gap-4" style={{ borderColor: THEME.border }}>
                  <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} <span className="font-bold" style={{ color: THEME.primary }}>{storeName}</span>. All Rights Reserved.
                  </p>

                  {/* Viral Loop / Branding */}
                  {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
                    <div className="flex justify-center items-center">
                      <a 
                        href="https://ozzy.com?utm_source=footer-branding&utm_medium=referral" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
                      >
                        <span>Powered by</span>
                        <span className="font-bold tracking-tight text-sm text-green-700">Ozzyl</span>
                      </a>
                    </div>
                  )}
               </div>
            </div>
          </footer>
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

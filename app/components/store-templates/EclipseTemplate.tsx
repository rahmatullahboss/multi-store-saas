/**
 * Eclipse Premium Template (2025 Edition)
 * 
 * A futuristic, high-performance dark mode template with neon accents,
 * spotlight interactions, and bento-grid layouts.
 */

import { EclipseHeader } from '~/components/store-layouts/templates/EclipseHeader';
import { EclipseFooter } from '~/components/store-layouts/templates/EclipseFooter';
import { Link } from '@remix-run/react';
import { 
  Menu, X, Search, ShoppingCart, 
  ChevronRight, ArrowRight, Star, 
  Instagram, Facebook, Twitter, ShoppingBag, Heart, User,
  Zap, Globe, Monitor
} from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import { useState, useEffect, useRef } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { ECLIPSE_THEME } from './EclipseTheme';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';

// ============================================================================
// COMPONENT: ECLIPSE TEMPLATE
// ============================================================================
export function EclipseTemplate({
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
  isPreview,
}: StoreTemplateProps) {
  const [scrolled, setScrolled] = useState(false);
  const count = useCartCount();
  const { count: wishlistCount } = useWishlist();
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();

  // Handle scroll for floating header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const theme = {
    primary: ECLIPSE_THEME.text, // In dark mode, primary text is light
    accent: ECLIPSE_THEME.accent,
    background: ECLIPSE_THEME.background,
    text: ECLIPSE_THEME.text,
    headingFont: ECLIPSE_THEME.fontHeading,
  };

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div 
              className="min-h-screen selection:bg-violet-500 selection:text-white"
              style={{ 
                backgroundColor: ECLIPSE_THEME.background,
                color: ECLIPSE_THEME.text,
                fontFamily: ECLIPSE_THEME.fontBody
              }}
            >
      {/* Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Floating Neon Header */}
      <EclipseHeader 
        storeName={storeName} 
        logo={logo} 
        categories={validCategories} 
      />


      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24 pb-20">
        
        {/* ==================== DYNAMIC SECTIONS ==================== */}
        {(config?.sections ?? DEFAULT_SECTIONS).map((section: any) => {
          const SectionComponent = SECTION_REGISTRY[section.type]?.component;
          if (!SectionComponent) return null;

          // Wrap sections in a "Reveal" container if needed, or render directly
          return (
            <div key={section.id} className="relative">
              <SectionComponent
                settings={section.settings}
                theme={theme} // Pass "Light" theme values because components expect standard palette, but we handle dark mode via CSS global overrides mostly
                products={products}
                categories={categories}
                storeId={storeId}
                currency={currency}
                store={{ name: storeName }}
                ProductCardComponent={EclipseProductCard}
              />
              {/* Add a subtle separator glow */}
              <div 
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-20"
                style={{ background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)' }}
              />
            </div>
          );
        })}

      </main>

      {/* Footer */}
      <EclipseFooter storeName={storeName} socialLinks={socialLinks} footerConfig={footerConfig} />
    
      {/* ==================== GLOBAL STYLES FOR SECTIONS ==================== */}
      <style>{`
        /* Force dark mode section styles */
        .section-container { color: ${ECLIPSE_THEME.text}; }
        .section-heading { font-family: ${ECLIPSE_THEME.fontHeading}; letter-spacing: -0.02em; }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { bg: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// COMPONENT: SPOTLIGHT PRODUCT CARD
// ============================================================================
interface EclipseProductCardProps {
  product: any;
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
  addToCartText?: string;
  showWishlist?: boolean;
}

function EclipseProductCard({ product, storeId, formatPrice, isPreview, addToCartText, showWishlist }: EclipseProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const { price, compareAtPrice: displayCompareAt, isFlashSale, isOnSale } = useProductPrice(product);
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  // Spotlight Effect Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    
    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10"
      style={{ 
        fontFamily: ECLIPSE_THEME.fontBody,
      }}
    >
      {/* Spotlight Canvas */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
          opacity: opacity,
          zIndex: 0
        }}
      />
      
      {/* Border Glow Spotlight */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.4), transparent 40%)`,
          maskImage: 'linear-gradient(black, black), content-box', // This is complex, simplified version below
          WebkitMaskComposite: 'xor',
          opacity: opacity,
          zIndex: 10,
          border: '1px solid transparent' // Placeholder
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Image Area */}
        <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-black/50">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">NO IMAGE</div>
          )}
          
          {/* Tag */}
          {isOnSale && (
            <span className={`absolute top-4 left-4 ${isFlashSale ? 'bg-red-600' : 'bg-violet-600'} text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide`}>
              {isFlashSale ? 'Flash Sale' : 'Sale'}
            </span>
          )}

          {/* Quick Add Overlay (Mobile Friendly: Always visible on bottom right or just icon) */}
          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
             <button 
               onClick={(e) => {
                 e.preventDefault();
                 toggleWishlist(product.id);
               }}
               className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
             >
                <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
             </button>
             <button className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                <ShoppingBag size={18} />
             </button>
          </div>
        </Link>
        
        {/* Details */}
        <div className="p-5 flex-1 flex flex-col">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-white font-medium text-lg leading-snug mb-2 group-hover:text-violet-400 transition-colors">
              {product.title}
            </h3>
          </Link>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">
                {formatPrice(price)}
              </span>
              {isOnSale && displayCompareAt && (
                <span className="text-white/40 line-through text-sm">
                  {formatPrice(displayCompareAt)}
                </span>
              )}
            </div>
            
            {/* Minimal Add button for mobile readiness implies we might want it visible always on mobile */}
            <div className="md:hidden">
               <AddToCartButton 
                 productId={product.id} 
                 storeId={storeId}
                 className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-full"
                 isPreview={isPreview}
               >
                 {addToCartText || 'Add'}
               </AddToCartButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

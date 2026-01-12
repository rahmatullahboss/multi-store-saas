/**
 * Eclipse Premium Template (2025 Edition)
 * 
 * A futuristic, high-performance dark mode template with neon accents,
 * spotlight interactions, and bento-grid layouts.
 */

import { Link } from '@remix-run/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Heart, 
  ArrowRight, 
  Instagram, 
  Facebook, 
  Twitter,
  Zap,
  Globe,
  Monitor
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { ECLIPSE_THEME } from './EclipseTheme';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCartCount();
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

      {/* ==================== FLOATING HEADER ==================== */}
      <header 
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500"
        style={{ transform: scrolled ? 'translateY(0)' : 'translateY(0)' }}
      >
        <div 
          className="w-full max-w-5xl rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300"
          style={{ 
            backgroundColor: ECLIPSE_THEME.headerBg,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${ECLIPSE_THEME.border}`,
            boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none'
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12"
              style={{ background: ECLIPSE_THEME.accentGradient }}
            >
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            {logo ? (
              <img src={logo} alt={storeName} className="h-6 object-contain" />
            ) : (
              <span 
                className="font-bold text-lg tracking-tight"
                style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
              >
                {storeName}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-white transition-colors text-white/70">
              Store
            </Link>
            {validCategories.slice(0, 3).map(cat => (
              <Link 
                key={cat} 
                to={`/?category=${encodeURIComponent(cat)}`}
                className="text-sm font-medium hover:text-white transition-colors text-white/70 hover:text-violet-400"
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
              <Search className="w-3.5 h-3.5 text-white/50 mr-2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs w-20 text-white placeholder-white/30" 
              />
            </div>

            <Link to="/cart" className="relative group p-2">
              <ShoppingBag className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
              {count > 0 && (
                <span 
                  className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: ECLIPSE_THEME.accent, color: 'white' }}
                >
                  {count}
                </span>
              )}
            </Link>

            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MOBILE MENU OVERLAY ==================== */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-end">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <nav className="mt-12 flex flex-col gap-6">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-3xl font-bold text-white hover:text-violet-400 transition-colors"
              style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
            >
              All Products
            </Link>
            {validCategories.map(cat => (
              <Link 
                key={cat}
                to={`/?category=${encodeURIComponent(cat)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl font-bold text-white/50 hover:text-white transition-colors"
                style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
              >
                {cat}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <p className="text-white/30 text-sm">© {new Date().getFullYear()} {storeName}</p>
          </div>
        </div>
      </div>

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

      {/* ==================== MASSIVE FOOTER ==================== */}
      <footer 
        className="relative overflow-hidden pt-20 pb-10 px-4"
        style={{ backgroundColor: ECLIPSE_THEME.footerBg }}
      >
        {/* Background Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{ 
            background: ECLIPSE_THEME.spotlightGradient,
            filter: 'blur(80px)' 
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <h2 
                className="text-4xl font-bold leading-tight"
                style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
              >
                {storeName}
              </h2>
              <p className="text-white/50 max-w-xs">{footerConfig?.description || 'Defining the future of commerce.'}</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white">Explore</h4>
              <ul className="space-y-4 text-white/50">
                <li><Link to="/" className="hover:text-white transition-colors">Store</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Journal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-4 text-white/50">
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white">Connect</h4>
              <div className="flex gap-4">
                {socialLinks?.instagram && <a href={socialLinks.instagram} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Instagram size={18} /></a>}
                {socialLinks?.twitter && <a href={socialLinks.twitter} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Twitter size={18} /></a>}
                {socialLinks?.facebook && <a href={socialLinks.facebook} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Facebook size={18} /></a>}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/30">
            <p>© 2025 {storeName}. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="flex items-center gap-2"><Globe size={14} /> Global Delivery</span>
              <span className="flex items-center gap-2"><Monitor size={14} /> Secure Payment</span>
            </div>
          </div>
        </div>
      </footer>
    
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
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute top-4 left-4 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              Sale
            </span>
          )}

          {/* Quick Add Overlay (Mobile Friendly: Always visible on bottom right or just icon) */}
          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
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
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-white/40 line-through text-sm">
                  {formatPrice(product.compareAtPrice)}
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

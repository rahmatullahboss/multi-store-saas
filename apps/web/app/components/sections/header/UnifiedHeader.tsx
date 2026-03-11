import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, ShoppingCart, Search, Menu, X, Sparkles, User, Headphones, Heart, Grid3X3, ChevronRight } from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { useWishlist } from '~/hooks/useWishlist';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { LanguageSelector } from '../../store-templates/shared/LanguageSelector';
import type { ThemeConfig, SocialLinks } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedHeaderProps {
  storeName: string;
  logo?: string | null;
  config?: ThemeConfig | null;
  currentCategory?: string | null;
  categories: (string | StoreCategory | null)[];
  isPreview?: boolean;
  customer?: { id: number; name: string | null; email: string | null } | null;
  socialLinks?: SocialLinks | null;
  theme: StoreTemplateTheme;
  // Layout Variants driven by JSON schema
  variant?: 'marketplace' | 'luxury' | 'minimal' | 'bold' | 'default';
  layout?: 'logo-left' | 'logo-center';
  showTopBar?: boolean;
  isSticky?: boolean;
  enableBlur?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedHeader({
  storeName,
  logo,
  config,
  currentCategory,
  categories,
  isPreview = false,
  customer,
  theme,
  variant = 'default',
  layout = 'logo-left',
  showTopBar = false,
  isSticky = true,
  enableBlur = false,
}: UnifiedHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { t } = useTranslation();
  const count = useCartCount();
  const { count: wishlistCount } = useWishlist();

  // Scroll listener for sticky/blur effects (primarily used by Luxury variants)
  useEffect(() => {
    if (!isSticky && !enableBlur) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky, enableBlur]);

  // Derived Values
  const validCategories = categories
    .map((category) => (typeof category === 'string' ? category : category?.title || null))
    .filter(Boolean);
  
  const announcement = config?.announcement;

  // Search Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // ============================================================================
  // STYLES DEDUCTION
  // ============================================================================
  
  // Luxury variant uses a blurred/transparent header before scroll, solid after.
  // Marketplace uses a solid primary color always.
  const headerBgColor = 
    variant === 'luxury' 
      ? (isScrolled ? (theme.headerBg || '#ffffff') : 'rgba(255, 255, 255, 0.9)')
      : (variant === 'marketplace' ? theme.primary : (theme.headerBg || '#ffffff'));

  const headerTextColor = variant === 'marketplace' ? '#ffffff' : theme.text;
  const headerIconColor = variant === 'marketplace' ? '#ffffff' : theme.text;
  
  // Luxury effects
  const backdropFilter = variant === 'luxury' && enableBlur ? 'blur(12px)' : 'none';
  const boxShadow = variant === 'luxury' && isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : (variant === 'marketplace' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none');
  const borderBottom = variant === 'luxury' && isScrolled ? `1px solid ${theme.cardBorder || '#f3f4f6'}` : 'none';

  // Fonts
  const headingFont = variant === 'luxury' ? 'Cormorant Garamond, serif' : 'inherit';

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP UTILITY BAR (Marketplace style)                           */}
      {/* ------------------------------------------------------------------ */}
      {showTopBar && (
        <div className="hidden md:block" style={{ backgroundColor: theme.footerBg || '#1e293b' }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8 text-xs text-white/90">
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">
                {t('store.saveMoreOnApp', 'Save More on App')}
              </span>
              <span className="hover:text-white cursor-pointer transition-colors">
                {t('store.becomeSeller', 'Become a Seller')}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <LanguageSelector />
              <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                {t('store.helpSupport', 'Help & Support')}
              </span>
              {!isPreview && (
                <Link to="/auth/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {t('store.loginSignup', 'Login / Sign Up')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. MAIN HEADER                                                   */}
      {/* ------------------------------------------------------------------ */}
      <header
        className={`${isSticky ? 'sticky top-0 z-50' : 'relative z-50'} transition-all duration-300`}
        style={{
          backgroundColor: headerBgColor,
          backdropFilter,
          boxShadow,
          borderBottom,
        }}
      >
        {/* Luxury style announcement bar sits inside the sticky header */}
        {variant === 'luxury' && announcement?.text && (
          <div
            className="text-center py-2.5 text-sm font-medium transition-all"
            style={{
              background: theme.accentGradient || `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`,
              color: '#ffffff',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {announcement.link ? (
                <a href={announcement.link} className="hover:underline">{announcement.text}</a>
              ) : (
                announcement.text
              )}
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 lg:h-20 gap-3 md:gap-4">
            
            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors hover:bg-black/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 md:w-6 md:h-6" style={{ color: headerIconColor }} />
              ) : (
                <Menu className="w-5 h-5 md:w-6 md:h-6" style={{ color: headerIconColor }} />
              )}
            </button>

            {/* DESKTOP NAVIGATION (LUXURY - Left Side) */}
            {layout === 'logo-center' && (
              <nav className="hidden md:flex flex-1 items-center gap-1">
                <PreviewSafeLink
                  to="/"
                  className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                  style={{ color: !currentCategory ? theme.accent : headerTextColor }}
                  isPreview={isPreview}
                >
                  {t('store.allProducts', 'All Products')}
                </PreviewSafeLink>
                {validCategories.slice(0, 3).map((title) => (
                  <PreviewSafeLink
                    key={title}
                    to={`/products/${encodeURIComponent(title!.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                    className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                    style={{ color: currentCategory === title ? theme.accent : headerTextColor }}
                    isPreview={isPreview}
                  >
                    {title}
                  </PreviewSafeLink>
                ))}
              </nav>
            )}

            {/* LOGO */}
            <PreviewSafeLink
              to="/"
              className={`flex items-center gap-2.5 shrink-0 ${layout === 'logo-center' ? 'md:justify-center' : ''}`}
              isPreview={isPreview}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={storeName}
                  className={`h-8 w-8 ${layout === 'logo-center' ? 'lg:h-12 lg:w-12 bg-transparent' : 'md:h-10 md:w-10 bg-white'} object-contain rounded`}
                />
              ) : (
                <div className={`h-8 w-8 ${layout === 'logo-center' ? 'lg:h-12 lg:w-12' : 'md:h-10 md:w-10 bg-white'} rounded flex items-center justify-center`}>
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" style={{ color: layout === 'logo-center' ? headerIconColor : theme.primary }} />
                </div>
              )}
              <span
                className="font-bold text-lg md:text-xl hidden sm:block tracking-tight"
                style={{ 
                  color: layout === 'logo-center' ? theme.primary : headerTextColor,
                  fontFamily: headingFont,
                  fontSize: layout === 'logo-center' ? '1.5rem' : '1.125rem' 
                }}
              >
                {storeName}
              </span>
            </PreviewSafeLink>

            {/* SEARCH BAR (MARKETPLACE - Center) */}
            {layout === 'logo-left' && variant === 'marketplace' && (
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-2 md:mx-4">
                <div className="relative flex w-full">
                  <input
                    type="text"
                    placeholder={`Search in ${storeName}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 md:h-10 pl-4 pr-12 rounded-l text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{ backgroundColor: theme.cardBg, color: theme.text }}
                  />
                  <button
                    type="submit"
                    className="h-9 md:h-10 px-4 md:px-6 rounded-r font-medium text-white transition-all hover:opacity-90 cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: theme.accent || theme.text }}
                  >
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* RIGHT NAVIGATION (Icons) */}
            <div className={`flex items-center gap-1 md:gap-2 ${layout === 'logo-center' ? 'flex-1 justify-end' : ''}`}>
              {/* Luxury Language Selector */}
              {variant === 'luxury' && (
                <div className="hidden lg:block mr-1">
                  <LanguageSelector />
                </div>
              )}

              {/* Search Icon (Mobile or Luxury Desktop) */}
              {(variant === 'luxury' || layout === 'logo-center') && (
                <button className="p-2.5 rounded-full transition-all duration-300 hover:bg-black/5">
                  <Search className="w-5 h-5" style={{ color: headerIconColor }} />
                </button>
              )}

              {/* Cart */}
              <PreviewSafeLink
                to="/cart"
                className="relative p-2 rounded transition-colors hover:bg-black/5 cursor-pointer"
                aria-label="Cart"
                isPreview={isPreview}
              >
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" style={{ color: headerIconColor }} />
                {(count > 0 || variant === 'luxury') && (
                  <span
                    className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 min-w-[18px] h-[18px] md:min-w-[20px] md:h-[20px] px-1 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold"
                    style={{ backgroundColor: variant === 'marketplace' ? (theme.accent || '#F59E0B') : theme.primary, color: '#fff' }}
                  >
                    {count}
                  </span>
                )}
              </PreviewSafeLink>

              {/* Wishlist (Marketplace Desktop) */}
              {variant === 'marketplace' && (
                <button className="hidden md:flex p-2 rounded transition-colors hover:bg-black/5 relative cursor-pointer" aria-label="Wishlist">
                  <Heart className="h-6 w-6" style={{ color: headerIconColor }} />
                  {wishlistCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: theme.accent || '#F59E0B', color: '#fff' }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Account */}
              {!isPreview && (
                <Link
                  to="/auth/login"
                  className="hidden sm:flex items-center gap-2 p-2 rounded transition-colors hover:bg-black/5 cursor-pointer"
                  title={customer ? customer.name || customer.email || 'My Account' : 'Login'}
                >
                  {customer && variant === 'luxury' ? (
                     <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{ background: theme.accentGradient || theme.accent, color: '#ffffff' }}
                     >
                       {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                     </div>
                  ) : (
                    <User className="h-5 w-5 md:h-6 md:w-6" style={{ color: headerIconColor }} />
                  )}
                  {customer && variant === 'luxury' && (
                    <span className="text-sm font-medium hidden md:block" style={{ color: theme.text }}>
                      {customer.name || customer.email?.split('@')[0] || 'Account'}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
          
          {/* MOBILE SEARCH BAR (Marketplace) */}
          {layout === 'logo-left' && variant === 'marketplace' && (
             <form onSubmit={handleSearch} className="md:hidden pb-3">
               <div className="relative flex w-full">
                 <input
                   type="text"
                   placeholder={`Search in ${storeName}`}
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full h-10 pl-4 pr-12 rounded text-sm border-0 focus:outline-none"
                   style={{ backgroundColor: theme.cardBg, color: theme.text }}
                 />
                 <button
                   type="submit"
                   className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center rounded-r"
                   style={{ color: theme.primary }}
                 >
                   <Search className="w-5 h-5" />
                 </button>
               </div>
             </form>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3. MOBILE MENU OVERLAY                                           */}
        {/* ------------------------------------------------------------------ */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 z-[60] flex flex-col transition-all duration-300"
            style={{ 
              backgroundColor: variant === 'luxury' ? 'rgba(255, 255, 255, 0.95)' : theme.background,
              backdropFilter: variant === 'luxury' ? 'blur(16px)' : 'none',
              top: variant === 'marketplace' ? 'auto' : '0' // Marketplace dropdown vs Luxury full screen overlay
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.cardBorder || '#e5e7eb' }}>
              <span className="text-xl font-bold tracking-wider" style={{ fontFamily: headingFont, color: variant === 'luxury' ? theme.primary : theme.text }}>
                {variant === 'luxury' ? 'Menu' : t('store.categories', 'Categories')}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-6 h-6" style={{ color: variant === 'luxury' ? theme.primary : theme.text }} />
              </button>
            </div>

            <nav className="flex flex-col p-4 md:p-6 gap-2 overflow-y-auto">
              <PreviewSafeLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${variant === 'luxury' ? 'text-lg border-b' : 'text-sm'}`}
                style={{ 
                  backgroundColor: (!currentCategory && variant === 'marketplace') ? `${theme.primary}15` : 'transparent',
                  color: (!currentCategory && variant === 'marketplace') ? theme.primary : theme.text,
                  borderColor: variant === 'luxury' ? (theme.cardBorder || '#f3f4f6') : 'transparent'
                }}
                isPreview={isPreview}
              >
                {variant === 'marketplace' && <ShoppingBag className="w-5 h-5" />}
                {t('store.allProducts', 'All Products')}
              </PreviewSafeLink>

              {validCategories.map((title) => {
                const isActive = currentCategory === title;
                return (
                  <PreviewSafeLink
                    key={title}
                    to={`/products/${encodeURIComponent(title!.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${variant === 'luxury' ? 'text-lg border-b' : 'text-sm'}`}
                    style={{
                      backgroundColor: (isActive && variant === 'marketplace') ? `${theme.primary}15` : 'transparent',
                      color: (isActive && variant === 'marketplace') ? theme.primary : theme.text,
                      borderColor: variant === 'luxury' ? (theme.cardBorder || '#f3f4f6') : 'transparent'
                    }}
                    isPreview={isPreview}
                  >
                    {variant === 'marketplace' && <Grid3X3 className="w-5 h-5 opacity-60" />}
                    {title}
                    {variant === 'marketplace' && <ChevronRight className="w-4 h-4 ml-auto opacity-40" />}
                  </PreviewSafeLink>
                );
              })}

              {/* Additional Marketplace Menu Items */}
              {variant === 'marketplace' && (
                <>
                  <div className="h-px my-2" style={{ backgroundColor: theme.cardBorder || '#e5e7eb' }} />
                  <a href="#support" className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm cursor-pointer" style={{ color: theme.muted }}>
                    <Headphones className="w-5 h-5" />
                    {t('store.helpSupport', 'Help & Support')}
                  </a>
                  {!isPreview && (
                    <PreviewSafeLink to="/auth/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm cursor-pointer" style={{ color: theme.muted }} isPreview={isPreview}>
                      <User className="w-5 h-5" />
                      {t('store.loginSignup', 'Login / Sign Up')}
                    </PreviewSafeLink>
                  )}
                </>
              )}

              {/* Additional Luxury Menu Items */}
              {variant === 'luxury' && (
                <div className="mt-4 px-4">
                  <span className="text-sm font-medium text-gray-500 mb-2 block uppercase tracking-wider">
                    Settings
                  </span>
                  <LanguageSelector />
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
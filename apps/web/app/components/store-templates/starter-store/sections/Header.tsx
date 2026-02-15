/**
 * Starter Store Header Component
 *
 * A clean, modern header for the Starter Store template.
 * Works in both preview and live modes:
 * - Preview: Links are disabled, demo cart count
 * - Live: Real navigation, real cart count from API
 */

import { Link, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { useWishlist } from '~/hooks/useWishlist';
import { PreviewSafeLink, usePreviewUrl } from '~/components/PreviewSafeLink';
import { resolveStarterStoreTheme } from '../theme';
import type { ThemeConfig, SocialLinks } from '@db/types';
import { useTranslation } from '~/contexts/LanguageContext';
import { LanguageSelector } from '../../shared/LanguageSelector';

import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';

interface StarterStoreHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  variant?: 'default' | 'overlay';
  customer?: { id: number; name: string | null; email: string | null } | null;
  themeColors?: StoreTemplateTheme;
}

export function StarterStoreHeader({
  storeName,
  logo,
  isPreview = false,
  categories = [],
  currentCategory,
  config,
  variant = 'default',
  customer,
  themeColors,
}: StarterStoreHeaderProps) {
  const theme = resolveStarterStoreTheme(config, themeColors);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use real cart count in live mode, demo count in preview
  const realCartCount = useCartCount();
  const cartCount = isPreview ? 3 : realCartCount;
  const { t } = useTranslation();

  const { count: wishlistCount } = useWishlist();

  const validCategories = categories.filter(Boolean).slice(0, 8);

  const getPreviewUrl = usePreviewUrl(isPreview);
  const navigate = useNavigate();

  // Scroll detection removed as user requested solid header always
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 20);
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    const target = getPreviewUrl(`/?search=${encodeURIComponent(trimmedQuery)}`);
    navigate(target);
  };

  // Determine styles based on variant and scroll state
  // User requested white background instead of transparent, but keeping fixed positioning
  const isTransparent = false; // Forced to false based on user feedback
  const headerBg = theme.headerBg; // Always use theme header bg (white)
  const textColor = theme.text; // Always use theme text color
  const iconColor = theme.text; // Always use theme icon color
  const logoBg = 'bg-transparent'; // No special bg needed for logo since header is white

  const headerClass =
    variant === 'overlay'
      ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
      : 'sticky top-0 z-50 shadow-sm transition-all duration-300';

  const containerClass = 'shadow-sm'; // Always show shadow since it is white

  return (
    <>
      {/* Announcement Bar - Always show since background is solid */}
      {config?.announcement?.text?.trim() && (
        <div
          className="text-center py-2 text-sm font-medium text-white relative z-50"
          style={{ backgroundColor: theme.accent }}
        >
          {config.announcement.text}
        </div>
      )}

      {/* Main Header */}
      <header className={`${headerClass} ${containerClass}`} style={{ backgroundColor: headerBg }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" style={{ color: iconColor }} />
              ) : (
                <Menu className="h-6 w-6" style={{ color: iconColor }} />
              )}
            </button>

            {/* Logo */}
            <PreviewSafeLink to="/" isPreview={isPreview} className="flex items-center gap-2">
              {logo && (
                <img
                  src={logo}
                  alt={storeName}
                  className={`h-10 w-auto object-contain rounded px-2 py-1 ${logoBg}`}
                />
              )}
              <span className="text-xl font-bold" style={{ color: theme.primary }}>
                {storeName}
              </span>
            </PreviewSafeLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <PreviewSafeLink
                to="/"
                isPreview={isPreview}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                {t('home')}
              </PreviewSafeLink>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                {t('allProducts')}
              </PreviewSafeLink>
              {validCategories.slice(0, 4).map((cat) => {
                const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
                
                if (!title) return null;

                const slug = title.trim().toLowerCase().replace(/\s+/g, ' ');
                const encodedSlug = encodeURIComponent(slug).replace(/%20/g, '-');

                return (
                  <PreviewSafeLink
                    key={title}
                    to={`/category/${encodedSlug}`}
                    isPreview={isPreview}
                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                    style={{
                      color: currentCategory === title && !isTransparent ? theme.primary : textColor,
                    }}
                  >
                    {title}
                  </PreviewSafeLink>
                );
              })}
            </nav>

            {/* Search, Wishlist, Cart, Account */}
            <div className="flex items-center gap-2">
              <div className={isTransparent ? 'text-white' : ''}>
                <LanguageSelector className="mr-1" />
              </div>

              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-lg transition-colors ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                aria-label="Search"
              >
                <Search className="h-5 w-5" style={{ color: iconColor }} />
              </button>

              {/* Wishlist */}
              {!isPreview && (
                <PreviewSafeLink
                  to="/account/wishlist"
                  isPreview={isPreview}
                  className={`p-2 rounded-lg transition-colors relative ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <Heart className="h-5 w-5" style={{ color: iconColor }} />
                  {wishlistCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </PreviewSafeLink>
              )}

              {/* Cart */}
              <PreviewSafeLink
                to="/cart"
                isPreview={isPreview}
                className={`p-2 rounded-lg transition-colors relative ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <ShoppingCart className="h-5 w-5" style={{ color: iconColor }} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </PreviewSafeLink>

              {/* Account */}
              {!isPreview && (
                <Link
                  to="/account"
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  title={customer ? customer.name || customer.email || 'My Account' : 'Login'}
                >
                  {customer ? (
                    <>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium text-white"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                      </div>
                      <span
                        className="text-sm font-medium hidden md:block"
                        style={{ color: iconColor }}
                      >
                        {customer.name || customer.email?.split('@')[0] || 'Account'}
                      </span>
                    </>
                  ) : (
                    <User className="h-5 w-5" style={{ color: iconColor }} />
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar - Expandable */}
          {searchOpen && (
            <div className="py-3 border-t" style={{ borderColor: theme.muted + '30' }}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchProducts')}
                  className="w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.muted + '40',
                    backgroundColor: theme.background,
                    color: theme.text,
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: theme.primary, color: 'white' }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t shadow-lg"
            style={{
              backgroundColor: theme.headerBg,
              borderColor: theme.muted + '30',
            }}
          >
            <nav className="p-4 space-y-2">
              <PreviewSafeLink
                to="/"
                isPreview={isPreview}
                className="block px-4 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100"
                style={{ color: theme.text }}
              >
                {t('home')}
              </PreviewSafeLink>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="block px-4 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100"
                style={{ color: theme.text }}
              >
                {t('allProducts')}
              </PreviewSafeLink>
              {validCategories.map((cat) => {
                const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
                
                if (!title) return null;

                const slug = title.trim().toLowerCase().replace(/\s+/g, ' ');
                const encodedSlug = encodeURIComponent(slug).replace(/%20/g, '-');

                return (
                  <PreviewSafeLink
                    key={title}
                    to={`/category/${encodedSlug}`}
                    isPreview={isPreview}
                    className="block px-4 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100"
                    style={{ color: currentCategory === title ? theme.primary : theme.text }}
                  >
                    {title}
                  </PreviewSafeLink>
                );
              })}

              {!isPreview && (
                <>
                  <div className="border-t my-2" style={{ borderColor: theme.muted + '30' }} />
                  <Link
                    to="/account"
                    className="block px-4 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100"
                    style={{ color: theme.text }}
                  >
                    <span className="flex items-center gap-3">
                      {customer ? (
                        <>
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium text-white"
                            style={{ backgroundColor: theme.primary }}
                          >
                            {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                          </div>
                          <span>
                            {customer.name || customer.email?.split('@')[0] || t('myAccount')}
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5" />
                          {t('myAccount')}
                        </>
                      )}
                    </span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

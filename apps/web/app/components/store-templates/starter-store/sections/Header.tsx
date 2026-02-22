/**
 * Starter Store Header Component (Redesigned)
 *
 * A modern, mobile-first responsive header for the Starter Store template.
 * Features:
 * - Mobile: Hamburger menu, centered logo, cart icon, full-width search below
 * - Desktop: Sticky navbar with logo, wide search bar, nav links, cart & user icons
 * - Dismissible announcement banner
 * - Slide-out mobile drawer menu with overlay
 */

import { Link, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
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
  cartCount?: number;
  primaryColor?: string;
  accentColor?: string;
  announcementText?: string;
  showAnnouncement?: boolean;
  currency?: string;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories?: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  variant?: 'default' | 'overlay';
  customer?: { id: number; name: string | null; email: string | null } | null;
  themeColors?: StoreTemplateTheme;
}

export function StarterStoreHeader({
  storeName,
  logo,
  cartCount: propCartCount,
  primaryColor = '#4F46E5',
  accentColor = '#F59E0B',
  announcementText,
  showAnnouncement = false,
  currency = 'BDT',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Use real cart count in live mode, prop count or demo count in preview
  const realCartCount = useCartCount();
  const cartCount = isPreview ? (propCartCount ?? 3) : realCartCount;
  const { t } = useTranslation();

  const { count: wishlistCount } = useWishlist();

  const validCategories = categories.filter(Boolean).slice(0, 8);

  const getPreviewUrl = usePreviewUrl(isPreview);
  const navigate = useNavigate();

  // Resolve colors - prefer props, then theme, then defaults
  const resolvedPrimary = primaryColor || theme.primary || '#4F46E5';
  const resolvedAccent = accentColor || theme.accent || '#F59E0B';

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    const target = getPreviewUrl(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    navigate(target);
    setMobileMenuOpen(false);
  };

  // Announcement text - prefer prop, then config
  const displayAnnouncementText = announcementText || config?.announcement?.text?.trim();
  const shouldShowAnnouncement =
    (showAnnouncement || config?.announcement?.text?.trim()) && !announcementDismissed;

  // Nav links for desktop
  const navLinks = [
    { label: t('home'), to: '/' },
    { label: t('allProducts'), to: '/products' },
    { label: t('collections') || 'Collections', to: '/collections' },
  ];

  return (
    <>
      {/* Announcement Banner - Dismissible */}
      {shouldShowAnnouncement && displayAnnouncementText && (
        <div
          className="relative text-center py-2.5 px-4 text-sm font-medium text-white z-50"
          style={{ backgroundColor: resolvedPrimary }}
        >
          <span className="block pr-8">{displayAnnouncementText}</span>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Mobile Header */}
        <div className="lg:hidden">
          {/* Top bar: hamburger, logo, cart */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            {/* Logo / Store Name - Centered */}
            <PreviewSafeLink to="/" isPreview={isPreview} className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 w-auto object-contain" />
              ) : (
                <span
                  className="text-lg font-bold"
                  style={{ color: resolvedPrimary }}
                >
                  {storeName}
                </span>
              )}
            </PreviewSafeLink>

            {/* Cart Icon */}
            <PreviewSafeLink
              to="/cart"
              isPreview={isPreview}
              className="p-2 -mr-2 rounded-xl hover:bg-gray-100 transition-colors relative"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full text-white text-xs flex items-center justify-center font-semibold"
                  style={{ backgroundColor: resolvedAccent }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </PreviewSafeLink>
          </div>

          {/* Mobile Search Bar */}
          <div className="px-4 py-3 bg-gray-50">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchProducts') || 'Search products...'}
                className="w-full h-11 pl-4 pr-12 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                style={{ '--tw-ring-color': resolvedPrimary } as React.CSSProperties}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
                style={{ backgroundColor: resolvedPrimary }}
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16 gap-8">
              {/* Logo / Store Name */}
              <PreviewSafeLink
                to="/"
                isPreview={isPreview}
                className="flex items-center gap-3 flex-shrink-0"
              >
                {logo && (
                  <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
                )}
                <span
                  className="text-xl font-bold"
                  style={{ color: resolvedPrimary }}
                >
                  {storeName}
                </span>
              </PreviewSafeLink>

              {/* Search Bar - Wide, centered */}
              <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchProducts') || 'Search products...'}
                    className="w-full h-11 pl-5 pr-12 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:bg-white focus:border focus:border-gray-200 transition-all"
                    style={{ '--tw-ring-color': resolvedPrimary } as React.CSSProperties}
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: resolvedPrimary }}
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4 text-white" />
                  </button>
                </div>
              </form>

              {/* Nav Links + Actions */}
              <div className="flex items-center gap-1">
                {/* Navigation Links */}
                <nav className="flex items-center gap-1 mr-2">
                  {navLinks.map((link) => {
                    const isActive = currentCategory === link.label;
                    return (
                      <PreviewSafeLink
                        key={link.to}
                        to={link.to}
                        isPreview={isPreview}
                        className="px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100"
                        style={{
                          color: isActive ? resolvedPrimary : '#374151',
                          backgroundColor: isActive ? `${resolvedPrimary}10` : undefined,
                        }}
                      >
                        {link.label}
                      </PreviewSafeLink>
                    );
                  })}
                </nav>

                {/* Language Selector */}
                <div className="mr-1">
                  <LanguageSelector className="text-gray-600" />
                </div>

                {/* Wishlist */}
                {!isPreview && (
                  <PreviewSafeLink
                    to="/account/wishlist"
                    isPreview={isPreview}
                    className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative"
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5 text-gray-600" />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] flex items-center justify-center font-semibold"
                        style={{ backgroundColor: resolvedAccent }}
                      >
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                  </PreviewSafeLink>
                )}

                {/* Cart */}
                <PreviewSafeLink
                  to="/cart"
                  isPreview={isPreview}
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] flex items-center justify-center font-semibold"
                      style={{ backgroundColor: resolvedPrimary }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </PreviewSafeLink>

                {/* Account */}
                {!isPreview && (
                  <Link
                    to="/account"
                    className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                    title={customer ? customer.name || customer.email || 'My Account' : 'Login'}
                  >
                    {customer ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{ backgroundColor: resolvedPrimary }}
                      >
                        {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                      </div>
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl animate-slide-in-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
              <PreviewSafeLink
                to="/"
                isPreview={isPreview}
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {logo ? (
                  <img src={logo} alt={storeName} className="h-8 w-auto object-contain" />
                ) : (
                  <span className="text-lg font-bold" style={{ color: resolvedPrimary }}>
                    {storeName}
                  </span>
                )}
              </PreviewSafeLink>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-56px)]">
              {/* Main Nav Links */}
              {navLinks.map((link) => {
                const isActive = currentCategory === link.label;
                return (
                  <PreviewSafeLink
                    key={link.to}
                    to={link.to}
                    isPreview={isPreview}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors"
                    style={{
                      color: isActive ? resolvedPrimary : '#374151',
                      backgroundColor: isActive ? `${resolvedPrimary}10` : undefined,
                    }}
                  >
                    {link.label}
                  </PreviewSafeLink>
                );
              })}

              {/* Categories */}
              {validCategories.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 my-3" />
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t('categories')}
                  </p>
                  {validCategories.map((cat) => {
                    const title =
                      typeof cat === 'object' && cat !== null
                        ? (cat as StoreCategory).title
                        : (cat as string);

                    if (!title) return null;

                    const slug = title.trim().toLowerCase().replace(/\s+/g, ' ');
                    const encodedSlug = encodeURIComponent(slug).replace(/%20/g, '-');
                    const isActive = currentCategory === title;

                    return (
                      <PreviewSafeLink
                        key={title}
                        to={`/products/${encodedSlug}`}
                        isPreview={isPreview}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors"
                        style={{
                          color: isActive ? resolvedPrimary : '#374151',
                          backgroundColor: isActive ? `${resolvedPrimary}10` : undefined,
                        }}
                      >
                        {title}
                      </PreviewSafeLink>
                    );
                  })}
                </>
              )}

              {/* Language Selector */}
              <div className="h-px bg-gray-100 my-3" />
              <div className="px-4 py-2">
                <LanguageSelector />
              </div>

              {/* Account Section */}
              {!isPreview && (
                <>
                  <div className="h-px bg-gray-100 my-3" />
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {customer ? (
                      <>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{ backgroundColor: resolvedPrimary }}
                        >
                          {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <span>{customer.name || customer.email?.split('@')[0] || t('myAccount')}</span>
                      </>
                    ) : (
                      <>
                        <User className="h-5 w-5" />
                        <span>{t('myAccount')}</span>
                      </>
                    )}
                  </Link>

                  {/* Wishlist in mobile menu */}
                  <PreviewSafeLink
                    to="/account/wishlist"
                    isPreview={isPreview}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>{t('wishlist') || 'Wishlist'}</span>
                    {wishlistCount > 0 && (
                      <span
                        className="ml-auto px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                        style={{ backgroundColor: resolvedAccent }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </PreviewSafeLink>
                </>
              )}
            </nav>
          </div>
        </>
      )}

      {/* CSS for slide-in animation */}
      <style>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.25s ease-out;
        }
      `}</style>
    </>
  );
}

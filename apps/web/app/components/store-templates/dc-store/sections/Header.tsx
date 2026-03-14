/**
 * DC Store Header Component
 * 
 * Based on the original DC Store header design with golden gradient theme.
 * Features clean modern layout with warm colors and smooth animations.
 */

import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { useWishlist } from '~/hooks/useWishlist';
import { PreviewSafeLink, usePreviewUrl } from '~/components/PreviewSafeLink';
import { resolveDCStoreTheme } from '../theme';
import type { ThemeConfig, SocialLinks } from '@db/types';
import { useTranslation } from '~/contexts/LanguageContext';
import { LanguageSelector } from '../../shared/LanguageSelector';

import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';

interface DCStoreHeaderProps {
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

export function DCStoreHeader({
  storeName,
  logo,
  isPreview = false,
  categories = [],
  currentCategory,
  config,
  variant = 'default',
  customer,
  themeColors,
}: DCStoreHeaderProps) {
  const theme = resolveDCStoreTheme(config, themeColors);
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

  // Determine styles based on variant
  const isTransparent = false; // Always solid background
  const headerBg = theme.headerBg;
  const textColor = theme.text;
  const iconColor = theme.text;
  const logoBg = 'bg-transparent';

  const headerClass =
    variant === 'overlay'
      ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
      : 'sticky top-0 z-50 shadow-sm transition-all duration-300';

  const containerClass = 'shadow-sm';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    const target = getPreviewUrl(`/?search=${encodeURIComponent(trimmedQuery)}`);
    navigate(target);
  };

  return (
    <>
      {/* Announcement Bar */}
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
                {t('store.products')}
              </PreviewSafeLink>
              {validCategories.length > 0 && (
                <div className="relative group">
                  <button
                    className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
                    style={{ color: textColor }}
                  >
                    {t('store.categories')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {validCategories.map((cat, idx) => {
                        const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : cat;
                        const id = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).id : cat;
                        if (!title) return null;
                        return (
                          <PreviewSafeLink
                            key={id}
                            to={`/products/${encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                            isPreview={isPreview}
                            className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                            style={{ color: textColor }}
                          >
                            {title}
                          </PreviewSafeLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle search"
              >
                <Search className="h-5 w-5" style={{ color: iconColor }} />
              </button>

              {/* Wishlist */}
              {!isPreview && (
                <PreviewSafeLink
                  to="/wishlist"
                  isPreview={isPreview}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" style={{ color: iconColor }} />
                  {wishlistCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </PreviewSafeLink>
              )}

              {/* Account/Cart */}
              {customer ? (
                <div className="relative group hidden sm:block">
                  <button
                    className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                    aria-label="Account"
                  >
                    <User className="h-5 w-5" style={{ color: iconColor }} />
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium" style={{ color: textColor }}>
                          {customer.name}
                        </p>
                        <p className="text-xs" style={{ color: theme.muted }}>{customer.email}</p>
                      </div>
                      <Link to="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors" style={{ color: textColor }}>
                        Orders
                      </Link>
                      <Link to="/account/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors" style={{ color: textColor }}>
                        Profile
                      </Link>
                      <Link to="/logout" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors" style={{ color: theme.danger }}>
                        Logout
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                !isPreview && (
                  <PreviewSafeLink
                    to="/login"
                    isPreview={isPreview}
                    className="hidden sm:block px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: theme.primary, color: '#ffffff' }}
                  >
                    {t('login')}
                  </PreviewSafeLink>
                )
              )}

              {/* Cart */}
              {!isPreview && (
                <PreviewSafeLink
                  to="/cart"
                  isPreview={isPreview}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5" style={{ color: iconColor }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {cartCount}
                    </span>
                  )}
                </PreviewSafeLink>
              )}

              {/* Language Selector */}
              <LanguageSelector />
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="py-4 border-t border-gray-100">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('store.searchPlaceholder') || 'অনুসন্ধান করুন...'}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ 
                    borderColor: theme.border,
                    '--tw-ring-color': theme.primaryLight,
                  } as React.CSSProperties}
                />
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
                  style={{ backgroundColor: theme.primary }}
                >
                  {t('search')}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100">
            <div className="px-4 py-4 space-y-4">
              <PreviewSafeLink
                to="/"
                isPreview={isPreview}
                className="block text-base font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('home')}
              </PreviewSafeLink>
              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="block text-base font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('store.products')}
              </PreviewSafeLink>
              {validCategories.map((cat, idx) => {
                const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : cat;
                const id = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).id : cat;
                if (!title) return null;
                return (
                  <PreviewSafeLink
                    key={id}
                    to={`/products/${encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                    isPreview={isPreview}
                    className="block text-base font-medium hover:opacity-70 transition-opacity"
                    style={{ color: textColor }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {title}
                  </PreviewSafeLink>
                );
              })}
              {!customer && !isPreview && (
                <PreviewSafeLink
                  to="/login"
                  isPreview={isPreview}
                  className="block px-4 py-2 text-sm font-medium text-white rounded-lg transition hover:opacity-90 text-center"
                  style={{ backgroundColor: theme.primary }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('login')}
                </PreviewSafeLink>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

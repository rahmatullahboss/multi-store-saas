import React, { useState } from 'react';
import { Menu, X, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { Link } from '@remix-run/react';
import { LUXE_BOUTIQUE_THEME } from '../theme';
import { useTranslation } from '~/contexts/LanguageContext';
import { useCartCount } from '~/hooks/useCartCount';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { LanguageSelector } from '../../shared/LanguageSelector';
import type { ThemeConfig, SocialLinks } from '@db/types';
import type { StoreCategory } from '~/templates/store-registry';

interface LuxeBoutiqueHeaderProps {
  storeName: string;
  logo?: string | null;
  categories: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  config?: ThemeConfig | null;
  count?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  isPreview?: boolean;
  customer?: { id: number; name: string | null; email: string | null } | null;
}

export function LuxeBoutiqueHeader({
  storeName,
  logo,
  categories = [],
  currentCategory,
  count: countProp,
  mobileMenuOpen: mobileMenuOpenProp,
  setMobileMenuOpen: setMobileMenuOpenProp,
  searchOpen: searchOpenProp,
  setSearchOpen: setSearchOpenProp,
  isPreview,
  customer,
}: LuxeBoutiqueHeaderProps) {
  const { t } = useTranslation();
  const theme = LUXE_BOUTIQUE_THEME;

  // Local state for when props aren't provided (e.g. in StorePageWrapper)
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  const [localSearchOpen, setLocalSearchOpen] = useState(false);
  const cartCount = useCartCount();

  const mobileMenuOpen = mobileMenuOpenProp ?? localMobileMenuOpen;
  const setMobileMenuOpen = setMobileMenuOpenProp ?? setLocalMobileMenuOpen;
  const searchOpen = searchOpenProp ?? localSearchOpen;
  const setSearchOpen = setSearchOpenProp ?? setLocalSearchOpen;
  const count = countProp ?? cartCount;

  const validCategories = categories.filter(Boolean);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: theme.headerBg, borderColor: '#e5e5e5' }}
    >
      {/* Announcement Bar */}
      {/* Add logic if needed, passing via props if dynamic */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <PreviewSafeLink to="/" className="flex items-center gap-3" isPreview={isPreview}>
            {logo ? (
              <img
                src={logo}
                alt={storeName}
                className="h-10 lg:h-12 object-contain bg-white rounded px-2 py-1"
              />
            ) : null}
            <span
              className="text-xl lg:text-2xl font-semibold tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif", color: theme.primary }}
            >
              {storeName}
            </span>
          </PreviewSafeLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <PreviewSafeLink
              to="/"
              className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
              style={{
                color: !currentCategory ? theme.accent : theme.text,
                borderBottom: !currentCategory ? `2px solid ${theme.accent}` : 'none',
                paddingBottom: '4px',
              }}
              isPreview={isPreview}
            >
              {t('allProducts')}
            </PreviewSafeLink>
            {validCategories.slice(0, 5).map((cat) => {
              const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
              return (
                <PreviewSafeLink
                  key={title}
                  to={`/products/${encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                  className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                  style={{
                    color: currentCategory === title ? theme.accent : theme.text,
                    borderBottom: currentCategory === title ? `2px solid ${theme.accent}` : 'none',
                    paddingBottom: '4px',
                  }}
                  isPreview={isPreview}
                >
                  {title}
                </PreviewSafeLink>
              );
            })}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSelector className="mr-1" />
            </div>
            <button
              className="p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" style={{ color: theme.text }} />
            </button>
            <Link
              to="/account/wishlist"
              className="hidden sm:block p-2 rounded-full transition-colors hover:bg-gray-100"
            >
              <Heart className="w-5 h-5" style={{ color: theme.text }} />
            </Link>
            <PreviewSafeLink
              to="/cart"
              className="p-2 rounded-full transition-colors hover:bg-gray-100 relative"
              isPreview={isPreview}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: theme.text }} />
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: theme.accent, color: theme.primary }}
              >
                {count}
              </span>
            </PreviewSafeLink>
            {!isPreview && (
              <Link
                to="/account"
                className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full transition-colors hover:bg-gray-100"
                title={customer ? customer.name || customer.email || 'My Account' : 'Login'}
              >
                {customer ? (
                  <>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{ backgroundColor: theme.accent, color: theme.primary }}
                    >
                      {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <span
                      className="text-sm font-medium hidden md:block"
                      style={{ color: theme.text }}
                    >
                      {customer.name || customer.email?.split('@')[0] || 'Account'}
                    </span>
                  </>
                ) : (
                  <User className="w-5 h-5" style={{ color: theme.text }} />
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full bg-white border-b border-gray-200 py-4 px-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={t('searchProducts')}
              className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-black"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-lg">
          <nav className="py-4">
            <PreviewSafeLink
              to="/"
              className="block px-6 py-3 text-sm font-medium uppercase tracking-wide"
              style={{ color: !currentCategory ? theme.accent : theme.text }}
              onClick={() => setMobileMenuOpen(false)}
              isPreview={isPreview}
            >
              {t('allProducts')}
            </PreviewSafeLink>
            {validCategories.map((cat) => {
              const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
              return (
                <PreviewSafeLink
                  key={title}
                  to={`/products/${encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                  className="block px-6 py-3 text-sm font-medium uppercase tracking-wide"
                  style={{ color: currentCategory === title ? theme.accent : theme.text }}
                  onClick={() => setMobileMenuOpen(false)}
                  isPreview={isPreview}
                >
                  {title}
                </PreviewSafeLink>
              );
            })}
            {!isPreview && (
              <>
                <div className="border-t my-2 mx-6" style={{ borderColor: '#e5e5e5' }} />
                <Link
                  to="/account"
                  className="block px-6 py-3 text-sm font-medium uppercase tracking-wide"
                  style={{ color: theme.text }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    {customer ? (
                      <>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{ backgroundColor: theme.accent, color: theme.primary }}
                        >
                          {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <span>{customer.name || customer.email?.split('@')[0] || 'Account'}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        <span>Account</span>
                      </>
                    )}
                  </span>
                </Link>
              </>
            )}

            <div className="mt-4 px-6">
              <span className="text-sm font-medium text-gray-500 mb-2 block uppercase tracking-wider">
                Settings
              </span>
              <LanguageSelector />
            </div>
          </nav>
        </div>
      )}

      {/* Gold Accent Line */}
      <div className="h-0.5" style={{ backgroundColor: theme.accent }} />
    </header>
  );
}

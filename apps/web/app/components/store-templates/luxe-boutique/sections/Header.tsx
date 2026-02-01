import React, { useState } from 'react';
import { Menu, X, Search, Heart, ShoppingBag } from 'lucide-react';
import { LUXE_BOUTIQUE_THEME } from '../theme';
import { useTranslation } from '~/contexts/LanguageContext';
import { useCartCount } from '~/hooks/useCartCount';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { LanguageSelector } from '../../shared/LanguageSelector';
import type { ThemeConfig, SocialLinks } from '@db/types';

interface LuxeBoutiqueHeaderProps {
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  config?: ThemeConfig | null;
  count?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  isPreview?: boolean;
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

  const validCategories = categories.filter((c): c is string => Boolean(c));

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

          {/* Logo */}
          <PreviewSafeLink to="/" className="flex items-center" isPreview={isPreview}>
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 lg:h-12 object-contain bg-white rounded px-2 py-1" />
            ) : (
              <span 
                className="text-xl lg:text-2xl font-semibold tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif", color: theme.primary }}
              >
                {storeName}
              </span>
            )}
          </PreviewSafeLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <PreviewSafeLink 
              to="/"
              className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
              style={{ 
                color: !currentCategory ? theme.accent : theme.text,
                borderBottom: !currentCategory ? `2px solid ${theme.accent}` : 'none',
                paddingBottom: '4px'
              }}
              isPreview={isPreview}
            >
              {t('allProducts')}
            </PreviewSafeLink>
            {validCategories.slice(0, 5).map((category) => (
              <PreviewSafeLink
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                style={{ 
                  color: currentCategory === category ? theme.accent : theme.text,
                  borderBottom: currentCategory === category ? `2px solid ${theme.accent}` : 'none',
                  paddingBottom: '4px'
                }}
                isPreview={isPreview}
              >
                {category}
              </PreviewSafeLink>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <LanguageSelector className="mr-1" />
            <button 
              className="p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" style={{ color: theme.text }} />
            </button>
            <button className="hidden sm:block p-2 rounded-full transition-colors hover:bg-gray-100">
              <Heart className="w-5 h-5" style={{ color: theme.text }} />
            </button>
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
            {validCategories.map((category) => (
              <PreviewSafeLink
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="block px-6 py-3 text-sm font-medium uppercase tracking-wide"
                style={{ color: currentCategory === category ? theme.accent : theme.text }}
                onClick={() => setMobileMenuOpen(false)}
                isPreview={isPreview}
              >
                {category}
              </PreviewSafeLink>
            ))}
          </nav>
        </div>
      )}

      {/* Gold Accent Line */}
      <div className="h-0.5" style={{ backgroundColor: theme.accent }} />
    </header>
  );
}

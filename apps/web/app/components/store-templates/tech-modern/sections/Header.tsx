import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, X, Zap, ChevronRight } from 'lucide-react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { TECH_MODERN_THEME } from '../theme';
import { useCartCount } from '~/hooks/useCartCount';
import { useTranslation } from '~/contexts/LanguageContext';
import { LanguageSelector } from '../../shared/LanguageSelector';
import type { ThemeConfig } from '@db/types';

interface TechModernHeaderProps {
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  config?: ThemeConfig | null;
  count?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isPreview?: boolean;
}

export function TechModernHeader({
  storeName,
  logo,
  categories = [],
  currentCategory,
  config,
  count: countProp,
  mobileMenuOpen: mobileMenuOpenProp,
  setMobileMenuOpen: setMobileMenuOpenProp,
  searchQuery: searchQueryProp,
  setSearchQuery: setSearchQueryProp,
  isPreview,
}: TechModernHeaderProps) {
  const theme = TECH_MODERN_THEME;
  const { t } = useTranslation();

  // Local state for when props aren't provided (e.g. in StorePageWrapper)
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const cartCount = useCartCount();

  const mobileMenuOpen = mobileMenuOpenProp ?? localMobileMenuOpen;
  const setMobileMenuOpen = setMobileMenuOpenProp ?? setLocalMobileMenuOpen;
  const searchQuery = searchQueryProp ?? localSearchQuery;
  const setSearchQuery = setSearchQueryProp ?? setLocalSearchQuery;
  const count = countProp ?? cartCount;

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{ backgroundColor: theme.headerBg, borderColor: '#e2e8f0' }}
    >
      {/* Top Bar */}
      {config?.announcement?.text && (
        <div
          className="text-center py-2 text-sm font-medium"
          style={{ backgroundColor: theme.accent, color: 'white' }}
        >
          <Zap className="inline w-4 h-4 mr-2" />
          {config.announcement.link ? (
            <a href={config.announcement.link} className="hover:underline">
              {config.announcement.text}
            </a>
          ) : (
            config.announcement.text
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <PreviewSafeLink to="/" className="flex items-center flex-shrink-0" isPreview={isPreview}>
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 lg:h-10 object-contain bg-white rounded px-2 py-1" />
            ) : (
              <span
                className="text-xl lg:text-2xl font-bold flex items-center gap-2"
                style={{ color: theme.primary }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                {storeName}
              </span>
            )}
          </PreviewSafeLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <PreviewSafeLink
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: !currentCategory ? theme.accentLight : 'transparent',
                color: !currentCategory ? theme.accent : theme.text,
              }}
              isPreview={isPreview}
            >
              {t('allProducts')}
            </PreviewSafeLink>
            {validCategories.slice(0, 5).map((category) => (
              <PreviewSafeLink
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                style={{
                  backgroundColor: currentCategory === category ? theme.accentLight : 'transparent',
                  color: currentCategory === category ? theme.accent : theme.text,
                }}
                isPreview={isPreview}
              >
                {category}
              </PreviewSafeLink>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchProducts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <LanguageSelector className="mr-1" />

          {/* Cart Button */}
          <PreviewSafeLink
            to="/cart"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors"
            style={{ backgroundColor: theme.accent, color: 'white' }}
            isPreview={isPreview}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">{t('cart')}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{count}</span>
          </PreviewSafeLink>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchProducts')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Mobile Nav */}
          <nav className="py-2">
            <PreviewSafeLink
              to="/"
              className="flex items-center justify-between px-4 py-3 font-medium"
              style={{ color: !currentCategory ? theme.accent : theme.text }}
              onClick={() => setMobileMenuOpen(false)}
              isPreview={isPreview}
            >
              {t('allProducts')}
              <ChevronRight className="w-5 h-5" />
            </PreviewSafeLink>
            {validCategories.map((category) => (
              <PreviewSafeLink
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="flex items-center justify-between px-4 py-3 font-medium"
                style={{ color: currentCategory === category ? theme.accent : theme.text }}
                onClick={() => setMobileMenuOpen(false)}
                isPreview={isPreview}
              >
                {category}
                <ChevronRight className="w-5 h-5" />
              </PreviewSafeLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

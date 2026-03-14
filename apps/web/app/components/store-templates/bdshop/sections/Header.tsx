import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { useWishlist } from '~/hooks/useWishlist';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  User,
  ShoppingBag,
  Zap,
  ChevronDown,
  ChevronRight,
  Home as HomeIcon,
  Grid3X3,
} from 'lucide-react';
import { BDSHOP_THEME } from '../theme';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { LanguageSelector } from '../../shared/LanguageSelector';
// StoreCategory type removed - not exported from registry

import type { SocialLinks, ThemeConfig } from '@db/types';

interface BDShopHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | { title?: string } | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
}

export function BDShopHeader({
  storeName,
  logo,
  isPreview,
  categories = [],
  currentCategory,
}: BDShopHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const count = useCartCount();
  const { count: wishlistCount } = useWishlist();

  const featuredCategories = categories
    .map((category) => (typeof category === 'string' ? category : category?.title || null))
    .filter(Boolean)
    .slice(0, 12);

  return (
    <>
      {/* Top Bar - Desktop Only */}
      <div style={{ backgroundColor: BDSHOP_THEME.secondary }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-white/90">
          <div className="flex items-center gap-4">
            <span className="opacity-80">Welcome to {storeName}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {!isPreview && (
              <Link
                to="/auth/login"
                className="hover:text-white transition flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        style={{ backgroundColor: BDSHOP_THEME.cardBg }}
        className="sticky top-0 z-50 shadow-md border-b"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <PreviewSafeLink
            to="/"
            className="flex items-center gap-2 shrink-0"
            isPreview={isPreview}
          >
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-1">
                <div
                  className="h-10 w-10 rounded flex items-center justify-center"
                  style={{ backgroundColor: BDSHOP_THEME.primary }}
                >
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span
                  className="font-bold text-xl hidden sm:block"
                  style={{ color: BDSHOP_THEME.primary }}
                >
                  {storeName}
                </span>
              </div>
            )}
          </PreviewSafeLink>

          <div className="flex-1 max-w-2xl">
            <div className="relative flex">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full h-10 pl-4 pr-12 rounded-lg text-sm border border-gray-200 focus:outline-none"
                style={{ backgroundColor: '#F3F4F6' }}
              />
              <button
                className="absolute right-0 top-0 h-full px-4 rounded-r-lg text-white"
                style={{ backgroundColor: BDSHOP_THEME.primary }}
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <PreviewSafeLink
              to="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              isPreview={isPreview}
            >
              <ShoppingCart size={24} style={{ color: BDSHOP_THEME.text }} />
              <span
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: BDSHOP_THEME.accent }}
              >
                {count}
              </span>
            </PreviewSafeLink>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block border-t" style={{ backgroundColor: BDSHOP_THEME.cardBg }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center h-10 gap-6 text-sm">
            <PreviewSafeLink
              to="/"
              className="font-medium hover:text-blue-600 transition"
              style={{ color: BDSHOP_THEME.text }}
              isPreview={isPreview}
            >
              Home
            </PreviewSafeLink>
            <button
              onClick={() => setCategoryDrawerOpen(!categoryDrawerOpen)}
              className="font-medium hover:text-blue-600 transition flex items-center gap-1"
              style={{ color: BDSHOP_THEME.text }}
            >
              Categories
              <ChevronDown className="w-4 h-4" />
            </button>
            <PreviewSafeLink
              to="/?sale=true"
              className="font-medium transition"
              style={{ color: '#EF4444' }}
              isPreview={isPreview}
            >
              Sale
            </PreviewSafeLink>
            <PreviewSafeLink
              to="/about"
              className="font-medium hover:text-blue-600 transition"
              style={{ color: BDSHOP_THEME.text }}
              isPreview={isPreview}
            >
              About
            </PreviewSafeLink>
            <PreviewSafeLink
              to="/contact"
              className="font-medium hover:text-blue-600 transition"
              style={{ color: BDSHOP_THEME.text }}
              isPreview={isPreview}
            >
              Contact
            </PreviewSafeLink>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-14 shadow-lg z-40 max-h-[70vh] overflow-y-auto border-t">
            <div className="p-3 space-y-1 text-gray-800">
              <PreviewSafeLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_THEME.text }}
                isPreview={isPreview}
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </PreviewSafeLink>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCategoryDrawerOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50 text-left"
                style={{ color: BDSHOP_THEME.text }}
              >
                <Grid3X3 className="w-5 h-5" />
                Categories
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
              <PreviewSafeLink
                to="/?sale=true"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: '#EF4444' }}
                isPreview={isPreview}
              >
                <Zap className="w-5 h-5" />
                Sale
              </PreviewSafeLink>
              {!isPreview && (
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                  style={{ color: BDSHOP_THEME.text }}
                >
                  <User className="w-5 h-5" />
                  Login / Sign Up
                </Link>
              )}
            </div>
            <div className="p-3 border-t">
              <LanguageSelector />
            </div>
          </div>
        )}
      </header>

      {/* Category Drawer - Mobile/Desktop */}
      {categoryDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setCategoryDrawerOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-[70] shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-800">Shop by Category</h2>
              <button
                onClick={() => setCategoryDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2 text-gray-800">
              <PreviewSafeLink
                to="/"
                onClick={() => setCategoryDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                style={{
                  backgroundColor: !currentCategory ? `${BDSHOP_THEME.primary}10` : 'transparent',
                  color: !currentCategory ? BDSHOP_THEME.primary : BDSHOP_THEME.text,
                }}
                isPreview={isPreview}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">All Products</span>
              </PreviewSafeLink>
              {featuredCategories.map((category) => {
                const isActive = currentCategory === category;
                return (
                  <PreviewSafeLink
                    key={category!}
                    to={`/?category=${encodeURIComponent(category!)}`}
                    onClick={() => setCategoryDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                    style={{
                      backgroundColor: isActive ? `${BDSHOP_THEME.primary}10` : 'transparent',
                      color: isActive ? BDSHOP_THEME.primary : BDSHOP_THEME.text,
                    }}
                    isPreview={isPreview}
                  >
                    <Grid3X3
                      className="w-5 h-5"
                      style={{ color: isActive ? BDSHOP_THEME.primary : BDSHOP_THEME.muted }}
                    />
                    <span className="font-medium">{category}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </PreviewSafeLink>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

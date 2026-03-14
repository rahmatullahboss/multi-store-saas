/**
 * Daraz Header Component
 *
 * Header matching Daraz Bangladesh website with:
 * - Dark gray top utility bar
 * - Orange main header with logo, search, cart
 * - Mobile responsive menu
 */

import { Link } from 'react-router';
import { useState } from 'react';
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
  Headphones,
  Grid3X3,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { DARAZ_THEME } from '../theme';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { LanguageSelector } from '../../shared/LanguageSelector';
import type { SocialLinks, ThemeConfig } from '@db/types';
import type { StoreCategory } from '~/templates/store-registry';

interface DarazHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
}

export function DarazHeader({
  storeName,
  logo,
  isPreview = false,
  categories = [],
  currentCategory,
}: DarazHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const count = useCartCount();
  const { count: wishlistCount } = useWishlist();

  const featuredCategories = categories
    .map((category) => (typeof category === 'string' ? category : category?.title || null))
    .filter(Boolean)
    .slice(0, 12);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Utility Bar */}
      <div className="hidden md:block" style={{ backgroundColor: DARAZ_THEME.topBarBg }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8 text-xs text-white/90">
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">
              Save More on App
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Become a Seller
            </span>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSelector />
            <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              Help &amp; Support
            </span>
            {!isPreview && (
              <Link
                to="/auth/login"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: DARAZ_THEME.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 md:h-16 gap-3 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <PreviewSafeLink
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            isPreview={isPreview}
          >
            {logo ? (
              <img
                src={logo}
                alt={storeName}
                className="h-8 w-8 md:h-10 md:w-10 object-contain bg-white rounded"
              />
            ) : (
              <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded flex items-center justify-center">
                <ShoppingBag
                  className="w-5 h-5 md:w-6 md:h-6"
                  style={{ color: DARAZ_THEME.primary }}
                />
              </div>
            )}
            <span className="text-white font-bold text-lg md:text-xl hidden sm:block tracking-tight">
              {storeName}
            </span>
          </PreviewSafeLink>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 md:mx-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={`Search in ${storeName}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 md:h-10 pl-4 pr-12 rounded-l text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ backgroundColor: DARAZ_THEME.cardBg }}
              />
              <button
                type="submit"
                className="h-9 md:h-10 px-4 md:px-6 rounded-r font-medium text-white transition-all hover:opacity-90 cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: DARAZ_THEME.accent }}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Cart */}
            <PreviewSafeLink
              to="/cart"
              className="relative p-2 text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              aria-label="Cart"
              isPreview={isPreview}
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              <span
                className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 min-w-[18px] h-[18px] md:min-w-[20px] md:h-[20px] px-1 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold"
                style={{ backgroundColor: DARAZ_THEME.gold, color: DARAZ_THEME.text }}
              >
                {count}
              </span>
            </PreviewSafeLink>

            {/* Wishlist - Desktop only */}
            <button
              className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition-colors relative cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: DARAZ_THEME.gold, color: DARAZ_THEME.text }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User - Desktop only */}
            {!isPreview && (
              <Link
                to="/auth/login"
                className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                aria-label="Account"
              >
                <User className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-14 shadow-lg z-50 max-h-[75vh] overflow-y-auto">
            <div className="p-3 space-y-1">
              {/* All Categories */}
              <PreviewSafeLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                style={{
                  backgroundColor: !currentCategory ? `${DARAZ_THEME.primary}15` : 'transparent',
                  color: !currentCategory ? DARAZ_THEME.primary : DARAZ_THEME.text,
                }}
                isPreview={isPreview}
              >
                <ShoppingBag className="w-5 h-5" />
                All Categories
              </PreviewSafeLink>

              {/* Category Links */}
              {featuredCategories.map((category) => {
                const isActive = currentCategory === category;
                return (
                  <PreviewSafeLink
                    key={category!}
                    to={`/?category=${encodeURIComponent(category!)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isActive ? `${DARAZ_THEME.primary}15` : 'transparent',
                      color: isActive ? DARAZ_THEME.primary : DARAZ_THEME.text,
                    }}
                    isPreview={isPreview}
                  >
                    <Grid3X3 className="w-5 h-5 opacity-60" />
                    {category}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                  </PreviewSafeLink>
                );
              })}

              {/* Divider */}
              <div className="h-px bg-gray-200 my-2" />

              {/* Help & Support */}
              <a
                href="#support"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm cursor-pointer"
                style={{ color: DARAZ_THEME.textSecondary }}
              >
                <Headphones className="w-5 h-5" />
                Help &amp; Support
              </a>

              {/* Login */}
              {!isPreview && (
                <PreviewSafeLink
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm cursor-pointer"
                  style={{ color: DARAZ_THEME.textSecondary }}
                  isPreview={isPreview}
                >
                  <User className="w-5 h-5" />
                  Login / Sign Up
                </PreviewSafeLink>
              )}
              
              <div className="pt-2 border-t mt-2">
                 <LanguageSelector />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

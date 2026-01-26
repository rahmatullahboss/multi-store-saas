import { Link } from '@remix-run/react';
import React, { useState } from 'react';
import { Search, Menu, User, Heart, ShoppingCart, ChevronDown, Phone, Percent } from 'lucide-react';
import { FRESHNESS_THEME } from '../theme';
import { useTranslation } from '~/contexts/LanguageContext';
import { useCartCount } from '~/hooks/useCartCount';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';

interface FreshnessHeaderProps {
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  count?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  isScrolled?: boolean;
  businessInfo?: any;
  isPreview?: boolean;
}

export function FreshnessHeader({
  storeName,
  logo,
  categories = [],
  count: countProp,
  mobileMenuOpen: mobileMenuOpenProp,
  setMobileMenuOpen: setMobileMenuOpenProp,
  isScrolled = false,
  businessInfo,
  isPreview,
}: FreshnessHeaderProps) {
  const { t } = useTranslation();
  const theme = FRESHNESS_THEME;

  // Local state for when props aren't provided
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  const cartCount = useCartCount();

  const mobileMenuOpen = mobileMenuOpenProp ?? localMobileMenuOpen;
  const setMobileMenuOpen = setMobileMenuOpenProp ?? setLocalMobileMenuOpen;
  const count = countProp ?? cartCount;

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
      style={{
        backgroundColor: theme.headerBg,
        backdropFilter: 'blur(10px)',
        borderColor: theme.border,
        boxShadow: isScrolled ? theme.cardShadow : 'none',
      }}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-gray-800 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-8 h-8" />
        </button>

        {/* Logo */}
        <PreviewSafeLink
          to="/"
          className="text-2xl md:text-3xl lg:text-4xl font-bold italic shrink-0"
          style={{
            fontFamily: theme.fontHeading,
            color: theme.primary,
          }}
          isPreview={isPreview}
        >
          {logo ? <img src={logo} alt={storeName} className="h-10 object-contain" /> : storeName}
        </PreviewSafeLink>

        {/* Desktop Search */}
        <div
          className="hidden lg:flex flex-1 max-w-xl items-center border-2 rounded-full focus-within:border-amber-400 transition-all ml-4 overflow-hidden"
          style={{ borderColor: theme.border }}
        >
          <input
            type="text"
            placeholder={t('searchProducts') || 'Search for products...'}
            className="flex-1 px-5 py-2 outline-none text-gray-600 bg-transparent"
          />
          <button className="p-3 px-6 transition-colors" style={{ backgroundColor: theme.accent }}>
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* User Profile */}
          <PreviewSafeLink
            to={isPreview ? '#' : '/auth/login'}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:text-white transition-all cursor-pointer"
            style={{ '--hover-bg': theme.secondary } as any}
            isPreview={isPreview}
          >
            <User className="w-5 h-5" />
          </PreviewSafeLink>

          {/* Wishlist */}
          <div className="relative cursor-pointer hover:text-red-500 transition-colors">
            <Heart className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border text-white border-white bg-red-400">
              0
            </span>
          </div>

          {/* Cart */}
          <PreviewSafeLink
            to="/cart"
            className="relative cursor-pointer hover:text-green-600 transition-colors"
            isPreview={isPreview}
          >
            <ShoppingCart className="w-7 h-7" />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white"
                style={{ backgroundColor: theme.secondary }}
              >
                {count}
              </span>
            )}
          </PreviewSafeLink>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t bg-white" style={{ borderColor: theme.border }}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <ul className="flex items-center gap-8 font-semibold text-gray-700">
            <li className="py-5">
              <PreviewSafeLink
                to="/"
                className="flex items-center gap-1 hover:text-green-600 transition-colors"
                isPreview={isPreview}
              >
                {t('home') || 'Home'}
              </PreviewSafeLink>
            </li>
            <li className="py-5 group relative cursor-pointer">
              <span className="flex items-center gap-1 hover:text-green-600 transition-colors">
                {t('categories') || 'Categories'} <ChevronDown className="w-4 h-4" />
              </span>
              {/* Simple Dropdown for Categories */}
              <div
                className="absolute top-full left-0 min-w-[200px] bg-white shadow-xl border rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-50 p-2"
                style={{ borderColor: theme.border }}
              >
                {validCategories.map((cat) => (
                  <PreviewSafeLink
                    key={cat}
                    to={`/?category=${encodeURIComponent(cat)}`}
                    className="block py-2 px-3 text-sm rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50"
                    isPreview={isPreview}
                  >
                    {cat}
                  </PreviewSafeLink>
                ))}
              </div>
            </li>
            <li className="py-5">
              <PreviewSafeLink
                to="/about"
                className="hover:text-green-600 transition-colors"
                isPreview={isPreview}
              >
                About Us
              </PreviewSafeLink>
            </li>
            <li className="py-5">
              <PreviewSafeLink
                to="/contact"
                className="hover:text-green-600 transition-colors"
                isPreview={isPreview}
              >
                Contact
              </PreviewSafeLink>
            </li>
          </ul>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <Percent className="w-5 h-5 text-green-600" />
              <span>Weekly Discount!</span>
            </div>
            <div
              className="text-white px-5 py-2 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: theme.primary }}
            >
              <Phone className="w-5 h-5" />
              <div className="leading-tight">
                <p className="text-[10px] opacity-80 uppercase font-medium">Hotline</p>
                <p className="font-bold">{businessInfo?.phone || '+880 1234567890'}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

import { Link } from '@remix-run/react';
import React, { useState } from 'react';
import { Search, Menu, X, Heart, ShoppingBag, Sparkles, ChevronRight, Instagram, Facebook } from 'lucide-react';
import { AURORA_THEME } from '../theme';
import { useTranslation } from '~/contexts/LanguageContext';
import { useCartCount } from '~/hooks/useCartCount';
import { LanguageSelector } from '../../shared/LanguageSelector';

interface AuroraMinimalHeaderProps {
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  count?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  isScrolled?: boolean;
  announcement?: any;
  socialLinks?: any;
}

export function AuroraMinimalHeader({
  storeName,
  logo,
  categories = [],
  currentCategory,
  count: countProp,
  mobileMenuOpen: mobileMenuOpenProp,
  setMobileMenuOpen: setMobileMenuOpenProp,
  searchOpen: searchOpenProp,
  setSearchOpen: setSearchOpenProp,
  isScrolled: isScrolledProp = false,
  announcement,
  socialLinks,
}: AuroraMinimalHeaderProps) {
  const { t } = useTranslation();
  const theme = AURORA_THEME;
  const THEME_COLORS = {
    primary: theme.primary,
    text: theme.text,
    muted: theme.textMuted,
    cardBg: theme.cardBg,
  };

  // Local state for when props aren't provided (e.g. in StorePageWrapper)
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  const [localSearchOpen, setLocalSearchOpen] = useState(false);
  const cartCount = useCartCount();

  const mobileMenuOpen = mobileMenuOpenProp ?? localMobileMenuOpen;
  const setMobileMenuOpen = setMobileMenuOpenProp ?? setLocalMobileMenuOpen;
  const searchOpen = searchOpenProp ?? localSearchOpen;
  const setSearchOpen = setSearchOpenProp ?? setLocalSearchOpen;
  const count = countProp ?? cartCount;
  const isScrolled = isScrolledProp;

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{ 
        backgroundColor: isScrolled ? theme.headerBg : 'rgba(253, 251, 249, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isScrolled ? theme.headerShadow : 'none',
      }}
    >
      {/* Announcement Bar */}
      {announcement?.text && (
        <div 
          className="text-center py-2.5 text-sm font-medium"
          style={{ 
            background: theme.auroraGradient, 
            color: THEME_COLORS.primary 
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {announcement.link ? (
              <a href={announcement.link} className="hover:underline">
                {announcement.text}
              </a>
            ) : (
              announcement.text
            )}
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 -ml-2 rounded-xl transition-all"
            style={{ backgroundColor: isScrolled ? theme.backgroundAlt : 'transparent' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
            )}
          </button>

          {/* Left Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link 
              to="/"
              className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full"
              style={{ 
                color: !currentCategory ? THEME_COLORS.primary : THEME_COLORS.muted,
                backgroundColor: !currentCategory ? theme.auroraGradientSoft : 'transparent',
              }}
            >
              All Products
            </Link>
            {validCategories.slice(0, 3).map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full hover:opacity-70"
                style={{ 
                  color: currentCategory === category ? THEME_COLORS.primary : THEME_COLORS.muted,
                  backgroundColor: currentCategory === category ? theme.auroraGradientSoft : 'transparent',
                }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Logo (Centered) */}
          <Link to="/" className="flex items-center justify-center group">
            {logo ? (
              <img 
                src={logo} 
                alt={storeName} 
                className="h-10 lg:h-12 object-contain transition-transform duration-300 group-hover:scale-110" 
              />
            ) : (
              <span 
                className="text-2xl lg:text-3xl font-bold tracking-tight"
                style={{ 
                  fontFamily: theme.fontHeading, 
                  color: THEME_COLORS.primary 
                }}
              >
                {storeName}
              </span>
            )}
          </Link>

          {/* Right Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {validCategories.slice(3, 6).map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full hover:opacity-70"
                style={{ 
                  color: currentCategory === category ? THEME_COLORS.primary : THEME_COLORS.muted,
                  backgroundColor: currentCategory === category ? theme.auroraGradientSoft : 'transparent',
                }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1.5">
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>
            <button 
              className="p-2.5 rounded-full transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: isScrolled ? theme.backgroundAlt : 'rgba(0,0,0,0.03)' }}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
            </button>
            <button 
              className="hidden sm:flex p-2.5 rounded-full transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: isScrolled ? theme.backgroundAlt : 'rgba(0,0,0,0.03)' }}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
            </button>
            <Link 
              to="/cart" 
              className="p-2.5 rounded-full transition-all duration-300 hover:scale-110 relative"
              style={{ backgroundColor: isScrolled ? theme.backgroundAlt : 'rgba(0,0,0,0.03)' }}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
              {count > 0 && (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ 
                    background: theme.auroraGradient, 
                    color: THEME_COLORS.primary 
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div 
          className="absolute inset-x-0 top-full py-6 px-4 animate-fadeIn"
          style={{ 
            backgroundColor: THEME_COLORS.cardBg,
            boxShadow: theme.headerShadow
          }}
        >
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME_COLORS.muted }} />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 focus:outline-none transition-all"
              style={{ 
                borderColor: theme.border,
                fontFamily: theme.fontBody,
                backgroundColor: theme.backgroundAlt
              }}
              autoFocus
            />
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => setSearchOpen(false)}
            >
              <X className="w-5 h-5" style={{ color: THEME_COLORS.muted }} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-[64px] z-40 animate-slideIn overflow-y-auto"
          style={{ backgroundColor: THEME_COLORS.cardBg }}
        >
          <nav className="py-6 px-4 space-y-2">
            <Link 
              to="/"
              className="flex items-center justify-between px-5 py-4 rounded-2xl font-semibold transition-all"
              style={{ 
                background: !currentCategory ? theme.auroraGradientSoft : 'transparent',
                color: !currentCategory ? THEME_COLORS.primary : THEME_COLORS.text 
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="uppercase tracking-wider text-sm">All Products</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            {validCategories.map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="flex items-center justify-between px-5 py-4 rounded-2xl font-semibold transition-all"
                style={{ 
                  background: currentCategory === category ? theme.auroraGradientSoft : 'transparent',
                  color: currentCategory === category ? THEME_COLORS.primary : THEME_COLORS.text 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="uppercase tracking-wider text-sm">{category}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            ))}
            <div className="mt-2 pt-4 border-t" style={{ borderColor: theme.border }}>
               <LanguageSelector />
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="px-4 py-6 border-t" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-center gap-4">
              {socialLinks?.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full transition-all hover:scale-110"
                  style={{ background: theme.auroraGradientSoft }}
                >
                  <Instagram className="w-5 h-5" style={{ color: THEME_COLORS.primary }} />
                </a>
              )}
              {socialLinks?.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full transition-all hover:scale-110"
                  style={{ background: theme.auroraGradientSoft }}
                >
                  <Facebook className="w-5 h-5" style={{ color: THEME_COLORS.primary }} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aurora Gradient Line */}
      <div 
        className="h-[3px] w-full transition-opacity duration-500"
        style={{ 
          background: theme.auroraGradient,
          opacity: isScrolled ? 0 : 1
        }} 
      />
    </header>
  );
}

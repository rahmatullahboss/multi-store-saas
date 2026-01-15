import { Link } from '@remix-run/react';
import React, { useState } from 'react';
import { ShoppingBasket, Search, Menu, X, Heart, Leaf, ChevronRight } from 'lucide-react';
import { ARTISAN_MARKET_THEME } from '../theme';
import { useTranslation } from '~/contexts/LanguageContext';
import { useCartCount } from '~/hooks/useCartCount';

interface ArtisanMarketHeaderProps {
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  config?: any;
  count?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export function ArtisanMarketHeader({
  storeName,
  logo,
  categories = [],
  currentCategory,
  config,
  count: countProp,
  mobileMenuOpen: mobileMenuOpenProp,
  setMobileMenuOpen: setMobileMenuOpenProp,
}: ArtisanMarketHeaderProps) {
  const { t } = useTranslation();
  const theme = ARTISAN_MARKET_THEME;

  // Local state for when props aren't provided (e.g. in StorePageWrapper)
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  const cartCount = useCartCount();

  const mobileMenuOpen = mobileMenuOpenProp ?? localMobileMenuOpen;
  const setMobileMenuOpen = setMobileMenuOpenProp ?? setLocalMobileMenuOpen;
  const count = countProp ?? cartCount;

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header 
      className="sticky top-0 z-50"
      style={{ backgroundColor: theme.headerBg }}
    >
      {/* Announcement Bar */}
      {config?.announcement?.text && (
        <div 
          className="text-center py-2.5 text-sm font-medium"
          style={{ backgroundColor: theme.accentLight, color: theme.accent }}
        >
          <Leaf className="inline w-4 h-4 mr-2" />
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
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 -ml-2 rounded-full hover:bg-amber-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 lg:h-12 object-contain" />
            ) : (
              <span 
                className="text-2xl lg:text-3xl font-semibold"
                style={{ fontFamily: "'Newsreader', serif", color: theme.primary }}
              >
                {storeName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link 
              to="/"
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ 
                backgroundColor: !currentCategory ? theme.accentLight : 'transparent',
                color: !currentCategory ? theme.accent : theme.text,
              }}
            >
              All Products
            </Link>
            {validCategories.slice(0, 5).map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-amber-50"
                style={{ 
                  backgroundColor: currentCategory === category ? theme.accentLight : 'transparent',
                  color: currentCategory === category ? theme.accent : theme.text,
                }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full transition-colors hover:bg-amber-50">
              <Search className="w-5 h-5" style={{ color: theme.text }} />
            </button>
            <button className="hidden sm:block p-2.5 rounded-full transition-colors hover:bg-amber-50">
              <Heart className="w-5 h-5" style={{ color: theme.text }} />
            </button>
            <Link 
              to="/cart" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-colors"
              style={{ backgroundColor: theme.accent, color: 'white' }}
            >
              <ShoppingBasket className="w-5 h-5" />
              <span className="hidden sm:inline">Basket</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{count}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Border */}
      <div className="h-1 w-full" style={{ 
        background: `linear-gradient(90deg, transparent 0%, ${theme.accent}40 50%, transparent 100%)` 
      }} />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-amber-50" style={{ borderColor: '#e7e5e4' }}>
          <nav className="py-4 px-4 space-y-1">
            <Link 
              to="/"
              className="flex items-center justify-between px-4 py-3 rounded-xl font-medium"
              style={{ 
                backgroundColor: !currentCategory ? theme.accentLight : 'transparent',
                color: !currentCategory ? theme.accent : theme.text 
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              All Products
              <ChevronRight className="w-5 h-5" />
            </Link>
            {validCategories.map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl font-medium"
                style={{ 
                  backgroundColor: currentCategory === category ? theme.accentLight : 'transparent',
                  color: currentCategory === category ? theme.accent : theme.text 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {category}
                <ChevronRight className="w-5 h-5" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

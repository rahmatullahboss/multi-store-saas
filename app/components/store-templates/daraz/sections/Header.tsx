import { Link } from '@remix-run/react';
import { useState } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { useTranslation } from '~/contexts/LanguageContext';
import { useWishlist } from '~/hooks/useWishlist';
import { Menu, X, Search, ShoppingCart, Heart, User, ShoppingBag, Headphones } from 'lucide-react';
import { DARAZ_THEME } from '../theme';

import type { SocialLinks, ThemeConfig } from '@db/types';
import { Grid3X3, ChevronRight } from 'lucide-react';

interface DarazHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
}

export function DarazHeader({ storeName, logo, isPreview, categories = [], currentCategory }: DarazHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const count = useCartCount();
  const { count: wishlistCount } = useWishlist();

  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <>
      {/* Top Bar */}
      <div style={{ backgroundColor: DARAZ_THEME.topBarBg }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-white/90">
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition">Save More on App</span>
            <span className="hover:text-white cursor-pointer transition">Become a Seller</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" />
              Help & Support
            </span>
            {!isPreview && (
              <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: DARAZ_THEME.primary }} className="sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-10 object-contain bg-white rounded" />
            ) : (
              <div className="h-10 w-10 bg-white rounded flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" style={{ color: DARAZ_THEME.primary }} />
              </div>
            )}
            <span className="text-white font-bold text-xl hidden sm:block">{storeName}</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={`Search in ${storeName}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 rounded-l text-sm border-0 focus:outline-none"
                style={{ backgroundColor: DARAZ_THEME.cardBg }}
              />
              <button className="h-10 px-6 rounded-r font-medium text-white transition hover:opacity-90" style={{ backgroundColor: '#E04E05' }}>
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-white hover:bg-white/10 rounded transition flex items-center gap-1">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#FFD700', color: DARAZ_THEME.text }}>
                {count}
              </span>
            </Link>
            <button className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition relative">
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#FFD700', color: DARAZ_THEME.text }}>
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-16 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-2 text-gray-800">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                style={{ 
                  backgroundColor: currentCategory ? 'transparent' : `${DARAZ_THEME.primary}15`, 
                  color: currentCategory ? DARAZ_THEME.text : DARAZ_THEME.primary 
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                All Categories
              </Link>
              {featuredCategories.map((category) => {
                const isActive = currentCategory === category;
                return (
                  <Link
                    key={category!}
                    to={`?category=${encodeURIComponent(category!)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition"
                    style={{ 
                      backgroundColor: isActive ? `${DARAZ_THEME.primary}15` : 'transparent', 
                      color: isActive ? DARAZ_THEME.primary : DARAZ_THEME.text 
                    }}
                  >
                    <Grid3X3 className="w-5 h-5" />
                    {category}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

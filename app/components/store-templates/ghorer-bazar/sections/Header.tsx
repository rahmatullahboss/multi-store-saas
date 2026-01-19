/**
 * GhorerBazar Header Component
 * 
 * Features:
 * - Announcement bar with phone number
 * - Clean white header with centered logo
 * - Mobile-first hamburger menu
 * - Search overlay
 * - Cart icon with badge
 * - Categories navigation bar
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Menu, X, Phone, ChevronDown,
  User, Heart, MapPin, Truck, RotateCcw, Shield
} from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { GHORER_BAZAR_THEME, GHORER_BAZAR_FONTS } from '../theme';
import type { ThemeConfig, SocialLinks } from '@db/types';

interface GhorerBazarHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
}

export function GhorerBazarHeader({ 
  storeName, 
  logo, 
  isPreview, 
  categories = [], 
  currentCategory, 
  businessInfo,
  config 
}: GhorerBazarHeaderProps) {
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const count = useCartCount();
  const theme = GHORER_BAZAR_THEME;

  // Handle scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const validCategories = categories.filter(Boolean) as string[];

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Announcement Bar */}
      <div 
        className="text-white text-sm py-2.5"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-white/90">
            <a 
              href={`tel:${businessInfo?.phone || '+8801700000000'}`}
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{businessInfo?.phone || '০১৭XX-XXXXXX'}</span>
            </a>
            <span className="hidden md:flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>ফ্রি ডেলিভারি ১০০০৳+</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/90 text-xs">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              ১০০% অরিজিনাল
            </span>
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              ইজি রিটার্ন
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className="sticky top-0 z-50 transition-shadow duration-300"
        style={{ 
          backgroundColor: theme.headerBg,
          boxShadow: isScrolled ? theme.shadowMd : 'none',
          fontFamily: GHORER_BAZAR_FONTS.body,
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Menu & Search (Mobile) */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" style={{ color: theme.text }} />
              </button>
            </div>

            {/* Left: Search (Desktop) */}
            <div className="hidden md:flex items-center flex-1">
              <form onSubmit={handleSearch} className="relative w-full max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য খুঁজুন..."
                  className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  style={{ fontSize: '14px' }}
                />
                <button 
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white transition hover:opacity-90"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Center: Logo */}
            <Link 
              to="/" 
              className="flex items-center justify-center px-4"
            >
              {logo ? (
                <img 
                  src={logo} 
                  alt={storeName} 
                  className="h-10 md:h-12 w-auto object-contain"
                />
              ) : (
                <span 
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: theme.primary, fontFamily: GHORER_BAZAR_FONTS.heading }}
                >
                  {storeName}
                </span>
              )}
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center gap-1 md:gap-3 flex-1 justify-end">
              {/* Search (Mobile) */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition md:hidden"
                aria-label="Search"
              >
                <Search className="w-5 h-5" style={{ color: theme.text }} />
              </button>

              {/* Wishlist (Desktop) */}
              <Link 
                to="/wishlist"
                className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" style={{ color: theme.text }} />
              </Link>

              {/* Account (Desktop) */}
              <Link 
                to="/account"
                className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Account"
              >
                <User className="w-5 h-5" style={{ color: theme.text }} />
              </Link>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="p-2 hover:bg-gray-100 rounded-lg transition relative"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" style={{ color: theme.text }} />
                {count > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Navigation (Desktop) */}
        <nav 
          className="hidden md:block border-t"
          style={{ borderColor: theme.borderLight }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-1 py-2 overflow-x-auto scrollbar-hide">
              <Link 
                to="/"
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  !currentCategory 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={!currentCategory ? { backgroundColor: theme.primary } : {}}
              >
                সব পণ্য
              </Link>
              {validCategories.slice(0, 8).map((category) => (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    currentCategory === category 
                      ? 'text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={currentCategory === category ? { backgroundColor: theme.primary } : {}}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-white overflow-y-auto"
            style={{ fontFamily: GHORER_BAZAR_FONTS.body }}
          >
            {/* Drawer Header */}
            <div 
              className="sticky top-0 flex items-center justify-between p-4 text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <span className="font-bold text-lg">{storeName}</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Actions */}
            <div className="p-4 border-b" style={{ borderColor: theme.borderLight }}>
              <Link 
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <User className="w-5 h-5" style={{ color: theme.primary }} />
                <span className="font-medium">আমার অ্যাকাউন্ট</span>
              </Link>
              <Link 
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <Truck className="w-5 h-5" style={{ color: theme.primary }} />
                <span className="font-medium">আমার অর্ডার</span>
              </Link>
            </div>

            {/* Categories */}
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                ক্যাটাগরি
              </h3>
              <div className="space-y-1">
                <Link 
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition ${
                    !currentCategory 
                      ? 'text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={!currentCategory ? { backgroundColor: theme.primary } : {}}
                >
                  সব পণ্য
                </Link>
                {validCategories.map((category) => (
                  <Link
                    key={category}
                    to={`?category=${encodeURIComponent(category)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition ${
                      currentCategory === category 
                        ? 'text-white' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={currentCategory === category ? { backgroundColor: theme.primary } : {}}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Links */}
            <div className="p-4 border-t" style={{ borderColor: theme.borderLight }}>
              <Link 
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-600 hover:text-gray-900 transition"
              >
                যোগাযোগ
              </Link>
              <Link 
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-600 hover:text-gray-900 transition"
              >
                সাধারণ জিজ্ঞাসা
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay (Mobile) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] bg-white md:hidden">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য খুঁজুন..."
                  autoFocus
                  className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-400"
                  style={{ fontFamily: GHORER_BAZAR_FONTS.body }}
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Search className="w-5 h-5" style={{ color: theme.primary }} />
                </button>
              </div>
              <button 
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </form>
          </div>

          {/* Quick Search Suggestions */}
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500 mb-2">জনপ্রিয় সার্চ</p>
            <div className="flex flex-wrap gap-2">
              {['মধু', 'খেজুর', 'বাদাম', 'তেল', 'মশলা'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    window.location.href = `/?search=${encodeURIComponent(term)}`;
                  }}
                  className="px-3 py-1.5 rounded-full text-sm border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

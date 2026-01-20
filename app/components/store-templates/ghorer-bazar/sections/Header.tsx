/**
 * GhorerBazar Header Component
 * 
 * Features:
 * - Slim announcement bar with Bangla text & phone/WhatsApp
 * - Orange sticky header
 * - Left: Logo + brand name
 * - Center: Horizontal mega menu with categories
 * - Right: Search, Account, Cart icons
 * - Mobile: Hamburger menu
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Menu, X, Phone, User, ChevronDown,
  MessageCircle
} from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { GHORER_BAZAR_THEME, GHORER_BAZAR_FONTS, GHORER_BAZAR_CATEGORIES } from '../theme';
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
  onCartClick?: () => void;
}

export function GhorerBazarHeader({ 
  storeName, 
  logo, 
  isPreview, 
  categories = [], 
  currentCategory,
  socialLinks,
  businessInfo,
  config,
  onCartClick,
}: GhorerBazarHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const count = useCartCount();
  const theme = GHORER_BAZAR_THEME;

  // Use provided categories or fallback to default grocery categories
  const menuCategories = categories.filter(Boolean).length > 0 
    ? categories.filter(Boolean) as string[]
    : GHORER_BAZAR_CATEGORIES;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const phoneNumber = businessInfo?.phone || '০১৭XX-XXXXXX';
  const whatsappNumber = socialLinks?.whatsapp || phoneNumber;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Announcement Bar - Slim with phone/WhatsApp */}
      <div 
        className="py-2 text-xs md:text-sm"
        style={{ 
          backgroundColor: theme.secondary,
          color: theme.textWhite,
          fontFamily: GHORER_BAZAR_FONTS.body,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p className="hidden md:block text-white/90">
            🎉 সারাদেশে ফ্রি ডেলিভারি ১০০০৳+ অর্ডারে | ১০০% খাঁটি পণ্যের নিশ্চয়তা
          </p>
          <p className="md:hidden text-white/90 text-center flex-1">
            ১০০% খাঁটি পণ্যের নিশ্চয়তা
          </p>
          <div className="flex items-center gap-4">
            <a 
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{phoneNumber}</span>
            </a>
            <a 
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header - Orange */}
      <header 
        className="sticky top-0 z-50"
        style={{ 
          backgroundColor: theme.headerBg,
          fontFamily: GHORER_BAZAR_FONTS.body,
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                {logo ? (
                  <img 
                    src={logo} 
                    alt={storeName} 
                    className="h-8 md:h-10 w-auto"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-lg md:text-xl">🏪</span>
                    </div>
                    <span 
                      className="text-lg md:text-xl font-bold text-white hidden sm:block"
                      style={{ fontFamily: GHORER_BAZAR_FONTS.heading }}
                    >
                      {storeName}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Center: Desktop Navigation - Horizontal Category Menu */}
            <nav className="hidden lg:flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {menuCategories.map((category) => (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category)}`}
                  className={`px-2 py-2 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
                    currentCategory === category 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/90 hover:text-white hover:border-white'
                  }`}
                >
                  {category}
                </Link>
              ))}
            </nav>

            {/* Right: Icons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account - Desktop only */}
              <Link 
                to="?page=account"
                className="hidden md:flex p-2 text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <button 
                onClick={onCartClick}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition relative"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {count > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1"
                    style={{ 
                      backgroundColor: theme.secondary,
                      color: theme.textWhite,
                    }}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[300px] bg-white overflow-y-auto"
            style={{ fontFamily: GHORER_BAZAR_FONTS.body }}
          >
            {/* Drawer Header */}
            <div 
              className="sticky top-0 flex items-center justify-between p-4"
              style={{ backgroundColor: theme.primary }}
            >
              <span className="font-bold text-lg text-white">{storeName}</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search in Mobile */}
            <div className="p-4 border-b" style={{ borderColor: theme.border }}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="পণ্য খুঁজুন..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: theme.border,
                      focusRing: theme.primary,
                    }}
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  >
                    <Search className="w-5 h-5" style={{ color: theme.primary }} />
                  </button>
                </div>
              </form>
            </div>

            {/* Categories */}
            <div className="p-4">
              <h3 
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: theme.textMuted }}
              >
                ক্যাটাগরি
              </h3>
              <div className="space-y-1">
                <Link 
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                    !currentCategory 
                      ? 'text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={!currentCategory ? { backgroundColor: theme.primary } : {}}
                >
                  সব পণ্য
                </Link>
                {menuCategories.map((category) => (
                  <Link
                    key={category}
                    to={`?category=${encodeURIComponent(category)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg font-medium transition ${
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

            {/* Account Links */}
            <div className="p-4 border-t" style={{ borderColor: theme.border }}>
              <Link 
                to="?page=account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                <User className="w-5 h-5" style={{ color: theme.primary }} />
                আমার অ্যাকাউন্ট
              </Link>
              <a 
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
                WhatsApp অর্ডার
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200]">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSearchOpen(false)}
          />
          <div 
            className="absolute top-0 left-0 right-0 bg-white p-4 shadow-lg"
            style={{ fontFamily: GHORER_BAZAR_FONTS.body }}
          >
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="পণ্য খুঁজুন... (যেমন: মধু, খেজুর, বাদাম)"
                    autoFocus
                    className="w-full pl-4 pr-12 py-3 rounded-lg border-2 focus:outline-none text-lg"
                    style={{ borderColor: theme.primary }}
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Popular Searches */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">জনপ্রিয় সার্চ:</p>
                <div className="flex flex-wrap gap-2">
                  {['সুন্দরবনের মধু', 'মরিয়ম খেজুর', 'কাঠবাদাম', 'সরিষার তেল', 'গাওয়া ঘি'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term);
                        window.location.href = `?search=${encodeURIComponent(term)}`;
                      }}
                      className="px-3 py-1.5 text-sm rounded-full border hover:border-orange-400 hover:bg-orange-50 transition"
                      style={{ borderColor: theme.border }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

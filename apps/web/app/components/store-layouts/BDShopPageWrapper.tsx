/**
 * BDShopPageWrapper Component
 * 
 * Provides template-consistent header, footer, and styling wrapper
 * for non-homepage store pages (cart, product detail, checkout, etc.)
 * using BDShop design language.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  X,
  Home as HomeIcon,
  Grid3X3,
  UserCircle,
  Phone,
  Mail,
  Facebook,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import type { SocialLinks } from '@db/types';

// Theme colors
const BDSHOP_NAVY = '#1E3A8A';
const BDSHOP_NAVY_DARK = '#1E3A5F';
const BDSHOP_ORANGE = '#F97316';
const BDSHOP_GREEN = '#059669';
const BDSHOP_BG = '#F9FAFB';
const BDSHOP_TEXT = '#424242';
const BDSHOP_TEXT_LIGHT = '#6B7280';
const BDSHOP_CARD_BG = '#FFFFFF';
const BDSHOP_FOOTER_BG = '#0F172A';

interface BDShopPageWrapperProps {
  children: ReactNode;
  storeName: string;
  storeId: number;
  logo?: string | null;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  cartCount?: number;
  categories?: (string | null)[];
  currentCategory?: string | null;
  breadcrumb?: { label: string; href?: string }[];
  pageTitle?: string;
  showBreadcrumbBanner?: boolean;
}

export function BDShopPageWrapper({
  children,
  storeName,
  storeId,
  logo,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  cartCount = 0,
  categories = [],
  currentCategory,
  breadcrumb = [],
  pageTitle,
  showBreadcrumbBanner = false,
}: BDShopPageWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const featuredCategories = categories.filter(Boolean).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0" style={{ backgroundColor: BDSHOP_BG, fontFamily: "'Inter', 'NotoSans', Arial, sans-serif" }}>
      {/* Top Bar - Desktop Only */}
      <div style={{ backgroundColor: BDSHOP_NAVY_DARK }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-white/90">
          <div className="flex items-center gap-4">
            <span className="opacity-80">আসসালামু আলাইকুম</span>
            <span className="text-yellow-400 text-[10px] bg-yellow-400/20 px-2 py-0.5 rounded">Beta Version</span>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks?.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            )}
            <span className="opacity-50">|</span>
            <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Account
            </Link>
            <Link to="/cart" className="hover:text-white transition flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              My Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: BDSHOP_CARD_BG }} className="sticky top-0 z-50 shadow-md border-b">
        <div className="max-w-7xl mx-auto px-3 md:px-4 flex items-center h-14 md:h-16 gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" style={{ color: BDSHOP_TEXT }} /> : <Menu className="h-6 w-6" style={{ color: BDSHOP_TEXT }} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded flex items-center justify-center" style={{ backgroundColor: BDSHOP_NAVY }}>
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="font-bold text-lg md:text-xl hidden sm:block" style={{ color: BDSHOP_NAVY }}>{storeName}</span>
              </div>
            )}
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 md:h-10 pl-4 pr-12 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                style={{ backgroundColor: '#F3F4F6' }}
              />
              <button 
                className="absolute right-0 top-0 h-full px-3 md:px-4 rounded-r-lg text-white transition hover:opacity-90"
                style={{ backgroundColor: BDSHOP_NAVY }}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Cart - Desktop */}
          <Link
            to="/cart"
            className="hidden md:flex relative p-2 hover:bg-gray-100 rounded-lg transition items-center gap-1"
          >
            <ShoppingCart className="h-6 w-6" style={{ color: BDSHOP_TEXT }} />
            <span 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: BDSHOP_ORANGE }}
            >
              {cartCount}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block border-t" style={{ backgroundColor: BDSHOP_CARD_BG }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center h-10 gap-6 text-sm">
            <Link to="/" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>Home</Link>
            <Link to="/?sale=true" className="font-medium transition" style={{ color: '#EF4444' }}>Sale</Link>
            <Link to="/about" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>About</Link>
            <Link to="/contact" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>Contact</Link>
            <Link to="/track" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>Track Order</Link>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-14 shadow-lg z-40 max-h-[70vh] overflow-y-auto border-t">
            <div className="p-3 space-y-1">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_TEXT }}
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </Link>
              <Link 
                to="/?sale=true"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: '#EF4444' }}
              >
                Sale
              </Link>
              <Link 
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_TEXT }}
              >
                <ShoppingCart className="w-5 h-5" />
                My Cart
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-2 md:py-3">
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm overflow-x-auto">
              <Link to="/" className="text-gray-500 hover:text-blue-600 transition shrink-0">Home</Link>
              {breadcrumb.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5 shrink-0">
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                  {item.href ? (
                    <Link to={item.href} className="text-gray-500 hover:text-blue-600 transition">{item.label}</Link>
                  ) : (
                    <span style={{ color: BDSHOP_TEXT }}>{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Page Title Banner */}
      {showBreadcrumbBanner && pageTitle && (
        <div style={{ backgroundColor: BDSHOP_NAVY }} className="py-4 md:py-6">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-white text-xl md:text-2xl font-bold">{pageTitle}</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: BDSHOP_FOOTER_BG }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-12">
          {/* Logo and Description */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12 mb-8 pb-8 border-b border-white/10">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-3">
                {logo ? (
                  <img src={logo} alt={storeName} className="h-10 object-contain" />
                ) : (
                  <div className="h-10 w-10 rounded bg-white flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6" style={{ color: BDSHOP_NAVY }} />
                  </div>
                )}
                <span className="text-white font-bold text-xl">{storeName}</span>
              </div>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                Your premier destination for quality electronics and gadgets. We deliver excellence in every product.
              </p>
              {businessInfo?.phone && (
                <div className="flex items-center gap-2 mt-3 text-white/80 text-sm">
                  <Phone className="w-4 h-4" />
                  {businessInfo.phone}
                </div>
              )}
              {businessInfo?.email && (
                <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                  <Mail className="w-4 h-4" />
                  {businessInfo.email}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 flex-1">
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold mb-3 text-sm">Quick Links</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li><Link to="/" className="text-white/70 hover:text-white transition">Home</Link></li>
                  <li><Link to="/shop" className="text-white/70 hover:text-white transition">Shop</Link></li>
                  <li><Link to="/about" className="text-white/70 hover:text-white transition">About Us</Link></li>
                  <li><Link to="/contact" className="text-white/70 hover:text-white transition">Contact</Link></li>
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h3 className="text-white font-bold mb-3 text-sm">Customer Service</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li><Link to="/faq" className="text-white/70 hover:text-white transition">FAQ</Link></li>
                  <li><Link to="/shipping" className="text-white/70 hover:text-white transition">Shipping Info</Link></li>
                  <li><Link to="/returns" className="text-white/70 hover:text-white transition">Returns & Refunds</Link></li>
                  <li><Link to="/track" className="text-white/70 hover:text-white transition">Track Order</Link></li>
                </ul>
              </div>

              {/* Categories */}
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-white font-bold mb-3 text-sm">Categories</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  {featuredCategories.slice(0, 5).map(cat => (
                    <li key={cat}>
                      <Link to={`?category=${encodeURIComponent(cat!)}`} className="text-white/70 hover:text-white transition">
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Social & Payment */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Follow Us</span>
              <div className="flex gap-2">
                {socialLinks?.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                     className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {socialLinks?.whatsapp && (
                  <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                     className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Secure Payment:</span>
              <div className="flex gap-1.5">
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/80">bKash</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/80">Nagad</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/80">COD</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-xs" suppressHydrationWarning>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <HomeIcon className="w-5 h-5" style={{ color: BDSHOP_TEXT_LIGHT }} />
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_TEXT_LIGHT }}>Home</span>
          </Link>
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <Grid3X3 className="w-5 h-5" style={{ color: BDSHOP_TEXT_LIGHT }} />
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_TEXT_LIGHT }}>Categories</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: BDSHOP_TEXT_LIGHT }} />
            <span 
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: BDSHOP_ORANGE }}
            >
              {cartCount}
            </span>
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_TEXT_LIGHT }}>Cart</span>
          </Link>
          <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <UserCircle className="w-5 h-5" style={{ color: BDSHOP_TEXT_LIGHT }} />
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_TEXT_LIGHT }}>Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

// Export theme colors for use in components
export const BDSHOP_THEME = {
  navy: BDSHOP_NAVY,
  navyDark: BDSHOP_NAVY_DARK,
  orange: BDSHOP_ORANGE,
  green: BDSHOP_GREEN,
  bg: BDSHOP_BG,
  text: BDSHOP_TEXT,
  textLight: BDSHOP_TEXT_LIGHT,
  cardBg: BDSHOP_CARD_BG,
  footerBg: BDSHOP_FOOTER_BG,
};

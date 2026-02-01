/**
 * Daraz Page Wrapper Component
 * 
 * Provides Daraz-consistent header, footer, and styling wrapper
 * for non-homepage store pages (cart, product detail, checkout, etc.)
 * Mobile responsive design matching Daraz Bangladesh
 */

import type { ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { useState } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { 
  Menu, X, Search, ShoppingCart, Heart, User, 
  ChevronRight, Headphones, ShoppingBag 
} from 'lucide-react';
import type { SocialLinks } from '@db/types';

// Daraz brand colors (matching DarazTemplate.tsx)
const DARAZ_ORANGE = '#F85606';
const DARAZ_ORANGE_HOVER = '#E04E05';
const DARAZ_BG = '#F5F5F5';
const DARAZ_TEXT = '#424242';
const DARAZ_TEXT_LIGHT = '#999999';
const DARAZ_CARD_BG = '#FFFFFF';
const DARAZ_TOP_BAR_BG = '#2E2E2E';

interface DarazPageWrapperProps {
  children: ReactNode;
  storeName: string;
  storeId: number;
  logo?: string | null;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
}

export function DarazPageWrapper({
  children,
  storeName,
  logo,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  categories = [],
}: DarazPageWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const count = useCartCount();
  
  const featuredCategories = categories.filter(Boolean).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: DARAZ_BG, fontFamily: "'Roboto', 'NotoSans', Arial, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: DARAZ_TOP_BAR_BG }} className="hidden md:block">
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
            <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Login / Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: DARAZ_ORANGE }} className="sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 md:h-16 gap-3 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 w-8 md:h-10 md:w-10 object-contain bg-white rounded" />
            ) : (
              <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" style={{ color: DARAZ_ORANGE }} />
              </div>
            )}
            <span className="text-white font-bold text-lg md:text-xl hidden sm:block">{storeName}</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-2 md:mx-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={`Search in ${storeName}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 md:h-10 pl-3 md:pl-4 pr-10 md:pr-12 rounded-l text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ backgroundColor: DARAZ_CARD_BG }}
              />
              <button 
                className="h-9 md:h-10 px-4 md:px-6 rounded-r font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: DARAZ_ORANGE_HOVER }}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 md:gap-3">
            <Link
              to="/cart"
              className="relative p-2 text-white hover:bg-white/10 rounded transition flex items-center gap-1"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              <span 
                className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-4 w-4 md:h-5 md:w-5 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold"
                style={{ backgroundColor: '#FFD700', color: DARAZ_TEXT }}
              >
                {count}
              </span>
            </Link>
            <button className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition">
              <Heart className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-14 shadow-lg z-50 max-h-[70vh] overflow-y-auto">
            <div className="p-3 space-y-1">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm"
                style={{ backgroundColor: `${DARAZ_ORANGE}10`, color: DARAZ_ORANGE }}
              >
                <ShoppingBag className="w-4 h-4" />
                Homepage
              </Link>
              <Link 
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm"
                style={{ color: DARAZ_TEXT }}
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Link>
              {featuredCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category!)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition hover:bg-gray-50"
                  style={{ color: DARAZ_TEXT }}
                >
                  <ChevronRight className="w-4 h-4" style={{ color: DARAZ_TEXT_LIGHT }} />
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {/* Customer Care */}
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm" style={{ color: DARAZ_TEXT }}>Customer Care</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
                <li><Link to="/help" className="hover:text-orange-500 transition">Help Center</Link></li>
                <li><Link to="/returns" className="hover:text-orange-500 transition">Returns & Refunds</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500 transition">Contact Us</Link></li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm" style={{ color: DARAZ_TEXT }}>{storeName}</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
                <li><Link to="/about" className="hover:text-orange-500 transition">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-orange-500 transition">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold mb-3 md:mb-4 text-sm" style={{ color: DARAZ_TEXT }}>Contact</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
                {businessInfo?.phone && <li className="flex items-center gap-2">📞 {businessInfo.phone}</li>}
                {businessInfo?.email && <li className="flex items-center gap-2">📧 {businessInfo.email}</li>}
                {businessInfo?.address && <li className="flex items-start gap-2">📍 {businessInfo.address}</li>}
              </ul>
            </div>

            {/* Payment Methods */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold mb-3 md:mb-4 text-sm" style={{ color: DARAZ_TEXT }}>Payment Methods</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <span className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 rounded text-[10px] md:text-xs font-medium">bKash</span>
                <span className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 rounded text-[10px] md:text-xs font-medium">Nagad</span>

                <span className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 rounded text-[10px] md:text-xs font-medium">COD</span>
              </div>
              
              {/* Social Links */}
              {(socialLinks?.facebook || socialLinks?.instagram || socialLinks?.whatsapp) && (
                <div className="mt-3 md:mt-4">
                  <h4 className="font-medium mb-2 text-xs md:text-sm" style={{ color: DARAZ_TEXT }}>Follow Us</h4>
                  <div className="flex gap-2 md:gap-3">
                    {socialLinks?.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                         className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:opacity-80 transition">
                        <span className="text-xs md:text-sm font-bold">f</span>
                      </a>
                    )}
                    {socialLinks?.instagram && (
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                         className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white hover:opacity-80 transition">
                        <span className="text-xs md:text-sm font-bold">IG</span>
                      </a>
                    )}
                    {socialLinks?.whatsapp && (
                      <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                         className="w-7 h-7 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:opacity-80 transition">
                        <span className="text-xs md:text-sm font-bold">W</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t text-center">
            <p className="text-xs md:text-sm" style={{ color: DARAZ_TEXT_LIGHT }} suppressHydrationWarning>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Export theme colors for use in product/cart pages
export const DARAZ_THEME = {
  orange: DARAZ_ORANGE,
  orangeHover: DARAZ_ORANGE_HOVER,
  bg: DARAZ_BG,
  text: DARAZ_TEXT,
  textLight: DARAZ_TEXT_LIGHT,
  cardBg: DARAZ_CARD_BG,
  topBarBg: DARAZ_TOP_BAR_BG,
};

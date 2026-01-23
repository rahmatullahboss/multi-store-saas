/**
 * GhorerBazarPageWrapper Component
 * 
 * Provides template-consistent header, footer, and styling wrapper
 * for non-homepage store pages (cart, product detail, checkout, etc.)
 * using GhorerBazar design language.
 */

import type { ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { useState } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Phone, 
  HelpCircle, 
  Facebook, 
  Instagram, 
  MessageCircle 
} from 'lucide-react';
import type { SocialLinks } from '@db/types';

interface GhorerBazarPageWrapperProps {
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

// Theme colors
const primaryColor = '#F28C38';
const redDiscount = '#E53935';

export function GhorerBazarPageWrapper({
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
}: GhorerBazarPageWrapperProps) {
  const count = useCartCount();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top Bar - Orange */}
      <div 
        className="text-white text-center py-2 text-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{businessInfo?.phone || '০১XXX-XXXXXX'}</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>হেল্প ডেস্ক</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Search Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Logo - Centered */}
            <Link to="/" className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  {storeName}
                </span>
              )}
            </Link>

            {/* User & Cart Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <User className="h-5 w-5 text-gray-600" />
              </button>
              <Link 
                to="/cart" 
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: redDiscount }}
                  id="cart-count"
                >
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        {categories.length > 0 && (
          <nav className="bg-gray-100 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-4 overflow-x-auto py-3 scrollbar-hide">
                <Link
                  to="/"
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    !currentCategory 
                      ? 'text-white' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  style={!currentCategory ? { backgroundColor: primaryColor } : {}}
                >
                  সব প্রোডাক্ট
                </Link>
                {categories.filter(Boolean).map((category) => (
                  <Link
                    key={category}
                    to={`/?category=${encodeURIComponent(category!)}`}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      currentCategory === category 
                        ? 'text-white' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    style={currentCategory === category ? { backgroundColor: primaryColor } : {}}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Breadcrumb Banner */}
      {showBreadcrumbBanner && (
        <div 
          className="py-6 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="max-w-7xl mx-auto px-4">
            {pageTitle && (
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{pageTitle}</h1>
            )}
            {breadcrumb.length > 0 && (
              <nav className="flex items-center gap-2 text-sm text-white/90">
                <Link to="/" className="hover:underline">Home</Link>
                {breadcrumb.map((item, index) => (
                  <span key={index} className="flex items-center gap-2">
                    <span>›</span>
                    {item.href ? (
                      <Link to={item.href} className="hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {logo ? (
                  <img src={logo} alt={storeName} className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: primaryColor }}>
                    {storeName}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                আমরা সেরা মানের পণ্য সেরা দামে সরবরাহ করি। আপনার সন্তুষ্টি আমাদের অঙ্গীকার।
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primaryColor }}>COMPANY</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>

            {/* Quick Help */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primaryColor }}>QUICK HELP</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/returns" className="text-gray-600 hover:text-gray-900">Return Policy</Link></li>
                <li><Link to="/refund" className="text-gray-600 hover:text-gray-900">Refund Policy</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primaryColor }}>CONTACT</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {businessInfo?.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {businessInfo.phone}
                  </li>
                )}
                {businessInfo?.email && (
                  <li>📧 {businessInfo.email}</li>
                )}
                {businessInfo?.address && (
                  <li>📍 {businessInfo.address}</li>
                )}
              </ul>
              
              {/* Social Links */}
              {(socialLinks?.facebook || socialLinks?.instagram || socialLinks?.whatsapp) && (
                <div className="flex gap-3 mt-4">
                  {socialLinks?.facebook && (
                    <a 
                      href={socialLinks.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80 transition"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {socialLinks?.instagram && (
                    <a 
                      href={socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:opacity-80 transition"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {socialLinks?.whatsapp && (
                    <a 
                      href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar - Orange */}
        <div 
          className="text-white py-4"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
            <p suppressHydrationWarning>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {socialLinks?.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      {socialLinks?.whatsapp && (
        <a
          href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition z-50"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Export theme colors for use in components
export const GHORER_BAZAR_THEME = {
  primaryColor,
  redDiscount,
  cyanBadge: '#00BCD4',
};

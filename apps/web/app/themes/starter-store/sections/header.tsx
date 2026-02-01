/**
 * Header Section
 *
 * Shopify OS 2.0 Compatible Section
 * Main navigation header with logo, menu, search, wishlist, account, and cart.
 */

import { useState } from 'react';
import { Link } from '@remix-run/react';
import { ShoppingCart, Search, Menu, X, Heart, User, Globe } from 'lucide-react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { useLanguage } from '~/contexts/LanguageContext';
import { useCartCount } from '~/hooks/useCartCount';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Header',
  tag: 'header',
  class: 'site-header',
  limit: 1,

  enabled_on: {
    groups: ['header'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_logo',
      label: 'Logo',
    },
    {
      type: 'image_picker',
      id: 'logo',
      label: 'Logo image',
    },
    {
      type: 'range',
      id: 'logo_width',
      min: 50,
      max: 200,
      step: 10,
      default: 120,
      unit: 'px',
      label: 'Logo width',
    },
    {
      type: 'header',
      id: 'header_navigation',
      label: 'Navigation',
    },
    {
      type: 'link_list',
      id: 'menu',
      label: 'Main menu',
    },
    {
      type: 'checkbox',
      id: 'show_search',
      label: 'Show search icon',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_wishlist',
      label: 'Show wishlist icon',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_account',
      label: 'Show account icon',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_language_switcher',
      label: 'Show language switcher',
      default: false,
    },
    {
      type: 'checkbox',
      id: 'show_cart',
      label: 'Show cart icon',
      default: true,
    },
    {
      type: 'header',
      id: 'header_colors',
      label: 'Colors',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#ffffff',
    },
    {
      type: 'color',
      id: 'text_color',
      label: 'Text color',
      default: '#111827',
    },
    {
      type: 'color',
      id: 'accent_color',
      label: 'Accent/Badge color',
      default: '#f59e0b',
    },
    {
      type: 'checkbox',
      id: 'sticky',
      label: 'Sticky header',
      default: true,
    },
  ],

  presets: [
    {
      name: 'Header',
      category: 'Header',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface HeaderSettings {
  logo?: string;
  logo_width: number;
  menu?: string;
  show_search: boolean;
  show_wishlist: boolean;
  show_account: boolean;
  show_language_switcher: boolean;
  show_cart: boolean;
  background_color: string;
  text_color: string;
  accent_color: string;
  sticky: boolean;
}

export default function Header({ section, context, settings }: SectionComponentProps) {
  const {
    logo,
    logo_width = 120,
    show_search = true,
    show_wishlist = true,
    show_account = true,
    show_language_switcher = false,
    show_cart = true,
    background_color = '#ffffff',
    text_color = '#111827',
    accent_color = '#f59e0b',
    sticky = true,
  } = settings as unknown as HeaderSettings;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const { lang, setLang, t } = useLanguage();

  const storeName = context.store?.name || 'Store';
  const categories = context.collections?.map((c) => c.title).filter(Boolean) || [];
  // Use useCartCount hook for reactive cart count from localStorage
  // Falls back to context.cart.itemCount for server-side rendering
  const hookCartCount = useCartCount();
  const cartCount = hookCartCount || context.cart?.itemCount || 0;
  const wishlistCount = context.wishlist?.count || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`z-50 shadow-sm ${sticky ? 'sticky top-0' : ''}`}
        style={{ backgroundColor: background_color }}
        data-section-id={section.id}
        data-section-type="header"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Menu Button + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:opacity-70 transition"
                aria-label={t('openMenu')}
              >
                <Menu className="w-6 h-6" style={{ color: text_color }} />
              </button>

              <Link to="/" className="flex items-center gap-3">
                {logo || context.store?.logo ? (
                  <img
                    src={logo || context.store?.logo || ''}
                    alt={storeName}
                    className="h-8 w-auto object-contain"
                    style={{ maxWidth: `${logo_width}px` }}
                  />
                ) : null}
                <span className="text-xl font-bold" style={{ color: text_color }}>
                  {storeName}
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium hover:opacity-70 transition"
                style={{ color: text_color }}
              >
                {t('home')}
              </Link>
              <Link
                to="/products"
                className="text-sm font-medium hover:opacity-70 transition"
                style={{ color: text_color }}
              >
                {t('allProducts')}
              </Link>
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat}
                  to={`/collections/${encodeURIComponent(cat.toLowerCase())}`}
                  className="text-sm font-medium hover:opacity-70 transition"
                  style={{ color: text_color }}
                >
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              {show_language_switcher && (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="p-2 hover:opacity-70 transition flex items-center gap-1"
                    aria-label={t('changeLanguage')}
                  >
                    <Globe className="w-5 h-5" style={{ color: text_color }} />
                    <span
                      className="text-xs font-medium hidden xl:inline"
                      style={{ color: text_color }}
                    >
                      {lang === 'en' ? 'English' : 'বাংলা'}
                    </span>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <button
                        onClick={() => {
                          setLang('en');
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${lang === 'en' ? 'font-medium bg-gray-100' : ''}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => {
                          setLang('bn');
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${lang === 'bn' ? 'font-medium bg-gray-100' : ''}`}
                      >
                        বাংলা
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Search */}
              {show_search && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 hover:opacity-70 transition"
                  aria-label={t('searchProducts')}
                >
                  <Search className="w-5 h-5" style={{ color: text_color }} />
                </button>
              )}

              {/* Wishlist */}
              {show_wishlist && (
                <Link
                  to="/wishlist"
                  className="p-2 hover:opacity-70 transition relative hidden md:block"
                  aria-label={t('viewWishlist')}
                >
                  <Heart className="w-5 h-5" style={{ color: text_color }} />
                  {wishlistCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: accent_color }}
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Account */}
              {show_account && (
                <Link
                  to="/auth/login"
                  className="p-2 hover:opacity-70 transition hidden md:block"
                  aria-label={t('viewAccount')}
                >
                  <User className="w-5 h-5" style={{ color: text_color }} />
                </Link>
              )}

              {/* Cart */}
              {show_cart && (
                <Link
                  to="/cart"
                  className="p-2 hover:opacity-70 transition relative"
                  aria-label={t('viewCart')}
                >
                  <ShoppingCart className="w-5 h-5" style={{ color: text_color }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 rounded-full text-xs flex items-center justify-center px-1 font-bold"
                      style={{ backgroundColor: accent_color, color: '#ffffff' }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 p-6 overflow-y-auto"
            style={{ backgroundColor: background_color }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold" style={{ color: text_color }}>
                {storeName}
              </span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" style={{ color: text_color }} />
              </button>
            </div>

            <nav className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-2 font-medium border-b"
                style={{
                  color: text_color,
                  borderColor: context.theme?.colors?.border || '#e5e7eb',
                }}
              >
                {t('home')}
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-2 font-medium border-b"
                style={{
                  color: text_color,
                  borderColor: context.theme?.colors?.border || '#e5e7eb',
                }}
              >
                {t('allProducts')}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/collections/${encodeURIComponent(cat.toLowerCase())}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-2 border-b"
                  style={{
                    color: text_color,
                    borderColor: context.theme?.colors?.border || '#e5e7eb',
                  }}
                >
                  {cat}
                </Link>
              ))}
            </nav>

            <div className="mt-8 space-y-2">
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-2"
                style={{ color: text_color }}
              >
                <Heart className="w-5 h-5" />
                <span>
                  {t('wishlist')} ({wishlistCount})
                </span>
              </Link>
              <Link
                to="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-2"
                style={{ color: text_color }}
              >
                <User className="w-5 h-5" />
                <span>{t('account')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div
            className="absolute top-0 left-0 right-0 p-4"
            style={{ backgroundColor: background_color }}
          >
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search') + '...'}
                autoFocus
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  borderColor: context.theme?.colors?.border || '#e5e7eb',
                  backgroundColor: context.theme?.colors?.background || '#f9fafb',
                  color: text_color,
                }}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: accent_color }}
              >
                <Search className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="p-3">
                <X className="w-5 h-5" style={{ color: text_color }} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

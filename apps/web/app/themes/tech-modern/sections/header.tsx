/**
 * Tech Modern - Header Section
 *
 * Clean, modern header with:
 * - Zap icon branding
 * - Blue accent announcement bar
 * - Rounded search input
 * - Modern cart button
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { Search, ShoppingBag, Menu, X, Zap, ChevronRight, Heart, User } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Header',
  tag: 'header',
  class: 'tech-header',
  limit: 1,

  enabled_on: {
    templates: ['index', 'product', 'collection', 'cart', 'page', 'search', 'checkout'],
    groups: ['header'],
  },

  settings: [
    {
      type: 'header',
      id: 'announcement_header',
      label: 'Announcement Bar',
    },
    {
      type: 'checkbox',
      id: 'show_announcement',
      label: 'Show announcement bar',
      default: false,
    },
    {
      type: 'text',
      id: 'announcement_text',
      label: 'Announcement text',
      default: '',
    },
    {
      type: 'url',
      id: 'announcement_link',
      label: 'Announcement link',
    },
    {
      type: 'header',
      id: 'navigation_header',
      label: 'Navigation',
    },
    {
      type: 'checkbox',
      id: 'show_search',
      label: 'Show search bar',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_cart',
      label: 'Show cart button',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_wishlist',
      label: 'Show wishlist button',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_account',
      label: 'Show account button',
      default: true,
    },
  ],

  presets: [
    {
      name: 'Tech Header',
      category: 'Header',
      settings: {
        show_announcement: false,
        announcement_text: '',
        show_search: true,
        show_cart: true,
      },
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface HeaderSettings {
  show_announcement: boolean;
  announcement_text: string;
  announcement_link?: string;
  show_search: boolean;
  show_cart: boolean;
  show_wishlist: boolean;
  show_account: boolean;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentLight: '#dbeafe',
  background: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  headerBg: '#ffffff',
  border: '#e2e8f0',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TechHeader({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as HeaderSettings;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { store, collections = [], getLink, cart, wishlist } = context;
  const cartCount = cart?.itemCount || 0;
  const wishlistCount = wishlist?.count || 0;

  const categories = collections
    .map((c: { title?: string }) => c.title)
    .filter((t): t is string => Boolean(t))
    .slice(0, 5);

  return (
    <header data-section-id={section.id} className="sticky top-0 z-50">
      {/* Announcement Bar */}
      {config.show_announcement && config.announcement_text && (
        <div
          className="text-center py-2 text-sm font-medium"
          style={{ backgroundColor: THEME.accent, color: 'white' }}
        >
          <Zap className="inline w-4 h-4 mr-2" />
          {config.announcement_link ? (
            <a
              href={getLink?.(config.announcement_link) || config.announcement_link}
              className="hover:underline"
            >
              {config.announcement_text}
            </a>
          ) : (
            config.announcement_text
          )}
        </div>
      )}

      {/* Main Header */}
      <div
        className="border-b shadow-sm"
        style={{ backgroundColor: THEME.headerBg, borderColor: THEME.border }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <a href={getLink?.('/') || '/'} className="flex items-center flex-shrink-0 gap-3">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-8 lg:h-10 object-contain" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: THEME.accent }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl lg:text-2xl font-bold" style={{ color: THEME.primary }}>
                {store.name}
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <a
                href={getLink?.('/') || '/'}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                style={{ color: THEME.text }}
              >
                All Products
              </a>
              {categories.map((category) => (
                <a
                  key={category}
                  href={getLink?.(`/collections/${category}`) || '#'}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: THEME.text }}
                >
                  {category}
                </a>
              ))}
            </nav>

            {/* Search Bar */}
            {config.show_search && (
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: THEME.border,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Account Button */}
              {config.show_account && (
                <a
                  href={getLink?.('/auth/login') || '/auth/login'}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border transition-colors hover:bg-gray-100"
                  style={{ borderColor: THEME.border }}
                  title="Account"
                >
                  <User className="w-5 h-5" style={{ color: THEME.text }} />
                </a>
              )}

              {/* Wishlist Button */}
              {config.show_wishlist && (
                <a
                  href={getLink?.('/wishlist') || '/wishlist'}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border transition-colors hover:bg-gray-100 relative"
                  style={{ borderColor: THEME.border }}
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" style={{ color: THEME.text }} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </a>
              )}

              {/* Cart Button */}
              {config.show_cart && (
                <a
                  href={getLink?.('/cart') || '/cart'}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors"
                  style={{ backgroundColor: THEME.accent, color: 'white' }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                      {cartCount}
                    </span>
                  )}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t absolute w-full left-0 shadow-lg"
          style={{ backgroundColor: THEME.headerBg, borderColor: THEME.border }}
        >
          {/* Mobile Search */}
          {config.show_search && (
            <div className="p-4 border-b" style={{ borderColor: THEME.border }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none"
                  style={{ borderColor: THEME.border }}
                />
              </div>
            </div>
          )}

          {/* Mobile Nav */}
          <nav className="py-2">
            <a
              href={getLink?.('/') || '/'}
              className="flex items-center justify-between px-4 py-3 font-medium"
              style={{ color: THEME.text }}
              onClick={() => setMobileMenuOpen(false)}
            >
              All Products
              <ChevronRight className="w-5 h-5" />
            </a>
            {categories.map((category) => (
              <a
                key={category}
                href={getLink?.(`/collections/${category}`) || '#'}
                className="flex items-center justify-between px-4 py-3 font-medium"
                style={{ color: THEME.text }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {category}
                <ChevronRight className="w-5 h-5" />
              </a>
            ))}
          </nav>

          {/* Mobile Account & Wishlist */}
          {(config.show_account || config.show_wishlist) && (
            <div className="border-t py-2" style={{ borderColor: THEME.border }}>
              {config.show_account && (
                <a
                  href={getLink?.('/auth/login') || '/auth/login'}
                  className="flex items-center gap-3 px-4 py-3 font-medium"
                  style={{ color: THEME.text }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Account
                </a>
              )}
              {config.show_wishlist && (
                <a
                  href={getLink?.('/wishlist') || '/wishlist'}
                  className="flex items-center gap-3 px-4 py-3 font-medium"
                  style={{ color: THEME.text }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

/**
 * Luxe Boutique - Header Section
 *
 * Elegant header with:
 * - Serif logo typography
 * - Gold accent line
 * - Minimalist navigation
 * - Search, wishlist, cart icons
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Header',
  tag: 'header',
  class: 'luxe-header',
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
      label: 'Announcement link (optional)',
    },
    {
      type: 'header',
      id: 'header_options',
      label: 'Header Options',
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
      id: 'show_cart',
      label: 'Show cart icon',
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
      id: 'show_gold_line',
      label: 'Show gold accent line',
      default: true,
    },
    {
      type: 'select',
      id: 'menu_style',
      label: 'Menu style',
      options: [
        { value: 'minimal', label: 'Minimal (categories only)' },
        { value: 'full', label: 'Full (with dropdown)' },
      ],
      default: 'minimal',
    },
  ],

  presets: [
    {
      name: 'Luxe Header',
      category: 'Header',
      settings: {
        show_announcement: false,
        announcement_text: '',
        show_search: true,
        show_wishlist: true,
        show_cart: true,
        show_account: true,
        show_gold_line: true,
        menu_style: 'minimal',
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
  show_wishlist: boolean;
  show_cart: boolean;
  show_account: boolean;
  show_gold_line: boolean;
  menu_style: 'minimal' | 'full';
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  background: '#faf9f7',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  headerBg: '#ffffff',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LuxeHeader({
  section,
  context,
  settings: rawSettings,
}: SectionComponentProps) {
  const settings = rawSettings as unknown as HeaderSettings;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { store, collections = [], getLink } = context;

  const cartCount = context.cart?.itemCount || 0;
  const wishlistCount = context.wishlist?.count || 0;
  const categories = collections
    .map((c: { title?: string }) => c.title)
    .filter((t): t is string => Boolean(t))
    .slice(0, 5);

  return (
    <header data-section-id={section.id} className="sticky top-0 z-50">
      {/* Announcement Bar */}
      {settings.show_announcement && settings.announcement_text && (
        <div
          className="text-center py-2 text-sm"
          style={{ backgroundColor: THEME.primary, color: THEME.background }}
        >
          {settings.announcement_link ? (
            <a
              href={getLink?.(settings.announcement_link) || settings.announcement_link}
              className="hover:underline"
            >
              {settings.announcement_text}
            </a>
          ) : (
            settings.announcement_text
          )}
        </div>
      )}

      {/* Main Header */}
      <div className="border-b" style={{ backgroundColor: THEME.headerBg, borderColor: '#e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: THEME.text }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: THEME.text }} />
              )}
            </button>

            {/* Logo - Always show both logo and name if configured/available */}
            <a href={getLink?.('/') || '/'} className="flex items-center gap-3">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-10 lg:h-12 object-contain" />
              ) : null}
              <span
                className={`text-xl lg:text-2xl font-semibold tracking-wide ${store.logo ? 'hidden sm:block' : ''}`}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: THEME.primary,
                  display: 'block' // Force display
                }}
              >
                {store.name}
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a
                href={getLink?.('/collections/all') || '/collections/all'}
                className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                style={{ color: THEME.text }}
              >
                All Products
              </a>
              {categories.map((category: string) => (
                <a
                  key={category}
                  href={getLink?.(`/collections/${encodeURIComponent(category)}`) || '#'}
                  className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                  style={{ color: THEME.text }}
                >
                  {category}
                </a>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-3">
              {settings.show_search && (
                <button
                  className="p-2 rounded-full transition-colors hover:bg-gray-100"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" style={{ color: THEME.text }} />
                </button>
              )}
              {settings.show_wishlist && (
                <a
                  href={getLink?.('/wishlist') || '/wishlist'}
                  className="hidden sm:block p-2 rounded-full transition-colors hover:bg-gray-100 relative"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" style={{ color: THEME.text }} />
                  {wishlistCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                      style={{ backgroundColor: THEME.accent, color: THEME.primary }}
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </a>
              )}
              {settings.show_account && (
                <a
                  href={getLink?.('/auth/login') || '/auth/login'}
                  className="hidden sm:block p-2 rounded-full transition-colors hover:bg-gray-100"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" style={{ color: THEME.text }} />
                </a>
              )}
              {settings.show_cart && (
                <a
                  href={getLink?.('/cart') || '/cart'}
                  className="p-2 rounded-full transition-colors hover:bg-gray-100 relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: THEME.text }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                      style={{ backgroundColor: THEME.accent, color: THEME.primary }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full bg-white border-b border-gray-200 py-4 px-4 shadow-lg">
            <div className="max-w-2xl mx-auto">
              <form action={getLink?.('/search') || '/search'} method="GET">
                <input
                  type="text"
                  name="q"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-lg">
            <nav className="py-4">
              <a
                href={getLink?.('/collections/all') || '/collections/all'}
                className="block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
                style={{ color: THEME.text }}
              >
                All Products
              </a>
              {categories.map((category: string) => (
                <a
                  key={category}
                  href={getLink?.(`/collections/${encodeURIComponent(category)}`) || '#'}
                  className="block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
                  style={{ color: THEME.text }}
                >
                  {category}
                </a>
              ))}
              <hr className="my-2 border-gray-200" />
              {settings.show_wishlist && (
                <a
                  href={getLink?.('/wishlist') || '/wishlist'}
                  className="flex items-center justify-between w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
                  style={{ color: THEME.text }}
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: THEME.accent, color: THEME.primary }}
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </a>
              )}
              {settings.show_account && (
                <a
                  href={getLink?.('/auth/login') || '/auth/login'}
                  className="block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
                  style={{ color: THEME.text }}
                >
                  Account / Login
                </a>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Gold Accent Line */}
      {settings.show_gold_line && (
        <div className="h-0.5" style={{ backgroundColor: THEME.accent }} />
      )}
    </header>
  );
}

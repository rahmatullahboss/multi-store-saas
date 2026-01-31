/**
 * Daraz Header Section
 *
 * Shopify OS 2.0 Compatible Section
 * Orange header with search bar, matching Daraz Bangladesh
 *
 * Features:
 * - Dark gray top utility bar
 * - Orange main header with logo, search, cart
 * - Category navigation bar
 * - Mobile responsive menu
 */

import { useState } from 'react';
import { Link } from '@remix-run/react';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  User,
  ShoppingBag,
  Headphones,
  Grid3X3,
  ChevronRight,
} from 'lucide-react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA (Shopify OS 2.0 Format)
// ============================================================================

export const schema: SectionSchema = {
  name: 'Header (Daraz)',
  tag: 'header',
  class: 'daraz-header',
  limit: 1,

  enabled_on: {
    templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],
    groups: ['header'],
  },

  settings: [
    // Logo Settings
    {
      type: 'header',
      id: 'header_branding',
      label: 'Branding',
    },
    {
      type: 'image_picker',
      id: 'logo',
      label: 'Logo',
      info: 'Recommended size: 200x50px',
    },
    {
      type: 'range',
      id: 'logo_width',
      min: 60,
      max: 200,
      step: 10,
      default: 120,
      unit: 'px',
      label: 'Logo width',
    },
    // Color Settings
    {
      type: 'header',
      id: 'header_colors',
      label: 'Colors',
    },
    {
      type: 'color',
      id: 'header_bg',
      label: 'Header background',
      default: '#F85606',
    },
    {
      type: 'color',
      id: 'top_bar_bg',
      label: 'Top bar background',
      default: '#2E2E2E',
    },
    {
      type: 'color',
      id: 'search_btn_bg',
      label: 'Search button color',
      default: '#E04E05',
    },
    {
      type: 'color',
      id: 'badge_bg',
      label: 'Cart badge color',
      default: '#FFD700',
    },
    // Top Bar Settings
    {
      type: 'header',
      id: 'header_top_bar',
      label: 'Top Bar',
    },
    {
      type: 'checkbox',
      id: 'show_top_bar',
      label: 'Show top bar',
      default: true,
    },
    {
      type: 'text',
      id: 'top_bar_text_left',
      label: 'Top bar left text',
      default: 'Save More on App | Become a Seller',
    },
    {
      type: 'text',
      id: 'top_bar_text_right',
      label: 'Top bar right text',
      default: 'Help & Support',
    },
    // Search Settings
    {
      type: 'header',
      id: 'header_search',
      label: 'Search',
    },
    {
      type: 'text',
      id: 'search_placeholder',
      label: 'Search placeholder',
      default: 'Search in {store_name}',
      info: 'Use {store_name} to insert store name',
    },
    // Navigation Settings
    {
      type: 'header',
      id: 'header_navigation',
      label: 'Navigation',
    },
    {
      type: 'checkbox',
      id: 'show_category_nav',
      label: 'Show category navigation',
      default: true,
    },
    {
      type: 'range',
      id: 'max_categories',
      min: 4,
      max: 12,
      step: 1,
      default: 8,
      label: 'Max categories to show',
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
      label: 'Show account icons',
      default: true,
    },
  ],

  blocks: [
    {
      type: 'menu_item',
      name: 'Menu Item',
      limit: 10,
      settings: [
        {
          type: 'text',
          id: 'label',
          label: 'Label',
          default: 'Menu Item',
        },
        {
          type: 'url',
          id: 'link',
          label: 'Link',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Daraz Header',
      category: 'Header',
      settings: {
        header_bg: '#F85606',
        top_bar_bg: '#2E2E2E',
        show_top_bar: true,
        show_category_nav: true,
      },
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface HeaderSettings {
  logo?: string;
  logo_width: number;
  header_bg: string;
  top_bar_bg: string;
  search_btn_bg: string;
  badge_bg: string;
  show_top_bar: boolean;
  top_bar_text_left: string;
  top_bar_text_right: string;
  search_placeholder: string;
  show_category_nav: boolean;
  max_categories: number;
  show_wishlist: boolean;
  show_account: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DarazHeader({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as HeaderSettings;

  const {
    logo,
    logo_width = 120,
    header_bg = '#F85606',
    top_bar_bg = '#2E2E2E',
    search_btn_bg = '#E04E05',
    badge_bg = '#FFD700',
    show_top_bar = true,
    top_bar_text_left = 'Save More on App | Become a Seller',
    top_bar_text_right = 'Help & Support',
    search_placeholder = 'Search in {store_name}',
    show_category_nav = true,
    max_categories = 8,
    show_wishlist = true,
    show_account = true,
  } = config;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get store data from context
  const storeName = context.store?.name || 'Store';
  const cartCount = context.cart?.itemCount || 0;
  const wishlistCount = context.wishlist?.count || 0;

  // Get categories from collections
  const categories: string[] = (context.collections || [])
    .map((c) => c.title)
    .filter((t): t is string => Boolean(t))
    .slice(0, max_categories);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const placeholderText = search_placeholder.replace('{store_name}', storeName);

  return (
    <>
      {/* Top Utility Bar */}
      {show_top_bar && (
        <div className="hidden md:block" style={{ backgroundColor: top_bar_bg }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8 text-xs text-white/90">
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">
                {top_bar_text_left}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                {top_bar_text_right}
              </span>
              <Link
                to="/auth/login"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Login / Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: header_bg }}
        data-section-id={section.id}
        data-section-type="daraz-header"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 md:h-16 gap-3 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={storeName}
                className="object-contain bg-white rounded"
                style={{ height: Math.round(logo_width * 0.4), width: logo_width }}
              />
            ) : (
              <div
                className="bg-white rounded flex items-center justify-center"
                style={{ height: 40, width: 40 }}
              >
                <ShoppingBag className="w-6 h-6" style={{ color: header_bg }} />
              </div>
            )}
            <span className="text-white font-bold text-lg md:text-xl hidden sm:block tracking-tight">
              {storeName}
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 md:mx-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={placeholderText}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 md:h-10 pl-4 pr-12 rounded-l text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
              <button
                type="submit"
                className="h-9 md:h-10 px-4 md:px-6 rounded-r font-medium text-white transition-all hover:opacity-90 cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: search_btn_bg }}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 min-w-[18px] h-[18px] md:min-w-[20px] md:h-[20px] px-1 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold"
                  style={{ backgroundColor: badge_bg, color: '#212121' }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist - Desktop only */}
            {show_wishlist && show_account && (
              <Link
                to="/wishlist"
                className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition-colors relative cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 min-w-[18px] h-[18px] md:min-w-[20px] md:h-[20px] px-1 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold"
                    style={{ backgroundColor: badge_bg, color: '#212121' }}
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* User - Desktop only */}
            {show_account && (
              <Link
                to="/auth/login"
                className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                aria-label="Account"
              >
                <User className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        {show_category_nav && categories.length > 0 && (
          <nav className="hidden md:block border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-6 h-10 text-sm text-white/90">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Grid3X3 className="w-4 h-4" />
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/?category=${encodeURIComponent(cat)}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-14 shadow-lg z-50 max-h-[75vh] overflow-y-auto">
            <div className="p-3 space-y-1">
              {/* All Categories */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                style={{ color: header_bg }}
              >
                <ShoppingBag className="w-5 h-5" />
                All Categories
              </Link>

              {/* Category Links */}
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer text-gray-700 hover:bg-gray-50"
                >
                  <Grid3X3 className="w-5 h-5 opacity-60" />
                  {category}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                </Link>
              ))}

              {/* Divider */}
              <div className="h-px bg-gray-200 my-2" />

              {/* Wishlist */}
              {show_wishlist && show_account && (
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm cursor-pointer text-gray-500"
                >
                  <Heart className="w-5 h-5" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Help & Support */}
              <a
                href="#support"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm cursor-pointer text-gray-500"
              >
                <Headphones className="w-5 h-5" />
                Help &amp; Support
              </a>

              {/* Login */}
              {show_account && (
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm cursor-pointer text-gray-500"
                >
                  <User className="w-5 h-5" />
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

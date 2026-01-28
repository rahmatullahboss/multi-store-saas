/**
 * Header Section
 *
 * Shopify OS 2.0 Compatible Section
 * Main navigation header with logo, menu, search, and cart.
 */

import { useState } from 'react';
import { Link } from '@remix-run/react';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

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
  show_cart: boolean;
  background_color: string;
  text_color: string;
  sticky: boolean;
}

export default function Header({ section, context, settings }: SectionComponentProps) {
  const {
    logo,
    logo_width = 120,
    show_search = true,
    show_cart = true,
    background_color = '#ffffff',
    text_color = '#111827',
    sticky = true,
  } = settings as unknown as HeaderSettings;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const storeName = context.store?.name || 'Store';
  const categories = context.collections?.map((c) => c.title) || [];
  const cartCount = context.cart?.itemCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`z-40 shadow-sm ${sticky ? 'sticky top-0' : ''}`}
        style={{ backgroundColor: background_color }}
        data-section-id={section.id}
        data-section-type="header"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" style={{ color: text_color }} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {logo || context.store?.logo ? (
                <img
                  src={logo || context.store?.logo || ''}
                  alt={storeName}
                  className="h-8 w-auto"
                  style={{ maxWidth: `${logo_width}px` }}
                />
              ) : (
                <span className="text-xl font-bold" style={{ color: text_color }}>
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium hover:opacity-70 transition"
                style={{ color: text_color }}
              >
                হোম
              </Link>
              {categories.slice(0, 5).map((cat) => (
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

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {show_search && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 hover:opacity-70 transition"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" style={{ color: text_color }} />
                </button>
              )}
              {show_cart && (
                <Link
                  to="/cart"
                  className="p-2 hover:opacity-70 transition relative"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" style={{ color: text_color }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                      style={{ backgroundColor: context.theme?.colors?.accent || '#f59e0b' }}
                    >
                      {cartCount}
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
            <nav className="space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left py-2 font-medium"
                style={{ color: text_color }}
              >
                হোম
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/collections/${encodeURIComponent(cat.toLowerCase())}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left py-2"
                  style={{ color: text_color }}
                >
                  {cat}
                </Link>
              ))}
            </nav>
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
                placeholder="পণ্য খুঁজুন..."
                autoFocus
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  borderColor: context.theme?.colors?.border || '#e5e7eb',
                  backgroundColor: context.theme?.colors?.background || '#f9fafb',
                }}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white"
                style={{ backgroundColor: context.theme?.colors?.primary || '#6366f1' }}
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

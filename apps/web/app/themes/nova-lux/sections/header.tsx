
import React, { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { ShoppingBag, Search, Menu, X, Sparkles } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { NOVALUX_THEME } from '../index';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'header',
  name: 'Header',
  limit: 1,
  settings: [
    {
      type: 'checkbox',
      id: 'show_announcement',
      label: 'Show Announcement Bar',
      default: true,
    },
    {
      type: 'text',
      id: 'announcement_text',
      label: 'Announcement Text',
      default: 'Welcome to Nova Lux',
    },
    {
      type: 'url',
      id: 'announcement_link',
      label: 'Announcement Link',
    },
    {
      type: 'menu_picker',
      id: 'menu',
      label: 'Menu',
      default: 'main-menu',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function NovaLuxHeader({ context, settings }: SectionComponentProps) {
  const { store, getLink } = context;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartItemCount = 0; // Use cart context in production
  
  const theme = NOVALUX_THEME.config;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const THEME_COLORS = {
    primary: theme.colors?.primary || '#1C1C1E',
    accent: theme.colors?.accent || '#C4A35A',
    text: theme.colors?.text || '#2C2C2C',
    headerBgSolid: '#FFFFFF',
    headerShadow: '0 2px 20px rgba(0, 0, 0, 0.06)',
    border: theme.colors?.border || '#E5E5EA',
    fontHeading: theme.typography?.fontFamilyHeading || "'Cormorant Garamond', Georgia, serif",
    accentGradient: 'linear-gradient(135deg, #C4A35A 0%, #D4B86A 50%, #C4A35A 100%)',
  };

  const showAnnouncement = settings.show_announcement !== false;
  const announcementText = settings.announcement_text as string;
  const announcementLink = settings.announcement_link as string;

  const categories = context.collections?.map(c => c.title) || [];
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? THEME_COLORS.headerBgSolid : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        boxShadow: isScrolled ? THEME_COLORS.headerShadow : 'none',
        borderBottom: isScrolled ? `1px solid ${THEME_COLORS.border}` : 'none',
      }}
    >
      {/* Announcement Bar */}
      {showAnnouncement && announcementText && (
        <div
          className="text-center py-2.5 text-sm font-medium transition-all"
          style={{
            background: THEME_COLORS.accentGradient,
            color: THEME_COLORS.primary,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {announcementLink ? (
              <a href={announcementLink} className="hover:underline">
                {announcementText}
              </a>
            ) : (
              announcementText
            )}
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
            )}
          </button>

          {/* Left Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to={getLink('/')}
              className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
              style={{ color: THEME_COLORS.text }}
            >
              All Products
            </Link>
            {validCategories.slice(0, 3).map((category) => (
              <Link
                key={category}
                to={getLink(`/collections/${category.toLowerCase().replace(/\s+/g, '-')}`)}
                className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                style={{ color: THEME_COLORS.text }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link to={getLink('/')} className="flex items-center justify-center">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-10 lg:h-12 object-contain" />
            ) : (
              <span
                className="text-2xl lg:text-3xl font-semibold tracking-wider"
                style={{
                  fontFamily: THEME_COLORS.fontHeading,
                  color: THEME_COLORS.primary,
                }}
              >
                {store.name}
              </span>
            )}
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100">
              <Search className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
            </button>
            <Link
              to={getLink('/cart')}
              className="p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100 relative"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    background: THEME_COLORS.accentGradient,
                    color: THEME_COLORS.primary,
                  }}
                >
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
       {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b shadow-lg p-4">
          <nav className="flex flex-col gap-2">
            <Link
              to={getLink('/')}
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-2 font-medium"
            >
             All Products
            </Link>
             {validCategories.map((category) => (
              <Link
                key={category}
                to={getLink(`/collections/${category.toLowerCase().replace(/\s+/g, '-')}`)}
                 onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2 text-sm"
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}


import React, { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Search, Menu, X, Heart, ShoppingBag, Sparkles, ChevronRight, Instagram, Facebook } from 'lucide-react';
import { AURORA_THEME } from '../index'; // Import from local index to get theme constants
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'header',
  name: 'Header',
  limit: 1,
  settings: [
    {
      type: 'header',
      content: 'Announcement Bar',
    },
    {
      type: 'checkbox',
      id: 'show_announcement',
      label: 'Show announcement',
      default: true,
    },
    {
      type: 'text',
      id: 'announcement_text',
      label: 'Announcement text',
      default: 'Welcome to our store',
    },
    {
      type: 'url',
      id: 'announcement_link',
      label: 'Announcement link',
    },
    {
      type: 'header',
      content: 'Navigation',
    },
    {
      type: 'menu_picker',
      id: 'menu',
      label: 'Main menu',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AuroraHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, onNavigate, getLink } = context;
  const theme = AURORA_THEME.config; // Access config from the exported object
  
  // Use theme colors from config if available, otherwise fallback to hardcoded
  // Note: For now we'll use the hardcoded values from original theme to ensure consistency
  // untill we fully migrate the theme constants to the new system
  const THEME_COLORS = {
    primary: theme.colors?.primary || '#2C2C2C',
    text: theme.colors?.text || '#2C2C2C',
    muted: theme.colors?.textMuted || '#8E8E8E',
    cardBg: theme.colors?.surface || '#FFFFFF',
    headerBg: theme.colors?.background || 'rgba(253, 251, 249, 0.6)',
    headerShadow: theme.shadows?.sm || '0 4px 20px rgba(0, 0, 0, 0.04)',
    backgroundAlt: '#F5F2EF', // Hardcoded from original theme
    border: theme.colors?.border || 'rgba(0, 0, 0, 0.06)',
    fontHeading: theme.typography?.fontFamilyHeading || "'Outfit', sans-serif",
    fontBody: theme.typography?.fontFamily || "'Plus Jakarta Sans', sans-serif",
    auroraGradient: 'linear-gradient(135deg, #E8C4C4 0%, #D4C8D4 50%, #B5C4B1 100%)', // Hardcoded
    auroraGradientSoft: 'linear-gradient(135deg, rgba(232, 196, 196, 0.3) 0%, rgba(181, 196, 177, 0.3) 100%)', // Hardcoded
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock categories for now - in real app fetch from context.collections or menu
  const categories = context.collections?.map(c => c.title) || [];
  const currentCategory = null; 

  const showAnnouncement = settings.show_announcement !== false;
  const announcementText = settings.announcement_text as string;
  const announcementLink = settings.announcement_link as string;

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{ 
        backgroundColor: isScrolled ? THEME_COLORS.headerBg : 'rgba(253, 251, 249, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isScrolled ? THEME_COLORS.headerShadow : 'none',
        fontFamily: THEME_COLORS.fontBody,
      }}
    >
      {/* Announcement Bar */}
      {showAnnouncement && announcementText && (
        <div 
          className="text-center py-2.5 text-sm font-medium"
          style={{ 
            background: THEME_COLORS.auroraGradient, 
            color: THEME_COLORS.primary 
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
            className="lg:hidden p-2 -ml-2 rounded-xl transition-all"
            style={{ backgroundColor: isScrolled ? THEME_COLORS.backgroundAlt : 'transparent' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
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
              className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full"
              style={{ 
                color: !currentCategory ? THEME_COLORS.primary : THEME_COLORS.muted,
                backgroundColor: !currentCategory ? THEME_COLORS.auroraGradientSoft : 'transparent',
              }}
            >
              All Products
            </Link>
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category}
                to={getLink(`/collections/${category.toLowerCase().replace(/\s+/g, '-')}`)}
                className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full hover:opacity-70"
                style={{ 
                  color: currentCategory === category ? THEME_COLORS.primary : THEME_COLORS.muted,
                  backgroundColor: currentCategory === category ? THEME_COLORS.auroraGradientSoft : 'transparent',
                }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Logo (Centered) */}
          <Link to={getLink('/')} className="flex items-center justify-center group">
            {store.logo ? (
              <img 
                src={store.logo} 
                alt={store.name} 
                className="h-10 lg:h-12 object-contain transition-transform duration-300 group-hover:scale-110" 
              />
            ) : (
              <span 
                className="text-2xl lg:text-3xl font-bold tracking-tight"
                style={{ 
                  fontFamily: THEME_COLORS.fontHeading, 
                  color: THEME_COLORS.primary 
                }}
              >
                {store.name}
              </span>
            )}
          </Link>

          {/* Right Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.slice(3, 6).map((category) => (
              <Link
                key={category}
                to={getLink(`/collections/${category.toLowerCase().replace(/\s+/g, '-')}`)}
                className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full hover:opacity-70"
                style={{ 
                  color: currentCategory === category ? THEME_COLORS.primary : THEME_COLORS.muted,
                  backgroundColor: currentCategory === category ? THEME_COLORS.auroraGradientSoft : 'transparent',
                }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1.5">
            <button 
              className="p-2.5 rounded-full transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: isScrolled ? THEME_COLORS.backgroundAlt : 'rgba(0,0,0,0.03)' }}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
            </button>
            <button 
              className="hidden sm:flex p-2.5 rounded-full transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: isScrolled ? THEME_COLORS.backgroundAlt : 'rgba(0,0,0,0.03)' }}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
            </button>
            <Link 
              to={getLink('/cart')}
              className="p-2.5 rounded-full transition-all duration-300 hover:scale-110 relative"
              style={{ backgroundColor: isScrolled ? THEME_COLORS.backgroundAlt : 'rgba(0,0,0,0.03)' }}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
              {cart.itemCount > 0 && (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ 
                    background: THEME_COLORS.auroraGradient, 
                    color: THEME_COLORS.primary 
                  }}
                >
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div 
          className="absolute inset-x-0 top-full py-6 px-4 animate-fadeIn"
          style={{ 
            backgroundColor: THEME_COLORS.cardBg,
            boxShadow: THEME_COLORS.headerShadow
          }}
        >
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME_COLORS.muted }} />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 focus:outline-none transition-all"
              style={{ 
                borderColor: THEME_COLORS.border,
                fontFamily: THEME_COLORS.fontBody,
                backgroundColor: THEME_COLORS.backgroundAlt
              }}
              autoFocus
            />
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => setSearchOpen(false)}
            >
              <X className="w-5 h-5" style={{ color: THEME_COLORS.muted }} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-[64px] z-40 animate-slideIn overflow-y-auto"
          style={{ backgroundColor: THEME_COLORS.cardBg }}
        >
          <nav className="py-6 px-4 space-y-2">
            <Link 
              to={getLink('/')}
              className="flex items-center justify-between px-5 py-4 rounded-2xl font-semibold transition-all"
              style={{ 
                background: !currentCategory ? THEME_COLORS.auroraGradientSoft : 'transparent',
                color: !currentCategory ? THEME_COLORS.primary : THEME_COLORS.text 
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="uppercase tracking-wider text-sm">All Products</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={getLink(`/collections/${category.toLowerCase().replace(/\s+/g, '-')}`)}
                className="flex items-center justify-between px-5 py-4 rounded-2xl font-semibold transition-all"
                style={{ 
                  background: currentCategory === category ? THEME_COLORS.auroraGradientSoft : 'transparent',
                  color: currentCategory === category ? THEME_COLORS.primary : THEME_COLORS.text 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="uppercase tracking-wider text-sm">{category}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Aurora Gradient Line */}
      <div 
        className="h-[3px] w-full transition-opacity duration-500"
        style={{ 
          background: THEME_COLORS.auroraGradient,
          opacity: isScrolled ? 0 : 1
        }} 
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .animate-slideIn { animation: slideIn 0.3s ease forwards; }
      `}</style>
    </header>
  );
}

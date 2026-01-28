import { Link } from '@remix-run/react';
import { ShoppingBasket, Menu, X, Heart, Leaf, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ARTISAN_THEME_CONFIG } from '../index';

export const schema: SectionSchema = {
  type: 'header',
  name: 'Header',
  settings: [
    {
      type: 'image_picker',
      id: 'logo',
      label: 'Logo',
    },
    {
      type: 'link_list',
      id: 'menu',
      label: 'Menu',
      default: 'main-menu',
    },
    {
      type: 'checkbox',
      id: 'show_announcement',
      label: 'Show Announcement',
      default: true,
    },
    {
      type: 'text',
      id: 'announcement_text',
      label: 'Announcement Text',
      default: 'Free shipping on orders over $50',
    },
    {
      type: 'url',
      id: 'announcement_link',
      label: 'Announcement Link',
    },
  ],
};

export default function ArtisanHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, getLink, collections } = context;
  const config = ARTISAN_THEME_CONFIG.colors!;
  const typography = ARTISAN_THEME_CONFIG.typography;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;

  // Use store logo or fallback to settings logo
  const logoUrl = typeof settings.logo === 'string' ? settings.logo : store.logo;
  const categories = collections?.map(c => c.title) || [];
  const currentCategory = ''; // In a real scenario, we'd get this from context or URL

  // Derived styles
  const announcementBg = config.accentLight;
  const announcementText = config.accent;

  return (
    <>
    <header 
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: config.headerBg, fontFamily: typography.fontFamily }}
    >
      {/* Announcement Bar */}
      {(settings.show_announcement as boolean) && (
        <div 
          className="text-center py-2.5 text-sm font-medium"
          style={{ backgroundColor: announcementBg, color: announcementText }}
        >
          <Leaf className="inline w-4 h-4 mr-2" />
          {settings.announcement_link ? (
            <a href={settings.announcement_link as string} className="hover:underline">
              {settings.announcement_text as string}
            </a>
          ) : (
            settings.announcement_text as string
          )}
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 -ml-2 rounded-full hover:bg-amber-50 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" style={{ color: config.text }} />
          </button>

          {/* Logo */}
          <Link to={getLink('/')} className="flex items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={store.name} className="h-10 lg:h-12 object-contain" />
            ) : (
              <span 
                className="text-2xl lg:text-3xl font-semibold"
                style={{ fontFamily: typography.fontFamilyHeading, color: config.primary }}
              >
                {store.name}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link 
              to={getLink('/')}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ 
                backgroundColor: !currentCategory ? config.accentLight : 'transparent',
                color: !currentCategory ? config.accent : config.text,
              }}
            >
              All Products
            </Link>
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category}
                to={getLink(`/?category=${encodeURIComponent(category)}`)}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-amber-50"
                style={{ 
                  color: config.text,
                }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full transition-colors hover:bg-amber-50">
              <Search className="w-5 h-5" style={{ color: config.text }} />
            </button>
            <button className="hidden sm:block p-2.5 rounded-full transition-colors hover:bg-amber-50">
              <Heart className="w-5 h-5" style={{ color: config.text }} />
            </button>
            <Link 
              to={getLink('/cart')} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-colors"
              style={{ backgroundColor: config.accent, color: 'white' }}
            >
              <ShoppingBasket className="w-5 h-5" />
              <span className="hidden sm:inline">Basket</span>
              {itemCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{itemCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

            {/* Decorative Border */}
      <div className="h-1 w-full" style={{ 
        background: `linear-gradient(90deg, transparent 0%, ${config.accent}40 50%, transparent 100%)` 
      }} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div 
            className="absolute top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white shadow-xl flex flex-col"
            style={{ backgroundColor: config.background }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: config.border }}>
              <span className="font-bold text-lg" style={{ fontFamily: typography.fontFamilyHeading }}>Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X className="w-6 h-6" style={{ color: config.text }} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link 
                to={getLink('/')}
                className="flex items-center justify-between px-4 py-3 rounded-xl font-medium"
                style={{ 
                   backgroundColor: config.accentLight,
                   color: config.accent 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
                <ChevronRight className="w-5 h-5" />
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  to={getLink(`/?category=${encodeURIComponent(category)}`)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl font-medium hover:bg-amber-50"
                  style={{ color: config.text }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
    </>
  );
}

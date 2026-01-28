import { Link } from '@remix-run/react';
import { useState } from 'react';
import { Search, Menu, User, Heart, ShoppingBag, ChevronDown, Phone, Percent, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { FRESHNESS_THEME_CONFIG } from '../index';
import { useTranslation } from '~/contexts/LanguageContext';

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
      type: 'checkbox',
      id: 'show_phone',
      label: 'Show Phone Number',
      default: true,
    },
  ],
};

export default function FreshnessHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, getLink, collections } = context;
  const config = FRESHNESS_THEME_CONFIG.colors!;
  const typography = FRESHNESS_THEME_CONFIG.typography;
  const { t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;
  
  const logoUrl = typeof settings.logo === 'string' ? settings.logo : store.logo;
  const categories = collections?.map(c => c.title) || [];
  const validCategories = categories.slice(0, 5);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
        style={{
          backgroundColor: config.headerBg,
          backdropFilter: 'blur(10px)',
          borderColor: config.border,
        }}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-gray-800 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-8 h-8" />
          </button>

          {/* Logo */}
          <Link
            to={getLink('/')}
            className="text-2xl md:text-3xl lg:text-4xl font-bold italic shrink-0"
            style={{
              fontFamily: typography.fontFamilyHeading,
              color: config.primary,
            }}
          >
            {logoUrl ? <img src={logoUrl} alt={store.name} className="h-10 object-contain" /> : store.name}
          </Link>

          {/* Desktop Search */}
          <div
            className="hidden lg:flex flex-1 max-w-xl items-center border-2 rounded-full focus-within:border-amber-400 transition-all ml-4 overflow-hidden"
            style={{ borderColor: config.border }}
          >
            <input
              type="text"
              placeholder={t('searchProducts') || 'Search for products...'}
              className="flex-1 px-5 py-2 outline-none text-gray-600 bg-transparent"
            />
            <button className="p-3 px-6 transition-colors" style={{ backgroundColor: config.accent }}>
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* User Profile */}
            <Link
              to={getLink('/auth/login')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:text-white transition-all cursor-pointer"
              // style={{ '--hover-bg': config.secondary } as any}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Wishlist */}
            <div className="relative cursor-pointer hover:text-red-500 transition-colors">
              <Heart className="w-7 h-7" />
              <span className="absolute -top-2 -right-2 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border text-white border-white bg-red-400">
                0
              </span>
            </div>

            {/* Cart */}
            <Link
              to={getLink('/cart')}
              className="relative cursor-pointer hover:text-green-600 transition-colors"
            >
              <ShoppingBag className="w-7 h-7" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white"
                  style={{ backgroundColor: config.secondary }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-t bg-white" style={{ borderColor: config.border }}>
          <div className="container mx-auto px-4 flex items-center justify-between">
            <ul className="flex items-center gap-8 font-semibold text-gray-700">
              <li className="py-5">
                <Link
                  to={getLink('/')}
                  className="flex items-center gap-1 hover:text-green-600 transition-colors"
                >
                  {t('home') || 'Home'}
                </Link>
              </li>
              <li className="py-5 group relative cursor-pointer">
                <span className="flex items-center gap-1 hover:text-green-600 transition-colors">
                  {t('categories') || 'Categories'} <ChevronDown className="w-4 h-4" />
                </span>
                {/* Simple Dropdown for Categories */}
                <div
                  className="absolute top-full left-0 min-w-[200px] bg-white shadow-xl border rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-50 p-2"
                  style={{ borderColor: config.border }}
                >
                  {validCategories.map((cat) => (
                    <Link
                      key={cat}
                      to={getLink(`/?category=${encodeURIComponent(cat)}`)}
                      className="block py-2 px-3 text-sm rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </li>
              <li className="py-5">
                <Link
                  to={getLink('/about')}
                  className="hover:text-green-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li className="py-5">
                <Link
                  to={getLink('/contact')}
                  className="hover:text-green-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <Percent className="w-5 h-5 text-green-600" />
                <span>Weekly Discount!</span>
              </div>
              {(settings.show_phone as boolean) && (
                <div
                  className="text-white px-5 py-2 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: config.primary }}
                >
                  <Phone className="w-5 h-5" />
                  <div className="leading-tight">
                    <p className="text-[10px] opacity-80 uppercase font-medium">Hotline</p>
                    <p className="font-bold">{store.phone || '+880 1234567890'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-4 flex justify-between items-center border-b">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Link to={getLink('/')} className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              {validCategories.map(cat => (
                <Link 
                  key={cat} 
                  to={getLink(`/?category=${encodeURIComponent(cat)}`)}
                  className="block py-2 pl-4 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Spacer for fixed header */}
      <div className="h-32 lg:h-40" /> 
    </>
  );
}

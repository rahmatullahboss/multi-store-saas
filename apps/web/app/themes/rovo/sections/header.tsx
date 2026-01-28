import { Link } from '@remix-run/react';
import { useState } from 'react';
import { ShoppingBag, Search, Menu, User, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ROVO_THEME_CONFIG } from '../index';

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
      id: 'show_search',
      label: 'Show Search',
      default: true,
    },
     {
      type: 'checkbox',
      id: 'sticky',
      label: 'Sticky Header',
      default: true,
    },
  ],
};

export default function RovoHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, getLink, collections } = context;
  const config = ROVO_THEME_CONFIG.colors!;
  const typography = ROVO_THEME_CONFIG.typography;
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;
  
  const logoUrl = typeof settings.logo === 'string' ? settings.logo : store.logo;
  const categories = collections?.map(c => c.title) || [];

  return (
    <>
      <header 
        className={`top-0 left-0 right-0 z-50 bg-white border-b transition-all duration-300 font-sans ${(settings.sticky as boolean) ? 'fixed' : 'relative'}`}
        style={{
          borderColor: config.border,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
        }}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 -ml-2 hover:bg-black/5 rounded-full"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to={getLink('/')} className="flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={store.name} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl md:text-3xl font-bold tracking-tighter uppercase font-heading">
                {store.name}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to={getLink('/')}
              className="text-sm font-medium uppercase tracking-wide text-gray-900 hover:text-red-600 transition-colors"
            >
              Home
            </Link>
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category}
                to={getLink(`/?category=${encodeURIComponent(category)}`)}
                className="text-sm font-medium uppercase tracking-wide text-gray-900 hover:text-red-600 transition-colors"
              >
                {category}
              </Link>
            ))}
            <Link 
              to={getLink('/products')} 
              className="text-sm font-medium uppercase tracking-wide text-gray-900 hover:text-red-600 transition-colors"
            >
              Shop
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {(settings.show_search as boolean) && (
              <button 
                className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            <Link 
              to={getLink('/auth/login')} 
              className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              to={getLink('/cart')}
              className="p-2 hover:bg-black/5 rounded-full transition-colors relative group"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-red-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      {(settings.sticky as boolean) && <div className="h-20" />}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-xl z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold uppercase">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col space-y-1 px-2">
                <Link to={getLink('/')} className="p-3 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                {categories.map((cat) => (
                  <Link 
                    key={cat} 
                    to={getLink(`/?category=${encodeURIComponent(cat)}`)}
                    className="p-3 hover:bg-gray-50 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
                <Link to={getLink('/products')} className="p-3 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

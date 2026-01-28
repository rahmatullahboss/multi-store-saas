import { Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User, Heart } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { SOKOL_THEME_CONFIG } from '../index';

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
      id: 'show_wishlist',
      label: 'Show Wishlist',
      default: true,
    },
  ],
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SokolHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, getLink, collections } = context;
  const config = SOKOL_THEME_CONFIG.colors!;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;
  
  const logoUrl = typeof settings.logo === 'string' ? settings.logo : store.logo;
  const categories = collections?.map(c => c.title) || [];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans",
          isScrolled 
            ? "bg-white/98 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" 
            : "bg-white py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to={getLink('/')} className="flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={store.name} className="h-8 md:h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl md:text-2xl font-bold tracking-tight font-heading text-[#0D0D0D]">
                  {store.name}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                to={getLink('/')}
                className="text-sm font-medium tracking-wide hover:text-rose-600 transition-colors text-gray-700"
              >
                Home
              </Link>
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  to={getLink(`/?category=${encodeURIComponent(category)}`)}
                  className="text-sm font-medium tracking-wide text-gray-700 hover:text-rose-600 transition-colors"
                >
                  {category}
                </Link>
              ))}
              <Link 
                to={getLink('/products')} 
                className="text-sm font-medium tracking-wide text-gray-700 hover:text-rose-600 transition-colors"
              >
                All Products
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-1 md:space-x-2">
              {(settings.show_search as boolean) && (
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex">
                  <Search className="w-5 h-5 text-gray-700" />
                </button>
              )}
              
              {(settings.show_wishlist as boolean) && (
                <Link 
                  to={getLink('/wishlist')} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex"
                >
                  <Heart className="w-5 h-5 text-gray-700" />
                </Link>
              )}

              <Link 
                to={getLink('/account')} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex"
              >
                <User className="w-5 h-5 text-gray-700" />
              </Link>

              <Link
                to={getLink('/cart')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-rose-600 transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-18" /> 

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold font-heading text-lg">{store.name}</span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col space-y-1 px-2">
                <Link 
                  to={getLink('/')} 
                  className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                {categories.map((cat) => (
                  <Link 
                    key={cat} 
                    to={getLink(`/?category=${encodeURIComponent(cat)}`)} 
                    className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
                <Link 
                  to={getLink('/products')} 
                  className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                </Link>
              </nav>
            </div>
            <div className="p-4 border-t border-gray-100">
              <Link 
                to={getLink('/account')} 
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">My Account</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { Link } from '@remix-run/react';
import { useState } from 'react';
import { Search, ShoppingBag, Phone, Zap, Clock, Menu, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { TURBO_SALE_THEME_CONFIG } from '../index';

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
      id: 'show_flash_sale',
      label: 'Show Flash Sale Bar',
      default: true,
    },
    {
      type: 'text',
      id: 'flash_sale_text',
      label: 'Flash Sale Text',
      default: 'ফ্ল্যাশ সেল! ৫০% ছাড় শুধু আজকের জন্য!',
    },
  ],
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TurboHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, getLink, collections } = context;
  const config = TURBO_SALE_THEME_CONFIG.colors!;
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;
  
  const logoUrl = typeof settings.logo === 'string' ? settings.logo : store.logo;
  const categories = collections?.map(c => c.title) || [];

  return (
    <>
      {/* Top Bar - Flash Sale Alert */}
      {(settings.show_flash_sale as boolean) && (
        <div 
          className="bg-black text-white text-center py-1.5 text-xs md:text-sm font-bold"
        >
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
            <Zap className="h-3 w-3 md:h-4 md:w-4 animate-pulse text-yellow-400" />
            <span className="text-yellow-400">ফ্ল্যাশ সেল!</span>
            <span className="hidden md:inline">{settings.flash_sale_text as string}</span>
            <span className="md:hidden">৫০% ছাড়!</span>
            <Clock className="h-3 w-3 md:h-4 md:w-4 animate-pulse text-red-400" />
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-50 shadow-md bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between gap-4">
             {/* Mobile Menu Button */}
             <button 
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search - Left (Desktop) */}
            <button 
              className="p-2 rounded-full transition flex-shrink-0 hidden lg:flex"
              style={{ backgroundColor: `${config.primary}10` }}
            >
              <Search className="h-5 w-5" style={{ color: config.primary }} />
            </button>

            {/* Logo - Center */}
            <Link to={getLink('/')} className="flex items-center justify-center flex-1">
              {logoUrl ? (
                <img src={logoUrl} alt={store.name} className="h-8 md:h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-1 md:gap-2">
                  <span 
                    className="text-xl md:text-2xl font-black italic tracking-tighter" 
                    style={{ color: config.primary }}
                  >
                    {store.name}
                  </span>
                </div>
              )}
            </Link>

            {/* Cart - Right */}
            <Link 
              to={getLink('/cart')}
              className="p-2 rounded-full transition relative flex-shrink-0"
              style={{ backgroundColor: `${config.accent}10` }}
            >
              <ShoppingBag className="h-5 w-5" style={{ color: config.accent }} />
              {itemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: config.primary }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="border-t hidden lg:block" style={{ borderColor: `${config.primary}20` }}>
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="flex items-center gap-1 md:gap-2 py-2 overflow-x-auto scrollbar-hide">
              <Link 
                to={getLink('/')}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition flex-shrink-0 text-white shadow-lg"
                style={{ backgroundColor: config.primary }}
              >
                সব প্রোডাক্ট
              </Link>
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category}
                  to={getLink(`/?category=${encodeURIComponent(category)}`)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition flex-shrink-0 text-gray-600 hover:bg-gray-100"
                >
                  {category}
                </Link>
              ))}
              {/* Extra: Call Support */}
              <a 
                href={`tel:${store.phone || '01XXX-XXXXXX'}`}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white flex-shrink-0"
                style={{ backgroundColor: config.secondary, color: '#1F2937' }}
              >
                <Phone className="h-3 w-3" />
                <span className="hidden md:inline">কল করুন</span>
              </a>
            </div>
          </div>
        </nav>
      </header>

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
          </div>
        </div>
      )}
    </>
  );
}

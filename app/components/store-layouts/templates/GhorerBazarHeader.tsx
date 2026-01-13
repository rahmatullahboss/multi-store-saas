import { Link } from '@remix-run/react';
import { Search, ShoppingBag, Phone, HelpCircle } from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { GHORER_BAZAR_THEME } from '~/components/store-templates/GhorerBazarTheme';

import { useState } from 'react';
import type { ThemeConfig, SocialLinks } from '@db/types';

interface GhorerBazarHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
}

export function GhorerBazarHeader({ storeName, logo, isPreview, categories = [], currentCategory, businessInfo }: GhorerBazarHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const count = useCartCount();
  const { primary, headerBg, accent } = GHORER_BAZAR_THEME;

  return (
    <>
      {/* Top Bar - Orange */}
      <div 
        className="text-white text-center py-2 text-sm"
        style={{ backgroundColor: primary }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{businessInfo?.phone || '০১XXX-XXXXXX'}</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>হেল্প ডেস্ক</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: headerBg }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            <Link to="/" className="flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 w-auto" />
              ) : (
                <span className="text-xl font-bold" style={{ color: primary }}>{storeName}</span>
              )}
            </Link>

            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition relative">
              <ShoppingBag className="h-5 w-5 text-gray-600" />
              <span 
                className="absolute top-1 right-1 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {count}
              </span>
            </Link>
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="border-t border-gray-100 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <Link 
                to="/"
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition ${!currentCategory ? 'text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                style={!currentCategory ? { backgroundColor: primary } : {}}
              >
                সব প্রোডাক্ট
              </Link>
              {categories.filter(Boolean).map((category) => (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category!)}`}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition ${currentCategory === category ? 'text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  style={currentCategory === category ? { backgroundColor: primary } : {}}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

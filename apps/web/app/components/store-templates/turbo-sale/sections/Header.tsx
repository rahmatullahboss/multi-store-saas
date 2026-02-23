import { Link } from '@remix-run/react';
import { Search, ShoppingBag, Phone, Zap, Clock, Menu, X } from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { TURBO_SALE_THEME } from '../styles/tokens';
import { LanguageSelector } from '../../shared/LanguageSelector';
import { useState } from 'react';
import type { ThemeConfig, SocialLinks } from '@db/types';

interface TurboSaleHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
}

export function TurboSaleHeader({ storeName, logo, isPreview, categories = [], currentCategory, businessInfo }: TurboSaleHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const count = useCartCount();
  const { primary, headerBg, accent, secondary } = TURBO_SALE_THEME;

  return (
    <>
      {/* Top Bar - Flash Sale Alert */}
      <div 
        className="bg-black text-white text-center py-1.5 text-xs md:text-sm font-bold"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <Zap className="h-3 w-3 md:h-4 md:w-4 animate-pulse text-yellow-400" />
          <span className="text-yellow-400">ফ্ল্যাশ সেল!</span>
          <span className="hidden md:inline">৫০% ছাড় শুধু আজকের জন্য!</span>
          <span className="md:hidden">৫০% ছাড়!</span>
          <Clock className="h-3 w-3 md:h-4 md:w-4 animate-pulse text-red-400" />
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: headerBg }}>
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-full transition hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" style={{ color: primary }} />
            </button>

            {/* Search - Left */}
            <button 
              className="p-2 rounded-full transition flex-shrink-0"
              style={{ backgroundColor: `${primary}10` }}
            >
              <Search className="h-5 w-5" style={{ color: primary }} />
            </button>

            {/* Logo - Center */}
            <Link to="/" className="flex items-center justify-center flex-1">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 md:h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-xl md:text-2xl font-black italic tracking-tighter" style={{ color: primary }}>
                    {storeName}
                  </span>
                </div>
              )}
            </Link>

            {/* Cart - Right */}
            <Link 
              to="/cart" 
              className="p-2 rounded-full transition relative flex-shrink-0"
              style={{ backgroundColor: `${accent}10` }}
            >
              <ShoppingBag className="h-5 w-5" style={{ color: accent }} />
              {count > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: primary }}
                >
                  {count}
                </span>
              )}
            </Link>
            {/* Language - Desktop */}
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="border-t" style={{ borderColor: `${primary}20` }}>
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="flex items-center gap-1 md:gap-2 py-2 overflow-x-auto scrollbar-hide">
              <Link 
                to="/"
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition flex-shrink-0
                  ${!currentCategory 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                style={!currentCategory ? { backgroundColor: primary } : {}}
              >
                সব প্রোডাক্ট
              </Link>
              {categories.filter(Boolean).map((category) => (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category!)}`}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition flex-shrink-0
                    ${currentCategory === category 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  style={currentCategory === category ? { backgroundColor: primary } : {}}
                >
                  {category}
                </Link>
              ))}
              {/* Extra: Call Support */}
              <a 
                href={`tel:${businessInfo?.phone || '০১XXX-XXXXXX'}`}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white flex-shrink-0"
                style={{ backgroundColor: secondary, color: '#1F2937' }}
              >
                <Phone className="h-3 w-3" />
                <span className="hidden md:inline">কল করুন</span>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold text-lg">{storeName}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-4">
              <Link to="/" className="block font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/cart" className="block font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Cart ({count})
              </Link>
              
              <div className="pt-4 border-t">
                <p className="mb-2 text-sm font-semibold text-gray-500">Categories</p>
                <div className="space-y-2">
                  <Link 
                    to="/" 
                    className="block text-sm text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Products
                  </Link>
                  {categories.filter(Boolean).map((category) => (
                    <Link
                      key={category}
                      to={`?category=${encodeURIComponent(category!)}`}
                      className="block text-sm text-gray-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <LanguageSelector />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default TurboSaleHeader;

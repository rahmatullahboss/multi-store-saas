import { Link } from '@remix-run/react';
import { ShoppingCart, Search, Menu, X, Zap, ChevronRight } from 'lucide-react';
import { TECH_MODERN_THEME } from '../theme';
import { useTranslation } from '~/contexts/LanguageContext';

interface TechModernHeaderProps {
  storeName: string;
  logo?: string | null;
  categories: string[];
  currentCategory?: string | null;
  config?: any;
  count: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function TechModernHeader({
  storeName,
  logo,
  categories,
  currentCategory,
  config,
  count,
  mobileMenuOpen,
  setMobileMenuOpen,
  searchQuery,
  setSearchQuery,
}: TechModernHeaderProps) {
  const { t } = useTranslation();
  const theme = TECH_MODERN_THEME;

  return (
    <header
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{ backgroundColor: theme.headerBg, borderColor: '#e2e8f0' }}
    >
      {/* Top Bar */}
      {config?.announcement?.text && (
        <div
          className="text-center py-2 text-sm font-medium"
          style={{ backgroundColor: theme.accent, color: 'white' }}
        >
          <Zap className="inline w-4 h-4 mr-2" />
          {config.announcement.link ? (
            <a href={config.announcement.link} className="hover:underline">
              {config.announcement.text}
            </a>
          ) : (
            config.announcement.text
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 lg:h-10 object-contain" />
            ) : (
              <span
                className="text-xl lg:text-2xl font-bold flex items-center gap-2"
                style={{ color: theme.primary }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                {storeName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: !currentCategory ? theme.accentLight : 'transparent',
                color: !currentCategory ? theme.accent : theme.text,
              }}
            >
              All Products
            </Link>
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                style={{
                  backgroundColor: currentCategory === category ? theme.accentLight : 'transparent',
                  color: currentCategory === category ? theme.accent : theme.text,
                }}
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{count}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Mobile Nav */}
          <nav className="py-2">
            <Link
              to="/"
              className="flex items-center justify-between px-4 py-3 font-medium"
              style={{ color: !currentCategory ? theme.accent : theme.text }}
              onClick={() => setMobileMenuOpen(false)}
            >
              All Products
              <ChevronRight className="w-5 h-5" />
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="flex items-center justify-between px-4 py-3 font-medium"
                style={{ color: currentCategory === category ? theme.accent : theme.text }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {category}
                <ChevronRight className="w-5 h-5" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

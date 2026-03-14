import { Link } from 'react-router';
import { Search, ShoppingBag, Heart, Menu, X, User } from 'lucide-react';
import { OZZYL_PREMIUM_THEME } from '../theme';

const THEME = OZZYL_PREMIUM_THEME;

interface OzzylPremiumHeaderProps {
  storeName: string;
  logo?: string | null;
  categories?: (string | { title?: string; slug?: string; imageUrl?: string } | null)[];
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
  config?: any;
  socialLinks?: any;
}

export function OzzylPremiumHeader({
  storeName,
  logo,
  categories = [],
  isMenuOpen,
  setIsMenuOpen,
  setIsScrolled,
}: OzzylPremiumHeaderProps) {
  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: isMenuOpen ? THEME.background : 'rgba(10, 10, 12, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 w-auto" />
              ) : (
                <span
                  className="text-2xl font-bold gold-gradient"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className="font-medium transition-colors duration-300 hover:text-white"
                style={{ color: THEME.textMuted }}
              >
                Home
              </Link>
              <Link
                to="/collections/all"
                className="font-medium transition-colors duration-300 hover:text-white"
                style={{ color: THEME.textMuted }}
              >
                Shop
              </Link>
              <div className="relative group">
                <button
                  className="flex items-center gap-1 font-medium transition-colors duration-300 hover:text-white"
                  style={{ color: THEME.textMuted }}
                >
                  Categories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: '12px',
                  }}
                >
                  <div className="py-2">
                    {(categories.length > 0
                      ? categories
                      : [
                          { title: 'Fashion', slug: 'fashion' },
                          { title: 'Electronics', slug: 'electronics' },
                          { title: 'Home & Living', slug: 'home' },
                          { title: 'Beauty', slug: 'beauty' },
                        ]
                    )
                      .slice(0, 5)
                      .map((category: any, index) => (
                        <Link
                          key={index}
                          to={`/collections/${category.slug || category.title?.toLowerCase()}`}
                          className="block px-4 py-2.5 text-sm transition-colors duration-300"
                          style={{ color: THEME.textMuted || '#9CA3AF' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = THEME.primary || '#C8A961';
                            e.currentTarget.style.backgroundColor = `${THEME.primary || '#C8A961'}10`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = THEME.textMuted || '#9CA3AF';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {category.title || 'Category'}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
              <Link
                to="/about"
                className="font-medium transition-colors duration-300 hover:text-white"
                style={{ color: THEME.textMuted }}
              >
                About
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-3 rounded-xl transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'transparent' }}
                aria-label="Search"
              >
                <Search size={20} style={{ color: THEME.textMuted }} />
              </button>
              <Link
                to="/wishlist"
                className="p-3 rounded-xl transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'transparent' }}
                aria-label="Wishlist"
              >
                <Heart size={20} style={{ color: THEME.textMuted }} />
              </Link>
              <Link
                to="/cart"
                className="p-3 rounded-xl transition-all duration-300 hover:scale-105 relative"
                style={{ backgroundColor: 'transparent' }}
                aria-label="Cart"
              >
                <ShoppingBag size={20} style={{ color: THEME.textMuted }} />
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                    color: '#0A0A0C',
                  }}
                >
                  0
                </span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-3 rounded-xl transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X size={24} style={{ color: THEME.text }} />
                ) : (
                  <Menu size={24} style={{ color: THEME.textMuted }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: THEME.background }}
      >
        <div className="flex flex-col h-full pt-24 px-6">
          <nav className="flex flex-col gap-4">
            {['Home', 'Shop', 'Categories', 'About', 'Contact'].map((item, index) => (
              <Link
                key={item}
                to={
                  item === 'Home'
                    ? '/'
                    : item === 'Shop'
                      ? '/collections/all'
                      : `/${item.toLowerCase()}`
                }
                className="text-2xl font-bold py-4 border-b transition-colors duration-300"
                style={{ color: THEME.text, borderColor: THEME.border }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pb-8">
            <div className="flex gap-4">
              <Link
                to="/login"
                className="flex-1 py-4 text-center rounded-xl font-semibold"
                style={{
                  backgroundColor: 'transparent',
                  border: `2px solid ${THEME.border}`,
                  color: THEME.text,
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex-1 py-4 text-center rounded-xl font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                  color: '#0A0A0C',
                }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
}

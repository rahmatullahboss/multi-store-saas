/**
 * StoreHeader Component
 * 
 * Template-aware header component that provides consistent navigation
 * across all store pages (home, products, cart, checkout).
 * 
 * Supports all template themes with appropriate colors and styling.
 * Includes Google Sign-In for customer authentication.
 */

import { Link } from '@remix-run/react';
import { useState } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { Menu, X, Search, ShoppingCart, User, LogOut } from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';

interface StoreHeaderProps {
  storeName: string;
  logo?: string | null;
  theme: StoreTemplateTheme;
  templateId: string;
  cartCount?: number;
  storeId?: number;
  customer?: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
}

export function StoreHeader({ 
  storeName, 
  logo, 
  theme, 
  templateId,
  cartCount = 0,
  storeId,
  customer
}: StoreHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  // Determine if this is a dark theme
  const isDarkTheme = templateId === 'modern-premium' || templateId === 'tech-modern';
  
  // Header background classes based on theme
  const headerBg = isDarkTheme 
    ? 'bg-gray-900/95 border-gray-800' 
    : 'bg-white/95 border-gray-200';
  
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-900';
  const mutedColor = isDarkTheme ? 'text-gray-400' : 'text-gray-500';
  const hoverBg = isDarkTheme ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  const count = useCartCount();

  return (
    <header className={`sticky top-0 z-50 w-full border-b ${headerBg} backdrop-blur supports-[backdrop-filter]:bg-opacity-60`}>
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 lg:px-10">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg ${hoverBg} transition`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className={`h-5 w-5 ${textColor}`} />
          ) : (
            <Menu className={`h-5 w-5 ${textColor}`} />
          )}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-1 justify-center md:flex-none md:justify-start md:mr-6">
          {logo && (
            <img src={logo} alt={storeName} className="h-8 w-8 object-contain" />
          )}
          <span className={`text-xl font-bold tracking-tight ${textColor}`}>{storeName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
          <Link to="/" className={`text-sm font-medium ${mutedColor} hover:${textColor} transition-colors`}>
            Home
          </Link>
          <Link 
            to="/products" 
            className="text-sm font-medium transition-colors"
            style={{ color: theme.primary }}
          >
            Shop
          </Link>
          <Link to="/about" className={`text-sm font-medium ${mutedColor} hover:${textColor} transition-colors`}>
            About
          </Link>
          <Link to="/contact" className={`text-sm font-medium ${mutedColor} hover:${textColor} transition-colors`}>
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          {/* Search */}
          {searchOpen ? (
            <div className={`absolute left-0 right-0 top-0 z-50 flex h-16 items-center gap-2 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'} px-4`}>
              <input
                type="text"
                placeholder="Search products..."
                className={`flex-1 px-4 py-2 rounded-lg border ${isDarkTheme ? 'border-gray-700 bg-transparent text-white' : 'border-gray-200'} focus:outline-none focus:ring-2`}
                style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className={`p-2 rounded-lg ${hoverBg}`}
              >
                <X className={`h-5 w-5 ${textColor}`} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2 rounded-lg ${hoverBg} transition`}
            >
              <Search className={`h-5 w-5 ${textColor}`} />
            </button>
          )}

          {/* Customer Auth - Google Sign-In or User Menu */}
          {customer ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 p-2 rounded-lg ${hoverBg} transition`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: theme.primary }}
                >
                  {customer.name?.[0]?.toUpperCase() || customer.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>
              
              {userMenuOpen && (
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} py-2 z-50`}>
                  <div className={`px-4 py-2 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`text-sm font-medium ${textColor}`}>{customer.name || 'Customer'}</p>
                    <p className={`text-xs ${mutedColor}`}>{customer.email}</p>
                  </div>
                  <Link 
                    to="/account" 
                    onClick={() => setUserMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm ${mutedColor} ${hoverBg} transition`}
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link 
                    to="/account/orders" 
                    onClick={() => setUserMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm ${mutedColor} ${hoverBg} transition`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    My Orders
                  </Link>
                  <a 
                    href="/store/auth/logout"
                    className={`flex items-center gap-2 px-4 py-2 text-sm text-red-500 ${hoverBg} transition`}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </a>
                </div>
              )}
            </div>
          ) : storeId ? (
            <a
              href={`/store/auth/google?storeId=${storeId}&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
              style={{ color: isDarkTheme ? '#fff' : '#333', borderColor: isDarkTheme ? '#555' : '#ddd' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign In
            </a>
          ) : null}

          {/* Cart */}
          <Link
            to="/cart"
            className={`relative p-2 rounded-lg ${hoverBg} transition`}
          >
            <ShoppingCart className={`h-5 w-5 ${textColor}`} />
            <span 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              {count}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className={`md:hidden border-t ${isDarkTheme ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${hoverBg} transition ${textColor}`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition"
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
            >
              Shop
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${hoverBg} transition ${textColor}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${hoverBg} transition ${textColor}`}
            >
              Contact
            </Link>
            
            {/* Mobile Google Sign-In */}
            {!customer && storeId && (
              <a
                href={`/store/auth/google?storeId=${storeId}&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium border border-gray-300 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </a>
            )}
            
            {/* Mobile User Menu */}
            {customer && (
              <>
                <div className={`px-4 py-2 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-100'}`}>
                  <p className={`text-sm font-medium ${textColor}`}>{customer.name || 'Customer'}</p>
                  <p className={`text-xs ${mutedColor}`}>{customer.email}</p>
                </div>
                <Link 
                  to="/account" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${hoverBg} transition ${textColor}`}
                >
                  <User className="h-5 w-5" />
                  My Account
                </Link>
                <a 
                  href="/store/auth/logout"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${hoverBg} transition text-red-500`}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </a>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}


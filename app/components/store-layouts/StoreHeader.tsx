/**
 * StoreHeader Component
 * 
 * Template-aware header component that provides consistent navigation
 * across all store pages (home, products, cart, checkout).
 * 
 * Supports all template themes with appropriate colors and styling.
 */

import { Link } from '@remix-run/react';
import { useState } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { Menu, X, Search, ShoppingCart } from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';

interface StoreHeaderProps {
  storeName: string;
  logo?: string | null;
  theme: StoreTemplateTheme;
  templateId: string;
  cartCount?: number;
}

export function StoreHeader({ 
  storeName, 
  logo, 
  theme, 
  templateId,
  cartCount = 0 
}: StoreHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);


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
          </div>
        </nav>
      )}
    </header>
  );
}

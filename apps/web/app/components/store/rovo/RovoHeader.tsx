import { Link } from 'react-router';
import { ShoppingBag, Menu, Search, User } from 'lucide-react';

interface RovoHeaderProps {
  storeName: string;
  logo?: string | null;
  cartCount?: number;
  categories?: string[];
  currentCategory?: string | null;
  socialLinks?: unknown;
}

export function RovoHeader({ storeName, logo, cartCount = 0 }: RovoHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-gray-900">{storeName}</span>
            )}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/collections" className="text-sm text-gray-600 hover:text-gray-900">
              Shop
            </Link>
            <Link to="/collections/new" className="text-sm text-gray-600 hover:text-gray-900">
              New Arrivals
            </Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Search size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <User size={20} />
            </button>
            <Link to="/cart" className="p-2 text-gray-600 hover:text-gray-900 relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 text-gray-600">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

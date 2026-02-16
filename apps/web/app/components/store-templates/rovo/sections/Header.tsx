import { Link } from '@remix-run/react';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { StoreHeaderProps } from '~/templates/store-registry';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function RovoHeader({ 
  storeName, 
  logo, 
  categories, 
  currentCategory 
}: StoreHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
      } catch {
        setCartCount(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    
    updateCartCount(); // Initial load
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans",
          isScrolled ? "bg-white/95 backdrop-blur shadow-sm border-b py-3" : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 hover:bg-black/5 rounded-full"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 md:h-10 w-auto object-contain" />
              ) : (
                <span className="text-2xl md:text-3xl font-bold tracking-tighter uppercase font-heading">
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                to="/" 
                className={cn(
                  "text-sm font-medium uppercase tracking-wide hover:text-red-600 transition-colors",
                  !currentCategory ? "text-red-600" : "text-gray-900"
                )}
              >
                Home
              </Link>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {categories.filter(Boolean).slice(0, 5).map((category: any) => {
                const title = typeof category === 'string' ? category : category?.title;
                if (!title) return null;
                const encodedSlug = encodeURIComponent(title);
                return (
                  <Link
                    key={title}
                    to={`/products/${encodedSlug}`}
                    className="text-sm font-medium uppercase tracking-wide text-gray-900 hover:text-red-600 transition-colors"
                  >
                    {title}
                  </Link>
                );
              })}
              <Link to="/products" className="text-sm font-medium uppercase tracking-wide text-gray-900 hover:text-red-600 transition-colors">
                Shop
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <Link to="/account" className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block">
                <User className="w-5 h-5" />
              </Link>

              <button 
                className="p-2 hover:bg-black/5 rounded-full transition-colors relative group"
                aria-label="Cart"
                onClick={() => window.dispatchEvent(new CustomEvent('open-cart-drawer'))}
              >
                <ShoppingBag className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-20" /> 

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
                <Link to="/" className="p-3 hover:bg-gray-50 rounded-lg font-medium">Home</Link>
                {categories.filter(Boolean).map((cat) => (
                  <Link key={cat} to={`/collections/${cat}`} className="p-3 hover:bg-gray-50 rounded-lg font-medium">
                    {cat}
                  </Link>
                ))}
                <Link to="/products" className="p-3 hover:bg-gray-50 rounded-lg font-medium">All Products</Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { Link } from '@remix-run/react';
import { ShoppingBag, Search, Menu, X, User, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { StoreHeaderProps } from '~/templates/store-registry';
import { LanguageSelector } from '../../shared/LanguageSelector';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function SokolHeader({ 
  storeName, 
  logo, 
  categories, 
  currentCategory,
  isPreview 
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
    
    updateCartCount();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const LinkComponent = isPreview ? 'span' : Link;

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
            <LinkComponent to="/" className="flex-shrink-0">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 md:h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl md:text-2xl font-bold tracking-tight font-heading text-[#0D0D0D]">
                  {storeName}
                </span>
              )}
            </LinkComponent>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <LinkComponent 
                to="/" 
                className={cn(
                  "text-sm font-medium tracking-wide hover:text-rose-600 transition-colors",
                  !currentCategory ? "text-rose-600" : "text-gray-700"
                )}
              >
                Home
              </LinkComponent>
              {categories?.filter(Boolean).slice(0, 5).map((category) => (
                <LinkComponent
                  key={category}
                  to={`/collections/${category}`}
                  className="text-sm font-medium tracking-wide text-gray-700 hover:text-rose-600 transition-colors"
                >
                  {category}
                </LinkComponent>
              ))}
              <LinkComponent 
                to="/products" 
                className="text-sm font-medium tracking-wide text-gray-700 hover:text-rose-600 transition-colors"
              >
                All Products
              </LinkComponent>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex">
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              
              <LinkComponent 
                to="/wishlist" 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex"
              >
                <Heart className="w-5 h-5 text-gray-700" />
              </LinkComponent>

              <LinkComponent 
                to="/account" 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex"
              >
                <User className="w-5 h-5 text-gray-700" />
              </LinkComponent>

              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
                aria-label="Cart"
                onClick={() => window.dispatchEvent(new CustomEvent('open-cart-drawer'))}
              >
                <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-rose-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              
               <div className="hidden md:block">
                 <LanguageSelector />
               </div>
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
              <span className="font-bold font-heading text-lg">{storeName}</span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col space-y-1 px-2">
                <LinkComponent 
                  to="/" 
                  className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </LinkComponent>
                {categories?.filter(Boolean).map((cat) => (
                  <LinkComponent 
                    key={cat} 
                    to={`/products/${cat}`} 
                    className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </LinkComponent>
                ))}
                <LinkComponent 
                  to="/products" 
                  className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                </LinkComponent>
              </nav>
            </div>
            <div className="p-4 border-t border-gray-100">
              <LinkComponent 
                to="/account" 
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">My Account</span>
              </LinkComponent>
              <div className="mt-4">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

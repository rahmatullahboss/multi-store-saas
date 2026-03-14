
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { 
  Menu, X, Search, ShoppingCart, 
  User, ArrowRight, Grid
} from 'lucide-react';
import { ZENITH_RISE_THEME } from '~/components/store-templates/zenith-rise/styles/tokens';
import type { SocialLinks, ThemeConfig } from '@db/types';
import { LanguageSelector } from '../../shared/LanguageSelector';

interface ZenithRiseHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories?: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
}

export function ZenithRiseHeader({ 
  storeName, 
  logo, 
  isPreview, 
  categories = [], 
  currentCategory,
  config
}: ZenithRiseHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCartCount();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-slate-950/80 backdrop-blur-md border-slate-800 py-3' 
            : 'bg-transparent border-transparent py-5'
        }`}
        style={{
          fontFamily: ZENITH_RISE_THEME.fontFamily
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                  <span className="text-white font-bold text-xl">{storeName.charAt(0)}</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  {storeName}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/?category=all" className="hover:text-white transition-colors">Products</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            
            {/* CTA Button */}
            {!isPreview && (
               <Link 
                to="/#products"
                className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2"
               >
                 Shop Now
                 <ArrowRight size={16} />
               </Link>
            )}
          </nav>

          {/* Mobile/Right Actions */}
          <div className="flex items-center gap-4">
             <div className="hidden md:block">
               <LanguageSelector />
             </div>
             <Link to="/cart" className="relative p-2 text-slate-300 hover:text-white transition-colors">
               <ShoppingCart size={22} />
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-pink-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-950">
                    {cartCount}
                 </span>
               )}
             </Link>
             
             <button 
               className="md:hidden p-2 text-slate-300 hover:text-white"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-center items-center gap-8 md:hidden animate-in fade-in slide-in-from-top-10 duration-200">
           <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Home</Link>
           <Link to="/?category=all" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-gray-400 hover:text-white">Products</Link>
           <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-gray-400 hover:text-white">Cart ({cartCount})</Link>
           
           <div className="mt-4">
             <LanguageSelector />
           </div>
           
           <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white">
             <X size={32} />
           </button>
        </div>
      )}
    </>
  );
}

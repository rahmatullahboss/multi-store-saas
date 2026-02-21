import { Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, ArrowRight } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ZENITH_RISE_THEME_CONFIG } from '../index';

export const schema: SectionSchema = {
  type: 'header',
  name: 'Header',
  settings: [
    {
      type: 'image_picker',
      id: 'logo',
      label: 'Logo',
    },
    {
      type: 'checkbox',
      id: 'show_cta',
      label: 'Show CTA Button',
      default: true,
    },
    {
      type: 'text',
      id: 'cta_label',
      label: 'CTA Label',
      default: 'Shop Now',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'CTA Link',
      default: '/#products',
    },
  ],
};

export default function ZenithHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, getLink, collections } = context;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;
  
  const logoUrl = typeof settings.logo === 'string' ? settings.logo : store.logo;
  const categories = collections?.map(c => c.title) || [];

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
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to={getLink('/')} className="flex items-center gap-2 group">
            {logoUrl ? (
              <img src={logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                  <span className="text-white font-bold text-xl">{store.name.charAt(0)}</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  {store.name}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to={getLink('/')} className="hover:text-white transition-colors">Home</Link>
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category}
                to={getLink(`/?category=${encodeURIComponent(category)}`)}
                className="hover:text-white transition-colors"
              >
                {category}
              </Link>
            ))}
            <Link to={getLink('/products')} className="hover:text-white transition-colors">All Products</Link>
            
            {/* CTA Button */}
            {(settings.show_cta as boolean) && (
               <Link 
                to={getLink(settings.cta_link as string || '/#products')}
                className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2"
               >
                 {settings.cta_label as string}
                 <ArrowRight size={16} />
               </Link>
            )}
          </nav>

          {/* Mobile/Right Actions */}
          <div className="flex items-center gap-4">
             <Link to={getLink('/cart')} className="relative p-2 text-slate-300 hover:text-white transition-colors">
               <ShoppingCart size={22} />
               {itemCount > 0 && (
                 <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-pink-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-950">
                    {itemCount}
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
           <Link to={getLink('/')} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Home</Link>
           {categories.map((cat) => (
             <Link 
               key={cat} 
               to={getLink(`/?category=${encodeURIComponent(cat)}`)} 
               onClick={() => setMobileMenuOpen(false)} 
               className="text-2xl font-bold text-gray-400 hover:text-white"
             >
               {cat}
             </Link>
           ))}
           <Link to={getLink('/products')} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-gray-400 hover:text-white">All Products</Link>
           <Link to={getLink('/cart')} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-gray-400 hover:text-white">Cart ({itemCount})</Link>
           
           <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white">
             <X size={32} />
           </button>
        </div>
      )}
    </>
  );
}

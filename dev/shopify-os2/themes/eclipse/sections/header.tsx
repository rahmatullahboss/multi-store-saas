import { Link } from '@remix-run/react';
import { Zap, ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ECLIPSE_THEME_CONFIG } from '../index';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'header',
  name: 'Header',
  limit: 1,
  settings: [
    {
      type: 'link_list',
      id: 'menu',
      label: 'Main menu',
    },
    {
      type: 'image_picker',
      id: 'logo',
      label: 'Logo image',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function EclipseHeader({ context, settings }: SectionComponentProps) {
  const { store, cart, getLink } = context;
  const config = ECLIPSE_THEME_CONFIG.colors!;
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;
  
  // Use store logo or fallback to settings logo
  const logoUrl = typeof settings.logo === 'string' ? settings.logo : store.logo;
  const categories = context.collections?.map(c => c.title) || [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 font-sans">
      <div 
        className="w-full max-w-5xl rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300"
        style={{ 
          backgroundColor: config.headerBg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${config.border}`,
          boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        {/* Logo */}
        <Link to={getLink('/')} className="flex items-center gap-2 group">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12"
            style={{ background: config.accentGradient }}
          >
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          {logoUrl ? (
            <img src={logoUrl} alt={store.name} className="h-6 object-contain" />
          ) : (
            <span 
              className="font-bold text-lg tracking-tight text-white"
              style={{ fontFamily: ECLIPSE_THEME_CONFIG.typography?.fontFamilyHeading }}
            >
              {store.name}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to={getLink('/')} className="text-sm font-medium hover:text-white transition-colors text-white/70">
            Store
          </Link>
          {categories.slice(0, 3).map(cat => (
            <Link 
              key={cat} 
              to={getLink(`/collections/${cat?.toLowerCase().replace(/\s+/g, '-')}`)}
              className="text-sm font-medium hover:text-white transition-colors text-white/70 hover:text-violet-400"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to={getLink('/cart')} className="relative group p-2">
            <ShoppingBag className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
            {itemCount > 0 && (
              <span 
                className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: config.accent, color: 'white' }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
             {mobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
      
       {mobileMenuOpen && (
        <div className="absolute top-24 left-4 right-4 bg-gray-900 rounded-2xl p-4 border border-white/10 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            <Link
              to={getLink('/')}
              onClick={() => setMobileMenuOpen(false)}
              className="text-left text-white py-2 px-2 hover:bg-white/5 rounded"
            >
              All Products
            </Link>
            {categories.map((cat) => (
                <Link
                  key={cat}
                  to={getLink(`/collections/${cat?.toLowerCase().replace(/\s+/g, '-')}`)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left text-white/70 py-2 px-2 hover:bg-white/5 rounded"
                >
                  {cat}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

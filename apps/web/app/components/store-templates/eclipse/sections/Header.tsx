import { Link } from '@remix-run/react';
import { Zap, ShoppingBag, Menu, Search } from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { ECLIPSE_THEME } from '../theme';
import { useState, useEffect } from 'react';

import type { SocialLinks, ThemeConfig } from '@db/types';

interface EclipseHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories?: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
}

export function EclipseHeader({ storeName, logo, categories = [] }: EclipseHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const count = useCartCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500"
    >
      <div 
        className="w-full max-w-5xl rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300"
        style={{ 
          backgroundColor: ECLIPSE_THEME.headerBg,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${ECLIPSE_THEME.border}`,
          boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12"
            style={{ background: ECLIPSE_THEME.accentGradient }}
          >
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          {logo ? (
            <img src={logo} alt={storeName} className="h-6 object-contain" />
          ) : (
            <span 
              className="font-bold text-lg tracking-tight text-white"
              style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
            >
              {storeName}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium hover:text-white transition-colors text-white/70">
            Store
          </Link>
          {categories.slice(0, 3).map(cat => cat && (
            <Link 
              key={cat} 
              to={`/?category=${encodeURIComponent(cat)}`}
              className="text-sm font-medium hover:text-white transition-colors text-white/70 hover:text-violet-400"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative group p-2">
            <ShoppingBag className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
            {count > 0 && (
              <span 
                className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: ECLIPSE_THEME.accent, color: 'white' }}
              >
                {count}
              </span>
            )}
          </Link>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}

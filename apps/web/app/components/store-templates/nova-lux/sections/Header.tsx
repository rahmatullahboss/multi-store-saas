import { ShoppingBag, Search, Menu, X, Sparkles, User } from 'lucide-react';
import { Link } from '@remix-run/react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { useState, useEffect } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { useTranslation } from '~/contexts/LanguageContext';
import { NOVALUX_THEME } from '../theme';
import { LanguageSelector } from '../../shared/LanguageSelector';
import type { ThemeConfig } from '@db/types';

import type { StoreCategory } from '~/templates/store-registry';

interface NovaLuxHeaderProps {
  storeName: string;
  logo?: string | null;
  config?: ThemeConfig | null;
  currentCategory?: string | null;
  categories: (string | StoreCategory | null)[];
  isPreview?: boolean;
  customer?: { id: number; name: string | null; email: string | null } | null;
}

export function NovaLuxHeader({
  storeName,
  logo,
  config,
  currentCategory,
  categories,
  isPreview,
  customer,
}: NovaLuxHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const count = useCartCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validCategories = categories.filter(Boolean);
  const announcement = config?.announcement;

  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    text: NOVALUX_THEME.text,
    cardBg: NOVALUX_THEME.cardBg,
    muted: NOVALUX_THEME.muted,
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? NOVALUX_THEME.headerBgSolid : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        boxShadow: isScrolled ? NOVALUX_THEME.headerShadow : 'none',
        borderBottom: isScrolled ? `1px solid ${NOVALUX_THEME.border}` : 'none',
      }}
    >
      {/* Announcement Bar */}
      {announcement?.text && (
        <div
          className="text-center py-2.5 text-sm font-medium transition-all"
          style={{
            background: NOVALUX_THEME.accentGradient,
            color: THEME.primary,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {announcement.link ? (
              <a href={announcement.link} className="hover:underline">
                {announcement.text}
              </a>
            ) : (
              announcement.text
            )}
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: THEME.primary }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: THEME.primary }} />
            )}
          </button>

          {/* Left Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <PreviewSafeLink
              to="/"
              className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
              style={{ color: !currentCategory ? THEME.accent : THEME.text }}
              isPreview={isPreview}
            >
              {t('allProducts')}
            </PreviewSafeLink>
            {validCategories.slice(0, 3).map((cat) => {
              const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
              return (
                <PreviewSafeLink
                  key={title}
                  to={`/?category=${encodeURIComponent(title)}`}
                  className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                  style={{ color: currentCategory === title ? THEME.accent : THEME.text }}
                  isPreview={isPreview}
                >
                  {title}
                </PreviewSafeLink>
              );
            })}
          </nav>

          {/* Logo */}
          <PreviewSafeLink
            to="/"
            className="flex items-center justify-center"
            isPreview={isPreview}
          >
            {logo ? (
              <img
                src={logo}
                alt={storeName}
                className="h-10 lg:h-12 object-contain bg-white rounded px-2 py-1"
              />
            ) : (
              <span
                className="text-2xl lg:text-3xl font-semibold tracking-wider"
                style={{
                  fontFamily: NOVALUX_THEME.fontHeading,
                  color: THEME.primary,
                }}
              >
                {storeName}
              </span>
            )}
          </PreviewSafeLink>

          {/* Right Navigation */}
          <div className="flex items-center gap-2">
            <LanguageSelector className="mr-1" />
            <button className="p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100">
              <Search className="w-5 h-5" style={{ color: THEME.text }} />
            </button>
            <PreviewSafeLink
              to="/cart"
              className="p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100 relative"
              isPreview={isPreview}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: THEME.text }} />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: NOVALUX_THEME.accentGradient, color: THEME.primary }}
                >
                  {count}
                </span>
              )}
            </PreviewSafeLink>
            {!isPreview && (
              <Link
                to="/account"
                className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-full transition-all duration-300 hover:bg-gray-100"
                title={customer ? customer.name || customer.email || 'My Account' : 'Login'}
              >
                {customer ? (
                  <>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{
                        background: NOVALUX_THEME.accentGradient,
                        color: THEME.primary,
                      }}
                    >
                      {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <span
                      className="text-sm font-medium hidden md:block"
                      style={{ color: THEME.text }}
                    >
                      {customer.name || customer.email?.split('@')[0] || 'Account'}
                    </span>
                  </>
                ) : (
                  <User className="w-5 h-5" style={{ color: THEME.text }} />
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

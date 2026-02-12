/**
 * Account Header Component
 * 
 * Provides a consistent header for account pages that matches the starter-store theme.
 * This replaces the generic top header in account layout with a theme-aware version.
 */

import { Link } from '@remix-run/react';
import { Search, Bell, User, Home, Menu } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useTranslation } from '~/contexts/LanguageContext';

interface AccountHeaderProps {
  storeName: string;
  logo?: string | null;
  userName: string;
  loyaltyTier?: string;
  theme: {
    primary: string;
    accent: string;
    headerBg?: string;
    text?: string;
  };
  onMobileMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

export function AccountHeader({
  storeName,
  logo,
  userName,
  loyaltyTier = 'Member',
  theme,
  onMobileMenuToggle,
  showMobileMenu = false,
}: AccountHeaderProps) {
  const { t } = useTranslation();

  const headerBg = theme.headerBg || '#ffffff';
  const textColor = theme.text || '#1f2937';

  return (
    <header 
      className="h-20 border-b flex items-center justify-between px-6 sticky top-0 z-10 transition-colors"
      style={{ 
        backgroundColor: headerBg,
        borderBottomColor: theme.primary + '20'
      }}
    >
      {/* Left Section - Mobile Menu + Logo/Store Name */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMobileMenuToggle}
            style={{ color: textColor }}
            className="hover:bg-opacity-10"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Store Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          {logo ? (
            <img 
              src={logo} 
              alt={storeName} 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          ) : (
            <span 
              className="text-xl font-bold transition-colors"
              style={{ color: theme.primary }}
            >
              {storeName}
            </span>
          )}
          <span 
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: theme.primary + '15',
              color: theme.primary
            }}
          >
            <Home className="h-4 w-4" />
            {t('myAccount') || 'My Account'}
          </span>
        </Link>
      </div>

      {/* Center Section - Search Bar (Hidden on mobile) */}
      <div className="hidden md:flex items-center rounded-lg px-4 py-2 w-96 border focus-within:ring-2 transition-all"
        style={{
          backgroundColor: headerBg === '#ffffff' ? '#f9fafb' : 'rgba(255,255,255,0.05)',
          borderColor: theme.primary + '30',
        }}
      >
        <Search className="h-5 w-5" style={{ color: theme.primary + '80' }} />
        <input 
          className="bg-transparent border-none outline-none text-sm w-full ml-3 placeholder-opacity-60" 
          placeholder={t('searchProducts') || "Search products..."} 
          type="text"
          style={{ color: textColor }}
        />
      </div>

      {/* Right Section - Notifications + User Profile */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button 
          className="relative p-2 rounded-full transition-colors hover:bg-opacity-10"
          style={{ color: textColor }}
        >
          <Bell className="h-6 w-6" />
          <span 
            className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
            style={{ 
              backgroundColor: theme.accent,
              borderColor: headerBg
            }}
          ></span>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 border-l pl-4"
          style={{ borderLeftColor: theme.primary + '20' }}
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold capitalize" style={{ color: textColor }}>
              {userName}
            </p>
            <p className="text-xs capitalize" style={{ color: theme.primary }}>
              {loyaltyTier}
            </p>
          </div>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm"
            style={{ 
              backgroundColor: theme.primary + '15',
              borderColor: theme.primary,
              color: theme.primary
            }}
          >
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}

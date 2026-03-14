import { Link, useLocation, useRouteLoaderData } from 'react-router';
import {
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  LogOut,
  User,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { useTranslation } from '~/contexts/LanguageContext';

export interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  badge?: number;
  isLogout?: boolean;
}

function SidebarItem({ href, icon: Icon, label, isActive, badge, isLogout }: SidebarItemProps) {
  if (isLogout) {
    return (
      <form action="/store/auth/logout" method="post" className="mt-auto pt-4 border-t border-slate-100">
        <button
          type="submit"
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors rounded-lg group"
        >
          <Icon className="text-xl h-5 w-5" />
          <span>{label}</span>
        </button>
      </form>
    );
  }

  const activeTheme = (SidebarItem as unknown as { theme?: { primary: string } }).theme || { primary: '#6366f1' };
  
  return (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg group',
        isActive
          ? 'text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      )}
      style={isActive ? {
        backgroundColor: activeTheme.primary,
        boxShadow: `0 4px 6px -1px ${activeTheme.primary}30`
      } : undefined}
    >
      <Icon className={cn("text-xl h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-400")} 
        style={!isActive ? { color: 'currentColor' } : undefined}
      />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className={cn(
          "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
          isActive ? "bg-white/20 text-white" : ""
        )}
        style={!isActive ? {
          backgroundColor: `${activeTheme.primary}15`,
          color: activeTheme.primary
        } : undefined}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

interface AccountSidebarProps {
    user?: { name?: string };
    theme?: {
      primary?: string;
      accent?: string;
    };
}

export function AccountSidebar({ user, theme }: AccountSidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation();
  const loaderData = useRouteLoaderData('routes/account') as { 
    counts?: { wishlist: number; coupons: number },
    store?: { name: string; logo?: string },
    theme?: { primary: string; accent: string }
  } | undefined;
  
  const counts = loaderData?.counts;
  const activeTheme = theme || loaderData?.theme || { primary: '#6366f1', accent: '#f59e0b' };

  // Items matching HTML "Variant 2" Sidebar
  const items = [
    {
      href: '/account',
      icon: LayoutDashboard,
      label: t('navDashboard') || 'Dashboard',
    },
    {
      href: '/account/profile',
      icon: User,
      label: t('navProfile') || 'Personal Profile',
    },
    {
      href: '/account/addresses',
      icon: MapPin,
      label: t('navAddresses') || 'Address Book',
    },
    {
      href: '/account/orders',
      icon: ShoppingBag,
      label: t('navOrders') || 'My Orders',
      badge: 0, 
    },
    {
      href: '/account/wishlist',
      icon: Heart,
      label: t('wishlist') || 'My Wishlist',
      badge: counts?.wishlist,
    },
    {
      href: '/account/payment-methods', // Placeholder route 
      icon: CreditCard,
      label: t('paymentMethods') || 'Payment Options',
    },
  ];

  // Helper to check active state
  const isItemActive = (item: typeof items[0]) => {
    if (pathname === item.href) return true;
    return pathname.startsWith(item.href) && item.href !== '/account'; // Basic logic
  };

  // Set theme for SidebarItem components
  (SidebarItem as unknown as { theme: typeof activeTheme }).theme = activeTheme;

  return (
    <aside className="w-64 bg-white rounded-xl p-6 border shadow-sm flex flex-col h-full sticky top-6"
      style={{ borderColor: `${activeTheme.primary}20` }}
    >
      {/* Profile Area */}
      <div className="flex items-center gap-4 mb-8">
        <div 
          className="h-12 w-12 rounded-full overflow-hidden relative flex items-center justify-center font-bold text-lg"
          style={{ 
            backgroundColor: `${activeTheme.primary}15`,
            color: activeTheme.primary
          }}
        >
           {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-sm text-slate-500">Hello,</p>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{user?.name || 'Customer'}</h3>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isItemActive(item)}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-slate-100">
         <form action="/store/auth/logout" method="post">
            <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors rounded-lg group">
                <LogOut className="text-xl h-5 w-5" />
                <span>Sign Out</span>
            </button>
         </form>
      </div>
    </aside>
  );
}

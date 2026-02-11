import { Link, useLocation } from '@remix-run/react';
import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { useTranslation } from '~/contexts/LanguageContext';

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

function SidebarItem({ href, icon: Icon, label, isActive }: SidebarItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
        isActive
          ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      )}
    >
      <div
        className={cn(
          'p-2 rounded-lg transition-colors',
          isActive ? 'bg-primary/10' : 'bg-muted group-hover:bg-background'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1">{label}</span>
      <ChevronRight
        className={cn(
          'h-4 w-4 transition-transform',
          isActive ? 'text-primary rotate-90' : 'opacity-0 group-hover:opacity-50'
        )}
      />
    </Link>
  );
}

export function AccountSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation();

  const items = [
    {
      href: '/account',
      icon: LayoutDashboard,
      label: t('navDashboard'),
      exact: true,
    },
    {
      href: '/account/orders',
      icon: ShoppingBag,
      label: t('navOrders'),
    },
    {
      href: '/account/profile',
      icon: User,
      label: t('navProfile'),
    },
    {
      href: '/account/addresses',
      icon: MapPin,
      label: t('navAddresses'),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t('myAccount')}</h2>
            <p className="text-xs text-muted-foreground">{t('accountWelcomeDesc')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
            />
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-border/50">
        <div className="rounded-xl bg-muted/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>{t('needHelpAccount')}</span>
          </div>
          <Link to="/contact" className="block text-xs text-primary hover:underline">
            {t('contactSupport')}
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-border/50">
        <form action="/store/auth/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="flex-1">{t('navLogout')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

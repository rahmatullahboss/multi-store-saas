import { Link, useLocation } from '@remix-run/react';
import { Home, ShoppingBag, User, ShoppingCart, Heart } from 'lucide-react';
import { useCartCount } from '~/hooks/useCartCount';
import { useWishlist } from '~/hooks/useWishlist';
import { cn } from '~/lib/utils';
import { useIsMobile } from '~/hooks/useIsMobile';

interface MobileBottomNavProps {
  storeName?: string;
  theme?: {
    primary?: string;
    accent?: string;
  };
  wishlistEnabled?: boolean;
}

export function MobileBottomNav({
  storeName: _storeName,
  theme,
  wishlistEnabled = true,
}: MobileBottomNavProps) {
  const location = useLocation();
  const cartCount = useCartCount();
  const { count: wishlistCount } = useWishlist();
  const isMobile = useIsMobile();

  const pathname = location.pathname;

  // Hide on admin pages, checkout, and order pages
  const hiddenPaths = ['/app/', '/checkout', '/thank-you/'];
  if (hiddenPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  // Only show on mobile
  if (!isMobile) return null;

  const primaryColor = theme?.primary || '#4F46E5';

  const navItems = [
    { href: '/store', icon: Home, label: 'Home', exact: true },
    { href: '/products', icon: ShoppingBag, label: 'Products' },
    ...(wishlistEnabled
      ? [{ href: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlistCount }]
      : []),
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { href: '/account', icon: User, label: 'Account' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 relative',
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700 active:scale-95'
              )}
              style={{ color: isActive ? primaryColor : undefined }}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in duration-200"
                    style={{ backgroundColor: theme?.accent || '#F59E0B' }}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn('text-xs transition-all', isActive ? 'font-semibold' : 'font-medium')}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

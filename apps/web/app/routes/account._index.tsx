import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerStats, getCustomerOrders, getCustomerWishlist } from '~/services/customer-account.server';
import {
  Package,
  DollarSign,
  Award,
  ShoppingBag,
  User,
  ArrowRight,
  Heart,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/Badge';
import { useTranslation } from '~/contexts/LanguageContext';
import { format } from 'date-fns';

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { storeId, store } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  
  const [stats, recentOrders, wishlist] = await Promise.all([
    getCustomerStats(customerId, storeId, db),
    getCustomerOrders(customerId, storeId, db, 3, 0),
    getCustomerWishlist(customerId, storeId, db)
  ]);

  return json({ 
    stats, 
    recentOrders, 
    wishlistCount: wishlist.length,
    storeCurrency: store.currency 
  });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  className?: string;
  description?: string;
  gradient?: string;
  to?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
  description,
  gradient = 'from-primary/10 to-primary/5',
  to
}: StatCardProps) {
  const Content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full',
        gradient,
        className
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/80 shadow-sm dark:bg-black/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        </div>
      </div>
      {/* Decorative background element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/30 blur-2xl dark:bg-white/5" />
    </div>
  );

  if (to) {
    return <Link to={to} className="block h-full">{Content}</Link>;
  }

  return Content;
}

function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  
  const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    pending: { label: t('statusPending'), icon: Clock, className: 'text-amber-700 border-amber-200 bg-amber-50' },
    confirmed: { label: t('statusConfirmed'), icon: CheckCircle2, className: 'text-blue-700 border-blue-200 bg-blue-50' },
    processing: { label: t('statusProcessing'), icon: Package, className: 'text-indigo-700 border-indigo-200 bg-indigo-50' },
    shipped: { label: t('statusShipped'), icon: Truck, className: 'text-purple-700 border-purple-200 bg-purple-50' },
    delivered: { label: t('statusDelivered'), icon: CheckCircle2, className: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    cancelled: { label: t('statusCancelled'), icon: XCircle, className: 'text-red-700 border-red-200 bg-red-50' },
    returned: { label: t('statusReturned'), icon: RotateCcw, className: 'text-gray-700 border-gray-200 bg-gray-50' },
  };

  const statusInfo = config[status] || config.pending;
  const Icon = statusInfo.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", statusInfo.className)}>
      <Icon className="h-3.5 w-3.5" />
      {statusInfo.label}
    </Badge>
  );
}

export default function AccountDashboard() {
  const { stats, recentOrders, wishlistCount, storeCurrency } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('accountWelcome')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('accountWelcomeDesc')}</p>
        </div>
        <div className="flex gap-3">
            <Button asChild variant="outline" className="rounded-full">
            <Link to="/account/wishlist">
                <Heart className="h-4 w-4 mr-2" />
                {t('wishlist')}
            </Link>
            </Button>
            <Button asChild className="rounded-full shadow-lg shadow-primary/20">
            <Link to="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t('startShoppingBtn')}
            </Link>
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('totalOrders')}
          value={stats.totalOrders}
          icon={Package}
          description={t('lifetimeOrdersAccount')}
          gradient="from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10"
          to="/account/orders"
        />
        <StatCard
          label={t('totalSpentAccount')}
          value={`${storeCurrency} ${stats.totalSpent.toFixed(0)}`}
          icon={DollarSign}
          description={t('lifetimeValueAccount')}
          gradient="from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10"
        />
        <StatCard
          label={t('loyaltyPoints')}
          value={stats.loyaltyPoints}
          icon={Award}
          description={`${stats.loyaltyTier} ${t('loyaltyTier')}`}
          gradient="from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10"
        />
        <StatCard
          label={t('wishlist')}
          value={wishlistCount}
          icon={Heart}
          description={t('savedItems')}
          gradient="from-pink-500/10 to-pink-500/5 dark:from-pink-500/20 dark:to-pink-500/10"
          to="/account/wishlist"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Orders - Spans 2 cols */}
        <div className="md:col-span-2 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{t('recentOrders')}</h3>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link to="/account/orders" className="text-muted-foreground hover:text-primary">
                    {t('viewAll')} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </Button>
          </div>
          
          <div className="flex-1">
            {recentOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <Package className="h-10 w-10 mb-2 opacity-20" />
                    <p>{t('noOrdersYetAccount')}</p>
                </div>
            ) : (
                <div className="divide-y divide-border/50">
                    {recentOrders.map(order => (
                        <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">#{order.orderNumber}</span>
                                    <OrderStatusBadge status={order.status || 'pending'} />
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-3">
                                    <span>{format(new Date(order.createdAt || new Date()), 'MMM d, yyyy')}</span>
                                    <span>•</span>
                                    <span className="font-medium text-foreground">{storeCurrency} {order.total}</span>
                                </div>
                            </div>
                            <Button asChild size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link to={`/account/orders/${order.id}`}>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Profile - Spans 1 col */}
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/50">
                    <h3 className="font-semibold text-lg">{t('quickActions')}</h3>
                </div>
                <div className="p-4 space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start h-auto py-3">
                        <Link to="/account/wishlist">
                            <Heart className="h-4 w-4 mr-3 text-pink-500" />
                            <div className="text-left">
                                <span className="font-semibold block text-sm">{t('wishlist')}</span>
                                <span className="text-xs text-muted-foreground">{wishlistCount} items saved</span>
                            </div>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start h-auto py-3">
                        <Link to="/account/coupons">
                            <Ticket className="h-4 w-4 mr-3 text-orange-500" />
                            <div className="text-left">
                                <span className="font-semibold block text-sm">{t('couponsAndOffers')}</span>
                                <span className="text-xs text-muted-foreground">View available discounts</span>
                            </div>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Profile Brief */}
            <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{t('accountDetailsAccount')}</p>
                        <Link to="/account/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            {t('editProfileBtn')} <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

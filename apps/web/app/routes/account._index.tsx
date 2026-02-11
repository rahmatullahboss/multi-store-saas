import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerStats } from '~/services/customer-account.server';
import {
  Package,
  DollarSign,
  Award,
  ShoppingBag,
  User,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { useTranslation } from '~/contexts/LanguageContext';

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  const stats = await getCustomerStats(customerId, storeId, db);

  return json({ stats });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  className?: string;
  description?: string;
  gradient?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
  description,
  gradient = 'from-primary/10 to-primary/5',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        gradient,
        className
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/80 shadow-sm">
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
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/30 blur-2xl" />
    </div>
  );
}

export default function AccountDashboard() {
  const { stats } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('accountWelcome')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('accountWelcomeDesc')}</p>
        </div>
        <Button asChild className="rounded-full shadow-lg shadow-primary/20">
          <Link to="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('startShoppingBtn')}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('totalOrders')}
          value={stats.totalOrders}
          icon={Package}
          description={t('lifetimeOrdersAccount')}
          gradient="from-blue-500/10 to-blue-500/5"
        />
        <StatCard
          label={t('totalSpentAccount')}
          value={`৳${stats.totalSpent.toFixed(0)}`}
          icon={DollarSign}
          description={t('lifetimeValueAccount')}
          gradient="from-emerald-500/10 to-emerald-500/5"
        />
        <StatCard
          label={t('loyaltyPoints')}
          value={stats.loyaltyPoints}
          icon={Award}
          description={`${stats.loyaltyTier} ${t('loyaltyTier')}`}
          gradient="from-amber-500/10 to-amber-500/5"
        />
        <StatCard
          label={t('deliveredOrdersAccount')}
          value={stats.totalOrders}
          icon={TrendingUp}
          description={t('lifetimeOrdersAccount')}
          gradient="from-purple-500/10 to-purple-500/5"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders Card */}
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('recentActivity')}</h3>
                <p className="text-sm text-muted-foreground">{t('orderHistoryDesc')}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-xl">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>{t('noActivityYet')}</p>
            </div>
          </div>
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <Button asChild variant="ghost" className="w-full group">
              <Link to="/account/orders">
                {t('viewOrderHistory')}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('accountDetailsAccount')}</h3>
                <p className="text-sm text-muted-foreground">{t('accountDetailsDesc')}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">{t('accountWelcome')}</p>
                  <p className="text-sm text-muted-foreground">{t('accountWelcomeDesc')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <Button asChild variant="ghost" className="w-full group">
              <Link to="/account/profile">
                {t('editProfileBtn')}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

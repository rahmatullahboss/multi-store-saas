/**
 * Super Admin Dashboard
 * 
 * Route: /admin (index)
 * 
 * Shows global metrics:
 * - Total stores (active vs suspended)
 * - Total monthly revenue
 * - Total orders processed
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sum, gte, sql } from 'drizzle-orm';
import { stores, orders, users } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  Store, 
  ShoppingCart, 
  DollarSign, 
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '~/utils/money';
import { GlassCard } from '~/components/ui/GlassCard';
import { useTranslation } from 'react-i18next';

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard - Super Admin' }];
};

// ============================================================================
// LOADER - Fetch global metrics
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const drizzleDb = drizzle(db);
  
  // Get current month start
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Total stores
  const totalStoresResult = await drizzleDb
    .select({ count: count() })
    .from(stores);
  
  // Active stores
  const activeStoresResult = await drizzleDb
    .select({ count: count() })
    .from(stores)
    .where(eq(stores.isActive, true));
  
  // Suspended stores
  const suspendedStoresResult = await drizzleDb
    .select({ count: count() })
    .from(stores)
    .where(eq(stores.isActive, false));
  
  // Total orders
  const totalOrdersResult = await drizzleDb
    .select({ count: count() })
    .from(orders);
  
  // Monthly orders
  const monthlyOrdersResult = await drizzleDb
    .select({ count: count() })
    .from(orders)
    .where(gte(orders.createdAt, monthStart));
  
  // Monthly revenue (sum of all order totals this month)
  const monthlyRevenueResult = await drizzleDb
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(gte(orders.createdAt, monthStart));
  
  // Total users
  const totalUsersResult = await drizzleDb
    .select({ count: count() })
    .from(users);
  
  // Premium stores count
  const premiumStoresResult = await drizzleDb
    .select({ count: count() })
    .from(stores)
    .where(eq(stores.planType, 'premium'));
  
  // Starter stores count
  const starterStoresResult = await drizzleDb
    .select({ count: count() })
    .from(stores)
    .where(eq(stores.planType, 'starter'));
  
  // Recent stores (last 5)
  const recentStores = await drizzleDb
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      isActive: stores.isActive,
      createdAt: stores.createdAt,
    })
    .from(stores)
    .orderBy(sql`${stores.createdAt} DESC`)
    .limit(5);
  
  return json({
    metrics: {
      totalStores: totalStoresResult[0]?.count || 0,
      activeStores: activeStoresResult[0]?.count || 0,
      suspendedStores: suspendedStoresResult[0]?.count || 0,
      totalOrders: totalOrdersResult[0]?.count || 0,
      monthlyOrders: monthlyOrdersResult[0]?.count || 0,
      monthlyRevenue: Number(monthlyRevenueResult[0]?.total) || 0,
      totalUsers: totalUsersResult[0]?.count || 0,
      premiumStores: premiumStoresResult[0]?.count || 0,
      starterStores: starterStoresResult[0]?.count || 0,
    },
    recentStores,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminDashboard() {
  const { metrics, recentStores } = useLoaderData<typeof loader>();
  const { t } = useTranslation('admin');

  const statCards = [
    {
      title: t('totalStores'),
      value: metrics.totalStores,
      subtitle: t('activeStoresSubtitle', { active: metrics.activeStores, suspended: metrics.suspendedStores }),
      icon: Store,
      color: 'blue',
    },
    {
      title: t('monthlyRevenue'),
      value: formatCurrency(metrics.monthlyRevenue, 'BDT', { fromCents: true }),
      subtitle: t('thisMonth'),
      icon: DollarSign,
      color: 'green',
    },
    {
      title: t('totalOrders'),
      value: metrics.totalOrders,
      subtitle: t('ordersThisMonth', { count: metrics.monthlyOrders }),
      icon: ShoppingCart,
      color: 'purple',
    },
    {
      title: t('totalUsers'),
      value: metrics.totalUsers,
      subtitle: t('allMerchants'),
      icon: Users,
      color: 'orange',
    },
  ];

  const planStats = [
    { label: t('premium'), count: metrics.premiumStores, color: 'bg-amber-500' },
    { label: t('starter'), count: metrics.starterStores, color: 'bg-emerald-500' },
    { label: t('free'), count: metrics.totalStores - metrics.premiumStores - metrics.starterStores, color: 'bg-slate-500' },
  ];

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
    green: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: 'text-orange-400' },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('dashboardOverview')}</h1>
        <p className="text-slate-400">{t('globalPlatformMetricsAndRecentActivity')}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color];
          return (
            <GlassCard
              key={stat.title}
              className="bg-slate-900/50 border-white/10 p-5 backdrop-blur-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className={`text-2xl font-bold mt-1 ${colors.text}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <GlassCard className="bg-slate-900/50 border-white/10 p-5 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4">{t('planDistribution')}</h3>
          <div className="space-y-3">
            {planStats.map((plan) => {
              const percentage = metrics.totalStores > 0 
                ? Math.round((plan.count / metrics.totalStores) * 100) 
                : 0;
              return (
                <div key={plan.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{plan.label}</span>
                    <span className="text-slate-400">{plan.count} {t('stores')} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${plan.color} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent Stores */}
        <GlassCard className="bg-slate-900/50 border-white/10 p-5 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4">{t('recentStores')}</h3>
          <div className="space-y-3">
            {recentStores.length === 0 ? (
              <p className="text-slate-500 text-sm">{t('noStoresYet')}</p>
            ) : (
              recentStores.map((store) => (
                <div 
                  key={store.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      store.isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                      {store.isActive ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.subdomain}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    store.planType === 'premium' 
                      ? 'bg-amber-500/20 text-amber-400'
                      : store.planType === 'starter'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                  }`}>
                    {store.planType || 'free'}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="bg-slate-900/50 border-white/10 p-5 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4">{t('quickActions')}</h3>
        <div className="flex flex-wrap gap-3">
          <a 
            href="/admin/stores"
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition"
          >
            {t('viewAllStores')}
          </a>
          <a 
            href="/admin/broadcasts"
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition"
          >
            {t('createBroadcast')}
          </a>
        </div>
      </GlassCard>
    </div>
  );
}

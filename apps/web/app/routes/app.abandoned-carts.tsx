/**
 * Abandoned Carts Dashboard
 *
 * Route: /app/abandoned-carts
 *
 * Features:
 * - View abandoned carts (>1 hour old)
 * - Customer contact info
 * - Cart contents and value
 * - Mark as recovered
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, Link, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { abandonedCarts, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import {
  ShoppingCart,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  Package,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';

export const meta: MetaFunction = () => {
  return [{ title: 'Abandoned Carts - Ozzyl' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const store = storeResult[0];

  // Read filter param
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'all';

  // Fetch ALL abandoned carts for this store (for stats + filtering)
  const allCarts = await db
    .select()
    .from(abandonedCarts)
    .where(eq(abandonedCarts.storeId, storeId))
    .orderBy(desc(abandonedCarts.abandonedAt));

  // Stats (always from the full set)
  const stats = {
    total: allCarts.length,
    abandoned: allCarts.filter((c) => c.status === 'abandoned').length,
    recovered: allCarts.filter((c) => c.status === 'recovered').length,
    totalValue: allCarts
      .filter((c) => c.status === 'abandoned')
      .reduce((sum, c) => sum + c.totalAmount, 0),
  };

  // Apply filter to abandoned carts only
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const HIGH_VALUE_THRESHOLD = 5000; // ৳5,000+

  const abandonedOnly = allCarts.filter((c) => c.status === 'abandoned');

  // Per-filter counts for badge display
  const filterCounts = {
    all: abandonedOnly.length,
    today: abandonedOnly.filter(
      (c) => c.abandonedAt && new Date(c.abandonedAt).getTime() >= startOfToday.getTime()
    ).length,
    thisWeek: abandonedOnly.filter(
      (c) => c.abandonedAt && new Date(c.abandonedAt).getTime() >= startOfWeek.getTime()
    ).length,
    highValue: abandonedOnly.filter((c) => c.totalAmount >= HIGH_VALUE_THRESHOLD).length,
  };

  let carts = [...abandonedOnly];

  if (filter === 'today') {
    carts = carts.filter(
      (c) => c.abandonedAt && new Date(c.abandonedAt).getTime() >= startOfToday.getTime()
    );
  } else if (filter === 'thisWeek') {
    carts = carts.filter(
      (c) => c.abandonedAt && new Date(c.abandonedAt).getTime() >= startOfWeek.getTime()
    );
  } else if (filter === 'highValue') {
    carts = carts.filter((c) => c.totalAmount >= HIGH_VALUE_THRESHOLD);
  }

  // Limit for display
  carts = carts.slice(0, 50);

  return json({
    carts,
    currency: store.currency || 'BDT',
    stats,
    filter,
    filterCounts,
  });
}

// ============================================================================
// ACTION - Update cart status
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const cartId = parseInt(formData.get('cartId') as string);

  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'markRecovered') {
    await db
      .update(abandonedCarts)
      .set({
        status: 'recovered',
        recoveredAt: new Date(),
      })
      .where(and(eq(abandonedCarts.id, cartId), eq(abandonedCarts.storeId, storeId)));
    return json({ success: true, message: 'Cart marked as recovered' });
  }

  if (intent === 'markExpired') {
    await db
      .update(abandonedCarts)
      .set({ status: 'expired' })
      .where(and(eq(abandonedCarts.id, cartId), eq(abandonedCarts.storeId, storeId)));
    return json({ success: true, message: 'Cart marked as expired' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AbandonedCartsPage() {
  const { carts, currency, stats, filter, filterCounts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilter = filter || 'all';

  function setFilter(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('filter');
    } else {
      next.set('filter', value);
    }
    setSearchParams(next, { preventScrollReset: true });
  }

  const filterLabels: Record<string, string> = {
    all: t('all') || 'All',
    today: t('today') || 'Today',
    thisWeek: t('thisWeek') || 'This Week',
    highValue: t('highValue') || 'High Value',
  };

  const FILTERS = ['all', 'today', 'thisWeek', 'highValue'];

  const getTimeAgo = (date: Date | string | number) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return t('daysAgo', { days });
    if (hours > 0) return t('hoursAgo', { hours });
    return t('justNow');
  };

  const recoveryRate =
    stats.total > 0 ? `${Math.round((stats.recovered / stats.total) * 100)}%` : '0%';

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE LAYOUT (< lg)                                         */}
      {/* ============================================================ */}
      <div className="lg:hidden -mx-4 -mt-4 flex flex-col min-h-[calc(100dvh-130px)] bg-[#f6f8f7]">

        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 backdrop-blur-md px-5 py-4 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">{t('navAbandonedCarts')}</h1>
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-emerald-500 px-2 text-xs font-bold text-white shadow-sm">
              {stats.abandoned}
            </span>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row — horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto px-5 py-5 no-scrollbar snap-x">
          {/* Total Abandoned */}
          <div className="flex min-w-[140px] flex-1 snap-center flex-col rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">{t('totalAbandoned')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.abandoned}</p>
          </div>
          {/* Recovery Rate */}
          <div className="flex min-w-[140px] flex-1 snap-center flex-col rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <RefreshCw className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">{t('recoveryRate')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{recoveryRate}</p>
          </div>
          {/* Recovered Revenue */}
          <div className="flex min-w-[140px] flex-1 snap-center flex-col rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">{t('recovered')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatPrice(stats.totalValue)}</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((f) => {
              const count = filterCounts[f as keyof typeof filterCounts];
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex h-9 min-w-fit items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium active:scale-95 transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {filterLabels[f]}
                  {count > 0 && (
                    <span
                      className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart Cards */}
        <div className="flex flex-col gap-4 px-5 pb-28">
          {carts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {activeFilter === 'today'
                  ? t('noCartsToday') || 'No carts today'
                  : activeFilter === 'thisWeek'
                    ? t('noCartsThisWeek') || 'No carts this week'
                    : activeFilter === 'highValue'
                      ? t('noHighValueCarts') || 'No high-value carts'
                      : t('noAbandonedCarts')}
              </h3>
              <p className="text-sm text-gray-500">
                {activeFilter === 'all'
                  ? t('noAbandonedCartsDesc')
                  : t('tryAnotherFilter') || 'Try another filter to see more carts'}
              </p>
            </div>
          ) : (
            carts.map((cart) => {
              const items = JSON.parse(cart.cartItems || '[]');
              const initials = cart.customerName
                ? cart.customerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : '??';

              return (
                <div
                  key={cart.id}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
                >
                  {/* Top row: avatar + name + status */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="h-12 w-12 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          {cart.customerName || t('unknownCustomer') || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {cart.customerPhone || cart.customerEmail || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        {t('abandoned') || 'Abandoned'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {getTimeAgo(cart.abandonedAt!)}
                      </span>
                    </div>
                  </div>

                  {/* Cart summary pill */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {items.length} {items.length !== 1 ? t('items') : t('item')}
                      </span>
                    </div>
                    <p className="text-base font-bold text-gray-900">{formatPrice(cart.totalAmount)}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Form method="post">
                      <input type="hidden" name="cartId" value={cart.id} />
                      <button
                        type="submit"
                        name="intent"
                        value="markRecovered"
                        disabled={isSubmitting}
                        className="w-full flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('markRecovered') || 'Mark Done'}
                      </button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="cartId" value={cart.id} />
                      <button
                        type="submit"
                        name="intent"
                        value="markExpired"
                        disabled={isSubmitting}
                        className="w-full flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 text-sm font-medium text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('dismiss') || 'Dismiss'}
                      </button>
                    </Form>
                  </div>
                </div>
              );
            })
          )}

          {/* Bottom indicator */}
          {carts.length > 0 && (
            <div className="flex justify-center py-2">
              <div className="h-1 w-12 rounded-full bg-gray-200" />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP LAYOUT (>= lg)                                       */}
      {/* ============================================================ */}
      <div className="hidden lg:block space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navAbandonedCarts')}</h1>
          <p className="text-gray-600">{t('countRecoverNeeded', { count: stats.abandoned })}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label={t('totalAbandoned')}
            value={stats.abandoned.toString()}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="orange"
          />
          <StatCard
            label={t('recovered')}
            value={stats.recovered.toString()}
            icon={<CheckCircle className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            label={t('recoveryRate')}
            value={recoveryRate}
            icon={<RefreshCw className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label={t('lostRevenue')}
            value={formatPrice(stats.totalValue)}
            icon={<DollarSign className="w-5 h-5" />}
            color="red"
          />
        </div>

        {/* Carts List */}
        {carts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noAbandonedCarts')}</h3>
            <p className="text-gray-500">{t('noAbandonedCartsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {carts.map((cart) => {
              const items = JSON.parse(cart.cartItems || '[]');

              return (
                <div key={cart.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Cart Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(cart.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {t('abandoned')} {getTimeAgo(cart.abandonedAt!)}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {cart.customerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {cart.customerName}
                          </span>
                        )}
                        {cart.customerEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {cart.customerEmail}
                          </span>
                        )}
                        {cart.customerPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {cart.customerPhone}
                          </span>
                        )}
                      </div>

                      {/* Cart Items Summary */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Package className="w-4 h-4" />
                        <span>
                          {items.length} {items.length !== 1 ? t('items') : t('item')}
                        </span>
                        {items.slice(0, 3).map((item: { title: string }, i: number) => (
                          <span key={i} className="text-gray-400">
                            • {item.title}
                          </span>
                        ))}
                        {items.length > 3 && (
                          <span className="text-gray-400">
                            +{items.length - 3} {t('more')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Form method="post">
                        <input type="hidden" name="cartId" value={cart.id} />
                        <button
                          type="submit"
                          name="intent"
                          value="markRecovered"
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t('markRecovered')}
                        </button>
                      </Form>
                      <Form method="post">
                        <input type="hidden" name="cartId" value={cart.id} />
                        <button
                          type="submit"
                          name="intent"
                          value="markExpired"
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <XCircle className="w-4 h-4" />
                          {t('dismiss')}
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading overlay — shared */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>{t('updating')}</span>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'orange' | 'emerald' | 'blue' | 'red';
}) {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

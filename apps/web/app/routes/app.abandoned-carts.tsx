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
import { useLoaderData, Form, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, lte } from 'drizzle-orm';
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

  // Fetch abandoned carts (abandoned more than 1 hour ago)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const carts = await db
    .select()
    .from(abandonedCarts)
    .where(and(eq(abandonedCarts.storeId, storeId), eq(abandonedCarts.status, 'abandoned')))
    .orderBy(desc(abandonedCarts.abandonedAt))
    .limit(50);

  // Stats
  const allCarts = await db
    .select()
    .from(abandonedCarts)
    .where(eq(abandonedCarts.storeId, storeId));

  const stats = {
    total: allCarts.length,
    abandoned: allCarts.filter((c) => c.status === 'abandoned').length,
    recovered: allCarts.filter((c) => c.status === 'recovered').length,
    totalValue: allCarts
      .filter((c) => c.status === 'abandoned')
      .reduce((sum, c) => sum + c.totalAmount, 0),
  };

  return json({
    carts,
    currency: store.currency || 'BDT',
    stats,
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
  const { carts, currency, stats } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  const formatDate = (date: Date | string | number) => {
    return new Date(date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (date: Date | string | number) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return t('daysAgo', { days });
    if (hours > 0) return t('hoursAgo', { hours });
    return t('justNow');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('navAbandonedCarts')}</h1>
        <p className="text-gray-600">{t('countRecoverNeeded', { count: stats.abandoned })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          value={stats.total > 0 ? `${Math.round((stats.recovered / stats.total) * 100)}%` : '0%'}
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

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>{t('updating')}</span>
          </div>
        </div>
      )}
    </div>
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

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerOrders } from '~/services/customer-account.server';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/button';
import { format } from 'date-fns';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCcw,
  ArrowRight,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { cn } from '~/lib/utils';

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { store, storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  // Pagination params could be added here
  const orders = await getCustomerOrders(customerId, storeId, db, 20, 0);

  return json({ orders, storeCurrency: store.currency });
}

function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const statusConfig: Record<
    string,
    {
      label: string;
      icon: React.ElementType;
      className: string;
      bgClass: string;
    }
  > = {
    pending: {
      label: t('statusPendingAccount'),
      icon: Clock,
      className: 'text-amber-700 border-amber-200',
      bgClass: 'bg-amber-50',
    },
    confirmed: {
      label: t('statusConfirmedAccount'),
      icon: CheckCircle2,
      className: 'text-blue-700 border-blue-200',
      bgClass: 'bg-blue-50',
    },
    processing: {
      label: t('statusProcessingAccount'),
      icon: Package,
      className: 'text-indigo-700 border-indigo-200',
      bgClass: 'bg-indigo-50',
    },
    shipped: {
      label: t('statusShippedAccount'),
      icon: Truck,
      className: 'text-purple-700 border-purple-200',
      bgClass: 'bg-purple-50',
    },
    delivered: {
      label: t('statusDeliveredAccount'),
      icon: CheckCircle2,
      className: 'text-emerald-700 border-emerald-200',
      bgClass: 'bg-emerald-50',
    },
    cancelled: {
      label: t('statusCancelledAccount'),
      icon: XCircle,
      className: 'text-red-700 border-red-200',
      bgClass: 'bg-red-50',
    },
    returned: {
      label: t('statusReturnedAccount'),
      icon: RefreshCcw,
      className: 'text-gray-700 border-gray-200',
      bgClass: 'bg-gray-50',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
        config.bgClass,
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  );
}

export default function AccountOrders() {
  const { orders, storeCurrency } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('orderHistory')}</h1>
          <p className="text-muted-foreground mt-1">{t('orderHistoryDesc')}</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('startShoppingBtn')}
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-dashed">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('noOrdersYetAccount')}</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t('noOrdersDescAccount')}</p>
          <Button asChild className="rounded-full shadow-lg shadow-primary/20">
            <Link to="/">{t('startShoppingBtn')}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const date = order.createdAt ? new Date(order.createdAt) : new Date();

            return (
              <div
                key={order.id}
                className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-bold">#{order.orderNumber}</span>
                        <OrderStatusBadge status={order.status || 'pending'} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{format(date, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium text-foreground">৳{order.total}</span>
                          <span className="text-muted-foreground">{storeCurrency || 'BDT'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button asChild variant="outline" className="rounded-full group/btn">
                      <Link to={`/account/orders/${order.id}`}>
                        {t('viewDetailsBtn')}
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Progress Bar for active orders */}
                {['pending', 'confirmed', 'processing', 'shipped'].includes(
                  order.status || 'pending'
                ) && (
                  <div className="px-6 pb-6">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          order.status === 'pending' && 'w-1/4 bg-amber-500',
                          order.status === 'confirmed' && 'w-2/4 bg-blue-500',
                          order.status === 'processing' && 'w-3/4 bg-indigo-500',
                          order.status === 'shipped' && 'w-[90%] bg-purple-500'
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {order.status === 'pending' && 'অর্ডার পেন্ডিং - নিশ্চিত করা হচ্ছে'}
                      {order.status === 'confirmed' && 'অর্ডার নিশ্চিত - প্রসেসিং হচ্ছে'}
                      {order.status === 'processing' && 'প্রসেসিং চলছে - প্যাকেজিং হচ্ছে'}
                      {order.status === 'shipped' && 'শিপ করা হয়েছে - ডেলিভারি পথে'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

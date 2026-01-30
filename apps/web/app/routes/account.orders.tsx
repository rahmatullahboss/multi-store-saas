/**
 * Customer Order History Page
 *
 * Route: /account/orders
 *
 * Shows customer's order history with status and details.
 */

import { LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { stores, customers, orders } from '@db/schema';
import { getCustomerId, getCustomerStoreId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;
  const drizzleDb = drizzle(db);

  // Get customer from session
  const customerId = await getCustomerId(request, env);
  const storeId = await getCustomerStoreId(request, env);

  if (!customerId || !storeId) {
    return redirect('/');
  }

  // Get customer data
  const customerResult = await drizzleDb
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customerResult.length) {
    return redirect('/');
  }

  const customer = customerResult[0];

  // Get store data
  const storeResult = await drizzleDb.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!storeResult.length) {
    return redirect('/');
  }

  const store = storeResult[0];

  // Get customer's orders
  const ordersResult = await drizzleDb
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    },
    store: {
      id: store.id,
      name: store.name,
      logo: store.logo,
      templateId: (store as any).storeTemplateId || 'modern-starter',
      currency: store.currency || 'BDT',
      planType: store.planType || 'free',
    },
    orders: ordersResult.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber || `#${order.id}`,
      status: order.status,
      total: order.total,
      itemsCount: (order as any).itemsCount || 0,
      createdAt: order.createdAt?.toISOString(),
    })),
  });
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' },
};

export default function CustomerOrdersPage() {
  const { customer, store, orders } = useLoaderData<typeof loader>();
  const theme = getStoreTemplateTheme(store.templateId);

  return (
    <StorePageWrapper
      storeName={store.name}
      storeId={store.id}
      logo={store.logo}
      templateId={store.templateId}
      theme={theme}
      currency={store.currency}
      planType={store.planType}
      customer={{ id: customer.id, name: customer.name, email: customer.email }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/account"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-500">{orders.length} orders</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              Browse Products
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status =
                statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500" suppressHydrationWarning>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                    </p>
                    <p className="font-bold" style={{ color: theme.primary }}>
                      {formatPrice(order.total, store.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StorePageWrapper>
  );
}

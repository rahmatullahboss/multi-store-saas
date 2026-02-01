/**
 * Customer Account Page
 *
 * Route: /account
 *
 * Shows customer profile and quick links to orders, settings.
 */

import { LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, customers, orders } from '@db/schema';
import { getCustomerId, getCustomerStoreId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { User, Package, LogOut, ChevronRight } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;
  const drizzleDb = drizzle(db);

  // Get customer from session
  const customerId = await getCustomerId(request, env);
  const storeId = await getCustomerStoreId(request, env);

  if (!customerId || !storeId) {
    return redirect('/store/auth/login?redirectTo=/account');
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

  // Get recent orders count
  const ordersResult = await drizzleDb
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.customerId, customerId));

  const orderCount = ordersResult.length;

  return json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      loyaltyPoints: customer.loyaltyPoints || 0,
      loyaltyTier: customer.loyaltyTier || 'bronze',
      createdAt: customer.createdAt?.toISOString(),
    },
    store: {
      id: store.id,
      name: store.name,
      logo: store.logo,
      templateId: (store as any).storeTemplateId || 'modern-starter',
      currency: store.currency || 'BDT',
      planType: store.planType || 'free',
    },
    orderCount,
  });
}

export default function CustomerAccountPage() {
  const { customer, store, orderCount } = useLoaderData<typeof loader>();
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
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-500">Manage your profile and view your orders</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              {customer.name?.[0]?.toUpperCase() || customer.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{customer.name || 'Customer'}</h2>
              <p className="text-gray-500">{customer.email}</p>
              {customer.phone && <p className="text-gray-400 text-sm">{customer.phone}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                {customer.totalOrders}
              </p>
              <p className="text-sm text-gray-500">Orders</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                {formatPrice(customer.totalSpent, store.currency)}
              </p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                {customer.loyaltyPoints}
              </p>
              <p className="text-sm text-gray-500">Points</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <Link
            to="/account/orders"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <Package className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <p className="font-medium">My Orders</p>
                <p className="text-sm text-gray-500">{orderCount} orders</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" />
          </Link>

          <a
            href="/store/auth/logout"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-600">Sign Out</p>
                <p className="text-sm text-gray-500">Log out of your account</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition" />
          </a>
        </div>

        {/* Loyalty Badge */}
        <div
          className="mt-6 p-4 rounded-xl text-center"
          style={{ backgroundColor: `${theme.primary}10` }}
        >
          <p className="text-sm text-gray-600 mb-1">Loyalty Tier</p>
          <p className="text-lg font-bold capitalize" style={{ color: theme.primary }}>
            {customer.loyaltyTier}
          </p>
        </div>
      </div>
    </StorePageWrapper>
  );
}

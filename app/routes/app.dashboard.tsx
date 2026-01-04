/**
 * Dashboard Overview Page
 * 
 * Route: /app/dashboard
 * 
 * Displays basic store stats and quick actions
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sql } from 'drizzle-orm';
import { products, orders, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Package, ShoppingCart, TrendingUp, Plus } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard - Multi-Store SaaS' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];

  // Count products
  const productCount = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.storeId, storeId));

  // Count orders
  const orderCount = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  // Total revenue (non-cancelled orders)
  const revenueResult = await db
    .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  return json({
    storeName: store.name,
    currency: store.currency || 'BDT',
    stats: {
      products: productCount[0]?.count || 0,
      orders: orderCount[0]?.count || 0,
      revenue: revenueResult[0]?.total || 0,
    },
  });
}

export default function DashboardPage() {
  const { storeName, currency, stats } = useLoaderData<typeof loader>();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Here's what's happening with {storeName} today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={Package}
          color="blue"
          link="/app/products"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={ShoppingCart}
          color="emerald"
          link="/app/dashboard/orders"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.revenue)}
          icon={TrendingUp}
          color="purple"
          isPrice
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/app/products/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-sm text-gray-500">Create a new product listing</p>
            </div>
          </Link>
          <Link
            to="/app/dashboard/orders"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Manage your orders</p>
            </div>
          </Link>
          <Link
            to="/app/settings"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition group"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Store Settings</p>
              <p className="text-sm text-gray-500">Configure your store</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'purple';
  link?: string;
  isPrice?: boolean;
}

function StatCard({ title, value, icon: Icon, color, link, isPrice }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const content = (
    <div className={`rounded-xl border p-5 ${colors[color]} ${link ? 'hover:shadow-md transition cursor-pointer' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`font-bold ${isPrice ? 'text-xl' : 'text-2xl'} text-gray-900`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

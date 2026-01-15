/**
 * Merchant Dashboard - Customer Details
 * 
 * Route: /app/customers/$id
 * 
 * Features:
 * - Customer Profile (Name, Email, Phone)
 * - Address Card
 * - Lifetime Stats (LTV, AOV, Order Count)
 * - Order History Table
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { customers, orders, stores } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  ArrowLeft,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package
} from 'lucide-react';
import { PageHeader } from '~/components/ui';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Customer Details - Merchant Dashboard' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const customerId = parseInt(params.id || '0');
  if (!customerId) {
    throw new Response('Customer ID required', { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get Store Info (Currency)
  const storeResult = await db.select({ currency: stores.currency }).from(stores).where(eq(stores.id, storeId)).limit(1);
  const currency = storeResult[0]?.currency || 'BDT';

  // Get Customer
  const customerResult = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
    .limit(1);

  const customer = customerResult[0];

  if (!customer) {
    throw new Response('Customer not found', { status: 404 });
  }

  // Get Customer Orders
  const customerOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.customerId, customerId), eq(orders.storeId, storeId)))
    .orderBy(desc(orders.createdAt));

  // Recalculate stats to ensure accuracy
  const totalOrders = customerOrders.length;
  // Calculate total spent from non-cancelled, non-failed orders
  const validOrders = customerOrders.filter(o => 
    o.status !== 'cancelled' && 
    o.paymentStatus !== 'failed' && 
    o.paymentStatus !== 'reversed'
  );
  
  const totalSpent = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const aov = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Derive Address
  let address = null;
  try {
    if (customer.address) {
      address = typeof customer.address === 'string' ? JSON.parse(customer.address) : customer.address;
    } else if (customerOrders.length > 0 && customerOrders[0].shippingAddress) {
      // Fallback to latest order address
      const latest = customerOrders[0].shippingAddress;
      address = typeof latest === 'string' ? JSON.parse(latest) : latest;
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  return json({
    customer,
    orders: customerOrders,
    stats: {
      totalOrders,
      totalSpent,
      aov,
    },
    address,
    currency,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CustomerDetailsPage() {
  const { customer, orders: customerOrders, stats, address, currency } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-cyan-100 text-cyan-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const icons: Record<string, any> = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link 
          to="/app/customers" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl border-4 border-white shadow-sm">
              {(customer.name || customer.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name || 'Guest Customer'}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <span>Customer since {formatDate(customer.createdAt).split(',')[0]}</span>
                {customer.segment && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold uppercase">
                    {customer.segment.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Actions - Future */}
          {/* <button className="btn-secondary">Edit Customer</button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Profile */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Overview</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Total Spent</span>
                <span className="font-bold text-gray-900 text-lg">{formatPrice(stats.totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Total Orders</span>
                <span className="font-medium text-gray-900">{stats.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Avg. Order Value</span>
                <span className="font-medium text-gray-900">{formatPrice(stats.aov)}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Contact Info</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-sm text-emerald-600 hover:underline truncate block">
                    {customer.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="text-sm text-gray-600 hover:text-gray-900">
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No phone provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Default Address */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Primary Address</h3>
            </div>
            <div className="p-4">
              {address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">{address.address}</p>
                    <p>{address.city}, {address.postalCode}</p>
                    <p>{address.country || 'Bangladesh'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No address on file
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Order History</h3>
            </div>
            
            {customerOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No orders found for this customer.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Order</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <Link to={`/app/orders/${order.id}`} className="font-mono font-medium text-emerald-600 hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(order.createdAt).split(',')[0]}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status || 'pending')}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/app/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-emerald-600"
                          >
                            Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Merchant Dashboard - Customer Details
 *
 * Route: /app/customers/$id
 *
 * Features:
 * - Customer Profile (Name, Email, Phone)
 * - Address Card (Multiple)
 * - Lifetime Stats (LTV, AOV, Order Count)
 * - Order History Table
 * - Timeline (Notes)
 */

import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/cloudflare';
import { useLoaderData, Link, useFetcher, Form } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { customers, orders, stores, customerAddresses, customerNotes } from '@db/schema';
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
  Package,
  Plus,
  StickyNote,
  Send,
  MoreVertical,
  Edit,
  Trash,
} from 'lucide-react';
import { PageHeader } from '~/components/ui';
import { GlassCard } from '~/components/ui/GlassCard';
import { Button } from '~/components/ui/button';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { useState, useRef, useEffect } from 'react';

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
  const storeResult = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  const currency = storeResult[0]?.currency || 'BDT';

  // Get Customer with Addresses and Notes (using separate queries for D1 efficiency/safety without foreign key complexity sometimes)
  const customerResult = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
    .limit(1);

  const customer = customerResult[0];

  if (!customer) {
    throw new Response('Customer not found', { status: 404 });
  }

  // Fetch related data
  const addresses = await db
    .select()
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, customerId));
  const notes = await db
    .select()
    .from(customerNotes)
    .where(eq(customerNotes.customerId, customerId))
    .orderBy(desc(customerNotes.createdAt));

  // Get Customer Orders
  const customerOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.customerId, customerId), eq(orders.storeId, storeId)))
    .orderBy(desc(orders.createdAt));

  // Recalculate stats
  const totalOrders = customerOrders.length;
  const validOrders = customerOrders.filter(
    (o) =>
      o.status !== 'cancelled' && o.paymentStatus !== 'failed' && o.paymentStatus !== 'reversed'
  );

  const totalSpent = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const aov = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return json({
    customer,
    orders: customerOrders,
    addresses,
    notes,
    stats: {
      totalOrders,
      totalSpent,
      aov,
    },
    currency,
  });
}

// ============================================================================
// ACTION (Add Note / Address)
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const customerId = parseInt(params.id || '0');
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'add_note') {
    const content = formData.get('content') as string;
    if (!content) return json({ error: 'Content required' }, { status: 400 });

    await db.insert(customerNotes).values({
      customerId,
      content,
      createdAt: new Date(),
    });
    return json({ success: true });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CustomerDetailsPage() {
  const {
    customer,
    orders: customerOrders,
    addresses,
    notes,
    stats,
    currency,
  } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const noteFetcher = useFetcher();
  const noteFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (noteFetcher.state === 'idle' && (noteFetcher.data as { success?: boolean })?.success) {
      noteFormRef.current?.reset();
    }
  }, [noteFetcher.state, noteFetcher.data]);

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
      completed: 'bg-emerald-100 text-emerald-700',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Link
          to="/app/customers"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToCustomers')}
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl border-4 border-white shadow-sm">
              {(customer.name || customer.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.name || t('guestCustomer')}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <span>{customer.email || 'No email'}</span>
                {customer.segment && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold uppercase">
                    {customer.segment.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Profile & Address */}
        <div className="space-y-6">
          {/* Stats Card */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Customer Stats</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                <div className="text-sm text-gray-500">Total Spent</div>
                <div className="font-bold text-lg text-emerald-700">
                  {formatPrice(stats.totalSpent)}
                </div>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                <div className="text-sm text-gray-500">Orders</div>
                <div className="font-medium text-gray-900">{stats.totalOrders}</div>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                <div className="text-sm text-gray-500">Average Order</div>
                <div className="font-medium text-gray-900">{formatPrice(stats.aov)}</div>
              </div>
            </div>
          </GlassCard>

          {/* Contact Info */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between">
              <h3 className="font-semibold text-gray-900">Contact</h3>
              <button className="text-emerald-600 text-xs hover:underline">Edit</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="text-sm font-medium text-gray-900">{customer.email || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="text-sm font-medium text-gray-900">{customer.phone || '—'}</div>
              </div>
            </div>
          </GlassCard>

          {/* Addresses */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Addresses</h3>
              <button className="text-emerald-600 text-xs hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {addresses.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No addresses saved.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 text-sm hover:bg-gray-50/50">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900">{addr.address1}</div>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-600">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {addr.city}, {addr.zip}
                      <br />
                      {addr.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Order History & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t('orderHistory')}</h3>
              <Link to="/app/orders" className="text-xs text-emerald-600 hover:underline">
                View All
              </Link>
            </div>

            {customerOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">{t('noOrdersFoundForCustomer')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">{t('order')}</th>
                      <th className="px-6 py-3">{t('date')}</th>
                      <th className="px-6 py-3">{t('status')}</th>
                      <th className="px-6 py-3">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <Link
                            to={`/app/orders/${order.id}`}
                            className="font-mono font-medium text-emerald-600 hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(order.createdAt).split(',')[0]}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(order.status || 'pending')}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Timeline / Notes */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Timeline</h3>
            </div>

            {/* Add Note Input */}
            <div className="p-4 border-b border-gray-100">
              <noteFetcher.Form method="post" ref={noteFormRef} className="flex gap-2">
                <input type="hidden" name="intent" value="add_note" />
                <input
                  type="text"
                  name="content"
                  placeholder="Leave a note about this customer..."
                  className="flex-1 border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <Button type="submit" size="sm" disabled={noteFetcher.state === 'submitting'}>
                  <Send className="w-4 h-4" />
                </Button>
              </noteFetcher.Form>
            </div>

            {/* Timeline Feed */}
            <div className="bg-gray-50/30 p-4 space-y-6 max-h-[400px] overflow-y-auto">
              {notes.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">No notes yet.</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="flex gap-3">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <StickyNote className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative">
                      <div className="text-gray-800 text-sm whitespace-pre-wrap">
                        {note.content}
                      </div>
                      <div className="mt-2 text-xs text-gray-400 flex justify-between">
                        <span>{formatDate(note.createdAt)}</span>
                        {/* <span>by Staff</span> */}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

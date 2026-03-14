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

import { type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link, useFetcher } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { customers, orders, stores, customerAddresses, customerNotes, studentDocuments } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  ArrowLeft,
  StickyNote,
  Send,
  Edit,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Ban,
  Copy,
} from 'lucide-react';

import { GlassCard } from '~/components/ui/GlassCard';
import { Button } from '~/components/ui/button';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { useRef, useEffect } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Customer Details - Merchant Dashboard' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

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

  // Get Customer Documents
  const documents = await db
    .select({
       id: studentDocuments.id,
       fileUrl: studentDocuments.fileUrl,
       fileName: studentDocuments.fileName,
       documentType: studentDocuments.documentType,
       createdAt: studentDocuments.createdAt,
    })
    .from(studentDocuments)
    .where(and(eq(studentDocuments.customerId, customerId), eq(studentDocuments.storeId, storeId)))
    .orderBy(desc(studentDocuments.createdAt));

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
    documents,
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
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

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

  if (intent === 'block_customer') {
    const [customerRow] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
      .limit(1);
    if (!customerRow) return json({ error: 'Customer not found' }, { status: 404 });

    const isBlocked = customerRow.notes?.includes('[BLOCKED]') ?? false;
    await db
      .update(customers)
      .set({
        notes: isBlocked
          ? (customerRow.notes || '').replace('[BLOCKED] ', '')
          : `[BLOCKED] ${customerRow.notes || ''}`.trim(),
      })
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));
    return json({ success: true, action: isBlocked ? 'unblocked' : 'blocked' });
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
    documents,
    stats,
  } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const noteFetcher = useFetcher();
  const blockFetcher = useFetcher();
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

  // Avatar initials
  const initials = (customer.name || customer.email || '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Last order date
  const lastOrder = customerOrders[0];
  const lastOrderDate = lastOrder?.createdAt
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / 86400000);
        if (diff === 0) return lang === 'bn' ? 'আজ' : 'Today';
        if (diff === 1) return lang === 'bn' ? 'গতকাল' : 'Yesterday';
        return lang === 'bn' ? `${diff}দ আগে` : `${diff}d ago`;
      })()
    : '—';

  // Primary address
  const primaryAddress = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div>
      {/* ===== MOBILE VIEW ===== */}
      <div className="md:hidden bg-slate-50 min-h-screen flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center bg-white px-4 py-3 border-b border-slate-100 shadow-sm">
          <Link
            to="/app/customers"
            className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h2 className="text-base font-bold flex-1 text-center pr-10">
            {lang === 'bn' ? 'কাস্টমার প্রোফাইল' : 'Customer Profile'}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Hero Section */}
          <div className="flex flex-col items-center pt-8 pb-6 px-4 bg-white rounded-b-3xl shadow-sm mb-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-white shadow-md flex items-center justify-center text-emerald-600 font-bold text-3xl mb-4">
              {initials}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center">
              {customer.name || (lang === 'bn' ? 'গেস্ট কাস্টমার' : 'Guest Customer')}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {lang === 'bn' ? 'কাস্টমার থেকে' : 'Customer since'}{' '}
              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', { month: 'short', year: 'numeric' }) : '—'}
            </p>
            {/* Metric Badges */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700 text-sm font-medium">
                  {stats.totalOrders} {lang === 'bn' ? 'অর্ডার' : 'Orders'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span className="text-emerald-600 font-bold text-sm">৳</span>
                <span className="text-slate-700 text-sm font-medium">{formatPrice(stats.totalSpent)}</span>
              </div>
            </div>
          </div>

          <div className="px-4 space-y-4">
            {/* Contact Info Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {lang === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Details'}
              </h3>
              <div className="space-y-4">
                {/* Phone */}
                {customer.phone && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-500 text-xs">{lang === 'bn' ? 'ফোন' : 'Phone'}</span>
                          <span className="text-slate-900 text-sm font-medium truncate">{customer.phone}</span>
                        </div>
                      </div>
                      <a
                        href={`tel:${customer.phone}`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-700 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                    {(customer.email || primaryAddress) && <div className="h-px bg-slate-100 w-full ml-12" />}
                  </>
                )}
                {/* Email */}
                {customer.email && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-500 text-xs">{lang === 'bn' ? 'ইমেইল' : 'Email'}</span>
                          <span className="text-slate-900 text-sm font-medium truncate">{customer.email}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(customer.email || '')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {primaryAddress && <div className="h-px bg-slate-100 w-full ml-12" />}
                  </>
                )}
                {/* Location */}
                {primaryAddress && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs">{lang === 'bn' ? 'ঠিকানা' : 'Location'}</span>
                      <span className="text-slate-900 text-sm font-medium">
                        {[primaryAddress.city, primaryAddress.country].filter(Boolean).join(', ') || primaryAddress.address1 || '—'}
                      </span>
                    </div>
                  </div>
                )}
                {!customer.phone && !customer.email && !primaryAddress && (
                  <p className="text-sm text-slate-400 text-center py-2">
                    {lang === 'bn' ? 'কোনো তথ্য নেই' : 'No contact info'}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                <div className="px-2 flex flex-col items-center text-center gap-1">
                  <span className="text-xs text-slate-500 font-medium">AOV</span>
                  <span className="text-emerald-600 font-bold text-base">{formatPrice(stats.aov)}</span>
                </div>
                <div className="px-2 flex flex-col items-center text-center gap-1">
                  <span className="text-xs text-slate-500 font-medium">
                    {lang === 'bn' ? 'সেগমেন্ট' : 'Segment'}
                  </span>
                  <span className="text-slate-900 font-bold text-base capitalize">
                    {customer.segment?.replace('_', ' ') || '—'}
                  </span>
                </div>
                <div className="px-2 flex flex-col items-center text-center gap-1">
                  <span className="text-xs text-slate-500 font-medium">
                    {lang === 'bn' ? 'শেষ অর্ডার' : 'Last Order'}
                  </span>
                  <span className="text-slate-900 font-bold text-base">{lastOrderDate}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900">
                  {lang === 'bn' ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}
                </h3>
                <Link to="/app/orders" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                  {lang === 'bn' ? 'সব দেখুন' : 'View All'}
                </Link>
              </div>
              {customerOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  {lang === 'bn' ? 'কোনো অর্ডার নেই' : 'No orders yet'}
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {customerOrders.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      to={`/app/orders/${order.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 text-sm font-semibold">{order.orderNumber}</span>
                          <span className="text-slate-500 text-xs">
                            {new Date(order.createdAt || '').toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-slate-900 text-sm font-bold">{formatPrice(order.total)}</span>
                        {getStatusBadge(order.status || 'pending')}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Merchant Notes */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {lang === 'bn' ? 'মার্চেন্ট নোট' : 'Merchant Notes'}
              </h3>
              <noteFetcher.Form method="post" ref={noteFormRef} className="space-y-2">
                <input type="hidden" name="intent" value="add_note" />
                <textarea
                  name="content"
                  rows={3}
                  placeholder={lang === 'bn' ? 'এই কাস্টমার সম্পর্কে নোট লিখুন...' : 'Add a note about this customer...'}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 resize-none p-3"
                  required
                />
                <button
                  type="submit"
                  disabled={noteFetcher.state === 'submitting'}
                  className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {noteFetcher.state === 'submitting'
                    ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...')
                    : (lang === 'bn' ? 'নোট সেভ করুন' : 'Save Note')}
                </button>
              </noteFetcher.Form>
              {notes.length > 0 && (
                <div className="mt-4 space-y-3">
                  {notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                        <StickyNote className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-slate-800 text-sm">{note.content}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(note.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block Button */}
            <div className="pb-6">
              <blockFetcher.Form method="post">
                <input type="hidden" name="intent" value="block_customer" />
                <button
                  type="submit"
                  disabled={blockFetcher.state !== 'idle'}
                  className="w-full flex items-center justify-center gap-2 text-red-600 font-semibold py-3 px-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  <Ban className="w-5 h-5" />
                  {blockFetcher.state !== 'idle'
                    ? (lang === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...')
                    : (lang === 'bn' ? 'কাস্টমার ব্লক করুন' : 'Block Customer')}
                </button>
              </blockFetcher.Form>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP VIEW (unchanged) ===== */}
      <div className="hidden md:block space-y-6 max-w-7xl mx-auto">
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
              <>
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {customerOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/app/orders/${order.id}`}
                          className="font-mono font-medium text-emerald-600 hover:underline text-sm"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt).split(',')[0]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status || 'pending')}
                        <span className="font-medium text-gray-900 text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
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
              </>
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
                notes.map((note: typeof notes[0]) => (
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
        </div>{/* end desktop grid */}
      </div>{/* end desktop wrapper */}
    </div>
  );
}

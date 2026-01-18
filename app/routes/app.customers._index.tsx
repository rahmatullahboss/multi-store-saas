/**
 * Merchant Dashboard - Customers List
 * 
 * Route: /app/customers
 * 
 * Features:
 * - List of all customers
 * - Search by name/email/phone
 * - Customer stats (Orders, Spent)
 * - Navigation to detail view
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { customers, orders, stores } from '@db/schema';
import { eq, desc, and, or, like, sql } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Calendar, 
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { PageHeader, EmptyState } from '~/components/ui';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Customers - Merchant Dashboard' }];
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

  // Get Store Info (Currency)
  const storeResult = await db.select({ currency: stores.currency }).from(stores).where(eq(stores.id, storeId)).limit(1);
  const currency = storeResult[0]?.currency || 'BDT';

  // Get Customers
  // Ideally, we should join with orders to get real-time stats, 
  // but relying on the `totalOrders` and `totalSpent` fields on customer table for performance (assuming they are synced)
  // For safety, let's fetch orders count dynamically if we suspect sync issues, but normally we trust the sync.
  // Given MVP, let's just query customers table directly as it's designed for this.
  
  const allCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.storeId, storeId))
    .orderBy(desc(customers.createdAt));

  // Stats
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const thirtyDaysAgoTs = Math.floor(thirtyDaysAgo.getTime() / 1000);

  const stats = {
    total: allCustomers.length,
    newThisMonth: allCustomers.filter(c => {
      const ts = c.createdAt instanceof Date ? Math.floor(c.createdAt.getTime() / 1000) : c.createdAt;
      return ts && ts >= thirtyDaysAgoTs;
    }).length,
    returning: allCustomers.filter(c => (c.totalOrders || 0) > 1).length,
  };

  return json({
    customers: allCustomers,
    stats,
    currency,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CustomersListPage() {
  const { customers: allCustomers, stats, currency } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return allCustomers;
    const q = searchQuery.toLowerCase();
    return allCustomers.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  }, [allCustomers, searchQuery]);

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
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={t('customersTitle')}
          description={t('customersDescription')}
        />
        {/* Placeholder for Add Customer (Manual) - MVP P1 */}
        {/* <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('totalCustomers')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('newCustomers30Days')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('returningCustomers')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.returning}</p>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchCustomers')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        {allCustomers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title={t('noCustomersTitle')}
            description={t('noCustomersDescription')}
          />
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t('noCustomersMatchSearch')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">{t('customerLabel')}</th>
                  <th className="px-6 py-3">{t('contactLabel')}</th>
                  <th className="px-6 py-3">{t('customerOrdersLabel')}</th>
                  <th className="px-6 py-3">{t('totalSpentLabel')}</th>
                  <th className="px-6 py-3">{t('lastActiveLabel')}</th>
                  <th className="px-6 py-3 text-right">{t('customerActionLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          {(customer.name || customer.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name || t('guestLabel')}</p>
                          {customer.segment && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 uppercase tracking-wide">
                              {customer.segment.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {t('ordersCount', { count: customer.totalOrders || 0 })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(customer.totalSpent || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(customer.lastOrderAt || customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/app/customers/${customer.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition"
                      >
                        <ArrowRight className="w-4 h-4" />
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
  );
}

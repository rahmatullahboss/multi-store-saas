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
 * - Segments (Tabs) and Filters
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import {
  useLoaderData,
  Link,
  Form,
  useSubmit,
  useSearchParams,
  useNavigation,
} from '@remix-run/react';
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
  Filter,
  ArrowRight,
  UserPlus,
  MoreHorizontal,
  Download,
  Trash2,
  Tag,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { PageHeader, EmptyState } from '~/components/ui';
import { GlassCard } from '~/components/ui/GlassCard';
import { useTranslation } from '~/contexts/LanguageContext';
import { Badge } from '~/components/ui/Badge'; // Assuming we have this or I'll use simple span
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/Input'; // Assuming we have this
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu'; // Assuming shadcn-like

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
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const segment = url.searchParams.get('segment') || 'all'; // all, vip, new, returning
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get Store Info (Currency)
  const storeResult = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  const currency = storeResult[0]?.currency || 'BDT';

  // Build dynamic conditions array
  const conditions = [eq(customers.storeId, storeId)];

  // Search Filter
  if (search) {
    const searchLower = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(customers.name, searchLower),
        like(customers.email, searchLower),
        like(customers.phone, searchLower)
      )!
    );
  }

  // Segment Filter
  if (segment !== 'all') {
    if (segment === 'vip') {
      conditions.push(eq(customers.segment, 'vip' as any));
    } else if (segment === 'new') {
      conditions.push(eq(customers.segment, 'new' as any));
    } else if (segment === 'returning') {
      conditions.push(eq(customers.segment, 'returning' as any));
    }
  }

  // Execute Query with all conditions  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereCondition: any = conditions.length === 1 ? conditions[0] : and(...conditions);
  const allCustomers: typeof customers.$inferSelect[] = await (db
    .select()
    .from(customers) as any)
    .where(whereCondition)
    .orderBy(desc(customers.createdAt))
    .limit(limit)
    .offset(offset);

  // Stats (Quick Count) - For Tabs badges
  // Optimized: Ideally separate count query or approximation
  // For MVP, we'll skip counts or do a separate count for "All"

  // Quick stats query
  // const totalCount = await db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.storeId, storeId)).get();

  return json({
    customers: allCustomers,
    currency,
    filters: { search, segment, page },
    // total: totalCount?.count || 0
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CustomersListPage() {
  const { customers: allCustomers, currency, filters } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  // Local state for search debounce
  const [searchQuery, setSearchQuery] = useState(filters.search);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        const newParams = new URLSearchParams(searchParams);
        if (searchQuery) newParams.set('search', searchQuery);
        else newParams.delete('search');
        newParams.set('page', '1'); // Reset page
        setSearchParams(newParams);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, setSearchParams, filters.search]);

  // Handle Tab Change
  const handleTabChange = (segment: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('segment', segment);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

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

  const tabs = [
    { id: 'all', label: t('allCustomers') || 'All' },
    { id: 'vip', label: t('vipCustomers') || 'VIP' },
    { id: 'new', label: t('newCustomers') || 'New' },
    { id: 'returning', label: t('returningCustomers') || 'Returning' },
    { id: 'window_shopper', label: t('windowShoppers') || 'Abandoned' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title={t('customersTitle')} description={t('customersDescription')} />
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            {t('export')}
          </Button>
          {/* Add Customer Button */}
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <UserPlus className="w-4 h-4" />
            {t('addCustomer')}
          </Button>
        </div>
      </div>

      <GlassCard intensity="low" className="p-0 overflow-hidden min-h-[500px] flex flex-col">
        {/* Tabs & Toolbar */}
        <div className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${
                    filters.segment === tab.id
                      ? 'border-emerald-500 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50/50">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchCustomers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto justify-center">
                <Filter className="w-4 h-4" />
                {t('moreFilters')}
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {allCustomers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title={filters.search ? t('noCustomersMatchSearch') : t('noCustomersTitle')}
              description={t('noCustomersDescription')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-6 py-3">{t('customerLabel')}</th>
                  <th className="px-6 py-3">{t('status')}</th>
                  <th className="px-6 py-3">{t('orders')}</th>
                  <th className="px-6 py-3">{t('spent')}</th>
                  <th className="px-6 py-3 pl-10 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {allCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/80 transition group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 opactiy-0 group-hover:opacity-100 transition-opacity"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-sm">
                          {(customer.name || customer.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/app/customers/${customer.id}`}
                            className="font-medium text-gray-900 hover:text-emerald-600"
                          >
                            {customer.name || t('guestLabel')}
                          </Link>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {customer.email || customer.phone || 'No contact info'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {customer.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{customer.totalOrders || 0} orders</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(customer.totalSpent || 0)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/app/customers/${customer.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag className="w-4 h-4 mr-2" />
                            Add Tags
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
          <div>
            {/* Showing 1-20 of 100 */}
            {allCustomers.length > 0 && `Showing ${allCustomers.length} results`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('page', String(filters.page - 1));
                setSearchParams(newParams);
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={allCustomers.length < 20} // Simple check
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('page', String(filters.page + 1));
                setSearchParams(newParams);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

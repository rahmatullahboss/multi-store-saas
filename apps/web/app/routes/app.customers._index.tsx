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

import { json, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import {
  useLoaderData,
  Link,
  useSearchParams,
  useFetcher,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { customers, stores } from '@db/schema';
import { eq, desc, and, or, like, sql } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { canExportCustomers, type PlanType } from '~/utils/plans.server';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  Download,
  Trash2,
  Tag,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageHeader, EmptyState } from '~/components/ui';
import { GlassCard } from '~/components/ui/GlassCard';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { Button } from '~/components/ui/button';
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

  // Get Store Info (Currency & Plan)
  const storeResult = await db
    .select({ currency: stores.currency, planType: stores.planType })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  const currency = storeResult[0]?.currency || 'BDT';
  const planType = (storeResult[0]?.planType as PlanType) || 'free';

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
    } else if (segment === 'window_shopper') {
      // Window Shoppers = customers who browsed but never ordered (totalOrders = 0)
      conditions.push(eq(customers.totalOrders, 0));
    }
  }

  // Execute Query with all conditions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereCondition: any = conditions.length === 1 ? conditions[0] : and(...conditions);
  const allCustomers: (typeof customers.$inferSelect)[] = await (db.select().from(customers) as any)
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
    canExport: canExportCustomers(planType),
    planType,
    // total: totalCount?.count || 0
  });
}

// ============================================================================
// ACTION — Delete customer (storeId-scoped, server-enforced)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'delete_customer') {
    const customerId = parseInt(formData.get('customerId') as string || '0');
    if (!customerId) return json({ error: 'Customer ID required' }, { status: 400 });

    const db = drizzle(context.cloudflare.env.DB);

    // SECURITY: verify the customer belongs to THIS store before deleting
    const [existing] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
      .limit(1);

    if (!existing) return json({ error: 'Customer not found' }, { status: 404 });

    await db
      .delete(customers)
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));

    return json({ success: true });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">{error.status} — {error.statusText || 'Error'}</h2>
        <p className="text-gray-500 mt-2">{error.data}</p>
        <Link to="/app/customers" className="text-emerald-600 hover:underline mt-4 inline-block">← Back to Customers</Link>
      </div>
    );
  }
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
      <Link to="/app/customers" className="text-emerald-600 hover:underline mt-4 inline-block">← Back to Customers</Link>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CustomersListPage() {
  const {
    customers: allCustomers,
    filters,
    canExport,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const deleteFetcher = useFetcher();

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

  const tabs = [
    { id: 'all', label: t('dashboard:allCustomers') || 'All' },
    { id: 'vip', label: t('dashboard:vipCustomers') || 'VIP' },
    { id: 'new', label: t('dashboard:newCustomers') || 'New' },
    { id: 'returning', label: t('dashboard:returningCustomers') || 'Returning' },
    { id: 'window_shopper', label: t('dashboard:windowShoppers') || 'Abandoned' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title={t('dashboard:customersTitle')} description={t('dashboard:customersDescription')} />
        <div className="flex items-center gap-2">
          {/* Export Button - Premium+ only */}
          {canExport ? (
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              {t('dashboard:export')}
            </Button>
          ) : (
            <Link to="/app/upgrade">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
              >
                <Download className="w-4 h-4" />
                {t('dashboard:export')}
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-1">
                  Premium
                </span>
              </Button>
            </Link>
          )}
          {/* Add Customer Button */}
          <Link to="/app/customers/new">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <UserPlus className="w-4 h-4" />
              {t('dashboard:addCustomer')}
            </Button>
          </Link>
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
                placeholder={t('dashboard:searchCustomers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto justify-center">
                <Filter className="w-4 h-4" />
                {t('dashboard:moreFilters')}
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {allCustomers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title={filters.search ? t('dashboard:noCustomersMatchSearch') : t('dashboard:noCustomersTitle')}
              description={t('dashboard:noCustomersDescription')}
            />
          </div>
        ) : (
          <>
            {/* ===== MOBILE CARD VIEW ===== */}
            <div className="md:hidden pb-4 space-y-3 px-4">
              {allCustomers.map((customer) => {
                const name = customer.name || customer.email || '?';
                const initials = name.slice(0, 2).toUpperCase();
                const avatarColors = [
                  'bg-blue-100 text-blue-600',
                  'bg-purple-100 text-purple-600',
                  'bg-amber-100 text-amber-600',
                  'bg-rose-100 text-rose-600',
                  'bg-teal-100 text-teal-600',
                ];
                const colorClass = avatarColors[(customer.id || 0) % avatarColors.length];
                const isVip = (customer.totalOrders || 0) >= 10 || (customer.totalSpent || 0) >= 50000;
                const isInactive = (customer.totalOrders || 0) === 0;
                const isNew = !isVip && !isInactive && (customer.totalOrders || 0) <= 2;

                return (
                  <div key={customer.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${isInactive ? 'opacity-75' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-12 w-12 rounded-full font-bold text-lg ${colorClass}`}>
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-slate-900 font-bold text-base">
                            {customer.name || t('dashboard:guestLabel')}
                          </h3>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {customer.email || customer.phone || '—'}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/app/customers/${customer.id}`}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>

                    {/* Stats */}
                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-slate-500 text-xs block mb-1">{t('dashboard:totalOrders') || 'Total Orders'}</span>
                        <span className="text-slate-900 font-bold text-sm">{customer.totalOrders || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block mb-1">{t('dashboard:totalRevenue') || 'Total Revenue'}</span>
                        <span className="text-slate-900 font-bold text-sm">{formatPrice(customer.totalSpent || 0)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                      {isVip ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Star className="w-3 h-3" />
                          VIP
                        </span>
                      ) : isInactive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {t('dashboard:inactive') || 'Inactive'}
                        </span>
                      ) : isNew ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {t('dashboard:newCustomers') || 'New'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {t('dashboard:active') || 'Active'}
                        </span>
                      )}
                      <Link
                        to={`/app/customers/${customer.id}`}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1 group"
                      >
                        {t('dashboard:viewProfile') || 'View Profile'}
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===== DESKTOP TABLE VIEW ===== */}
            <div className="hidden md:block overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                    <th className="px-6 py-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="px-6 py-3">{t('dashboard:customerLabel')}</th>
                    <th className="px-6 py-3">{t('dashboard:status')}</th>
                    <th className="px-6 py-3">{t('dashboard:orders')}</th>
                    <th className="px-6 py-3">{t('dashboard:spent')}</th>
                    <th className="px-6 py-3 pl-10 text-right">{t('dashboard:actions')}</th>
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
                              {customer.name || t('dashboard:guestLabel')}
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
                            {t('dashboard:active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {customer.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{customer.totalOrders || 0} {t('dashboard:orders')}</td>
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
                            <DropdownMenuLabel>{t('dashboard:actions')}</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/app/customers/${customer.id}`}>{t('dashboard:viewDetails')}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="w-4 h-4 mr-2" />
                              {t('dashboard:addTags')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              {/* SECURITY: delete is server-enforced with storeId check in action() */}
                              <deleteFetcher.Form
                                method="post"
                                onSubmit={(e) => {
                                  if (!window.confirm(t('dashboard:confirmDeleteCustomer') || 'Delete this customer? This cannot be undone.')) {
                                    e.preventDefault();
                                  }
                                }}
                                className="w-full"
                              >
                                <input type="hidden" name="intent" value="delete_customer" />
                                <input type="hidden" name="customerId" value={customer.id} />
                                <button
                                  type="submit"
                                  disabled={deleteFetcher.state !== 'idle'}
                                  className="w-full flex items-center text-red-600 px-2 py-1.5 text-sm cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('dashboard:deleteCustomer')}
                                </button>
                              </deleteFetcher.Form>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
          <div>
            {/* Showing 1-20 of 100 */}
            {allCustomers.length > 0 && t('dashboard:showingResults', { count: allCustomers.length })}
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
              {t('dashboard:previous')}
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
              {t('dashboard:next')}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

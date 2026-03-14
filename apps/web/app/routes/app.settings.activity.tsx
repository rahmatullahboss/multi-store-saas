/**
 * Activity Log Page
 *
 * Route: /app/settings/activity
 *
 * Mobile-first timeline design with:
 * - Date group filters (Today / This Week / This Month)
 * - Category chips (Orders / Products / Settings / Team / Auth)
 * - Grouped timeline with sticky date headers
 * - Dark mode support
 * - Desktop-responsive layout
 */

import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useSearchParams, Link } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { activityLogs, users } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0&display=swap',
  },
];

export const meta: MetaFunction = () => {
  return [{ title: 'Activity Log - Ozzyl' }];
};

// ============================================================================
// TYPES
// ============================================================================
type DateFilter = 'today' | 'week' | 'month' | 'all';
type CategoryFilter = 'all' | 'orders' | 'products' | 'settings' | 'team' | 'auth';

// ============================================================================
// LOADER — fetch activity logs
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });


  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  const filterUser = url.searchParams.get('user');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Fetch team members for filter
  const teamMembers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.storeId, storeId));

  // Fetch logs
  const allLogs = await db
    .select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      details: activityLogs.details,
      ipAddress: activityLogs.ipAddress,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .where(eq(activityLogs.storeId, storeId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(500);

  // Filter by user
  let filteredLogs = allLogs;
  if (filterUser) {
    const filterUserId = parseInt(filterUser, 10);
    filteredLogs = filteredLogs.filter((log) => log.userId === filterUserId);
  }

  const paginatedLogs = filteredLogs.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredLogs.length / limit);

  const userMap = new Map(teamMembers.map((u) => [u.id, u]));
  const enrichedLogs = paginatedLogs.map((log) => ({
    ...log,
    user: log.userId ? userMap.get(log.userId) ?? null : null,
    parsedDetails: (() => {
      try { return log.details ? JSON.parse(log.details) : null; } catch { return null; }
    })(),
  }));

  return json({
    logs: enrichedLogs,
    teamMembers,
    pagination: { page, totalPages, total: filteredLogs.length },
  });
}

// ============================================================================
// HELPERS
// ============================================================================
function getIconConfig(action: string, entityType: string | null) {
  const a = action.toLowerCase();
  const e = (entityType || '').toLowerCase();

  if (a.includes('order') || e === 'order')
    return { symbol: 'shopping_bag', bg: 'bg-emerald-100', color: 'text-emerald-600', category: 'orders' };
  if (a.includes('product') || e === 'product' || a.includes('inventory') || e === 'inventory')
    return { symbol: 'inventory_2', bg: 'bg-blue-100', color: 'text-blue-500', category: 'products' };
  if (a.includes('customer') || e === 'customer' || a.includes('signup') || a.includes('register'))
    return { symbol: 'person_add', bg: 'bg-purple-100', color: 'text-purple-500', category: 'team' };
  if (a.includes('setting') || e === 'settings' || a.includes('payment') || a.includes('domain'))
    return { symbol: 'settings', bg: 'bg-orange-100', color: 'text-orange-500', category: 'settings' };
  if (a.includes('login') || a.includes('auth') || a.includes('logout') || a.includes('password') || a.includes('fail'))
    return { symbol: 'security', bg: 'bg-red-100', color: 'text-red-500', category: 'auth' };
  if (a.includes('team') || a.includes('user') || a.includes('member') || a.includes('invite'))
    return { symbol: 'group', bg: 'bg-indigo-100', color: 'text-indigo-500', category: 'team' };
  if (a.includes('campaign') || a.includes('email') || a.includes('marketing'))
    return { symbol: 'campaign', bg: 'bg-pink-100', color: 'text-pink-500', category: 'settings' };

  return { symbol: 'receipt_long', bg: 'bg-slate-100', color: 'text-slate-500', category: 'all' };
}

function formatActionLabel(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getRelativeTime(date: Date | string | null): string {
  if (!date) return '';
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'এইমাত্র';
  if (diffMins < 60) return `${diffMins}m আগে`;
  if (diffHours < 24) return `${diffHours}h আগে`;
  if (diffDays < 7) return `${diffDays}d আগে`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(
  logs: Array<{ createdAt: Date | string | null; id: number; action: string; entityType: string | null; [key: string]: unknown }>
): Array<{ label: string; logs: typeof logs }> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, typeof logs> = {};
  const order: string[] = [];

  logs.forEach((log) => {
    if (!log.createdAt) return;
    const d = new Date(log.createdAt);
    let label: string;

    if (d.toDateString() === today.toDateString()) {
      label = `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = `Yesterday, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(log);
  });

  return order.map((label) => ({ label, logs: groups[label] }));
}

function filterByDate(
  logs: Array<{ createdAt: Date | string | null; [key: string]: unknown }>,
  dateFilter: DateFilter
) {
  if (dateFilter === 'all') return logs;
  const now = new Date();
  return logs.filter((log) => {
    if (!log.createdAt) return false;
    const d = new Date(log.createdAt);
    const diffMs = now.getTime() - d.getTime();
    if (dateFilter === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') return diffMs <= 7 * 86400000;
    if (dateFilter === 'month') return diffMs <= 30 * 86400000;
    return true;
  });
}

function filterByCategory(
  logs: Array<{ action: string; entityType: string | null; [key: string]: unknown }>,
  category: CategoryFilter
) {
  if (category === 'all') return logs;
  return logs.filter((log) => {
    const { category: c } = getIconConfig(log.action, log.entityType);
    return c === category;
  });
}

// ============================================================================
// AVATAR
// ============================================================================
function UserAvatar({ name, avatarUrl }: { name?: string | null; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User'}
        className="w-5 h-5 rounded-full object-cover"
      />
    );
  }
  if (name) {
    const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
        <span className="text-[9px] font-bold text-emerald-700">{initials}</span>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
      <span className="text-[9px] font-bold text-slate-500">SA</span>
    </div>
  );
}

// ============================================================================
// TIMELINE ITEM
// ============================================================================
type LogItem = {
  id: number;
  action: string;
  entityType: string | null;
  entityId: number | null;
  createdAt: Date | string | null;
  ipAddress: string | null;
  user: { id: number; name: string | null; email: string } | null | undefined;
  parsedDetails: Record<string, unknown> | null;
};

function TimelineItem({
  log,
  isLast,
}: {
  log: LogItem;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const icon = getIconConfig(log.action, log.entityType);
  const label = formatActionLabel(log.action);

  // Build subtitle
  let subtitle = '';
  if (log.entityType && log.entityId) {
    subtitle = `${log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1)} #${log.entityId}`;
  } else if (log.parsedDetails) {
    const keys = Object.keys(log.parsedDetails);
    if (keys.length > 0) {
      const val = log.parsedDetails[keys[0]];
      subtitle = typeof val === 'string' ? val : '';
    }
  }
  if (log.ipAddress) {
    subtitle = subtitle ? `${subtitle} • IP: ${log.ipAddress}` : `IP: ${log.ipAddress}`;
  }

  const isSecurityAlert = icon.category === 'auth' && log.action.toLowerCase().includes('fail');

  return (
    <div className="group flex gap-3 relative pb-6 last:pb-0">
      {/* Timeline vertical line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-100" />
      )}

      {/* Icon bubble */}
      <div className="relative z-10 shrink-0">
        <div
          className={`w-10 h-10 rounded-full ${icon.bg} flex items-center justify-center ring-4 ring-white shadow-sm`}
        >
          <span className={`material-symbols-outlined text-xl ${icon.color}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
            {icon.symbol}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-snug truncate">
              {label}
              {log.entityId && (
                <span className="text-emerald-600 font-bold"> #{log.entityId}</span>
              )}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
              {formatTime(log.createdAt)}
            </span>
            {/* Security alert chevron */}
            {isSecurityAlert && (
              <button className="text-emerald-600">
                <span className="material-symbols-outlined text-xl leading-none">chevron_right</span>
              </button>
            )}
            {/* Details expand toggle */}
            {log.parsedDetails && !isSecurityAlert && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Toggle details"
              >
                <span className="material-symbols-outlined text-lg leading-none">
                  {expanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* User / source row */}
        <div className="flex items-center gap-2 mt-2">
          {log.user ? (
            <>
              <UserAvatar name={log.user.name} />
              <span className="text-xs text-slate-500">
                {log.user.name || log.user.email}
              </span>
            </>
          ) : isSecurityAlert ? (
            <>
              <span className="material-symbols-outlined text-red-400 text-base leading-none">warning</span>
              <span className="text-xs text-slate-500">System Alert</span>
            </>
          ) : (
            <>
              <UserAvatar name={null} />
              <span className="text-xs text-slate-500">System Admin</span>
            </>
          )}
          <span className="text-slate-300 text-xs">•</span>
          <span className="text-xs text-slate-400">{getRelativeTime(log.createdAt)}</span>
        </div>

        {/* Expanded details */}
        {expanded && log.parsedDetails && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <pre className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(log.parsedDetails, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-slate-400">history</span>
      </div>
      <p className="text-base font-semibold text-slate-700 mb-1">কোনো অ্যাক্টিভিটি নেই</p>
      <p className="text-sm text-slate-400">
        নতুন কার্যক্রম হলে এখানে দেখা যাবে
      </p>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function ActivityLogsPage() {
  const { logs, pagination } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateFilter = (searchParams.get('date') as DateFilter) || 'today';
  const categoryFilter = (searchParams.get('category') as CategoryFilter) || 'all';

  function setDateFilter(key: DateFilter) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('date', key);
      next.delete('page');
      return next;
    });
  }

  function setCategoryFilter(key: CategoryFilter) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('category', key);
      next.delete('page');
      return next;
    });
  }

  // Apply client-side filters (date + category) on top of server data
  const dateFiltered = filterByDate(logs as Parameters<typeof filterByDate>[0], dateFilter);
  const filtered = filterByCategory(
    dateFiltered as unknown as Parameters<typeof filterByCategory>[0],
    categoryFilter
  );
  const grouped = groupByDate(filtered as Parameters<typeof groupByDate>[0]);

  const dateOptions: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  const categoryOptions: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'orders', label: 'Orders' },
    { key: 'products', label: 'Products' },
    { key: 'settings', label: 'Settings' },
    { key: 'team', label: 'Team' },
    { key: 'auth', label: 'Auth' },
  ];

  return (
    <>

      {/* ════════════════════════════════════════════════
          MOBILE layout  (max-w-md centered card)
          DESKTOP layout (full-width with max-w-3xl)
      ════════════════════════════════════════════════ */}
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto">

          {/* ─── HEADER ─── */}
          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-4 lg:px-6 h-14">
              <Link
                to="/app/settings"
                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
              >
                <span className="material-symbols-outlined text-2xl leading-none">arrow_back</span>
              </Link>

              <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
                Activity Log
              </h1>

              <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
                <span className="material-symbols-outlined text-base leading-none text-emerald-500">
                  radio_button_checked
                </span>
                <span>{pagination.total} activities</span>
              </div>

              <button className="flex lg:hidden items-center justify-center w-10 h-10 -mr-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700">
                <span className="material-symbols-outlined text-2xl leading-none">tune</span>
              </button>
              
              {/* Spacer for layout balance on desktop */}
              <div className="hidden lg:block w-10" />
            </div>

            {/* ─── FILTER PILLS ─── */}
            <div className="pb-3 pt-1 space-y-2.5">
              <div className="flex gap-2 px-4 lg:px-6 overflow-x-auto hide-scrollbar">
                {dateOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setDateFilter(key)}
                    className={`flex h-8 shrink-0 items-center px-4 rounded-full text-sm font-medium transition-all ${
                      dateFilter === key
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 px-4 lg:px-6 overflow-x-auto hide-scrollbar">
                {categoryOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`flex h-8 shrink-0 items-center px-4 rounded-full border text-sm font-medium transition-all ${
                      categoryFilter === key
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* ─── TIMELINE CONTENT ─── */}
          <main className="px-4 lg:px-6 pt-4 pb-32">
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {grouped.map(({ label, logs: groupLogs }) => (
                  <div key={label}>
                    <div className="sticky top-[132px] z-20 -mx-1 px-1 py-1.5 mb-3">
                      <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] leading-none text-emerald-500">
                          calendar_today
                        </span>
                        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {label}
                        </h2>
                      </div>
                    </div>

                    <div className="pl-0">
                      {groupLogs.map((log, idx) => (
                        <TimelineItem
                          key={log.id}
                          log={log as LogItem}
                          isLast={idx === groupLogs.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      {pagination.page > 1 && (
                        <Link
                          to={`?page=${pagination.page - 1}`}
                          className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                        >
                          ← Prev
                        </Link>
                      )}
                      {pagination.page < pagination.totalPages && (
                        <Link
                          to={`?page=${pagination.page + 1}`}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                        >
                          Next →
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {pagination.totalPages <= 1 && filtered.length > 0 && (
                  <div className="flex justify-center pt-2 pb-4">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-500 shadow-sm">
                      <span className="material-symbols-outlined text-base leading-none text-emerald-500">
                        check_circle
                      </span>
                      সব অ্যাক্টিভিটি লোড হয়েছে
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Hide-scrollbar utility (same as original design) */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

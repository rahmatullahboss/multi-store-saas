/**
 * Activity Logs Page
 * 
 * Route: /app/settings/activity
 * 
 * Features:
 * - Timeline of store activities
 * - Filter by user/action type
 * - Details expansion
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { activityLogs, users } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getActionLabel, getActionColor } from '~/lib/activity';
import { 
  Activity, Filter, User, ChevronDown, ChevronUp,
  Clock, FileText
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Activity Log - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER - Fetch activity logs
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  const filterUser = url.searchParams.get('user');
  const filterAction = url.searchParams.get('action');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Fetch all team members for filter dropdown
  const teamMembers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.storeId, storeId));

  // Build query - fetch all and filter in JS since D1 has limited query support
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
    .limit(500); // Fetch more for filtering

  // Apply filters
  let filteredLogs = allLogs;
  
  if (filterUser) {
    const filterUserId = parseInt(filterUser, 10);
    filteredLogs = filteredLogs.filter(log => log.userId === filterUserId);
  }
  
  if (filterAction) {
    filteredLogs = filteredLogs.filter(log => log.action === filterAction);
  }

  // Paginate
  const paginatedLogs = filteredLogs.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredLogs.length / limit);

  // Enrich logs with user info
  const userMap = new Map(teamMembers.map(u => [u.id, u]));
  const enrichedLogs = paginatedLogs.map(log => ({
    ...log,
    user: log.userId ? userMap.get(log.userId) : null,
    parsedDetails: log.details ? JSON.parse(log.details) : null,
  }));

  // Get unique actions for filter
  const uniqueActions = [...new Set(allLogs.map(l => l.action))];

  return json({
    logs: enrichedLogs,
    teamMembers,
    uniqueActions,
    pagination: {
      page,
      totalPages,
      total: filteredLogs.length,
    },
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ActivityLogsPage() {
  const { logs, teamMembers, uniqueActions, pagination } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const { t, lang } = useTranslation();

  const filterUser = searchParams.get('user') || '';
  const filterAction = searchParams.get('action') || '';

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const toggleExpand = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (date: Date | string | null) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('activityLogs')}</h1>
        <p className="text-gray-600">{lang === 'bn' ? 'আপনার স্টোরের সকল কার্যক্রম ট্র্যাক করুন' : 'Track all actions in your store'}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Filter */}
          <div>
            <label htmlFor="filterUser" className="block text-sm font-medium text-gray-700 mb-1">
              Team Member
            </label>
            <select
              id="filterUser"
              value={filterUser}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="">All Members</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label htmlFor="filterAction" className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              id="filterAction"
              value={filterAction}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(filterUser || filterAction) && (
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="mt-3 text-sm text-emerald-600 hover:text-emerald-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500">{pagination.total} activities found</p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activity recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Actions will appear here as they happen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className="relative pl-8 pb-4 last:pb-0"
              >
                {/* Timeline line */}
                {index < logs.length - 1 && (
                  <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${getActionColor(log.action)} flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-current rounded-full opacity-60" />
                </div>

                {/* Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                        {log.entityType && (
                          <span className="text-xs text-gray-500">
                            {log.entityType}
                            {log.entityId && ` #${log.entityId}`}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {log.user ? (
                          <>
                            <User className="w-4 h-4" />
                            <span>{log.user.name || log.user.email}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">System</span>
                        )}
                        <span className="text-gray-400">•</span>
                        <Clock className="w-4 h-4" />
                        <span title={formatDate(log.createdAt)}>
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Expand button for details */}
                    {log.parsedDetails && (
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedLogs.has(log.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {log.parsedDetails && expandedLogs.has(log.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <FileText className="w-3 h-3" />
                        Details
                      </div>
                      <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.parsedDetails, null, 2)}
                      </pre>
                      {log.ipAddress && (
                        <p className="text-xs text-gray-400 mt-2">IP: {log.ipAddress}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link
                  to={`?${new URLSearchParams({
                    ...Object.fromEntries(searchParams),
                    page: String(pagination.page - 1),
                  })}`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  to={`?${new URLSearchParams({
                    ...Object.fromEntries(searchParams),
                    page: String(pagination.page + 1),
                  })}`}
                  className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

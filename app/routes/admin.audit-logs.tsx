/**
 * Super Admin - Audit Logs
 * 
 * Route: /admin/audit-logs
 * 
 * View all admin actions for accountability and security.
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { desc, eq, sql } from 'drizzle-orm';
import { adminAuditLogs, users } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  History, 
  User, 
  Store, 
  CreditCard, 
  Globe, 
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Shield
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Audit Logs - Super Admin' }];
};

// Helper functions (inline to avoid server-client split)
type AuditAction = 
  | 'store_suspend' 
  | 'store_unsuspend' 
  | 'store_delete' 
  | 'store_restore'
  | 'store_impersonate'
  | 'payment_approve'
  | 'payment_reject'
  | 'domain_approve'
  | 'domain_reject'
  | 'ai_approve'
  | 'ai_reject'
  | 'coupon_create'
  | 'coupon_delete'
  | 'broadcast_send'
  | 'plan_change'
  | 'bulk_action'
  | 'other';

function getActionDescription(action: AuditAction | string): string {
  const descriptions: Record<string, string> = {
    store_suspend: 'Store সাসপেন্ড করা হয়েছে',
    store_unsuspend: 'Store আনসাসপেন্ড করা হয়েছে',
    store_delete: 'Store ডিলিট করা হয়েছে',
    store_restore: 'Store রিস্টোর করা হয়েছে',
    store_impersonate: 'Store এ লগইন করা হয়েছে (Impersonate)',
    payment_approve: 'পেমেন্ট এপ্রুভ করা হয়েছে',
    payment_reject: 'পেমেন্ট রিজেক্ট করা হয়েছে',
    domain_approve: 'Domain এপ্রুভ করা হয়েছে',
    domain_reject: 'Domain রিজেক্ট করা হয়েছে',
    ai_approve: 'AI Agent এপ্রুভ করা হয়েছে',
    ai_reject: 'AI Agent রিজেক্ট করা হয়েছে',
    coupon_create: 'Coupon তৈরি করা হয়েছে',
    coupon_delete: 'Coupon ডিলিট করা হয়েছে',
    broadcast_send: 'Broadcast পাঠানো হয়েছে',
    plan_change: 'Plan পরিবর্তন করা হয়েছে',
    bulk_action: 'Bulk action সম্পন্ন হয়েছে',
    other: 'অন্যান্য action',
  };
  return descriptions[action] || action;
}

function getActionColor(action: string): 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' {
  const colors: Record<string, 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange'> = {
    store_suspend: 'red',
    store_unsuspend: 'green',
    store_delete: 'red',
    store_restore: 'green',
    store_impersonate: 'yellow',
    payment_approve: 'green',
    payment_reject: 'red',
    domain_approve: 'green',
    domain_reject: 'red',
    ai_approve: 'green',
    ai_reject: 'red',
    coupon_create: 'blue',
    coupon_delete: 'orange',
    broadcast_send: 'purple',
    plan_change: 'blue',
    bulk_action: 'purple',
    other: 'blue',
  };
  return colors[action] || 'blue';
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, db);
  
  const drizzleDb = drizzle(db);
  const url = new URL(request.url);
  const actionFilter = url.searchParams.get('action') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 50;
  const offset = (page - 1) * limit;
  
  // Build base query with optional filter
  const whereCondition = actionFilter !== 'all' 
    ? eq(adminAuditLogs.action, actionFilter as AuditAction)
    : undefined;
  
  const logs = await drizzleDb
    .select({
      id: adminAuditLogs.id,
      action: adminAuditLogs.action,
      targetType: adminAuditLogs.targetType,
      targetId: adminAuditLogs.targetId,
      targetName: adminAuditLogs.targetName,
      details: adminAuditLogs.details,
      ipAddress: adminAuditLogs.ipAddress,
      createdAt: adminAuditLogs.createdAt,
      adminEmail: users.email,
      adminName: users.name,
    })
    .from(adminAuditLogs)
    .leftJoin(users, eq(users.id, adminAuditLogs.adminId))
    .where(whereCondition)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit)
    .offset(offset);
  
  // Get total count
  const countResult = await drizzleDb
    .select({ count: sql<number>`COUNT(*)` })
    .from(adminAuditLogs);
  const totalLogs = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalLogs / limit);
  
  // Get unique actions for filter
  const actionsResult = await drizzleDb
    .selectDistinct({ action: adminAuditLogs.action })
    .from(adminAuditLogs);
  const availableActions = actionsResult.map(a => a.action);

  return json({
    logs,
    totalLogs,
    totalPages,
    currentPage: page,
    availableActions,
    actionFilter,
  });
}

export default function AdminAuditLogs() {
  const { logs, totalLogs, totalPages, currentPage, availableActions, actionFilter } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleActionFilter = (action: string) => {
    setSearchParams(prev => {
      if (action === 'all') {
        prev.delete('action');
      } else {
        prev.set('action', action);
      }
      prev.delete('page');
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTargetIcon = (targetType: string | null) => {
    switch (targetType) {
      case 'store': return <Store className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'domain': return <Globe className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getActionBadgeClasses = (action: string) => {
    const color = getActionColor(action as AuditAction);
    const colorMap: Record<string, string> = {
      red: 'bg-red-500/20 text-red-400',
      green: 'bg-green-500/20 text-green-400',
      blue: 'bg-blue-500/20 text-blue-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      purple: 'bg-purple-500/20 text-purple-400',
      orange: 'bg-orange-500/20 text-orange-400',
    };
    return colorMap[color] || 'bg-slate-700 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            Audit Logs
          </h1>
          <p className="text-slate-400 mt-1">
            সকল Admin action এর রেকর্ড ({totalLogs} entries)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter by Action:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleActionFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                actionFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {availableActions.map(action => (
              <button
                key={action}
                onClick={() => handleActionFilter(action || '')}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  actionFilter === action
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {action?.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">সময়</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <History className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400">কোনো audit log নেই</p>
                    <p className="text-sm text-slate-500">Admin actions এখানে দেখা যাবে</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{log.adminName || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{log.adminEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getActionBadgeClasses(log.action || '')}`}>
                        {getActionDescription(log.action as AuditAction)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-slate-500">
                          {getTargetIcon(log.targetType)}
                        </div>
                        <div>
                          <p className="text-sm text-white">{log.targetName || '-'}</p>
                          <p className="text-xs text-slate-500">{log.targetType} #{log.targetId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-400 max-w-48 truncate">
                        {log.details || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-500 font-mono">
                        {log.ipAddress || '-'}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm bg-slate-800 text-slate-400 rounded-lg disabled:opacity-50 hover:text-white transition"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm bg-slate-800 text-slate-400 rounded-lg disabled:opacity-50 hover:text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Support Tickets Dashboard - List View
 * Shows all support tickets for the current store
 */

import type { LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link, Form } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { supportTickets, stores } from '@db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { 
  Ticket, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  MessageCircle,
  Loader2
} from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });
  
  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);

  // Filters
  const status = url.searchParams.get('status') || 'all';

  // Build query conditions
  const conditions = [eq(supportTickets.storeId, storeId)];

  if (status !== 'all') {
    conditions.push(eq(supportTickets.status, status as any));
  }

  // Fetch tickets
  const tickets = await db
    .select()
    .from(supportTickets)
    .where(and(...conditions))
    .orderBy(desc(supportTickets.createdAt))
    .limit(50);

  // Fetch stats
  const statsResult = await db
    .select({
      total: sql<number>`count(*)`,
      open: sql<number>`sum(case when status = 'open' then 1 else 0 end)`,
      inProgress: sql<number>`sum(case when status = 'in_progress' then 1 else 0 end)`,
      waiting: sql<number>`sum(case when status = 'waiting' then 1 else 0 end)`,
      resolved: sql<number>`sum(case when status = 'resolved' then 1 else 0 end)`,
      closed: sql<number>`sum(case when status = 'closed' then 1 else 0 end)`,
    })
    .from(supportTickets)
    .where(eq(supportTickets.storeId, storeId));

  const stats = statsResult[0];

  return json({
    tickets,
    stats,
    filters: { status },
  });
}

const statusConfig = {
  open: { label: 'Open', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  waiting: { label: 'Waiting', color: 'bg-blue-100 text-blue-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
};

const categoryLabels = {
  billing: 'Billing',
  technical: 'Technical',
  account: 'Account',
  feature: 'Feature Request',
  other: 'Other',
};

export default function SupportTicketsPage() {
  const { tickets, stats, filters } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-600" />
            Support Tickets
          </h1>
          <p className="text-gray-500 mt-1">Manage your support requests and track responses</p>
        </div>
        <Link
          to="/app/support/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: 'Total', value: stats.total, bg: 'bg-white border-gray-200', text: 'text-gray-900', labelColor: 'text-gray-600', icon: Ticket, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
          { label: 'Open', value: stats.open, bg: 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200', text: 'text-red-900', labelColor: 'text-red-700', icon: AlertCircle, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
          { label: 'In Progress', value: stats.inProgress, bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200', text: 'text-yellow-900', labelColor: 'text-yellow-700', icon: Loader2, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
          { label: 'Waiting', value: stats.waiting, bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200', text: 'text-blue-900', labelColor: 'text-blue-700', icon: Clock, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Resolved', value: stats.resolved, bg: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200', text: 'text-green-900', labelColor: 'text-green-700', icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
        ].map(({ label, value, bg, text, labelColor, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className={`${bg} p-3 md:p-6 rounded-xl border shadow-sm`}>
            <div className="flex items-center justify-between gap-1">
              <div>
                <div className={`text-xs md:text-sm font-medium ${labelColor} mb-0.5 md:mb-1`}>{label}</div>
                <div className={`text-xl md:text-3xl font-bold ${text}`}>{value}</div>
              </div>
              <div className={`w-8 h-8 md:w-12 md:h-12 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 md:w-6 md:h-6 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Form method="get" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              defaultValue={filters.status}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 font-medium shadow-sm"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </Form>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">No tickets yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Create a new ticket if you need help
              </p>
              <Link
                to="/app/support/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create Ticket
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
              const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;
              const StatusIcon = status.icon;
              
              return (
                <Link
                  key={ticket.id}
                  to={`/app/support/${ticket.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${priority.color}`}>
                          {priority.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {categoryLabels[ticket.category as keyof typeof categoryLabels] || ticket.category}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <span className="text-sm text-gray-500">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString() : '-'}
                      </span>
                      {ticket.adminResponse && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
                          <MessageCircle className="w-3 h-3" />
                          Reply received
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

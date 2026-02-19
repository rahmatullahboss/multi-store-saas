/**
 * Super Admin - Support Tickets Management
 * 
 * Route: /admin/tickets
 * 
 * Features:
 * - View all support tickets from all stores
 * - Filter by status, priority, category
 * - Assign tickets to admin users
 * - Respond to tickets
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { supportTickets, stores, users } from '@db/schema';
import { eq, desc, and, sql, or } from 'drizzle-orm';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  Ticket, 
  Filter, 
  Search, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  MessageCircle,
  ChevronRight,
  User,
  Building
} from 'lucide-react';

// ============================================================================
// LOADER - Fetch all tickets with optional filters
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  
  // Require super admin access
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'all';
  const priority = url.searchParams.get('priority') || 'all';
  const category = url.searchParams.get('category') || 'all';
  const search = url.searchParams.get('search') || '';
  
  const drizzleDb = drizzle(db);
  
  // Build query conditions
  const conditions: any[] = [];
  
  if (status !== 'all') {
    conditions.push(eq(supportTickets.status, status as any));
  }
  
  if (priority !== 'all') {
    conditions.push(eq(supportTickets.priority, priority as any));
  }
  
  if (category !== 'all') {
    conditions.push(eq(supportTickets.category, category as any));
  }
  
  if (search) {
    conditions.push(
      or(
        sql`${supportTickets.subject} LIKE ${`%${search}%`}`,
        sql`${supportTickets.description} LIKE ${`%${search}%`}`
      )
    );
  }
  
  // Fetch tickets with store info
  const tickets = await drizzleDb
    .select({
      id: supportTickets.id,
      subject: supportTickets.subject,
      description: supportTickets.description,
      category: supportTickets.category,
      priority: supportTickets.priority,
      status: supportTickets.status,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
      storeId: supportTickets.storeId,
      adminResponse: supportTickets.adminResponse,
      storeName: stores.name,
      storeSubdomain: stores.subdomain,
    })
    .from(supportTickets)
    .leftJoin(stores, eq(supportTickets.storeId, stores.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(supportTickets.createdAt))
    .limit(100);
  
  // Fetch stats
  const statsResult = await drizzleDb
    .select({
      total: sql<number>`count(*)`,
      open: sql<number>`sum(case when ${supportTickets.status} = 'open' then 1 else 0 end)`,
      inProgress: sql<number>`sum(case when ${supportTickets.status} = 'in_progress' then 1 else 0 end)`,
      waiting: sql<number>`sum(case when ${supportTickets.status} = 'waiting' then 1 else 0 end)`,
      resolved: sql<number>`sum(case when ${supportTickets.status} = 'resolved' then 1 else 0 end)`,
    })
    .from(supportTickets);
  
  const stats = statsResult[0];
  
  return json({
    tickets,
    stats,
    filters: { status, priority, category, search },
  });
}

// ============================================================================
// CONFIG
// ============================================================================
const statusConfig = {
  open: { label: 'Open', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Loader2 },
  waiting: { label: 'Waiting', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600 border-red-200' },
};

const categoryConfig = {
  billing: { label: 'Billing', color: 'bg-purple-100 text-purple-700' },
  technical: { label: 'Technical', color: 'bg-blue-100 text-blue-700' },
  account: { label: 'Account', color: 'bg-green-100 text-green-700' },
  feature: { label: 'Feature Request', color: 'bg-yellow-100 text-yellow-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminTicketsPage() {
  const { tickets, stats, filters } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  const buildQueryString = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return params.toString();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Ticket className="w-7 h-7 text-red-400" />
          Support Tickets
        </h1>
        <p className="text-slate-400 mt-1">
          View and manage support tickets from all stores
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-sm font-medium text-slate-400">Total Tickets</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total || 0}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-sm font-medium text-red-400">Open</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{stats.open || 0}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-sm font-medium text-yellow-400">In Progress</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{stats.inProgress || 0}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-sm font-medium text-blue-400">Waiting</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{stats.waiting || 0}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-sm font-medium text-green-400">Resolved</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{stats.resolved || 0}</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <Form method="get" className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              name="search"
              defaultValue={filters.search}
              placeholder="Search tickets..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              name="status"
              defaultValue={filters.status}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
            <select
              name="priority"
              defaultValue={filters.priority}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
            <select
              name="category"
              defaultValue={filters.category}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Category</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
          >
            Apply Filters
          </button>
        </Form>
      </div>
      
      {/* Tickets List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
              const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;
              const category = categoryConfig[ticket.category as keyof typeof categoryConfig] || categoryConfig.other;
              const StatusIcon = status.icon;
              
              return (
                <div key={ticket.id} className="p-4 hover:bg-slate-800/50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${priority.color}`}>
                          {priority.label}
                        </span>
                        
                        {/* Category Badge */}
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                      
                      {/* Subject */}
                      <h3 className="text-white font-medium truncate">
                        {ticket.subject}
                      </h3>
                      
                      {/* Description Preview */}
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      {/* Store Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {ticket.storeName || `Store #${ticket.storeId}`}
                          {ticket.storeSubdomain && ` (@${ticket.storeSubdomain})`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        {ticket.adminResponse && (
                          <span className="flex items-center gap-1 text-green-400">
                            <MessageCircle className="w-3 h-3" />
                            Has response
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* View Button */}
                    <Link
                      to={`/app/support/${ticket.id}`}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition text-sm"
                    >
                      View
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

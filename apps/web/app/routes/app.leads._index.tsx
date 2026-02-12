/**
 * Lead Management Dashboard - List View
 * Shows all leads for the current store with filters and analytics
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions } from '@db/schema';
import { eq, desc, and, sql, gte } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { Download, Mail, Phone, Calendar, Filter, TrendingUp, Users, CheckCircle, XCircle, Settings2, Megaphone } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);

  // Filters
  const status = url.searchParams.get('status') || 'all';
  const dateRange = url.searchParams.get('date') || '30'; // days
  const source = url.searchParams.get('source') || 'all';

  // Build query conditions
  let conditions = [eq(leadSubmissions.storeId, storeId)];

  if (status !== 'all') {
    conditions.push(eq(leadSubmissions.status, status as any));
  }

  if (source !== 'all') {
    conditions.push(eq(leadSubmissions.source, source));
  }

  if (dateRange !== 'all') {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    conditions.push(gte(leadSubmissions.createdAt, daysAgo));
  }

  // Fetch leads
  const leads = await db
    .select()
    .from(leadSubmissions)
    .where(and(...conditions))
    .orderBy(desc(leadSubmissions.createdAt))
    .limit(100);

  // Fetch stats
  const statsResult = await db
    .select({
      total: sql<number>`count(*)`,
      new: sql<number>`sum(case when status = 'new' then 1 else 0 end)`,
      contacted: sql<number>`sum(case when status = 'contacted' then 1 else 0 end)`,
      qualified: sql<number>`sum(case when status = 'qualified' then 1 else 0 end)`,
      converted: sql<number>`sum(case when status = 'converted' then 1 else 0 end)`,
      lost: sql<number>`sum(case when status = 'lost' then 1 else 0 end)`,
    })
    .from(leadSubmissions)
    .where(eq(leadSubmissions.storeId, storeId));

  const stats = statsResult[0];

  return json({
    leads,
    stats,
    filters: { status, dateRange, source },
  });
}

export default function LeadsPage() {
  const { leads, stats, filters } = useLoaderData<typeof loader>();

  const conversionRate = stats.total > 0
    ? ((stats.converted / stats.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-violet-600" />
            Leads
          </h1>
          <p className="text-gray-500 mt-1">Manage and track your lead submissions</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/app/leads/export"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Link>
          <Link
            to="/app/settings/lead-gen"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition font-medium shadow-sm"
          >
            <Settings2 className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Total Leads</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-700 mb-1">New</div>
              <div className="text-3xl font-bold text-blue-900">{stats.new}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-yellow-700 mb-1">Contacted</div>
              <div className="text-3xl font-bold text-yellow-900">{stats.contacted}</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-700 mb-1">Converted</div>
              <div className="text-3xl font-bold text-green-900">{stats.converted}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-700 mb-1">Conv. Rate</div>
              <div className="text-3xl font-bold text-purple-900">{conversionRate}%</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              name="date"
              defaultValue={filters.dateRange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              name="source"
              defaultValue={filters.source}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="all">All Sources</option>
              <option value="contact_form">Contact Form</option>
              <option value="popup">Popup</option>
              <option value="chat">Chat</option>
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

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">No leads yet</p>
                      <p className="text-sm text-gray-500">
                        Start promoting your landing page to capture leads!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      {lead.company && (
                        <div className="text-sm text-gray-500">{lead.company}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-sm text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {lead.email}
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-sm text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{lead.formId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : lead.status === 'contacted'
                            ? 'bg-yellow-100 text-yellow-700'
                            : lead.status === 'qualified'
                            ? 'bg-purple-100 text-purple-700'
                            : lead.status === 'converted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(lead.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/app/leads/${lead.id}`}
                        className="text-violet-600 hover:text-violet-700 font-medium text-sm inline-flex items-center gap-1"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

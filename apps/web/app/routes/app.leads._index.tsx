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
import { Download, Mail, Phone, Calendar, Filter, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';

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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage and track your lead submissions</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/app/leads/export"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Link>
          <Link
            to="/app/settings/lead-gen"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Leads</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 mb-1">New</div>
              <div className="text-3xl font-bold text-blue-700">{stats.new}</div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-700 mb-1">Contacted</div>
              <div className="text-3xl font-bold text-yellow-700">{stats.contacted}</div>
            </div>
            <Mail className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 mb-1">Converted</div>
              <div className="text-3xl font-bold text-green-700">{stats.converted}</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700 mb-1">Conv. Rate</div>
              <div className="text-3xl font-bold text-purple-700">{conversionRate}%</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Form method="get" className="bg-white p-4 rounded-lg border shadow-sm mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={filters.status}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              name="date"
              defaultValue={filters.dateRange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              name="source"
              defaultValue={filters.source}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="contact_form">Contact Form</option>
              <option value="popup">Popup</option>
              <option value="chat">Chat</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </Form>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium text-gray-500">No leads yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Start promoting your landing page to capture leads!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      {lead.company && (
                        <div className="text-sm text-gray-500">{lead.company}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-sm text-gray-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
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
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
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
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(lead.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/app/leads/${lead.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
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

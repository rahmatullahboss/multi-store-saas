/**
 * Lead Detail View
 * View and manage individual lead details
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { requireStoreAccess } from '~/services/auth.server';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Globe, Tag, Brain } from 'lucide-react';
import { Link } from '@remix-run/react';

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { storeId } = await requireStoreAccess(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  const lead = await db.query.leadSubmissions.findFirst({
    where: and(
      eq(leadSubmissions.id, parseInt(params.id!)),
      eq(leadSubmissions.storeId, storeId)
    ),
  });

  if (!lead) {
    throw new Response('Lead not found', { status: 404 });
  }

  return json({ lead });
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { storeId } = await requireStoreAccess(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'update_status') {
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;

    await db
      .update(leadSubmissions)
      .set({
        status: status as any,
        notes: notes || null,
        updatedAt: new Date(),
        contactedAt: status === 'contacted' ? new Date() : undefined,
      })
      .where(
        and(
          eq(leadSubmissions.id, parseInt(params.id!)),
          eq(leadSubmissions.storeId, storeId)
        )
      );

    return json({ success: true });
  }

  return redirect(`/app/leads/${params.id}`);
}

export default function LeadDetailPage() {
  const { lead } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const formData = lead.formData ? JSON.parse(lead.formData) : {};
  const aiInsights = lead.aiInsights ? JSON.parse(lead.aiInsights) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/app/leads"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Name</div>
                <div className="text-lg font-medium text-gray-900">{lead.name}</div>
              </div>

              {lead.email && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {lead.phone}
                  </a>
                </div>
              )}

              {lead.company && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Company</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Building2 className="w-4 h-4" />
                    {lead.company}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {formData.message && (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.message}</p>
            </div>
          )}

          {/* AI Insights */}
          {aiInsights && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-purple-900">AI Insights</h2>
              </div>
              <div className="space-y-3">
                {lead.aiScore && (
                  <div>
                    <div className="text-sm text-purple-700 mb-1">Lead Quality Score</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-purple-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 rounded-full h-2"
                          style={{ width: `${lead.aiScore * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-purple-900">
                        {Math.round(lead.aiScore * 100)}%
                      </span>
                    </div>
                  </div>
                )}
                <pre className="text-sm text-purple-800 bg-white/50 p-3 rounded">
                  {JSON.stringify(aiInsights, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <Form method="post">
              <input type="hidden" name="_action" value="update_status" />
              <input type="hidden" name="status" value={lead.status} />
              <textarea
                name="notes"
                rows={4}
                defaultValue={lead.notes || ''}
                placeholder="Add private notes about this lead..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Notes'}
              </button>
            </Form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <Form method="post">
              <input type="hidden" name="_action" value="update_status" />
              <input type="hidden" name="notes" value={lead.notes || ''} />
              <select
                name="status"
                defaultValue={lead.status}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </Form>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Source</div>
                <div className="flex items-center gap-2 text-gray-900">
                  <Tag className="w-4 h-4" />
                  {lead.formId}
                </div>
              </div>

              <div>
                <div className="text-gray-600 mb-1">Submitted</div>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4" />
                  {new Date(lead.createdAt).toLocaleString()}
                </div>
              </div>

              {lead.pageUrl && (
                <div>
                  <div className="text-gray-600 mb-1">Page URL</div>
                  <a
                    href={lead.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    {lead.pageUrl}
                  </a>
                </div>
              )}

              {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                <div>
                  <div className="text-gray-600 mb-1">UTM Parameters</div>
                  <div className="text-xs space-y-1">
                    {lead.utmSource && <div>Source: {lead.utmSource}</div>}
                    {lead.utmMedium && <div>Medium: {lead.utmMedium}</div>}
                    {lead.utmCampaign && <div>Campaign: {lead.utmCampaign}</div>}
                  </div>
                </div>
              )}

              {lead.ipAddress && (
                <div>
                  <div className="text-gray-600 mb-1">IP Address</div>
                  <div className="text-gray-900">{lead.ipAddress}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

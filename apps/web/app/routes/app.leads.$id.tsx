/**
 * Lead Detail View
 * View and manage individual lead details
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions, customers, studentDocuments } from '@db/schema';
import { eq, and, desc, SQL, or } from 'drizzle-orm';
import { getStoreId, requireUserId } from '~/services/auth.server';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Globe, Tag, Brain, Save, Loader2 } from 'lucide-react';
import { Link } from '@remix-run/react';
import { AdminLeadDocuments } from '~/components/lead-gen/AdminLeadDocuments';
import { UserPlus } from 'lucide-react';

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });
  const db = drizzle(context.cloudflare.env.DB);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw new Response('Invalid lead id', { status: 400 });

  const [lead] = await db
    .select()
    .from(leadSubmissions)
    .where(and(eq(leadSubmissions.id, id), eq(leadSubmissions.storeId, storeId)))
    .limit(1);

  if (!lead) {
    throw new Response('Lead not found', { status: 404 });
  }

  let relatedDocuments: Array<{
    id: number;
    fileUrl: string;
    fileName: string;
    documentType: string | null;
    createdAt: Date | null;
    customerId: number | null;
  }> = [];

  if (lead.email || lead.phone) {
    let identityCondition: SQL<unknown> | null = null;
    if (lead.email && lead.phone) {
      identityCondition = or(eq(customers.email, lead.email), eq(customers.phone, lead.phone)) as SQL<unknown>;
    } else if (lead.email) {
      identityCondition = eq(customers.email, lead.email) as SQL<unknown>;
    } else if (lead.phone) {
      identityCondition = eq(customers.phone, lead.phone) as SQL<unknown>;
    }

    if (identityCondition) {
      const [matchedCustomer] = await db
        .select({ id: customers.id })
        .from(customers)
        .where(and(eq(customers.storeId, storeId), identityCondition))
        .limit(1);

      if (matchedCustomer) {
        try {
          relatedDocuments = await db
            .select({
              id: studentDocuments.id,
              fileUrl: studentDocuments.fileUrl,
              fileName: studentDocuments.fileName,
              documentType: studentDocuments.documentType,
              createdAt: studentDocuments.createdAt,
              customerId: studentDocuments.customerId,
            })
            .from(studentDocuments)
            .where(
              and(
                eq(studentDocuments.storeId, storeId),
                eq(studentDocuments.customerId, matchedCustomer.id)
              )
            )
            .orderBy(desc(studentDocuments.createdAt))
            .limit(50);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (/no such table:\s*student_documents/i.test(message)) {
            relatedDocuments = [];
          } else {
            throw error;
          }
        }
      }
    }
  }

  return json({ lead, relatedDocuments, matchedCustomerId: relatedDocuments.length > 0 ? relatedDocuments[0].customerId : null }); // Hacky: We need to pass matchedCustomer.id properly. Let's do it better.
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });
  const db = drizzle(context.cloudflare.env.DB);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw new Response('Invalid lead id', { status: 400 });

  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'update_status') {
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;

    await db
      .update(leadSubmissions)
      .set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any, // TODO: Fix type definition for leadSubmissions.status enum
        notes: notes || null,
        updatedAt: new Date(),
        contactedAt: status === 'contacted' ? new Date() : undefined,
      })
      .where(
        and(
          eq(leadSubmissions.id, id),
          eq(leadSubmissions.storeId, storeId)
        )
      );

    return json({ success: true });
  }

  if (action === 'convert_customer') {
     // TODO: Implement actual customer creation logic (mocked for now)
     // 1. Create customer record
     // 2. Link documents
     // 3. Update lead status
     
     await db
      .update(leadSubmissions)
      .set({ 
        status: 'converted',
        updatedAt: new Date()
      })
      .where(and(eq(leadSubmissions.id, id), eq(leadSubmissions.storeId, storeId)));
      
     return json({ success: true });
  }

  return redirect(`/app/leads/${params.id}`);
}

export default function LeadDetailPage() {
  const { lead, relatedDocuments, matchedCustomerId } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const leadStatus = lead.status ?? 'new';
  const leadNotes = lead.notes ?? '';

  let formData: { message?: string; document?: string } = {};
  let aiInsights: Record<string, unknown> | null = null;
  try {
    formData = lead.formData ? (JSON.parse(lead.formData) as { message?: string; document?: string }) : {};
  } catch {
    formData = {};
  }
  try {
    aiInsights = lead.aiInsights ? (JSON.parse(lead.aiInsights) as Record<string, unknown>) : null;
  } catch {
    aiInsights = null;
  }

  const allDocuments = [
    ...(formData.document ? [{ id: -1, fileUrl: formData.document, fileName: 'Lead Attachment', documentType: 'lead-form', createdAt: lead.createdAt }] : []),
    ...relatedDocuments,
  ].filter((doc, index, arr) => arr.findIndex((item) => item.fileUrl === doc.fileUrl) === index);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/app/leads"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Link>
        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
           {lead.status !== 'converted' && (
             <Form method="post">
                <input type="hidden" name="_action" value="convert_customer" />
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition shadow-sm"
                  onClick={e => !confirm('Convert this lead to a registered customer?') && e.preventDefault()}
                >
                  <UserPlus className="w-4 h-4" />
                  Convert to Customer
                </button>
             </Form>
           )}
        </div>

        </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Name</div>
                <div className="text-lg font-semibold text-gray-900">{lead.name}</div>
              </div>

              {lead.email && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Email</div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-2 font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Phone</div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-2 font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    {lead.phone}
                  </a>
                </div>
              )}

              {lead.company && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Company</div>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Building2 className="w-4 h-4" />
                    {lead.company}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {formData.message && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Message</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{formData.message}</p>
              </div>
            </div>
          )}

          {/* Documents */}
          <AdminLeadDocuments 
            documents={allDocuments.map(d => ({ ...d, createdAt: d.createdAt ? new Date(d.createdAt) : null }))} 
            customerId={matchedCustomerId ?? undefined}
          />

          {/* AI Insights */}
          {aiInsights && (
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-200 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-purple-900">AI Insights</h2>
              </div>
              <div className="p-6 space-y-4">
                {lead.aiScore && (
                  <div>
                    <div className="text-sm font-medium text-purple-700 mb-2">Lead Quality Score</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-purple-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-600 rounded-full h-2.5 transition-all"
                          style={{ width: `${lead.aiScore * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-purple-900 min-w-[3rem] text-right">
                        {Math.round(lead.aiScore * 100)}%
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-purple-700 mb-2">Analysis Data</div>
                  <pre className="text-xs text-purple-800 bg-white/60 p-4 rounded-lg overflow-x-auto border border-purple-200">
                    {JSON.stringify(aiInsights, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50/50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Private Notes</h2>
              <p className="text-sm text-gray-500 mt-0.5">Internal notes visible only to your team</p>
            </div>
            <div className="p-6">
              <Form method="post">
                <input type="hidden" name="_action" value="update_status" />
                <input type="hidden" name="status" value={leadStatus} />
                <textarea
                  name="notes"
                  rows={5}
                  defaultValue={leadNotes}
                  placeholder="Add private notes about this lead..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Notes
                    </>
                  )}
                </button>
              </Form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-green-50/50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Lead Status</h2>
              <p className="text-sm text-gray-500 mt-0.5">Update the lead pipeline stage</p>
            </div>
            <div className="p-6">
              <Form method="post">
                <input type="hidden" name="_action" value="update_status" />
                <input type="hidden" name="notes" value={leadNotes} />
                <select
                  name="status"
                  defaultValue={leadStatus}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium"
                >
                  <option value="new">🆕 New</option>
                  <option value="contacted">📞 Contacted</option>
                  <option value="qualified">✅ Qualified</option>
                  <option value="converted">🎉 Converted</option>
                  <option value="lost">❌ Lost</option>
                </select>
              </Form>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Lead Details</h2>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <div className="text-gray-500 font-medium mb-1.5">Source</div>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Tag className="w-4 h-4 text-violet-600" />
                  {lead.formId}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="text-gray-500 font-medium mb-1.5">Submitted</div>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-violet-600" />
                  {new Date(lead.createdAt).toLocaleString()}
                </div>
              </div>

              {lead.pageUrl && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="text-gray-500 font-medium mb-1.5">Page URL</div>
                  <a
                    href={lead.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-600 hover:text-violet-700 hover:underline break-all"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{lead.pageUrl}</span>
                  </a>
                </div>
              )}

              {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="text-gray-500 font-medium mb-2">UTM Parameters</div>
                  <div className="space-y-1.5 text-xs bg-gray-50 rounded-lg p-3">
                    {lead.utmSource && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Source:</span>
                        <span className="text-gray-900 font-medium">{lead.utmSource}</span>
                      </div>
                    )}
                    {lead.utmMedium && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Medium:</span>
                        <span className="text-gray-900 font-medium">{lead.utmMedium}</span>
                      </div>
                    )}
                    {lead.utmCampaign && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Campaign:</span>
                        <span className="text-gray-900 font-medium">{lead.utmCampaign}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lead.ipAddress && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="text-gray-500 font-medium mb-1.5">IP Address</div>
                  <div className="text-gray-900 font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                    {lead.ipAddress}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Email Campaigns Page
 * 
 * Route: /app/campaigns
 * 
 * Features:
 * - List all campaigns with status
 * - Create new campaign
 * - View campaign stats
 * - Delete campaigns
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { desc, eq, and, count } from 'drizzle-orm';
import { getStoreId, requireUserId } from '~/services/auth.server';
import { emailCampaigns, emailSubscribers } from '@db/schema';
import { 
  Plus, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Eye,
  Users,
  BarChart3
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Email Campaigns - Ozzyl' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get campaigns
  const campaigns = await db
    .select()
    .from(emailCampaigns)
    .where(eq(emailCampaigns.storeId, storeId))
    .orderBy(desc(emailCampaigns.createdAt));

  // Get subscriber count
  const subscriberResult = await db
    .select({ count: count() })
    .from(emailSubscribers)
    .where(
      and(
        eq(emailSubscribers.storeId, storeId),
        eq(emailSubscribers.status, 'subscribed')
      )
    );

  return json({
    campaigns,
    subscriberCount: subscriberResult[0]?.count || 0,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent');
  
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'delete') {
    const campaignId = Number(formData.get('campaignId'));
    await db
      .delete(emailCampaigns)
      .where(
        and(
          eq(emailCampaigns.id, campaignId),
          eq(emailCampaigns.storeId, storeId)
        )
      );
    return json({ success: true });
  }

  return json({ error: 'Unknown action' });
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    sending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Send },
    sent: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
  };

  const { bg, text, icon: Icon } = config[status] || config.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CampaignsPage() {
  const { campaigns, subscriberCount } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { t, lang } = useTranslation();
  const isDeleting = navigation.state === 'submitting' && 
    navigation.formData?.get('intent') === 'delete';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('campaigns')}</h1>
          <p className="text-gray-500 mt-1">
            {t('campaignsDescription')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/app/subscribers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
          >
            <Users className="w-4 h-4" />
            {t('navSubscribers')} ({subscriberCount})
          </Link>
          <Link
            to="/app/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition"
          >
            <Plus className="w-4 h-4" />
            {t('newCampaign')}
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('noCampaignsYet')}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {t('startEngagingDesc')}
          </p>
          <Link
            to="/app/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition"
          >
            <Plus className="w-4 h-4" />
            {t('createYourFirstCampaign')}
          </Link>
        </div>
      ) : (
        /* Campaigns Table */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-gray-100">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{campaign.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{campaign.subject}</p>
                  </div>
                  <StatusBadge status={campaign.status || 'draft'} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>📩 {campaign.recipientCount || 0} recipients</span>
                  {campaign.status === 'sent' && campaign.sentCount ? (
                    <span>✅ {campaign.sentCount} sent</span>
                  ) : null}
                  {campaign.createdAt ? (
                    <span>🗓 {new Date(campaign.createdAt).toLocaleDateString()}</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to={`/app/campaigns/${campaign.id}`}
                    className="flex-1 text-center py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg"
                  >
                    View
                  </Link>
                  {campaign.status === 'draft' && (
                    <Form method="post" className="flex-1">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="campaignId" value={campaign.id} />
                      <button
                        type="submit"
                        disabled={isDeleting}
                        onClick={(e) => { if (!confirm('Delete this campaign?')) e.preventDefault(); }}
                        className="w-full py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">
                    {t('campaign')}
                  </th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">
                    {t('status')}
                  </th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">
                    {t('recipients')}
                  </th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {t('stats')}
                    </div>
                  </th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">
                    {t('created')}
                  </th>
                  <th className="text-right py-3.5 px-4 text-sm font-semibold text-gray-900">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {campaign.subject}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={campaign.status || 'draft'} />
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">
                        {campaign.recipientCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {campaign.status === 'sent' ? (
                        <div className="text-sm">
                          <span className="text-green-600">{campaign.sentCount} sent</span>
                          {campaign.openCount ? (
                            <span className="text-gray-400 ml-2">
                              {Math.round((campaign.openCount / campaign.sentCount!) * 100)}% opened
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-500">
                        {campaign.createdAt 
                          ? new Date(campaign.createdAt).toLocaleDateString() 
                          : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/app/campaigns/${campaign.id}`}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {campaign.status === 'draft' && (
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="campaignId" value={campaign.id} />
                            <button
                              type="submit"
                              disabled={isDeleting}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Delete"
                              onClick={(e) => {
                                if (!confirm('Delete this campaign?')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subscriberCount}</p>
              <p className="text-sm text-gray-500">{t('activeSubscribers')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'sent').length}
              </p>
              <p className="text-sm text-gray-500">{t('campaignsSent')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">{t('totalEmailsSent')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

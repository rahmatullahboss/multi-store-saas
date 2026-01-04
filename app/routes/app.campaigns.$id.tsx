/**
 * Campaign Detail Page
 * 
 * Route: /app/campaigns/:id
 * 
 * Features:
 * - View campaign details
 * - View stats for sent campaigns
 * - Send draft campaigns
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, count } from 'drizzle-orm';
import { getStoreId, requireUserId } from '~/services/auth.server';
import { emailCampaigns, emailSubscribers, stores } from '@db/schema';
import { createCampaignService } from '~/services/campaign.server';
import { createEmailService } from '~/services/email.server';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  CheckCircle, 
  Users,
  Mail,
  MousePointer,
  Eye,
  AlertCircle
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Campaign Details - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  const campaignId = Number(params.id);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get campaign
  const campaignResult = await db
    .select()
    .from(emailCampaigns)
    .where(
      and(
        eq(emailCampaigns.id, campaignId),
        eq(emailCampaigns.storeId, storeId)
      )
    )
    .limit(1);

  if (campaignResult.length === 0) {
    throw new Response('Campaign not found', { status: 404 });
  }

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
    campaign: campaignResult[0],
    subscriberCount: subscriberResult[0]?.count || 0,
  });
}

// ============================================================================
// ACTION - Send campaign
// ============================================================================
export async function action({ request, context, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  const campaignId = Number(params.id);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const campaignService = createCampaignService(context.cloudflare.env.DB);

  // Get campaign
  const campaign = await campaignService.getCampaign(storeId, campaignId);
  if (!campaign) {
    throw new Response('Campaign not found', { status: 404 });
  }

  if (campaign.status !== 'draft') {
    return json({ error: 'Campaign already sent' }, { status: 400 });
  }

  // Get store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  const store = storeResult[0];

  // Get subscribers
  const subscribers = await campaignService.getSubscribers(storeId, 'subscribed');
  
  if (subscribers.length === 0) {
    return json({ error: 'No subscribers to send to' }, { status: 400 });
  }

  // Create email service
  const resendApiKey = context.cloudflare.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return json({ error: 'Email service not configured' }, { status: 500 });
  }

  const emailService = createEmailService(resendApiKey);
  const baseUrl = new URL(request.url).origin;
  
  // Update campaign status
  await db
    .update(emailCampaigns)
    .set({
      status: 'sending',
      recipientCount: subscribers.length,
    })
    .where(eq(emailCampaigns.id, campaignId));

  // Send emails
  let sentCount = 0;
  for (const subscriber of subscribers) {
    const result = await emailService.sendCampaignEmail({
      email: subscriber.email,
      subject: campaign.subject,
      content: campaign.content,
      storeName: store.name,
      previewText: campaign.previewText || undefined,
      unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&store=${storeId}`,
    });
    if (result.success) sentCount++;
  }

  // Mark as sent
  await db
    .update(emailCampaigns)
    .set({
      status: 'sent',
      sentCount,
      sentAt: new Date(),
    })
    .where(eq(emailCampaigns.id, campaignId));

  return json({ success: true, sentCount });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CampaignDetailPage() {
  const { campaign, subscriberCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSending = navigation.state === 'submitting';

  const statusConfig: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    sending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Send },
    sent: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
  };

  const status = statusConfig[campaign.status || 'draft'];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/app/campaigns"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-500">{campaign.subject}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
          <StatusIcon className="w-4 h-4" />
          {(campaign.status || 'draft').charAt(0).toUpperCase() + (campaign.status || 'draft').slice(1)}
        </span>
      </div>

      {/* Success/Error Message */}
      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-green-800">
            Campaign sent successfully to {actionData.sentCount} subscribers!
          </p>
        </div>
      )}
      
      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      {/* Stats (for sent campaigns) */}
      {campaign.status === 'sent' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="w-4 h-4" />
              Recipients
            </div>
            <p className="text-2xl font-bold text-gray-900">{campaign.recipientCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Send className="w-4 h-4" />
              Sent
            </div>
            <p className="text-2xl font-bold text-green-600">{campaign.sentCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Eye className="w-4 h-4" />
              Opens
            </div>
            <p className="text-2xl font-bold text-blue-600">{campaign.openCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <MousePointer className="w-4 h-4" />
              Clicks
            </div>
            <p className="text-2xl font-bold text-purple-600">{campaign.clickCount || 0}</p>
          </div>
        </div>
      )}

      {/* Campaign Details */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Subject:</span>
              <p className="font-medium text-gray-900">{campaign.subject}</p>
            </div>
            
            {campaign.previewText && (
              <div>
                <span className="text-sm text-gray-500">Preview Text:</span>
                <p className="text-gray-700">{campaign.previewText}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
          <div 
            className="border border-gray-200 rounded-lg p-6 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: campaign.content }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="font-medium text-gray-900">
              {campaign.createdAt 
                ? new Date(campaign.createdAt).toLocaleString() 
                : '-'}
            </p>
          </div>
          {campaign.sentAt && (
            <div>
              <span className="text-gray-500">Sent:</span>
              <p className="font-medium text-gray-900">
                {new Date(campaign.sentAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions (for draft campaigns) */}
      {campaign.status === 'draft' && (
        <div className="flex gap-3">
          <Form method="post">
            <button
              type="submit"
              disabled={isSending || subscriberCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : `Send to ${subscriberCount} subscribers`}
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}

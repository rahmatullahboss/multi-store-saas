/**
 * New Campaign Page
 * 
 * Route: /app/campaigns/new
 * 
 * Features:
 * - Create new email campaign
 * - HTML content editor
 * - Send now or schedule
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { Form, Link, useActionData, useLoaderData, useNavigation } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, count } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { emailCampaigns, emailSubscribers, stores } from '@db/schema';
import { createCampaignService } from '~/services/campaign.server';
import { createEmailService } from '~/services/email.server';
import { ArrowLeft, Send, Save, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { sanitizeHtml } from "~/utils/sanitize";

export const meta: MetaFunction = () => {
  return [{ title: 'New Campaign - Ozzyl' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const db = drizzle(context.cloudflare.env.DB);

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
    subscriberCount: subscriberResult[0]?.count || 0,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const subject = formData.get('subject') as string;
  const previewText = formData.get('previewText') as string;
  const content = formData.get('content') as string;
  const intent = formData.get('intent') as string;

  // Validation
  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Campaign name is required';
  if (!subject) errors.subject = 'Subject line is required';
  if (!content) errors.content = 'Email content is required';

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const campaignService = createCampaignService(context.cloudflare.env.DB);

  // Create campaign
  const campaign = await campaignService.createCampaign(storeId, userId, {
    name,
    subject,
    previewText,
    content,
  });

  if (intent === 'send') {
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
      return json({ 
        errors: { general: 'No subscribers to send to. Add subscribers first.' } 
      }, { status: 400 });
    }

    // Create email service
    const resendApiKey = context.cloudflare.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return json({ 
        errors: { general: 'Email service not configured. Set RESEND_API_KEY.' } 
      }, { status: 500 });
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
      .where(eq(emailCampaigns.id, campaign.id));

    // Send emails (in production, use Queue for background processing)
    let sentCount = 0;
    for (const subscriber of subscribers) {
      const result = await emailService.sendCampaignEmail({
        email: subscriber.email,
        subject,
        content,
        storeName: store.name,
        previewText,
        unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&store=${storeId}`,
      });
      if (!result.error) sentCount++;
    }

    // Mark as sent
    await db
      .update(emailCampaigns)
      .set({
        status: 'sent',
        sentCount,
        sentAt: new Date(),
      })
      .where(eq(emailCampaigns.id, campaign.id));
  }

  return redirect(`/app/campaigns/${campaign.id}`);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function NewCampaignPage() {
  const { subscriberCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  const [content, setContent] = useState(`<h2 style="color: #333; margin-bottom: 16px;">Hello!</h2>
<p style="color: #555; line-height: 1.6;">
  Thank you for being a valued customer. We have some exciting news to share with you!
</p>
<p style="color: #555; line-height: 1.6;">
  [Add your message here]
</p>
<p style="color: #555; line-height: 1.6;">
  Best regards,<br>
  Your Store Team
</p>`);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/campaigns"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('createCampaign')}</h1>
          <p className="text-gray-500">{t('sendEmailToSubscribers')}</p>
        </div>
      </div>

      {/* Subscriber Warning */}
      {subscriberCount === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">{t('noSubscribersYet')}</p>
            <p className="text-yellow-700 text-sm">
              {t('addSubscribersTip')}{' '}
              <Link to="/app/subscribers" className="underline">{t('addSubscribers')}</Link>
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {actionData?.errors?.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-800">{actionData.errors.general}</p>
        </div>
      )}

      {/* Form */}
      <Form method="post" className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('campaignName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g., January Newsletter"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.name && (
            <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).name}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('subjectLine')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            placeholder="e.g., New arrivals just for you! 🎉"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.subject ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.subject && (
            <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).subject}</p>
          )}
        </div>

        {/* Preview Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('previewText')}
          </label>
          <input
            type="text"
            name="previewText"
            placeholder={t('previewTextHint')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            {t('previewTextHint')}
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('emailContentHtml')} <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.content ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.content && (
            <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).content}</p>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('emailPreview')}
          </label>
          <div 
            className="border border-gray-200 rounded-lg p-6 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        </div>

        {/* Recipient Count */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
          <Users className="w-4 h-4" />
          {t('campaignTargetCount', { count: subscriberCount })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {t('saveAsDraft')}
          </button>
          <button
            type="submit"
            name="intent"
            value="send"
            disabled={isSubmitting || subscriberCount === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? t('sending') : t('sendNow')}
          </button>
        </div>
      </Form>
    </div>
  );
}

/**
 * Webhook Settings Page
 * 
 * Route: /app/settings/webhooks
 * 
 * Allows merchants to:
 * - Add/remove webhook endpoints
 * - Select event types
 * - View secret keys
 * - Toggle active/inactive
 * - View delivery logs
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { webhooks, webhookDeliveryLogs } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Copy, Check, Webhook, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Webhook Settings' }];
};

// Available webhook event types
const EVENT_TYPES = [
  { value: 'order.created', label: 'Order Created', labelBn: 'অর্ডার তৈরি হয়েছে' },
  { value: 'order.updated', label: 'Order Updated', labelBn: 'অর্ডার আপডেট হয়েছে' },
  { value: 'order.cancelled', label: 'Order Cancelled', labelBn: 'অর্ডার বাতিল হয়েছে' },
  { value: 'order.delivered', label: 'Order Delivered', labelBn: 'অর্ডার ডেলিভারি হয়েছে' },
  { value: 'payment.received', label: 'Payment Received', labelBn: 'পেমেন্ট এসেছে' },
];

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw redirect('/auth/login');

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch webhooks
  const webhookList = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.storeId, storeId))
    .orderBy(desc(webhooks.createdAt));

  // Fetch recent delivery logs
  const recentLogs = await db
    .select()
    .from(webhookDeliveryLogs)
    .innerJoin(webhooks, eq(webhookDeliveryLogs.webhookId, webhooks.id))
    .where(eq(webhooks.storeId, storeId))
    .orderBy(desc(webhookDeliveryLogs.deliveredAt))
    .limit(20);

  return json({ 
    webhooks: webhookList,
    recentLogs: recentLogs.map(r => ({ ...r.webhook_delivery_logs, webhookUrl: r.webhooks.url })),
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) return json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // Create new webhook
  if (intent === 'create') {
    const url = formData.get('url') as string;
    const selectedEvents = formData.getAll('events') as string[];

    if (!url || !url.startsWith('https://')) {
      return json({ error: 'URL must start with https://' }, { status: 400 });
    }

    if (selectedEvents.length === 0) {
      return json({ error: 'Select at least one event' }, { status: 400 });
    }

    // Generate secret
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const secret = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

    await db.insert(webhooks).values({
      storeId,
      url,
      topic: selectedEvents[0] || 'order.created', // Schema uses single topic
      secret,
      isActive: true,
    });

    return json({ success: true });
  }

  // Delete webhook
  if (intent === 'delete') {
    const webhookId = Number(formData.get('webhookId'));
    
    await db
      .delete(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.storeId, storeId)));

    return json({ success: true });
  }

  // Toggle active
  if (intent === 'toggle') {
    const webhookId = Number(formData.get('webhookId'));
    const isActive = formData.get('isActive') === 'true';
    
    await db
      .update(webhooks)
      .set({ isActive: !isActive })
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.storeId, storeId)));

    return json({ success: true });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function WebhookSettings() {
  const { webhooks: webhookList, recentLogs } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { t, lang } = useTranslation();
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSecret = (id: number) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Webhook className="w-6 h-6 text-emerald-600" />
            {lang === 'bn' ? 'ওয়েবহুক সেটিংস' : 'Webhook Settings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {lang === 'bn' 
              ? 'রিয়েল-টাইম নোটিফিকেশনের জন্য ওয়েবহুক এন্ডপয়েন্ট কনফিগার করুন'
              : 'Configure webhook endpoints for real-time notifications'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          {lang === 'bn' ? 'ওয়েবহুক যোগ করুন' : 'Add Webhook'}
        </button>
      </div>

      {/* Add Webhook Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {lang === 'bn' ? 'নতুন ওয়েবহুক' : 'New Webhook'}
          </h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="create" />
            
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {lang === 'bn' ? 'এন্ডপয়েন্ট URL' : 'Endpoint URL'}
              </label>
              <input
                type="url"
                name="url"
                required
                placeholder="https://your-server.com/webhook"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {lang === 'bn' ? 'HTTPS প্রয়োজন' : 'Must be HTTPS'}
              </p>
            </div>

            {/* Event Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'bn' ? 'ইভেন্ট টাইপস' : 'Event Types'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EVENT_TYPES.map((event) => (
                  <label
                    key={event.value}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="events"
                      value={event.value}
                      defaultChecked={event.value === 'order.created'}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      {lang === 'bn' ? event.labelBn : event.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  lang === 'bn' ? 'তৈরি করুন' : 'Create'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Webhooks List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {lang === 'bn' ? 'আপনার ওয়েবহুকস' : 'Your Webhooks'}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({webhookList.length})
            </span>
          </h2>
        </div>

        {webhookList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{lang === 'bn' ? 'এখনও কোনো ওয়েবহুক নেই' : 'No webhooks yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {webhookList.map((webhook) => {
              const topics = [webhook.topic]; // Schema uses single topic
              const isVisible = showSecrets[webhook.id];
              
              return (
                <div key={webhook.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* URL */}
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <p className="font-mono text-sm text-gray-900 truncate">
                          {webhook.url}
                        </p>
                        <a
                          href={webhook.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topics.map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>

                      {/* Secret */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Secret:</span>
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                          {isVisible ? webhook.secret : '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleSecret(webhook.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(webhook.secret || '', webhook.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedId === webhook.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Failure count */}
                      {(webhook.failureCount || 0) > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          {webhook.failureCount} failed attempts
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Form method="post">
                        <input type="hidden" name="intent" value="toggle" />
                        <input type="hidden" name="webhookId" value={webhook.id} />
                        <input type="hidden" name="isActive" value={String(webhook.isActive)} />
                        <button
                          type="submit"
                          className={`px-3 py-1 text-xs rounded-full ${
                            webhook.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {webhook.isActive 
                            ? (lang === 'bn' ? 'সক্রিয়' : 'Active') 
                            : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}
                        </button>
                      </Form>
                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="webhookId" value={webhook.id} />
                        <button
                          type="submit"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={(e) => {
                            if (!confirm(lang === 'bn' ? 'মুছে ফেলতে চান?' : 'Delete this webhook?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delivery Logs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {lang === 'bn' ? 'সাম্প্রতিক ডেলিভারি' : 'Recent Deliveries'}
          </h2>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{lang === 'bn' ? 'এখনও কোনো ডেলিভারি লগ নেই' : 'No delivery logs yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Event</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Endpoint</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-600">Status</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 truncate max-w-[200px]">
                      {log.webhookUrl}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          {log.statusCode}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" />
                          {log.statusCode || 'Error'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatDate(log.deliveredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documentation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          {lang === 'bn' ? 'কীভাবে ইন্টিগ্রেট করবেন' : 'How to Integrate'}
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• {lang === 'bn' ? 'ওয়েবহুক পেলোড JSON ফর্ম্যাটে আসবে' : 'Webhook payloads are sent as JSON'}</p>
          <p>• {lang === 'bn' ? 'Signature ভেরিফাই করতে X-Shop-Hmac-Sha256 হেডার ব্যবহার করুন' : 'Verify signature using X-Shop-Hmac-Sha256 header'}</p>
          <p>• {lang === 'bn' ? '200-299 রেসপন্স কোড সফল বলে গণ্য হবে' : 'Response codes 200-299 are considered successful'}</p>
        </div>
      </div>
    </div>
  );
}

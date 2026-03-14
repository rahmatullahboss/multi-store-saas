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

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { Form, Link, useLoaderData, useNavigation, useActionData } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { webhooks, webhookDeliveryLogs } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { getUserId } from '~/services/auth.server';
import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Copy, Check, Webhook, ExternalLink, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { z } from 'zod';
import { logActivity } from '~/lib/activity.server';

export const handle = { i18n: 'settings' };

export const meta: MetaFunction = () => {
  return [{ title: 'Webhook Settings' }];
};

// Available webhook event types
const EVENT_TYPE_VALUES = [
  'order.created',
  'order.updated',
  'order.cancelled',
  'order.delivered',
  'payment.received',
] as const;


const WebhookCreateSchema = z.object({
  url: z.string().trim().url().refine((v) => v.startsWith('https://'), 'URL must start with https://'),
  topic: z.enum(EVENT_TYPE_VALUES),
});

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

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
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // Create new webhook
  if (intent === 'create') {
    const parsed = WebhookCreateSchema.safeParse({
      url: formData.get('url'),
      topic: formData.get('topic') || 'order.created',
    });
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message || 'Invalid webhook payload' }, { status: 400 });
    }
    const { url, topic } = parsed.data;

    // Generate secret
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const secret = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

    await db.insert(webhooks).values({
      storeId,
      url,
      topic,
      secret,
      isActive: true,
    });

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'webhooks',
        intent: 'create',
        topic,
      },
    });

    return json({ success: true });
  }

  // Delete webhook
  if (intent === 'delete') {
    const webhookId = Number(formData.get('webhookId'));
    if (!Number.isInteger(webhookId) || webhookId <= 0) {
      return json({ error: 'Invalid webhook id' }, { status: 400 });
    }
    
    await db
      .delete(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.storeId, storeId)));

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'webhooks',
        intent: 'delete',
        webhookId,
      },
    });

    return json({ success: true });
  }

  // Toggle active
  if (intent === 'toggle') {
    const webhookId = Number(formData.get('webhookId'));
    if (!Number.isInteger(webhookId) || webhookId <= 0) {
      return json({ error: 'Invalid webhook id' }, { status: 400 });
    }
    const isActive = formData.get('isActive') === 'true';
    
    await db
      .update(webhooks)
      .set({ isActive: !isActive })
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.storeId, storeId)));

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'webhooks',
        intent: 'toggle',
        webhookId,
        nextIsActive: !isActive,
      },
    });

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
  const { lang, t } = useTranslation();
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const actionData = useActionData<typeof action>();
  const isCreating = navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'create';

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Clipboard API not available — user can copy manually
    });
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

  const topicLabel = (topic: string): string => {
    const keyMap: Record<string, string> = {
      'order.created': 'settings:webhooks.topic.orderCreated',
      'order.updated': 'settings:webhooks.topic.orderUpdated',
      'order.cancelled': 'settings:webhooks.topic.orderCancelled',
      'order.delivered': 'settings:webhooks.topic.orderDelivered',
      'payment.received': 'settings:webhooks.topic.paymentReceived',
      'product.updated': 'settings:webhooks.topic.productUpdated',
    };
    return keyMap[topic] ? t(keyMap[topic]) : topic;
  };

  return (
    <>
      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 h-[60px]">
            <Link to="/app/settings" className="p-2 -ml-2 text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              {t('settings:webhooks.pageTitle')}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex flex-col gap-5 p-4 pb-10">
          {/* Action Feedback */}
          {actionData && 'success' in actionData && actionData.success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              {t('settings:webhooks.savedSuccess')}
            </div>
          )}
          {actionData && 'error' in actionData && actionData.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {actionData.error}
            </div>
          )}
          {/* Add Webhook Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl font-medium"
          >
            <Plus className="w-5 h-5" />
            {t('settings:webhooks.addWebhook')}
          </button>

          {/* Mobile Add Webhook Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">
                  {t('settings:webhooks.newWebhook')}
                </h2>
              </div>
              <Form method="post" className="p-4 space-y-4">
                <input type="hidden" name="intent" value="create" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings:webhooks.endpointUrl')}
                  </label>
                  <input
                    type="url"
                    name="url"
                    required
                    placeholder="https://your-server.com/webhook"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('settings:webhooks.mustBeHttps')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('settings:webhooks.event')}
                  </label>
                  <select
                    name="topic"
                    defaultValue="order.created"
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    required
                  >
                    <option value="order.created">{t('settings:webhooks.topic.orderCreated')}</option>
                    <option value="order.updated">{t('settings:webhooks.topic.orderUpdated')}</option>
                    <option value="order.cancelled">{t('settings:webhooks.topic.orderCancelled')}</option>
                    <option value="payment.received">{t('settings:webhooks.topic.paymentReceived')}</option>
                    <option value="product.updated">{t('settings:webhooks.topic.productUpdated')}</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-medium disabled:opacity-50"
                  >
                    {isCreating ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      t('settings:webhooks.create')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-2xl font-medium"
                  >
                    {t('settings:webhooks.cancel')}
                  </button>
                </div>
              </Form>
            </div>
          )}

          {/* Mobile Webhooks List */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('settings:webhooks.yourWebhooks')} ({webhookList.length})
            </h2>
            {webhookList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8 text-center text-gray-500">
                <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t('settings:webhooks.noWebhooksYet')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhookList.map((webhook) => {
                  const isVisible = showSecrets[webhook.id];
                  return (
                    <div key={`mobile-webhook-${webhook.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <p className="font-mono text-sm text-gray-900 truncate flex-1">
                            {webhook.url}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {topicLabel(webhook.topic)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-500">{t('settings:webhooks.secret')}:</span>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono flex-1 truncate">
                            {isVisible ? (webhook.secret ?? t('settings:webhooks.noSecret')) : '••••••••••••••••'}
                          </code>
                          <button onClick={() => toggleSecret(webhook.id)} className="p-1 text-gray-400">
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button onClick={() => copyToClipboard(webhook.secret || '', webhook.id)} className="p-1 text-gray-400">
                            {copiedId === webhook.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        {(webhook.failureCount || 0) > 0 && (
                          <p className="text-xs text-red-500 mb-3">{t('settings:webhooks.failedAttempts', { count: webhook.failureCount })}</p>
                        )}
                        <div className="flex gap-2">
                          <Form method="post" className="flex-1">
                            <input type="hidden" name="intent" value="toggle" />
                            <input type="hidden" name="webhookId" value={webhook.id} />
                            <input type="hidden" name="isActive" value={String(webhook.isActive)} />
                            <button
                              type="submit"
                              className={`w-full py-2 text-sm rounded-xl ${
                                webhook.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {webhook.isActive ? t('settings:webhooks.active') : t('settings:webhooks.inactive')}
                            </button>
                          </Form>
                          {confirmDelete === webhook.id ? (
                            <div className="flex gap-2 items-center">
                              <Form method="post">
                                <input type="hidden" name="intent" value="delete" />
                                <input type="hidden" name="webhookId" value={webhook.id} />
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-xl font-medium"
                                >
                                  {t('settings:webhooks.confirmDelete')}
                                </button>
                              </Form>
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(null)}
                                className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded-xl"
                              >
                                {t('settings:webhooks.cancel')}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(webhook.id)}
                              className="p-2 text-red-500 bg-red-50 rounded-xl"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Delivery Logs */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('settings:webhooks.recentDeliveries')}
            </h2>
            {recentLogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8 text-center text-gray-500">
                <p>{t('settings:webhooks.noDeliveryLogs')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={`mobile-log-${log.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                        {log.eventType}
                      </span>
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          {log.statusCode}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-red-500">
                          <XCircle className="w-4 h-4" />
                          {log.statusCode || 'Error'}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-gray-600 truncate">{log.webhookUrl}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(log.deliveredAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Documentation */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              {t('settings:webhooks.howToIntegrate')}
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• {t('settings:webhooks.integrationTip1')}</p>
              <p>• {t('settings:webhooks.integrationTip2')}</p>
              <p>• {t('settings:webhooks.integrationTip3')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden md:block space-y-6">
        {/* Action Feedback */}
        {actionData && 'success' in actionData && actionData.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {t('settings:webhooks.savedSuccess')}
          </div>
        )}
        {actionData && 'error' in actionData && actionData.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {actionData.error}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Webhook className="w-6 h-6 text-emerald-600" />
              {t('settings:webhooks.pageTitle')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('settings:webhooks.pageSubtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            {t('settings:webhooks.addWebhook')}
          </button>
        </div>

      {/* Add Webhook Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('settings:webhooks.newWebhook')}
          </h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="create" />
            
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings:webhooks.endpointUrl')}
              </label>
              <input
                type="url"
                name="url"
                required
                placeholder="https://your-server.com/webhook"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('settings:webhooks.mustBeHttps')}
              </p>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('settings:webhooks.event')}
              </label>
              <select
                name="topic"
                defaultValue="order.created"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                required
              >
                <option value="order.created">{t('settings:webhooks.topic.orderCreated')}</option>
                <option value="order.updated">{t('settings:webhooks.topic.orderUpdated')}</option>
                <option value="order.cancelled">{t('settings:webhooks.topic.orderCancelled')}</option>
                <option value="payment.received">{t('settings:webhooks.topic.paymentReceived')}</option>
                <option value="product.updated">{t('settings:webhooks.topic.productUpdated')}</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('settings:webhooks.create')
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('settings:webhooks.cancel')}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Webhooks List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {t('settings:webhooks.yourWebhooks')}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({webhookList.length})
            </span>
          </h2>
        </div>

        {webhookList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t('settings:webhooks.noWebhooksYet')}</p>
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
                            {topicLabel(topic)}
                          </span>
                        ))}
                      </div>

                      {/* Secret */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{t('settings:webhooks.secret')}:</span>
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                          {isVisible ? (webhook.secret ?? t('settings:webhooks.noSecret')) : '••••••••••••••••'}
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
                          {t('settings:webhooks.failedAttempts', { count: webhook.failureCount })}
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
                            ? t('settings:webhooks.active')
                            : t('settings:webhooks.inactive')}
                        </button>
                      </Form>
                      {confirmDelete === webhook.id ? (
                        <div className="flex gap-2 items-center">
                          <Form method="post">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="webhookId" value={webhook.id} />
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg font-medium"
                            >
                              {t('settings:webhooks.confirmDelete')}
                            </button>
                          </Form>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 text-xs border border-gray-300 text-gray-600 rounded-lg"
                          >
                            {t('settings:webhooks.cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(webhook.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
            {t('settings:webhooks.recentDeliveries')}
          </h2>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{t('settings:webhooks.noDeliveryLogs')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">{t('settings:webhooks.tableEvent')}</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">{t('settings:webhooks.tableEndpoint')}</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-600">{t('settings:webhooks.tableStatus')}</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">{t('settings:webhooks.tableTime')}</th>
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
          {t('settings:webhooks.howToIntegrate')}
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• {t('settings:webhooks.integrationTip1')}</p>
          <p>• {t('settings:webhooks.integrationTip2')}</p>
          <p>• {t('settings:webhooks.integrationTip3')}</p>
        </div>
      </div>
      </div>
    </>
  );
}

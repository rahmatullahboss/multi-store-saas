import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useActionData, Form, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { apiKeys, webhooks } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { generateApiKey, revokeApiKey } from '~/services/api.server';
import { registerWebhook } from '~/services/webhook.server';
import { useState, useEffect, useRef } from 'react';
import { Trash2, Key, Copy, Check, ShieldAlert, Network, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '~/contexts/LanguageContext';
import { GlassCard } from '~/components/ui/GlassCard';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const db = drizzle(env.DB);
  const session = await getSession(request, env);
  const storeId = session.get('storeId');

  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const [keys, hooks] = await Promise.all([
    db.select().from(apiKeys).where(eq(apiKeys.storeId, storeId)).orderBy(desc(apiKeys.createdAt)),
    db.select().from(webhooks).where(eq(webhooks.storeId, storeId)).orderBy(desc(webhooks.id)),
  ]);

  return json({ keys, hooks });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const rawDb: D1Database = env.DB;
  const session = await getSession(request, env);
  const storeId = session.get('storeId');

  if (!storeId) return json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'createKey') {
    const name = (formData.get('name') as string) || 'General Key';
    const result = await generateApiKey(rawDb, storeId, name);
    return json({ newKey: result.key, createdKey: true });
  }

  if (intent === 'revokeKey') {
    const keyId = Number(formData.get('keyId'));
    await revokeApiKey(rawDb, keyId, storeId);
    return json({ revokedKey: true });
  }

  if (intent === 'createWebhook') {
    const url = formData.get('url') as string;
    if (!url || !url.startsWith('https://')) {
      return json({ error: 'Invalid URL: must start with https://' }, { status: 400 });
    }
    const result = await registerWebhook(rawDb, storeId, url, ['order.created']);
    return json({ newSecret: result.secret, createdWebhook: true });
  }

  if (intent === 'deleteWebhook') {
    const hookId = Number(formData.get('hookId'));
    const drizzleDb = drizzle(rawDb);
    await drizzleDb.delete(webhooks).where(and(eq(webhooks.id, hookId), eq(webhooks.storeId, storeId)));
    return json({ deletedWebhook: true });
  }

  return json({ success: true });
}

export default function DeveloperSettings() {
  const { keys, hooks } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks'>('keys');
  
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const keyFormRef = useRef<HTMLFormElement>(null);

  const [showWebhookSecret, setShowWebhookSecret] = useState<string | null>(null);
  const webhookFormRef = useRef<HTMLFormElement>(null);

  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();

  useEffect(() => {
    if (actionData && 'newKey' in actionData && actionData.newKey) {
      setCreatedKey(actionData.newKey);
      setShowKeyModal(true);
      toast.success('API Key created');
      keyFormRef.current?.reset();
    }
    if (actionData && 'revokedKey' in actionData) {
      toast.success('API Key revoked');
    }
    if (actionData && 'newSecret' in actionData && actionData.newSecret) {
      setShowWebhookSecret(actionData.newSecret as string);
      toast.success('Webhook registered');
      webhookFormRef.current?.reset();
    }
    if (actionData && 'deletedWebhook' in actionData) {
      toast.success('Webhook deleted');
    }
  }, [actionData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 h-14">
            <Link
              to="/app/settings"
              className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              {t('developerApi')}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Mobile Tabs */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('keys')}
              className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'keys'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <Key className="w-4 h-4 inline mr-1.5" />
              {t('apiKeys')}
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'webhooks'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <Network className="w-4 h-4 inline mr-1.5" />
              {t('webhooks')}
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 pt-4 pb-32">
          {/* API Keys Tab - Mobile */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              {/* Create Key Form */}
              <div className="rounded-2xl border border-gray-100 shadow-sm bg-amber-50/50 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{t('keysSecretWarning')}</p>
                </div>
                <Form method="post" className="flex gap-2" ref={keyFormRef}>
                  <input
                    type="text"
                    name="name"
                    placeholder={t('keyName')}
                    className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                  <button
                    type="submit"
                    name="intent"
                    value="createKey"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </Form>
              </div>

              {/* API Keys List - Mobile Cards */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">{t('apiKeys')}</p>
                {keys.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <Key className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('noApiKeys')}</p>
                  </div>
                ) : (
                  keys.map((key) => (
                    <div
                      key={key.id}
                      className={`rounded-2xl border border-gray-100 shadow-sm p-4 ${key.revokedAt ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{key.name}</p>
                          <p className="text-xs font-mono text-gray-500 mt-0.5">{key.keyPrefix}...</p>
                        </div>
                        {key.revokedAt ? (
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium">{t('revoked')}</span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium">{t('active')}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400">{new Date(key.createdAt!).toLocaleDateString()}</p>
                        {!key.revokedAt && (
                          <Form method="post" onSubmit={(e) => !confirm(t('revokeConfirm')) && e.preventDefault()}>
                            <input type="hidden" name="intent" value="revokeKey" />
                            <input type="hidden" name="keyId" value={key.id} />
                            <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Form>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Webhooks Tab - Mobile */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              {/* Create Webhook Form */}
              <div className="rounded-2xl border border-gray-100 shadow-sm bg-purple-50/50 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Network className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">{t('realtimeUpdates')}</p>
                    <p className="text-xs text-purple-600 mt-0.5">{t('topics')}: order.created</p>
                  </div>
                </div>
                <Form method="post" className="flex gap-2" ref={webhookFormRef}>
                  <input
                    type="url"
                    name="url"
                    placeholder="https://your-api.com/webhook"
                    className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                  <button
                    type="submit"
                    name="intent"
                    value="createWebhook"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </Form>
              </div>

              {/* Webhooks List - Mobile Cards */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">{t('webhooks')}</p>
                {hooks.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <Network className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('noResults')}</p>
                  </div>
                ) : (
                  hooks.map((hook) => (
                    <div key={hook.id} className="rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-mono text-gray-700 break-all pr-2">{hook.url}</p>
                        {hook.isActive ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium flex-shrink-0">{t('active')}</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium flex-shrink-0">{t('inactive')}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">order.created</span>
                        <Form method="post" onSubmit={(e) => !confirm(t('deleteWebhookConfirm')) && e.preventDefault()}>
                          <input type="hidden" name="intent" value="deleteWebhook" />
                          <input type="hidden" name="hookId" value={hook.id} />
                          <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Form>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{t('developerApi')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('developerApiDesc')}</p>
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'keys'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('apiKeys')}
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'webhooks'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('webhooks')}
          </button>
        </div>

        {/* API Keys Tab - Desktop */}
        {activeTab === 'keys' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <GlassCard className="p-4 bg-amber-50/50 border-amber-200/50 flex flex-col md:flex-row justify-between items-end gap-4 backdrop-blur-sm">
              <div className="flex gap-3 text-amber-800 text-sm max-w-2xl">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <p>{t('keysSecretWarning')}</p>
              </div>
              <Form method="post" className="flex items-end gap-2 w-full md:w-auto" ref={keyFormRef}>
                <input
                  type="text"
                  name="name"
                  placeholder={t('keyName')}
                  className="flex-1 md:w-auto px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm"
                  required
                />
                <button
                  type="submit"
                  name="intent"
                  value="createKey"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? t('saving') : <><Key className="w-4 h-4" /> {t('generateKey')}</>}
                </button>
              </Form>
            </GlassCard>

            <GlassCard intensity="low" className="overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-200/50">
                    <th className="px-6 py-3">{t('name')}</th>
                    <th className="px-6 py-3">{t('keyPrefix')}</th>
                    <th className="px-6 py-3">{t('keyCreated')}</th>
                    <th className="px-6 py-3">{t('status')}</th>
                    <th className="px-6 py-3 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keys.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">{t('noApiKeys')}</td></tr>
                  ) : (
                    keys.map((key) => (
                      <tr key={key.id} className={`${key.revokedAt ? 'opacity-50' : ''} hover:bg-slate-50/30 transition-colors`}>
                        <td className="px-6 py-3 font-medium text-slate-900">{key.name}</td>
                        <td className="px-6 py-3 font-mono text-slate-500">{key.keyPrefix}...</td>
                        <td className="px-6 py-3 text-slate-500">{new Date(key.createdAt!).toLocaleDateString()}</td>
                        <td className="px-6 py-3">
                          {key.revokedAt ? (
                            <span className="px-2 py-1 bg-red-100/50 text-red-600 rounded text-xs">{t('revoked')}</span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-100/50 text-emerald-600 rounded text-xs">{t('active')}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {!key.revokedAt && (
                            <Form method="post" onSubmit={(e) => !confirm(t('revokeConfirm')) && e.preventDefault()}>
                              <input type="hidden" name="intent" value="revokeKey" />
                              <input type="hidden" name="keyId" value={key.id} />
                              <button type="submit" className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                            </Form>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </GlassCard>
          </div>
        )}

        {/* Webhooks Tab - Desktop */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <GlassCard className="p-4 bg-purple-50/50 border-purple-200/50 flex flex-col md:flex-row justify-between items-end gap-4 backdrop-blur-sm">
              <div className="flex gap-3 text-purple-800 text-sm max-w-2xl">
                <Network className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t('realtimeUpdates')}</p>
                  <p className="opacity-80">{t('webhooksDesc')} {t('signaturesValidVia')} `X-Shop-Hmac-Sha256`.</p>
                </div>
              </div>
              <Form method="post" className="flex items-start gap-2 w-full md:w-auto" ref={webhookFormRef}>
                <div className="flex flex-col flex-1 md:flex-none">
                  <input
                    type="url"
                    name="url"
                    placeholder="https://your-api.com/webhook"
                    className="px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full md:w-64 backdrop-blur-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 ml-1">{t('topics')}: order.created</span>
                </div>
                <button
                  type="submit"
                  name="intent"
                  value="createWebhook"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? t('adding') : <><Plus className="w-4 h-4" /> {t('addWebhook')}</>}
                </button>
              </Form>
            </GlassCard>

            <GlassCard intensity="low" className="overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-200/50">
                    <th className="px-6 py-3">{t('url')}</th>
                    <th className="px-6 py-3">{t('topics')}</th>
                    <th className="px-6 py-3">{t('active')}</th>
                    <th className="px-6 py-3 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hooks.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">{t('noResults')}</td></tr>
                  ) : (
                    hooks.map((hook) => (
                      <tr key={hook.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-3 font-mono text-slate-700 break-all max-w-xs">{hook.url}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-slate-100/50 rounded text-xs text-slate-600">order.created</span>
                        </td>
                        <td className="px-6 py-3">
                          {hook.isActive ? (
                            <span className="px-2 py-1 bg-emerald-100/50 text-emerald-600 rounded text-xs">{t('active')}</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100/50 text-slate-500 rounded text-xs">{t('inactive')}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Form method="post" onSubmit={(e) => !confirm(t('deleteWebhookConfirm')) && e.preventDefault()}>
                            <input type="hidden" name="intent" value="deleteWebhook" />
                            <input type="hidden" name="hookId" value={hook.id} />
                            <button type="submit" className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                          </Form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </GlassCard>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS (Shared between Mobile and Desktop)
      ═══════════════════════════════════════════════════════════════════════ */}
      
      {/* Webhook Secret Modal */}
      {showWebhookSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200 backdrop-blur-sm">
          <GlassCard className="max-w-lg w-full p-6 shadow-2xl space-y-4 m-0" intensity="high">
            <div className="flex items-center gap-3 text-purple-500">
              <div className="w-10 h-10 bg-purple-100/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('webhookSecretTitle')}</h3>
            </div>
            
            <p className="text-slate-600 text-sm">
              {t('webhookSecretDesc')} (`X-Shop-Hmac-Sha256`).
            </p>

            <div className="flex items-center gap-2 p-3 bg-slate-100/50 rounded-lg border border-slate-200/50 group relative backdrop-blur-sm">
              <code className="flex-1 font-mono text-slate-800 text-sm break-all">
                {showWebhookSecret}
              </code>
              <button
                onClick={() => copyToClipboard(showWebhookSecret)}
                className="p-2 hover:bg-slate-200/50 rounded-md text-slate-500 hover:text-slate-900 transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowWebhookSecret(null)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:opacity-90 transition"
              >
                {t('done')}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* API Key Created Modal */}
      {showKeyModal && createdKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200 backdrop-blur-sm">
          <GlassCard className="max-w-lg w-full p-6 shadow-2xl space-y-4 m-0" intensity="high">
            <div className="flex items-center gap-3 text-emerald-500">
              <div className="w-10 h-10 bg-emerald-100/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('apiKeyCreatedTitle')}</h3>
            </div>
            
            <p className="text-slate-600 text-sm">
              {t('copyKeyNow')}
            </p>

            <div className="flex items-center gap-2 p-3 bg-slate-100/50 rounded-lg border border-slate-200/50 group relative backdrop-blur-sm">
              <code className="flex-1 font-mono text-slate-800 text-sm break-all">
                {createdKey}
              </code>
              <button
                onClick={() => copyToClipboard(createdKey)}
                className="p-2 hover:bg-slate-200/50 rounded-md text-slate-500 hover:text-slate-900 transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:opacity-90 transition"
              >
                {t('savedIt')}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}

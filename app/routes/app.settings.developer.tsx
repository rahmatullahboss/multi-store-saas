import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useActionData, Form, useSubmit, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { apiKeys, webhooks } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { generateApiKey, revokeApiKey } from '~/services/api.server';
import { registerWebhook } from '~/services/webhook.server';
import { useState, useEffect, useRef } from 'react';
import { Trash2, Key, Copy, Check, Info, ShieldAlert, Network, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const db = env.DB;
  const session = await getSession(request, env);
  const storeId = session.get('storeId');

  if (!storeId) return json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent');

  // API Key Actions
  if (intent === 'createKey') {
    const name = formData.get('name') as string || 'General Key';
    const result = await generateApiKey(db, storeId, name);
    return json({ newKey: result.key, createdKey: true });
  }

  if (intent === 'revokeKey') {
    const keyId = Number(formData.get('keyId'));
    await revokeApiKey(db, keyId, storeId);
    return json({ revokedKey: true });
  }

  // Webhook Actions
  if (intent === 'createWebhook') {
    const url = formData.get('url') as string;
    if (!url || !url.startsWith('http')) {
      return json({ error: 'Invalid URL' }, { status: 400 });
    }
    const result = await registerWebhook(db, storeId, url, ['order.created']);
    return json({ newSecret: result.secret, createdWebhook: true });
  }
  
  if (intent === 'deleteWebhook') {
      const hookId = Number(formData.get('hookId'));
      const drizzleDb = drizzle(db);
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
  
  // Key State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const keyFormRef = useRef<HTMLFormElement>(null);

  // Webhook State
  const [showWebhookSecret, setShowWebhookSecret] = useState<string | null>(null);
  const webhookFormRef = useRef<HTMLFormElement>(null);

  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    // API Key Effects
    if (actionData && 'newKey' in actionData && actionData.newKey) {
      setCreatedKey(actionData.newKey);
      setShowKeyModal(true);
      toast.success('API Key created');
      keyFormRef.current?.reset();
    }
    if (actionData && 'revokedKey' in actionData) {
      toast.success('API Key revoked');
    }

    // Webhook Effects
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Developer API</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build custom integrations and automate your workflow.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'keys' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
              API Keys
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'webhooks' 
                ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
              Webhooks
          </button>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-end">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex gap-3 text-amber-800 dark:text-amber-200 text-sm max-w-2xl">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <p>
                    These keys allow full access. Keep them secret. Never use in frontend code.
                    </p>
                </div>
                <Form method="post" className="flex items-end gap-2" ref={keyFormRef}>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Key Name" 
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        required
                    />
                    <button 
                        type="submit" 
                        name="intent" 
                        value="createKey"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : <><Key className="w-4 h-4" /> Generate Key</>}
                    </button>
                </Form>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Key Prefix</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {keys.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No API keys.</td></tr>
                    ) : (
                        keys.map((key) => (
                            <tr key={key.id} className={key.revokedAt ? 'opacity-50' : ''}>
                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{key.name}</td>
                                <td className="px-6 py-3 font-mono text-slate-500">{key.keyPrefix}...</td>
                                <td className="px-6 py-3 text-slate-500">{new Date(key.createdAt!).toLocaleDateString()}</td>
                                <td className="px-6 py-3">
                                    {key.revokedAt ? (
                                        <span className="px-2 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded text-xs">Revoked</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs">Active</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-right">
                                {!key.revokedAt && (
                                    <Form method="post" onSubmit={(e) => !confirm('Revoke?') && e.preventDefault()}>
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
            </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex justify-between items-end">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-lg flex gap-3 text-purple-800 dark:text-purple-200 text-sm max-w-2xl">
                    <Network className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Receive real-time updates.</p>
                        <p className="opacity-80">We send JSON payloads to your URL when events occur. Signatures valid via `X-Shop-Hmac-Sha256`.</p>
                    </div>
                </div>
                <Form method="post" className="flex items-end gap-2" ref={webhookFormRef}>
                    <div className="flex flex-col">
                        <input 
                            type="url" 
                            name="url" 
                            placeholder="https://your-api.com/webhook" 
                            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
                            required
                        />
                         <span className="text-[10px] text-slate-500 mt-1 ml-1">Event: order.created</span>
                    </div>
                    <button 
                        type="submit" 
                        name="intent" 
                        value="createWebhook"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 h-[38px] mb-[22px]"
                    >
                        {isSubmitting ? 'Adding...' : <><Plus className="w-4 h-4" /> Add Webhook</>}
                    </button>
                </Form>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-3">URL</th>
                    <th className="px-6 py-3">Topics</th>
                    <th className="px-6 py-3">Active</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {hooks.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No webhooks registered.</td></tr>
                    ) : (
                        hooks.map((hook) => (
                            <tr key={hook.id}>
                                <td className="px-6 py-3 font-mono text-slate-700 dark:text-slate-300 break-all max-w-xs">{hook.url}</td>
                                <td className="px-6 py-3">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
                                        order.created
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    {hook.isActive ? (
                                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs">Active</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">Inactive</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <Form method="post" onSubmit={(e) => !confirm('Delete this webhook?') && e.preventDefault()}>
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
            </div>

            {/* Webhook Secret Modal */}
            {showWebhookSecret && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-3 text-purple-500">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                                <Network className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Webhook Signing Secret</h3>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Use this secret to verify signatures (`X-Shop-Hmac-Sha256`).
                    </p>

                    <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-black rounded-lg border border-slate-200 dark:border-slate-800 group relative">
                        <code className="flex-1 font-mono text-slate-800 dark:text-purple-400 text-sm break-all">
                            {showWebhookSecret}
                        </code>
                        <button 
                            onClick={() => copyToClipboard(showWebhookSecret)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={() => setShowWebhookSecret(null)}
                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:opacity-90 transition"
                        >
                            Done
                        </button>
                    </div>
                </div>
                </div>
            )}
        </div>
      )}

      {/* API Key Modal (Reused) */}
      {showKeyModal && createdKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
               <div className="flex items-center gap-3 text-emerald-500">
                   <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">API Key Created</h3>
               </div>
               
               <p className="text-slate-600 dark:text-slate-300 text-sm">
                   Copy this key now. You won't be able to see it again!
               </p>

               <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-black rounded-lg border border-slate-200 dark:border-slate-800 group relative">
                   <code className="flex-1 font-mono text-slate-800 dark:text-emerald-400 text-sm break-all">
                       {createdKey}
                   </code>
                   <button 
                      onClick={() => copyToClipboard(createdKey)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                   >
                       <Copy className="w-4 h-4" />
                   </button>
               </div>

               <div className="flex justify-end pt-2">
                   <button 
                       onClick={() => setShowKeyModal(false)}
                       className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:opacity-90 transition"
                   >
                       I've saved it
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}

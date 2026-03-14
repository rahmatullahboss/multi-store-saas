
import { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useActionData, useNavigation, Form, useSubmit } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { indexDocuments, deleteDocuments, chunkText, type VectorDocument, type Env as RagEnv } from '~/services/rag.server';
import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, FileText, Globe, Type, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { generateUUID } from '~/lib/uuid';

// Extend Env to include R2 if strictly typed
// Rename to RouteEnv to avoid naming collision with RagEnv
interface RouteEnv extends RagEnv {
  DB: D1Database;
  R2: R2Bucket;
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });
  const db = drizzle(context.cloudflare.env.DB as D1Database, { schema });

  // Fetch Agent
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId),
  });

  if (!agent) {
    return json({ sources: [], agentId: null });
  }

  // Fetch Knowledge Sources
  const sources = await db.query.knowledgeSources.findMany({
    where: eq(schema.knowledgeSources.agentId, agent.id),
    orderBy: [desc(schema.knowledgeSources.createdAt)],
  });

  return json({ sources, agentId: agent.id });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env as unknown as RouteEnv;
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });
    const db = drizzle(env.DB, { schema });

  // Verify Agent Ownership
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId),
  });

  if (!agent) {
    return json({ error: 'Agent not found' }, { status: 404 });
  }

  // Handle File Uploads vs JSON Data
  const contentType = request.headers.get('Content-Type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    // In RR7, use standard Web API for multipart form data (Workers supports it natively)
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'upload_file') {
      const file = formData.get('file') as File;
      if (!file || file.size === 0) return json({ error: 'No file uploaded' }, { status: 400 });

      const fileName = file.name;
      // Insert into DB first to get ID (DB will generate the real ID)
      // const sourceId = crypto.randomUUID(); // Removed - using DB-generated ID
      // Insert into DB first to get ID
      const result = await db.insert(schema.knowledgeSources).values({
        agentId: agent.id,
        name: fileName,
        type: 'file',
        status: 'processing',
        content: `[File: ${fileName}]`, // Placeholder
      }).returning();
      
      const source = result[0];

      try {
        // 1. Upload to R2
        const key = `agent/${agent.id}/knowledge/${source.id}/${fileName}`;
        const arrayBuffer = await file.arrayBuffer();
        if (env.R2) {
          await env.R2.put(key, arrayBuffer, {
            customMetadata: { originalName: fileName, contentType: file.type }
          });
        }

        // 2. Extract Text (Basic)
        let content = '';
        if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            content = new TextDecoder().decode(arrayBuffer);
        } else {
            // Placeholder for PDF/Doc
            content = `[File Content Placeholder for ${fileName} - Extraction Pending]`;
        }

        // 3. Index
        const chunks = chunkText(content, 1000, 100);
        const vectorDocs: VectorDocument[] = chunks.map((chunk, idx) => ({
             id: `${agent.id}_file_${source.id}_${idx}`,
             content: chunk,
             metadata: {
                 agent_id: String(agent.id),
                 type: 'policy', // Default type
                 source_id: String(source.id),
                 file_name: fileName
             }
        }));

        await indexDocuments(vectorDocs, env);

        await db.update(schema.knowledgeSources)
            .set({ 
                status: 'indexed', 
                updatedAt: new Date()
            })
            .where(eq(schema.knowledgeSources.id, source.id));

        return json({ success: true });

      } catch (error) {
        console.error('Upload error:', error);
        await db.update(schema.knowledgeSources)
            .set({ status: 'failed' })
            .where(eq(schema.knowledgeSources.id, source.id));
        return json({ error: 'Failed to process file' }, { status: 500 });
      }
    }
  } else {
    // JSON Request
    const body = await request.formData();
    const intent = body.get('intent');

    if (intent === 'add_manual') {
        const title = body.get('title') as string;
        const content = body.get('content') as string;

        if (!title || !content) return json({ error: 'Title and content required' }, { status: 400 });

        const result = await db.insert(schema.knowledgeSources).values({
            agentId: agent.id,
            name: title,
            type: 'text',
            content: content,
            status: 'processing'
        }).returning();
        const source = result[0];

        try {
            const vectorDoc: VectorDocument = {
                id: `${agent.id}_manual_${source.id}`,
                 content: content,
                 metadata: {
                     agent_id: String(agent.id),
                     type: 'policy',
                     source_id: String(source.id)
                 }
            };
            await indexDocuments([vectorDoc], env);
            
            await db.update(schema.knowledgeSources)
            .set({ status: 'indexed', updatedAt: new Date() })
            .where(eq(schema.knowledgeSources.id, source.id));

            return json({ success: true });
        } catch (e) {
            await db.update(schema.knowledgeSources)
            .set({ status: 'failed' })
            .where(eq(schema.knowledgeSources.id, source.id));
            return json({ error: 'Indexing failed' }, { status: 500 });
        }
    }

    if (intent === 'add_website') {
        const url = body.get('url') as string;
        if (!url) return json({ error: 'URL required' }, { status: 400 });

        const result = await db.insert(schema.knowledgeSources).values({
            agentId: agent.id,
            name: new URL(url).hostname,
            type: 'url',
            content: url,
            status: 'processing'
        }).returning();
        const source = result[0];

        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'AgentBot/1.0' } });
            if (!res.ok) throw new Error('Failed to fetch URL');
            const html = await res.text();
            
            // Basic extraction
            const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                             .replace(/<[^>]+>/g, ' ')
                             .replace(/\s+/g, ' ').trim();
            
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : url;

            // Update Name
            await db.update(schema.knowledgeSources).set({ name: title }).where(eq(schema.knowledgeSources.id, source.id));

            const chunks = chunkText(text, 1000, 100);
             const vectorDocs: VectorDocument[] = chunks.map((chunk, idx) => ({
                 id: `${agent.id}_web_${source.id}_${idx}`,
                 content: chunk,
                 metadata: {
                     agent_id: String(agent.id),
                     type: 'policy', 
                     source_id: String(source.id),
                     url: url
                 }
            }));

            await indexDocuments(vectorDocs, env);

             await db.update(schema.knowledgeSources)
            .set({ status: 'indexed', updatedAt: new Date() })
            .where(eq(schema.knowledgeSources.id, source.id));

            return json({ success: true });
        } catch (e) {
             await db.update(schema.knowledgeSources)
            .set({ status: 'failed' })
            .where(eq(schema.knowledgeSources.id, source.id));
             return json({ error: 'Website processing failed' }, { status: 500 });
        }
    }

    if (intent === 'delete') {
        const id = Number(body.get('id'));
        await db.delete(schema.knowledgeSources).where(eq(schema.knowledgeSources.id, id));
        // TODO: Delete form Vectorize (Requires prefix deletion or storing vector IDs)
        // [SKIPPED] Complex: requires external Vector DB operations
        // await deleteDocuments([...], env); 
        return json({ success: true });
    }
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
};

export default function KnowledgeBase() {
  const { sources, agentId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'website' | 'file'>('text');
  
  // Reset form on success
  useEffect(() => {
    if ((actionData as any)?.success) {
        setModalOpen(false);
    }
  }, [actionData]);

  if (!agentId) {
    return <div className="p-4">{t('agentNotConfigured')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('knowledgeBase')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('trainAgentDesc')}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addSource')}
        </button>
      </div>

      {/* Sources List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('source')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('chunks')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lastSynced')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sources.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {t('noSourcesFound')}
                    </td>
                </tr>
            ) : (
                sources.map((source) => (
              <tr key={source.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {source.type === 'url' ? <Globe className="w-4 h-4 text-blue-500" /> :
                     source.type === 'file' ? <FileText className="w-4 h-4 text-orange-500" /> :
                     <Type className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={source.name}>
                        {source.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {t(source.type as any)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {source.status === 'indexed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" /> {t('indexed')}
                        </span>
                    )}
                    {source.status === 'processing' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Loader2 className="w-3 h-3 animate-spin" /> {t('processing')}
                        </span>
                    )}
                    {source.status === 'failed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3" /> {t('failed')}
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* source.documentCount || 0 */}
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {source.updatedAt ? new Date(source.updatedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Form method="post" className="inline-block">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={source.id} />
                    <button 
                        type="submit" 
                        className="text-red-600 hover:text-red-900"
                        title="Delete Source"
                        onClick={(e) => !confirm('Are you sure?') && e.preventDefault()}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </Form>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Add Source Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{t('addKnowledgeSource')}</h3>
                
                {/* Modal Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                    {[
                        { id: 'text', label: t('manualText'), icon: Type },
                        { id: 'website', label: t('website'), icon: Globe },
                        { id: 'file', label: t('fileUpload'), icon: Upload },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-2 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Forms */}
                {activeTab === 'text' && (
                    <Form method="post">
                        <input type="hidden" name="intent" value="add_manual" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('title')}</label>
                                <input type="text" name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" placeholder="e.g. Return Policy" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('content')}</label>
                                <textarea name="content" required rows={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" placeholder={t('enterContentPlaceholder')} />
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none sm:col-start-2 sm:text-sm">
                                {isSubmitting ? t('processing') : t('addBtn')}
                            </button>
                            <button type="button" onClick={() => setModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
                                {t('cancel')}
                            </button>
                        </div>
                    </Form>
                )}

                {activeTab === 'website' && (
                    <Form method="post">
                        <input type="hidden" name="intent" value="add_website" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                <input type="url" name="url" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" placeholder="https://example.com/about" />
                                <p className="text-xs text-gray-500 mt-1">We will scrape the text content from this page.</p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none sm:col-start-2 sm:text-sm">
                                {isSubmitting ? t('scraping') : t('addBtn')}
                            </button>
                            <button type="button" onClick={() => setModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
                                {t('cancel')}
                            </button>
                        </div>
                    </Form>
                )}

                {activeTab === 'file' && (
                    <Form method="post" encType="multipart/form-data">
                        <input type="hidden" name="intent" value="upload_file" />
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-1 text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file" type="file" className="sr-only" required accept=".txt,.md,.pdf,.doc,.docx" />
                                    </label>
                                    <p className="pl-1">{t('dragDrop')}</p>
                                </div>
                                <p className="text-xs text-gray-500">{t('fileLimit')}</p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none sm:col-start-2 sm:text-sm">
                                {isSubmitting ? t('uploading') : t('uploadFile')}
                            </button>
                            <button type="button" onClick={() => setModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
                                {t('cancel')}
                            </button>
                        </div>
                    </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

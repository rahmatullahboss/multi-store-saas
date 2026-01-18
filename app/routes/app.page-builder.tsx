/**
 * Page Builder Route
 * 
 * This route manages landing pages list and redirects to the 
 * separate GrapesJS page-builder worker for editing.
 * 
 * GrapesJS editor is hosted at: builder.ozzyl.com/edit/:pageId
 */

import { useState, useEffect } from 'react';
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Form, useNavigation, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, and } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useTranslation } from '~/contexts/LanguageContext';
import { Plus, FileText, Globe, Lock, ExternalLink, Trash2, Check, Pencil, X } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Page Builder' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context as any).cloudflare.env;
  const storeId = await getStoreId(request, env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB);
  const url = new URL(request.url);
  const selectedPageId = url.searchParams.get('id');
  
  // If a page is selected, redirect to page-builder worker
  if (selectedPageId) {
    const builderUrl = env.PAGE_BUILDER_URL || 'https://builder.ozzyl.com';
    return redirect(`${builderUrl}/edit/${selectedPageId}`);
  }
  
  // Fetch pages list
  const [pages, store] = await Promise.all([
    db
      .select({
        id: landingPages.id,
        name: landingPages.name,
        slug: landingPages.slug,
        isPublished: landingPages.isPublished,
        updatedAt: landingPages.updatedAt,
      })
      .from(landingPages)
      .where(eq(landingPages.storeId, storeId))
      .orderBy(desc(landingPages.updatedAt)),
    db
      .select({ 
        planType: stores.planType, 
        subdomain: stores.subdomain,
        customDomain: stores.customDomain
      })
      .from(stores)
      .where(eq(stores.id, storeId))
      .get()
  ]);

  // Generate base URL for published pages
  const saasDomain = env.SAAS_DOMAIN || 'ozzyl.com';
  const publishedBaseUrl = store?.customDomain 
    ? `https://${store.customDomain}` 
    : `https://${store?.subdomain}.${saasDomain}`;

  const builderUrl = env.PAGE_BUILDER_URL || 'https://builder.ozzyl.com';

  return json({
    pages,
    planType: store?.planType || 'free',
    publishedBaseUrl,
    builderUrl,
  });
}

// ============================================================================
// ACTION - Handle page operations
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const env = (context as any).cloudflare.env;
  const storeId = await getStoreId(request, env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const name = formData.get('name') as string || 'New Page';
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newPage = await db.insert(landingPages).values({
      id: crypto.randomUUID(),
      storeId,
      name,
      slug,
      isPublished: false,
      projectData: JSON.stringify({ pages: [], styles: '', assets: [] }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning({ id: landingPages.id });

    // Redirect to the new page-builder worker
    const builderUrl = env.PAGE_BUILDER_URL || 'https://builder.ozzyl.com';
    return redirect(`${builderUrl}/edit/${newPage[0].id}`);
  }

  if (intent === 'delete') {
    const pageId = formData.get('pageId') as string;
    await db.delete(landingPages).where(
      and(
        eq(landingPages.id, pageId),
        eq(landingPages.storeId, storeId)
      )
    );
    return json({ success: true });
  }

  if (intent === 'rename') {
    const pageId = formData.get('pageId') as string;
    const newName = formData.get('name') as string;
    await db.update(landingPages)
      .set({ name: newName, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(landingPages.id, pageId),
          eq(landingPages.storeId, storeId)
        )
      );
    return json({ success: true });
  }

  return json({ error: 'Unknown action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function PageBuilder() {
  const { pages, planType, publishedBaseUrl, builderUrl } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const { t } = useTranslation();
  
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  const isCreating = navigation.state === 'submitting' && 
    navigation.formData?.get('intent') === 'create';

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Page Builder</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Create and manage custom landing pages with drag & drop editor
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Pages Grid */}
      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-neutral-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No pages yet</h3>
          <p className="text-neutral-400 mb-6 max-w-md">
            Create your first landing page with our drag & drop builder
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Page
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {page.isPublished ? (
                    <Globe className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-neutral-500" />
                  )}
                  {editingPageId === page.id ? (
                    <fetcher.Form method="post" className="flex items-center gap-2">
                      <input type="hidden" name="intent" value="rename" />
                      <input type="hidden" name="pageId" value={page.id} />
                      <input
                        type="text"
                        name="name"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-sm"
                        autoFocus
                      />
                      <button type="submit" className="text-emerald-500 hover:text-emerald-400">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setEditingPageId(null)} className="text-neutral-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </fetcher.Form>
                  ) : (
                    <span className="text-white font-medium">{page.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingPageId(page.id);
                      setEditingName(page.name);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="pageId" value={page.id} />
                    <button
                      type="submit"
                      className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-800 rounded"
                      onClick={(e) => {
                        if (!confirm('Delete this page?')) e.preventDefault();
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </fetcher.Form>
                </div>
              </div>

              <p className="text-neutral-500 text-xs mb-4">
                /{page.slug}
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={`${builderUrl}/edit/${page.id}`}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-center py-2 rounded-lg text-sm transition-colors"
                >
                  Edit Page
                </a>
                {page.isPublished && (
                  <a
                    href={`${publishedBaseUrl}/o/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Page</h3>
            <Form method="post">
              <input type="hidden" name="intent" value="create" />
              <input
                type="text"
                name="name"
                placeholder="Page name"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPageName('');
                  }}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newPageName.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-lg transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

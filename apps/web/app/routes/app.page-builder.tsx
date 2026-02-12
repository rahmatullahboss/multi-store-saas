/**
 * Page Builder Route
 * 
 * This route manages landing pages list and redirects to the 
 * separate GrapesJS page-builder worker for editing.
 * 
 * GrapesJS editor is hosted at: builder.ozzyl.com/edit/:pageId
 */

import { useState } from 'react';
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, and } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Plus, FileText, Globe, Lock, ExternalLink, Trash2, Check, Pencil, X, ArrowLeft } from 'lucide-react';
import { Link } from '@remix-run/react';

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
    const baseSlug = (name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'page').replace(/-+/g, '-');
    let slug = baseSlug;

    let suffix = 1;
    // Ensure slug uniqueness per store to avoid DB unique constraint errors.
    while (true) {
      const existing = await db
        .select({ id: landingPages.id })
        .from(landingPages)
        .where(and(eq(landingPages.storeId, storeId), eq(landingPages.slug, slug)))
        .limit(1);
      if (existing.length === 0) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    
    const newPage = await db.insert(landingPages).values({
      storeId,
      name,
      slug,
      isPublished: false,
      projectData: JSON.stringify({ pages: [], styles: '', assets: [] }),
    }).returning({ id: landingPages.id });

    // Redirect to the new page-builder worker
    const builderUrl = env.PAGE_BUILDER_URL || 'https://builder.ozzyl.com';
    return redirect(`${builderUrl}/edit/${newPage[0].id}`);
  }

  if (intent === 'delete') {
    const pageId = Number(formData.get('pageId'));
    await db.delete(landingPages).where(
      and(
        eq(landingPages.id, pageId),
        eq(landingPages.storeId, storeId)
      )
    );
    return json({ success: true });
  }

  if (intent === 'rename') {
    const pageId = Number(formData.get('pageId'));
    const newName = formData.get('name') as string;
    await db.update(landingPages)
      .set({ name: newName })
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
  const { pages, publishedBaseUrl, builderUrl } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'draft'>('all');

  const isCreating = navigation.state === 'submitting' && 
    navigation.formData?.get('intent') === 'create';

  // Filter pages based on active filter
  const filteredPages = pages.filter(page => {
    if (activeFilter === 'published') return page.isPublished;
    if (activeFilter === 'draft') return !page.isPublished;
    return true;
  });

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-6 space-y-2">
          {/* Back Button */}
          <Link
            to="/app/dashboard"
            className="flex items-center gap-2 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          {/* Title */}
          <div className="pt-4 pb-2">
            <h2 className="text-lg font-bold text-gray-900 px-3">Page Builder</h2>
            <p className="text-sm text-gray-600 px-3 mt-1">
              Manage your pages
            </p>
          </div>

          {/* Filters */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeFilter === 'all'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>All Pages</span>
              <span className="ml-auto text-sm">{pages.length}</span>
            </button>

            <button
              onClick={() => setActiveFilter('published')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeFilter === 'published'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Published</span>
              <span className="ml-auto text-sm">
                {pages.filter(p => p.isPublished).length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('draft')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeFilter === 'draft'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Drafts</span>
              <span className="ml-auto text-sm">
                {pages.filter(p => !p.isPublished).length}
              </span>
            </button>
          </nav>

          {/* Create Button */}
          <div className="pt-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeFilter === 'all' && 'All Pages'}
            {activeFilter === 'published' && 'Published Pages'}
            {activeFilter === 'draft' && 'Draft Pages'}
          </h1>
          <p className="text-gray-600 text-sm">
            {activeFilter === 'all' && 'Create and manage custom landing pages with drag & drop editor'}
            {activeFilter === 'published' && 'Pages that are live and visible to visitors'}
            {activeFilter === 'draft' && 'Pages that are not yet published'}
          </p>
        </div>

        {/* Pages Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Pages</h2>
            <p className="text-sm text-gray-500">Manage your custom landing pages</p>
          </div>
        </div>

        {filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {pages.length === 0 ? 'No pages yet' : `No ${activeFilter} pages`}
            </h3>
            <p className="text-gray-500 text-sm mb-4 max-w-md">
              {pages.length === 0 
                ? 'Create your first landing page with our drag & drop builder'
                : `You don't have any ${activeFilter} pages yet`
              }
            </p>
            {pages.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Your First Page
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {page.isPublished ? (
                      <Globe className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    {editingPageId === page.id ? (
                      <fetcher.Form method="post" className="flex items-center gap-2 flex-1">
                        <input type="hidden" name="intent" value="rename" />
                        <input type="hidden" name="pageId" value={page.id} />
                        <input
                          type="text"
                          name="name"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 flex-1"
                          autoFocus
                        />
                        <button type="submit" className="text-emerald-600 hover:text-emerald-700 flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setEditingPageId(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </fetcher.Form>
                    ) : (
                      <span className="text-gray-900 font-medium truncate">{page.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => {
                        setEditingPageId(page.id);
                        setEditingName(page.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="pageId" value={page.id} />
                      <button
                        type="submit"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded"
                        onClick={(e) => {
                          if (!confirm('Delete this page?')) e.preventDefault();
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </fetcher.Form>
                  </div>
                </div>

                <p className="text-gray-500 text-xs mb-4 truncate">
                  /{page.slug}
                </p>

                <div className="flex items-center gap-2">
                  <a
                    href={`${builderUrl}/edit/${page.id}`}
                    className="flex-1 bg-white hover:bg-gray-100 text-gray-700 text-center py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                  >
                    Edit Page
                  </a>
                  {page.isPublished && (
                    <a
                      href={`${publishedBaseUrl}/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Page</h3>
            <Form method="post">
              <input type="hidden" name="intent" value="create" />
              <input
                type="text"
                name="name"
                placeholder="Page name"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPageName('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newPageName.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-lg transition-colors font-medium"
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

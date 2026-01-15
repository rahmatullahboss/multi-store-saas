/**
 * Advanced Page Builder Route
 * 
 * This route hosts the GrapesJS editor for creating custom landing pages.
 */

import { Suspense, lazy, useState, useEffect } from 'react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Form, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useTranslation } from '~/contexts/LanguageContext';
import { Plus, FileText, ChevronRight, Globe, Lock, Clock, ExternalLink, Trash2, Check, Pencil, X } from 'lucide-react';
import { ClientOnly } from '~/components/LazySection';

// Lazy load the editor
const GrapesEditor = lazy(() => import('~/components/page-builder/Editor')) as React.FC<{ 
  pageId?: string; 
  planType?: string;
  onStorageStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  publishedBaseUrl?: string;
  pageSlug?: string;
  initialProjectData?: any; // Pre-fetched project data to skip autoload blocking
}>;

export const meta: MetaFunction = () => {
  return [{ title: 'Drag & Drop Builder' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: any) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  const selectedPageId = url.searchParams.get('id');
  
  // Fetch pages and store plan type
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
  const saasDomain = context.cloudflare.env.SAAS_DOMAIN || 'ozzyl.com';
  const publishedBaseUrl = store?.customDomain 
    ? `https://${store.customDomain}` 
    : `https://${store?.subdomain}.${saasDomain}`;

  // If a page is selected, fetch its projectData to pass to editor (per GrapesJS docs: skip autoload)
  let initialProjectData = null;
  if (selectedPageId) {
    const selectedPage = await db
      .select({ projectData: landingPages.projectData })
      .from(landingPages)
      .where(
        and(
          eq(landingPages.id, parseInt(selectedPageId)),
          eq(landingPages.storeId, storeId)
        )
      )
      .get();
    
    if (selectedPage?.projectData) {
      try {
        initialProjectData = JSON.parse(selectedPage.projectData);
      } catch (e) {
        console.warn('Failed to parse projectData:', e);
      }
    }
  }

  return json({ 
    pages, 
    planType: store?.planType || 'free',
    publishedBaseUrl,
    initialProjectData,
  });
}

// ============================================================================
// ACTION (Create, Rename, Delete Page)
// ============================================================================
export async function action({ request, context }: any) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // RENAME PAGE
  if (intent === 'rename') {
    const pageId = parseInt(formData.get('pageId') as string);
    const newName = formData.get('name') as string;
    
    await db
      .update(landingPages)
      .set({ name: newName, updatedAt: new Date() })
      .where(and(eq(landingPages.id, pageId), eq(landingPages.storeId, storeId)));
    
    return json({ success: true });
  }

  // DELETE PAGE
  if (intent === 'delete') {
    const pageId = parseInt(formData.get('pageId') as string);
    
    await db
      .delete(landingPages)
      .where(and(eq(landingPages.id, pageId), eq(landingPages.storeId, storeId)));
    
    return json({ success: true });
  }

  // CREATE PAGE (default)
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string || `page-${Date.now()}`;

  const [newPage] = await db
    .insert(landingPages)
    .values({
      storeId,
      name,
      slug,
      isPublished: false,
    })
    .returning();

  return json({ newPage, success: true });
}

export default function PageBuilderRoute() {
  const { t, lang } = useTranslation();
  const { pages, planType, publishedBaseUrl, initialProjectData } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = searchParams.get('id');
  const [isCreating, setIsCreating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const navigation = useNavigation();
  const fetcher = useFetcher();

  // Ensure client-side only rendering to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ==========================================================================
  // ROUTE-LEVEL HYDRATION GUARD
  // Server + Initial Client Render: Show a neutral loading screen.
  // This guarantees the HTML from server and client match exactly.
  // ==========================================================================
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-56 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-4" />
              <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // CLIENT RENDER: Editor Mode (Full Screen)
  // ==========================================================================
  if (pageId) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
        {/* Editor Header */}
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
             <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSearchParams({})}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 hover:text-white rounded-lg transition text-xs font-bold border border-gray-700"
                  >
                     ← {t('exitEditor')}
                  </button>
                  <div className="h-4 w-[1px] bg-gray-700" />
                  <div className="flex flex-col">
                     <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none mb-1">{t('editingPage')}</span>
                     <h2 className="text-white text-xs font-bold leading-none truncate max-w-[200px]">
                        {pages.find((p: any) => p.id.toString() === pageId)?.name || (lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...')}
                     </h2>
                  </div>
             </div>
               
             <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-full min-w-[120px] justify-center">
                     {storageStatus === 'saving' ? (
                       <>
                         <div className="w-1.5 h-1.5 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                         <span className="text-[10px] text-gray-400 font-bold uppercase">{t('savingDraft')}</span>
                       </>
                     ) : storageStatus === 'saved' ? (
                       <>
                         <Check size={10} className="text-emerald-500" />
                         <span className="text-[10px] text-emerald-500 font-bold uppercase">{t('draftSaved')}</span>
                       </>
                     ) : storageStatus === 'error' ? (
                       <>
                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                         <span className="text-[10px] text-red-500 font-bold uppercase">{t('saveDraftFailed')}</span>
                       </>
                     ) : (
                       <>
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[10px] text-gray-400 font-bold uppercase">{t('autoSaveActive')}</span>
                       </>
                     )}
                  </div>
                  {/* View Published Button */}
                  {pages.find((p: any) => p.id.toString() === pageId)?.isPublished && (
                    <a
                      href={`${publishedBaseUrl}/p/${pages.find((p: any) => p.id.toString() === pageId)?.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-xs font-bold"
                    >
                      <ExternalLink size={12} />
                      {t('viewPublished') || 'View Live'}
                    </a>
                  )}
             </div>
        </div>

        <div className="flex-1 relative flex flex-col overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full bg-gray-50/50">
                 <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                       <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-400 font-medium">{t('bootingCanvas')}</p>
                 </div>
              </div>
            }>
              <GrapesEditor 
                pageId={pageId} 
                planType={planType} 
                onStorageStatusChange={setStorageStatus}
                publishedBaseUrl={publishedBaseUrl}
                pageSlug={pages.find((p: any) => p.id.toString() === pageId)?.slug}
                initialProjectData={initialProjectData}
              />
            </Suspense>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // CLIENT RENDER: Page Management UI
  // ==========================================================================
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pageBuilderTitle')}</h1>
          <p className="text-gray-500">{t('pageBuilderDesc')}</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
        >
          <Plus size={20} />
          {t('createNewPage')}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold mb-6 text-gray-900">{t('newPageDetails')}</h3>
          <Form method="post" className="space-y-6 max-w-xl" onSubmit={() => setIsCreating(false)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('internalPageName')}</label>
                <input 
                  autoFocus
                  name="name" 
                  placeholder={lang === 'bn' ? 'যেমন: ঈদ ক্যাশব্যাক অফার' : 'e.g., Summer Flash Sale'} 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('urlSlug')}</label>
                <input 
                  name="slug" 
                  placeholder="summer-offer" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
                <p className="mt-1.5 text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t('urlSlugHint')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                type="submit" 
                disabled={navigation.state !== 'idle'}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {navigation.state === 'submitting' ? t('creating') : t('startBuilding')}
              </button>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                {t('cancel')}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Pages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.length === 0 ? (
          <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <FileText className="text-gray-300" size={32} />
             </div>
              <div className="text-center">
                <p className="text-gray-900 font-bold">{t('noPagesCreated')}</p>
                <p className="text-gray-500 text-sm">{t('noPagesDesc')}</p>
              </div>
          </div>
        ) : (
          pages.map((page: any) => (
            <div key={page.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
               <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${page.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} transition-colors group-hover:bg-emerald-100`}>
                     <FileText size={24} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 uppercase">
                     {page.isPublished ? <Globe size={10} className="text-emerald-500" /> : <Lock size={10} />}
                     {page.isPublished ? t('live') : t('draft')}
                  </div>
               </div>
               
               {/* Editable Page Name */}
               {editingPageId === page.id ? (
                 <div className="flex items-center gap-2 mb-6">
                   <input
                     type="text"
                     value={editName}
                     onChange={(e) => setEditName(e.target.value)}
                     className="flex-1 px-3 py-2 text-sm font-bold border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                     autoFocus
                   />
                   <button
                     onClick={() => {
                       fetcher.submit(
                         { intent: 'rename', pageId: page.id.toString(), name: editName },
                         { method: 'post' }
                       );
                       setEditingPageId(null);
                     }}
                     className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition"
                   >
                     <Check size={14} />
                   </button>
                   <button
                     onClick={() => setEditingPageId(null)}
                     className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition"
                   >
                     <X size={14} />
                   </button>
                 </div>
               ) : (
                 <div className="flex items-center gap-2 mb-1">
                   <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 flex-1">{page.name}</h3>
                   <button
                     onClick={() => {
                       setEditingPageId(page.id);
                       setEditName(page.name);
                     }}
                     className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                     title={t('rename') || 'Rename'}
                   >
                     <Pencil size={12} />
                   </button>
                   <button
                     onClick={() => {
                       if (confirm(t('confirmDeletePage') || 'Are you sure you want to delete this page?')) {
                         fetcher.submit(
                           { intent: 'delete', pageId: page.id.toString() },
                           { method: 'post' }
                         );
                       }
                     }}
                     className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                     title={t('delete') || 'Delete'}
                   >
                     <Trash2 size={12} />
                   </button>
                 </div>
               )}
               <p className="text-xs text-gray-400 font-medium mb-5">/p/{page.slug}</p>
               
               <div className="grid grid-cols-2 gap-3">
                  <button 
                     onClick={() => setSearchParams({ id: page.id.toString() })}
                     className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition"
                  >
                     {t('editPage')}
                  </button>
                  {page.isPublished ? (
                    <a 
                       href={`${publishedBaseUrl}/p/${page.slug}`} 
                       target="_blank" 
                       rel="noreferrer"
                       className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-100 transition border border-emerald-100"
                    >
                       {t('view')} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-400 text-xs font-medium rounded-xl border border-gray-100 cursor-not-allowed">
                       <Lock size={12} /> {t('draft')}
                    </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


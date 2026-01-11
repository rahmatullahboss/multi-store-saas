/**
 * Advanced Page Builder Route
 * 
 * This route hosts the GrapesJS editor for creating custom landing pages.
 */

import { Suspense, lazy, useState, useEffect } from 'react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useTranslation } from '~/contexts/LanguageContext';
import { Plus, FileText, ChevronRight, Globe, Lock, Clock, ExternalLink, Trash2 } from 'lucide-react';

// Lazy load the editor
const GrapesEditor = lazy(() => import('~/components/page-builder/Editor')) as React.FC<{ pageId?: string; planType?: string }>;

export const meta: MetaFunction = () => {
  return [{ title: 'Elementor Builder' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: any) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(context.cloudflare.env.DB);
  
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
      .select({ planType: stores.planType })
      .from(stores)
      .where(eq(stores.id, storeId))
      .get()
  ]);

  return json({ pages, planType: store?.planType || 'free' });
}

// ============================================================================
// ACTION (Create Page)
// ============================================================================
export async function action({ request, context }: any) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string || `page-${Date.now()}`;

  const db = drizzle(context.cloudflare.env.DB);
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
  const { pages, planType } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = searchParams.get('id');
  const [isCreating, setIsCreating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigation = useNavigation();

  // Ensure client-side only rendering for GrapesJS editor to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If pageId is selected, show the editor in FULL SCREEN mode
  if (pageId) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
        {/* Full screen header/nav specifically for being in "Editor Mode" */}
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-full">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] text-gray-400 font-bold uppercase">{t('autoSaveActive')}</span>
              </div>
           </div>
        </div>

        <div className="flex-1 relative">
          {isMounted ? (
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
              <GrapesEditor pageId={pageId} planType={planType} />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50/50">
               <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                     <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-gray-400 font-medium">{t('bootingCanvas')}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise show the Page Management UI
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
               
               <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{page.name}</h3>
               <p className="text-xs text-gray-400 font-medium mb-6">/p/{page.slug}</p>
               
               <div className="grid grid-cols-2 gap-3">
                  <button 
                     onClick={() => setSearchParams({ id: page.id.toString() })}
                     className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition"
                  >
                     {t('editPage')}
                  </button>
                  <a 
                     href={`/p/${page.slug}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition"
                  >
                     {t('view')} <ExternalLink size={12} />
                  </a>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

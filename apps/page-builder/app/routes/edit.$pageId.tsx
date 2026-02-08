/**
 * Page Builder Edit Route
 *
 * Main editor route for GrapesJS page builder.
 * Accessed via: builder.ozzyl.com/edit/:pageId
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Suspense, lazy, useState, useEffect } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { Check, ExternalLink, Globe } from 'lucide-react';
import { getAuthFromSession } from '~/services/auth.server';
import { useLanguage } from '~/contexts/LanguageContext';

// Lazy load the GrapesJS editor
const GrapesEditor = lazy(() => import('~/components/page-builder/Editor'));
import EditorErrorBoundary from '~/components/page-builder/EditorErrorBoundary';

// Loader data type
interface LoaderData {
  pageId: string;
  pageName: string;
  pageSlug: string;
  isPublished: boolean;
  planType: string;
  publishedBaseUrl: string;
  initialProjectData: unknown;
  mainAppUrl: string;
}

export const meta: MetaFunction = () => {
  return [{ title: 'Page Builder | Ozzyl' }];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const env = (context as any).cloudflare.env;
  const pageId = params.pageId;

  if (!pageId) {
    throw new Response('Page ID required', { status: 400 });
  }

  // Check auth
  const user = await getAuthFromSession(request, env);
  if (!user?.storeId) {
    // Redirect to main app login
    const mainAppUrl = env.MAIN_APP_URL || 'https://ozzyl.com';
    return Response.redirect(
      `${mainAppUrl}/auth/login?redirect=/app/page-builder?id=${pageId}`,
      302
    );
  }

  const db = drizzle(env.DB);

  // Fetch page data
  const [page, store] = await Promise.all([
    db
      .select()
      .from(landingPages)
      .where(and(eq(landingPages.id, parseInt(pageId)), eq(landingPages.storeId, user.storeId)))
      .get(),
    db
      .select({
        planType: stores.planType,
        subdomain: stores.subdomain,
        customDomain: stores.customDomain,
      })
      .from(stores)
      .where(eq(stores.id, user.storeId))
      .get(),
  ]);

  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }

  // Parse project data
  let initialProjectData = null;
  if (page.projectData) {
    try {
      const parsedData = JSON.parse(page.projectData);
      
      // Sanitize styles array to prevent CssComposer parsing errors
      // This fixes "Cannot read properties of undefined (reading 'getFrames')" error
      if (parsedData && parsedData.styles) {
        if (!Array.isArray(parsedData.styles)) {
          // If styles is not an array, reset to empty array
          console.warn('Invalid styles format in projectData, resetting to empty array');
          parsedData.styles = [];
        } else {
          // Filter out invalid style entries (must have selectors property)
          parsedData.styles = parsedData.styles.filter((style: any) => {
            if (!style || typeof style !== 'object') return false;
            // GrapesJS requires 'selectors' to be present
            if (!style.selectors) return false;
            return true;
          });
        }
      }
      
      // Sanitize components if present
      if (parsedData && parsedData.pages) {
        // Ensure pages is an array
        if (!Array.isArray(parsedData.pages)) {
          console.warn('Invalid pages format in projectData');
          parsedData.pages = [];
        }
      }
      
      initialProjectData = parsedData;
    } catch (e) {
      console.warn('Failed to parse projectData');
    }
  }

  // Generate published URL
  const saasDomain = env.SAAS_DOMAIN || 'ozzyl.com';
  const publishedBaseUrl = store?.customDomain
    ? `https://${store.customDomain}`
    : `https://${store?.subdomain}.${saasDomain}`;

  return json({
    pageId,
    pageName: page.name,
    pageSlug: page.slug,
    isPublished: page.isPublished,
    planType: store?.planType || 'free',
    publishedBaseUrl,
    initialProjectData,
    mainAppUrl: env.MAIN_APP_URL || 'https://ozzyl.com',
  });
}

export default function EditPage() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { lang, toggleLang, t } = useLanguage();
  const [storageStatus, setStorageStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('loadingEditor') || 'Loading Editor...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
      {/* Editor Header */}
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href={`${data.mainAppUrl}/app/page-builder`}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 hover:text-white rounded-lg transition text-xs font-bold border border-gray-700"
          >
            ← {t('exitEditor') || 'Exit Editor'}
          </a>
          <div className="h-4 w-[1px] bg-gray-700" />
          <div className="flex flex-col">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none mb-1">
              {t('editingPage') || 'Editing Page'}
            </span>
            <h2 className="text-white text-xs font-bold leading-none truncate max-w-[200px]">
              {data.pageName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-full transition text-xs font-bold border border-gray-700"
            title={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
          >
            <Globe size={12} className="text-gray-400" />
            <span className="text-gray-300">{lang === 'en' ? 'EN' : 'বাং'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-full min-w-[120px] justify-center">
            {storageStatus === 'saving' ? (
              <>
                <div className="w-1.5 h-1.5 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Saving...</span>
              </>
            ) : storageStatus === 'saved' ? (
              <>
                <Check size={10} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase">Saved</span>
              </>
            ) : storageStatus === 'error' ? (
              <>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                <span className="text-[10px] text-red-500 font-bold uppercase">Error</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Auto-save</span>
              </>
            )}
          </div>

          {data.isPublished && (
            <a
              href={`${data.publishedBaseUrl}/p/${data.pageSlug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-xs font-bold"
            >
              <ExternalLink size={12} />
              View Live
            </a>
          )}
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <EditorErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full bg-gray-50/50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-gray-400 font-medium">Loading Canvas...</p>
                </div>
              </div>
            }
          >
            <GrapesEditor
              pageId={data.pageId}
              planType={data.planType}
              onStorageStatusChange={setStorageStatus}
              publishedBaseUrl={data.publishedBaseUrl}
              pageSlug={data.pageSlug}
              initialProjectData={data.initialProjectData}
              mainAppUrl={data.mainAppUrl}
            />
          </Suspense>
        </EditorErrorBoundary>
      </div>
    </div>
  );
}

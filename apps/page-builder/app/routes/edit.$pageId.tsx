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
import { landingPages, stores, users } from '@db/schema';
import { Check, ExternalLink } from 'lucide-react';

// Lazy load the GrapesJS editor
const GrapesEditor = lazy(() => import('~/components/page-builder/Editor'));

export const meta: MetaFunction = () => {
  return [{ title: 'Page Builder | Ozzyl' }];
};

// Simple auth check using session cookie
async function getAuthFromCookie(request: Request, env: any) {
  const cookie = request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/__session=([^;]+)/);
  if (!sessionMatch) return null;
  
  const sessionId = sessionMatch[1];
  const db = drizzle(env.DB);
  
  // Get user from session (simplified - you may want to use your existing auth logic)
  const user = await db
    .select({ id: users.id, storeId: users.storeId })
    .from(users)
    .where(eq(users.sessionToken, sessionId))
    .get();
  
  return user;
}

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const env = (context as any).cloudflare.env;
  const pageId = params.pageId;
  
  if (!pageId) {
    throw new Response('Page ID required', { status: 400 });
  }
  
  // Check auth
  const user = await getAuthFromCookie(request, env);
  if (!user?.storeId) {
    // Redirect to main app login
    const mainAppUrl = env.MAIN_APP_URL || 'https://ozzyl.com';
    return Response.redirect(`${mainAppUrl}/auth/login?redirect=/app/page-builder?id=${pageId}`, 302);
  }
  
  const db = drizzle(env.DB);
  
  // Fetch page data
  const [page, store] = await Promise.all([
    db
      .select()
      .from(landingPages)
      .where(
        and(
          eq(landingPages.id, parseInt(pageId)),
          eq(landingPages.storeId, user.storeId)
        )
      )
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
      initialProjectData = JSON.parse(page.projectData);
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
  const data = useLoaderData<typeof loader>();
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
          <p className="text-gray-400">Loading Editor...</p>
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
            ← Exit Editor
          </a>
          <div className="h-4 w-[1px] bg-gray-700" />
          <div className="flex flex-col">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none mb-1">
              Editing Page
            </span>
            <h2 className="text-white text-xs font-bold leading-none truncate max-w-[200px]">
              {data.pageName}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
          />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Page Builder Preview Route
 * 
 * Opens the page in a new tab exactly as customers would see it.
 * Similar to Elementor's preview functionality.
 * 
 * Route: /app/page-builder/preview/:pageId
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.pageName ? `Preview: ${data.pageName}` : 'Page Preview' }];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const pageId = params.pageId;
  if (!pageId) {
    throw new Response('Page ID required', { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch the page and store info
  const [page, store] = await Promise.all([
    db
      .select({
        id: landingPages.id,
        name: landingPages.name,
        slug: landingPages.slug,
        htmlContent: landingPages.htmlContent,
        cssContent: landingPages.cssContent,
        isPublished: landingPages.isPublished,
      })
      .from(landingPages)
      .where(and(eq(landingPages.id, parseInt(pageId)), eq(landingPages.storeId, storeId)))
      .get(),
    db
      .select({ name: stores.name })
      .from(stores)
      .where(eq(stores.id, storeId))
      .get()
  ]);

  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }

  return json({
    pageName: page.name,
    storeName: store?.name || 'Store',
    html: page.htmlContent || '',
    css: page.cssContent || '',
    isPublished: page.isPublished,
  });
}

export default function PageBuilderPreview() {
  const { pageName, storeName, html, css, isPublished } = useLoaderData<typeof loader>();

  // If no content, show empty state
  if (!html && !css) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Content Yet</h2>
          <p className="text-gray-500">Start building your page in the editor to see a preview here.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Preview Mode</span>
          </div>
          <span className="text-sm font-medium opacity-90">{pageName}</span>
          {!isPublished && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Draft</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">{storeName}</span>
          <button 
            onClick={() => window.close()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition text-xs font-bold backdrop-blur-sm"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Preview
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="pt-10">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  );
}

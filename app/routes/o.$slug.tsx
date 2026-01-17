/**
 * Page Builder v2 - Public Offers Page
 * 
 * Public route for viewing published landing pages.
 * Uses KV cache for maximum performance.
 */

import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';

import { getPageFromCache, cachePageData } from '~/lib/page-builder/cache.server';
import { getPublishedPageBySlug } from '~/lib/page-builder/actions.server';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';
import { FloatingActionButtons } from '~/components/page-builder/FloatingActionButtons';
import { OzzylBranding } from '~/components/OzzylBranding';

// ============================================================================
// TYPES
// ============================================================================

interface LoaderData {
  page: {
    id: string;
    slug: string;
    title: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    ogImage?: string | null;
    // Floating button settings
    whatsappEnabled?: number | null;
    whatsappNumber?: string | null;
    whatsappMessage?: string | null;
    callEnabled?: number | null;
    callNumber?: string | null;
    orderEnabled?: number | null;
    orderText?: string | null;
    orderBgColor?: string | null;
    orderTextColor?: string | null;
    buttonPosition?: string | null;
  };
  sections: Array<{
    id: string;
    type: string;
    enabled: boolean;
    sortOrder: number;
    props: Record<string, unknown>;
  }>;
  fromCache: boolean;
}

// ============================================================================
// META
// ============================================================================

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: 'Page Not Found' },
      { name: 'description', content: 'The requested page could not be found.' },
    ];
  }
  
  const { page } = data;
  const title = page.seoTitle || page.title || 'Landing Page';
  const description = page.seoDescription || '';
  
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    ...(page.ogImage ? [{ property: 'og:image', content: page.ogImage }] : []),
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];
};

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Response('Slug is required', { status: 400 });
  }
  
  const db = context.cloudflare.env.DB;
  const kv = context.cloudflare.env.STORE_CACHE as KVNamespace | undefined;
  
  // Get store from context (set by multi-tenant middleware based on subdomain/custom domain)
  const store = (context as any).store;
  const storeId = (context as any).storeId as number | undefined || store?.id;
  
  if (!storeId) {
    // No store context = user accessing from wrong domain or ozzyl.com main site
    throw new Response('This page is only accessible from the store subdomain', { status: 404 });
  }
  
  // Try cache first (if KV is available)
  const cached = await getPageFromCache(kv, storeId, slug);
  
  if (cached && cached.page.status === 'published') {
    return json<LoaderData>({
      page: cached.page,
      sections: cached.sections,
      fromCache: true,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Cache': 'HIT',
      },
    });
  }
  
  // Fetch from D1 (getPublishedPageBySlug only returns published pages)
  const page = await getPublishedPageBySlug(db, storeId, slug);
  
  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }
  
  // Cache for next request
  await cachePageData(kv, storeId, slug, page);
  
  return json<LoaderData>({
    page: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      ogImage: page.ogImage,
      // Floating button settings
      whatsappEnabled: page.whatsappEnabled,
      whatsappNumber: page.whatsappNumber,
      whatsappMessage: page.whatsappMessage,
      callEnabled: page.callEnabled,
      callNumber: page.callNumber,
      orderEnabled: page.orderEnabled,
      orderText: page.orderText,
      orderBgColor: page.orderBgColor,
      orderTextColor: page.orderTextColor,
      buttonPosition: page.buttonPosition,
    },
    sections: page.sections.map((s: { id: string; type: string; enabled: boolean; sortOrder: number; props: Record<string, unknown> }) => ({
      id: s.id,
      type: s.type,
      enabled: s.enabled,
      sortOrder: s.sortOrder,
      props: s.props,
    })),
    fromCache: false,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'X-Cache': 'MISS',
    },
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PublicOfferPage() {
  const { page, sections } = useLoaderData<typeof loader>();
  
  // Filter and sort sections for rendering
  const visibleSections = sections
    .filter(s => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Render all visible sections */}
      <SectionRenderer
        sections={visibleSections as any}
        activeSectionId={null}
      />
      
      {/* Floating Action Buttons - WhatsApp, Call, Order */}
      <FloatingActionButtons
        whatsappEnabled={page.whatsappEnabled === 1}
        whatsappNumber={page.whatsappNumber || ''}
        whatsappMessage={page.whatsappMessage || 'হ্যালো! আমি অর্ডার করতে চাই।'}
        callEnabled={page.callEnabled === 1}
        callNumber={page.callNumber || ''}
        orderEnabled={page.orderEnabled === 1 || page.orderEnabled === undefined || page.orderEnabled === null}
        orderText={page.orderText || 'অর্ডার করুন'}
        orderBgColor={page.orderBgColor || '#6366F1'}
        orderTextColor={page.orderTextColor || '#FFFFFF'}
        position={(page.buttonPosition || 'bottom-right') as 'bottom-right' | 'bottom-left' | 'bottom-center'}
      />
      
      {/* Powered by Ozzyl - Non-removable branding */}
      <OzzylBranding />
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">পেজটি খুঁজে পাওয়া যায়নি</p>
        <a 
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          হোমে ফিরে যান
        </a>
      </div>
    </div>
  );
}

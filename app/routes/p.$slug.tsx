/**
 * Published Page Route (Hybrid)
 * 
 * Routes: /p/:slug
 * 
 * Supports THREE types of pages:
 * 1. Page Builder v2 (Section-based): From `builderPages` table - checked FIRST
 * 2. Custom Pages (GrapesJS): Renders pre-built HTML/CSS from `landingPages` table.
 * 3. Campaign Pages (Quick Builder): Renders Dynamic Templates from `savedLandingConfigs` table.
 * 
 * Priority: Builder v2 -> Custom Pages -> Campaign Pages -> 404
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc } from 'drizzle-orm';
import { landingPages, stores, products, productVariants } from '@db/schema';
import { builderPages, builderSections } from '@db/schema_page_builder';
import { useTrackVisit } from '~/hooks/use-track-visit';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';
import { FloatingActionButtons } from '~/components/page-builder/FloatingActionButtons';
import { OzzylBranding } from '~/components/OzzylBranding';
import { TemplateLayoutRenderer } from '~/components/page-builder/TemplateLayoutRenderer';

// Type Guards
interface CustomPageData {
  type: 'custom';
  page: typeof landingPages.$inferSelect;
}

// Page Builder v2 data type
interface BuilderPageData {
  type: 'builder';
  page: {
    id: string;
    slug: string;
    title: string | null;
    storeId: number;
    productId?: number | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    ogImage?: string | null;
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
    templateId?: string | null;
  };
  product?: {
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    description?: string | null;
    variants?: Array<{
      id: number;
      name: string;
      price: number;
    }>;
  } | null;
  sections: Array<{
    id: string;
    type: string;
    enabled: boolean;
    sortOrder: number;
    props: Record<string, unknown>;
  }>;
}

type LoaderData = CustomPageData | BuilderPageData;

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || 'error' in data) {
    return [{ title: 'Page Not Found' }];
  }

  if (data.type === 'builder') {
    const title = data.page.seoTitle || data.page.title || 'Landing Page';
    const description = data.page.seoDescription || '';
    return [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      ...(data.page.ogImage ? [{ property: 'og:image', content: data.page.ogImage }] : []),
    ];
  }

  // Custom page (GrapesJS)
  return [{ title: data.page.name || 'Page' }];
};

export async function loader({ params, context, request: _request }: LoaderFunctionArgs) {
  const { slug } = params;
  const storeId = context.storeId; // Assumed injected by middleware

  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  if (!slug) {
    throw new Response('Slug required', { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // ========== FETCH STORE's homeEntry FOR SEO REDIRECT ==========
  const [storeInfo] = await db
    .select({ homeEntry: stores.homeEntry })
    .from(stores)
    .where(eq(stores.id, storeId as number))
    .limit(1);

  // ========== 1. TRY PAGE BUILDER V2 (builder_pages) ==========
  const [builderPage] = await db
    .select()
    .from(builderPages)
    .where(
      and(
        eq(builderPages.slug, slug),
        eq(builderPages.storeId, storeId as number),
        eq(builderPages.status, 'published')
      )
    )
    .limit(1);

  if (builderPage) {
    // ========== SEO: 301 REDIRECT IF THIS PAGE IS HOMEPAGE ==========
    // Prevents duplicate content on /p/{slug} and / for the same page
    const homeEntry = storeInfo?.homeEntry || 'store_home';
    const isHomepage = homeEntry === `page:${builderPage.id}`;
    
    if (isHomepage) {
      return new Response(null, {
        status: 301,
        headers: {
          'Location': '/',
          'Cache-Control': 'public, max-age=3600', // Cache redirect for 1 hour
        },
      });
    }
    // Get sections with published props
    const sections = await db
      .select()
      .from(builderSections)
      .where(eq(builderSections.pageId, builderPage.id))
      .orderBy(asc(builderSections.sortOrder));

    // Parse sections
    const parsedSections = sections.map(row => {
      let props: Record<string, unknown> = {};
      try {
        const propsSource = row.publishedPropsJson || row.propsJson || '{}';
        props = JSON.parse(propsSource);
      } catch {
        props = {};
      }
      return {
        id: row.id,
        type: row.type,
        enabled: Boolean(row.enabled),
        sortOrder: row.sortOrder,
        props,
      };
    });

    // Get product data if productId is set
    let productData: BuilderPageData['product'] = null;
    const effectiveProductId = builderPage.productId;

    if (effectiveProductId) {
      const [productRow] = await db
        .select()
        .from(products)
        .where(eq(products.id, effectiveProductId))
        .limit(1);

      if (productRow) {
        const variantRows = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, effectiveProductId));

        let parsedImages: string[] = [];
        try {
          if (productRow.images) {
            parsedImages = typeof productRow.images === 'string'
              ? JSON.parse(productRow.images)
              : Array.isArray(productRow.images) ? productRow.images : [];
          }
        } catch {
          parsedImages = [];
        }

        if (parsedImages.length === 0 && productRow.imageUrl) {
          parsedImages = [productRow.imageUrl];
        }

        productData = {
          id: productRow.id,
          title: productRow.title,
          price: productRow.price,
          compareAtPrice: productRow.compareAtPrice,
          images: parsedImages,
          description: productRow.description,
          variants: variantRows.map(v => ({
            id: v.id,
            name: [v.option1Value, v.option2Value, v.option3Value].filter(Boolean).join(' / ') || `Variant ${v.id}`,
            price: v.price ?? productRow.price,
          })),
        };
      }
    }

    return json<BuilderPageData>({
      type: 'builder',
      page: {
        id: builderPage.id,
        slug: builderPage.slug,
        title: builderPage.title,
        storeId: builderPage.storeId,
        productId: builderPage.productId,
        seoTitle: builderPage.seoTitle,
        seoDescription: builderPage.seoDescription,
        ogImage: builderPage.ogImage,
        whatsappEnabled: builderPage.whatsappEnabled,
        whatsappNumber: builderPage.whatsappNumber,
        whatsappMessage: builderPage.whatsappMessage,
        callEnabled: builderPage.callEnabled,
        callNumber: builderPage.callNumber,
        orderEnabled: builderPage.orderEnabled,
        orderText: builderPage.orderText,
        orderBgColor: builderPage.orderBgColor,
        orderTextColor: builderPage.orderTextColor,
        buttonPosition: builderPage.buttonPosition,
        templateId: builderPage.templateId,
      },
      product: productData,
      sections: parsedSections,
    });
  }

  // ========== 2. TRY CUSTOM PAGE (GrapesJS - landing_pages) ==========
  const customPage = await db
    .select()
    .from(landingPages)
    .where(
      and(
        eq(landingPages.slug, slug),
        eq(landingPages.storeId, storeId as number),
        eq(landingPages.isPublished, true)
      )
    )
    .limit(1)
    .get();

  if (customPage) {
    return json({ type: 'custom', page: customPage } as CustomPageData);
  }

  // No page found - throw 404
  throw new Response('Page not found', { status: 404 });
}

export default function PublishedPageRoute() {
  const data = useLoaderData<typeof loader>();

  if (data.type === 'builder') {
    return <BuilderPageRenderer data={data} />;
  }
  
  // Custom page (GrapesJS)
  return <CustomPageRenderer page={data.page} />;
}

// Sub-component for Page Builder v2 pages
function BuilderPageRenderer({ data }: { data: BuilderPageData }) {
  const { page, sections, product } = data;

  // Filter and sort sections for rendering
  const visibleSections = sections
    .filter(s => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <TemplateLayoutRenderer templateId={page.templateId || 'default'}>
      {/* Render all visible sections */}
      <SectionRenderer
        sections={visibleSections as Parameters<typeof SectionRenderer>[0]['sections']}
        activeSectionId={null}
        storeId={page.storeId}
        productId={page.productId || undefined}
        product={product}
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
    </TemplateLayoutRenderer>
  );
}

// Sub-component for Custom Pages (GrapesJS)
function CustomPageRenderer({ page }: { page: any }) {
  // UseTrackVisit hook for client-side unique visitor tracking
  useTrackVisit(page.storeId);

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
                primary: '#059669',
                secondary: '#2563eb',
              }
            }
          }
        }
      `}} />
      {/* FIX: Initialize Tailwind CSS gradient variables - CDN mode doesn't set these properly */}
      <style dangerouslySetInnerHTML={{ __html: `
        *, ::before, ::after {
          --tw-gradient-from-position: 0%;
          --tw-gradient-via-position: 50%;
          --tw-gradient-to-position: 100%;
        }
      `}} />
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" rel="stylesheet" />
      <script src="https://unpkg.com/lucide@latest"></script>
      <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
      <style dangerouslySetInnerHTML={{ __html: page.cssContent || '' }} />
      <div dangerouslySetInnerHTML={{ __html: page.htmlContent || '' }} />

      <script dangerouslySetInnerHTML={{
        __html: `
        (function() {
          /* Simplified Runtime Script for Button Actions */
           var config = { storeId: ${page.storeId} };
           function initHandlers() {
             document.querySelectorAll('[data-ozzyl-action]').forEach(btn => {
               btn.addEventListener('click', e => {
                 e.preventDefault();
                 const action = btn.getAttribute('data-ozzyl-action');
                 if(action === 'whatsapp') {
                    const phone = (btn.getAttribute('data-ozzyl-phone') || '').replace(/[^0-9]/g, '');
                    if(phone) window.open('https://wa.me/' + phone, '_blank');
                 }
               });
             });
           }
           if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHandlers);
           else initHandlers();
        })();
      `}} />
    </>
  );
}

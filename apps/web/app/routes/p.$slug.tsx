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
import { sanitizeHtml } from "~/utils/sanitize";

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
  const loaderData = data as LoaderData | undefined;
  if (!loaderData || 'error' in loaderData) {
    return [{ title: 'Page Not Found' }];
  }

  if (loaderData.type === 'builder') {
    const title = loaderData.page.seoTitle || loaderData.page.title || 'Landing Page';
    const description = loaderData.page.seoDescription || '';
    return [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      ...(loaderData.page.ogImage ? [{ property: 'og:image', content: loaderData.page.ogImage }] : []),
    ];
  }

  // Custom page (GrapesJS)
  return [{ title: loaderData.page.name || 'Page' }];
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
        .where(and(eq(products.id, effectiveProductId), eq(products.storeId, storeId as number)))
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
  const data = useLoaderData<typeof loader>() as LoaderData;

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
        sections={visibleSections}
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomPageRenderer({ page }: { page: any }) {
  // UseTrackVisit hook for client-side unique visitor tracking
  useTrackVisit(page.storeId);

  // Parse theme config for CSS variables
  let themeConfig = {
    primaryColor: '#059669',
    secondaryColor: '#2563eb',
    fontHeading: 'Hind Siliguri',
    fontBody: 'Hind Siliguri',
  };
  
  try {
    if (page.pageConfig) {
      const parsed = JSON.parse(page.pageConfig);
      if (parsed.themeConfig) {
        themeConfig = { ...themeConfig, ...parsed.themeConfig };
      }
    }
  } catch {
    // Use defaults
  }

  // Convert hex to RGB for opacity support
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const primaryRgb = hexToRgb(themeConfig.primaryColor);
  const secondaryRgb = hexToRgb(themeConfig.secondaryColor);

  return (
    <>
      {/* Pre-compiled Tailwind CSS - No CDN dependency */}
      <link href="/css/canvas-tailwind.css" rel="stylesheet" />
      
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Swiper CSS */}
      <link href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" rel="stylesheet" />
      
      {/* Animations CSS */}
      <link href="/animations.css" rel="stylesheet" />
      
      {/* Theme Variables & Primary/Secondary Colors */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${themeConfig.primaryColor};
          --secondary-color: ${themeConfig.secondaryColor};
          --primary-rgb: ${primaryRgb};
          --secondary-rgb: ${secondaryRgb};
          --font-heading: "${themeConfig.fontHeading}", sans-serif;
          --font-body: "${themeConfig.fontBody}", sans-serif;
        }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
        body, p, a, div, span, button, input, textarea, select, label { font-family: var(--font-body); }
        
        /* Primary Color Utilities */
        .text-primary { color: var(--primary-color) !important; }
        .bg-primary { background-color: var(--primary-color) !important; }
        .border-primary { border-color: var(--primary-color) !important; }
        
        /* Primary with opacity */
        .bg-primary\\/10 { background-color: rgba(var(--primary-rgb), 0.1) !important; }
        .bg-primary\\/20 { background-color: rgba(var(--primary-rgb), 0.2) !important; }
        .bg-primary\\/30 { background-color: rgba(var(--primary-rgb), 0.3) !important; }
        
        /* Secondary Color Utilities */
        .text-secondary { color: var(--secondary-color) !important; }
        .bg-secondary { background-color: var(--secondary-color) !important; }
        .border-secondary { border-color: var(--secondary-color) !important; }
        
        /* Hover states */
        .hover\\:text-primary:hover { color: var(--primary-color) !important; }
        .hover\\:bg-primary:hover { background-color: var(--primary-color) !important; }
        .hover\\:opacity-90:hover { opacity: 0.9; }
        
        /* Smooth scrolling */
        html { scroll-behavior: smooth; }
        
        /* Body base */
        body { margin: 0; padding: 0; min-height: 100vh; background-color: #ffffff; }
      `}} />
      
      {/* Page-specific CSS from GrapesJS */}
      <style dangerouslySetInnerHTML={{ __html: page.cssContent || '' }} />
      
      {/* Page HTML Content */}
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.htmlContent || '') }} />

      {/* Lucide Icons */}
      <script src="https://unpkg.com/lucide@latest"></script>
      
      {/* Swiper JS */}
      <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
      
      {/* Runtime Scripts */}
      <script dangerouslySetInnerHTML={{
        __html: `
        (function() {
          var config = { storeId: ${page.storeId} };
          
          function initHandlers() {
            // Button action handlers
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
            
            // Initialize Swiper sliders
            document.querySelectorAll('.swiper').forEach(function(el) {
              new Swiper(el, {
                loop: true,
                autoplay: { delay: 3000, disableOnInteraction: false },
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
              });
            });
            
            // Initialize Lucide icons
            if(window.lucide) lucide.createIcons();
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHandlers);
          } else {
            initHandlers();
          }
        })();
      `}} />
    </>
  );
}

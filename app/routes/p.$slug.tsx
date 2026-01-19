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
import { eq, and, sql, asc } from 'drizzle-orm';
import { landingPages, savedLandingConfigs, stores, products, productVariants, orderBumps, templateAnalytics } from '@db/schema';
import { builderPages, builderSections } from '@db/schema_page_builder';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getTemplate, DEFAULT_TEMPLATE_ID, type TemplateProps, type SerializedProduct } from '~/templates/registry';
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

interface QuickPageData {
  type: 'quick';
  storeId: number;
  storeName: string;
  currency: string;
  config: LandingConfig;
  product: SerializedProduct | null;
  productVariants: Array<{
    id: number;
    option1Name: string | null;
    option1Value: string | null;
    option2Name: string | null;
    option2Value: string | null;
    price: number | null;
    inventory: number | null;
    isAvailable: boolean | null;
  }>;
  orderBumps: Array<{
    id: number;
    title: string;
    description: string | null;
    discount: number;
    bumpProduct: {
      id: number;
      title: string;
      price: number;
      imageUrl: string | null;
    };
  }>;
  planType: string;
  landingPageId: number; // For Analytics
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

type LoaderData = CustomPageData | QuickPageData | BuilderPageData;

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

  if (data.type === 'custom') {
    return [{ title: data.page.name }];
  } else {
    // Quick Builder SEO
    const config = data.config as LandingConfig;
    const title = config.seoTitle || config.headline || data.storeName;
    const description = config.seoDescription || config.subheadline || '';

    return [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ];
  }
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

  // 2. Try Fetching Campaign Page (Quick Builder)
  const campaignPage = await db
    .select()
    .from(savedLandingConfigs)
    .where(
      and(
        eq(savedLandingConfigs.storeId, storeId as number),
        eq(savedLandingConfigs.offerSlug, slug),
        eq(savedLandingConfigs.isActive, true)
      )
    )
    .limit(1)
    .get();

  if (campaignPage) {
    // Fetch dependencies for Quick Builder Template
    const storeResult = await db.select().from(stores).where(eq(stores.id, storeId as number)).limit(1).get();
    if (!storeResult) throw new Response('Store not found', { status: 404 });

    const config = parseLandingConfig(campaignPage.landingConfig as string | null) || defaultLandingConfig;

    // Fetch Product Data (Fallback to store's featured product)
    const featuredProductId = storeResult.featuredProductId;
    let product: SerializedProduct | null = null;
    let productVariantsData: any[] = [];
    let orderBumpsData: any[] = [];

    if (featuredProductId) {
      const p = await db.select().from(products).where(eq(products.id, featuredProductId)).limit(1).get();

      if (p) {
        product = {
          id: p.id,
          storeId: p.storeId,
          title: p.title,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          imageUrl: p.imageUrl,
        };

        productVariantsData = await db
          .select({
            id: productVariants.id,
            option1Name: productVariants.option1Name,
            option1Value: productVariants.option1Value,
            option2Name: productVariants.option2Name,
            option2Value: productVariants.option2Value,
            price: productVariants.price,
            inventory: productVariants.inventory,
            isAvailable: productVariants.isAvailable,
          })
          .from(productVariants)
          .where(eq(productVariants.productId, p.id));

        const bumps = await db
          .select({
            id: orderBumps.id,
            title: orderBumps.title,
            description: orderBumps.description,
            discount: orderBumps.discount,
            bumpProductId: orderBumps.bumpProductId,
          })
          .from(orderBumps)
          .where(and(eq(orderBumps.storeId, storeId as number), eq(orderBumps.productId, p.id), eq(orderBumps.isActive, true)));

        for (const bump of bumps) {
          const bp = await db.select().from(products).where(eq(products.id, bump.bumpProductId)).limit(1).get();
          if (bp) {
            orderBumpsData.push({
              ...bump,
              discount: bump.discount ?? 0,
              bumpProduct: {
                id: bp.id,
                title: bp.title,
                price: bp.price,
                imageUrl: bp.imageUrl,
              }
            });
          }
        }
      }
    }

    // Async Tracking
    context.cloudflare.ctx.waitUntil((async () => {
      // Update Page View Count
      await db.update(savedLandingConfigs)
        .set({ viewCount: sql`${savedLandingConfigs.viewCount} + 1` })
        .where(eq(savedLandingConfigs.id, campaignPage.id));

      // Update Template Analytics
      const templateId = config.templateId || DEFAULT_TEMPLATE_ID;
      const existing = await db.select().from(templateAnalytics).where(and(eq(templateAnalytics.storeId, storeId as number), eq(templateAnalytics.templateId, templateId))).limit(1).get();
      if (existing) {
        await db.update(templateAnalytics).set({ pageViews: sql`${templateAnalytics.pageViews} + 1`, updatedAt: new Date() }).where(eq(templateAnalytics.id, existing.id));
      } else {
        await db.insert(templateAnalytics).values({ storeId: storeId as number, templateId, pageViews: 1, ordersGenerated: 0, revenueGenerated: 0, updatedAt: new Date() });
      }
    })());

    return json({
      type: 'quick',
      storeId: storeResult.id,
      storeName: storeResult.name,
      currency: storeResult.currency || 'BDT',
      config,
      product,
      productVariants: productVariantsData,
      orderBumps: orderBumpsData,
      planType: storeResult.planType || 'free',
      landingPageId: campaignPage.id,
    } as QuickPageData);
  }

  throw new Response('Page not found', { status: 404 });
}

export default function PublishedPageRoute() {
  const data = useLoaderData<typeof loader>();

  if (data.type === 'builder') {
    return <BuilderPageRenderer data={data} />;
  }
  
  if (data.type === 'custom') {
    return <CustomPageRenderer page={data.page} />;
  } else {
    return <QuickPageRenderer data={data as unknown as QuickPageData} />;
  }
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

// Sub-component for Quick Builder Pages
function QuickPageRenderer({ data }: { data: QuickPageData }) {
  const { config } = data;
  const templateId = config.templateId || DEFAULT_TEMPLATE_ID;
  const { component: TemplateComponent } = getTemplate(templateId);

  // Default product if null (shouldn't happen in valid setups but safety first)
  const productStub: SerializedProduct = data.product || {
    id: 0,
    storeId: data.storeId,
    title: 'Product Not Found',
    description: '',
    price: 0,
    compareAtPrice: null,
    imageUrl: '',
  };

  const templateProps: TemplateProps = {
    storeName: data.storeName,
    storeId: data.storeId,
    currency: data.currency,
    config: config,
    product: productStub,
    productVariants: data.productVariants,
    orderBumps: data.orderBumps,
    planType: data.planType,
    landingPageId: data.landingPageId,
  };

  return <TemplateComponent {...templateProps} />;
}

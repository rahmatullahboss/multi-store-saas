/**
 * Campaign Route - Product-Specific Landing Page
 * 
 * Route: /offers/:productId
 * 
 * Purpose:
 * Allow store owners to share focused landing pages for specific products,
 * perfect for Facebook Ads and marketing campaigns. This route:
 * - Renders product in LandingPageTemplate (no store header/footer)
 * - Uses store's landingConfig (colors, fonts, theme)
 * - Overrides headline/product with current product details
 * - Supports query param customization (?headline=Custom+Text)
 * 
 * Key Features:
 * - Works with subdomain + custom domain stores
 * - High-converting sales funnel design
 * - Cash on Delivery order form included
 */

import { json, type LoaderFunctionArgs, type MetaFunction, type HeadersFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq, and, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, productVariants, orderBumps, templateAnalytics, type Product, type Store } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getTemplateComponent, DEFAULT_TEMPLATE_ID } from '~/templates/registry';
import { useTrackVisit } from '~/hooks/use-track-visit';
import { ProductSchema } from '~/components/seo/ProductSchema';


// ============================================================================
// CDN CACHING HEADERS - Same as _index.tsx
// ============================================================================

export const headers: HeadersFunction = () => ({
  'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
  'Vary': 'Host',
});

// ============================================================================
// META - SEO for product landing page
// ============================================================================
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || typeof data !== 'object' || !('product' in data) || !data.product) {
    return [{ title: 'Product Not Found' }];
  }

  const loaderData = data as LoaderData;
  const seo = loaderData.landingConfig as { seoTitle?: string; seoDescription?: string; ogImage?: string };
  
  // Priority: landingConfig SEO fields > dynamic content
  const title = seo.seoTitle || `${loaderData.product.title} - ${loaderData.storeName}`;
  const description = seo.seoDescription || loaderData.landingConfig.headline || loaderData.product.description || `Get ${loaderData.product.title} now!`;
  const ogImage = seo.ogImage || loaderData.product.imageUrl || '';

  return [
    { title },
    { name: 'description', content: description },
    // Open Graph for Facebook Ads
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
    { property: 'og:type', content: 'product' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
  ];
};


// ============================================================================
// LOADER TYPES
// ============================================================================
interface LoaderData {
  storeId: number;
  storeName: string;
  currency: string;
  product: Product;
  landingConfig: LandingConfig;
  isCustomerAiEnabled: boolean;
  planType: string;
  // Tracking
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  // Specific Product Associations
  productVariants: Array<{
    id: number;
    option1Name: string | null;
    option1Value: string | null;
    option2Name: string | null;
    option2Value: string | null;
    price: number | null;
    inventory: number | null;
    isAvailable: boolean | null;
    name: string; // Combined name
  }>;
  orderBumps: Array<{
    id: number;
    title: string;
    description?: string | null;
    discount: number;
    bumpProduct: {
      id: number;
      title: string;
      price: number;
      imageUrl?: string | null;
    };
  }>;
}

// ============================================================================
// HELPER: Database query with timeout
// ============================================================================
const DB_TIMEOUT_MS = 5000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// ============================================================================
// LOADER - Fetch product + store landing config
// ============================================================================
export async function loader({ context, request, params }: LoaderFunctionArgs): Promise<Response> {
  const { storeId, store } = context;
  const { cloudflare } = context;
  const productId = params.productId;

  // Validate productId
  if (!productId || isNaN(parseInt(productId))) {
    throw new Response('Invalid product ID', { status: 400 });
  }

  const productIdNum = parseInt(productId);

  // Validate cloudflare context
  if (!cloudflare?.env?.DB) {
    throw new Response('Service temporarily unavailable', { status: 503 });
  }

  const db = drizzle(cloudflare.env.DB);

  // ========== STORE RESOLUTION ==========
  let resolvedStore = store as Store | undefined;
  let resolvedStoreId = storeId as number | undefined;

  // If no store from middleware, this is an error for campaign routes
  if (!resolvedStore || !resolvedStoreId) {
    // Try to find store from first active store (fallback for dev)
    try {
      const fallbackStoreQuery = db
        .select()
        .from(stores)
        .where(eq(stores.isActive, true))
        .limit(1);

      const fallbackStore = await withTimeout(
        fallbackStoreQuery,
        DB_TIMEOUT_MS,
        'Database query timed out'
      );

      if (fallbackStore.length > 0) {
        resolvedStore = fallbackStore[0] as Store;
        resolvedStoreId = fallbackStore[0].id;
      } else {
        throw new Response('Store not found', { status: 404 });
      }
    } catch (error) {
      if (error instanceof Response) throw error;
      throw new Response('Store not found', { status: 404 });
    }
  }

  // ========== FETCH PRODUCT ==========
  try {
    const productQuery = db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productIdNum),
          eq(products.storeId, resolvedStoreId),
          eq(products.isPublished, true)
        )
      )
      .limit(1);

    const productResult = await withTimeout(
      productQuery,
      DB_TIMEOUT_MS,
      'Database query timed out while fetching product'
    );

    if (productResult.length === 0) {
      throw new Response('Product not found', { status: 404 });
    }

    const product = productResult[0];

    // ========== FETCH PRODUCT VARIANTS & BUMPS ==========
    // Get variants specific to this product
    const variantsResult = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productIdNum));

    const mappedVariants = variantsResult.map(v => {
        const parts = [];
        if (v.option1Value) parts.push(v.option1Value);
        if (v.option2Value) parts.push(v.option2Value);
        
        return {
           id: v.id,
           option1Name: v.option1Name,
           option1Value: v.option1Value,
           option2Name: v.option2Name,
           option2Value: v.option2Value,
           price: v.price,
           inventory: v.inventory,
           isAvailable: v.isAvailable,
           name: parts.join(' / ') || 'Default'
        };
    })

    // Get order bumps specifically tied to this product
    const bumpsResult = await db
      .select({
         id: orderBumps.id,
         title: orderBumps.title,
         description: orderBumps.description,
         discount: orderBumps.discount,
         bumpProduct: {
            id: products.id,
            title: products.title,
            price: products.price,
            imageUrl: products.imageUrl,
         }
      })
      .from(orderBumps)
      .innerJoin(products, eq(orderBumps.bumpProductId, products.id))
      .where(
        and(
          eq(orderBumps.productId, productIdNum),
          eq(orderBumps.isActive, true)
        )
      );

    const mappedBumps = bumpsResult.map(b => ({
      ...b,
      discount: b.discount ?? 0,
    }));

    // ========== PARSE LANDING CONFIG ==========
    const landingConfigRaw = (resolvedStore as Store & { landingConfig?: string }).landingConfig;
    const baseLandingConfig = parseLandingConfig(landingConfigRaw) ?? defaultLandingConfig;

    // ========== QUERY PARAM OVERRIDES ==========
    const url = new URL(request.url);
    const headlineOverride = url.searchParams.get('headline');
    const subheadlineOverride = url.searchParams.get('subheadline');
    const ctaTextOverride = url.searchParams.get('cta');
    const urgencyOverride = url.searchParams.get('urgency');

    // Build final landing config with overrides and fallback to product title
    const landingConfig: LandingConfig = {
      ...baseLandingConfig,
      // Use query param if provided, otherwise fallback to product title to make the landing page specific
      headline: headlineOverride || product.title,
      subheadline: subheadlineOverride || product.description || baseLandingConfig.subheadline,
      ctaText: ctaTextOverride || baseLandingConfig.ctaText,
      urgencyText: urgencyOverride || baseLandingConfig.urgencyText,
    };

    const loaderData: LoaderData = {
      storeId: resolvedStoreId,
      storeName: resolvedStore.name ?? 'Store',
      currency: resolvedStore.currency ?? 'BDT',
      product,
      landingConfig,
      isCustomerAiEnabled: (resolvedStore as Store & { isCustomerAiEnabled?: boolean }).isCustomerAiEnabled ?? false,
      planType: resolvedStore.planType || 'free',
      // Tracking IDs from Store Settings
      facebookPixelId: (resolvedStore as any).facebookPixelId || undefined,
      googleAnalyticsId: (resolvedStore as any).googleAnalyticsId || undefined,
      productVariants: mappedVariants,
      orderBumps: mappedBumps,
    };

    // ========== TRACK PAGE VIEW ==========
    const templateId = landingConfig.templateId || DEFAULT_TEMPLATE_ID;
    context.cloudflare.ctx.waitUntil((async () => {
      try {
        const existing = await db
          .select({ id: templateAnalytics.id })
          .from(templateAnalytics)
          .where(and(eq(templateAnalytics.storeId, resolvedStoreId), eq(templateAnalytics.templateId, templateId)))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(templateAnalytics)
            .set({ pageViews: sql`${templateAnalytics.pageViews} + 1`, updatedAt: new Date() })
            .where(eq(templateAnalytics.id, existing[0].id));
        } else {
          await db
            .insert(templateAnalytics)
            .values({
              storeId: resolvedStoreId!,
              templateId,
              pageViews: 1,
              ordersGenerated: 0,
              revenueGenerated: 0,
              updatedAt: new Date(),
            });
        }
      } catch (e) {
        console.error('[Template Analytics] Failed to track page view:', e);
      }
    })());

    return json(loaderData);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('[offers.$productId] Error fetching product:', error);
    throw new Response('Unable to load product', { status: 500 });
  }
}

// ============================================================================
// COMPONENT - Render focused landing page
// ============================================================================
export default function OfferProductPage() {
  const data = useLoaderData<LoaderData>();
  const TemplateComponent = getTemplateComponent(data.landingConfig.templateId);

  // Track visitor
  useTrackVisit(data.storeId);

  return (
    <>
      {/* JSON-LD Product Schema for Rich Results */}
      <ProductSchema 
        product={data.product}
        storeName={data.storeName}
        currency={data.currency}
      />
      
      {/* Custom CSS injection */}
      {data.landingConfig.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: data.landingConfig.customCSS }} />
      )}
      
      {/* Facebook Pixel from Store Settings (automatic) */}
      {data.facebookPixelId && (
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${data.facebookPixelId}');
          fbq('track', 'PageView');
        ` }} />
      )}
      
      {/* Google Analytics 4 from Store Settings (automatic) */}
      {data.googleAnalyticsId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${data.googleAnalyticsId}`} />
          <script dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${data.googleAnalyticsId}');
          ` }} />
        </>
      )}
      
      {/* Custom Head Code injection (additional scripts) */}
      {data.landingConfig.customHeadCode && (
        <div 
          dangerouslySetInnerHTML={{ __html: data.landingConfig.customHeadCode }}
          style={{ display: 'none' }}
        />
      )}
      
      <TemplateComponent
        storeName={data.storeName}
        storeId={data.storeId}
        product={data.product}
        productVariants={data.productVariants}
        orderBumps={data.orderBumps}
        config={data.landingConfig}
        currency={data.currency}
        isPreview={false}
        isEditMode={false} // Explicitly disable editor magic wrapper on live page
        isCustomerAiEnabled={data.isCustomerAiEnabled}
        planType={data.planType}
      />
      
      {/* Custom HTML Sections (imported designs) - CSS Isolated */}
      {(data.landingConfig as any).customSections?.map((section: { id: string; html: string; css?: string }) => (
        <div 
          key={section.id} 
          className="custom-html-section"
          style={{
            all: 'revert',
            display: 'block',
            isolation: 'isolate',
          }}
        >
          {/* Scoped styles for this section only */}
          <style dangerouslySetInnerHTML={{ __html: `
            .custom-html-section-${section.id} * {
              all: revert;
            }
            ${section.css || ''}
          ` }} />
          {/* Render HTML content in an iframe for complete CSS isolation */}
          <iframe
            title={`custom-section-${section.id}`}
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: system-ui, sans-serif; }
                    ${section.css || ''}
                  </style>
                </head>
                <body>${section.html}</body>
              </html>
            `}
            style={{
              width: '100%',
              border: 'none',
              display: 'block',
              minHeight: '200px',
            }}
            onLoad={(e) => {
              // Auto-resize iframe to content height
              const iframe = e.target as HTMLIFrameElement;
              if (iframe.contentWindow?.document.body) {
                iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
              }
            }}
          />
        </div>
      ))}
      
      {/* Custom Body Code injection (chat widgets, etc.) */}
      {data.landingConfig.customBodyCode && (
        <div 
          dangerouslySetInnerHTML={{ __html: data.landingConfig.customBodyCode }}
        />
      )}
    </>
  );
}

// ============================================================================
// ERROR BOUNDARY - Product not found handling
// ============================================================================
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-6">
          This product may have been removed or is no longer available.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
        >
          Go to Store
        </a>
      </div>
    </div>
  );
}

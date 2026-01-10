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
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, type Product, type Store } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getTemplateComponent } from '~/templates/registry';
import { useTrackVisit } from '~/hooks/use-track-visit';

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

  return [
    { title: `${loaderData.product.title} - ${loaderData.storeName}` },
    { 
      name: 'description', 
      content: loaderData.landingConfig.headline || loaderData.product.description || `Get ${loaderData.product.title} now!`
    },
    // Open Graph for Facebook Ads
    { property: 'og:title', content: loaderData.product.title },
    { property: 'og:description', content: loaderData.landingConfig.subheadline || loaderData.product.description || '' },
    { property: 'og:image', content: loaderData.product.imageUrl || '' },
    { property: 'og:type', content: 'product' },
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

    // ========== PARSE LANDING CONFIG ==========
    const landingConfigRaw = (resolvedStore as Store & { landingConfig?: string }).landingConfig;
    const baseLandingConfig = parseLandingConfig(landingConfigRaw) ?? defaultLandingConfig;

    // ========== QUERY PARAM OVERRIDES ==========
    const url = new URL(request.url);
    const headlineOverride = url.searchParams.get('headline');
    const subheadlineOverride = url.searchParams.get('subheadline');
    const ctaTextOverride = url.searchParams.get('cta');
    const urgencyOverride = url.searchParams.get('urgency');

    // Build final landing config with overrides
    const landingConfig: LandingConfig = {
      ...baseLandingConfig,
      // Use query param if provided, otherwise use product title as headline
      headline: headlineOverride || baseLandingConfig.headline,
      subheadline: subheadlineOverride || baseLandingConfig.subheadline,
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
    };

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
    <TemplateComponent
      storeName={data.storeName}
      storeId={data.storeId}
      product={data.product}
      config={data.landingConfig}
      currency={data.currency}
      isPreview={false}
      isEditMode={false}
      isCustomerAiEnabled={data.isCustomerAiEnabled}
    />
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

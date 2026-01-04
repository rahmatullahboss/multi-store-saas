/**
 * Store Homepage Route - Hybrid Mode
 * 
 * Displays either:
 * - Landing Page (single product focus) if store.mode === 'landing'
 * - Full Store (product catalog) if store.mode === 'store'
 * 
 * CACHING STRATEGY:
 * - max-age=60: Browser cache for 1 minute
 * - s-maxage=3600: CDN cache for 1 hour
 * - stale-while-revalidate=86400: Serve stale for 24h while revalidating
 */

import { json, type LoaderFunctionArgs, type MetaFunction, type HeadersFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, type Product, type Store } from '@db/schema';
import { parseLandingConfig, parseThemeConfig, defaultLandingConfig, type LandingConfig, type ThemeConfig } from '@db/types';
import { LandingPageTemplate } from '~/components/templates/LandingPageTemplate';
import { StoreLayout } from '~/components/templates/StoreLayout';

// ============================================================================
// AGGRESSIVE CDN CACHING HEADERS
// ============================================================================
export const headers: HeadersFunction = () => ({
  // Browser: 1 minute, CDN: 1 hour, Stale: 24 hours
  'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
  // Vary by host for multi-tenant caching
  'Vary': 'Host',
});

// ============================================================================
// META
// ============================================================================
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Store' }];
  }
  
  const description = data.mode === 'landing' && data.featuredProduct
    ? `Get ${data.featuredProduct.title} - ${data.landingConfig?.headline || ''}`
    : `Shop the best products at ${data.storeName}`;
  
  return [
    { title: data?.storeName || 'Store' },
    { name: 'description', content: description },
  ];
};

// ============================================================================
// LOADER - Mode-based data fetching with caching
// ============================================================================
export async function loader({ context, request }: LoaderFunctionArgs) {
  let { storeId, store } = context;
  const { cloudflare } = context;
  const db = drizzle(cloudflare.env.DB);
  
  // Fallback: If no store matched from tenant middleware, get first active store
  // This handles Cloudflare Pages deployment URLs like d3590a80.multi-store-saas.pages.dev
  if (!store || storeId === 0) {
    const fallbackStore = await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, true))
      .limit(1);
    
    if (fallbackStore.length > 0) {
      store = fallbackStore[0] as Store;
      storeId = fallbackStore[0].id;
    } else {
      // No stores in database at all
      throw new Response('Store not found', { status: 404 });
    }
  }
  
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  
  // Determine store mode
  const storeMode = (store as Store & { mode?: 'landing' | 'store' }).mode || 'store';
  
  // ========== LANDING MODE ==========
  if (storeMode === 'landing') {
    // Fetch only the featured product (minimal D1 read)
    const featuredProductId = (store as Store & { featuredProductId?: number }).featuredProductId;
    
    let featuredProduct: Product | null = null;
    
    if (featuredProductId) {
      const result = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, featuredProductId),
            eq(products.storeId, storeId),
            eq(products.isPublished, true)
          )
        )
        .limit(1);
      featuredProduct = result[0] || null;
    }
    
    // Fallback: Get first published product if no featured product
    if (!featuredProduct) {
      const fallback = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.storeId, storeId),
            eq(products.isPublished, true)
          )
        )
        .limit(1);
      featuredProduct = fallback[0] || null;
    }
    
    // Parse landing config
    const landingConfigRaw = (store as Store & { landingConfig?: string }).landingConfig;
    const landingConfig = parseLandingConfig(landingConfigRaw) || defaultLandingConfig;
    
    return json({
      mode: 'landing' as const,
      storeId,
      storeName: store?.name || 'Store',
      currency: store?.currency || 'USD',
      featuredProduct,
      landingConfig,
      // Not needed for landing mode
      products: null,
      categories: null,
      currentCategory: null,
      themeConfig: null,
      logo: null,
    });
  }
  
  // ========== FULL STORE MODE ==========
  // Fetch products with optional category filter
  const storeProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        category ? eq(products.category, category) : undefined
      )
    )
    .limit(50);
  
  // Get unique categories
  const allProducts = await db
    .select({ category: products.category })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true)
      )
    );
  
  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  
  // Parse theme config
  const themeConfigRaw = (store as Store & { themeConfig?: string }).themeConfig;
  const themeConfig = parseThemeConfig(themeConfigRaw);
  
  return json({
    mode: 'store' as const,
    storeId,
    storeName: store?.name || 'Store',
    logo: store?.logo,
    currency: store?.currency || 'USD',
    products: storeProducts,
    categories,
    currentCategory: category,
    themeConfig,
    // Not needed for store mode
    featuredProduct: null,
    landingConfig: null,
  });
}

// ============================================================================
// COMPONENT - Conditional rendering based on mode
// ============================================================================
export default function Index() {
  const data = useLoaderData<typeof loader>();

  // ========== LANDING MODE ==========
  if (data.mode === 'landing') {
    if (!data.featuredProduct) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
            <p className="text-gray-400">This store is being set up.</p>
          </div>
        </div>
      );
    }
    
    return (
      <LandingPageTemplate
        storeName={data.storeName}
        storeId={data.storeId}
        product={data.featuredProduct}
        config={data.landingConfig as LandingConfig}
        currency={data.currency}
      />
    );
  }

  // ========== FULL STORE MODE ==========
  return (
    <StoreLayout
      storeName={data.storeName}
      storeId={data.storeId}
      logo={data.logo}
      products={data.products || []}
      categories={data.categories || []}
      currentCategory={data.currentCategory}
      config={data.themeConfig as ThemeConfig | null}
      currency={data.currency}
    />
  );
}

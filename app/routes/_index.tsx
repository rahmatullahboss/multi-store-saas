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
 * 
 * ERROR BOUNDARY:
 * - This route has its own ErrorBoundary for isolated error handling
 * - If the product grid fails, only this section shows the error
 * - Parent layout (Header/Footer) remains visible
 */

import { json, type LoaderFunctionArgs, type MetaFunction, type HeadersFunction } from '@remix-run/cloudflare';
import { useLoaderData, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, type Product, type Store } from '@db/schema';
import { parseLandingConfig, parseThemeConfig, parseSocialLinks, parseFooterConfig, defaultLandingConfig, type LandingConfig, type ThemeConfig, type SocialLinks, type FooterConfig } from '@db/types';
import { LandingPageTemplate } from '~/components/templates/LandingPageTemplate';
import { StoreLayout } from '~/components/templates/StoreLayout';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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
  
  // Parse Phase 3 configs
  const socialLinks = parseSocialLinks(store?.socialLinks as string | null);
  const footerConfig = parseFooterConfig(store?.footerConfig as string | null);
  
  return json({
    mode: 'store' as const,
    storeId,
    storeName: store?.name || 'Store',
    logo: store?.logo,
    favicon: store?.favicon,
    fontFamily: store?.fontFamily || 'inter',
    currency: store?.currency || 'USD',
    theme: store?.theme || 'default',
    products: storeProducts,
    categories,
    currentCategory: category,
    themeConfig,
    socialLinks,
    footerConfig,
    businessInfo: store?.businessInfo ? JSON.parse(store.businessInfo) : null,
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
      theme={data.theme}
      fontFamily={data.fontFamily}
      products={data.products || []}
      categories={data.categories || []}
      currentCategory={data.currentCategory}
      config={data.themeConfig as ThemeConfig | null}
      currency={data.currency}
      socialLinks={data.socialLinks as SocialLinks | null}
      footerConfig={data.footerConfig as FooterConfig | null}
      businessInfo={data.businessInfo}
    />
  );
}

// ============================================================================
// NESTED ERROR BOUNDARY - Isolates errors to this route only
// ============================================================================
/**
 * Nested ErrorBoundary for the store homepage
 * 
 * When an error occurs in this route:
 * - Only the content area shows the error UI
 * - Parent layouts (if any) remain intact
 * - Users can retry or navigate without full page refresh
 * 
 * For 404 errors (store not found), this bubbles up to root
 * For other errors, shows an inline error message
 */
export function ErrorBoundary() {
  const error = useRouteError();
  
  // For store not found (404), let it bubble to root for full-page treatment
  if (isRouteErrorResponse(error) && error.status === 404) {
    throw error; // Re-throw to parent ErrorBoundary
  }
  
  const handleReload = () => {
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Unable to Load Store
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          We couldn\'t load the store content. This might be a temporary issue.
        </p>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          
          <a
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && error instanceof Error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto text-gray-700">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}


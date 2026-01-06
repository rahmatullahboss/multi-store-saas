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
import { useLoaderData, useRouteError, isRouteErrorResponse, useSearchParams } from '@remix-run/react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, type Product, type Store } from '@db/schema';
import { parseLandingConfig, parseThemeConfig, parseSocialLinks, parseFooterConfig, defaultLandingConfig, type LandingConfig, type ThemeConfig, type SocialLinks, type FooterConfig } from '@db/types';
import { getTemplate, DEFAULT_TEMPLATE_ID, type TemplateProps } from '~/templates/registry';
import { getStoreTemplate, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { StoreLayout } from '~/components/templates/StoreLayout';
import { MarketingLanding } from '~/components/MarketingLanding';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { canUseStoreMode, type PlanType } from '~/utils/plans.server';

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
export const meta: MetaFunction = ({ data }) => {
  // Type guard for loader data
  const loaderData = data as LoaderData | undefined;
  
  if (!loaderData) {
    return [{ title: 'Store' }];
  }
  
  // Marketing mode - return SaaS branding
  if (loaderData.mode === 'marketing') {
    return [
      { title: 'Multi-Store SaaS - Launch Your Online Store in 5 Minutes' },
      { name: 'description', content: 'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.' },
    ];
  }
  
  const description = loaderData.mode === 'landing' && loaderData.featuredProduct
    ? `Get ${loaderData.featuredProduct.title} - ${loaderData.landingConfig?.headline || ''}`
    : `Shop the best products at ${loaderData.storeName}`;
  
  return [
    { title: loaderData.storeName || 'Store' },
    { name: 'description', content: description },
  ];
};

// ============================================================================
// LOADER TYPES - Strict typing for frontend consumption
// ============================================================================
interface LandingModeData {
  mode: 'landing';
  storeId: number;
  storeName: string;
  currency: string;
  featuredProduct: Product | null;
  landingConfig: LandingConfig;
  // Explicitly null for this mode
  products: null;
  categories: null;
  currentCategory: null;
  themeConfig: null;
  logo: null;
  favicon: null;
  fontFamily: null;
  theme: null;
  socialLinks: null;
  footerConfig: null;
  businessInfo: null;
}

interface StoreModeData {
  mode: 'store';
  storeId: number;
  storeName: string;
  logo: string | null;
  favicon: string | null;
  fontFamily: string;
  currency: string;
  theme: string;
  products: Product[];
  categories: string[];
  currentCategory: string | null;
  themeConfig: ThemeConfig | null;
  socialLinks: SocialLinks | null;
  footerConfig: FooterConfig | null;
  businessInfo: Record<string, unknown> | null;
  // Explicitly null for this mode
  featuredProduct: null;
  landingConfig: null;
}

interface MarketingModeData {
  mode: 'marketing';
}

export type LoaderData = LandingModeData | StoreModeData | MarketingModeData;

// ============================================================================
// HELPER: Database query with timeout
// ============================================================================
const DB_TIMEOUT_MS = 5000; // 5 seconds

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
// HELPER: Safe JSON parse with fallback
// ============================================================================
function safeJsonParse<T>(
  value: string | null | undefined,
  fallback: T
): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn('[safeJsonParse] Failed to parse JSON, using fallback');
    return fallback;
  }
}

// ============================================================================
// LOADER - Mode-based data fetching with defensive programming
// ============================================================================
export async function loader({ context, request }: LoaderFunctionArgs): Promise<Response> {
  let { storeId, store } = context;
  const { cloudflare } = context;
  
  // Get request info for debugging
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname;
  
  console.log(`[LOADER] ============================================`);
  console.log(`[LOADER] Request URL: ${request.url}`);
  console.log(`[LOADER] Hostname: ${hostname}`);
  console.log(`[LOADER] Context storeId: ${storeId ?? 'undefined'}`);
  console.log(`[LOADER] Context store: ${store ? `Found (ID: ${(store as { id: number }).id})` : 'undefined'}`);
  console.log(`[LOADER] Cloudflare bindings available: ${!!cloudflare}`);
  console.log(`[LOADER] DB binding available: ${!!cloudflare?.env?.DB}`);
  
  // Validate cloudflare context exists
  if (!cloudflare?.env?.DB) {
    console.error('[LOADER] Database connection not available');
    console.error('[LOADER] cloudflare object:', JSON.stringify(cloudflare, null, 2));
    throw new Response(JSON.stringify({
      error: 'Service temporarily unavailable',
      message: 'Database connection not available',
      debug: {
        hostname,
        hasCloudflare: !!cloudflare,
        hasEnv: !!cloudflare?.env,
        hasDB: !!cloudflare?.env?.DB,
      }
    }), { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const db = drizzle(cloudflare.env.DB);
  
  // ========== MAIN DOMAIN CHECK - Show Marketing Page ==========
  const url = new URL(request.url);
  const host = url.hostname;
  
  // List of domains that should show the marketing page
  const mainDomains = [
    'localhost',
    '127.0.0.1',
    'multi-store-saas.pages.dev',
    'digitalcare.site',
    'www.digitalcare.site',
  ];
  
  // Check if this is a main domain (should show marketing page)
  const isMainDomain = mainDomains.includes(host) || 
    (host.endsWith('.pages.dev') && host.split('.').length <= 3);
  
  // If it's a main domain AND no store was resolved, show marketing page
  if (isMainDomain && (!store || storeId === 0)) {
    // Return marketing page data
    return json({ mode: 'marketing' } as MarketingModeData);
  }
  
  // ========== STORE RESOLUTION ==========
  try {
    // Fallback: If no store matched from tenant middleware, get first active store
    if (!store || storeId === 0) {
      const fallbackStoreQuery = db
        .select()
        .from(stores)
        .where(eq(stores.isActive, true))
        .limit(1);
      
      const fallbackStore = await withTimeout(
        fallbackStoreQuery,
        DB_TIMEOUT_MS,
        'Database query timed out while fetching store'
      );
      
      if (fallbackStore.length > 0) {
        store = fallbackStore[0] as Store;
        storeId = fallbackStore[0].id;
      } else {
        // No stores - show marketing page
        return json({ mode: 'marketing' } as MarketingModeData);
      }
    }
  } catch (error) {
    // Re-throw Response errors (404, etc.)
    if (error instanceof Response) {
      throw error;
    }
    
    // Handle timeout and other database errors
    console.error('[loader] Store resolution failed:', error);
    throw new Response('Unable to load store. Please try again later.', { 
      status: 500,
      statusText: 'Internal Server Error'
    });
  }

  // At this point, store is guaranteed to exist
  // TypeScript assertion for safety
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }
  
  const validatedStore = store as Store;
  const validatedStoreId = storeId as number;
  
  const storeUrl = new URL(request.url);
  const category = storeUrl.searchParams.get('category');
  
  // Determine store mode with safe fallback
  const dbMode = (validatedStore as Store & { mode?: 'landing' | 'store' }).mode || 'store';
  const planType = (validatedStore.planType as PlanType) || 'free';
  
  // ========================================================================
  // HYBRID MODE ENFORCEMENT - Free users CANNOT access store mode
  // ========================================================================
  // Free tier users are forced to landing mode regardless of DB setting.
  // When they upgrade, the system simply stops forcing landing mode,
  // instantly unlocking their chosen layout without data migration.
  const storeMode = canUseStoreMode(planType) ? dbMode : 'landing';
  
  // ========== LANDING MODE ==========
  if (storeMode === 'landing') {
    try {
      const featuredProductId = (validatedStore as Store & { featuredProductId?: number }).featuredProductId;
      
      let featuredProduct: Product | null = null;
      
      if (featuredProductId) {
        const featuredQuery = db
          .select()
          .from(products)
          .where(
            and(
              eq(products.id, featuredProductId),
              eq(products.storeId, validatedStoreId),
              eq(products.isPublished, true)
            )
          )
          .limit(1);
        
        const result = await withTimeout(
          featuredQuery,
          DB_TIMEOUT_MS,
          'Database query timed out while fetching featured product'
        );
        featuredProduct = result[0] ?? null;
      }
      
      // Fallback: Get first published product if no featured product
      if (!featuredProduct) {
        const fallbackQuery = db
          .select()
          .from(products)
          .where(
            and(
              eq(products.storeId, validatedStoreId),
              eq(products.isPublished, true)
            )
          )
          .limit(1);
        
        const fallback = await withTimeout(
          fallbackQuery,
          DB_TIMEOUT_MS,
          'Database query timed out while fetching fallback product'
        );
        featuredProduct = fallback[0] ?? null;
      }
      
      // Parse landing config with safe fallback
      const landingConfigRaw = (validatedStore as Store & { landingConfig?: string }).landingConfig;
      const landingConfig = parseLandingConfig(landingConfigRaw) ?? defaultLandingConfig;
      
      const landingData: LandingModeData = {
        mode: 'landing',
        storeId: validatedStoreId,
        storeName: validatedStore.name ?? 'Store',
        currency: validatedStore.currency ?? 'USD',
        featuredProduct,
        landingConfig,
        // Explicitly null for landing mode
        products: null,
        categories: null,
        currentCategory: null,
        themeConfig: null,
        logo: null,
        favicon: null,
        fontFamily: null,
        theme: null,
        socialLinks: null,
        footerConfig: null,
        businessInfo: null,
      };
      
      return json(landingData);
      
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error('[loader] Landing mode data fetch failed:', error);
      throw new Response('Unable to load store content. Please try again.', { 
        status: 500,
        statusText: 'Internal Server Error'
      });
    }
  }
  
  // ========== FULL STORE MODE ==========
  try {
    // Fetch products with optional category filter
    const productsQuery = db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, validatedStoreId),
          eq(products.isPublished, true),
          category ? eq(products.category, category) : undefined
        )
      )
      .limit(50);
    
    const storeProducts = await withTimeout(
      productsQuery,
      DB_TIMEOUT_MS,
      'Database query timed out while fetching products'
    );
    
    // Get unique categories
    const categoriesQuery = db
      .select({ category: products.category })
      .from(products)
      .where(
        and(
          eq(products.storeId, validatedStoreId),
          eq(products.isPublished, true)
        )
      );
    
    const allProducts = await withTimeout(
      categoriesQuery,
      DB_TIMEOUT_MS,
      'Database query timed out while fetching categories'
    );
    
    const categories = [...new Set(
      allProducts
        .map(p => p.category)
        .filter((c): c is string => Boolean(c))
    )];
    
    // Parse configs with safe fallbacks
    const themeConfigRaw = (validatedStore as Store & { themeConfig?: string }).themeConfig;
    const themeConfig = parseThemeConfig(themeConfigRaw);
    
    const socialLinks = parseSocialLinks(validatedStore.socialLinks as string | null);
    const footerConfig = parseFooterConfig(validatedStore.footerConfig as string | null);
    
    // Safe JSON parse for businessInfo
    const businessInfo = safeJsonParse<Record<string, unknown> | null>(
      validatedStore.businessInfo as string | undefined,
      null
    );
    
    const storeData: StoreModeData = {
      mode: 'store',
      storeId: validatedStoreId,
      storeName: validatedStore.name ?? 'Store',
      logo: validatedStore.logo ?? null,
      favicon: validatedStore.favicon ?? null,
      fontFamily: validatedStore.fontFamily ?? 'inter',
      currency: validatedStore.currency ?? 'USD',
      theme: validatedStore.theme ?? 'default',
      products: storeProducts,
      categories,
      currentCategory: category,
      themeConfig,
      socialLinks,
      footerConfig,
      businessInfo,
      // Explicitly null for store mode
      featuredProduct: null,
      landingConfig: null,
    };
    
    return json(storeData);
    
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('[loader] Store mode data fetch failed:', error);
    throw new Response('Unable to load store content. Please try again.', { 
      status: 500,
      statusText: 'Internal Server Error'
    });
  }
}

// ============================================================================
// COMPONENT - Conditional rendering based on mode
// ============================================================================
export default function Index() {
  const data = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  
  // Check for edit mode via URL param (for merchant editing)
  const isEditMode = searchParams.get('edit') === 'true';

  // ========== MARKETING MODE ==========
  if (data.mode === 'marketing') {
    return <MarketingLanding />;
  }

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
    
    // Dynamic template selection from registry
    const templateId = data.landingConfig?.templateId || DEFAULT_TEMPLATE_ID;
    const { component: TemplateComponent } = getTemplate(templateId);
    
    return (
      <TemplateComponent
        storeName={data.storeName}
        storeId={data.storeId}
        product={data.featuredProduct}
        config={data.landingConfig as LandingConfig}
        currency={data.currency}
        isEditMode={isEditMode}
      />
    );
  }

  // ========== FULL STORE MODE ==========
  // Dynamic template selection from registry
  const storeTemplateId = (data.themeConfig as ThemeConfig | null)?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const { component: StoreTemplateComponent } = getStoreTemplate(storeTemplateId);
  
  return (
    <StoreTemplateComponent
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
  
  // Get current URL for debugging
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'SSR';
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'SSR';
  const timestamp = new Date().toISOString();
  
  // Extract error details for display
  let errorMessage = 'An unexpected error occurred.';
  let errorStatus = 500;
  let errorStatusText = 'Internal Server Error';
  let errorData: unknown = null;
  
  if (isRouteErrorResponse(error)) {
    errorMessage = typeof error.data === 'string' ? error.data : error.statusText;
    errorStatus = error.status;
    errorStatusText = error.statusText;
    errorData = error.data;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  // Log error to console for debugging
  console.error('[ErrorBoundary] Store Error:', {
    status: errorStatus,
    statusText: errorStatusText,
    message: errorMessage,
    url: currentUrl,
    hostname: currentHostname,
    timestamp,
    error,
  });
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Unable to Load Store
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-2">
          {errorMessage}
        </p>
        
        {/* Error Code Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full mb-6">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-red-700">
            {errorStatus} {errorStatusText}
          </span>
        </div>
        
        {/* Quick Debug Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg text-left">
          <p className="text-xs text-gray-500 font-mono">
            <strong>Host:</strong> {currentHostname}<br />
            <strong>Time:</strong> {timestamp}
          </p>
        </div>
        
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
        
        {/* Full Technical Details - Always visible for debugging */}
        <details className="mt-6 text-left" open>
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            ▶ Technical Details (Debug Info)
          </summary>
          <div className="mt-3 space-y-3">
            {/* Request Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">Request Info</p>
              <pre className="text-xs font-mono text-blue-700 whitespace-pre-wrap break-all">
URL: {currentUrl}
Host: {currentHostname}
Timestamp: {timestamp}
              </pre>
            </div>
            
            {/* Error Details */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-semibold text-red-800 mb-1">Error Details</p>
              <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap break-all">
Status: {errorStatus}
StatusText: {errorStatusText}
Message: {errorMessage}
              </pre>
            </div>
            
            {/* Raw Error Data */}
            {errorData && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-800 mb-1">Response Data</p>
                <pre className="text-xs font-mono text-amber-700 whitespace-pre-wrap break-all max-h-40 overflow-auto">
{typeof errorData === 'string' ? errorData : JSON.stringify(errorData, null, 2)}
                </pre>
              </div>
            )}
            
            {/* Stack Trace for JS errors */}
            {error instanceof Error && error.stack && (
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-xs font-semibold text-gray-800 mb-1">Stack Trace</p>
                <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-all max-h-40 overflow-auto">
{error.stack}
                </pre>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

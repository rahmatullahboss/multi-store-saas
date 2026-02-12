/**
 * Store Homepage Route - MVP Simple Theme System
 *
 * Uses the old React Component System (legacy templates)
 * instead of Shopify OS 2.0 section-based system.
 *
 * Each template provides a main component for the homepage.
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
  type HeadersFunction,
  redirect,
} from '@remix-run/cloudflare';

export async function action() {
  // Gracefully handle accidental POST requests to root by refreshing
  // This prevents 405 Method Not Allowed errors if a form submission redirects here
  // or if a link is somehow treated as a submit
  return null;
}
import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  useSearchParams,
} from '@remix-run/react';
import { useState, useEffect, Suspense, lazy, type ComponentType } from 'react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, collections, type Product, type Store } from '@db/schema';
import { type LandingConfig, type ThemeConfig } from '@db/types';
import type { LeadGenSettingsWithTheme } from '~/config/lead-gen-theme-settings';
// NOTE: Avoid static import of landing template registry to keep storefront bundle lean.
const DEFAULT_LANDING_TEMPLATE_ID = 'premium-bd';
import { useTranslation } from '~/contexts/LanguageContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTrackVisit } from '~/hooks/use-track-visit';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplate,
  getStoreTemplateTheme,
  DEFAULT_STORE_TEMPLATE_ID,
  type SerializedProduct,
} from '~/templates/store-registry';
import { getMVPSettings } from '~/services/mvp-settings.server';
import { parseSocialLinks, parseFooterConfig } from '@db/types';
// import { createDb } from '~/lib/db.server';

// ============================================================================
// AGGRESSIVE CDN CACHING HEADERS
// ============================================================================
export const headers: HeadersFunction = () => ({
  // Browser: 1 minute, CDN: 1 hour, Stale: 24 hours
  'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
  // Vary by host for multi-tenant caching
  Vary: 'Host',
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
      { title: 'Ozzyl - Launch Your Online Store in 5 Minutes' },
      {
        name: 'description',
        content:
          'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
      },
      {
        property: 'og:image',
        content: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/brand/og-image.jpg',
      },
      {
        name: 'twitter:image',
        content: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/brand/og-image.jpg',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
    ];
  }

  // Landing mode - use SEO fields from landingConfig
  if (loaderData.mode === 'landing' && loaderData.landingConfig) {
    const seo = loaderData.landingConfig as {
      seoTitle?: string;
      seoDescription?: string;
      ogImage?: string;
    };
    const title = seo.seoTitle || loaderData.storeName || 'Store';
    const description =
      seo.seoDescription ||
      (loaderData.featuredProduct
        ? `Get ${loaderData.featuredProduct.title} - ${loaderData.landingConfig?.headline || ''}`
        : '');
    const ogImage = seo.ogImage || loaderData.featuredProduct?.imageUrl || '';

    return [
      { title },
      { name: 'description', content: description },
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
    ];
  }

  // Store mode - basic SEO
  if (loaderData.mode === 'store') {
    const seo = loaderData.themeConfig?.seo as
      | { metaTitle?: string; seoTitle?: string; metaDescription?: string; seoDescription?: string }
      | undefined;
    const title = seo?.metaTitle || seo?.seoTitle || loaderData.storeName || 'Store';
    const description =
      seo?.metaDescription ||
      seo?.seoDescription ||
      `Shop the best products at ${loaderData.storeName}`;

    return [
      { title },
      { name: 'description', content: description },
    ];
  }

  return [
    { title: loaderData.storeName || 'Store' },
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
  planType: string;
}

interface StoreModeData {
  mode: 'store';
  storeId: number;
  storeName: string;
  logo: string | null;
  favicon: string | null;
  fontFamily: string;
  currency: string;
  storeTemplateId: string;
  theme: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    cardBg: string;
    headerBg: string;
    footerBg: string;
    footerText: string;
  };
  products: SerializedProduct[];
  categories: string[];
  currentCategory: string | null;
  socialLinks: ReturnType<typeof parseSocialLinks>;
  footerConfig: ReturnType<typeof parseFooterConfig>;
  businessInfo: { phone?: string; email?: string; address?: string } | null;
  themeConfig: ThemeConfig | null;
  planType: string;
  // AI Props
  aiCredits: number;
  isCustomerAiEnabled: boolean;
  // Explicitly null for this mode
  featuredProduct: null;
  landingConfig: null;
}

interface MarketingModeData {
  mode: 'marketing';
}

interface LeadGenModeData {
  mode: 'lead_gen';
  storeId: number;
  storeName: string;
  themeId: string;
  settings: LeadGenSettingsWithTheme;
}

export type LoaderData = LandingModeData | StoreModeData | MarketingModeData | LeadGenModeData;

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
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ]);
}

/**
 * Safely parse JSON string, returning empty object on failure
 */
function parseJsonSafe<T = Record<string, unknown>>(json: string | null | undefined): T {
  if (!json) return {} as T;
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch {
    return {} as T;
  }
}

/**
 * Storefront safety net:
 * If a store has products but their saved homepage sections accidentally omit any product listing,
 * we inject a minimal product grid section at runtime to avoid a "blank store" experience.
 *
 * This does NOT persist to DB; it only affects rendering.
 */
function ensureHomepageHasCatalogSection(themeConfig: ThemeConfig | null | undefined, hasProducts: boolean) {
  if (!themeConfig || !hasProducts) return themeConfig || null;

  const sections = Array.isArray(themeConfig.sections) ? themeConfig.sections : null;
  if (!sections || sections.length === 0) return themeConfig;

  const hasCatalog = sections.some(
    (s: any) => s?.type === 'product-grid' || s?.type === 'product-scroll'
  );
  if (hasCatalog) return themeConfig;

  return {
    ...themeConfig,
    sections: [
      ...sections,
      {
        id: 'auto-products-1',
        type: 'product-grid',
        settings: {
          heading: 'Products',
          productCount: 8,
          paddingTop: 'large',
          paddingBottom: 'large',
        },
      },
    ],
  } as ThemeConfig;
}

// ============================================================================
// LOADER - Mode-based data fetching with defensive programming
// ============================================================================
export async function loader({ context, request }: LoaderFunctionArgs): Promise<Response> {
  let { storeId, store } = context;
  const { cloudflare } = context;

  // Validate cloudflare context exists
  if (!cloudflare?.env?.DB) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    console.error('[LOADER] Database connection not available');
    throw new Response(
      JSON.stringify({
        error: 'Service temporarily unavailable',
        message: 'Database connection not available',
        debug: {
          hostname,
          hasCloudflare: !!cloudflare,
          hasEnv: !!cloudflare?.env,
          hasDB: !!cloudflare?.env?.DB,
        },
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const db = drizzle(cloudflare.env.DB);

  // ========== MAIN DOMAIN CHECK - Show Marketing Page ==========
  const url = new URL(request.url);
  const host = url.hostname;

  // List of domains that should show the marketing page
  const mainDomains = [
    'localhost',
    '127.0.0.1',
    'multi-store-saas.ozzyl.workers.dev',
    'ozzyl.com',
    'www.ozzyl.com',
    'app.ozzyl.com',
  ];

  // Check if this is a main domain (should show marketing page)
  const isMainDomain =
    mainDomains.includes(host) || (host.endsWith('.workers.dev') && host.split('.').length <= 3);

  // If it's a main domain AND no store was resolved, show marketing page
  if (isMainDomain && (!store || storeId === 0)) {
    // Localhost dev OR app.ozzyl.com: Redirect to /app (Login/Dashboard)
    if (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === 'app.ozzyl.com'
    ) {
      throw redirect('/app', 302);
    }
    // Return marketing page data
    return json({ mode: 'marketing' } as MarketingModeData);
  }

  // ========== STORE RESOLUTION ==========
  try {
    // Fallback: If no store matched from tenant middleware, get first active store
    if (!store || storeId === 0) {
      const fallbackStoreQuery = db.select().from(stores).where(eq(stores.isActive, true)).limit(1);

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
      statusText: 'Internal Server Error',
    });
  }

  // At this point, store is guaranteed to exist
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  const validatedStore = store as Store;
  const validatedStoreId = storeId as number;

  const storeUrl = new URL(request.url);
  const category = storeUrl.searchParams.get('category');

  // ========================================================================
  // HYBRID MODE - homeEntry based resolution
  // ========================================================================
  const homeEntry = (validatedStore as Store & { homeEntry?: string }).homeEntry || 'store_home';

  // Check if this is a lead generation site (NEW)
  const leadGenConfig = parseJsonSafe<{ enabled?: boolean; themeId?: string }>(
    (validatedStore as Store & { leadGenConfig?: string | null }).leadGenConfig || null
  );
  const isLeadGenSite = homeEntry === 'lead_gen' || leadGenConfig.enabled === true;

  // Check if homepage should show a page (builder or grapes)
  const isPageHome = homeEntry.startsWith('page:');

  // ========== LEAD GEN SITE (NEW) ==========
  if (isLeadGenSite) {
    try {
      // Import lead gen modules
      const { getLeadGenSettings } = await import('~/services/lead-gen-settings.server');
      
      // Get theme ID from config
      let themeId = 'professional-services';
      if ((validatedStore as Store & { leadGenConfig?: string | null }).leadGenConfig) {
        try {
          const config = JSON.parse(
            (validatedStore as Store & { leadGenConfig?: string | null }).leadGenConfig || '{}'
          );
          themeId = config.themeId || 'professional-services';
        } catch (e) {
          console.error('Failed to parse leadGenConfig:', e);
        }
      }

      // Get lead gen settings
      const leadGenSettings = await getLeadGenSettings(db, validatedStoreId, themeId);

      // Return lead gen mode data
      return json({
        mode: 'lead_gen',
        storeId: validatedStoreId,
        storeName: validatedStore.name,
        themeId,
        settings: leadGenSettings,
      });
    } catch (error) {
      console.error('[LOADER] Lead gen mode error:', error);
      // Fall through to store mode on error
    }
  }

  // ========== PAGE AS HOMEPAGE (Builder v2 or GrapesJS) ==========
  if (isPageHome) {
    try {
      // homeEntry format: 'page:{id}' (builder) or 'page:grapes:{id}' (GrapesJS)
      const pageIdentifier = homeEntry.replace('page:', '');
      const isGrapesPage = pageIdentifier.startsWith('grapes:');

      if (isGrapesPage) {
        // ========== GrapesJS PAGE HOMEPAGE ==========
        const grapesId = parseInt(pageIdentifier.replace('grapes:', ''), 10);
        const { landingPages } = await import('@db/schema');

        const [grapesPage] = await db
          .select({ slug: landingPages.slug, isPublished: landingPages.isPublished })
          .from(landingPages)
          .where(and(eq(landingPages.id, grapesId), eq(landingPages.storeId, validatedStoreId)));

        if (grapesPage && grapesPage.isPublished) {
          const redirectUrl = `/p/${grapesPage.slug}`;
          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectUrl,
              'Cache-Control': 'no-cache',
            },
          });
        }

        console.warn(
          `[LOADER] GrapesJS page '${grapesId}' not found or not published, showing store catalog instead`
        );
      } else {
        // ========== BUILDER PAGE HOMEPAGE ==========
        const { builderPages } = await import('@db/schema_page_builder');

        let builderPage: { slug: string; status: string | null } | null = null;

        // Try to find by ID first (numeric), then by slug
        const isNumericId = /^\d+$/.test(pageIdentifier);

        if (isNumericId) {
          const [result] = await db
            .select({ slug: builderPages.slug, status: builderPages.status })
            .from(builderPages)
            .where(
              and(eq(builderPages.id, pageIdentifier), eq(builderPages.storeId, validatedStoreId))
            );
          builderPage = result || null;
        } else {
          const [result] = await db
            .select({ slug: builderPages.slug, status: builderPages.status })
            .from(builderPages)
            .where(
              and(eq(builderPages.slug, pageIdentifier), eq(builderPages.storeId, validatedStoreId))
            );
          builderPage = result || null;
        }

        if (builderPage && builderPage.status === 'published') {
          const redirectUrl = `/p/${builderPage.slug}`;
          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectUrl,
              'Cache-Control': 'no-cache',
            },
          });
        }

        console.warn(
          `[LOADER] Builder page '${pageIdentifier}' not found or not published, showing store catalog instead`
        );
      }
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error('[loader] Page lookup failed:', error);
      // Fall through to store mode on error
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

    // ========== MVP TEMPLATE RESOLUTION ==========
    // Get theme ID from store themeConfig
    const storeThemeConfig = parseJsonSafe<ThemeConfig>(validatedStore.themeConfig);
    const storeTemplateId = storeThemeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;

    // Fetch category data from collections first (includes image_url).
    const collectionsQuery = db
      .select({
        id: collections.id,
        title: collections.title,
        slug: collections.slug,
        imageUrl: collections.imageUrl,
        sortOrder: collections.sortOrder,
      })
      .from(collections)
      .where(and(eq(collections.storeId, validatedStoreId), eq(collections.isActive, true)));

    const storeCollections = await withTimeout(
      collectionsQuery,
      DB_TIMEOUT_MS,
      'Database query timed out while fetching collections'
    );

    const sortedCollections = [...storeCollections]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const collectionCategories = sortedCollections
      .map((c) => c.title)
      .filter((title): title is string => Boolean(title));

    const categoryImageMap = Object.fromEntries(
      sortedCollections
        .filter((c) => Boolean(c.imageUrl))
        .map((c) => [c.title, c.imageUrl as string])
    );

    // Fallback: derive categories from products when collections are not configured.
    const categoriesQuery = db
      .select({ category: products.category })
      .from(products)
      .where(and(eq(products.storeId, validatedStoreId), eq(products.isPublished, true)));

    const allProducts = await withTimeout(
      categoriesQuery,
      DB_TIMEOUT_MS,
      'Database query timed out while fetching categories'
    );

    const productCategories = [
      ...new Set(allProducts.map((p) => p.category).filter((c): c is string => Boolean(c))),
    ];

    const categories = collectionCategories.length > 0 ? collectionCategories : productCategories;

    // Get base theme colors from registry
    const baseTheme = getStoreTemplateTheme(storeTemplateId);

    // Get MVP settings for theme colors
    const mvpSettings = await getMVPSettings(db, validatedStoreId, storeTemplateId);

    // Merge MVP colors with template theme
    const mergedTheme = {
      ...baseTheme,
      primary: mvpSettings.primaryColor || baseTheme.primary,
      accent: mvpSettings.accentColor || baseTheme.accent,
    };

    // Parse social links, footer config, business info
    const socialLinks = parseSocialLinks(validatedStore.socialLinks as string | null);
    const footerConfig = parseFooterConfig(validatedStore.footerConfig as string | null);
    const businessInfo = parseJsonSafe<{ phone?: string; email?: string; address?: string }>(
      validatedStore.businessInfo as string | null
    );

    // Serialize products for template
    const serializedProducts: SerializedProduct[] = storeProducts.map((p) => ({
      id: p.id,
      storeId: p.storeId,
      title: p.title,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      imageUrl: p.imageUrl,
      images: p.images,
      inventory: p.inventory,
      category: p.category,
    }));

    const storeData: StoreModeData = {
      mode: 'store',
      storeId: validatedStoreId,
      storeName: validatedStore.name || mvpSettings.storeName || 'Store',
      logo: mvpSettings.logo || validatedStore.logo || null,
      favicon: validatedStore.favicon || null,
      fontFamily: validatedStore.fontFamily || 'inter',
      currency: validatedStore.currency || 'BDT',
      storeTemplateId,
      theme: mergedTheme,
      products: serializedProducts,
      categories,
      currentCategory: category,
      socialLinks,
      footerConfig,
      businessInfo,
      themeConfig: {
        ...(ensureHomepageHasCatalogSection(storeThemeConfig, serializedProducts.length > 0) || {}),
        categoryImageMap,
      } as ThemeConfig,
      planType: validatedStore.planType || 'free',
      // AI Props
      aiCredits: (validatedStore as Store & { aiCredits?: number }).aiCredits ?? 0,
      isCustomerAiEnabled: (validatedStore as Store & { isCustomerAiEnabled?: boolean }).isCustomerAiEnabled ?? false,
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
      statusText: 'Internal Server Error',
    });
  }
}

// ============================================================================
// COMPONENT - Conditional rendering based on mode
// ============================================================================
export default function Index() {
  // Translation hook for reactive i18n
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  const previewTemplateId = searchParams.get('preview_template');
  const landingTemplateId =
    data.mode === 'landing'
      ? data.landingConfig?.templateId || DEFAULT_LANDING_TEMPLATE_ID
      : DEFAULT_LANDING_TEMPLATE_ID;
  const [LandingTemplateComponent, setLandingTemplateComponent] =
    useState<ComponentType<any> | null>(null);
  const [PreviewTemplateComponent, setPreviewTemplateComponent] =
    useState<ComponentType<any> | null>(null);

  // Check for edit mode via URL param (for merchant editing)
  const isEditMode = searchParams.get('edit') === 'true';

  // Track visitor (only for store pages)
  useTrackVisit(data.mode !== 'marketing' ? data.storeId : undefined);

  // Lazy-load landing templates only when landing mode is active.
  useEffect(() => {
    if (data.mode !== 'landing') return;
    let isActive = true;

    import('~/templates/registry')
      .then(({ getTemplate }) => {
        if (!isActive) return;
        const { component } = getTemplate(landingTemplateId);
        setLandingTemplateComponent(() => component);
      })
      .catch((error) => {
        console.error('[landing-template] Failed to load:', error);
      });

    return () => {
      isActive = false;
    };
  }, [data.mode, landingTemplateId]);

  useEffect(() => {
    if (data.mode !== 'landing') return;
    if (!previewTemplateId) {
      setPreviewTemplateComponent(null);
      return;
    }

    let isActive = true;

    import('~/templates/registry')
      .then(({ getTemplate }) => {
        if (!isActive) return;
        const { component } = getTemplate(previewTemplateId);
        setPreviewTemplateComponent(() => component);
      })
      .catch((error) => {
        console.error('[landing-template-preview] Failed to load:', error);
      });

    return () => {
      isActive = false;
    };
  }, [data.mode, previewTemplateId]);

  // Helper for type narrowing
  // const storeData = data.mode === 'store' ? data : undefined;

  // ============================================================================
  // RENDERING LOGIC - EARLY RETURNS BELOW HERE
  // ============================================================================

  // ========== LEAD GEN MODE (NEW) ==========
  if (data.mode === 'lead_gen') {
    const LeadGenRenderer = lazy(() => import('~/components/lead-gen/LeadGenRenderer'));
    
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>}>
        <LeadGenRenderer
          themeId={data.themeId}
          settings={data.settings}
          storeId={data.storeId}
          storeName={data.storeName}
        />
      </Suspense>
    );
  }

  // ========== MARKETING MODE (REDIRECT TO LANDING) ==========
  if (data.mode === 'marketing') {
    // Check if we are physically on ozzyl.com
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'ozzyl.com' &&
      window.location.hostname !== 'www.ozzyl.com' &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('workers.dev')
    ) {
      // This effectively redirects other domains that accidentally got here
      window.location.href = 'https://ozzyl.com';
      return null;
    }
    // Render nothing or marketing content if this route is responsible for it
    return null;
  }

  // ========== LANDING MODE ==========
  if (data.mode === 'landing') {
    // Check for template preview mode
    if (previewTemplateId) {
      // Template Preview Mode - Show demo content with the selected template
      const demoProduct = {
        id: 0,
        storeId: data.storeId,
        title: 'ডেমো প্রোডাক্ট - Premium Quality Product',
        description:
          'এটি একটি ডেমো প্রোডাক্ট যা টেমপ্লেট প্রিভিউয়ের জন্য দেখানো হচ্ছে। আপনার আসল প্রোডাক্ট এখানে দেখাবে।',
        price: 1999,
        compareAtPrice: 2999,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
        ]),
        inventory: 50,
        isPublished: true,
      };

      const demoConfig = {
        templateId: previewTemplateId,
        headline: '🔥 আমাদের বেস্ট সেলিং প্রোডাক্ট পান সেরা দামে!',
        subheadline: 'সীমিত সময়ের জন্য বিশেষ ছাড় - আজই অর্ডার করুন',
        ctaText: 'এখনই অর্ডার করুন',
        ctaSubtext: '৭ দিনের মানি ব্যাক গ্যারান্টি',
        urgencyText: '⚡ মাত্র ২৪ ঘণ্টার জন্য ৫০% ছাড়!',
        guaranteeText: '১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

        features: [
          {
            icon: '✅',
            title: 'প্রিমিয়াম কোয়ালিটি',
            description: 'সেরা মানের উপাদান দিয়ে তৈরি',
          },
          { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ কার্যদিবসের মধ্যে ডেলিভারি' },
          {
            icon: '💯',
            title: 'সন্তুষ্টির গ্যারান্টি',
            description: 'পছন্দ না হলে সম্পূর্ণ টাকা ফেরত',
          },
          { icon: '🔒', title: 'নিরাপদ পেমেন্ট', description: 'আপনার পেমেন্ট ১০০% নিরাপদ' },
        ],

        galleryImages: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
        ],

        benefits: [
          { icon: '💪', title: 'দীর্ঘস্থায়ী', description: 'বছরের পর বছর ব্যবহার করতে পারবেন' },
          { icon: '🎨', title: 'স্টাইলিশ ডিজাইন', description: 'আধুনিক ও আকর্ষণীয় ডিজাইন' },
          {
            icon: '🛡️',
            title: '১ বছর ওয়ারেন্টি',
            description: 'কোন সমস্যা হলে বিনামূল্যে মেরামত',
          },
          { icon: '📦', title: 'ফ্রি প্যাকেজিং', description: 'সুন্দর গিফট বক্সে প্যাক করা' },
        ],

        comparison: {
          beforeImage:
            'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=300&fit=crop',
          afterImage:
            'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop',
          beforeLabel: 'সাধারণ প্রোডাক্ট',
          afterLabel: 'আমাদের প্রোডাক্ট',
          description: 'দেখুন পার্থক্য - আমাদের প্রোডাক্ট কতটা ভালো!',
        },

        testimonials: [
          {
            name: 'রহিম উদ্দিন',
            imageUrl:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
            text: 'অসাধারণ প্রোডাক্ট! ৫ স্টার রেটিং দিলাম।',
          },
          {
            name: 'সাবিনা আক্তার',
            imageUrl:
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
            text: 'দারুণ কোয়ালিটি, দাম অনুযায়ী সেরা।',
          },
          {
            name: 'করিম সাহেব',
            imageUrl:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
            text: 'দ্রুত ডেলিভারি পেয়েছি, খুব খুশি।',
          },
        ],

        socialProof: { count: 5000, text: 'জন সন্তুষ্ট গ্রাহক' },

        faq: [
          {
            question: 'ডেলিভারি কতদিনে পাব?',
            answer: 'অর্ডার করার ২-৩ কার্যদিবসের মধ্যে ডেলিভারি পাবেন। ঢাকায় ২৪ ঘণ্টায় ডেলিভারি।',
          },
          {
            question: 'পেমেন্ট কিভাবে করব?',
            answer: 'ক্যাশ অন ডেলিভারি বা অনলাইন পেমেন্ট (বিকাশ/নগদ) দুটোই গ্রহণযোগ্য।',
          },
          {
            question: 'রিটার্ন পলিসি কি?',
            answer: 'পণ্য পছন্দ না হলে ৭ দিনের মধ্যে রিটার্ন করতে পারবেন। সম্পূর্ণ টাকা ফেরত।',
          },
          {
            question: 'ওয়ারেন্টি আছে?',
            answer: 'হ্যাঁ, ১ বছরের ম্যানুফ্যাকচারিং ওয়ারেন্টি আছে।',
          },
        ],

        countdownEnabled: true,
        countdownEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        showStockCounter: true,
        lowStockThreshold: 10,
        whatsappEnabled: true,
        whatsappNumber: '01700000000',
        whatsappMessage: 'হাই, আমি এই প্রোডাক্ট সম্পর্কে জানতে চাই',
        sectionOrder: [
          'hero',
          'trust',
          'features',
          'gallery',
          'video',
          'benefits',
          'comparison',
          'testimonials',
          'social',
          'delivery',
          'faq',
          'guarantee',
          'cta',
        ],
        hiddenSections: [],
        primaryColor: '#10b981',
        accentColor: '#f59e0b',
        orderFormVariant: 'full-width' as const,
      };

      return (
        <div className="relative">
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-1.5 text-center shadow-md">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs">👁️</span>
              <span className="font-medium text-xs">{t('templatePreviewMode')}</span>
              <span className="text-white/60 text-xs hidden sm:inline">|</span>
              <span className="hidden sm:inline text-xs text-white/80">
                {t('templatePreviewDesc')}
              </span>
              <button
                onClick={() => window.close()}
                className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition"
              >
                {t('close')} ✕
              </button>
            </div>
          </div>
          <div className="pt-8">
            {PreviewTemplateComponent ? (
              <PreviewTemplateComponent
                storeName={data.storeName}
                storeId={data.storeId}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                product={demoProduct as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                config={demoConfig as any}
                currency={data.currency}
                isPreview={true}
              />
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading template preview...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!data.featuredProduct) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{t('comingSoon')}</h1>
            <p className="text-gray-400">{t('storeUnderConstruction')}</p>
          </div>
        </div>
      );
    }

    if (!LandingTemplateComponent) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading landing template...</p>
          </div>
        </div>
      );
    }

    return (
      <LandingTemplateComponent
        storeName={data.storeName}
        storeId={data.storeId}
        product={data.featuredProduct}
        config={data.landingConfig as LandingConfig}
        currency={data.currency}
        isEditMode={isEditMode}
        productVariants={data.productVariants}
        orderBumps={data.orderBumps}
        planType={data.planType}
      />
    );
  }

  // ========== STORE MODE RENDERING (MVP Simple Theme System) ==========
  if (data.mode === 'store') {
    // Get template from registry
    const template = getStoreTemplate(data.storeTemplateId);
    const TemplateComponent = template.component;

    // Generate CSS variables for MVP colors
    const cssVariables = `
      :root {
        --color-primary: ${data.theme.primary};
        --color-accent: ${data.theme.accent};
        --color-text: ${data.theme.text};
        --color-muted: ${data.theme.muted};
        --color-background: ${data.theme.background};
        --color-card-bg: ${data.theme.cardBg};
        --color-header-bg: ${data.theme.headerBg};
        --color-footer-bg: ${data.theme.footerBg};
        --color-footer-text: ${data.theme.footerText};
      }
    `;

    // Build storefront config by combining saved merchant config + runtime color overrides
    const themeConfig = {
      ...(data.themeConfig || {}),
      primaryColor: data.theme.primary,
      accentColor: data.theme.accent,
      storeTemplateId: data.storeTemplateId,
      fontFamily: data.fontFamily,
      favicon: data.favicon || undefined,
    };

    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading store...</p>
            </div>
          </div>
        }
      >
        <WishlistProvider>
          <>
            <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
            <StorePageWrapper
              storeName={data.storeName}
              storeId={data.storeId}
              logo={data.logo}
              templateId={data.storeTemplateId}
              theme={data.theme}
              currency={data.currency}
              socialLinks={data.socialLinks || undefined}
              footerConfig={data.footerConfig || undefined}
              businessInfo={data.businessInfo || undefined}
              config={themeConfig}
              planType={data.planType}
              hideHeaderFooter={true}
            >
              <TemplateComponent
                storeName={data.storeName}
                storeId={data.storeId}
                logo={data.logo}
                products={data.products}
                categories={data.categories}
                currentCategory={data.currentCategory}
                config={themeConfig}
                currency={data.currency}
                socialLinks={data.socialLinks}
                footerConfig={data.footerConfig}
                businessInfo={data.businessInfo}
                planType={data.planType}
                isPreview={false}
                aiCredits={data.aiCredits}
                isCustomerAiEnabled={data.isCustomerAiEnabled}
              />
            </StorePageWrapper>
          </>
        </WishlistProvider>
      </Suspense>
    );
  }

  return null;
}

// ============================================================================
// NESTED ERROR BOUNDARY - Isolates errors to this route only
// ============================================================================
export function ErrorBoundary() {
  const error = useRouteError();
  const [clientInfo, setClientInfo] = useState({ url: '', hostname: '' });

  // Get client-side URL info after mount to prevent hydration mismatch
  useEffect(() => {
    setClientInfo({
      url: window.location.href,
      hostname: window.location.hostname,
    });
  }, []);

  // For store not found (404), let it bubble to root for full-page treatment
  if (isRouteErrorResponse(error) && error.status === 404) {
    throw error; // Re-throw to parent ErrorBoundary
  }

  const handleReload = () => {
    window.location.reload();
  };

  const currentUrl = clientInfo.url || 'Loading...';
  const currentHostname = clientInfo.hostname || 'Loading...';
  const timestamp = new Date().toISOString();

  // Extract error details for display
  let errorMessage = 'An unexpected error occurred.';
  let errorStatus = 500;
  let errorStatusText = 'Internal Server Error';
  let errorData: string | null = null;

  if (isRouteErrorResponse(error)) {
    errorMessage = typeof error.data === 'string' ? error.data : error.statusText;
    errorStatus = error.status;
    errorStatusText = error.statusText;
    errorData = typeof error.data === 'string' ? error.data : JSON.stringify(error.data);
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Store</h2>

        {/* Message */}
        <p className="text-gray-600 mb-2">{errorMessage}</p>

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
            <strong>Host:</strong> {currentHostname}
            <br />
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

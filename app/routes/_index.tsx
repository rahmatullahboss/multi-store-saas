/**
 * Store Homepage Route - Hybrid Mode
 * 
 * Uses homeEntry field to determine what to show:
 * - 'store_home' = Full product catalog (default)
 * - 'page:{pageId}' = Redirect to a builder page
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
import { useState, useEffect, Suspense } from 'react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, type Product, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks, parseFooterConfig, type LandingConfig, type ThemeConfig, type SocialLinks, type FooterConfig } from '@db/types';
import { getTemplate, DEFAULT_TEMPLATE_ID } from '~/templates/registry';
import { getStoreTemplate, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { useTranslation } from '~/contexts/LanguageContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { MarketingLanding } from '~/components/MarketingLanding';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTrackVisit } from '~/hooks/use-track-visit';

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
      { title: 'Ozzyl - Launch Your Online Store in 5 Minutes' },
      { name: 'description', content: 'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.' },
    ];
  }
  
  // Landing mode - use SEO fields from landingConfig
  if (loaderData.mode === 'landing' && loaderData.landingConfig) {
    const seo = loaderData.landingConfig as { seoTitle?: string; seoDescription?: string; ogImage?: string };
    const title = seo.seoTitle || loaderData.storeName || 'Store';
    const description = seo.seoDescription || 
      (loaderData.featuredProduct ? `Get ${loaderData.featuredProduct.title} - ${loaderData.landingConfig?.headline || ''}` : '');
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
  const description = `Shop the best products at ${loaderData.storeName}`;
  
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
  theme: string;
  products: Product[];
  categories: string[];
  currentCategory: string | null;
  themeConfig: ThemeConfig | null;
  socialLinks: SocialLinks | null;
  footerConfig: FooterConfig | null;
  businessInfo: Record<string, unknown> | null;
  planType: string;
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
    'ozzyl-saas.pages.dev',
    'ozzyl.com',
    'www.ozzyl.com',
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
  
  // ========================================================================
  // HYBRID MODE - homeEntry based resolution
  // ========================================================================
  // All users (including free) have access to both store + landing pages
  // Limits are enforced via usage_limits (products, orders per month)
  const homeEntry = (validatedStore as Store & { homeEntry?: string }).homeEntry || 'store_home';
  
  // Check if homepage should show a page (builder or grapes)
  const isPageHome = homeEntry.startsWith('page:');
  
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
          .where(and(
            eq(landingPages.id, grapesId),
            eq(landingPages.storeId, validatedStoreId)
          ));
        
        if (grapesPage && grapesPage.isPublished) {
          const redirectUrl = `/p/${grapesPage.slug}`;
          return new Response(null, {
            status: 302,
            headers: {
              'Location': redirectUrl,
              'Cache-Control': 'no-cache',
            },
          });
        }
        
        console.warn(`[LOADER] GrapesJS page '${grapesId}' not found or not published, showing store catalog instead`);
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
            .where(and(
              eq(builderPages.id, pageIdentifier),
              eq(builderPages.storeId, validatedStoreId)
            ));
          builderPage = result || null;
        } else {
          const [result] = await db
            .select({ slug: builderPages.slug, status: builderPages.status })
            .from(builderPages)
            .where(and(
              eq(builderPages.slug, pageIdentifier),
              eq(builderPages.storeId, validatedStoreId)
            ));
          builderPage = result || null;
        }
        
        if (builderPage && builderPage.status === 'published') {
          const redirectUrl = `/p/${builderPage.slug}`;
          return new Response(null, {
            status: 302,
            headers: {
              'Location': redirectUrl,
              'Cache-Control': 'no-cache',
            },
          });
        }
        
        console.warn(`[LOADER] Builder page '${pageIdentifier}' not found or not published, showing store catalog instead`);
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
      planType: validatedStore.planType || 'free',
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
  // Translation hook for reactive i18n
  const { t, lang } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  
  // Check for edit mode via URL param (for merchant editing)
  const isEditMode = searchParams.get('edit') === 'true';

  // Track visitor (only for store pages)
  useTrackVisit(data.mode !== 'marketing' ? data.storeId : undefined);

  // ========== MARKETING MODE ==========
  if (data.mode === 'marketing') {
    return <MarketingLanding />;
  }

  // ========== LANDING MODE ==========
  if (data.mode === 'landing') {
    // Check for template preview mode
    const previewTemplateId = searchParams.get('preview_template');
    
    if (previewTemplateId) {
      // Template Preview Mode - Show demo content with the selected template
      const demoProduct = {
        id: 0,
        storeId: data.storeId,
        title: 'ডেমো প্রোডাক্ট - Premium Quality Product',
        description: 'এটি একটি ডেমো প্রোডাক্ট যা টেমপ্লেট প্রিভিউয়ের জন্য দেখানো হচ্ছে। আপনার আসল প্রোডাক্ট এখানে দেখাবে।',
        price: 1999,
        compareAtPrice: 2999,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
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
        
        // Features Section
        features: [
          { icon: '✅', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের উপাদান দিয়ে তৈরি' },
          { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ কার্যদিবসের মধ্যে ডেলিভারি' },
          { icon: '💯', title: 'সন্তুষ্টির গ্যারান্টি', description: 'পছন্দ না হলে সম্পূর্ণ টাকা ফেরত' },
          { icon: '🔒', title: 'নিরাপদ পেমেন্ট', description: 'আপনার পেমেন্ট ১০০% নিরাপদ' },
        ],
        
        // Gallery Section (NEW)
        galleryImages: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
        ],
        
        // Benefits Section (NEW)
        benefits: [
          { icon: '💪', title: 'দীর্ঘস্থায়ী', description: 'বছরের পর বছর ব্যবহার করতে পারবেন' },
          { icon: '🎨', title: 'স্টাইলিশ ডিজাইন', description: 'আধুনিক ও আকর্ষণীয় ডিজাইন' },
          { icon: '🛡️', title: '১ বছর ওয়ারেন্টি', description: 'কোন সমস্যা হলে বিনামূল্যে মেরামত' },
          { icon: '📦', title: 'ফ্রি প্যাকেজিং', description: 'সুন্দর গিফট বক্সে প্যাক করা' },
        ],
        
        // Comparison Section (NEW)
        comparison: {
          beforeImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=300&fit=crop',
          afterImage: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop',
          beforeLabel: 'সাধারণ প্রোডাক্ট',
          afterLabel: 'আমাদের প্রোডাক্ট',
          description: 'দেখুন পার্থক্য - আমাদের প্রোডাক্ট কতটা ভালো!',
        },
        
        // Testimonials Section
        testimonials: [
          { name: 'রহিম উদ্দিন', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', text: 'অসাধারণ প্রোডাক্ট! ৫ স্টার রেটিং দিলাম।' },
          { name: 'সাবিনা আক্তার', imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop', text: 'দারুণ কোয়ালিটি, দাম অনুযায়ী সেরা।' },
          { name: 'করিম সাহেব', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', text: 'দ্রুত ডেলিভারি পেয়েছি, খুব খুশি।' },
        ],
        
        // Social Proof Section (NEW)
        socialProof: {
          count: 5000,
          text: 'জন সন্তুষ্ট গ্রাহক',
        },
        
        // FAQ Section
        faq: [
          { question: 'ডেলিভারি কতদিনে পাব?', answer: 'অর্ডার করার ২-৩ কার্যদিবসের মধ্যে ডেলিভারি পাবেন। ঢাকায় ২৪ ঘণ্টায় ডেলিভারি।' },
          { question: 'পেমেন্ট কিভাবে করব?', answer: 'ক্যাশ অন ডেলিভারি বা অনলাইন পেমেন্ট (বিকাশ/নগদ) দুটোই গ্রহণযোগ্য।' },
          { question: 'রিটার্ন পলিসি কি?', answer: 'পণ্য পছন্দ না হলে ৭ দিনের মধ্যে রিটার্ন করতে পারবেন। সম্পূর্ণ টাকা ফেরত।' },
          { question: 'ওয়ারেন্টি আছে?', answer: 'হ্যাঁ, ১ বছরের ম্যানুফ্যাকচারিং ওয়ারেন্টি আছে।' },
        ],
        
        // Conversion Features
        countdownEnabled: true,
        countdownEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        showStockCounter: true,
        lowStockThreshold: 10,
        
        // WhatsApp
        whatsappEnabled: true,
        whatsappNumber: '01700000000',
        whatsappMessage: 'হাই, আমি এই প্রোডাক্ট সম্পর্কে জানতে চাই',
        
        // Section Order (including new sections)
        sectionOrder: ['hero', 'trust', 'features', 'gallery', 'video', 'benefits', 'comparison', 'testimonials', 'social', 'delivery', 'faq', 'guarantee', 'cta'],
        hiddenSections: [],
        
        // Colors
        primaryColor: '#10b981',
        accentColor: '#f59e0b',
        
        // Order Form Layout
        orderFormVariant: 'full-width' as const,
      };
      
      // Dynamic template selection from registry
      const { component: PreviewTemplateComponent } = getTemplate(previewTemplateId);
      
      return (
        <div className="relative">
          {/* Preview Banner - Ultra compact */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-1.5 text-center shadow-md">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs">👁️</span>
              <span className="font-medium text-xs">{t('templatePreviewMode')}</span>
              <span className="text-white/60 text-xs hidden sm:inline">|</span>
              <span className="hidden sm:inline text-xs text-white/80">{t('templatePreviewDesc')}</span>
              <button
                onClick={() => window.close()}
                className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition"
              >
                {t('close')} ✕
              </button>
            </div>
          </div>
          <div className="pt-8">
            <PreviewTemplateComponent
              storeName={data.storeName}
              storeId={data.storeId}
              product={demoProduct as any}
              config={demoConfig as any}
              currency={data.currency}
              isPreview={true}
            />
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
        productVariants={data.productVariants}
        orderBumps={data.orderBumps}
        planType={data.planType}
      />
    );
  }

  // ========== FULL STORE MODE ==========
  // Dynamic template selection from registry
  const storeTemplateId = (data.themeConfig as ThemeConfig | null)?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const { component: StoreTemplateComponent } = getStoreTemplate(storeTemplateId);
  
  // Suspense is required because store templates use React.lazy() for code splitting
  // WishlistProvider ensures sections that use useWishlist hook work correctly
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    }>
      <WishlistProvider>
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
          planType={data.planType}
        />
      </WishlistProvider>
    </Suspense>
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

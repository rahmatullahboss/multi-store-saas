/**
 * Unified Product & Collection Route
 *
 * Handles both /products/:id (Product Detail) AND /products/:category-slug (Collection Page)
 *
 * Logic:
 * 1. Try to parse param as ID (number)
 * 2. If valid ID -> Render Product Page
 * 3. If NaN -> Treat as Slug -> Render Collection Page
 */

import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
  type MetaDescriptor,
} from '@remix-run/cloudflare';
import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  useSearchParams,
} from '@remix-run/react';
import { eq, and, desc, ne, sql, like, asc, gte, lte, type SQL } from 'drizzle-orm';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getStoreConfig } from '~/services/store-config.server';
import { products, reviews, productVariants, productCollections } from '@db/schema';
import { type ThemeConfig, type SocialLinks, type FooterConfig } from '@db/types';
import { useEffect, useRef, useMemo, Suspense } from 'react';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplate,
  getStoreTemplateTheme,
  type SerializedProduct,
  type StoreTemplateTheme,
  type SerializedVariant,
} from '~/templates/store-registry';
import { getCustomer } from '~/services/customer-auth.server';
import { getProductDetailsMetafields } from '~/lib/product-details.server';
import { parsePriceRange } from '~/utils/price';
import {
  getUnifiedStorefrontSettings,
  getShippingConfigFromUnified,
} from '~/services/unified-storefront-settings.server';
import type { MVPSettingsWithTheme } from '~/services/mvp-settings.server';
import {
  findCategoryBySlug,
  buildUnifiedSocialLinks,
  buildMergedThemeConfig,
} from '~/utils/storefront-settings';

// ===================================
// CACHE CONFIGURATION
// ===================================
const CACHE_TTL = {
  product: 180,
  relatedProducts: 300,
  categories: 3600,
  storeConfig: 3600,
};

// ===================================
// TYPES
// ===================================

interface SerializedReview {
  id: number;
  customerName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string | number | Date | null;
}

interface SerializedCustomer {
  id: number;
  name: string | null;
  email: string | null;
}

interface BusinessInfo {
  phone?: string;
  email?: string;
  address?: string;
}

interface ProductPageData {
  pageType: 'product';
  product: SerializedProduct & {
    specifications: Record<string, string> | null;
    returnPolicy: string | null;
    variants: SerializedVariant[];
    seoTitle?: string | null;
    seoDescription?: string | null;
  };
  storeName: string;
  logo: string | null;
  favicon: string | null;
  currency: string;
  showReviews: boolean;
  reviews: SerializedReview[];
  avgRating: number;
  reviewCount: number;
  storeId: number;
  storeTemplateId: string;
  theme: StoreTemplateTheme;
  socialLinks: SocialLinks | null;
  businessInfo: BusinessInfo | null;
  footerConfig: FooterConfig | null;
  categories: string[];
  relatedProducts: SerializedProduct[];
  planType: string;
  customer: SerializedCustomer | null;
  productUrl: string;
  themeConfig: ThemeConfig | null;
  storeShippingInfo: string | null;
  storeRefundPolicy: string | null;
  isCustomerAiEnabled: boolean;
  aiCredits: number;
}

interface CollectionPageData {
  pageType: 'collection';
  storeId: number;
  storeName: string;
  logo: string | null;
  favicon: string | null;
  collectionName: string;
  currency: string;
  storeTemplateId: string;
  theme: StoreTemplateTheme;
  socialLinks: SocialLinks | null;
  businessInfo: BusinessInfo | null;
  themeConfig: ThemeConfig | null;
  mvpSettings: MVPSettingsWithTheme | null;
  collection: { title: string; description: string; slug: string };
  products: SerializedProduct[];
  categories: string[];
  sortBy: string;
  inStock: boolean;
  onSale: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  planType: string;
  customer: SerializedCustomer | null;
  isCustomerAiEnabled: boolean;
  aiCredits: number;
}

// ===================================
// META FUNCTION
// ===================================
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: 'Not Found' }];

  if (data.pageType === 'product') {
    const d = data as ProductPageData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = d.product as any;
    const title = p.seoTitle || `${d.product.title} | ${d.storeName}`;
    const description =
      p.seoDescription || (d.product.description || `Shop ${d.product.title}`).slice(0, 160);
    const url = d.productUrl || '';

    const metaTags: MetaDescriptor[] = [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'product' },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
    ];

    if (d.product.imageUrl) {
      metaTags.push({ property: 'og:image', content: d.product.imageUrl });
      metaTags.push({ name: 'twitter:image', content: d.product.imageUrl });
    }
    if (d.favicon) {
      metaTags.push({ rel: 'icon', href: d.favicon });
      metaTags.push({ rel: 'shortcut icon', href: d.favicon });
    }
    return metaTags;
  } else {
    // Collection Meta
    const d = data as CollectionPageData;
    const metaTags: MetaDescriptor[] = [
      { title: `${d.collectionName} | ${d.storeName}` },
      { name: 'description', content: `Browse ${d.collectionName} collection at ${d.storeName}` },
    ];
    if (d.favicon) {
      metaTags.push({ rel: 'icon', href: d.favicon });
      metaTags.push({ rel: 'shortcut icon', href: d.favicon });
    }
    return metaTags;
  }
};

// ===================================
// LOADER
// ===================================
export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const handle = params.handle;
  if (!handle) throw new Response('Handle required', { status: 404 });

  const isNumericHandle = /^\d+$/.test(handle);
  const productId = isNumericHandle ? parseInt(handle, 10) : NaN;

  // const startTime = Date.now();
  const db = createDb(context.cloudflare.env.DB);
  const cache = new D1Cache(db);

  // Resolve store
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });
  const { storeId, store } = storeContext;

  // Common Store Config
  const storeConfig = await getStoreConfig(db, cache, storeId);
  if (!storeConfig) throw new Response('Store configuration not found', { status: 404 });

  if (store.storeEnabled === false) throw new Response('Store is disabled', { status: 404 });

  // Get common data - use unified settings for shipping (single source of truth)
  const { footerConfig } = storeConfig;

  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Extract settings from unified canonical config
  const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const mergedTheme = {
    ...baseTheme,
    primary: unifiedSettings.theme.primary || baseTheme.primary,
    accent: unifiedSettings.theme.accent || baseTheme.accent,
  };
  const legacyCompat = {
    storeTemplateId,
    storeName: unifiedSettings.branding.storeName || store?.name || 'Store',
    logo: unifiedSettings.branding.logo || store?.logo || null,
    favicon: unifiedSettings.branding.favicon || store?.favicon || null,
    theme: mergedTheme,
    themeConfig: null, // Using mergedTheme instead - no legacy config needed
    mvpSettings: null,
  };

  const unifiedShippingConfig = getShippingConfigFromUnified(unifiedSettings);

  const socialLinks: SocialLinks = buildUnifiedSocialLinks(unifiedSettings);
  const businessInfo: BusinessInfo = {
    phone: unifiedSettings.business.phone ?? undefined,
    email: unifiedSettings.business.email ?? undefined,
    address: unifiedSettings.business.address ?? undefined,
  };
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // Guard: numeric slugs can be valid collection handles (e.g. /products/2025).
  // In that case, prefer collection view instead of forcing product lookup.
  const numericSlugCollection = isNumericHandle
    ? await db.query.collections.findFirst({
        where: (c, { eq, and }) => and(eq(c.slug, handle), eq(c.storeId, storeId)),
        columns: { id: true },
      })
    : null;
  const isProduct = isNumericHandle && !numericSlugCollection;

  // ==========================================
  // PRODUCT LOGIC
  // ==========================================
  if (isProduct) {
    // KV Cache Check
    const kv = context.cloudflare.env.PRODUCT_CACHE;
    const settingsFingerprint = [
      legacyCompat.storeTemplateId,
      legacyCompat.storeName,
      legacyCompat.theme.primary,
      legacyCompat.theme.accent,
      legacyCompat.logo ?? '',
      legacyCompat.favicon ?? '',
    ].join('|');
    const cacheKey = `product:${storeId}:${productId}:${settingsFingerprint}`;

    if (kv && !customer) {
      // Only check cache if no customer logged in (auth state varies)
      try {
        const cached = await kv.get(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          data.pageType = 'product'; // Ensure pageType is set
          return json(data, {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
            },
          });
        }
      } catch (e) {
        console.warn('KV Error', e);
      }
    }

    // Determine shipping info (use unified settings - single source of truth)
    const productDetails = await getProductDetailsMetafields(db, storeId, productId);
    const shippingInfo =
      (productDetails.shippingInfo && productDetails.shippingInfo.trim().length > 0
        ? productDetails.shippingInfo
        : store?.customShippingPolicy && store.customShippingPolicy.trim().length > 0
          ? store.customShippingPolicy
          : unifiedShippingConfig.enabled !== false
            ? `Shipping inside Dhaka: ${store?.currency || 'BDT'} ${unifiedShippingConfig.insideDhaka}. Outside Dhaka: ${store?.currency || 'BDT'} ${unifiedShippingConfig.outsideDhaka}.${unifiedShippingConfig.freeShippingAbove ? ` Free shipping above ${store?.currency || 'BDT'} ${unifiedShippingConfig.freeShippingAbove}.` : ''}`
            : null) ?? null;

    const showReviews = store?.planType !== 'free';

    // Parallel Queries
    const [productResult, reviewsResult, categoriesResult, variantsResult, relatedProductsResult] =
      await Promise.all([
        db
          .select()
          .from(products)
          .where(
            and(
              eq(products.id, productId),
              eq(products.storeId, storeId),
              eq(products.isPublished, true)
            )
          )
          .limit(1),
        showReviews
          ? db
              .select({
                id: reviews.id,
                customerName: reviews.customerName,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
              })
              .from(reviews)
              .where(
                and(
                  eq(reviews.productId, productId),
                  eq(reviews.storeId, storeId),
                  eq(reviews.status, 'approved')
                )
              )
              .orderBy(desc(reviews.createdAt))
              .limit(20)
          : Promise.resolve([]),
        db
          .selectDistinct({ category: products.category })
          .from(products)
          .where(
            and(
              eq(products.storeId, storeId),
              eq(products.isPublished, true),
              sql`${products.category} IS NOT NULL`
            )
          ),
        db
          .select()
          .from(productVariants)
          .where(
            and(eq(productVariants.productId, productId), eq(productVariants.isAvailable, true))
          )
          .orderBy(productVariants.id),
        // Related products query
        db
          .select({
            id: products.id,
            title: products.title,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            imageUrl: products.imageUrl,
            inventory: products.inventory,
            category: products.category,
            isPublished: products.isPublished,
            createdAt: products.createdAt,
            priority:
              sql<number>`CASE WHEN ${products.category} = (SELECT ${products.category} FROM ${products} WHERE ${products.id} = ${productId}) THEN 1 ELSE 0 END`.as(
                'priority'
              ),
          })
          .from(products)
          .where(
            and(
              eq(products.storeId, storeId),
              ne(products.id, productId),
              eq(products.isPublished, true)
            )
          )
          .orderBy(sql`priority DESC, ${products.createdAt} DESC`)
          .limit(8),
      ]);

    const product = productResult[0];
    if (!product) {
      // If product not found by ID, weird edge case if ID is numeric but invalid.
      // We'll throw 404 here for now, or could check if it is a category slug that happens to be a number? (Unlikely)
      throw new Response('Product not found', { status: 404 });
    }

    const categories = categoriesResult
      .map((c) => c.category)
      .filter((c): c is string => Boolean(c));
    const productReviews = reviewsResult || [];
    const avgRating =
      productReviews.length > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
        : 0;

    // Use unified theme config only
    const mergedProductThemeConfig = buildMergedThemeConfig(
      null,
      legacyCompat.storeTemplateId,
      legacyCompat.theme.primary,
      legacyCompat.theme.accent,
      {} // Using unified settings - no legacy themeConfig needed
    );
    // Add trust badges (with defaults)
    mergedProductThemeConfig.trustBadges = {
      showPaymentIcons: false,
      showGuaranteeSeals: false,
      ...unifiedSettings.trustBadges,
    };

    const responseData: ProductPageData = {
      pageType: 'product',
      product: {
        ...product,
        specifications: productDetails.specifications,
        returnPolicy: productDetails.returnPolicy || store?.customRefundPolicy || null,
        variants: variantsResult || [],
      },
      storeName: legacyCompat.storeName,
      logo: legacyCompat.logo,
      favicon: legacyCompat.favicon,
      currency: store?.currency || 'BDT',
      showReviews,
      reviews: productReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: productReviews.length,
      storeId,
      storeTemplateId: legacyCompat.storeTemplateId,
      theme: legacyCompat.theme,
      socialLinks,
      businessInfo,
      footerConfig,
      categories,
      relatedProducts: relatedProductsResult.map(
        (p) =>
          ({
            ...p,
            storeId,
            name: p.title, // Map to name property
            description: null,
            images: null,
            sku: null,
            updatedAt: null,
          }) as SerializedProduct
      ),
      planType: store?.planType || 'free',
      customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
      productUrl: `${new URL(request.url).protocol}//${new URL(request.url).host}/products/${product.id}`,
      themeConfig: mergedProductThemeConfig,
      storeShippingInfo: shippingInfo,
      storeRefundPolicy: productDetails.returnPolicy || store?.customRefundPolicy || null,
      isCustomerAiEnabled: Boolean(store?.isCustomerAiEnabled),
      aiCredits: Number(store?.aiCredits) || 0,
    };

    // Cache logic for product (KV)
    if (kv && !customer) {
      context.cloudflare.ctx.waitUntil?.(
        kv
          .put(cacheKey, JSON.stringify(responseData), { expirationTtl: CACHE_TTL.product })
          .catch(console.warn)
      );
    }

    return json(responseData, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    });
  }

  // ==========================================
  // COLLECTION LOGIC (Slug)
  // ==========================================
  else {
    const slug = handle;
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sort') || 'newest';
    const onSale = url.searchParams.get('onSale') === 'true';
    const inStock = url.searchParams.get('inStock') === 'true';
    const { minPrice, maxPrice } = parsePriceRange(
      url.searchParams.get('minPrice'),
      url.searchParams.get('maxPrice')
    );

    const orderByClause =
      sortBy === 'price-low'
        ? asc(products.price)
        : sortBy === 'price-high'
          ? desc(products.price)
          : desc(products.createdAt);

    const baseFilters = [
      eq(products.storeId, storeId),
      eq(products.isPublished, true),
      inStock ? gte(products.inventory, 1) : undefined,
      minPrice !== null ? gte(products.price, minPrice) : undefined,
      maxPrice !== null ? lte(products.price, maxPrice) : undefined,
      onSale ? gte(products.compareAtPrice, products.price) : undefined,
    ].filter(Boolean) as SQL[];

    const categoryRows = await db
      .selectDistinct({ category: products.category })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.isPublished, true),
          sql`${products.category} IS NOT NULL AND ${products.category} != ''`
        )
      );

    const storeCategories = categoryRows
      .map((r) => r.category)
      .filter((c): c is string => Boolean(c));

    const matchedCategory = findCategoryBySlug(storeCategories, slug);

    let collectionProducts = [];

    if (slug === 'all' || slug === 'all-products') {
      collectionProducts = await db
        .select()
        .from(products)
        .where(and(...baseFilters))
        .limit(50)
        .orderBy(orderByClause);
    } else {
      const collectionData = await db.query.collections.findFirst({
        where: (c, { eq, and }) => and(eq(c.slug, slug), eq(c.storeId, storeId)),
      });

      if (collectionData) {
        collectionProducts = await db
          .select({
            id: products.id,
            storeId: products.storeId,
            title: products.title,
            description: products.description,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            inventory: products.inventory,
            sku: products.sku,
            imageUrl: products.imageUrl,
            images: products.images,
            category: products.category,
            tags: products.tags,
            isPublished: products.isPublished,
            seoTitle: products.seoTitle,
            seoDescription: products.seoDescription,
            seoKeywords: products.seoKeywords,
            bundlePricing: products.bundlePricing,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
          })
          .from(products)
          .innerJoin(productCollections, eq(products.id, productCollections.productId))
          .where(and(eq(productCollections.collectionId, collectionData.id), ...baseFilters))
          .limit(50)
          .orderBy(orderByClause);
      } else {
        // String match fallback
        collectionProducts = await db
          .select()
          .from(products)
          .where(
            and(
              ...baseFilters,
              matchedCategory
                ? eq(products.category, matchedCategory)
                : like(products.category, slug)
            )
          )
          .limit(50)
          .orderBy(orderByClause);
      }
    }

    const collection = {
      title:
        slug === 'all' || slug === 'all-products'
          ? 'All Products'
          : matchedCategory || slug.charAt(0).toUpperCase() + slug.slice(1),
      description: `Browse our ${
        slug === 'all' || slug === 'all-products' ? 'latest' : matchedCategory || slug
      } collection.`,
      slug,
    };

    const categories = storeCategories;

    // Use unified theme config only
    const mergedThemeConfig = buildMergedThemeConfig(
      null,
      legacyCompat.storeTemplateId,
      legacyCompat.theme.primary,
      legacyCompat.theme.accent,
      {} // Using unified settings - no legacy themeConfig needed
    );

    const responseData: CollectionPageData = {
      pageType: 'collection',
      storeId,
      storeName: legacyCompat.storeName,
      logo: legacyCompat.logo,
      favicon: legacyCompat.favicon,
      collectionName: collection.title,
      currency: store?.currency || 'BDT',
      storeTemplateId: legacyCompat.storeTemplateId,
      theme: legacyCompat.theme,
      socialLinks,
      businessInfo,
      themeConfig: mergedThemeConfig,
      mvpSettings: legacyCompat.mvpSettings,
      collection,
      products: collectionProducts.map((p) => ({
        id: p.id,
        storeId: p.storeId,
        name: p.title,   // Add name field mapped from title
        title: p.title,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        imageUrl: p.imageUrl,
      })),
      categories,
      sortBy,
      inStock,
      onSale,
      minPrice,
      maxPrice,
      planType: store?.planType || 'free',
      customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
      isCustomerAiEnabled: Boolean(store?.isCustomerAiEnabled),
      aiCredits: Number(store?.aiCredits) || 0,
    };

    return json(responseData);
  }
}

// ===================================
// MAIN COMPONENT
// ===================================
export default function UniversalProductRoute() {
  const data = useLoaderData<typeof loader>();

  if (data.pageType === 'product') {
    return <ProductDetailView data={data as ProductPageData} />;
  } else {
    return <CollectionPageView data={data as CollectionPageData} />;
  }
}

// ===================================
// PRODUCT VIEW COMPONENT
// ===================================
function ProductDetailView({ data }: { data: ProductPageData }) {
  const {
    product,
    storeName,
    logo,
    currency,
    showReviews,
    relatedProducts,
    reviews,
    avgRating,
    reviewCount,
    storeId,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    footerConfig,
    categories,
    planType,
    customer,
    storeShippingInfo,
    storeRefundPolicy,
    isCustomerAiEnabled,
    aiCredits,
    themeConfig,
  } = data;

  // Track ViewContent
  const hasTracked = useRef(false);
  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    trackingEvents.viewContent({
      id: String(product.id),
      name: product.title,
      price: product.price,
      currency,
      category: product.category || undefined,
    });
  }, [product, currency]);

  const template = getStoreTemplate(storeTemplateId);

  return (
    <StorePageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      templateId={storeTemplateId}
      theme={theme}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      categories={categories}
      footerConfig={footerConfig}
      planType={planType}
      customer={customer}
      isCustomerAiEnabled={isCustomerAiEnabled}
      aiCredits={aiCredits}
      config={themeConfig}
    >
      {template.ProductPage ? (
        <template.ProductPage
          product={{
            ...product,
            shippingInfo: storeShippingInfo,
            returnPolicy: storeRefundPolicy,
            reviews: showReviews
              ? { average: avgRating, count: reviewCount, items: reviews }
              : undefined,
          }}
          relatedProducts={relatedProducts}
          reviews={showReviews ? reviews : []}
          avgRating={avgRating}
          reviewCount={reviewCount}
          currency={currency}
          theme={theme}
          config={themeConfig}
          storeName={storeName}
        />
      ) : (
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-red-600">Product Page Template Not Found</h1>
        </div>
      )}
    </StorePageWrapper>
  );
}

// ===================================
// COLLECTION VIEW COMPONENT
// ===================================
function CollectionPageView({ data }: { data: CollectionPageData }) {
  const {
    storeId,
    storeName,
    logo,
    currency,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    collection,
    products,
    categories,
    sortBy,
    inStock,
    onSale,
    minPrice,
    maxPrice,
    planType,
    customer,
    mvpSettings,
    isCustomerAiEnabled,
    aiCredits,
  } = data;
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter handlers
  // Filter handlers
  const handleSortChange = (value: string) => {
    const p = new URLSearchParams(searchParams);
    p.set('sort', value);
    setSearchParams(p);
  };
  const handleInStockToggle = (checked: boolean) => {
    const p = new URLSearchParams(searchParams);
    if (checked) {
      p.set('inStock', 'true');
    } else {
      p.delete('inStock');
    }
    setSearchParams(p);
  };
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) {
      p.set(type === 'min' ? 'minPrice' : 'maxPrice', value);
    } else {
      p.delete(type === 'min' ? 'minPrice' : 'maxPrice');
    }
    setSearchParams(p);
  };
  const handleOnSaleToggle = (checked: boolean) => {
    const p = new URLSearchParams(searchParams);
    if (checked) {
      p.set('onSale', 'true');
    } else {
      p.delete('onSale');
    }
    setSearchParams(p);
  };

  const template = useMemo(() => getStoreTemplate(storeTemplateId), [storeTemplateId]);
  // FORCE using SharedCollectionPage if available or fall back to template's unique one
  const CollectionPageComponent = template.CollectionPage;

  // CSS Variables injection
  const cssVariables = `:root { --color-primary: ${theme.primary}; --color-accent: ${theme.accent}; --color-text: ${theme.text}; --color-muted: ${theme.muted}; --color-background: ${theme.background}; }`;

  const collectionPageProps = {
    storeName,
    storeId,
    logo,
    theme,
    currency,
    collection,
    mvpSettings,
    products,
    categories,
    sortBy,
    inStock,
    onSale,
    minPrice,
    maxPrice,
    onSortChange: handleSortChange,
    onInStockToggle: handleInStockToggle,
    onPriceChange: handlePriceChange,
    onOnSaleToggle: handleOnSaleToggle,
    config: themeConfig,
    socialLinks,
    businessInfo,
    planType,
    category: collection.title,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      <StorePageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        templateId={storeTemplateId}
        theme={theme}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        config={themeConfig}
        planType={planType}
        customer={customer}
        categories={categories}
        isCustomerAiEnabled={isCustomerAiEnabled}
        aiCredits={aiCredits}
      >
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          {CollectionPageComponent ? (
            <CollectionPageComponent {...collectionPageProps} />
          ) : (
            <div className="p-10 text-center">No Collection Template Found</div>
          )}
        </Suspense>
      </StorePageWrapper>
    </>
  );
}

// ===================================
// ERROR BOUNDARY
// ===================================
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">{error.status}</h1>
          <p className="text-gray-600">{error.statusText}</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">Something went wrong.</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

/**
 * Collection Page - MVP Simple Theme System
 *
 * Uses the old React Component System (legacy templates)
 * instead of Shopify OS 2.0 section-based system.
 *
 * Each template provides a CollectionPage component for collection display.
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { Suspense, useMemo } from 'react';
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import {
  useLoaderData,
  useSearchParams,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { eq, and, desc, like, asc, gte, lte } from 'drizzle-orm';
import { products, stores, productCollections, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplateTheme,
  getStoreTemplate,
  DEFAULT_STORE_TEMPLATE_ID,
} from '~/templates/store-registry';
import { getCustomer } from '~/services/customer-auth.server';
import { parsePriceRange } from '~/utils/price';
import { formatPrice } from '~/lib/theme-engine';

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    throw new Response('Collection slug required', { status: 404 });
  }

  // Resolve store
  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId } = storeContext;
  const db = createDb(context.cloudflare.env.DB);

  // Fetch store data for config
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  const storeData = storeResult[0] as Store | undefined;
  if (!storeData) {
    throw new Response('Store not found', { status: 404 });
  }
  const themeConfig = parseThemeConfig(storeData?.themeConfig as string | null);
  const socialLinks = parseSocialLinks(storeData?.socialLinks as string | null);
  const storeTemplateId =
    themeConfig?.storeTemplateId || (storeData.theme as string) || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);

  // Parse businessInfo
  let businessInfo: { phone?: string; email?: string; address?: string } | null = null;
  try {
    if (storeData?.businessInfo) {
      businessInfo = JSON.parse(storeData.businessInfo as string);
    }
  } catch {
    // Ignore JSON parse errors
  }

  // Load customer session
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // Merge themeConfig colors with template theme
  const mergedTheme = {
    ...theme,
    primary: themeConfig?.primaryColor || theme.primary,
    accent: themeConfig?.accentColor || theme.accent,
  };

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
  ].filter(Boolean);

  // Fetch products in this collection (category)
  let collectionProducts = [];

  if (slug === 'all') {
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
      .where(and(...(baseFilters as any)))
      .limit(50)
      .orderBy(orderByClause);
  } else {
    // Hybrid Query - Support both Relational Collections AND Legacy String Categories
    const collectionData = await db.query.collections.findFirst({
      where: (collections, { eq, and }) =>
        and(eq(collections.slug, slug), eq(collections.storeId, storeId)),
      columns: { id: true, title: true, description: true },
    });

    if (collectionData) {
      // Relational Query
      const relationalProducts = await db
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
        .where(and(eq(productCollections.collectionId, collectionData.id), ...(baseFilters as any)))
        .limit(50)
        .orderBy(orderByClause);

      collectionProducts = relationalProducts;
    } else {
      // Fallback: Legacy String Match
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
        .where(and(...(baseFilters as any), like(products.category, slug)))
        .limit(50)
        .orderBy(orderByClause);
    }
  }

  // Mock collection object for header
  const collection = {
    title: slug === 'all' ? 'All Products' : slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `Browse our ${slug === 'all' ? 'latest' : slug} collection.`,
    slug,
  };

  // Get unique categories for filter
  const categoryResult = await db
    .select({ category: products.category })
    .from(products)
    .where(eq(products.storeId, storeId))
    .groupBy(products.category);

  const categories = categoryResult.map((r) => r.category);

  return json({
    storeId,
    storeName: storeData?.name || 'Store',
    logo: storeData?.logo || null,
    currency: storeData?.currency || 'BDT',
    storeTemplateId,
    theme: mergedTheme,
    socialLinks,
    businessInfo,
    themeConfig,
    collection,
    products: collectionProducts,
    categories,
    sortBy,
    inStock,
    onSale,
    minPrice,
    maxPrice,
    planType: storeData?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CollectionPage() {
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
  } = useLoaderData<typeof loader>();

  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter handlers
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    setSearchParams(params);
  };

  const handleInStockToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    setSearchParams(params);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(type === 'min' ? 'minPrice' : 'maxPrice', value);
    } else {
      params.delete(type === 'min' ? 'minPrice' : 'maxPrice');
    }
    setSearchParams(params);
  };

  const handleOnSaleToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set('onSale', 'true');
    } else {
      params.delete('onSale');
    }
    setSearchParams(params);
  };

  // Get template
  const template = useMemo(() => getStoreTemplate(storeTemplateId), [storeTemplateId]);
  const CollectionPageComponent = template.CollectionPage;

  // Generate CSS variables for MVP colors
  const cssVariables = `
    :root {
      --color-primary: ${theme.primary};
      --color-accent: ${theme.accent};
      --color-text: ${theme.text};
      --color-muted: ${theme.muted};
      --color-background: ${theme.background};
    }
  `;

  // Prepare collection page props
  const collectionPageProps = {
    storeName,
    storeId,
    logo,
    theme,
    currency,
    collection,
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
        socialLinks={socialLinks || undefined}
        businessInfo={businessInfo || undefined}
        config={themeConfig || undefined}
        planType={planType}
        customer={customer || undefined}
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
            <SimpleCollectionPage {...collectionPageProps} />
          )}
        </Suspense>
      </StorePageWrapper>
    </>
  );
}

// ============================================================================
// SIMPLE COLLECTION PAGE (Fallback)
// ============================================================================
interface SimpleCollectionPageProps {
  storeName: string;
  storeId: number;
  logo: string | null;
  theme: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  currency: string;
  collection: {
    title: string;
    description: string;
    slug: string;
  };
  products: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    category: string | null;
  }>;
  categories: (string | null)[];
  sortBy: string;
  inStock: boolean;
  onSale: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  onSortChange: (value: string) => void;
  onInStockToggle: (checked: boolean) => void;
  onPriceChange: (type: 'min' | 'max', value: string) => void;
  onOnSaleToggle: (checked: boolean) => void;
}

function SimpleCollectionPage({
  collection,
  products,
  currency,
  theme,
  sortBy,
  inStock,
  onSale,
  minPrice,
  maxPrice,
  onSortChange,
  onInStockToggle,
  onPriceChange,
  onOnSaleToggle,
}: SimpleCollectionPageProps) {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme?.background || '#ffffff' }}
    >
      {/* Collection Header with Filters */}
      <div className="border-b border-gray-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{collection.title}</h1>
            <p className="text-sm text-gray-600">{collection.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('sortBy')}</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="newest">{t('sortNewest')}</option>
                <option value="price-low">{t('sortPriceLowHigh')}</option>
                <option value="price-high">{t('sortPriceHighLow')}</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => onInStockToggle(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('inStockLabel')}
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => onOnSaleToggle(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('onSale')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice ?? ''}
                onChange={(e) => onPriceChange('min', e.target.value)}
                placeholder={t('min')}
                className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <input
                type="number"
                value={maxPrice ?? ''}
                onChange={(e) => onPriceChange('max', e.target.value)}
                placeholder={t('max')}
                className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-square bg-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                  <p className="text-lg font-bold mt-1" style={{ color: theme.primary }}>
                    {formatPrice(product.price, currency)}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {formatPrice(product.compareAtPrice, currency)}
                      </span>
                    )}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{error.status}</h1>
          <p className="text-gray-600 mb-2">{error.statusText}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

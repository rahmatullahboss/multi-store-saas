/**
 * Collection Page
 *
 * Shopify OS 2.0 Theme System - Uses ThemeStoreRenderer exclusively
 * for dynamic section rendering with the new theme engine.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { eq, and, desc, like, asc, gte, lte } from 'drizzle-orm';
import { products, stores, productCollections, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { ThemeStoreRenderer } from '~/components/store/ThemeStoreRenderer';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { getCustomer } from '~/services/customer-auth.server';
import { parsePriceRange } from '~/utils/price';
import { resolveTemplate } from '~/lib/template-resolver.server';

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
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
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

  // Template resolution (Shopify OS 2.0)
  let template = null;
  try {
    template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'collection');
  } catch {
    // Continue without template
  }

  return json({
    storeId,
    storeName: storeData?.name || 'Store',
    logo: storeData?.logo || null,
    currency: storeData?.currency || 'BDT',
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    collection,
    products: collectionProducts,
    sortBy,
    inStock,
    onSale,
    minPrice,
    maxPrice,
    planType: storeData?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    template,
  });
}

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
    sortBy,
    inStock,
    onSale,
    minPrice,
    maxPrice,
    planType,
    customer,
    template,
  } = useLoaderData<typeof loader>();

  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const hasTemplateSections = template?.sections && template.sections.length > 0;

  // Render collection content
  const renderCollectionContent = () => {
    // If template has sections, use ThemeStoreRenderer (Shopify OS 2.0)
    if (hasTemplateSections && template?.sections) {
      return (
        <ThemeStoreRenderer
          themeId={storeTemplateId}
          sections={template.sections.map((s) => ({
            id: s.id,
            type: s.type,
            settings: s.props || {},
            blocks:
              s.blocks?.map((b) => ({
                id: b.id,
                type: b.type,
                settings: b.props || {},
              })) || [],
            enabled: s.enabled,
          }))}
          store={{
            id: storeId,
            name: storeName,
            currency,
            logo,
            defaultLanguage: 'en',
          }}
          pageType="collection"
          collection={{
            id: 1,
            title: collection.title,
            slug: collection.slug,
            description: collection.description,
            productCount: products.length,
          }}
          products={products.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            compareAtPrice: p.compareAtPrice || undefined,
            imageUrl: p.imageUrl,
            images: p.imageUrl ? [p.imageUrl] : [],
            category: p.category || undefined,
          }))}
          skipHeaderFooter={false}
        />
      );
    }

    // Fallback: Default collection grid
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
                  onChange={(e) => handleSortChange(e.target.value)}
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
                  onChange={(e) => handleInStockToggle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('inStockLabel')}
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => handleOnSaleToggle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('onSale')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice ?? ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder={t('min')}
                  className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={maxPrice ?? ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
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
                      {currency === 'BDT' ? '৳' : '$'}
                      {product.price.toLocaleString()}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {currency === 'BDT' ? '৳' : '$'}
                          {product.compareAtPrice.toLocaleString()}
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
  };

  return (
    <StorePageWrapper
      hideHeaderFooter={hasTemplateSections}
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      templateId={storeTemplateId}
      theme={theme}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      planType={planType}
      customer={customer}
    >
      {renderCollectionContent()}
    </StorePageWrapper>
  );
}

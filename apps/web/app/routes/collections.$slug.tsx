
/**
 * Collection Page
 * 
 * Displays a collection of products.
 * Uses SectionRenderer for dynamic layout.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { eq, and, desc, like, asc, gte, lte } from 'drizzle-orm';
import { products, stores, productCollections, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { DarazPageWrapper, DARAZ_THEME } from '~/components/store-layouts/DarazPageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { getCustomer } from '~/services/customer-auth.server';
import { parsePriceRange } from '~/utils/price';

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
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const storeData = storeResult[0] as Store | undefined;
  // Check if store exists
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

  // Load customer session for Google Sign-In header
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  const url = new URL(request.url);
  const sortBy = url.searchParams.get('sort') || 'newest';
  const onSale = url.searchParams.get('onSale') === 'true';
  const inStock = url.searchParams.get('inStock') === 'true';
  const { minPrice, maxPrice } = parsePriceRange(url.searchParams.get('minPrice'), url.searchParams.get('maxPrice'));

  const orderByClause = sortBy === 'price-low'
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
    // Phase 26: Hybrid Query - Support both Relational Collections AND Legacy String Categories
    // 1. Try to find a relational collection first
    const collectionData = await db.query.collections.findFirst({
        where: (collections, { eq, and }) => and(eq(collections.slug, slug), eq(collections.storeId, storeId)),
        columns: { id: true, title: true, description: true }
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
            .where(
                and(
                    eq(productCollections.collectionId, collectionData.id),
                    ...(baseFilters as any)
                )
            )
            .limit(50)
            .orderBy(orderByClause);
            
         collectionProducts = relationalProducts;
         
         // Override title/desc from DB if available
         // This allows the admin title to override the slug-based fallback
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
          .where(
            and(
              ...(baseFilters as any),
              like(products.category, slug)
            )
          )
          .limit(50)
          .orderBy(orderByClause);
    }
  }
  
  // Mock collection object for header
  const collection = {
    title: slug === 'all' ? 'All Products' : slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `Browse our ${slug === 'all' ? 'latest' : slug} collection.`,
    slug
  };

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
    customer
  } = useLoaderData<typeof loader>();

  const { t } = useTranslation();
  const isDaraz = storeTemplateId === 'daraz';
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
  
  // 1. Get sections from themeConfig or use default
  const collectionSections = themeConfig?.collectionSections || [
    {
       id: 'header',
       type: 'collection-header',
       settings: { 
         alignment: 'center',
         paddingTop: 'medium',
         paddingBottom: 'medium'
       }
    },
    {
       id: 'grid',
       type: 'product-grid',
       settings: {
         heading: '', // No heading needed since header is separate
         productCount: 12,
         paddingTop: 'small'
       }
    }
  ];

  // 2. Prepare props
  const sectionProps = {
    theme: isDaraz ? DARAZ_THEME : (theme || {}),
    storeId,
    currency,
    storeName,
    businessInfo,
    socialLinks,
    // IMPORTANT: Pass collection-specific data
    collection,
    products, // The product grid needs this
    store: {
      name: storeName,
      currency: currency,
      email: businessInfo?.email,
      phone: businessInfo?.phone,
      address: businessInfo?.address
    }
  };

  const content = (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme?.background || '#ffffff' }}>
        <div className="border-b border-gray-200 bg-white/70 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{collection.title}</h1>
              <p className="text-sm text-gray-600">{collection.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('common.sort')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="newest">{t('store.sortNewest')}</option>
                  <option value="price-low">{t('store.sortPriceLowHigh')}</option>
                  <option value="price-high">{t('store.sortPriceHighLow')}</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => handleInStockToggle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('store.inStock')}
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => handleOnSaleToggle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('store.onSale')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice ?? ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder={t('store.min')}
                  className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={maxPrice ?? ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder={t('store.max')}
                  className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <SectionRenderer 
          sections={collectionSections}
          {...sectionProps}
        />
      </div>
  );

  // 3. Render Wrapper
  if (isDaraz) {
    return (
      <DarazPageWrapper 
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      >
        {content}
      </DarazPageWrapper>
    );
  }
  
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
      planType={planType}
      customer={customer}
    >
        {content}
    </StorePageWrapper>
  );
}

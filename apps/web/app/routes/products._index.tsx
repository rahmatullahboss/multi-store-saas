/**
 * Products Listing Page (Storefront)
 *
 * Public-facing products catalog page for customers.
 * Uses StorePageWrapper for consistent template styling.
 * Supports category filtering via URL params.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import {
  useLoaderData,
  Link,
  useSearchParams,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { eq, and, desc, asc, gte, lte, sql } from 'drizzle-orm';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getStoreConfig } from '~/services/store-config.server';
import { products, reviews } from '@db/schema';
import { type ThemeConfig } from '@db/types';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplate, getStoreTemplateTheme } from '~/templates/store-registry';
import { ShoppingBag, Filter, ChevronRight, Grid, List } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { getCustomer } from '~/services/customer-auth.server';
import { parsePriceRange } from '~/utils/price';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import {
  resolveCategoryFromParam,
  buildUnifiedSocialLinks,
  buildMergedThemeConfig,
  normalizeCategoryValue,
} from '~/utils/storefront-settings';

// Serialized product type for client components
interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: string | null;
  category: string | null;
  inventory: number | null;
  sku: string | null;
  isPublished: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  // Review data
  avgRating?: number | null;
  reviewCount?: number | null;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.storeName) {
    return [{ title: 'Products' }];
  }

  const title = data.currentCategory
    ? `${data.currentCategory} - ${data.storeName}`
    : `All Products - ${data.storeName}`;

  return [{ title }, { name: 'description', content: `Shop all products at ${data.storeName}` }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Resolve store (handles both production and development mode)
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found. Please check your store configuration.', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const db = createDb(context.cloudflare.env.DB);
  const cache = new D1Cache(db);

  // Use cached store configuration
  const storeConfig = await getStoreConfig(db, cache, storeId);

  if (!storeConfig) {
    throw new Response('Store configuration not found', { status: 404 });
  }

  const { businessInfo, footerConfig } = storeConfig;

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
    theme: mergedTheme,
    themeConfig: null, // Using mergedTheme instead
    mvpSettings: null,
  };

  const socialLinks = buildUnifiedSocialLinks(unifiedSettings);

  // Get category filter from URL
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const sortBy = url.searchParams.get('sort') || 'newest';
  const inStock = url.searchParams.get('inStock') === 'true';
  const onSale = url.searchParams.get('onSale') === 'true';
  const { minPrice, maxPrice } = parsePriceRange(
    url.searchParams.get('minPrice'),
    url.searchParams.get('maxPrice')
  );

  // Load customer session for Google Sign-In header
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // Determine sort order
  const orderByClause =
    sortBy === 'price-low'
      ? asc(products.price)
      : sortBy === 'price-high'
        ? desc(products.price)
        : desc(products.createdAt);

  // Get all unique categories
  const categoriesResult = await db
    .select({ category: products.category })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)));

  const categories = [
    ...new Set(categoriesResult.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ];

  const resolvedCategory = resolveCategoryFromParam(categories, category);
  const normalizedResolvedCategory = resolvedCategory
    ? normalizeCategoryValue(resolvedCategory)
    : null;

  // Fetch products with optional category filter and sorting
  const allProducts = await db
    .select({
      id: products.id,
      storeId: products.storeId,
      title: products.title,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      images: products.images,
      category: products.category,
      inventory: products.inventory,
      sku: products.sku,
      isPublished: products.isPublished,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        normalizedResolvedCategory
          ? sql`lower(trim(${products.category})) = ${normalizedResolvedCategory}`
          : undefined,
        inStock ? gte(products.inventory, 1) : undefined,
        onSale ? gte(products.compareAtPrice, products.price) : undefined,
        minPrice !== null ? gte(products.price, minPrice) : undefined,
        maxPrice !== null ? lte(products.price, maxPrice) : undefined
      )
    )
    .orderBy(orderByClause)
    .limit(100);

  // Fetch aggregate ratings for all products
  const productIds = allProducts.map((p) => p.id);
  let reviewStats: Record<number, { avgRating: number; reviewCount: number }> = {};

  if (productIds.length > 0) {
    const ratingResults = await db
      .select({
        productId: reviews.productId,
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
        reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.storeId, storeId),
          eq(reviews.status, 'approved'),
          sql`${reviews.productId} IN (${sql.join(
            productIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      )
      .groupBy(reviews.productId);

    reviewStats = ratingResults.reduce(
      (acc, r) => {
        acc[r.productId] = {
          avgRating: Math.round(r.avgRating * 10) / 10,
          reviewCount: Number(r.reviewCount),
        };
        return acc;
      },
      {} as Record<number, { avgRating: number; reviewCount: number }>
    );
  }

  // Add review data to products
  const productsWithReviews = allProducts.map((product) => ({
    ...product,
    avgRating: reviewStats[product.id]?.avgRating ?? null,
    reviewCount: reviewStats[product.id]?.reviewCount ?? 0,
  }));

  // Use unified theme config only
  const mergedThemeConfig = buildMergedThemeConfig(
    null,
    legacyCompat.storeTemplateId,
    legacyCompat.theme.primary,
    legacyCompat.theme.accent,
    {} // Using unified settings - no legacy themeConfig needed
  );

  return json({
    products: productsWithReviews,
    storeName: legacyCompat.storeName,
    logo: legacyCompat.logo,
    currency: store?.currency || 'BDT',
    storeId,
    storeTemplateId: legacyCompat.storeTemplateId,
    theme: legacyCompat.theme,
    socialLinks,
    businessInfo,
    themeConfig: mergedThemeConfig,
    footerConfig,
    mvpSettings: undefined, // Using unified settings - no legacy mvpSettings needed
    categories,
    currentCategory: resolvedCategory,
    sortBy,
    inStock,
    onSale,
    minPrice,
    maxPrice,
    planType: store?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    // AI Chat props
    isCustomerAiEnabled: store.isCustomerAiEnabled ?? false,
    aiCredits: store.aiCredits ?? 0,
  });
}

export default function ProductsIndex() {
  const {
    products,
    storeName,
    logo,
    currency,
    storeId,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    footerConfig,
    categories,
    currentCategory,
    sortBy,
    inStock,
    onSale,
    minPrice,
    maxPrice,
    planType,
    customer,
    isCustomerAiEnabled,
    aiCredits,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Resolve the active store template
  const template = useMemo(() => getStoreTemplate(storeTemplateId), [storeTemplateId]);
  const TemplateCollectionPage = template.CollectionPage;

  const isDarkTheme = storeTemplateId === 'modern-premium' || storeTemplateId === 'tech-modern';

  // Theme-aware styles
  const bgColor = isDarkTheme ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimary = isDarkTheme ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDarkTheme ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkTheme ? 'border-gray-700' : 'border-gray-200';

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  const handleCategoryChange = (cat: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
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

  // If the active template provides a CollectionPage, delegate rendering to it
  // (e.g., LuxeCollectionPage for luxe-boutique). Otherwise fall back to generic UI.
  if (TemplateCollectionPage) {
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
        cartCount={0}
        categories={categories}
        config={themeConfig as unknown as ThemeConfig}
        footerConfig={footerConfig}
        planType={planType}
        customer={customer}
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
          <TemplateCollectionPage
            storeName={storeName}
            storeId={storeId}
            logo={logo}
            config={themeConfig as unknown as ThemeConfig}
            products={products}
            category={currentCategory || 'all-products'}
            categories={categories}
            currency={currency}
            theme={theme}
            socialLinks={socialLinks}
            businessInfo={businessInfo}
            planType={planType}
          />
        </Suspense>
      </StorePageWrapper>
    );
  }

  // Fallback: generic grid/list UI for templates without a CollectionPage
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
      cartCount={0}
      categories={categories}
      config={themeConfig as unknown as ThemeConfig}
      footerConfig={footerConfig}
      planType={planType}
      customer={customer}
      isCustomerAiEnabled={isCustomerAiEnabled}
      aiCredits={aiCredits}
    >
      <div className={`min-h-screen ${bgColor}`}>
        {/* Breadcrumb */}
        <nav className={`border-b ${borderColor} ${cardBg}`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className={`${textMuted} hover:text-[var(--color-primary)] transition`}>
                {t('home')}
              </Link>
              <ChevronRight className={`w-4 h-4 ${textMuted}`} />
              <span className={textPrimary}>{t('products')}</span>
              {currentCategory && (
                <>
                  <ChevronRight className={`w-4 h-4 ${textMuted}`} />
                  <span className={textPrimary}>{currentCategory}</span>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
                {currentCategory || t('all_products')}
              </h1>
              <p className={`mt-1 ${textMuted}`}>
                {products.length} {t('products_found')}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className={`flex rounded-lg border ${borderColor} overflow-hidden`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? `${cardBg} ${textPrimary}` : textMuted}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? `${cardBg} ${textPrimary}` : textMuted}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
              >
                <option value="newest">{t('newest_first')}</option>
                <option value="price-low">{t('price_low_high')}</option>
                <option value="price-high">{t('price_high_low')}</option>
              </select>

              {/* Stock */}
              <label className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => handleInStockToggle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('in_stock')}
              </label>

              {/* On Sale */}
              <label className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => handleOnSaleToggle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('on_sale')}
              </label>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice ?? ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder={t('min')}
                  className={`w-24 px-2 py-2 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
                />
                <input
                  type="number"
                  value={maxPrice ?? ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder={t('max')}
                  className={`w-24 px-2 py-2 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Categories */}
            {categories.length > 0 && (
              <aside className="hidden md:block w-64 shrink-0">
                <div className={`${cardBg} rounded-xl p-4 border ${borderColor} sticky top-4`}>
                  <h2 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Filter className="w-4 h-4" />
                    {t('categories')}
                  </h2>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          !currentCategory
                            ? 'bg-[var(--color-primary)] text-white'
                            : `${textMuted} hover:opacity-80`
                        }`}
                      >
                        {t('all_products')}
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryChange(cat)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition ${
                            currentCategory === cat
                              ? 'bg-[var(--color-primary)] text-white'
                              : `${textMuted} hover:opacity-80`
                          }`}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}

            {/* Products Grid/List */}
            <div className="flex-1">
              {/* Mobile Category Filter */}
              {categories.length > 0 && (
                <div className="md:hidden mb-4 overflow-x-auto">
                  <div className="flex gap-2 pb-2">
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                        !currentCategory
                          ? 'bg-[var(--color-primary)] text-white'
                          : `${cardBg} ${textMuted} border ${borderColor}`
                      }`}
                    >
                      {t('all')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                          currentCategory === cat
                            ? 'bg-[var(--color-primary)] text-white'
                            : `${cardBg} ${textMuted} border ${borderColor}`
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {products.length === 0 ? (
                <div className={`text-center py-16 ${cardBg} rounded-xl border ${borderColor}`}>
                  <ShoppingBag className={`w-16 h-16 mx-auto ${textMuted} mb-4`} />
                  <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>
                    {t('no_products_found')}
                  </h3>
                  <p className={textMuted}>
                    {currentCategory
                      ? t('no_products_category', { category: currentCategory })
                      : t('no_products_store')}
                  </p>
                  {currentCategory && (
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
                    >
                      {t('view_all_products')}
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      theme={theme}
                      isDark={isDarkTheme}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      currency={currency}
                      theme={theme}
                      isDark={isDarkTheme}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StorePageWrapper>
  );
}

// Product Card Component (Grid View)
function ProductCard({
  product,
  currency,
  theme,
  isDark,
}: {
  product: SerializedProduct;
  currency: string;
  theme: { primary: string; accent?: string; [key: string]: unknown };
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group ${cardBg} rounded-xl overflow-hidden border ${borderColor} hover:shadow-lg transition-all duration-300`}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className={`w-12 h-12 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          </div>
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}

        {/* Out of Stock */}
        {(!product.inventory || product.inventory <= 0) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              {t('out_of_stock')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {product.category && (
          <span className={`text-xs ${textMuted} uppercase tracking-wide`}>{product.category}</span>
        )}
        <h3
          className={`font-medium ${textPrimary} mt-1 line-clamp-2 group-hover:text-[var(--color-primary)] transition`}
        >
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className={`font-bold ${textPrimary}`} style={{ color: theme.primary }}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className={`text-sm ${textMuted} line-through`}>
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Product List Item Component (List View)
function ProductListItem({
  product,
  currency,
  theme,
  isDark,
}: {
  product: SerializedProduct;
  currency: string;
  theme: { primary: string; accent?: string; [key: string]: unknown };
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group flex gap-4 ${cardBg} rounded-xl overflow-hidden border ${borderColor} hover:shadow-lg transition-all duration-300 p-4`}
    >
      {/* Image */}
      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className={`w-8 h-8 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          </div>
        )}

        {discount && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {product.category && (
          <span className={`text-xs ${textMuted} uppercase tracking-wide`}>{product.category}</span>
        )}
        <h3
          className={`font-medium ${textPrimary} mt-1 group-hover:text-[var(--color-primary)] transition line-clamp-1`}
        >
          {product.title}
        </h3>
        {product.description && (
          <p className={`text-sm ${textMuted} mt-1 line-clamp-2`}>{product.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className={`font-bold ${textPrimary}`} style={{ color: theme.primary }}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className={`text-sm ${textMuted} line-through`}>
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {product.inventory && product.inventory > 0 ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {t('in_stock')}
            </span>
          ) : (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
              {t('out_of_stock')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-red-600 mb-4">{error.status}</h1>
          <p className="text-gray-600 mb-6">{error.data || error.statusText}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-6">Failed to load products. Please refresh and try again.</p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

/**
 * Category Page - Shows products in a specific category
 * Route: /category/:slug
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { products } from '@db/schema';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreConfig } from '~/services/store-config.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { parseSocialLinks } from '@db/types';
import { formatPrice } from '~/lib/theme-engine';

function createCategorySlug(category: string): string {
  const normalized = category.trim().toLowerCase().replace(/\s+/g, ' ');
  return encodeURIComponent(normalized).replace(/%20/g, '-');
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.categoryName) {
    return [{ title: 'Category Not Found' }];
  }

  return [
    { title: `${data.categoryName} | ${data.storeName}` },
    { name: 'description', content: `Shop ${data.categoryName} products at ${data.storeName}` },
  ];
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const slug = params.slug || '';

  if (!slug) {
    throw new Response('Category slug required', { status: 400 });
  }

  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const db = createDb(context.cloudflare.env.DB);
  const cache = new D1Cache(db);

  // Get store config
  const storeConfig = await getStoreConfig(db, cache, storeId);

  if (!storeConfig) {
    throw new Response('Store configuration not found', { status: 404 });
  }

  const { themeConfig, businessInfo, footerConfig } = storeConfig;
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  const socialLinks =
    storeConfig.socialLinks || parseSocialLinks(store.socialLinks as string | null);

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }
  const normalizedSlugText = decodedSlug.replace(/-/g, ' ').trim().toLowerCase();

  // Convert slug back to potential category names
  // e.g., "t-shirts" could be "T-Shirts", "t shirts", "T shirts", etc.
  const slugVariants = [
    normalizedSlugText,
    normalizedSlugText.replace(/\b\w/g, (l) => l.toUpperCase()), // Title Case
  ];

  // Find products matching the category (case-insensitive)
  const categoryProducts = await db
    .select()
    .from(products)
    .where(
      and(
            eq(products.storeId, storeId),
            eq(products.isPublished, true),
            or(
              ...slugVariants.map((v) => like(products.category, v)),
              sql`LOWER(${products.category}) = LOWER(${normalizedSlugText})`
            )
          )
      )
    .limit(100);

  if (categoryProducts.length === 0) {
    throw new Response('Category not found', { status: 404 });
  }

  // Get the actual category name from the first product
  const categoryName = categoryProducts[0].category || slug;

  // Get all categories for navigation
  const allCategories = await db
    .select({
      category: products.category,
      count: sql<number>`count(*)`.as('count'),
    })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        sql`${products.category} IS NOT NULL AND ${products.category} != ''`
      )
    )
    .groupBy(products.category);

  const categories = allCategories.map((c) => ({
    name: c.category as string,
    slug: createCategorySlug(c.category as string),
    productCount: Number(c.count),
  }));

  return json({
    categoryName,
    categorySlug: slug,
    products: categoryProducts,
    categories,
    storeName: store.name,
    store,
    theme,
    socialLinks,
    businessInfo,
    footerConfig,
    storeConfig,
  });
}

export default function CategoryPage() {
  const {
    categoryName,
    categorySlug,
    products: categoryProducts,
    categories,
    store,
    theme,
    socialLinks,
    businessInfo,
    footerConfig,
    storeConfig,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <StorePageWrapper
      storeName={store.name}
      storeId={store.id}
      logo={store.logo}
      templateId={storeConfig.themeConfig?.storeTemplateId || 'starter'}
      theme={theme}
      currency={store.currency || 'BDT'}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      footerConfig={footerConfig}
      categories={categories.map((c) => c.name)}
      currentCategory={categoryName}
      planType={store.planType || 'free'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label={t('breadcrumb')}>
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                {t('home')}
              </Link>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/categories" className="text-gray-500 hover:text-gray-700">
                {t('categories')}
              </Link>
            </li>
            <li>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{categoryName}</span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <h2 className="font-semibold text-gray-900 mb-4">{t('categories')}</h2>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      cat.slug === categorySlug
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-gray-400">({cat.productCount})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content - Products */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
              <p className="text-gray-500">
                {categoryProducts.length} {t('products_found')}
              </p>
            </div>

            {categoryProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('no_products_category')}</p>
                <Link
                  to="/products"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
                >
                  {t('browse_all_products')} →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categoryProducts.map((product) => {
                  const hasDiscount =
                    product.compareAtPrice && product.compareAtPrice > product.price;

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {product.imageUrl ? (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {product.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </StorePageWrapper>
  );
}

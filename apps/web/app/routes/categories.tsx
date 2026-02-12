/**
 * Categories Page - Lists all product categories
 * Route: /categories
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { eq, and, sql } from 'drizzle-orm';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { products } from '@db/schema';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreConfig } from '~/services/store-config.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { parseSocialLinks } from '@db/types';

function createCategorySlug(category: string): string {
  const normalized = category.trim().toLowerCase().replace(/\s+/g, ' ');
  return encodeURIComponent(normalized).replace(/%20/g, '-');
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: 'Categories' }];
  
  return [
    { title: `Categories | ${data.storeName}` },
    { name: 'description', content: `Browse all product categories at ${data.storeName}` },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
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
  const socialLinks = storeConfig.socialLinks || parseSocialLinks(store.socialLinks as string | null);
  
  // Get all categories with product count
  const categoriesResult = await db
    .select({
      category: products.category,
      count: sql<number>`count(*)`.as('count'),
      image: sql<string>`MAX(${products.imageUrl})`.as('image'),
    })
    .from(products)
    .where(and(
      eq(products.storeId, storeId),
      eq(products.isPublished, true),
      sql`${products.category} IS NOT NULL AND ${products.category} != ''`
    ))
    .groupBy(products.category);
  
  const categories = categoriesResult.map(c => ({
    name: c.category as string,
    slug: createCategorySlug(c.category as string),
    productCount: Number(c.count),
    image: c.image,
  }));
  
  return json({
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

export default function CategoriesPage() {
  const { categories, store, theme, socialLinks, businessInfo, footerConfig, storeConfig } =
    useLoaderData<typeof loader>();
  
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
      planType={store.planType || 'free'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>
        
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found.</p>
            <Link to="/products" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Browse all products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {category.image ? (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StorePageWrapper>
  );
}

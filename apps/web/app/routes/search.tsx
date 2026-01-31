/**
 * Search Results Page
 *
 * Shopify OS 2.0 Theme System - Uses ThemeStoreRenderer
 * Route: /search?q=query
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq, and, like, desc } from 'drizzle-orm';
import { products, stores, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { ThemeStoreRenderer } from '~/components/store/ThemeStoreRenderer';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { getCustomer } from '~/services/customer-auth.server';
import { resolveTemplate } from '~/lib/template-resolver.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: 'Search' }];
  return [
    { title: `Search: ${data.searchQuery} - ${data.storeName}` },
    { name: 'description', content: `Search results for ${data.searchQuery}` },
  ];
};

interface SearchProduct {
  id: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
}

interface SearchCollection {
  id: number;
  title: string;
  slug: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';

  // Resolve store
  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId } = storeContext;
  const db = createDb(context.cloudflare.env.DB);

  // Fetch store data
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

  // Customer session can be loaded here if needed for personalized search

  // Search products
  let searchResults: SearchProduct[] = [];
  if (searchQuery.trim()) {
    const searchTerm = `%${searchQuery.toLowerCase()}%`;
    const results = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.isPublished, true),
          like(products.title, searchTerm)
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(48);

    searchResults = results as SearchProduct[];
  }

  // Get categories for navigation
  const categoriesResult = await db
    .select({
      category: products.category,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .groupBy(products.category)
    .all();

  const collections: SearchCollection[] = categoriesResult
    .filter((c): c is { category: string } => Boolean(c.category))
    .map((c, index) => ({
      id: index + 1,
      title: c.category,
      slug: c.category.toLowerCase().replace(/\s+/g, '-'),
    }));

  // Resolve template (use collection template as base for search results)
  let template = null;
  try {
    template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'collection');
  } catch (templateError) {
    console.error('[search] Template resolution failed:', templateError);
  }

  return json({
    searchQuery: searchQuery.trim(),
    products: searchResults,
    productCount: searchResults.length,
    collections,
    template,
    store: {
      id: storeId,
      name: storeData.name,
      currency: storeData.currency || '৳',
      logo: storeData.logo || null,
      themeConfig,
    },
    storeName: storeData.name,
    storeTemplateId,
    theme,
    currency: storeData.currency || '৳',
    socialLinks,
    businessInfo,
  });
}

export default function SearchPage() {
  const {
    searchQuery,
    products,
    productCount,
    collections,
    template,
    store,
    storeTemplateId,
    theme,
    currency,
    socialLinks,
    businessInfo,
  } = useLoaderData<typeof loader>();

  // Format price helper
  const formatPrice = (price: number) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  // Cart data (empty for now)
  const cart = {
    items: [] as {
      id: number;
      productId: number;
      title: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }[],
    itemCount: 0,
    total: 0,
  };

  return (
    <StorePageWrapper
      storeName={store.name}
      storeId={store.id}
      logo={store.logo}
      templateId={storeTemplateId}
      theme={theme}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
    >
      {template && template.sections ? (
        <ThemeStoreRenderer
          themeId={storeTemplateId}
          sections={template.sections.map((section) => ({
            id: section.id,
            type: section.type,
            settings: section.props || {},
            blocks: section.blocks || [],
            enabled: section.enabled,
          }))}
          store={store}
          pageType="search"
          products={products}
          collections={collections}
          cart={cart}
        />
      ) : (
        // Fallback if no template
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {searchQuery ? `Search Results: "${searchQuery}"` : 'Search'}
            </h1>
            <p className="text-gray-600">
              {productCount > 0
                ? `Found ${productCount} product${productCount === 1 ? '' : 's'}`
                : searchQuery
                  ? 'No products found. Try a different search term.'
                  : 'Enter a search term to find products.'}
            </p>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 truncate">{product.title}</h3>
                    <p className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </StorePageWrapper>
  );
}

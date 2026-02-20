/**
 * Search Results Page - MVP Simple Theme System
 *
 * Uses the old React Component System (legacy templates)
 * instead of Shopify OS 2.0 section-based system.
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { Suspense } from 'react';
import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { eq, and, like, desc } from 'drizzle-orm';
import { products } from '@db/schema';
import { createDb } from '~/lib/db.server';
import { resolveStore } from '~/lib/store.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import { Search, ShoppingBag, ChevronRight } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';

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

  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const db = createDb(context.cloudflare.env.DB);

  // Route guard: Check if store routes are enabled
  if (store.storeEnabled === false) {
    throw new Response('Store mode is not enabled for this shop.', { status: 404 });
  }

  // Use unified settings (single source of truth)
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Extract settings from unified (previously from toLegacyFormat)
  const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const theme = {
    ...baseTheme,
    primary: unifiedSettings.theme.primary || baseTheme.primary,
    accent: unifiedSettings.theme.accent || baseTheme.accent,
  };

  // Legacy compat object for storeName/logo
  const legacyCompat = {
    storeName: unifiedSettings.branding.storeName || store?.name || 'Store',
    logo: unifiedSettings.branding.logo || store?.logo || null,
  };

  const socialLinks = {
    facebook: unifiedSettings.social.facebook ?? undefined,
    instagram: unifiedSettings.social.instagram ?? undefined,
    whatsapp: unifiedSettings.social.whatsapp ?? undefined,
    twitter: unifiedSettings.social.twitter ?? undefined,
    youtube: unifiedSettings.social.youtube ?? undefined,
    linkedin: unifiedSettings.social.linkedin ?? undefined,
  };

  const businessInfo = {
    phone: unifiedSettings.business.phone ?? undefined,
    email: unifiedSettings.business.email ?? undefined,
    address: unifiedSettings.business.address ?? undefined,
  };

  // Use unified settings theme
  const mergedTheme = theme;

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

  return json({
    searchQuery: searchQuery.trim(),
    products: searchResults,
    productCount: searchResults.length,
    collections,
    storeId: storeId as number,
    storeName: legacyCompat.storeName || store.name || 'Store',
    logo: legacyCompat.logo || store.logo || null,
    currency: store.currency || '৳',
    storeTemplateId,
    theme: mergedTheme,
    socialLinks,
    businessInfo,
    themeConfig: {
      primaryColor: mergedTheme.primary,
      accentColor: mergedTheme.accent,
      storeTemplateId,
    },
    planType: store.planType || 'free',
  });
}

export default function SearchPage() {
  const {
    searchQuery,
    products,
    productCount,
    collections,
    storeId,
    storeName,
    logo,
    currency,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    planType,
  } = useLoaderData<typeof loader>();

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
      >
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <SimpleSearchPage
            query={searchQuery}
            products={products}
            productCount={productCount}
            collections={collections}
            currency={currency}
          />
        </Suspense>
      </StorePageWrapper>
    </>
  );
}

// ============================================================================
// SIMPLE SEARCH PAGE (Fallback)
// ============================================================================
function SimpleSearchPage({
  query,
  products,
  productCount,
  currency,
}: {
  query: string;
  products: SearchProduct[];
  productCount: number;
  currency: string;
  collections?: SearchCollection[];
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-8 h-8 text-[var(--color-primary)]" />
          <h1 className="text-3xl font-bold text-gray-900">
            {query ? `Search Results: "${query}"` : 'Search'}
          </h1>
        </div>
        <p className="text-gray-600">
          {productCount > 0
            ? `Found ${productCount} product${productCount === 1 ? '' : 's'}`
            : query
              ? 'No products found. Try a different search term.'
              : 'Enter a search term to find products.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-12">
        <form action="/search" method="get" className="flex gap-2 max-w-2xl">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search for products..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </form>
      </div>

      {/* Search Results */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 truncate group-hover:text-[var(--color-primary)] transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--color-primary)]">
                    {formatPrice(product.price, currency)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice, currency)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        /* No Results */
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We couldn&apos;t find any products matching &quot;{query}&quot;. Try checking your
            spelling or use a different search term.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
          >
            Browse All Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Empty Search */
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">What are you looking for?</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Enter a keyword above to search our product catalog.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
          >
            Browse All Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
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

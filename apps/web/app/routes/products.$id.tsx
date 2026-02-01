/**
 * Product Detail Page - MVP Simple Theme System
 *
 * Uses the old React Component System (legacy templates)
 * instead of Shopify OS 2.0 section-based system.
 *
 * Each template provides a ProductPage component for product detail pages.
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { eq, and, desc, ne, like } from 'drizzle-orm';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getStoreConfig } from '~/services/store-config.server';
import { products, reviews, productVariants } from '@db/schema';
import { parseSocialLinks } from '@db/types';
import { useEffect, useRef, useState, Suspense } from 'react';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplateTheme,
  getStoreTemplate,
  DEFAULT_STORE_TEMPLATE_ID,
  type SerializedProduct,
} from '~/templates/store-registry';
import { getCustomer } from '~/services/customer-auth.server';
import { formatPrice } from '~/lib/theme-engine';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }];
  }

  const title = data.product.seoTitle || `${data.product.title} | ${data.storeName}`;
  const description =
    data.product.seoDescription ||
    (data.product.description || `Shop ${data.product.title}`).slice(0, 160);
  const url = data.productUrl || '';

  const metaTags: ReturnType<MetaFunction> = [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'product' },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];

  if (data.product.seoKeywords) {
    metaTags.push({ name: 'keywords', content: data.product.seoKeywords });
  }

  if (data.product.imageUrl) {
    metaTags.push({ property: 'og:image', content: data.product.imageUrl });
    metaTags.push({ name: 'twitter:image', content: data.product.imageUrl });
  }

  return metaTags;
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  try {
    const productId = parseInt(params.id || '', 10);

    if (isNaN(productId)) {
      throw new Response('Invalid product ID', { status: 400 });
    }

    const storeContext = await resolveStore(context, request);

    if (!storeContext) {
      throw new Response('Store not found.', { status: 404 });
    }

    const { storeId, store } = storeContext;
    const db = createDb(context.cloudflare.env.DB);
    const cache = new D1Cache(db);

    // Use cached store configuration
    const storeConfig = await getStoreConfig(db, cache, storeId);

    if (!storeConfig) {
      throw new Response('Store configuration not found', { status: 404 });
    }

    // Route guard: Check if store routes are enabled
    if (store.storeEnabled === false) {
      throw new Response('Store mode is not enabled for this shop.', { status: 404 });
    }

    const { themeConfig, businessInfo, footerConfig } = storeConfig;
    const storeTemplateId =
      themeConfig?.storeTemplateId || (store.theme as string) || DEFAULT_STORE_TEMPLATE_ID;

    // Get theme colors from themeConfig
    const baseTheme = getStoreTemplateTheme(storeTemplateId);
    const theme = {
      ...baseTheme,
      primary: themeConfig?.primaryColor || baseTheme.primary,
      accent: themeConfig?.accentColor || baseTheme.accent,
    };

    const socialLinks =
      storeConfig.socialLinks || parseSocialLinks(store.socialLinks as string | null);

    // Load customer session
    const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

    // Batch fetch product, reviews, categories
    const showReviews = store?.planType !== 'free';
    const categoryCacheKey = `store:${storeId}:categories`;
    let categories = await cache.get<string[]>(categoryCacheKey);

    // Build queries individually
    const productQuery = db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.storeId, storeId),
          eq(products.isPublished, true)
        )
      )
      .limit(1);

    const reviewsQuery = showReviews
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
      : null;

    const categoriesQuery = !categories
      ? db
          .select({ category: products.category })
          .from(products)
          .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
      : null;

    const variantsQuery = db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, productId), eq(productVariants.isAvailable, true)))
      .orderBy(productVariants.id);

    // Execute queries in parallel
    const [productResult, reviewsResult, categoriesResult, variantsResult] = await Promise.all([
      productQuery,
      reviewsQuery,
      categoriesQuery,
      variantsQuery,
    ]);

    const product = productResult[0];
    if (!product) {
      throw new Response('Product not found', { status: 404 });
    }

    const productReviews = reviewsResult || [];

    // Handle categories
    if (!categories && categoriesResult) {
      categories = [
        ...new Set(categoriesResult.map((p) => p.category).filter((c): c is string => Boolean(c))),
      ];
      await cache.set(categoryCacheKey, categories, 3600);
    }

    const reviewCount = productReviews.length;
    const avgRating =
      reviewCount > 0
        ? productReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          reviewCount
        : 0;

    // Related products
    let relatedProducts: (typeof product)[] = [];
    if (product.category) {
      relatedProducts = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.storeId, storeId),
            ne(products.id, productId),
            like(products.category, product.category)
          )
        )
        .limit(8);
    }

    if (relatedProducts.length < 4) {
      const moreProducts = await db
        .select()
        .from(products)
        .where(and(eq(products.storeId, storeId), ne(products.id, productId)))
        .limit(8 - relatedProducts.length)
        .orderBy(desc(products.createdAt));

      const existingIds = new Set(relatedProducts.map((p) => p.id));
      for (const p of moreProducts) {
        if (!existingIds.has(p.id)) relatedProducts.push(p);
      }
    }

    const url = new URL(request.url);
    const productUrl = `${url.protocol}//${url.host}/products/${product.id}`;

    return json({
      product: {
        ...product,
        variants: variantsResult || [],
      },
      storeName: store?.name || 'Store',
      logo: store?.logo || null,
      currency: store?.currency || 'BDT',
      showReviews,
      reviews: productReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
      storeId,
      storeTemplateId,
      theme,
      socialLinks,
      businessInfo,
      footerConfig,
      categories,
      relatedProducts,
      planType: store?.planType || 'free',
      customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
      productUrl,
      themeConfig,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    console.error('[products.$id] Loader error:', error);

    throw new Response(
      `Product page error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500, statusText: 'Internal Server Error' }
    );
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ProductDetail() {
  const {
    product,
    storeName,
    logo,
    currency,
    showReviews,
    relatedProducts,
    reviews: productReviews,
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
    productUrl,
    themeConfig,
  } = useLoaderData<typeof loader>();

  const hasTracked = useRef(false);

  // Track ViewContent event
  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    trackingEvents.viewContent({
      id: String(product.id),
      name: product.title,
      price: product.price,
      currency: currency,
      category: product.category || undefined,
    });
  }, [product, currency]);

  // Cart state management
  const [cart, setCart] = useState<{
    items: Array<{
      id: number;
      productId: number;
      title: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }>;
    itemCount: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart) as Array<{
          productId: number;
          title: string;
          price: number;
          quantity: number;
          imageUrl: string | null;
        }>;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setCart({
          items: items.map((item, index) => ({
            id: item.productId,
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || undefined,
          })),
          itemCount,
          total,
        });
      } catch {
        // Ignore parse errors
      }
    }

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        try {
          const items = JSON.parse(updatedCart) as Array<{
            productId: number;
            title: string;
            price: number;
            quantity: number;
            imageUrl: string | null;
          }>;
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          setCart({
            items: items.map((item) => ({
              id: item.productId,
              productId: item.productId,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl || undefined,
            })),
            itemCount,
            total,
          });
        } catch {
          // Ignore parse errors
        }
      } else {
        setCart(null);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  // Parse product images
  const images: string[] = product.images
    ? JSON.parse(product.images)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  // Get template from registry (MVP Simple System)
  const template = getStoreTemplate(storeTemplateId);
  const ProductPageComponent = template.ProductPage;

  // Create product schema for SEO
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.seoDescription || product.description || product.title,
    image: product.imageUrl ? [product.imageUrl] : undefined,
    sku: product.sku || undefined,
    brand: storeName ? { '@type': 'Brand', name: storeName } : undefined,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: product.price,
      availability:
        product.inventory && product.inventory > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating:
      reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount: reviewCount,
          }
        : undefined,
  };

  // Serialize related products for template
  const serializedRelatedProducts: SerializedProduct[] = relatedProducts.map((p) => ({
    id: p.id,
    storeId: p.storeId,
    title: p.title,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.imageUrl,
    images: p.imageUrl ? [p.imageUrl] : [],
    inventory: p.inventory,
    category: p.category,
  }));

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
      categories={categories as (string | null)[] | undefined}
      config={{
        primaryColor: theme.primary,
        accentColor: theme.accent,
      }}
      footerConfig={footerConfig}
      planType={planType}
      customer={customer}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* MVP Simple System: Use template's ProductPage component */}
      {ProductPageComponent ? (
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <ProductPageComponent
            product={{
              ...product,
              images,
            }}
            currency={currency}
            relatedProducts={serializedRelatedProducts}
            reviews={productReviews}
            avgRating={avgRating}
            reviewCount={reviewCount}
            showReviews={showReviews}
            storeName={storeName}
            theme={theme}
          />
        </Suspense>
      ) : (
        // Fallback: Simple product page if template doesn't have ProductPage
        <SimpleProductPage
          product={product}
          currency={currency}
          relatedProducts={serializedRelatedProducts}
          theme={theme}
        />
      )}
    </StorePageWrapper>
  );
}

// Simple fallback product page component
function SimpleProductPage({
  product,
  currency,
  relatedProducts,
  theme,
}: {
  product: {
    id: number;
    title: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    images: string[];
    inventory: number | null;
    category: string | null;
    variants: Array<{
      id: number;
      price: number | null;
      compareAtPrice: number | null;
      sku: string | null;
      inventory: number | null;
      isAvailable: boolean | null;
    }>;
  };
  currency: string;
  relatedProducts: SerializedProduct[];
  theme: {
    primary: string;
    accent: string;
  };
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>
            {formatPrice(product.price, currency)}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </p>
          {product.description && (
            <div className="prose mb-6" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}
          <button
            className="w-full text-white py-3 rounded-lg font-semibold transition"
            style={{ backgroundColor: theme.primary }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((related) => (
              <a
                key={related.id}
                href={`/products/${related.id}`}
                className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-square bg-gray-100">
                  {related.imageUrl ? (
                    <img
                      src={related.imageUrl}
                      alt={related.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{related.title}</h3>
                  <p className="text-sm mt-1" style={{ color: theme.primary }}>
                    {formatPrice(related.price, currency)}
                  </p>
                </div>
              </a>
            ))}
          </div>
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
          {error.data && <p className="text-sm text-gray-500 mb-6">{error.data}</p>}
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Available</h1>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : 'Something went wrong loading this product.'}
        </p>
        <a
          href="/products"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Products
        </a>
      </div>
    </div>
  );
}

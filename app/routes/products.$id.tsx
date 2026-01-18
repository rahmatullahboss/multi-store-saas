/**
 * Product Detail Page
 * 
 * Template-aware product detail page using the NEW template system.
 * Renders sections from published template via StoreSectionRenderer.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq, and, desc, ne, like } from 'drizzle-orm';
import { resolveStore } from '~/lib/store.server';
import { resolveTemplate, type ProductContext } from '~/lib/template-resolver.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getStoreConfig } from '~/services/store-config.server';
import { products, reviews } from '@db/schema';
import { parseSocialLinks } from '@db/types';
import { useEffect, useRef } from 'react';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { StoreSectionRenderer } from '~/components/store/StoreSectionRenderer';
import { getCustomer } from '~/services/customer-auth.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }];
  }
  
  const title = data.product.seoTitle || `${data.product.title} | ${data.storeName}`;
  const description = data.product.seoDescription || (data.product.description || `Shop ${data.product.title}`).slice(0, 160);

  const metaTags: ReturnType<MetaFunction>  = [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ];

  if (data.product.seoKeywords) {
    metaTags.push({ name: 'keywords', content: data.product.seoKeywords });
  }

  if (data.product.imageUrl) {
    metaTags.push({ property: 'og:image', content: data.product.imageUrl });
  }

  return metaTags;
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
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
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  const socialLinks = storeConfig.socialLinks || parseSocialLinks(store.socialLinks as string | null);
  
  // Load customer session
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);
  
  // Batch fetch product, reviews, categories
  const showReviews = store?.planType !== 'free';
  const categoryCacheKey = `store:${storeId}:categories`;
  let categories = await cache.get<string[]>(categoryCacheKey);
  
  type QueryType = ReturnType<typeof db.select>;
  const queries: QueryType[] = [
    db.select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId), eq(products.isPublished, true)))
      .limit(1)
  ];
  
  if (showReviews) {
    queries.push(
      db.select({
        id: reviews.id,
        customerName: reviews.customerName,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.storeId, storeId), eq(reviews.status, 'approved')))
      .orderBy(desc(reviews.createdAt))
      .limit(20)
    );
  }
  
  if (!categories) {
    queries.push(
      db.select({ category: products.category })
        .from(products)
        .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    );
  }
  
  const batchResults = await db.batch(queries as Parameters<typeof db.batch>[0]);
  
  const product = batchResults[0][0];
  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }
  
  const productReviews = showReviews ? batchResults[1] : [];
  
  // Handle categories
  if (!categories) {
    const categoriesResult = (showReviews ? batchResults[2] : batchResults[1]) as Array<{ category: string | null }>;
    categories = [...new Set(categoriesResult.map(p => p.category).filter((c): c is string => Boolean(c)))];
    await cache.set(categoryCacheKey, categories, 3600);
  }
  
  const reviewCount = productReviews.length;
  const avgRating = reviewCount > 0 
    ? productReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount 
    : 0;

  // Related products
  let relatedProducts: typeof product[] = [];
  if (product.category) {
    relatedProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), ne(products.id, productId), like(products.category, product.category)))
      .limit(8);
  }
  
  if (relatedProducts.length < 4) {
    const moreProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), ne(products.id, productId)))
      .limit(8 - relatedProducts.length)
      .orderBy(desc(products.createdAt));
      
    const existingIds = new Set(relatedProducts.map(p => p.id));
    for (const p of moreProducts) {
      if (!existingIds.has(p.id)) relatedProducts.push(p);
    }
  }
  
  // Template resolution (NEW SYSTEM)
  const template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'product');
  
  return json({
    product,
    storeName: store?.name || 'Store',
    logo: store.logo || null,
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
    themeConfig,
    footerConfig,
    categories,
    relatedProducts,
    planType: store?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    template,
  });
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
    themeConfig,
    footerConfig,
    categories,
    planType,
    customer,
    template,
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

  // Parse product images
  const images: string[] = product.images 
    ? JSON.parse(product.images) 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  // Parse variants
  let variants: Array<{ name: string; value: string; price?: number }> = [];
  if (product.variants) {
    try {
      variants = JSON.parse(product.variants);
    } catch {
      // Ignore parse errors
    }
  }
  
  // Build RenderContext for sections (ProductContext)
  const renderContext: ProductContext = {
    kind: 'product',
    shop: {
      name: storeName,
      currency,
      domain: '',
    },
    theme: template?.settings || {
      primaryColor: theme.primary,
      accentColor: theme.accent,
      backgroundColor: theme.background,
      textColor: theme.text,
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    currency,
    product: {
      id: String(product.id),
      handle: String(product.id),
      title: product.title,
      description: product.description || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || undefined,
      images,
      variants,
      category: product.category || undefined,
      reviews: showReviews ? {
        count: reviewCount,
        average: avgRating,
        items: productReviews.map((r: { id: number; customerName: string; rating: number; comment: string | null; createdAt: Date | null }) => ({
          id: String(r.id),
          author: r.customerName,
          rating: r.rating,
          comment: r.comment || '',
          date: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
        })),
      } : undefined,
    },
    relatedProducts: relatedProducts.map(p => ({
      id: String(p.id),
      handle: String(p.id),
      title: p.title,
      price: p.price,
      compareAtPrice: p.compareAtPrice || undefined,
      imageUrl: p.imageUrl || undefined,
    })),
  };
  
  // Check if we have published template sections
  const hasTemplateSections = template?.sections && template.sections.length > 0;

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
      config={themeConfig}
      footerConfig={footerConfig}
      planType={planType}
      customer={customer}
    >
      {hasTemplateSections ? (
        <StoreSectionRenderer
          sections={template!.sections}
          context={renderContext}
        />
      ) : (
        // Fallback: Default product display
        <div className="min-h-screen py-8 px-4" style={{ backgroundColor: theme.background }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Gallery */}
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  {images[0] && (
                    <img
                      src={images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(1, 5).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  {product.category && (
                    <p className="text-sm" style={{ color: theme.accent }}>{product.category}</p>
                  )}
                  <h1 className="text-3xl font-bold mt-1" style={{ color: theme.text }}>
                    {product.title}
                  </h1>
                </div>
                
                {/* Rating */}
                {showReviews && reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ color: star <= avgRating ? '#fbbf24' : '#d1d5db' }}>★</span>
                      ))}
                    </div>
                    <span className="text-sm" style={{ color: theme.muted }}>({reviewCount} reviews)</span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold" style={{ color: theme.primary }}>
                    {currency} {product.price}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xl line-through text-gray-400">
                      {currency} {product.compareAtPrice}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {product.description && (
                  <div 
                    className="prose prose-sm max-w-none"
                    style={{ color: theme.text }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                )}
                
                {/* Add to Cart */}
                <button
                  onClick={() => {
                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const existing = cart.find((item: { productId: number }) => item.productId === product.id);
                    if (existing) {
                      existing.quantity += 1;
                    } else {
                      cart.push({
                        productId: product.id,
                        title: product.title,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        quantity: 1,
                      });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    window.dispatchEvent(new Event('cart-updated'));
                    trackingEvents.addToCart({
                      id: String(product.id),
                      name: product.title,
                      price: product.price,
                      currency,
                      quantity: 1,
                    });
                  }}
                  className="w-full py-4 rounded-xl text-white font-semibold text-lg transition hover:opacity-90"
                  style={{ backgroundColor: theme.primary }}
                >
                  Add to Cart
                </button>
                
                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: theme.muted + '20' }}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🚚</div>
                    <div className="text-xs" style={{ color: theme.muted }}>Fast Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="text-xs" style={{ color: theme.muted }}>Secure Payment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">↩️</div>
                    <div className="text-xs" style={{ color: theme.muted }}>Easy Returns</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
                  You May Also Like
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.slice(0, 4).map(p => (
                    <a
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="group rounded-xl overflow-hidden border hover:shadow-lg transition"
                      style={{ borderColor: theme.muted + '20' }}
                    >
                      <div className="aspect-square bg-gray-100">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium truncate" style={{ color: theme.text }}>{p.title}</h3>
                        <p className="font-bold mt-1" style={{ color: theme.primary }}>
                          {currency} {p.price}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </StorePageWrapper>
  );
}

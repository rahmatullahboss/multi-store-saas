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
import { useEffect, useRef, Suspense } from 'react';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, getStoreTemplate, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { StoreSectionRenderer } from '~/components/store/StoreSectionRenderer';
import { DEFAULT_PRODUCT_SECTIONS } from '~/components/store-sections/registry';
import { getCustomer } from '~/services/customer-auth.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }];
  }
  
  const title = data.product.seoTitle || `${data.product.title} | ${data.storeName}`;
  const description = data.product.seoDescription || (data.product.description || `Shop ${data.product.title}`).slice(0, 160);
  const url = data.productUrl || '';

  const metaTags: ReturnType<MetaFunction>  = [
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
    const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
    const theme = getStoreTemplateTheme(storeTemplateId);
    const socialLinks = storeConfig.socialLinks || parseSocialLinks(store.socialLinks as string | null);
    
    // Load customer session
    const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);
    
    // Batch fetch product, reviews, categories
    const showReviews = store?.planType !== 'free';
    const categoryCacheKey = `store:${storeId}:categories`;
    let categories = await cache.get<string[]>(categoryCacheKey);
    
    // Build queries individually to avoid batch type issues
    const productQuery = db.select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId), eq(products.isPublished, true)))
      .limit(1);
    
    const reviewsQuery = showReviews 
      ? db.select({
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
      : null;
    
    const categoriesQuery = !categories 
      ? db.select({ category: products.category })
          .from(products)
          .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
      : null;
    
    // Execute queries (can't use batch due to type complexity, run in parallel)
    const [productResult, reviewsResult, categoriesResult] = await Promise.all([
      productQuery,
      reviewsQuery,
      categoriesQuery,
    ]);
    
    const product = productResult[0];
    if (!product) {
      throw new Response('Product not found', { status: 404 });
    }
    
    const productReviews = reviewsResult || [];
    
    // Handle categories
    if (!categories && categoriesResult) {
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
    
    // Template resolution (NEW SYSTEM) - wrapped in try-catch for safety
    let template = null;
    try {
      template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'product');
    } catch (templateError) {
      console.error('[products.$id] Template resolution failed:', templateError);
      // Continue without template - fallback UI will be used
    }
    
    const url = new URL(request.url);
    const productUrl = `${url.protocol}//${url.host}/products/${product.id}`;

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
      productUrl,
    });
  } catch (error) {
    // Re-throw Response errors as-is
    if (error instanceof Response) {
      throw error;
    }
    
    // Log the actual error for debugging
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
    themeConfig,
    footerConfig,
    categories,
    planType,
    customer,
    template,
    productUrl,
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
  const productAny = product as any;
  if (productAny.variants) {
    try {
      variants = JSON.parse(productAny.variants);
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
        items: (productReviews as any[]).map((r) => ({
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
  
  // Get template definition to check for ProductPage component
  const templateDef = getStoreTemplate(storeTemplateId);

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
      availability: product.inventory && product.inventory > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: reviewCount,
    } : undefined,
  };

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
      config={themeConfig}
      footerConfig={footerConfig}
      planType={planType}
      customer={customer}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Use template-specific ProductPage if available */}
      {templateDef.ProductPage ? (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
          <templateDef.ProductPage
            product={product}
            currency={currency}
            relatedProducts={relatedProducts}
          />
        </Suspense>
      ) : (
        <StoreSectionRenderer
          sections={(hasTemplateSections ? template!.sections : DEFAULT_PRODUCT_SECTIONS.map(s => ({
            ...s,
            enabled: true,
            sortOrder: 0,
            props: s.settings,
          }))) as any}
          context={renderContext}
        />
      )}
    </StorePageWrapper>
  );
}


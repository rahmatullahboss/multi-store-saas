/**
 * Product Detail Page
 * 
 * Template-aware product detail page with add to cart functionality.
 * Uses StorePageWrapper for consistent template styling.
 * Includes review section (PAID PLANS ONLY):
 * - Average rating summary
 * - List of approved reviews
 * - Review submission form
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link, useFetcher } from '@remix-run/react';
import { eq, and, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products, reviews, stores, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks, type ThemeConfig, type SocialLinks } from '@db/types';
import { AddToCartButton } from '~/components/AddToCartButton';
import { resolveStore } from '~/lib/store.server';
import { Star, Send, CheckCircle, ShoppingBag, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }];
  }
  
  // Use custom SEO title or fallback to standard format
  const title = (data.product as any).seoTitle 
    ? (data.product as any).seoTitle 
    : `${data.product.title} | ${data.storeName}`;
    
  // Use custom SEO description or fallback to truncated product description
  const description = (data.product as any).seoDescription 
    ? (data.product as any).seoDescription 
    : (data.product.description || `Shop ${data.product.title}`).slice(0, 160);

  const metaTags: any[] = [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ];

  // Add keywords if available
  if ((data.product as any).seoKeywords) {
    metaTags.push({ name: 'keywords', content: (data.product as any).seoKeywords });
  }

  // Add OG Image if available
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
  
  // Resolve store (handles both production and development mode)
  const storeContext = await resolveStore(context, request);
  
  if (!storeContext) {
    throw new Response('Store not found. Please check your store configuration.', { status: 404 });
  }
  
  const { storeId, store } = storeContext;
  const db = drizzle(context.cloudflare.env.DB);
  
  // Fetch store details for template config
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const storeData = storeResult[0] as Store | undefined;
  
  const themeConfig = parseThemeConfig(storeData?.themeConfig as string | null);
  const socialLinks = parseSocialLinks(storeData?.socialLinks as string | null);
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  
  // Parse businessInfo safely
  let businessInfo: { phone?: string; email?: string; address?: string } | null = null;
  try {
    if (storeData?.businessInfo) {
      businessInfo = JSON.parse(storeData.businessInfo as string);
    }
  } catch {
    // Ignore parse errors
  }
  
  // Fetch product with store_id filter for security
  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId), // Always verify store ownership!
        eq(products.isPublished, true)
      )
    )
    .limit(1);
  
  const product = result[0];
  
  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }
  
  // ========== REVIEWS: Only for paid plans ==========
  const showReviews = store?.planType !== 'free';
  let productReviews: Array<{
    id: number;
    customerName: string;
    rating: number;
    comment: string | null;
    createdAt: Date | null;
  }> = [];
  let avgRating = 0;
  let reviewCount = 0;
  
  if (showReviews) {
    // Fetch only APPROVED reviews for this product
    productReviews = await db
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
      .limit(20); // Limit to 20 most recent reviews
    
    reviewCount = productReviews.length;
    avgRating = reviewCount > 0 
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
      : 0;
  }
  
  return json({
    product,
    storeName: store?.name || 'Store',
    logo: storeData?.logo || null,
    currency: store?.currency || 'BDT',
    showReviews,
    reviews: productReviews,
    avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    reviewCount,
    storeId,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
  });
}

// ============================================================================
// STAR RATING DISPLAY COMPONENT
// ============================================================================
function StarRating({ rating, size = 'md', isDark = false }: { rating: number; size?: 'sm' | 'md' | 'lg'; isDark?: boolean }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating 
              ? 'text-amber-400 fill-amber-400' 
              : star - 0.5 <= rating 
                ? 'text-amber-400 fill-amber-200' 
                : isDark ? 'text-gray-600' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// STAR RATING INPUT COMPONENT
// ============================================================================
function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hoverValue, setHoverValue] = useState(0);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoverValue || value)
                ? 'text-amber-400 fill-amber-400' 
                : 'text-gray-300 hover:text-amber-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// REVIEW FORM COMPONENT
// ============================================================================
function ReviewForm({ productId, storeId, isDark = false }: { productId: number; storeId: number; isDark?: boolean }) {
  const fetcher = useFetcher();
  const [rating, setRating] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data && typeof fetcher.data === 'object' && 'success' in fetcher.data && fetcher.data.success;
  const errorMessage = fetcher.data && typeof fetcher.data === 'object' && 'error' in fetcher.data ? String(fetcher.data.error) : null;
  
  const bgClass = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-700';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';
  
  // Show success message briefly
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setRating(0);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);
  
  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">Thank you for your review!</h3>
        <p className="text-green-600">Your review has been submitted and is pending approval.</p>
      </div>
    );
  }
  
  return (
    <div className={`${bgClass} rounded-xl p-6`}>
      <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Write a Review</h3>
      
      <fetcher.Form method="post" action="/api/reviews" className="space-y-4">
        <input type="hidden" name="productId" value={productId} />
        
        {/* Rating */}
        <div>
          <label className={`block text-sm font-medium ${textMuted} mb-2`}>
            Your Rating <span className="text-red-500">*</span>
          </label>
          <StarRatingInput value={rating} onChange={setRating} />
          <input type="hidden" name="rating" value={rating} />
        </div>
        
        {/* Name */}
        <div>
          <label className={`block text-sm font-medium ${textMuted} mb-1`}>
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            required
            placeholder="Enter your name"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${inputBg}`}
          />
        </div>
        
        {/* Comment */}
        <div>
          <label className={`block text-sm font-medium ${textMuted} mb-1`}>
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comment"
            required
            rows={4}
            placeholder="Share your experience with this product..."
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${inputBg}`}
          />
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}
        
        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </fetcher.Form>
    </div>
  );
}

// ============================================================================
// REVIEW LIST COMPONENT
// ============================================================================
function ReviewList({ reviews, isDark = false }: { reviews: Array<{
  id: number;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string | null;
}>; isDark?: boolean }) {
  const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  
  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${textMuted}`}>
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className={`border rounded-lg p-4 ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {review.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className={`font-medium ${textPrimary}`}>{review.customerName}</p>
                <StarRating rating={review.rating} size="sm" isDark={isDark} />
              </div>
            </div>
            <span className={`text-sm ${textMuted}`}>
              {review.createdAt 
                ? new Date(review.createdAt).toLocaleDateString() 
                : ''}
            </span>
          </div>
          {review.comment && (
            <p className={`${textMuted} mt-2`}>{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
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
    reviews: productReviews, 
    avgRating, 
    reviewCount,
    storeId,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo
  } = useLoaderData<typeof loader>();
  
  const hasTracked = useRef(false);
  const isDarkTheme = storeTemplateId === 'modern-premium' || storeTemplateId === 'tech-modern';
  
  // Template-aware styling
  const cardBg = isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkTheme ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkTheme ? 'border-gray-700' : 'border-gray-200';
  const breadcrumbBg = isDarkTheme ? 'bg-gray-800/50 border-gray-800' : 'bg-white border-gray-100';
  
  // Track ViewContent event (FB Pixel + GA4) - only once on mount
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
    
    console.log('[Tracking] ViewContent event fired:', product.title, product.price);
  }, [product, currency]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  // Parse images if stored as JSON
  const images: string[] = product.images 
    ? JSON.parse(product.images) 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  const [selectedImage, setSelectedImage] = useState(0);

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
    >
      {/* Breadcrumb */}
      <nav className={`border-b ${borderColor} ${breadcrumbBg}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className={`${textMuted} hover:${textPrimary} transition`}>Home</Link>
            <ChevronRight className={`w-4 h-4 ${textMuted}`} />
            <Link to="/products" className={`${textMuted} hover:${textPrimary} transition`}>Products</Link>
            <ChevronRight className={`w-4 h-4 ${textMuted}`} />
            <span className={textPrimary}>{product.title}</span>
          </div>
        </div>
      </nav>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className={`aspect-square rounded-2xl overflow-hidden border ${cardBg}`}>
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <ShoppingBag className={`w-24 h-24 ${isDarkTheme ? 'text-gray-700' : 'text-gray-300'}`} />
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i 
                        ? 'border-amber-500' 
                        : `${isDarkTheme ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                  style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                >
                  {product.category}
                </span>
              )}
              <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
                {product.title}
              </h1>
            </div>
            
            {/* Rating Summary (only for paid plans) */}
            {showReviews && reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} isDark={isDarkTheme} />
                <span className={textMuted}>
                  {avgRating}/5 ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold" style={{ color: theme.primary }}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className={`text-xl ${textMuted} line-through`}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                  {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                </span>
              )}
            </div>
            
            {product.description && (
              <div className={`prose ${isDarkTheme ? 'prose-invert' : 'prose-gray'} max-w-none`}>
                <p className={textMuted}>{product.description}</p>
              </div>
            )}
            
            {/* Stock status */}
            <div>
              {product.inventory && product.inventory > 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ In Stock ({product.inventory} available)
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Out of Stock
                </span>
              )}
            </div>
            
            {/* Add to Cart */}
            <div className="space-y-4">
              <AddToCartButton 
                productId={product.id} 
                disabled={!product.inventory || product.inventory <= 0}
                size="large"
                className="!w-full py-4 text-lg rounded-xl"
                style={{ backgroundColor: theme.primary }}
                productName={product.title}
                productPrice={product.price}
                currency={currency}
              />
            </div>
            
            {/* Trust badges */}
            <div className={`grid grid-cols-3 gap-4 pt-6 border-t ${borderColor}`}>
              <div className="text-center">
                <span className="text-2xl">🚚</span>
                <p className={`text-xs ${textMuted} mt-1`}>Fast Delivery</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">🔒</span>
                <p className={`text-xs ${textMuted} mt-1`}>Secure Payment</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">↩️</span>
                <p className={`text-xs ${textMuted} mt-1`}>Easy Returns</p>
              </div>
            </div>
            
            {/* Product details */}
            {product.sku && (
              <div className={`pt-6 border-t ${borderColor}`}>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className={textMuted}>SKU</dt>
                    <dd className={`${textPrimary} font-medium`}>{product.sku}</dd>
                  </div>
                  {product.category && (
                    <div>
                      <dt className={textMuted}>Category</dt>
                      <dd className={`${textPrimary} font-medium`}>{product.category}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
        
        {/* ============================================================== */}
        {/* REVIEWS SECTION - Only shown for paid plans */}
        {/* ============================================================== */}
        {showReviews && (
          <div className={`mt-16 pt-8 border-t ${borderColor}`}>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-8`}>Customer Reviews</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reviews List (2/3 width) */}
              <div className="lg:col-span-2">
                <ReviewList reviews={productReviews} isDark={isDarkTheme} />
              </div>
              
              {/* Review Form (1/3 width) */}
              <div>
                <ReviewForm productId={product.id} storeId={storeId} isDark={isDarkTheme} />
              </div>
            </div>
          </div>
        )}
      </div>
    </StorePageWrapper>
  );
}

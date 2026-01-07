/**
 * Product Detail Page
 * 
 * Shows a single product with add to cart functionality.
 * Includes review section (PAID PLANS ONLY):
 * - Average rating summary
 * - List of approved reviews
 * - Review submission form
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link, useFetcher } from '@remix-run/react';
import { eq, and, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products, reviews } from '@db/schema';
import { AddToCartButton } from '~/components/AddToCartButton';
import { resolveStore } from '~/lib/store.server';
import { Star, Send, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { trackingEvents } from '~/utils/tracking';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }];
  }
  return [
    { title: `${data.product.title} | ${data.storeName}` },
    { name: 'description', content: data.product.description || `Shop ${data.product.title}` },
  ];
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
    currency: store?.currency || 'USD',
    showReviews,
    reviews: productReviews,
    avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    reviewCount,
    storeId,
  });
}

// ============================================================================
// STAR RATING DISPLAY COMPONENT
// ============================================================================
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
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
                : 'text-gray-300'
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
function ReviewForm({ productId, storeId }: { productId: number; storeId: number }) {
  const fetcher = useFetcher();
  const [rating, setRating] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data && typeof fetcher.data === 'object' && 'success' in fetcher.data && fetcher.data.success;
  const errorMessage = fetcher.data && typeof fetcher.data === 'object' && 'error' in fetcher.data ? String(fetcher.data.error) : null;
  
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
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      <fetcher.Form method="post" action="/api/reviews" className="space-y-4">
        <input type="hidden" name="productId" value={productId} />
        
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <StarRatingInput value={rating} onChange={setRating} />
          <input type="hidden" name="rating" value={rating} />
        </div>
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            required
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comment"
            required
            rows={4}
            placeholder="Share your experience with this product..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
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
function ReviewList({ reviews }: { reviews: Array<{
  id: number;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string | null;
}> }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {review.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{review.customerName}</p>
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {review.createdAt 
                ? new Date(review.createdAt).toLocaleDateString() 
                : ''}
            </span>
          </div>
          {review.comment && (
            <p className="text-gray-600 mt-2">{review.comment}</p>
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
    currency, 
    showReviews, 
    reviews: productReviews, 
    avgRating, 
    reviewCount,
    storeId 
  } = useLoaderData<typeof loader>();
  
  const hasTracked = useRef(false);
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="store-header">
        <div className="container-store py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              {storeName}
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link to="/cart" className="relative p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="cart-badge" id="cart-count">0</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container-store py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </div>
      </nav>

      {/* Product Content */}
      <main className="container-store py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {images[0] ? (
                <img
                  src={images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>
            
            {/* Rating Summary (only for paid plans) */}
            {showReviews && reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={avgRating} />
                <span className="text-gray-600">
                  {avgRating}/5 ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-indigo-600">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            
            {product.description && (
              <div className="prose prose-gray mb-8">
                <p>{product.description}</p>
              </div>
            )}
            
            {/* Stock status */}
            <div className="mb-6">
              {product.inventory && product.inventory > 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  In Stock ({product.inventory} available)
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
                productName={product.title}
                productPrice={product.price}
                currency={currency}
              />
            </div>
            
            {/* Product details */}
            {product.sku && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">SKU</dt>
                    <dd className="text-gray-900 font-medium">{product.sku}</dd>
                  </div>
                  {product.category && (
                    <div>
                      <dt className="text-gray-500">Category</dt>
                      <dd className="text-gray-900 font-medium">{product.category}</dd>
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
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reviews List (2/3 width) */}
              <div className="lg:col-span-2">
                <ReviewList reviews={productReviews} />
              </div>
              
              {/* Review Form (1/3 width) */}
              <div>
                <ReviewForm productId={product.id} storeId={storeId} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

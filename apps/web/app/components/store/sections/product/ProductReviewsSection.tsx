/**
 * Product Reviews Section
 * 
 * Displays customer reviews and review form.
 */

import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { Star, ThumbsUp, User, Send, CheckCircle } from 'lucide-react';
import type { ProductContext } from '~/lib/template-resolver.server';

interface ProductReviewsSectionProps {
  sectionId: string;
  props: {
    showRating?: boolean;
    showForm?: boolean;
    reviewsPerPage?: number;
  };
  context: ProductContext;
}

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  verified?: boolean;
}



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
          <span
            className={`text-2xl transition-colors ${
              star <= (hoverValue || value)
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          >★</span>
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, storeId, themeColors }: { productId: number; storeId: number; themeColors: any }) {
  const fetcher = useFetcher();
  const [rating, setRating] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data && typeof fetcher.data === 'object' && 'success' in fetcher.data && fetcher.data.success;
  const errorMessage = fetcher.data && typeof fetcher.data === 'object' && 'error' in fetcher.data ? String(fetcher.data.error) : null;

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
      <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textColor }}>
        Write a Review
      </h3>

      <fetcher.Form method="post" action="/api/reviews" className="space-y-4">
        <input type="hidden" name="productId" value={productId} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <StarRatingInput value={rating} onChange={setRating} />
          <input type="hidden" name="rating" value={rating} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            required
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comment"
            required
            rows={4}
            placeholder="Share your experience with this product..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white"
          />
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          style={{ backgroundColor: themeColors.accentColor || '#4f46e5' }}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </fetcher.Form>
    </div>
  );
}

export default function ProductReviewsSection({ sectionId, props, context }: ProductReviewsSectionProps) {
  const {
    showRating = true,
    showForm = true,
    reviewsPerPage = 5,
  } = props;

  const product = context.product as any;
  const reviews: Review[] = (product?.reviews as Review[]) || [];
  const themeColors = context.theme;
  
  const [visibleCount, setVisibleCount] = useState(reviewsPerPage);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 
          className="text-2xl font-bold mb-6"
          style={{ 
            color: themeColors.textColor,
            fontFamily: themeColors.headingFont,
          }}
        >
          Customer Reviews
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Rating Summary */}
            {showRating && (
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold" style={{ color: themeColors.accentColor }}>
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {reviews.length} reviews
                    </p>
                  </div>

                  {/* Distribution */}
                  <div className="space-y-2">
                    {ratingDistribution.map(({ star, count, percentage }) => (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-8">{star}★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Review List */}
            <div className={showRating ? 'md:col-span-2' : 'md:col-span-3'}>
              <div className="space-y-4">
                {reviews.slice(0, visibleCount).map((review) => (
                  <ReviewCard key={review.id} review={review} themeColors={themeColors} />
                ))}
              </div>

              {reviews.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount(visibleCount + reviewsPerPage)}
                  className="mt-6 w-full py-3 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  style={{ color: themeColors.accentColor, borderColor: themeColors.accentColor }}
                >
                  Load More Reviews
                </button>
              )}
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mt-8">
            <ReviewForm productId={product?.id} storeId={context.storeId} themeColors={themeColors} />
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review, themeColors }: { review: Review; themeColors: any }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-500" />
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium" style={{ color: themeColors.textColor }}>
              {review.customerName}
            </span>
            {review.verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>

          {/* Stars */}
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-600 text-sm">{review.comment}</p>
          )}

          {/* Date */}
          {review.createdAt && (
            <p className="text-xs text-gray-400 mt-2">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

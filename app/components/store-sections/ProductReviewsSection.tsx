
import React, { useState, useEffect } from 'react';
import { SectionSettings } from './registry';
import { useFetcher } from '@remix-run/react';
import { Star, Send, CheckCircle } from 'lucide-react';

interface ProductReviewsSectionProps {
  settings: SectionSettings;
  product?: {
    id: number;
    title: string;
  };
  storeId?: number;
  reviews?: Array<{
    id: number;
    customerName: string;
    rating: number;
    comment: string | null;
    createdAt: Date | null | string;
  }>;
  showReviews?: boolean;
  theme?: {
    primaryColor?: string;
    textColor?: string;
    mutedColor?: string;
    isDarkTheme?: boolean;
    borderColor?: string;
  };
}

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

function ReviewList({ reviews, isDark = false }: { reviews: Array<{
  id: number;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: Date | null | string;
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

export function ProductReviewsSection({ settings, product, storeId, reviews = [], showReviews = false, theme }: ProductReviewsSectionProps) {
  if (!showReviews || !product || !storeId) return null;

  const textPrimary = theme?.textColor || 'text-gray-900';
  const borderColor = theme?.borderColor || 'border-gray-200';
  const isDarkTheme = theme?.isDarkTheme || false;

  return (
    <div className={`mt-16 pt-8 border-t ${borderColor}`}>
      <h2 className={`text-2xl font-bold ${textPrimary} mb-8`}>Customer Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List (2/3 width) */}
        <div className="lg:col-span-2">
          <ReviewList reviews={reviews} isDark={isDarkTheme} />
        </div>
        
        {/* Review Form (1/3 width) */}
        <div>
          <ReviewForm productId={product.id} storeId={storeId} isDark={isDarkTheme} />
        </div>
      </div>
    </div>
  );
}

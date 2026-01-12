/**
 * Reviews Management Dashboard
 * 
 * Route: /app/reviews
 * 
 * Features:
 * - View all product reviews for the store
 * - Filter by status: Pending, Published (approved), Rejected
 * - Approve or reject reviews
 * 
 * RESTRICTION: Paid plans only - Free users redirect to /app/upgrade
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { reviews, products, stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { 
  Star, 
  Check, 
  X, 
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Reviews - Ozzyl SaaS' }];
};

// ============================================================================
// LOADER
// ============================================================================
export const loader = async ({ request, context }: any) => {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get store to check plan
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  // ========== PLAN GATE: Redirect free users ==========
  if (!store || store.planType === 'free') {
    return redirect('/app/upgrade?feature=reviews');
  }
  
  // Fetch all reviews with product info
  const allReviews = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      customerName: reviews.customerName,
      rating: reviews.rating,
      comment: reviews.comment,
      status: reviews.status,
      createdAt: reviews.createdAt,
      productTitle: products.title,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.storeId, storeId))
    .orderBy(desc(reviews.createdAt));
  
  return json({ reviews: allReviews });
}

// ============================================================================
// STAR RATING COMPONENT
// ============================================================================
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating 
              ? 'text-amber-400 fill-amber-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// REVIEW ROW COMPONENT
// ============================================================================
function ReviewRow({ review, t }: { 
  review: {
    id: number;
    productId: number | null;
    customerName: string;
    rating: number;
    comment: string | null;
    status: string | null;
    createdAt: string | null;
    productTitle: string | null;
  };
  t: (key: any, options?: any) => string;
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';
  
  const handleModerate = (status: 'approved' | 'rejected') => {
    fetcher.submit(
      { reviewId: String(review.id), status },
      { method: 'PATCH', action: '/api/reviews' }
    );
  };
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-4">
        <span className="font-medium text-gray-900 line-clamp-1">
          {review.productTitle || t('unknownProduct')}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className="text-gray-700">{review.customerName}</span>
      </td>
      <td className="py-4 px-4">
        <StarRating rating={review.rating} />
      </td>
      <td className="py-4 px-4">
        <p className="text-gray-600 text-sm line-clamp-2 max-w-xs">
          {review.comment || '-'}
        </p>
      </td>
      <td className="py-4 px-4 text-gray-500 text-sm">
        {review.createdAt 
          ? new Date(review.createdAt).toLocaleDateString() 
          : '-'}
      </td>
      <td className="py-4 px-4">
        {review.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleModerate('approved')}
              disabled={isSubmitting}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
              title={t('approve')}
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleModerate('rejected')}
              disabled={isSubmitting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              title={t('reject')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            review.status === 'approved' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {review.status === 'approved' ? (
              <><CheckCircle className="w-3 h-3" /> {t('approved')}</>
            ) : (
              <><XCircle className="w-3 h-3" /> {t('rejected')}</>
            )}
          </span>
        )}
      </td>
    </tr>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ReviewsPage() {
  const { reviews: allReviews } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useTranslation();
  const activeTab = searchParams.get('tab') || 'pending';
  
  // Filter reviews by status
  const filteredReviews = allReviews.filter(r => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'published') return r.status === 'approved';
    if (activeTab === 'rejected') return r.status === 'rejected';
    return true;
  });
  
  const pendingCount = allReviews.filter(r => r.status === 'pending').length;
  const publishedCount = allReviews.filter(r => r.status === 'approved').length;
  const rejectedCount = allReviews.filter(r => r.status === 'rejected').length;
  
  const tabs = [
    { id: 'pending', label: t('pending'), count: pendingCount, icon: Clock },
    { id: 'published', label: t('published'), count: publishedCount, icon: CheckCircle },
    { id: 'rejected', label: t('rejected'), count: rejectedCount, icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('reviewsSection')}</h1>
        <p className="text-gray-500 mt-1">{t('reviewsSectionDesc')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            {t('pending')}
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {t('published')}
          </div>
          <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            {t('rejected')}
          </div>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition
                    ${isActive 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Table */}
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('noReviewsTitle', { status: t(activeTab) })}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'pending'
                ? t('noReviewsPendingDesc')
                : t('noReviewsOtherDesc', { status: t(activeTab) })
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('product')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('customer')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('rating')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('comment')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('date')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <ReviewRow key={review.id} review={review} t={t} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

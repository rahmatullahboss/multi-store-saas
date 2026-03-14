/**
 * Reviews API Route
 *
 * Route: /api/reviews
 *
 * Features:
 * - POST: Submit a new review (public, but restricted to paid stores)
 * - PATCH: Moderate reviews (approve/reject) - requires auth
 *
 * IMPORTANT: Reviews are a PAID feature only.
 * Free plan stores cannot accept reviews.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const REVIEW_MIN_LENGTH = 10;
const REVIEW_MAX_LENGTH = 1000;
const RATING_MIN = 1;
const RATING_MAX = 5;

import type { ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { reviews, stores, products } from '@db/schema';
import { getStoreId, requireUserId } from '~/services/auth.server';
import { resolveStore } from '~/lib/store.server';

// ============================================================================
// ACTION - Handle POST (submit) and PATCH (moderate) requests
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);

  if (request.method === 'POST') {
    // ========================================================================
    // PUBLIC: Submit a new review
    // ========================================================================
    const formData = await request.formData();
    const productId = Number(formData.get('productId'));
    const customerName = formData.get('customerName') as string;
    const rating = Number(formData.get('rating'));
    const comment = formData.get('comment') as string;

    // Validation
    if (!productId || isNaN(productId)) {
      return json({ error: 'Invalid product ID' }, { status: 400 });
    }

    if (!customerName || customerName.trim().length === 0) {
      return json({ error: 'Name is required' }, { status: 400 });
    }

    if (!rating || rating < RATING_MIN || rating > RATING_MAX) {
      return json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (!comment || comment.trim().length === 0) {
      return json({ error: 'Comment is required' }, { status: 400 });
    }

    if (comment.trim().length < REVIEW_MIN_LENGTH) {
      return json(
        { error: `Review must be at least ${REVIEW_MIN_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (comment.trim().length > REVIEW_MAX_LENGTH) {
      return json(
        { error: `Review cannot exceed ${REVIEW_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Resolve the store from request context
    const storeContext = await resolveStore(context, request);

    if (!storeContext) {
      return json({ error: 'Store not found' }, { status: 404 });
    }

    const { storeId, store } = storeContext;

    // ========== PLAN CHECK: Reject free users ==========
    if (store?.planType === 'free') {
      return json(
        {
          error: 'Reviews are a premium feature. Please upgrade to access customer reviews.',
          upgradeUrl: '/app/upgrade',
        },
        { status: 403 }
      );
    }

    // Verify product exists and belongs to this store
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
      .limit(1);

    if (!product) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    // ========== RATE LIMIT: Check if already reviewed ==========
    // SECURITY NOTE: This uses customerName which is user-supplied input.
    // This provides basic spam protection but can be bypassed by using different names.
    // For stronger protection, require authentication or email verification.
    const existingReview = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.productId, productId),
          eq(reviews.storeId, storeId),
          eq(reviews.customerName, customerName.trim())
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return json(
        {
          error:
            'You have already reviewed this product. Each customer can only submit one review per product.',
        },
        { status: 429 }
      );
    }

    // Insert review with 'pending' status
    await db.insert(reviews).values({
      storeId,
      productId,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      status: 'pending',
    });

    return json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending approval.',
    });
  }

  if (request.method === 'PATCH') {
    // ========================================================================
    // AUTHENTICATED: Moderate a review (approve/reject)
    // ========================================================================
    await requireUserId(request, context.cloudflare.env);
    const storeId = await getStoreId(request, context.cloudflare.env);

    if (!storeId) {
      return json({ error: 'Store not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const reviewId = Number(formData.get('reviewId'));
    const newStatus = formData.get('status') as 'approved' | 'rejected';

    // Validation
    if (!reviewId || isNaN(reviewId)) {
      return json({ error: 'Invalid review ID' }, { status: 400 });
    }

    if (!newStatus || !['approved', 'rejected'].includes(newStatus)) {
      return json({ error: 'Invalid status. Must be "approved" or "rejected"' }, { status: 400 });
    }

    // Verify review belongs to this store (security: multi-tenant isolation)
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.storeId, storeId)))
      .limit(1);

    if (!review) {
      return json({ error: 'Review not found' }, { status: 404 });
    }

    // Update the review status
    await db.update(reviews).set({ status: newStatus }).where(eq(reviews.id, reviewId));

    return json({
      success: true,
      message: `Review ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
    });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}

export default function () {}

## 1. Database Setup

- [ ] 1.1 Create Drizzle schema for reviews table in `packages/database/src/schema/reviews.ts`
- [ ] 1.2 Add composite index on (store_id, product_id)
- [ ] 1.3 Generate and run migration with `npm run db:migrate:local`
- [ ] 1.4 Verify table created with Drizzle Studio

## 2. Type Definitions

- [ ] 2.1 Add Review type in shared types
- [ ] 2.2 Add ReviewStatus type ('pending' | 'approved' | 'rejected')
- [ ] 2.3 Add API response types for reviews

## 3. Review Submission (Storefront)

- [ ] 3.1 Add POST action for `/api/reviews` route
- [ ] 3.2 Validate customer purchased product (check order status = delivered)
- [ ] 3.3 Check rate limit (no existing review)
- [ ] 3.4 Validate rating (1-5) and comment (10-1000 chars)
- [ ] 3.5 Insert review with status 'pending'
- [ ] 3.6 Add loader to fetch reviews for product page
- [ ] 3.7 Update product detail page to load and display reviews

## 4. Review Display (Storefront)

- [ ] 4.1 Create StarRating component in `app/components/store/`
- [ ] 4.2 Create ProductReviews component
- [ ] 4.3 Add pagination (10 per page)
- [ ] 4.4 Add sorting (Recent, Highest, Lowest)
- [ ] 4.5 Add review summary (avg rating + count) to product detail page

## 5. Product Card Updates

- [ ] 5.1 Update product loader to include aggregate rating
- [ ] 5.2 Add StarRating to product card component
- [ ] 5.3 Handle products with no reviews gracefully

## 6. Review Moderation (Admin)

- [ ] 6.1 Create `/app/products/$id/reviews` route for merchant view
- [ ] 6.2 Add loader to fetch all reviews for merchant's products
- [ ] 6.3 Add filtering by status (All, Pending, Approved, Rejected)
- [ ] 6.4 Add approve action (update status to 'approved')
- [ ] 6.5 Add reject action (update status to 'rejected')
- [ ] 6.6 Add delete action (permanent delete)
- [ ] 6.7 Add reply action (save merchant reply)

## 7. Distribution Chart

- [ ] 7.1 Calculate rating distribution in loader
- [ ] 7.2 Create RatingDistribution component
- [ ] 7.3 Add to product detail page

## 8. Testing

- [ ] 8.1 Write unit tests for review submission validation
- [ ] 8.2 Write unit tests for rating aggregation
- [ ] 8.3 Test multi-tenant isolation (reviews don't leak between stores)
- [ ] 8.4 Manual testing: submit review, approve, verify display
- [ ] 8.5 Manual testing: verify spam protection works

## 9. Polish

- [ ] 9.1 Add loading states for review sections
- [ ] 9.2 Add empty states (no reviews yet)
- [ ] 9.3 Add success/error toasts for actions
- [ ] 9.4 Verify responsive design on mobile

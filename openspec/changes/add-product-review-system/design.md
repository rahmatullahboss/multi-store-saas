## Context

The Multi-Store SaaS platform is a multi-tenant e-commerce system built on Cloudflare Workers, Remix v2, and Drizzle ORM with D1 database.

### Current State

- ✅ **REVIEWS TABLE EXISTS** - Schema defined in `packages/database/src/schema.ts`
- ✅ **API ENDPOINT EXISTS** - `/api/reviews` handles POST (submit) and PATCH (moderate)
- ✅ **UI COMPONENT EXISTS** - `ProductReviewsSection.tsx` with StarRating, ReviewForm, ReviewList
- Orders system exists - we can leverage to verify "verified purchase"
- Multi-tenant architecture requires all queries to filter by `store_id`

### What's Already Implemented

1. Database table `reviews` with: id, storeId, productId, customerName, rating, comment, status, createdAt
2. POST `/api/reviews` - Submit review (public, for paid stores only)
3. PATCH `/api/reviews` - Moderate reviews (approve/reject)
4. StarRating component
5. ReviewForm component
6. ReviewList component
7. ProductReviewsSection

### What Needs to be Added

1. Verified purchase check (customer must have ordered the product)
2. Rate limiting (one review per customer per product)
3. Aggregate rating on product cards
4. Admin dashboard UI for review management
5. Pagination, sorting, distribution chart

---

## Goals / Non-Goals

**Goals:**

1. Allow verified customers (who purchased product) to submit ratings (1-5 stars) and text reviews
2. Display aggregate ratings on product cards and detail pages
3. Provide merchant dashboard for review moderation (approve/reject/delete)
4. Prevent spam with rate limiting (one review per customer per product)

**Non-Goals:**

- Photo/video reviews (future enhancement)
- Q&A section (separate feature)
- Review upvotes/helpful votes (future enhancement)
- Email notifications for new reviews (future enhancement)

---

## Decisions

### 1. Database Schema: Reviews Table

**Decision:** Create new `reviews` table with composite index on `(store_id, product_id)`

```typescript
// packages/database/src/schema/reviews.ts
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull(),
  productId: integer('product_id').notNull(),
  orderId: integer('order_id').notNull(), // For verified purchase
  customerId: integer('customer_id').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'), // 10-1000 chars
  merchantReply: text('merchant_reply'),
  status: text('status').default('pending'), // pending, approved, rejected
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});

// Composite index for efficient queries
export const reviewsStoreProductIdx = index('idx_reviews_store_product').on(
  reviews.storeId,
  reviews.productId
);
```

**Rationale:** Storing `order_id` enables "verified purchase" badge. Status field enables moderation workflow. Composite index ensures fast queries with tenant isolation.

### 2. API Endpoints: RESTful with Remix Loaders/Actions

**Decision:** Use Remix loaders and actions rather than separate Hono API

| Endpoint                       | Method | Description                    |
| ------------------------------ | ------ | ------------------------------ |
| `/products/$handle`            | GET    | Load reviews with product data |
| `/api/reviews`                 | POST   | Submit new review              |
| `/app/products/$id/reviews`    | GET    | Merchant view all reviews      |
| `/app/api/reviews/$id/approve` | POST   | Approve review                 |
| `/app/api/reviews/$id/reject`  | POST   | Reject review                  |
| `/app/api/reviews/$id/reply`   | POST   | Merchant reply                 |

**Rationale:** Follows existing codebase patterns. Remix loaders handle GET, actions handle mutations. No need for separate API layer.

### 3. Aggregate Rating Calculation: Computed on Read

**Decision:** Calculate average rating at read time, not stored

```typescript
// In product query - use Drizzle's aggregation
const productWithReviews = await db
  .select({
    ...productFields,
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
    reviewCount: sql<number>`COUNT(${reviews.id})`,
  })
  .from(products)
  .leftJoin(reviews, and(eq(products.id, reviews.productId), eq(reviews.status, 'approved')))
  .where(eq(products.id, productId))
  .groupBy(products.id);
```

**Rationale:** Simpler than maintaining denormalized count. D1 handles aggregation efficiently. Updates happen immediately when reviews are approved.

### 4. Rate Limiting: Database Check

**Decision:** Check for existing review in database before insert

```typescript
// Before insert
const existing = await db
  .select()
  .from(reviews)
  .where(and(eq(reviews.productId, productId), eq(reviews.customerId, customerId)));

if (existing.length > 0) {
  throw new Error('ALREADY_REVIEWED');
}
```

**Rationale:** Simple, reliable, no external dependencies. Works with existing database.

### 5. UI Components: Reuse Existing Patterns

**Decision:** Use existing UI patterns from codebase

- Star rating: Reuse from existing components or create new `StarRating.tsx`
- Review form: Create modal/page similar to existing forms
- Review list: Use existing `ProductReviews.tsx` pattern

**Rationale:** Consistent UX, faster development, easier maintenance.

---

## Risks / Trade-offs

| Risk                              | Impact   | Mitigation                                                                |
| --------------------------------- | -------- | ------------------------------------------------------------------------- |
| **Review spam**                   | High     | Rate limit (1 review per customer per product), require verified purchase |
| **Performance with many reviews** | Medium   | Pagination (10 per page), aggregate cached in KV                          |
| **Data migration**                | Low      | No existing data, new table only                                          |
| **Multi-tenant data leak**        | Critical | ALL queries must filter by `store_id` - enforce in code review            |

---

## Migration Plan

1. **Phase 1: Database**
   - Run migration to create `reviews` table
   - Add indexes

2. **Phase 2: Backend**
   - Create Drizzle schema in `packages/database`
   - Add review types in shared types
   - Implement loaders/actions

3. **Phase 3: Frontend (Merchant)**
   - Add Reviews tab in product management
   - Create approve/reject/delete actions
   - Add review reply functionality

4. **Phase 4: Frontend (Storefront)**
   - Display review summary on product cards
   - Add reviews section on product detail page
   - Add "Write Review" form

5. **Rollback:**
   - If issues, roll back migration removes table
   - No data loss since new feature

---

## Open Questions

1. **Should we cache aggregate ratings in KV?** - May be premature optimization. Start with D1 aggregation, add KV if needed.

2. **Should customers edit/delete their reviews?** - Not in MVP scope. Can add in future.

3. **How to handle reviews when product is deleted?** - Option A: Delete reviews with product (cascade). Option B: Keep reviews but anonymize. Go with Option A for MVP.

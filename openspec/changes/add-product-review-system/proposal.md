## Why

Customers want to see authentic product reviews before making a purchase decision. The platform already has a basic review system (reviews table, API endpoints), but it lacks:

- Verification that reviewer actually purchased the product
- Rate limiting to prevent spam
- Aggregate ratings on product cards
- Admin UI for merchants to manage reviews
- Advanced features like sorting, pagination, distribution chart

## What Changes

**Phase 1 - Enhancement (Current Focus):**

- Add verified purchase requirement (only customers who ordered can review)
- Add rate limiting (one review per customer per product)
- Display average ratings on product cards
- Create admin dashboard UI for review management

**Phase 2 - Advanced Features:**

- Add pagination to review lists
- Add sorting options
- Add rating distribution chart
- Add merchant reply feature

## Capabilities

### New Capabilities

- `review-verification`: Verify customer has purchased product before allowing review
- `review-rate-limit`: Prevent spam by limiting one review per customer per product
- `review-summary`: Display aggregate rating on product cards
- `review-admin-ui`: Merchant dashboard to view and manage reviews
- `review-pagination`: Paginated review lists (10 per page)
- `review-sorting`: Sort by Recent, Highest Rated, Lowest Rated
- `review-distribution`: Rating distribution chart on product pages
- `review-reply`: Merchant can reply to customer reviews

### Modified Capabilities

- `product-reviews`: Add verification and rate limiting to existing system
- `review-moderation`: Expand with delete and reply features

## Impact

- **Existing**: `reviews` table already exists ✅
- **Existing**: `/api/reviews` endpoint already exists ✅
- **New**: `/app/products/$id/reviews` admin route
- **Modified**: Product detail page to show reviews
- **Modified**: Product cards to show aggregate rating

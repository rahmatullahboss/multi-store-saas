## Why

Customers want to see authentic product reviews before making a purchase decision. Currently, our multi-tenant e-commerce platform has no review system, which reduces customer trust and purchase confidence. Adding a product review system will increase conversion rates and provide social proof for merchants.

## What Changes

- Add product review functionality allowing customers to rate and review purchased products
- Display average ratings and review counts on product pages
- Allow merchants to moderate reviews (approve/reject)
- Add review summary (stars) on product cards and listing pages

## Capabilities

### New Capabilities

- `product-reviews`: Core review system - customers can submit ratings (1-5 stars) and text reviews for products they ordered
- `review-moderation`: Merchant dashboard to view, approve, reject, or delete reviews
- `review-display`: Show reviews on product detail page with pagination and sorting
- `review-summary`: Display aggregate rating (average stars + count) on product cards and listings

### Modified Capabilities

- `product-management`: Products will have new fields for aggregate rating data
- `order-completion`: After order delivery, customers can leave reviews

## Impact

- **New Tables**: `reviews` table in D1 database (store_id, product_id, user_id, rating, comment, status)
- **New Routes**:
  - Storefront: `/api/reviews` (GET/POST)
  - Admin: `/app/products/$id/reviews` (manage reviews)
- **Modified Routes**:
  - `products.$handle.tsx` - show reviews
  - Product cards - show rating summary
- **Dependencies**: None (using existing infrastructure)

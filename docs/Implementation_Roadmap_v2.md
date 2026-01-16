# Implementation Plan: World-Class Multi-Store SaaS Engine

## Goal Description

Transform the existing codebase into a unified, scalable "Landing Page + Store Builder" platform. The core goal is to merge the ease of a quick builder with the robustness of Shopify-level commerce, powered by a single tenant entity (`shop`) with toggleable modes (`landing` vs `store`).

## User Review Required

> [!IMPORTANT] > **5 Key Decisions Needed:**
>
> 1. **Free Plan Strategy:** Recommendation is to allow "Store Mode" on Free plan but with strict limits (e.g., 5 products) to encourage usage.
> 2. **Limits:** Suggested Free Limits: 10 Products, 50 Orders/month. Pro: Unlimited.
> 3. **Branding:** "Powered by [YourApp]" mandatory on Free plan.
> 4. **Payments:** COD (Cash on Delivery) enabled immediately.
> 5. **Custom Domain:** Use Cloudflare for SaaS (CNAME verification) as the standard.

## Proposed Changes

### 1. Database Schema Refactor (Priority: Critical)

We will migrate from `Real` (float) to `Integer` pricing and introduce the Draft/Published split.

#### Admin & Tenant Scope

- **Modify `stores` table:**
  - Add `mode`: `'landing' | 'store'`
  - Add `plan`: `'free' | 'starter' | 'pro'`
  - Add `limits`: JSON column for enforcement.
- **Modify `products`/`variants`:**
  - `price` -> `price_cents` (Integer)
  - `compare_at_price` -> `compare_at_price_cents` (Integer)

#### Page Builder Engine

- **Split `builder_sections`:**
  - `builder_sections_draft`: For Admin editor state.
  - `builder_sections_published`: Snapshot for public Storefront (read-optimized).
- **Add `theme_templates`:** To map system routes (Cart, Checkout) to Builder Sections.

#### Commerce Core

- **New `checkout_sessions` table:** To handle pricing state and idempotency.
- **New `order_items` snapshots:** Copy full product data (title, price, sku) at time of purchase.

### 2. Architecture & Logic

#### Server-Side Gating

- Implement a centralized `ShopContext` middleware.
- If `shop.mode === 'landing'`:
  - Block `/cart`, `/checkout`, `/products/*`.
  - Redirect to "Upgrade" page.

#### Pricing Service

- Create `app/services/pricing.server.ts`.
- Pure function input: `CartItems`, `ShippingAddress`.
- Output: `Subtotal`, `Tax`, `Shipping`, `Total`.
- **Constraint:** Logic exists ONLY here. No client-side math for money.

### 3. Feature Rollout

- **Phase 0:** DB Refactor, Mode Logic, Builder Internal Upgrade.
- **Phase 1:** Storefront Render, Cart, Checkout (COD).
- **Phase 2:** Local Payments (SSLCommerz), Advanced Shipping.

## Verification Plan

### Automated Tests

- **Unit:** Test `PricingService` with edge cases (0.1 + 0.2 floating point checks).
- **Integration:** Test "Draft Save" vs "Publish" flow to ensure live site doesn't change until explicit publish.

### Manual Verification

1. Create a "Free" shop.
2. Verify "Store Mode" is initially locked or limited.
3. Switch to "Store Mode".
4. Add Product (Price ৳100.50 -> Stored as 10050).
5. Add to Cart -> Verify Checkout Session created.
6. Place Order (COD) -> Verify Inventory Reserve.

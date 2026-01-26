# Theme Standardization & Improvement Log

This document outlines the "World-Class" standard implemented for the Multi-Store SaaS platform themes. All themes must follow this architecture to ensure consistency between Preview Mode and Live Mode.

## 1. Core Architecture Goals

- **Unified Preview Experience:** The Preview Mode must feel 100% functional (Add to Cart, Checkout flow) without a backend.
- **Theme Identity:** Each theme must have unique designs for Product, Cart, and Collection pages, not just the Homepage.
- **Data Consistency:** Use centralized `DEMO_PRODUCTS` for preview hydration.

## 2. Implemented Improvements (Reference: Luxe Boutique)

### A. Data Handling (Unified Demo Data)

- **Problem:** Previously, different pages used different dummy data, causing mismatches.
- **Solution:** All components now import `DEMO_PRODUCTS` from `~/utils/store-preview-data`.
- **Implementation:**
  - Homepage Product Grids use this source fallback.
  - Cart & Checkout pages use this source to hydrate items in Preview Mode.

### B. Navigation (PreviewSafeLink)

- **Problem:** Links in Preview Mode would redirect to 404 pages or break the preview context.
- **Solution:** Replaced all `Link` components with `PreviewSafeLink`.
- **Behavior:** Automatically prefixes URLs with `/store-template-preview/:templateId` when `isPreview` is true.

### C. Cart Engine (The "Hybrid" System)

- **Problem:** "Add to Cart" didn't work in Preview Mode; Cart page crashed or showed wrong items.
- **Solution:**
  - **AddToCartButton:** Now writes to `localStorage` even in Preview Mode.
  - **Cart Page:** Reads from `localStorage`.
    - _Preview Mode:_ Hydrates item details (Title, Image, Price) from `DEMO_PRODUCTS` using IDs.
    - _Live Mode:_ Hydrates item details from the API/Server.
  - **Safety:** Added `try/catch` and `Array.isArray` checks to prevent crashes.

### D. Page Structure (Theme-Specific)

Each theme now requires specific components defined in `store-registry.ts`:

1.  **ProductPage:** Unique layout (Gallery, Info, Specs) matching the theme's vibe.
2.  **CartPage:** Custom cart design (Mini-cart, Slide-out, or Full page) matching the theme.
3.  **CollectionPage:** Custom grid and filter design.
4.  **CheckoutPage:** (Currently Shared, but theme-aware via colors).

## 3. Implementation Checklist for Other Themes

### Priority List:

1.  **Daraz:** (Has custom pages, needs Logic Fix)
2.  **BDShop:** (Has custom pages, needs Logic Fix)
3.  **Ghorer Bazar:** (Needs Custom Pages created)
4.  **Freshness:** (Needs Custom Pages created)
5.  **Aurora Minimal:** (Needs Custom Pages created)

### Action Items per Theme:

- [ ] Check if `ProductPage` and `CartPage` exist in `components/store-templates/[theme]/pages/`.
- [ ] If yes, update `Add to Cart` logic to support Preview Mode (`localStorage` + `DEMO_PRODUCTS`).
- [ ] If no, create them following the theme's design system.
- [ ] Ensure all internal links use `PreviewSafeLink`.
- [ ] Update `store-registry.ts` to link the new components.

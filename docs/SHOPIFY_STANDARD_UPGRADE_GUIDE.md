# Shopify Standard Theme Upgrade Guide

> **Mission**: Transform our templates to match Shopify Dawn theme standards - the gold standard for e-commerce themes.

This document outlines what features each page needs to be considered "Shopify Standard" and tracks our upgrade progress.

---

## Table of Contents

1. [Upgrade Status Dashboard](#upgrade-status-dashboard)
2. [Product Page Standards](#1-product-page-standards)
3. [Collection Page Standards](#2-collection-page-standards)
4. [Cart Page Standards](#3-cart-page-standards)
5. [Checkout Page Standards](#4-checkout-page-standards)
6. [Footer Standards](#5-footer-standards)
7. [Header Standards](#6-header-standards)
8. [Home Page Standards](#7-home-page-standards)
9. [Implementation Priority](#implementation-priority)

---

## Upgrade Status Dashboard

| Page                  | Current Status | Shopify Score | Priority |
| --------------------- | -------------- | ------------- | -------- |
| **Product Page**      | ✅ UPGRADED    | 95%           | -        |
| **Footer (Nova Lux)** | ✅ UPGRADED    | 95%           | -        |
| **Checkout Page**     | ✅ UPGRADED    | 95%           | -        |
| **Collection Page**   | ✅ UPGRADED    | 90%           | -        |
| **Cart Page**         | ✅ UPGRADED    | 90%           | -        |
| **Header**            | ⚠️ VARIES      | 70%           | MEDIUM   |
| **Home Page**         | ⚠️ VARIES      | 70%           | LOW      |

---

## 1. Product Page Standards

**File**: `apps/web/app/components/store-templates/shared/ProductPage.tsx`

### ✅ COMPLETED Features (95% Shopify Standard)

| Feature                   | Status | Description                                              |
| ------------------------- | ------ | -------------------------------------------------------- |
| Image Gallery (3:4 ratio) | ✅     | Optimized aspect ratio for product images                |
| Image Zoom                | ✅     | Hover to zoom functionality                              |
| Fullscreen Gallery        | ✅     | Click to open fullscreen modal                           |
| Visual Color Swatches     | ✅     | Color circles with hex codes                             |
| Size Swatches             | ✅     | Clickable size buttons                                   |
| Stock Status              | ✅     | "In Stock" / "Only X left!" / "Out of Stock"             |
| Delivery Estimation       | ✅     | "Get it by Thu, Jan 30 - Mon, Feb 3"                     |
| SKU Display               | ✅     | Product SKU visible                                      |
| 4-Tab Layout              | ✅     | Description, Specifications, Shipping & Returns, Reviews |
| Trust Badges              | ✅     | Free shipping, Easy returns, Secure payment, Genuine     |
| Payment Icons             | ✅     | bKash, Nagad, VISA, MasterCard, COD                      |
| Social Share              | ✅     | Facebook, Twitter, WhatsApp + Copy link                  |
| Wishlist Toggle           | ✅     | Heart button with state                                  |
| Related Products          | ✅     | "You might also like" section                            |
| Complementary             | ✅     | "Pairs well with" section                                |
| Recently Viewed           | ✅     | localStorage-based tracking                              |
| Review Summary            | ✅     | Average + distribution chart                             |
| Verified Reviews          | ✅     | "Verified" badge on reviews                              |
| Preview/Live Modes        | ✅     | Proper handling for both                                 |

### 🔲 Future Enhancements

| Feature               | Priority | Description                   |
| --------------------- | -------- | ----------------------------- |
| Video Gallery         | LOW      | Support for product videos    |
| 3D Model Viewer       | LOW      | AR/3D product view            |
| Size Guide Modal      | MEDIUM   | Popup with size chart         |
| Notify When Available | MEDIUM   | Email signup for out-of-stock |
| Bundle Builder        | LOW      | Add multiple products at once |

---

## 2. Collection Page Standards

**File**: `apps/web/app/components/store-templates/shared/CollectionPage.tsx`

### ✅ COMPLETED Features (90% Shopify Standard)

| Feature                  | Status | Description                       |
| ------------------------ | ------ | --------------------------------- |
| Product Grid (3:4 ratio) | ✅     | Optimized aspect ratio            |
| Category Sidebar         | ✅     | Collapsible with active indicator |
| Price Range Filter       | ✅     | Radio button price ranges         |
| Availability Filter      | ✅     | In stock only checkbox            |
| Active Filters Display   | ✅     | Pills with remove button          |
| Sort Options             | ✅     | 6 sort options                    |
| Grid/List View Toggle    | ✅     | Desktop only                      |
| Products Per Page        | ✅     | 12/24/48 selector                 |
| Load More Pagination     | ✅     | With remaining count              |
| Collection Banner        | ✅     | Title + product count             |
| Quick Add to Cart        | ✅     | Hover overlay button              |
| Wishlist Button          | ✅     | Heart icon on hover               |
| Mobile Filter Drawer     | ✅     | Slide-out panel                   |
| Preview/Live Mode        | ✅     | Proper handling for both          |

### 🔲 Future Enhancements

| Feature                  | Priority | Description              |
| ------------------------ | -------- | ------------------------ |
| Color Swatches in Filter | MEDIUM   | Visual color circles     |
| Quick View Modal         | LOW      | Preview product in modal |
| Compare Products         | LOW      | Side-by-side comparison  |
| Infinite Scroll          | LOW      | Auto-load on scroll      |

---

## 3. Cart Page Standards

**File**: `apps/web/app/components/store-templates/shared/CartPage.tsx`

### ✅ COMPLETED Features (90% Shopify Standard)

| Feature                 | Status | Description                          |
| ----------------------- | ------ | ------------------------------------ |
| Cart Items List         | ✅     | With image, title, price             |
| Quantity Adjustment     | ✅     | Smooth +/- with loading state        |
| Remove Item             | ✅     | With fade animation                  |
| Coupon/Discount Code    | ✅     | Input with apply button + demo codes |
| Free Shipping Progress  | ✅     | Visual progress bar + threshold      |
| Order Notes             | ✅     | Optional textarea                    |
| Item Variant Display    | ✅     | Shows color/size selected            |
| Stock Validation        | ✅     | "Only X left!" warnings              |
| Move to Wishlist        | ✅     | Heart icon saves to wishlist         |
| Product Recommendations | ✅     | "You might also like" section        |
| Order Summary           | ✅     | Subtotal, discount, shipping, total  |
| Trust Badges            | ✅     | Secure checkout, returns, COD        |
| Payment Icons           | ✅     | bKash, Nagad, VISA, COD              |
| Empty State             | ✅     | Nice illustration + CTA              |
| Preview/Live Mode       | ✅     | Proper handling for both             |

### 🔲 Future Enhancements

| Feature            | Priority | Description                    |
| ------------------ | -------- | ------------------------------ |
| Gift Card Input    | MEDIUM   | Apply gift card balance        |
| Taxes Display      | MEDIUM   | Show estimated taxes           |
| Cart Drawer Option | LOW      | Slide-out cart instead of page |

---

## 4. Checkout Page Standards

**File**: `apps/web/app/components/store-templates/shared/CheckoutPage.tsx`

### ✅ COMPLETED Features (95% Shopify Standard)

| Feature                    | Status | Description                          |
| -------------------------- | ------ | ------------------------------------ |
| Contact Form (Email+Phone) | ✅     | With real-time validation            |
| Express Checkout           | ✅     | bKash, Nagad buttons at top          |
| Shipping Address           | ✅     | Full form with city dropdown         |
| Shipping Method Selection  | ✅     | Standard, Express, Same Day options  |
| Multiple Payment Methods   | ✅     | bKash, Nagad, Card (coming), COD     |
| Order Notes                | ✅     | Special instructions field           |
| Terms & Conditions         | ✅     | Required checkbox                    |
| Real-time Validation       | ✅     | Validate on blur with error messages |
| Collapsible Order Summary  | ✅     | Mobile-friendly accordion            |
| Order Success Timeline     | ✅     | What happens next steps              |
| Payment Icons              | ✅     | bKash, Nagad, VISA, COD              |
| Security Badges            | ✅     | Secure checkout indicator            |
| Preview/Live Mode          | ✅     | Proper handling for both             |

### 🔲 Future Enhancements

| Feature                   | Priority | Description                 |
| ------------------------- | -------- | --------------------------- |
| Guest/Account Toggle      | MEDIUM   | Login or checkout as guest  |
| Address Autocomplete      | MEDIUM   | Google Places integration   |
| Real Shipping Rates       | MEDIUM   | Calculate from courier API  |
| Different Billing Address | LOW      | Option for separate billing |
| Gift Message              | LOW      | Add gift note               |
| Save Address              | MEDIUM   | Remember for next time      |
| SMS Notifications         | LOW      | Opt-in for order updates    |

---

## 5. Footer Standards

**File**: `apps/web/app/components/store-templates/nova-lux/sections/Footer.tsx`

### ✅ COMPLETED Features (95% Shopify Standard)

| Feature              | Status | Description                              |
| -------------------- | ------ | ---------------------------------------- |
| Trust Badges Bar     | ✅     | Free Shipping, Easy Returns, Secure, COD |
| Newsletter           | ✅     | Email subscription form                  |
| 5-Column Layout      | ✅     | Brand, Quick Links, Collections, Contact |
| Categories Section   | ✅     | Dynamic from store data                  |
| Contact with Address | ✅     | Email, Phone, Full Address               |
| Social Links         | ✅     | All major platforms                      |
| Payment Icons        | ✅     | bKash, Nagad, VISA, MC, COD              |
| Policy Links         | ✅     | Privacy, Refund, Shipping, Terms         |
| Copyright            | ✅     | Dynamic year                             |
| Ozzyl Branding       | ✅     | Based on plan                            |
| Preview Mode         | ✅     | Safe link handling                       |

### 🔲 Future Enhancements

| Feature            | Priority | Description           |
| ------------------ | -------- | --------------------- |
| Language Switcher  | LOW      | EN/BN toggle          |
| Currency Selector  | LOW      | BDT/USD               |
| App Download Links | LOW      | Play Store, App Store |
| Trust Seals        | LOW      | SSL, PCI badges       |

---

## 6. Header Standards

**Files**: Each template has its own header

### Standard Features Needed

| Feature           | Priority | Description             |
| ----------------- | -------- | ----------------------- |
| Logo              | ✅       | Store logo/name         |
| Main Navigation   | ✅       | Category links          |
| Search            | ⚠️       | Needs predictive search |
| Cart Icon + Count | ✅       | With badge              |
| Account/Login     | ⚠️       | User menu               |
| Wishlist Icon     | ⚠️       | With count              |
| Announcement Bar  | ⚠️       | Promo messages          |
| Mobile Menu       | ✅       | Hamburger menu          |
| Mega Menu         | LOW      | Dropdown with images    |
| Sticky Header     | ⚠️       | Fixed on scroll         |

### 🔲 Predictive Search Implementation

```tsx
// Predictive Search Features
interface PredictiveSearchResult {
  products: Product[];
  collections: Collection[];
  pages: Page[];
  suggestions: string[];
}

// Features needed:
// 1. Debounced input (300ms)
// 2. Product image thumbnails
// 3. Price display
// 4. Collection links
// 5. "View all results" link
// 6. Recent searches
// 7. Popular searches
```

---

## 7. Home Page Standards

### Standard Sections (in order)

| Section             | Priority | Description                 |
| ------------------- | -------- | --------------------------- |
| Announcement Bar    | MEDIUM   | Shipping notice, promo code |
| Hero Slideshow      | HIGH     | Main banner with CTA        |
| Featured Collection | HIGH     | Highlight products          |
| Categories Grid     | MEDIUM   | Visual category cards       |
| Best Sellers        | HIGH     | Top selling products        |
| Promotional Banners | MEDIUM   | 2-3 column banners          |
| New Arrivals        | MEDIUM   | Latest products             |
| Testimonials        | MEDIUM   | Customer reviews            |
| Newsletter          | MEDIUM   | Email signup                |
| Instagram Feed      | LOW      | Social proof                |
| Brand Logos         | LOW      | Trust indicators            |

---

## Implementation Priority

### Phase 1: Critical (This Sprint)

1. **Checkout Page Upgrade**
   - [ ] Multiple payment methods
   - [ ] Shipping method selection
   - [ ] Real-time validation
   - [ ] Terms & conditions

2. **Collection Page Upgrade**
   - [ ] Price range filter
   - [ ] Color/Size filters
   - [ ] Pagination
   - [ ] Active filters display

### Phase 2: Important (Next Sprint)

3. **Cart Page Upgrade**
   - [ ] Coupon code input
   - [ ] Free shipping progress
   - [ ] Stock validation
   - [ ] Estimated shipping

4. **Header Improvements**
   - [ ] Predictive search
   - [ ] User account menu
   - [ ] Wishlist icon

### Phase 3: Nice to Have (Backlog)

5. **Additional Features**
   - [ ] Quick view modals
   - [ ] Compare products
   - [ ] Size guide
   - [ ] Video gallery

---

## Code Standards for Upgrades

### 1. Theme Awareness

All components MUST use the `theme` prop:

```tsx
interface Props {
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}

const colors = theme || defaultTheme;
```

### 2. Preview/Live Mode

Always handle both modes:

```tsx
const getLink = (path: string) => {
  if (isPreview && templateId) {
    return `/store-template-preview/${templateId}${path}`;
  }
  return path;
};

// For external links in preview
onClick={isPreview ? (e) => e.preventDefault() : undefined}
```

### 3. Bangladesh Context

Use Bangla-friendly defaults:

```tsx
const currencySymbol = currency === 'BDT' ? '৳' : '$';

// Cities
const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi'];

// Payment methods
const payments = ['bKash', 'Nagad', 'VISA', 'MasterCard', 'COD'];
```

### 4. Mobile First

Ensure responsive design:

```tsx
// Grid
className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

// Spacing
className = 'px-4 md:px-6 lg:px-8';

// Hide on mobile
className = 'hidden md:block';
```

---

## Testing Checklist

Before marking a page as "Shopify Standard":

- [ ] Works in Preview Mode
- [ ] Works in Live Mode
- [ ] Theme colors applied correctly
- [ ] Mobile responsive
- [ ] Empty states handled
- [ ] Loading states exist
- [ ] Error handling present
- [ ] Accessibility (ARIA labels)
- [ ] Performance (no layout shift)
- [ ] Bangladesh payment methods included

---

## Resources

- [Shopify Dawn Theme](https://github.com/Shopify/dawn)
- [Shopify Theme Requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)
- [Shopify UX Guidelines](https://shopify.dev/docs/storefronts/themes/store/best-practices)

---

_Last Updated: January 2026_
_Maintained by: Ozzyl Development Team_

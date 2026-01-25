# Demo Store Issues - Needs Fixing

**Store URL:** https://demo.ozzyl.com
**Date Documented:** 2026-01-24

## 🐛 Known Issues

### 1. Categories ✅ FIXED
- **Problem:** Category pages don't exist or don't work
- **Solution:** Created `/categories` and `/category/[slug]` routes
- **Files Added:**
  - `apps/web/app/routes/categories.tsx`
  - `apps/web/app/routes/category.$slug.tsx`
- **Status:** ✅ WORKING (200 OK)

### 2. Missing Pages
- **Problem:** Other pages (About, Contact, etc.) give errors
- **Routes to check:**
  - `/about`
  - `/contact`
  - `/faq`
  - `/pages/[slug]`
- **Priority:** MEDIUM

### 3. Navigation Issues
- **Problem:** Menu links may be broken
- **Priority:** MEDIUM

### 4. Product Pages
- **Problem:** Product detail page (`/products/1`) throws ErrorBoundary error during rendering
- **Error:** ErrorBoundary triggered in functionsWorker - likely template/component rendering issue
- **Location:** `apps/web/app/routes/products.$id.tsx` - component section around line 390-410
- **Likely Cause:** `templateDef.ProductPage` or `StoreSectionRenderer` failing
- **Priority:** HIGH - NEEDS FIX

### 5. Cart Page UI
- **Problem:** Cart page (`/cart`) needs verification with new DO integration
- **Priority:** MEDIUM

### 6. Checkout Flow
- **Problem:** Full checkout flow untested
- **Priority:** HIGH

---

## ✅ What Was Deployed (DO Integration)

### 1. Durable Object Workers (6 total)
All deployed and working:
- `order-processor` - Background task processing
- `cart-processor` - Race-condition free cart ✅ WORKING
- `checkout-lock` - Atomic checkout locking
- `rate-limiter` - Per-store/IP rate limiting
- `store-config` - Config caching
- `editor-state` - Page builder state

### 2. Cart API Integration
- **File:** `apps/web/app/routes/api.cart.ts`
- **Status:** ✅ Working with DO
- **Test:** `curl https://demo.ozzyl.com/api/cart` returns `"source":"do"`

### 3. Service Bindings
- **File:** `apps/web/wrangler.toml`
- All 6 DO workers connected via service bindings

---

## 📋 Fix Priority Order

1. **HIGH** - Product pages working
2. **HIGH** - Category filtering
3. **HIGH** - Checkout flow
4. **MEDIUM** - Static pages (About, Contact)
5. **MEDIUM** - Cart page UI
6. **LOW** - Minor UI fixes

---

## 🔧 To Fix Later

```bash
# Routes to investigate:
apps/web/app/routes/
├── products.$slug.tsx     # Product detail page
├── category.$slug.tsx     # Category page
├── cart.tsx               # Cart page
├── checkout.tsx           # Checkout page
├── pages.$slug.tsx        # Dynamic pages
```

---

**Note:** These issues existed BEFORE DO integration. DO integration only added cart backend improvements.

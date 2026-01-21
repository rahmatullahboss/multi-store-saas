# Multi-Product & Combo Discount System

> **Version:** 2.2  
> **Last Updated:** 2026-01-22  
> **Status:** ✅ Fully Implemented

## Overview

Genie now supports multi-product landing pages with automatic combo discounts. This enables merchants to bundle 2-3 products and offer customers incentive discounts for buying bundles.

---

## Multi-Product Selection (Step 2 of Wizard)

### How It Works

In the IntentWizard, Step 2 now supports selecting 1-3 products:

```typescript
// Step 2 UI Logic
if (intent.productType === 'single') {
  // Show single product selector
  <SingleProductSelector />
} else if (intent.productType === 'multiple') {
  // Show multi-product selector (2-3 products max)
  <MultiProductSelector maxProducts={3} />
}
```

### User Experience

1. **Single Product Mode:**
   - Select 1 product from store
   - Or create new product inline
   - Standard pricing applies

2. **Multiple Products Mode:**
   - Select 2-3 products
   - Each product shown with price
   - System calculates auto-discount
   - Discount preview shown immediately

### Database Storage

```typescript
// In PageIntent (stored in builder_pages.intent_json)
interface PageIntent {
  productType: 'single' | 'multiple';
  selectedProducts: string[]; // Array of product IDs
  // For single: ['product_123']
  // For multiple: ['product_123', 'product_456', 'product_789']
}
```

---

## Product Grid Section

### What It Is

When multiple products are selected, a new `product-grid` section is auto-inserted after the hero section.

### Component: ProductGridSectionPreview

```typescript
// app/components/page-builder/sections/ProductGridSectionPreview.tsx

export function ProductGridSectionPreview({
  products, // Array of Product objects
  realData, // Real stock counts
  config, // Landing config
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          stock={realData?.stock[product.id]}
          onSelect={handleProductSelect}
        />
      ))}
    </div>
  );
}
```

### Features

- **Grid Display:** Shows all 2-3 products side-by-side
- **Product Card:** Image, name, price, stock indicator
- **Real Stock:** Shows actual stock count (not fake!)
- **Multi-Select Checkboxes:** Customers can select which products to buy
- **Responsive:** Stacks on mobile, grid on desktop

### Customization in Editor

- Click palette icon to change grid layout variant
- Edit product order (drag & reorder)
- Toggle visibility of individual product cards
- Change product images

---

## Combo Discount System

### Automatic Discount Tiers

| Selection | Discount | Example |
|-----------|----------|---------|
| 1 product | 0% | ৳1000 = ৳1000 |
| 2 products | 10% | ৳2500 = ৳2250 |
| 3+ products | 15% | ৳3500 = ৳2975 |

### How It Works

**Frontend (Preview):**
```typescript
// Calculated in checkout modal/form
const calculateComboDiscount = (selectedProductIds: string[]) => {
  if (selectedProductIds.length <= 1) return 0;
  return selectedProductIds.length >= 3 ? 15 : 10;
};

// Shows in UI
const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
const discountPercent = calculateComboDiscount(selectedProducts);
const discount = Math.round(subtotal * (discountPercent / 100));
const total = subtotal - discount;
```

**Backend (Order Creation):**
```typescript
// app/routes/api.create-order.ts
// Backend validates and recalculates to prevent fraud

const intent: PageIntent = JSON.parse(page.intentJson);

// Only apply combo discount if:
// 1. Page is multi-product type AND
// 2. 2+ products selected
if (intent.productType === 'multiple' && selectedProducts.length > 1) {
  discountPercent = selectedProducts.length >= 3 ? 15 : 10;
}

// Store in pricingJson for order record
const pricingJson = {
  subtotal,
  discountPercent,
  discount,
  total,
  products: selectedProducts,
};
```

### Why Backend Validation?

Security & consistency:
- Frontend shows discount, but backend recalculates
- Prevents client-side manipulation
- Ensures discount logic matches on all devices
- Order record has complete pricing breakdown

### Order Summary Display

Customer sees full breakdown:
```
Product A: ৳1000
Product B: ৳1500
────────────────
Subtotal: ৳2500
Bundle Discount (10%): -৳250
────────────────
Total: ৳2250
```

---

## Best Practices Configuration

### Overview

Genie includes 5 conversion-boosting best practices that merchants can toggle on/off:

| Feature | Default | Impact |
|---------|---------|--------|
| Urgency Banner | OFF | FOMO effect |
| Social Proof | OFF | Trust signal |
| Free Shipping Progress | OFF | Cart optimization |
| Delivery Estimate | OFF | Clarity/trust |
| Trust Badges | ON | Always visible |

### 1. Urgency Banner

**Shows:** "Only X left in stock!" or custom text

**Uses Real Data:**
```typescript
// Gets actual stock from products table
const stock = realData?.stock[productId]; // e.g., 5
// Displays: "Only 5 left in stock!"
```

**Configuration in Editor:**
```
☐ Show urgency banner
📝 Custom text: "Limited stock available!"
☑ Use real stock count (checked = from DB, unchecked = fake number)
```

**Behavior:**
- OFF by default (merchants choose to enable)
- If enabled but 0 stock: hides automatically
- Updates every hour from DB

### 2. Social Proof

**Shows:** "24 people bought in last 24 hours"

**Uses Real Data:**
```typescript
// Queries orders from last 24 hours
const recentOrders = await db.query.orders.findMany({
  where: and(
    eq(orders.storeId, storeId),
    gte(orders.createdAt, twentyFourHoursAgo),
    eq(orders.status, 'completed')
  ),
});
const orderCount = recentOrders.length; // e.g., 24
// Displays: "24 people bought in last 24 hours"
```

**Configuration in Editor:**
```
☐ Show social proof
📝 Custom text: "people bought in last 24h"
☑ Use real order count (checked = from DB)
```

**Behavior:**
- OFF by default
- Only shows if > 0 orders in last 24h
- Updates hourly

### 3. Free Shipping Progress

**Shows:** Progress bar toward free shipping threshold

**Configuration:**
```
☐ Show free shipping progress
💰 Threshold: 500 BDT
```

**Example:**
```
Cart: ৳350 / ৳500 to free shipping
[████████░░░░░░░░░░░░░░] 70%
Add ৳150 more for free shipping!
```

**Behavior:**
- OFF by default
- Customizable threshold
- Encourages upsells

### 4. Delivery Estimate

**Shows:** "Delivered by [date]" messaging

**Configuration:**
```
☐ Show delivery estimate
📅 Dhaka delivery: 2-3 days
📅 Outside Dhaka: 4-5 days
```

**Behavior:**
- OFF by default
- Different estimates for regions
- Merchant can customize
- No real-time tracking (just estimates)

### 5. Trust Badges

**Always Visible** (cannot disable)

Shows:
- 🏧 "Cash on Delivery Available"
- ↩️ "30-Day Return Guarantee"
- 🔒 "Secure Payment"

**Location:** Below order summary or in checkout form

---

## Configuration Schema

### CTAProps in Landing Config

All best practices are stored in the CTA section props:

```typescript
// app/lib/page-builder/schemas.ts

export const CTAPropsSchema = z.object({
  // ... existing fields (buttonText, buttonColor, etc.)
  
  // Urgency Banner
  showUrgencyBanner: z.boolean().default(false),
  urgencyText: z.string().default('Limited stock available!'),
  useRealStockCount: z.boolean().default(true),
  
  // Social Proof
  showSocialProof: z.boolean().default(false),
  socialProofText: z.string().default('people bought in last 24h'),
  useRealOrderCount: z.boolean().default(true),
  
  // Free Shipping Progress
  showFreeShippingProgress: z.boolean().default(false),
  freeShippingThreshold: z.number().default(500),
  
  // Delivery Estimate
  showDeliveryEstimate: z.boolean().default(false),
  deliveryEstimateDhaka: z.string().default('2-3 days'),
  deliveryEstimateOutside: z.string().default('4-5 days'),
  
  // Trust Badges
  showTrustBadges: z.boolean().default(true),
});

// Stored in landing config JSON
{
  "sections": [
    {
      "id": "cta_1",
      "type": "cta",
      "props": {
        "buttonText": "Buy Now",
        "showUrgencyBanner": true,
        "urgencyText": "Only 3 left!",
        "useRealStockCount": true,
        "showSocialProof": true,
        "showFreeShippingProgress": true,
        "freeShippingThreshold": 500,
        // ... etc
      }
    }
  ]
}
```

---

## Real Data Integration

### Data Sources

```
Database Tables
│
├── products.stock
│   └─> stock count for urgency banner
│
├── orders (completed, last 24h)
│   └─> order count for social proof
│
└── customers (from recent orders)
    └─> names for testimonials
```

### Data Flow

```
┌─ loader: builder-preview.$pageId
│
├─ getRealData(storeId, productIds)
│  │
│  ├─ Query products.stock
│  ├─ Query orders (last 24h, completed)
│  └─ Query recent customer names
│
├─ Return RealData object
│  {
│    stock: { productId: count },
│    orderCount: 24,
│    recentOrders: [...]
│  }
│
└─ Pass to DefaultOrderForm component
   │
   ├─ UrgencyBanner uses realData.stock
   ├─ SocialProof uses realData.orderCount
   └─ OrderSummary uses realData for final total
```

### Real Data Object

```typescript
interface RealData {
  stock: Record<string, number>;
  // Example: { "prod_123": 5, "prod_456": 12 }
  
  orderCount: number;
  // Example: 24 (orders in last 24h)
  
  recentOrders: Array<{
    customername: string;
    createdAt: string;
  }>;
  // For testimonials/social proof
}
```

### Update Frequency

- **Stock:** Refreshes on page load + every hour
- **Order Count:** Refreshes on page load + every hour
- **No fake/cached data:** Always from live DB query

---

## Implementation Checklist

### Files Modified

- ✅ `db/schema_page_builder.ts` - Added intent_json, style_tokens_json, variant columns
- ✅ `app/lib/page-builder/types.ts` - PageIntent, StyleTokens, RealData types
- ✅ `app/lib/page-builder/schemas.ts` - CTAPropsSchema with best practices fields
- ✅ `app/utils/landing-builder/intentEngine.ts` - Style tokens, intent parsing
- ✅ `app/components/landing-builder/IntentWizard.tsx` - 4-step flow, multi-product Step 2
- ✅ `app/components/page-builder/sections/ProductGridSectionPreview.tsx` - NEW component
- ✅ `app/components/page-builder/sections/order-form/DefaultOrderForm.tsx` - Multi-select, best practices
- ✅ `app/routes/api.create-order.ts` - Combo discount validation & pricingJson
- ✅ `app/routes/builder-preview.$pageId.tsx` - Real data fetching & passing

### Database Migration

```
Migration: 0064_genie_builder_enhancements.sql

Changes:
- ALTER TABLE builder_pages ADD COLUMN variant TEXT;
- ALTER TABLE builder_pages ADD COLUMN intent_json TEXT;
- ALTER TABLE builder_pages ADD COLUMN style_tokens_json TEXT;
```

---

## Testing Scenarios

### Combo Discount Scenarios

**Test 1: Single Product**
- Select 1 product
- Should show 0% discount
- Total = Price

**Test 2: Two Products**
- Select 2 products
- Should show 10% discount
- Total = (Price1 + Price2) * 0.9

**Test 3: Three Products**
- Select 3 products
- Should show 15% discount
- Total = (Price1 + Price2 + Price3) * 0.85

### Best Practices Display

**Test 4: Urgency Banner**
- Enable urgency banner
- Should show "Only X left in stock!"
- X = real stock from DB
- If stock = 0, banner hides
- Custom text renders correctly

**Test 5: Social Proof**
- Enable social proof
- Should show "X people bought in last 24h"
- X = real count from orders table
- If count = 0, message hides
- Updates hourly

**Test 6: Real Data Accuracy**
- Update product stock in admin
- Refresh landing page
- Urgency banner shows updated stock
- No cache/stale data

---

## Performance Impact

### Database Queries

Real data integration adds queries to the loader:

```typescript
// Loader queries for each page view
1. Get builder page (1 query)
2. Get products with stock (1 query)
3. Get orders from last 24h (1 query)
4. Get recent order details (1 query)

Total: 4 queries per page load
```

### Optimization

- Use database indexes on:
  - `orders.storeId, orders.createdAt, orders.status`
  - `products.storeId, products.id`
- Cache results for 1 hour in KV
- Lazy-load social proof data on scroll

---

## Troubleshooting

### Urgency Banner Shows Wrong Stock

**Issue:** Shows cached/old stock count  
**Solution:** Invalidate KV cache after inventory update

### Combo Discount Not Applied

**Issue:** Order total doesn't show discount  
**Checklist:**
1. Is page `productType` = 'multiple'?
2. Are 2+ products selected?
3. Is backend recalculating? (Check order API logs)
4. Check `pricingJson` in order record

### Social Proof Shows Zero

**Issue:** "0 people bought" showing even with orders  
**Solution:**
1. Check orders have `status = 'completed'`
2. Check `createdAt` is within last 24h
3. Check `storeId` matches

---

## Future Enhancements

- [ ] Bundle suggestions (ML-based)
- [ ] Tiered discounts (10%/15%/20%)
- [ ] Custom discount codes for bundles
- [ ] Product recommendations engine
- [ ] Dynamic urgency messaging (AI)
- [ ] A/B testing best practice configs

---

## Migration Guide

### From Single-Product Only to Multi-Product

**Step 1:** Run migration 0064
```bash
npm run db:migrate:prod
```

**Step 2:** Update IntentWizard to show multi-product option
- Already done in codebase

**Step 3:** Enable in editor UI
- Palette icon already shows ProductGrid variant

**Step 4:** Test full flow
- Create multi-product page
- Verify combo discount
- Check real data displays

**Backward Compatibility:** ✅ Existing single-product pages work unchanged

---

## References

- **User Guide:** docs/genie-builder/GENIE_USER_GUIDE.md
- **Technical Guide:** docs/genie-builder/GENIE_TECHNICAL_GUIDE.md
- **Main Index:** docs/genie-builder/GENIE_V2_INDEX.md

# Genie v2.2 - Implementation Reference & Checklist

> **Version:** 2.2  
> **Last Updated:** 2026-01-22  
> **Status:** ✅ All Features Implemented & Production Ready

## Quick Navigation

This document serves as a **quick reference guide** for implementing, debugging, and maintaining Genie features. Use the table of contents below to jump to what you need.

---

## 📋 Complete Feature Checklist

### Phase 1: Intent Wizard ✅
- [x] Step 1: Product type, goal, traffic source selection
- [x] Step 2: Single or multi-product selection (1-3 products)
- [x] Step 3: Style preferences (color, button, font)
- [x] Step 4: Template selection
- [x] Auto-section generation based on intent
- [x] Intent data persistence in `builder_pages.intent_json`

### Phase 2: Section Variants ✅
- [x] 18+ section variants implemented
- [x] Variant selector UI with thumbnails
- [x] Variant persistence in `builder_sections.variant`
- [x] Palette icon in editor for variant switching
- [x] Real-time preview updates

### Phase 3: Checkout Modal ✅
- [x] Overlay modal (not page redirect)
- [x] Compact checkout form (name, phone, address)
- [x] COD payment default
- [x] Mobile-responsive design
- [x] Close button + ESC key support

### Phase 4: Advanced Features ✅
- [x] Style customization (color, button, font)
- [x] Multi-product support (2-3 products)
- [x] Product grid section
- [x] Combo discount calculation (10%/15%)
- [x] Backend discount validation
- [x] Urgency banner (with real stock)
- [x] Social proof (with real 24h orders)
- [x] Free shipping progress bar
- [x] Delivery estimates (Dhaka/Outside)
- [x] Trust badges
- [x] Order summary with pricing breakdown

---

## 🗂️ Files Reference

### Database Schema
```
db/schema_page_builder.ts
├─ builder_pages
│  ├─ variant (TEXT) - Section variant JSON
│  ├─ intent_json (TEXT) - User intent data
│  └─ style_tokens_json (TEXT) - Style preferences
└─ builder_sections
   └─ variant (TEXT) - Section variant ID
```

### Type Definitions
```
app/lib/page-builder/types.ts
├─ PageIntent
├─ StyleTokens
├─ SectionVariant
└─ RealData

app/lib/page-builder/schemas.ts
├─ StyleTokensSchema (Zod validation)
└─ CTAPropsSchema (with best practices fields)

app/utils/landing-builder/intentEngine.ts
├─ BRAND_COLOR_PRESETS
├─ DEFAULT_STYLE_TOKENS
└─ generateOptimalSections()
```

### Components
```
Intent & Style Wizard
├─ app/components/landing-builder/IntentWizard.tsx (4 steps)
├─ app/components/landing-builder/StyleWizard.tsx
└─ app/components/landing-builder/VariantSelector.tsx

Multi-Product & Discounts
├─ app/components/page-builder/sections/ProductGridSectionPreview.tsx
└─ app/components/page-builder/sections/order-form/DefaultOrderForm.tsx

Best Practices
├─ app/components/page-builder/sections/UrgencyBanner.tsx
├─ app/components/page-builder/sections/SocialProof.tsx
├─ app/components/page-builder/sections/FreeShippingProgress.tsx
└─ app/components/page-builder/sections/DeliveryEstimate.tsx
```

### Routes & API
```
app/routes/
├─ app.new-builder._index.tsx (Wizard entry point)
├─ app.settings.landing.tsx (Style settings)
├─ builder-preview.$pageId.tsx (Preview with real data)
└─ api.create-order.ts (Combo discount validation)
```

---

## 🎯 Common Implementation Tasks

### Task: Add a New Brand Color Preset

**File:** `app/utils/landing-builder/intentEngine.ts`

```typescript
export const BRAND_COLOR_PRESETS = {
  // ... existing colors
  teal: {
    name: 'Teal',
    hex: '#14b8a6',
    rgb: 'rgb(20, 184, 166)',
    bestFor: 'Tech, healthcare, eco',
    emotion: 'Calm, trust, growth',
  },
};
```

**Steps:**
1. Add to BRAND_COLOR_PRESETS object
2. Update ColorSelector component to render it
3. No database migration needed

---

### Task: Enable/Disable Best Practice Feature

**For Urgency Banner:**

```typescript
// In CTAPropsSchema (app/lib/page-builder/schemas.ts)
showUrgencyBanner: z.boolean().default(false), // Change true/false

// In DefaultOrderForm component
{ctaProps?.showUrgencyBanner && <UrgencyBanner ... />}
// Just remove the && to always show
```

**For Social Proof:**

```typescript
showSocialProof: z.boolean().default(false), // Toggle here
```

---

### Task: Change Combo Discount Tiers

**File:** `app/routes/api.create-order.ts`

```typescript
// Find this section:
if (intent.productType === 'multiple' && selectedProducts?.length > 1) {
  discountPercent = selectedProducts.length >= 3 ? 15 : 10;
}

// Change to:
if (intent.productType === 'multiple' && selectedProducts?.length > 1) {
  if (selectedProducts.length >= 4) discountPercent = 20;
  else if (selectedProducts.length >= 3) discountPercent = 15;
  else discountPercent = 10;
}
```

**Also update:** CTAPropsSchema validation if adding new tiers

---

### Task: Show Real Data in Components

**Pattern:**

```typescript
// In loader
const realData = await getRealData(db, { storeId, productIds });

// Pass to component
<DefaultOrderForm config={config} realData={realData} />

// In component
<UrgencyBanner
  stockCount={realData?.stock[productId]}
  text={ctaProps?.urgencyText}
/>
```

---

## 🔧 Configuration Reference

### StyleTokens Configuration

```typescript
interface StyleTokens {
  brandColor: string; // hex or preset name
  buttonStyle: 'rounded' | 'sharp' | 'pill';
  fontFamily: 'default' | 'bengali' | 'modern' | 'classic';
  darkMode?: boolean; // Future
}

// Applied via CSS classes
.theme-{brandColor}
.buttons-{buttonStyle}
.font-{fontFamily}
```

### PageIntent Configuration

```typescript
interface PageIntent {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
  selectedProducts: string[]; // Product IDs
  headline?: string;
}

// Stored in builder_pages.intent_json
```

### CTA Best Practices Fields

```typescript
// In landing config section.props
{
  showUrgencyBanner: boolean,
  urgencyText: string,
  useRealStockCount: boolean,
  
  showSocialProof: boolean,
  socialProofText: string,
  useRealOrderCount: boolean,
  
  showFreeShippingProgress: boolean,
  freeShippingThreshold: number,
  
  showDeliveryEstimate: boolean,
  deliveryEstimateDhaka: string,
  deliveryEstimateOutside: string,
  
  showTrustBadges: boolean,
}
```

---

## 🐛 Debugging Guide

### Combo Discount Not Applying

**Checklist:**
```
☐ Is intent.productType = 'multiple'?
☐ Are 2+ products selected?
☐ Check backend order API logs
☐ Verify pricingJson in orders table
☐ Is discount calculation correct?
```

**Debug:**
```typescript
// Add to api.create-order.ts
console.log('Intent:', intent);
console.log('Selected products:', selectedProducts);
console.log('Calculated discount:', discountPercent);
console.log('Final pricing:', pricingJson);
```

---

### Real Data Not Showing

**Checklist:**
```
☐ Is realData object populated?
☐ Is stock > 0?
☐ Are orders with status='completed'?
☐ Are orders within last 24h?
☐ Is component receiving realData prop?
```

**Debug:**
```typescript
// In builder-preview.$pageId.tsx
console.log('Real data:', realData);

// In DefaultOrderForm
console.log('Urgency banner:', {
  showUrgencyBanner: ctaProps?.showUrgencyBanner,
  stock: realData?.stock,
});
```

---

### Styles Not Applying

**Checklist:**
```
☐ Is styleTokensJson saved?
☐ Are CSS variables injected?
☐ Is Tailwind config updated?
☐ No conflicting inline styles?
```

**Debug:**
```typescript
// Check in browser DevTools
// 1. Inspect element
// 2. Look for CSS variables:
//    --brand-color: #3b82f6
// 3. Check computed styles
```

---

## 📊 Data Flow Diagrams

### Multi-Product + Combo Discount Flow

```
User selects 2-3 products in Step 2
           ↓
IntentWizard sets intent.selectedProducts = [id1, id2]
           ↓
Landing page created with ProductGrid section
           ↓
Customer views ProductGrid (displays all products)
           ↓
Customer selects 2+ products (checkboxes)
           ↓
Checkout form calculates discount
  - 2 products: 10%
  - 3+ products: 15%
           ↓
Customer submits order
           ↓
Backend API recalculates discount (security)
           ↓
Order created with pricingJson breakdown
```

### Real Data Integration Flow

```
Page loads (builder-preview.$pageId)
           ↓
Loader queries:
  - products.stock for selected products
  - orders (last 24h, status=completed)
           ↓
getRealData() returns RealData object
           ↓
Passed to DefaultOrderForm component
           ↓
UrgencyBanner displays: "Only X left!"
SocialProof displays: "X bought today"
           ↓
Data updates on next page refresh (hourly recommended)
```

### Style Application Flow

```
User completes Step 3 (Style Wizard)
           ↓
StyleTokens object created:
  {
    brandColor: '#3b82f6',
    buttonStyle: 'rounded',
    fontFamily: 'modern'
  }
           ↓
Saved to builder_pages.style_tokens_json
           ↓
Landing page renders with CSS:
  - font-family: Inter, Poppins, sans-serif
  - --brand-color: #3b82f6
  - .rounded-lg buttons
           ↓
User sees branded landing page
```

---

## 🚀 Deployment Checklist

### Before Deploying v2.2

- [ ] Run database migration 0064
- [ ] Build and test locally
- [ ] Run all test suites
- [ ] Test multi-product creation
- [ ] Test combo discount calculation
- [ ] Test real data queries
- [ ] Test style customization
- [ ] Mobile responsive check
- [ ] Performance benchmarks
- [ ] Security review

### Migration Steps

```bash
# 1. Run migration
npm run db:migrate:prod

# 2. Build
npm run build

# 3. Test locally
npm run dev

# 4. Deploy
npm run deploy
```

### Rollback Plan

If issues:
```bash
# 1. Revert code to previous version
git revert <commit-hash>

# 2. Database is backward compatible
# (new columns are nullable, don't break queries)

# 3. Re-deploy
npm run deploy
```

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load (LCP) | < 2.5s | ⏳ Measuring |
| API Response (create-order) | < 500ms | ⏳ Measuring |
| Real data query | < 100ms | ⏳ Measuring |
| Total bundle size | < 500KB | ⏳ Measuring |
| First Contentful Paint | < 1.5s | ⏳ Measuring |

---

## 🧪 Quick Test Cases

### Test: Multi-Product Discount

```
1. Create new landing page
2. Intent: Multiple products
3. Select 2 products ($100 + $150)
4. Go to checkout
5. Verify: Subtotal $250, discount $25, total $225 ✓
```

### Test: Real Stock Display

```
1. Go to admin, set product stock to 3
2. Create landing page with product
3. Enable urgency banner
4. Open preview
5. Verify: Shows "Only 3 left in stock!" ✓
6. Change stock to 0
7. Refresh page
8. Verify: Banner hides ✓
```

### Test: Style Customization

```
1. Create landing page
2. Step 3: Select purple color, pill buttons, modern font
3. Complete creation
4. Verify: Page has purple brand color
5. Verify: Buttons are pill-shaped
6. Verify: Font is Inter/Poppins
```

---

## 🔗 Documentation Links

| Document | Purpose |
|----------|---------|
| GENIE_V2_INDEX.md | Master index & navigation |
| GENIE_V2_SPEC.md | Complete specification |
| GENIE_USER_GUIDE.md | User-facing guide |
| GENIE_TECHNICAL_GUIDE.md | Technical architecture |
| GENIE_MULTIPRODUCT_COMBOS.md | Multi-product & discounts deep dive |
| GENIE_STYLE_CUSTOMIZATION.md | Style system deep dive |
| GENIE_GAP_ANALYSIS.md | Feature completion tracking |

---

## 💡 Tips & Best Practices

### For Developers

1. **Always validate combo discount on backend** - Never trust client calculation
2. **Use real data, never hardcode** - Always query products.stock, orders table
3. **Test with 0 stock** - Urgency banner should hide gracefully
4. **Test mobile checkout** - Modal should be full-screen on small devices
5. **Clear cache after style changes** - CSS variables might be cached

### For Product Managers

1. **Test discount tiers** - Try 1, 2, 3+ product combinations
2. **Verify real data accuracy** - Compare stock/order counts to admin panel
3. **Check mobile experience** - Product grid should stack nicely
4. **Review trust badges** - Should render without breaking layout
5. **Performance testing** - Pages should load < 2s on 4G

### For QA/Testers

1. Create test products with various prices
2. Test all brand color combinations
3. Test with both real and fake customer data
4. Verify discount shows in order history
5. Cross-browser testing (Chrome, Safari, Firefox, mobile)

---

## 🎓 Learning Resources

### Understanding the Architecture

1. Start with **GENIE_V2_SPEC.md** - Understand the what & why
2. Read **GENIE_TECHNICAL_GUIDE.md** - Learn the how
3. Dive into **GENIE_MULTIPRODUCT_COMBOS.md** - Specific feature deep dive
4. Reference **GENIE_STYLE_CUSTOMIZATION.md** - Style system

### For Code Review

1. Check TypeScript types match interfaces
2. Verify Zod schemas validate input
3. Ensure combo discount on both frontend & backend
4. Check real data queries have proper indexes
5. Test error handling (no products, no stock, etc.)

---

## 🆘 Quick Support

### "How do I...?"

| Question | Answer Location |
|----------|-----------------|
| ...create multi-product page? | GENIE_USER_GUIDE.md → Step 2 |
| ...enable urgency banner? | GENIE_MULTIPRODUCT_COMBOS.md → Configuration |
| ...apply brand colors? | GENIE_STYLE_CUSTOMIZATION.md → CSS Implementation |
| ...validate combo discount? | GENIE_TECHNICAL_GUIDE.md → Order Creation API |
| ...add new section variant? | GENIE_TECHNICAL_GUIDE.md → Component Architecture |

---

## 📞 Contact & Support

For questions about:
- **Product features** → Check GENIE_USER_GUIDE.md
- **Technical implementation** → Check GENIE_TECHNICAL_GUIDE.md
- **Specific features** → Check respective feature docs
- **Bugs/issues** → Create GitHub issue with docs reference

---

**Last Updated:** 2026-01-22  
**Version:** 2.2  
**Status:** ✅ Production Ready

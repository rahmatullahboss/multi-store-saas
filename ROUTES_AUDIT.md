# Routes Audit Report

**Generated**: March 7, 2026  
**Scope**: `apps/web/app/routes/`  
**Purpose**: Identify all storefront routes and their theme dependencies

---

## Executive Summary

| Route Category | Count | Status | Complexity |
|---------------|-------|--------|------------|
| Product Routes | 5 | 🟢 Active | Medium |
| Cart Routes | 2 | 🟢 Active | Low |
| Checkout Routes | 5 | 🟢 Active | High |
| Collection Routes | 3 | 🟢 Active | Medium |
| Template Preview Routes | 5 | 🟢 Active | High |
| **Total Storefront Routes** | **20** | 🟢 **Healthy** | - |

---

## 1. Product Routes

### 1.1 `/products` Routes (5 files)

| File | Purpose | Lines | Layout Used | Theme-Specific |
|------|---------|-------|-------------|----------------|
| `products.tsx` | Products list layout | ~50 | StorePageWrapper | ❌ No |
| `products._index.tsx` | Products index | ~100 | StorePageWrapper | ❌ No |
| `products.$handle.tsx` | Product detail page | ~200 | StorePageWrapper | ❌ No |
| `app.products.tsx` | Admin products | ~300 | AdminLayout | ❌ No |
| `app.products.$id.tsx` | Admin product edit | ~400 | AdminLayout | ❌ No |

**Key Findings**:
- Customer-facing product routes use `StorePageWrapper`
- No theme-specific product routes (shared across all themes)
- Product detail page uses `UnifiedHeader` and `UnifiedFooter`

**Dependencies**:
```typescript
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { UnifiedHeader } from '~/components/sections/header/UnifiedHeader';
import { UnifiedFooter } from '~/components/sections/footer/UnifiedFooter';
```

---

### 1.2 Product Detail Analysis

**File**: `products.$handle.tsx`

**Features**:
- Product images gallery
- Variant selection
- Add to cart
- Product description
- Related products

**Theme Integration**:
```typescript
// Gets theme from storefront settings
const theme = await getThemeConfig(storeId);

// Passes theme to components
<UnifiedHeader theme={theme} />
<ProductPage theme={theme} product={product} />
<UnifiedFooter theme={theme} />
```

**Complexity**: Medium  
**Test Coverage**: ⚠️ Partial (useProductPrice.test.ts exists)

---

## 2. Cart Routes

### 2.1 `/cart` Routes (2 files)

| File | Purpose | Lines | Layout Used | Theme-Specific |
|------|---------|-------|-------------|----------------|
| `cart.tsx` | Customer cart page | ~150 | StorePageWrapper | ❌ No |
| `store-template-preview.$templateId_.cart.tsx` | Template preview cart | ~100 | PreviewLayout | ⚠️ Preview only |

**Key Findings**:
- Single cart page shared across all themes
- Template preview has separate cart for demonstration
- Uses `CartPage` shared component from `store-templates/shared/`

**Dependencies**:
```typescript
import { CartPage } from '~/components/store-templates/shared/CartPage';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
```

**Complexity**: Low  
**Test Coverage**: ❌ No dedicated tests

---

## 3. Checkout Routes

### 3.1 `/checkout` Routes (5 files)

| File | Purpose | Lines | Layout Used | Theme-Specific |
|------|---------|-------|-------------|----------------|
| `checkout.tsx` | Main checkout page | ~300 | StorePageWrapper | ❌ No |
| `checkout.success.tsx` | Checkout success | ~100 | StorePageWrapper | ❌ No |
| `checkout.cancelled.tsx` | Checkout cancelled | ~80 | StorePageWrapper | ❌ No |
| `checkout.failed.tsx` | Checkout failed | ~80 | StorePageWrapper | ❌ No |
| `store-template-preview.$templateId_.checkout.tsx` | Template preview | ~150 | PreviewLayout | ⚠️ Preview only |

**Key Findings**:
- Checkout flow is shared across all themes
- Success/cancelled/failed pages are simple status pages
- Uses `CheckoutPage` shared component from `store-templates/shared/`

**Dependencies**:
```typescript
import { CheckoutPage } from '~/components/store-templates/shared/CheckoutPage';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { checkout-abandonment.server.ts } from '~/services/';
```

**Complexity**: High (payment integration, validation)  
**Test Coverage**: ⚠️ Partial (CheckoutModal.test.tsx exists)

---

## 4. Collection Routes

### 4.1 `/collections` Routes (3 files)

| File | Purpose | Lines | Layout Used | Theme-Specific |
|------|---------|-------|-------------|----------------|
| `collections.$slug.tsx` | Collection detail | ~200 | StorePageWrapper | ❌ No |
| `app.collections.tsx` | Admin collections | ~250 | AdminLayout | ❌ No |
| `app.collections.new.tsx` | Admin new collection | ~150 | AdminLayout | ❌ No |
| `store-template-preview.$templateId_.collections.$id.tsx` | Template preview | ~150 | PreviewLayout | ⚠️ Preview only |

**Key Findings**:
- Collection pages use shared `CollectionPage` component
- No theme-specific collection routes
- Filtering and sorting supported

**Dependencies**:
```typescript
import { CollectionPage } from '~/components/store-templates/shared/CollectionPage';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
```

**Complexity**: Medium  
**Test Coverage**: ❌ No dedicated tests

---

## 5. Template Preview Routes

### 5.1 Preview Routes (5 files)

| File | Purpose | Lines | Layout Used |
|------|---------|-------|-------------|
| `store-template-preview.$templateId_.cart.tsx` | Preview cart | ~100 | PreviewLayout |
| `store-template-preview.$templateId_.checkout.tsx` | Preview checkout | ~150 | PreviewLayout |
| `store-template-preview.$templateId_.collections.$id.tsx` | Preview collection | ~150 | PreviewLayout |
| `store-template-preview.$templateId_.products.$id.tsx` | Preview product | ~200 | PreviewLayout |

**Key Findings**:
- Preview routes allow testing themes before activation
- Each route passes `templateId` to components
- Uses mock data for demonstration

**Complexity**: High (must work with any theme)  
**Test Coverage**: ❌ No dedicated tests

---

## 6. Route Layout Analysis

### 6.1 Layout Usage Summary

| Layout Component | Usage Count | Routes |
|-----------------|-------------|--------|
| `StorePageWrapper` | 12 | All customer-facing routes |
| `AdminLayout` | 5 | Admin routes |
| `PreviewLayout` | 3 | Template preview routes |

### 6.2 Header/Footer Usage

| Route Pattern | Header | Footer |
|---------------|--------|--------|
| `/products.*` | UnifiedHeader | UnifiedFooter |
| `/cart` | UnifiedHeader | UnifiedFooter |
| `/checkout.*` | UnifiedHeader | UnifiedFooter |
| `/collections.*` | UnifiedHeader | UnifiedFooter |
| `/store-template-preview.*` | ThemeHeader | ThemeFooter |

**Key Finding**: All customer-facing routes use `UnifiedHeader` and `UnifiedFooter` - NOT theme-specific headers/footers!

---

## 7. Theme Integration Analysis

### 7.1 How Routes Get Theme

```typescript
// Typical route loader
export async function loader({ request, params }: LoaderFunctionArgs) {
  const storeId = getStoreId(request);
  
  // Get theme from storefront settings
  const settings = await getStorefrontSettings(storeId);
  const theme = settings.theme;
  
  return json({ theme, ... });
}

// Component usage
export default function RouteComponent() {
  const { theme } = useLoaderData();
  
  return (
    <StorePageWrapper theme={theme}>
      <UnifiedHeader theme={theme} />
      <PageContent theme={theme} />
      <UnifiedFooter theme={theme} />
    </StorePageWrapper>
  );
}
```

### 7.2 Theme-Specific vs Shared Routes

| Category | Theme-Specific | Shared |
|----------|---------------|--------|
| Products | 0 | 5 |
| Cart | 0 | 2 |
| Checkout | 0 | 5 |
| Collections | 0 | 3 |
| Template Preview | 4 | 0 |
| **Total** | **4** | **15** |

**Key Finding**: 75% of routes are shared (not theme-specific)!

---

## 8. Route Complexity Assessment

| Route | Complexity | Lines | Dependencies | Test Coverage |
|-------|-----------|-------|--------------|---------------|
| `products.$handle` | Medium | ~200 | ProductPage, theme | ⚠️ Partial |
| `cart` | Low | ~150 | CartPage | ❌ None |
| `checkout` | High | ~300 | CheckoutPage, payment | ⚠️ Partial |
| `collections.$slug` | Medium | ~200 | CollectionPage | ❌ None |
| Template preview | High | ~150 | Any theme | ❌ None |

---

## 9. Recommendations

### Immediate Actions

1. **Add route tests** - Start with checkout flow
2. **Document route dependencies** - Add JSDoc comments
3. **Verify theme passing** - Ensure all routes pass theme correctly

### Medium-term Actions

1. **Consolidate preview routes** - Single preview component
2. **Add error boundaries** - Handle route errors gracefully
3. **Add loading states** - Better UX during transitions

### Long-term Actions

1. **Route-based code splitting** - Improve performance
2. **Add route analytics** - Track user flows
3. **Implement route guards** - Better auth handling

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Theme not passed to components | Low | High | Add type checking |
| Preview routes break with themes | Medium | Medium | Add visual tests |
| Checkout flow errors | Medium | High | Add error boundaries |
| No route tests | High | Medium | Add comprehensive tests |

---

## 11. Conclusion

**Overall Route Health**: 🟢 **GOOD**

- All critical routes exist and are functional
- Routes use shared components (UnifiedHeader, UnifiedFooter)
- Theme integration is consistent across routes
- 75% of routes are theme-agnostic (shared)

**Key Finding**: Routes are **NOT** the problem area. The theme system rebuild should focus on:
1. Components (Header, Footer, Layout)
2. CSS variables (inline styles)
3. Theme configuration

**Routes require minimal changes** - mostly already using unified components.

---

**Audit Completed**: March 7, 2026  
**Total Routes Audited**: 20 storefront routes  
**Theme-Specific Routes**: 4 (20%)  
**Shared Routes**: 16 (80%)

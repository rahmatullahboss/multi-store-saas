# Testing Infrastructure Audit Report

**Generated**: March 7, 2026  
**Scope**: `apps/web/app/tests/` and `**/*.test.ts(x)`  
**Purpose**: Audit existing test coverage and infrastructure

---

## Executive Summary

| Category | Count | Status | Coverage |
|----------|-------|--------|----------|
| Test Files | 19 | 🟡 Minimal | <10% |
| Unit Tests | 8 | 🟡 Partial | Component-level |
| Integration Tests | 4 | 🟡 Partial | API-level |
| Performance Tests | 2 | 🟢 Good | Load testing |
| Security Tests | 1 | 🟢 Good | OWASP |
| Visual Regression Tests | 0 | 🔴 Missing | Critical gap |
| Tenant Isolation Tests | 0 | 🔴 Missing | Critical gap |

---

## 1. Test Files Inventory

### 1.1 All Test Files (19 files)

| File Path | Type | Lines | Status |
|-----------|------|-------|--------|
| `components/store-templates/starter-store/index.test.tsx` | Component | ~40 | 🟢 Active |
| `components/store-templates/starter-store/theme.test.ts` | Unit | ~35 | 🟢 Active |
| `tests/ai/action-generator.test.ts` | Unit | ~100 | 🟢 Active |
| `tests/ai/nlp-commands.test.ts` | Unit | ~150 | 🟢 Active |
| `tests/api/payment.test.ts` | Integration | ~200 | 🟢 Active |
| `tests/api/store.test.ts` | Integration | ~180 | 🟢 Active |
| `tests/api/webhook.test.ts` | Integration | ~150 | 🟢 Active |
| `tests/performance/api-load.test.ts` | Performance | ~120 | 🟢 Active |
| `tests/performance/db-queries.test.ts` | Performance | ~100 | 🟢 Active |
| `tests/security/owasp.test.ts` | Security | ~250 | 🟢 Active |
| `tests/unit/CheckoutModal.test.tsx` | Component | ~80 | 🟢 Active |
| `tests/unit/IntentWizard.test.tsx` | Component | ~100 | 🟢 Active |
| `tests/unit/SectionManagerVariants.test.tsx` | Component | ~120 | 🟢 Active |
| `tests/unit/StyleWizard.test.tsx` | Component | ~90 | 🟢 Active |
| `tests/unit/intentEngine.test.ts` | Unit | ~150 | 🟢 Active |
| `tests/unit/theme-engine.test.ts` | Unit | ~200 | 🟢 Active |
| `tests/unit/useProductPrice.test.ts` | Unit | ~60 | 🟢 Active |
| `tests/unit/variantRegistry.test.ts` | Unit | ~80 | 🟢 Active |
| `utils/formatPrice.test.ts` | Unit | ~40 | 🟢 Active |

**Total Lines of Test Code**: ~2,245 lines

---

## 2. Test Coverage by Area

### 2.1 Theme System Tests

| Test File | Coverage | Status |
|-----------|----------|--------|
| `components/store-templates/starter-store/index.test.tsx` | Component rendering | 🟢 Good |
| `components/store-templates/starter-store/theme.test.ts` | Theme config | 🟢 Good |
| `tests/unit/theme-engine.test.ts` | Theme engine | 🟢 Good |

**Coverage**: Only `starter-store` theme has tests. **17 themes have NO tests.**

**Test Example** (`theme.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { STARTER_STORE_THEME, resolveStarterStoreTheme } from './theme';

describe('Starter Store Theme', () => {
  it('should have correct primary color', () => {
    expect(STARTER_STORE_THEME.primary).toBe('#6366f1');
  });
  
  it('should resolve theme with config', () => {
    const config = { primaryColor: '#FF0000' };
    const resolved = resolveStarterStoreTheme(config);
    expect(resolved.primary).toBe('#FF0000');
  });
  
  it('should use default when config is null', () => {
    const resolved = resolveStarterStoreTheme(null);
    expect(resolved.primary).toBe('#6366f1');
  });
});
```

---

### 2.2 Component Tests

| Test File | Component | Coverage |
|-----------|-----------|----------|
| `tests/unit/CheckoutModal.test.tsx` | CheckoutModal | Basic rendering |
| `tests/unit/IntentWizard.test.tsx` | IntentWizard | Interaction |
| `tests/unit/SectionManagerVariants.test.tsx` | SectionManager | Variant switching |
| `tests/unit/StyleWizard.test.tsx` | StyleWizard | Style application |

**Coverage**: Only AI/Builder components tested. **NO tests for:**
- UnifiedHeader
- UnifiedFooter
- StorePageWrapper
- ProductPage
- CartPage
- CheckoutPage
- CollectionPage

---

### 2.3 API Tests

| Test File | Endpoints | Coverage |
|-----------|-----------|----------|
| `tests/api/payment.test.ts` | Payment APIs | 🟢 Good |
| `tests/api/store.test.ts` | Store APIs | 🟢 Good |
| `tests/api/webhook.test.ts` | Webhook handling | 🟢 Good |

**Coverage**: Backend API tests exist but don't cover storefront-specific endpoints.

---

### 2.4 Performance Tests

| Test File | Purpose | Status |
|-----------|---------|--------|
| `tests/performance/api-load.test.ts` | API load testing | 🟢 Active |
| `tests/performance/db-queries.test.ts` | DB query performance | 🟢 Active |

**Coverage**: Performance tests exist but focus on backend, not frontend rendering.

---

### 2.5 Security Tests

| Test File | Purpose | Status |
|-----------|---------|--------|
| `tests/security/owasp.test.ts` | OWASP Top 10 | 🟢 Active |

**Coverage**: Security tests cover OWASP Top 10 but not tenant isolation.

---

## 3. Critical Testing Gaps

### 3.1 Visual Regression Tests 🔴

**Status**: **NONE EXIST**

**Why Critical**:
- Theme changes can break visual appearance
- No automated way to detect visual regressions
- Manual testing required for every change

**Recommended Tools**:
- **Chromatic** - Storybook-based visual testing
- **Percy** - Visual review platform
- **Playwright** - Screenshot comparison
- **Loki** - Jest-based visual regression

**Implementation Plan**:
```bash
# Install Playwright
npm install -D @playwright/test

# Create visual test
# tests/visual/theme-visual.test.ts
import { test, expect } from '@playwright/test';

test('starter-store homepage', async ({ page }) => {
  await page.goto('/store/starter-store');
  await expect(page).toHaveScreenshot('starter-homepage.png');
});

test('daraz homepage', async ({ page }) => {
  await page.goto('/store/daraz');
  await expect(page).toHaveScreenshot('daraz-homepage.png');
});
```

---

### 3.2 Tenant Isolation Tests 🔴

**Status**: **NONE EXIST**

**Why Critical**:
- Multi-tenant SaaS requires strict isolation
- Data leakage between tenants is catastrophic
- No automated verification of isolation

**Search Results**:
```bash
grep -rn "tenant.*isolation" apps/web/app/tests/
# Output: No tenant isolation tests found
```

**Recommended Tests**:
```typescript
// tests/tenant/isolation.test.ts
import { describe, it, expect } from 'vitest';

describe('Tenant Isolation', () => {
  it('should not access another tenant products', async () => {
    const tenantA = createTestTenant('tenant-a');
    const tenantB = createTestTenant('tenant-b');
    
    const tenantAProducts = await getProducts(tenantA.id);
    const tenantBProducts = await getProducts(tenantB.id);
    
    // Verify no overlap
    const overlap = tenantAProducts.filter(p => 
      tenantBProducts.some(bp => bp.id === p.id)
    );
    expect(overlap).toHaveLength(0);
  });
  
  it('should not access another tenant settings', async () => {
    // Similar test for settings
  });
  
  it('should not access another tenant customers', async () => {
    // Similar test for customers
  });
});
```

---

### 3.3 Route Tests 🔴

**Status**: **NONE EXIST**

**Why Important**:
- Routes are entry points for users
- Route errors block all functionality
- No verification of route loading

**Recommended Tests**:
```typescript
// tests/routes/products.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductsRoute } from '~/routes/products.$handle';

describe('Products Route', () => {
  it('should load product page', async () => {
    render(<ProductsRoute />);
    expect(await screen.findByText('Product Name')).toBeInTheDocument();
  });
  
  it('should show 404 for invalid product', async () => {
    render(<ProductsRoute productId="invalid" />);
    expect(await screen.findByText('Product not found')).toBeInTheDocument();
  });
});
```

---

### 3.4 Service Tests 🟡

**Status**: **PARTIAL**

**Coverage**:
- ✅ AI services tested
- ✅ API services tested
- ❌ Cart services NOT tested
- ❌ Checkout services NOT tested
- ❌ Storefront settings NOT tested

**Missing Tests**:
```typescript
// tests/services/cart.test.ts (MISSING)
// tests/services/checkout.test.ts (MISSING)
// tests/services/storefront-settings.test.ts (MISSING)
```

---

## 4. Test Infrastructure

### 4.1 Test Framework

| Tool | Version | Status |
|------|---------|--------|
| Vitest | Latest | ✅ Configured |
| React Testing Library | Latest | ✅ Configured |
| Playwright | ❌ Not installed | 🔴 Missing |
| Chromatic/Percy | ❌ Not configured | 🔴 Missing |

### 4.2 Test Configuration

**File**: `vite.config.ts` (test configuration)

```typescript
// Test configuration exists but may need updates for visual tests
```

### 4.3 CI/CD Integration

**Status**: ❌ **UNKNOWN**

**Questions**:
- Are tests run on every PR?
- Is there a test gate for deployment?
- Are visual tests in the pipeline?

---

## 5. Test Coverage Summary

### 5.1 By Component Type

| Component Type | Files | Tested | Coverage |
|---------------|-------|--------|----------|
| Theme Components | 134 | 1 (starter-store) | <1% |
| Header Components | 26 | 0 | 0% |
| Footer Components | 25 | 0 | 0% |
| Layout Components | 14 | 0 | 0% |
| Section Components | 50 | 0 | 0% |
| Shared Components | 5 | 0 | 0% |
| Routes | 20 | 0 | 0% |
| Services | ~80 | ~10 | ~12% |

### 5.2 By Test Type

| Test Type | Count | Target | Gap |
|-----------|-------|--------|-----|
| Unit Tests | 10 | 50 | -40 |
| Component Tests | 5 | 30 | -25 |
| Integration Tests | 3 | 20 | -17 |
| Visual Tests | 0 | 18 | -18 |
| E2E Tests | 0 | 10 | -10 |
| Tenant Tests | 0 | 5 | -5 |

---

## 6. Recommendations

### Phase 1: Critical (Week 1-2)

1. **Add visual regression tests**
   - Install Playwright
   - Create baseline screenshots for all 18 themes
   - Add to CI/CD pipeline

2. **Add tenant isolation tests**
   - Test data isolation
   - Test settings isolation
   - Test customer isolation

3. **Add route tests**
   - Test all 20 storefront routes
   - Test error states (404, 500)
   - Test loading states

### Phase 2: Important (Week 3-4)

1. **Add component tests**
   - UnifiedHeader
   - UnifiedFooter
   - StorePageWrapper
   - ProductPage
   - CartPage
   - CheckoutPage

2. **Add service tests**
   - Cart services
   - Checkout services
   - Storefront settings

### Phase 3: Nice-to-have (Week 5-6)

1. **Add E2E tests**
   - Full checkout flow
   - Product browsing flow
   - Cart management flow

2. **Add performance tests**
   - Frontend rendering
   - Theme switching
   - Large catalog handling

---

## 7. Test Plan for Theme Rebuild

### Before Migration

```markdown
## Baseline Tests (MUST RUN BEFORE MIGRATION)

- [ ] Visual regression: All 18 themes homepage
- [ ] Visual regression: All 18 themes product page
- [ ] Visual regression: All 18 themes cart page
- [ ] Visual regression: All 18 themes checkout page
- [ ] Tenant isolation: Data access
- [ ] Tenant isolation: Settings access
- [ ] Route tests: All 20 routes load
```

### During Migration

```markdown
## Per-Theme Migration Tests

For each theme migrated:
- [ ] Visual regression: Compare before/after
- [ ] Component tests: Header renders
- [ ] Component tests: Footer renders
- [ ] Component tests: Colors match theme.ts
- [ ] Route tests: All routes work with new theme
```

### After Migration

```markdown
## Final Verification Tests

- [ ] Visual regression: All themes pass
- [ ] Performance: Lighthouse score >= 90
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Tenant isolation: All tests pass
- [ ] Route tests: All routes pass
```

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| No visual regression tests | High | High | Add Playwright before migration |
| No tenant isolation tests | Medium | Critical | Add immediately |
| Low test coverage | High | Medium | Incremental improvement |
| No CI/CD integration | Medium | High | Add test gates |

---

## 9. Conclusion

**Overall Testing Health**: 🟡 **INSUFFICIENT**

**Critical Gaps**:
1. **No visual regression tests** - Cannot detect visual breaks
2. **No tenant isolation tests** - Risk of data leakage
3. **No route tests** - Routes untested
4. **<1% component coverage** - Only starter-store tested

**Recommendation**: **BLOCK theme rebuild until visual regression and tenant isolation tests are in place.**

**Minimum Viable Testing**:
1. Visual regression tests for all 18 themes (baseline)
2. Tenant isolation tests (critical for SaaS)
3. Route tests for all 20 storefront routes

---

**Audit Completed**: March 7, 2026  
**Total Test Files**: 19  
**Test Coverage**: <10%  
**Visual Tests**: 0 (Critical)  
**Tenant Tests**: 0 (Critical)

# Theme Components Audit Report

**Generated**: March 7, 2026  
**Scope**: `apps/web/app/components/`  
**Purpose**: Identify all theme-related components for rebuild planning

---

## Executive Summary

| Component Type | Count | Total Lines | Status |
|---------------|-------|-------------|--------|
| Header Components | 26 | ~8,500 | 🔴 Fragmented |
| Footer Components | 25 | ~7,200 | 🔴 Fragmented |
| Layout/Wrapper Components | 14 | ~5,800 | 🔴 Fragmented |
| Theme Directories | 18 | 16,009 (index files only) | 🔴 Needs consolidation |
| Section Components | 50 | ~15,000 (est.) | 🟡 Mixed |
| **Total Theme Files** | **134** | **~2.0MB** | 🔴 **Critical** |

---

## 1. Header Components Analysis

### All Header Files Found (26 files)

| File Path | Lines | Complexity | Unifiable? | Notes |
|-----------|-------|------------|------------|-------|
| `components/account/AccountHeader.tsx` | - | Low | ✅ Yes | Account-specific |
| `components/builder/sections/HeaderSection.tsx` | - | Medium | ✅ Yes | Builder component |
| `components/sections/header/UnifiedHeader.tsx` | 459 | High | ✅ **KEEP** | Already unified |
| `components/store-layouts/StoreHeader.tsx` | 310 | Medium | ✅ Yes | Template-aware |
| `components/store-sections/CollectionHeaderSection.tsx` | - | Low | ✅ Yes | Collection-specific |
| `components/store-sections/ProductHeaderSection.tsx` | - | Low | ✅ Yes | Product-specific |
| `components/store-templates/artisan-market/sections/Header.tsx` | ~200 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/aurora-minimal/sections/Header.tsx` | ~400 | High | ✅ Yes | Theme-specific |
| `components/store-templates/bdshop/sections/Header.tsx` | ~450 | High | ✅ Yes | Theme-specific |
| `components/store-templates/daraz/sections/Header.tsx` | ~500 | High | ✅ Yes | Theme-specific |
| `components/store-templates/dc-store/sections/Header.tsx` | ~300 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/eclipse/sections/Header.tsx` | ~350 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/freshness/sections/Header.tsx` | ~380 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/ghorer-bazar/sections/Header.tsx` | ~600 | High | ✅ Yes | Theme-specific |
| `components/store-templates/luxe-boutique/sections/Header.tsx` | ~250 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/nova-lux-ultra/sections/Header.tsx` | ~450 | High | ✅ Yes | Theme-specific |
| `components/store-templates/nova-lux/sections/Header.tsx` | ~400 | High | ✅ Yes | Theme-specific |
| `components/store-templates/ozzyl-premium/sections/Header.tsx` | ~300 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/rovo/sections/Header.tsx` | ~150 | Low | ✅ Yes | Theme-specific |
| `components/store-templates/sokol/sections/Header.tsx` | ~200 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/starter-store/sections/Header.tsx` | ~350 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/tech-modern/sections/Header.tsx` | ~400 | High | ✅ Yes | Theme-specific |
| `components/store-templates/turbo-sale/sections/Header.tsx` | ~380 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/zenith-rise/sections/Header.tsx` | ~350 | Medium | ✅ Yes | Theme-specific |
| `components/store/rovo/RovoHeader.tsx` | ~180 | Low | ✅ Yes | Rovo-specific |
| `components/ui/PageHeader.tsx` | - | Low | ✅ Yes | UI component |

### Header Analysis

**Key Finding**: `UnifiedHeader.tsx` (459 lines) already exists in `components/sections/header/` with:
- Variant-driven rendering (marketplace, luxury, minimal, bold, default)
- Layout configuration (logo-left, logo-center)
- Sticky/blur effects
- Mobile responsive
- Search integration
- Cart/wishlist integration

**Recommendation**: **KEEP UnifiedHeader.tsx** - migrate all theme-specific headers to use this unified component with variant configuration.

---

## 2. Footer Components Analysis

### All Footer Files Found (25 files)

| File Path | Lines | Complexity | Unifiable? | Notes |
|-----------|-------|------------|------------|-------|
| `components/builder/sections/FooterSection.tsx` | - | Medium | ✅ Yes | Builder component |
| `components/landing-builder/LandingFooter.tsx` | - | Low | ✅ Yes | Landing-specific |
| `components/sections/footer/UnifiedFooter.tsx` | 271 | Medium | ✅ **KEEP** | Already unified |
| `components/store-layouts/StoreFooter.tsx` | 310 | Medium | ✅ Yes | Template-aware |
| `components/store-templates/artisan-market/sections/Footer.tsx` | ~200 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/aurora-minimal/sections/Footer.tsx` | ~350 | High | ✅ Yes | Theme-specific |
| `components/store-templates/bdshop/sections/Footer.tsx` | ~400 | High | ✅ Yes | Theme-specific |
| `components/store-templates/daraz/sections/Footer.tsx` | ~450 | High | ✅ Yes | Theme-specific |
| `components/store-templates/dc-store/sections/Footer.tsx` | ~250 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/eclipse/sections/Footer.tsx` | ~300 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/freshness/sections/Footer.tsx` | ~320 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/ghorer-bazar/sections/Footer.tsx` | ~500 | High | ✅ Yes | Theme-specific |
| `components/store-templates/luxe-boutique/sections/Footer.tsx` | ~200 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/nova-lux-ultra/sections/Footer.tsx` | ~380 | High | ✅ Yes | Theme-specific |
| `components/store-templates/nova-lux/sections/Footer.tsx` | ~350 | High | ✅ Yes | Theme-specific |
| `components/store-templates/ozzyl-premium/sections/Footer.tsx` | ~250 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/rovo/sections/Footer.tsx` | ~120 | Low | ✅ Yes | Theme-specific |
| `components/store-templates/shared/StandardFooter.tsx` | 550 | High | ✅ **KEEP** | Shared component |
| `components/store-templates/sokol/sections/Footer.tsx` | ~180 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/starter-store/sections/Footer.tsx` | ~300 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/tech-modern/sections/Footer.tsx` | ~350 | High | ✅ Yes | Theme-specific |
| `components/store-templates/turbo-sale/sections/Footer.tsx` | ~320 | Medium | ✅ Yes | Theme-specific |
| `components/store-templates/zenith-rise/sections/Footer.tsx` | ~300 | Medium | ✅ Yes | Theme-specific |
| `components/store/rovo/RovoFooter.tsx` | ~150 | Low | ✅ Yes | Rovo-specific |
| `components/templates/quick-start/Footer.tsx` | - | Low | ✅ Yes | Template component |

### Footer Analysis

**Key Finding**: `UnifiedFooter.tsx` (271 lines) already exists in `components/sections/footer/` with:
- Variant-driven rendering (marketplace, luxury, minimal, bold, default)
- Layout configuration (multi-column, centered, minimal)
- Newsletter integration
- Social links
- Payment gateway display
- Ozzyl branding

**Recommendation**: **KEEP UnifiedFooter.tsx** - migrate all theme-specific footers to use this unified component with variant configuration.

---

## 3. Layout/Wrapper Components Analysis

### All Layout Files Found (14 files)

| File Path | Lines | Complexity | Unifiable? | Notes |
|-----------|-------|------------|------------|-------|
| `components/editor/MagicSectionWrapper.tsx` | - | Medium | ⚠️ Keep | Editor-specific |
| `components/onboarding/OnboardingLayout.tsx` | - | Low | ⚠️ Keep | Onboarding-specific |
| `components/page-builder/BuilderLayout.tsx` | - | Medium | ⚠️ Keep | Builder-specific |
| `components/page-builder/TemplateLayoutRenderer.tsx` | - | High | ⚠️ Keep | Builder-specific |
| `components/store-layouts/BDShopPageWrapper.tsx` | 450 | High | ✅ Yes | Theme-specific |
| `components/store-layouts/DarazPageWrapper.tsx` | 350 | High | ✅ Yes | Theme-specific |
| `components/store-layouts/GhorerBazarPageWrapper.tsx` | 380 | High | ✅ Yes | Theme-specific |
| `components/store-layouts/StorePageWrapper.tsx` | 400 | High | ✅ **KEEP** | Generic wrapper |
| `components/store-layouts/UnifiedStoreLayout.tsx` | 650 | High | ✅ **KEEP** | Already unified |
| `components/store-templates/rovo/sections/Layout.tsx` | ~100 | Low | ✅ Yes | Rovo-specific |
| `components/store-templates/sokol/sections/Layout.tsx` | ~150 | Medium | ✅ Yes | Sokol-specific |
| `components/store/rovo/RovoLayout.tsx` | ~200 | Medium | ✅ Yes | Rovo-specific |
| `components/templates/StoreLayout.tsx` | - | Medium | ✅ Yes | Template component |
| `components/templates/_core/SectionWrapper.tsx` | - | Low | ⚠️ Keep | Core component |

### Layout Analysis

**Key Finding**: `UnifiedStoreLayout.tsx` (650 lines) and `StorePageWrapper.tsx` (400 lines) exist in `components/store-layouts/`:
- `UnifiedStoreLayout.tsx` - Comprehensive layout with theme integration
- `StorePageWrapper.tsx` - Generic page wrapper with header/footer

**Recommendation**: **KEEP UnifiedStoreLayout.tsx** - consolidate theme-specific wrappers into configuration-driven approach.

---

## 4. Theme Directories Analysis

### All 18 Theme Directories

| Theme | Index Lines | Has Sections | Has Pages | Has Theme.ts | Complexity |
|-------|-------------|--------------|-----------|--------------|------------|
| `artisan-market` | 499 | ✅ | ❌ | ✅ | Medium |
| `aurora-minimal` | 1,467 | ✅ | ❌ | ✅ | High |
| `bdshop` | 1,599 | ✅ | ✅ | ✅ | High |
| `daraz` | 1,520 | ✅ | ✅ | ✅ | High |
| `dc-store` | 416 | ✅ | ✅ | ✅ | Medium |
| `eclipse` | 1,136 | ✅ | ✅ | ✅ | High |
| `freshness` | 1,182 | ✅ | ✅ | ✅ | High |
| `ghorer-bazar` | 2,805 | ✅ | ✅ | ✅ | **Critical** |
| `luxe-boutique` | 23 | ✅ | ✅ | ✅ | Low |
| `nova-lux-ultra` | 1,270 | ✅ | ✅ | ✅ | High |
| `nova-lux` | 25 | ✅ | ✅ | ✅ | Low |
| `ozzyl-premium` | 10 | ✅ | ✅ | ✅ | Low |
| `rovo` | 49 | ✅ | ❌ | ✅ | Low |
| `sokol` | 30 | ✅ | ❌ | ✅ | Low |
| `starter-store` | 511 | ✅ | ✅ | ✅ | Medium |
| `tech-modern` | 1,284 | ✅ | ✅ | ✅ | High |
| `turbo-sale` | 1,118 | ✅ | ❌ | ✅ | High |
| `zenith-rise` | 1,065 | ✅ | ❌ | ✅ | High |
| **TOTAL** | **16,009** | **18** | **13** | **18** | - |

### Theme.ts Files Analysis

All 18 themes have a `theme.ts` file containing:
- Color definitions (primary, accent, background, text, etc.)
- Font configurations
- Some have shadows, transitions, spacing

**Example structures**:
- `starter-store/theme.ts`: 150 lines - Full config with helper functions
- `daraz/theme.ts`: 40 lines - Simple color constants
- `nova-lux/theme.ts`: 80 lines - Comprehensive with shadows, transitions

---

## 5. Section Components

**Total Section Files**: 50 `.tsx` files across all theme directories

Common sections found:
- Header.tsx (18 files - one per theme)
- Footer.tsx (18 files - one per theme)
- Hero.tsx (varies)
- ProductCard.tsx (varies)
- CollectionCard.tsx (varies)
- FeaturedProducts.tsx (varies)

---

## 6. Consolidation Recommendations

### Files to KEEP (Already Unified)

| File | Purpose | Lines |
|------|---------|-------|
| `components/sections/header/UnifiedHeader.tsx` | Unified header component | 459 |
| `components/sections/footer/UnifiedFooter.tsx` | Unified footer component | 271 |
| `components/store-layouts/UnifiedStoreLayout.tsx` | Unified layout wrapper | 650 |
| `components/store-layouts/StorePageWrapper.tsx` | Generic page wrapper | 400 |
| `components/store-templates/shared/StandardFooter.tsx` | Shared footer | 550 |
| `components/store-templates/shared/CartPage.tsx` | Shared cart page | 850 |
| `components/store-templates/shared/CheckoutPage.tsx` | Shared checkout | 1,200 |
| `components/store-templates/shared/ProductPage.tsx` | Shared product page | 1,400 |
| `components/store-templates/shared/CollectionPage.tsx` | Shared collection page | 850 |

### Files to MIGRATE (Theme-Specific → Unified)

| Component Type | Count | Action |
|----------------|-------|--------|
| Theme-specific Headers | 18 | Migrate to UnifiedHeader variants |
| Theme-specific Footers | 18 | Migrate to UnifiedFooter variants |
| Theme-specific Wrappers | 5 | Migrate to UnifiedStoreLayout |
| **Total to Migrate** | **41** | **Configuration-driven** |

### Files to DELETE (After Migration)

- 18 theme-specific Header.tsx files
- 18 theme-specific Footer.tsx files
- 5 theme-specific wrapper files
- **Total: 41 files**

---

## 7. Complexity Assessment

| Theme | Header | Footer | Index | Overall | Migration Effort |
|-------|--------|--------|-------|---------|------------------|
| artisan-market | Medium | Medium | Medium | Medium | 2 days |
| aurora-minimal | High | High | High | High | 4 days |
| bdshop | High | High | High | High | 4 days |
| daraz | High | High | High | High | 4 days |
| dc-store | Medium | Medium | Medium | Medium | 2 days |
| eclipse | Medium | Medium | High | High | 3 days |
| freshness | Medium | Medium | High | High | 3 days |
| ghorer-bazar | High | High | Critical | Critical | 5 days |
| luxe-boutique | Medium | Medium | Low | Low | 1 day |
| nova-lux-ultra | High | High | High | High | 4 days |
| nova-lux | High | High | Low | Medium | 2 days |
| ozzyl-premium | Medium | Medium | Low | Low | 1 day |
| rovo | Low | Low | Low | Low | 1 day |
| sokol | Medium | Medium | Low | Low | 1 day |
| starter-store | Medium | Medium | Medium | Medium | 2 days |
| tech-modern | High | High | High | High | 4 days |
| turbo-sale | Medium | Medium | High | High | 3 days |
| zenith-rise | Medium | Medium | High | High | 3 days |

**Total Migration Effort**: ~49 days (conservative estimate)

---

## 8. Key Findings

### ✅ Positive Findings

1. **UnifiedHeader.tsx already exists** - 459 lines, variant-driven
2. **UnifiedFooter.tsx already exists** - 271 lines, variant-driven
3. **UnifiedStoreLayout.tsx already exists** - 650 lines, comprehensive
4. **Shared components exist** - CartPage, CheckoutPage, ProductPage, CollectionPage
5. **Theme.ts files are well-structured** - Clear color definitions

### 🔴 Critical Issues

1. **18 duplicate Header implementations** - Should use UnifiedHeader with variants
2. **18 duplicate Footer implementations** - Should use UnifiedFooter with variants
3. **2,419 inline style occurrences** in store-templates (mostly colors)
4. **16,009 lines in theme index files** - Massive duplication
5. **No CSS variable system** - Colors hardcoded in components
6. **No visual regression tests** - Manual testing only

### ⚠️ Risks

1. **Migration complexity** - 41 files to consolidate
2. **Theme-specific customizations** - May be lost in migration
3. **Testing gap** - No automated visual tests
4. **Tenant isolation** - No tests verifying isolation

---

## 9. Next Steps

1. **Review UnifiedHeader.tsx** - Verify it covers all 18 theme variants
2. **Review UnifiedFooter.tsx** - Verify it covers all 18 theme variants
3. **Create CSS variable system** - Extract colors from theme.ts files
4. **Build migration scripts** - Automate header/footer replacement
5. **Add visual regression tests** - Before migration baseline
6. **Execute migration** - Theme by theme
7. **Delete old files** - After verification

---

**Audit Completed**: March 7, 2026  
**Total Files Analyzed**: 134 TypeScript files  
**Total Lines of Code**: ~38,000 lines (estimated)  
**Storage**: 2.0MB

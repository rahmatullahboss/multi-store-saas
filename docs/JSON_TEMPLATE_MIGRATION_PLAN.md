# JSON Template Migration & Architecture Plan V2

## Core Philosophy
The unified JSON schema (`stores.storefront_settings`) is the **only** source of truth for rendering. We must eliminate hardcoded theme React files (`DarazTemplate`, `DCStoreTemplate`) and replace them with a dynamic `SectionRenderer` that is strictly type-safe, supports intelligent lazy loading, and is fully agnostic of arbitrary template IDs.

---

## 1. The Unified Schema Architecture (Zod + TypeScript)

We cannot rely on a simple string `style` prop. The JSON schema must be comprehensive and validated at runtime using Zod.

```typescript
// src/schemas/storefront.schema.ts
import { z } from 'zod';

export const SectionVariantSchema = z.enum(['default', 'minimal', 'bold', 'marketplace', 'luxury']);

export const HeroSectionSchema = z.object({
  id: z.string(),
  type: z.literal('hero_banner'),
  variant: SectionVariantSchema,
  props: z.object({
    sliderImages: z.array(z.string().url()).optional(),
    headline: z.string().optional(),
    subheadline: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    overlayOpacity: z.number().min(0).max(100).default(40)
  })
});

// ... similar schemas for ProductGrid, Header, Footer, etc.

export const StorefrontLayoutSchema = z.object({
  home: z.array(z.union([HeroSectionSchema, ProductGridSchema, CategoryGridSchema])),
  product: z.array(z.union([ProductDetailsSchema, RelatedProductsSchema])),
  // ...
});
```

---

## 2. Dynamic Section Renderer with Smart Chunking

To prevent bundle size explosion while maintaining SSR/SEO, we use an intelligent mix of direct imports (for above-the-fold content) and `React.lazy` (for below-the-fold/heavy components).

```tsx
// components/SectionRenderer.tsx
import { HeroDefault, HeroMarketplace, HeroLuxury } from './sections/Hero';
import { Suspense, lazy } from 'react';

// SEO Critical - Synchronous
const HeaderVariants = {
  default: HeaderDefault,
  marketplace: HeaderMarketplace, // Was DarazHeader
};

const HeroVariants = {
  default: HeroDefault,
  marketplace: HeroMarketplace,   // Was DarazHero
  luxury: HeroLuxury              // Was LuxeHero
};

// Below the Fold / Heavy - Lazy
const LazyReviews = lazy(() => import('./sections/Reviews'));
const LazyVideoPlayer = lazy(() => import('./sections/VideoPlayer'));

export function SectionRenderer({ section, theme }) {
  if (section.type === 'header') {
    const Component = HeaderVariants[section.variant] || HeaderVariants.default;
    return <Component {...section.props} theme={theme} />;
  }

  if (section.type === 'hero_banner') {
    const Component = HeroVariants[section.variant] || HeroVariants.default;
    return <Component {...section.props} theme={theme} />;
  }

  if (section.type === 'product_reviews') {
    return (
      <Suspense fallback={<ReviewsSkeleton />}>
        <LazyReviews {...section.props} theme={theme} />
      </Suspense>
    );
  }

  return null; // Graceful fallback for unknown sections
}
```

---

## 3. Removing Template-Specific Pollution

Currently, shared wrappers have hacks like `if (templateId === 'dc-store')`. These MUST be removed. The wrapper should only care about configuration values.

**Before (Anti-pattern):**
```tsx
if (templateId === 'dc-store') {
  return <div className="blur-3xl bg-amber-200/40" />
}
```

**After (Config-Driven):**
```json
// In storefront_settings.json
"theme": {
  "backgroundDecorations": {
    "type": "blur-orbs",
    "colors": ["primary", "accent"],
    "intensity": 40
  }
}
```

```tsx
// StorePageWrapper.tsx
if (theme.backgroundDecorations?.type === 'blur-orbs') {
  return <BlurOrbs config={theme.backgroundDecorations} />
}
```

---

## 4. Execution Plan

### Phase 1: Foundation & Cleanup (Current)
1. Clean up unused `React.lazy` imports in `store-registry.ts` that point to identical generic templates.
2. Remove all `templateId === 'xyz'` hacks from generic wrappers (`StorePageWrapper.tsx`, `SharedCheckoutPage.tsx`).
3. Define the strict Zod schema for V1 JSON layouts.

### Phase 2: Component Refactoring
1. Extract the unique styling logic from `DarazTemplate`, `NovaLuxTemplate`, etc., into `variant` components (e.g., `ProductCardMarketplace`, `ProductCardLuxury`).
2. Register these variants in the `SectionRenderer`.

### Phase 3: Data Migration Strategy
1. Create a D1 SQL script to iterate through the `stores` table.
2. Map the legacy `themeConfig.storeTemplateId` to the new JSON layout arrays.
   - Example: If `storeTemplateId === 'daraz'`, generate a JSON layout array using `marketplace` variants for all sections.
3. Validate the generated JSON against the Zod schema before writing to D1.

### Phase 4: Switch Over
1. Update `UnifiedStoreLayout` to read strictly from the validated JSON layout array.
2. Delete the legacy React template files (`apps/web/app/components/store-templates/daraz/index.tsx`, etc.).
3. Run Cypress/Playwright integration tests to ensure SEO-critical sections render without JavaScript enabled (verifying SSR).
# Phase 1A: Legacy Theme System Analysis

**Document Purpose:** Understand current theme architecture, limitations, and dependencies.

## Current Legacy System Overview

### Location & Structure
- **Path:** `app/components/store-templates/[template-name]/`
- **Files per template:**
  - `theme.ts` — Theme config (colors, fonts, spacing)
  - `index.tsx` — Component definitions
  - `sections/` — Section components
  - Assets & styles

### How It Works
1. Theme defines color palette, typography, layout defaults
2. Hard-coded sections in component files
3. Editor modifies theme properties directly
4. No separation between draft/published states
5. KV cache holds published theme JSON

### Key Limitations
- [ ] **No versioning** — Published changes overwrite immediately
- [ ] **No draft state** — Can't preview changes before publish
- [ ] **Tight coupling** — Sections tied to specific theme structure
- [ ] **Manual component updates** — Adding sections requires code changes
- [ ] **No validation** — Invalid configs can break store
- [ ] **No rollback** — Can't revert to previous theme state

### Current Templates (14 Store Themes)
```
app/components/store-templates/
├── artisan-market/
├── aurora-minimal/
├── bdshop/
├── daraz/
├── eclipse/
├── freshness/
├── ghorer-bazar/
├── luxe-boutique/
├── nova-lux/
├── rovo/
├── sokol/
├── starter-store/
├── tech-modern/
└── [3 more...]
```

### Current Page Templates (5 Campaign/Landing Pages)
```
app/components/templates/
├── flash-sale/
├── minimal-clean/
├── minimal-light/
├── trust-first/
└── urgency-scarcity/
```

### Multi-Tenant Storage
- **Database:** D1 (Cloudflare)
- **Query Pattern:** Always scope by `store_id`
- **Cache:** KV with keys like `theme:${storeId}:published`

---

## Theme Config Format (Current)

### Typical `theme.ts` Structure
```typescript
export const themeConfig = {
  colors: {
    primary: "#FF6B35",
    secondary: "#004E89",
    // ... 10+ colors
  },
  typography: {
    fontFamily: "Inter",
    sizes: { sm, md, lg, xl }
  },
  spacing: {
    sm: "8px",
    md: "16px",
    // ...
  }
}
```

### Known Theme Properties
- Primary/secondary/accent colors
- Text colors (light, dark, muted)
- Font families & sizes
- Padding/margin defaults
- Border radius, shadows
- Component-specific overrides

---

## Database Schema (Current)

### Relevant Tables
```sql
-- stores table
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT,
  active_theme_id TEXT,
  created_at TIMESTAMP
);

-- No separate theme versioning table currently
```

### What's Missing
- Theme version tracking table
- Draft/published state tracking
- Theme history/changelog
- Validation error logging

---

## KV Cache Keys (Current Pattern)

```
theme:{storeId}:published          -- Published theme JSON
theme:{storeId}:settings           -- Theme settings
template:{storeId}:published       -- Published template JSON
```

---

## Migration Implications

### Must Preserve
- ✅ All 14 store theme variants
- ✅ 5 page templates
- ✅ Multi-tenant isolation
- ✅ Existing store data

### Must Change
- ❌ Remove hard-coded sections
- ❌ Add draft/published states
- ❌ Add versioning layer
- ❌ Implement validation
- ❌ Update editor UI/components

---

## Questions to Answer

- [ ] How many stores use each template? (usage metrics)
- [ ] Are there custom theme modifications per store?
- [ ] How often are themes published?
- [ ] Current error rate in theme application?
- [ ] Performance baseline for theme loading?

---

## Next: Phase 1B

See [New Template System Architecture](THEME_MIGRATION_1B_NEW_SYSTEM.md) for target design.

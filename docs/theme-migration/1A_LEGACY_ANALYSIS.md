# Phase 1A: Legacy System Analysis

**Status:** Current system mixes dynamic (Rovo/Sokol) with legacy (starter-store/daraz) templates.

## Actual System State

### Legacy Templates (Hard-Coded Sections)
These templates have sections defined as JSX components in `sections/` folders:
- `starter-store/` — Basic default template
- `daraz/` — Daraz-style marketplace layout
- `bdshop/` — Bengali e-commerce variant
- And ~11 other legacy templates with fixed JSX rendering

**Problem:** Adding or modifying sections requires code changes.

### Modern Templates (Dynamic)
These templates ALREADY use `SectionRenderer` to render sections dynamically:
- `rovo/` — Uses SectionRenderer + registry
- `sokol/` — Uses SectionRenderer + registry

### Theme Storage (Actual)
Theme data is stored in `stores.themeConfig` JSON column, NOT separate `theme.ts` files:
```sql
stores {
  id: integer,
  name: text,
  themeConfig: text,        -- JSON: { colors, fonts, spacing, sections[] }
  ...
}
```

---

## Section Registry (Already Exists)

**Location:** `app/components/store-sections/registry.ts`

**Current State:** 50+ sections registered and ready to use:
- Hero sections (multiple variants)
- Features sections
- CTA sections
- Product showcase sections
- Trust/social proof sections
- Text content sections
- And many more...

**Key Export:**
```typescript
export const SECTION_REGISTRY = {
  'hero-section': { component: HeroSection, schema: HERO_AI_SCHEMA },
  'features-section': { component: FeaturesSection, schema: FEATURES_AI_SCHEMA },
  // ... 50+ more
}
```

---

## Draft/Published Tables (Already Exist)

From `db/schema_templates.ts`:

```sql
template_sections_draft {
  id, templateId, sectionId, config, order, createdAt
}

template_sections_published {
  id, templateId, sectionId, config, order, createdAt
}

theme_settings_draft {
  id, themeId, colors, fonts, spacing, createdAt
}

theme_settings_published {
  id, themeId, colors, fonts, spacing, createdAt
}
```

**Status:** Tables exist. Legacy templates don't use them yet.

---

## SectionRenderer (Already Works)

**Location:** `app/components/store-sections/SectionRenderer.tsx`

Rovo and Sokol templates already render sections dynamically:
```tsx
<SectionRenderer 
  sectionId={section.id}
  config={section.config}
  storeId={storeId}
/>
```

---

## Migration Path

| Item | Status | Action |
|------|--------|--------|
| Section registry | ✅ Exists (50+ sections) | Use it |
| Draft/published tables | ✅ Exist | Populate for legacy templates |
| SectionRenderer | ✅ Works | Extend to all templates |
| Legacy JSX sections | ⚠️ Active | Migrate to config-based |

---

## Key Facts

- Rovo/Sokol are NOT legacy—they already use dynamic rendering
- Legacy templates (starter-store, daraz, bdshop, etc.) have hard-coded JSX
- `stores.themeConfig` is the actual storage, not separate files
- All infrastructure exists; just needs legacy templates migrated

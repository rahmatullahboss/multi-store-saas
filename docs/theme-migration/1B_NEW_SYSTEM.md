# Phase 1B: Template System Architecture (Shopify OS 2.0 Pattern)

**Status:** ✅ Infrastructure exists. Target: Migrate `store-live-editor` to use SectionRegistry + Draft Tables.

---

## Existing Infrastructure

### Section Registry
- **Location:** `app/components/store-sections/registry.ts`
- **Exports:** `SECTION_REGISTRY` with 50+ pre-built sections (Rovo, Zenith, Turbo)
- **Pattern:** Each section = React component + Zod schema + defaultConfig

### Section Renderer
- **Location:** `app/components/store-sections/SectionRenderer.tsx`
- **Usage:** Renders section array → loops SECTION_REGISTRY → hydrates settings + bindings
- **Props:** `{ sections, theme, storeId, products, ... }`

### Draft/Published Tables (D1)
```typescript
// db/schema_templates.ts
templateSectionsDraft    // Editable: type, propsJson, blocksJson, sortOrder
templateSectionsPublished // Immutable snapshot from last publish
themeSettingsDraft       // Global theme settings (colors, fonts)
themeSettingsPublished   // Published theme snapshot
```

---

## Migration Target

### Current State (store-live-editor.tsx)
- ❌ Reads from `themeConfig` column (monolithic JSON)
- ❌ Writes sections to `themeConfig` (no draft versioning)
- ❌ Manually manages UI state (homeSections, productSections arrays)

### Target State (Phase 1B Complete)
- ✅ Read draft sections from `templateSectionsDraft`
- ✅ Write changes to `templateSectionsDraft` (with version bumps)
- ✅ Use `SectionRenderer` for preview (not custom rendering)
- ✅ Publish workflow: Copy draft → `templateSectionsPublished` + invalidate KV

---

## Data Flow

### Editor Save
```
User edits section in store-live-editor
  ↓
POST /api/store-live-editor/save
  ↓
Update templateSectionsDraft (version + 1)
  ↓
Return updated sections array
  ↓
Preview updates via SectionRenderer
```

### Publish (Future)
```
User clicks "Publish"
  ↓
POST /api/store-live-editor/publish
  ↓
Copy templateSectionsDraft → templateSectionsPublished
  ↓
Invalidate KV cache (template:{storeId}:published)
  ↓
Live on storefront
```

---

## Implementation Notes

1. **Registry-Driven UI** — `store-live-editor` should read `SECTION_REGISTRY` for available sections, not hard-code them
2. **Props/Blocks JSON** — Store section config as `propsJson` (settings) + `blocksJson` (nested content)
3. **Multi-Tenant Safety** — All queries scoped by `store_id`
4. **Validation** — Use section's Zod schema on save (from registry)
5. **Theme Settings** — Move color/font config to `themeSettingsDraft` (separate from sections)

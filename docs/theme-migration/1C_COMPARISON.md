# Phase 1C: System Comparison & Mapping

**Document Purpose:** Map legacy hard-coded templates to new dynamic system using SectionRenderer.

---

## System Architecture Mapping

| Aspect | Legacy | New (Target) | Status |
|--------|--------|-------|--------|
| **Store Themes** | Hard-coded: starter-store, daraz, bdshop | Dynamic SectionRenderer + D1 config.sections | Exists, needs connection |
| **Section System** | Per-template components | SECTION_REGISTRY (50+ sections) | Exists, ready |
| **Theme Editor** | N/A | store-live-editor.tsx + draft state | Exists, needs draft connection |
| **Template Storage** | Code files | D1 database (templates table) | Schema ready |
| **Publishing** | N/A | Version control + KV cache | Ready |
| **Page Builder** | N/A | apps/page-builder/ (GrapesJS-based) | Separate Worker |

---

## Key Corrections

### ❌ WRONG
- GrapesJS is for store themes → ✅ GrapesJS is for **page-builder only** (apps/page-builder/)
- Theme editor is custom-built → ✅ **store-live-editor.tsx** exists and is the store theme editor
- Need to build section registry → ✅ **SECTION_REGISTRY exists** with 50+ sections

### ✅ INFRASTRUCTURE EXISTS

**Shopify Pattern Mapping:**
```
Shopify JSON Template    → config.sections array (exists in DB)
Shopify Sections Library → SECTION_REGISTRY (50+ sections, ready)
Shopify Theme Editor     → store-live-editor.tsx (exists, needs draft)
Shopify Asset Server     → R2 + KV (exists)
Shopify Draft State      → DB draft_templates table (schema ready)
```

---

## Migration Path: Hard-Coded → Dynamic

### Example: Legacy "rovo" Template

**Current (Hard-Coded):**
```typescript
// app/components/store-templates/rovo/index.tsx
export function RovoTemplate() {
  return (
    <>
      <Hero {...heroConfig} />
      <ProductGrid {...gridConfig} />
      <Footer {...footerConfig} />
    </>
  );
}
```

**Target (Dynamic SectionRenderer):**
```typescript
// D1 Database
{
  store_id: "store_xyz",
  template_id: "rovo_main",
  config: {
    theme: { colors: { primary: "#FF6B35" } },
    sections: [
      { type: "hero", config: { ... } },
      { type: "product-grid", config: { ... } },
      { type: "footer", config: { ... } }
    ]
  }
}

// Render with SectionRenderer
<SectionRenderer sections={template.config.sections} />
```

---

## Work Remaining

1. **Connect store-live-editor.tsx** to draft_templates table (load/save drafts)
2. **Migrate hard-coded templates** (starter-store, daraz, bdshop) → D1 config.sections
3. **Replace template components** with SectionRenderer calls
4. **Publish workflow** (save draft → publish to KV)

---

## No Breaking Changes

Infrastructure already exists. This is **connecting pieces**, not rebuilding:
- ✅ SectionRenderer available
- ✅ SECTION_REGISTRY complete
- ✅ store-live-editor.tsx ready
- ✅ D1 schema ready
- ✅ KV caching ready

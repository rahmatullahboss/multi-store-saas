# Phase 1C: System Comparison & Mapping

**Document Purpose:** Map legacy system to new system; identify breaking changes.

---

## Side-by-Side Comparison

| Aspect | Legacy | New | Impact |
|--------|--------|-----|--------|
| **Theme Storage** | Code files (theme.ts) | D1 database + KV | Requires migration script |
| **Sections** | Hard-coded in components | Registry (registry.ts) | UI change needed |
| **Draft State** | None (no drafts) | DB table + version tracking | New UX workflow |
| **Publishing** | Immediate & overwrites | Create version + cache invalidate | Safer, but slower |
| **Versioning** | None (Git history only) | DB version table | Enables rollback |
| **Validation** | Runtime errors | Zod schema pre-publish | Prevents bad configs |
| **Multi-Tenant** | Per-store folder | DB query scoped by store_id | Same isolation |
| **Editor** | Custom built | GrapesJS-based | Component changes |
| **Cache** | Simple KV key | KV + version tags | Better invalidation |

---

## Legacy → New Mapping Examples

### Example 1: Store Theme (e.g., "rovo")

**Legacy:**
```typescript
// app/components/store-templates/rovo/theme.ts
export const themeConfig = {
  colors: { primary: "#FF6B35", secondary: "#004E89" },
  typography: { fontFamily: "Inter" }
};
```

**New:**
```javascript
// Database record (templates table)
{
  id: "template_rovo_main",
  store_id: "store_abc123",
  name: "Rovo Store Theme",
  type: "store",
  theme: {
    colors: { primary: "#FF6B35", secondary: "#004E89" },
    typography: { fontFamily: "Inter" }
  },
  sections: [], // Populated by registry
  status: "published"
}
```

**Migration Task:** Extract theme.ts → Insert as template record

---

### Example 2: Page Template (e.g., "flash-sale")

**Legacy:**
```typescript
// app/components/templates/flash-sale/theme.ts
const theme = { ... };

// app/components/templates/flash-sale/index.tsx
export function FlashSaleTemplate() {
  return (
    <Hero {...heroConfig} />
    <ProductGrid {...gridConfig} />
    <Footer {...footerConfig} />
  );
}
```

**New:**
```javascript
// Database record
{
  id: "template_flash_sale",
  type: "campaign",
  theme: { /* ... */ },
  sections: [
    { id: "hero_1", type: "hero", order: 1, config: { ... } },
    { id: "grid_1", type: "product-grid", order: 2, config: { ... } },
    { id: "footer_1", type: "footer", order: 3, config: { ... } }
  ],
  status: "published"
}
```

**Migration Task:** Extract component layout → Create section array in database

---

## Breaking Changes

### 1. Hard-Coded Sections → Registry
- **Impact:** Medium
- **Action:** Create registry, refactor editor UI
- **Rollback:** Fall back to old component imports (short-term)

### 2. No Draft State → Draft/Published States
- **Impact:** Medium
- **Action:** New DB table, new API routes, new editor UX
- **Rollback:** Only affects new edits (old published data preserved)

### 3. Theme in Code → Theme in Database
- **Impact:** High
- **Action:** Migration script required
- **Rollback:** Re-run script with backup data

### 4. Immediate Publish → Versioned Publish
- **Impact:** Medium
- **Action:** New workflow (save → preview → publish)
- **Rollback:** User training, but no data loss

---

## Compatibility Matrix

### What Stays the Same ✅
- Multi-tenant isolation (store_id scoping)
- Color/font/spacing config structure
- KV caching strategy
- Component rendering logic
- Editor experience (mostly)

### What Changes ❌
- Storage mechanism (code → database)
- Section definitions (hard-coded → registry)
- State management (none → versioning)
- Validation (runtime → pre-save)

---

## Data Transformation Rules

### Colors
```
Legacy: { primary: "#FF6B35" }
→ New: { primary: "#FF6B35" }
[No transformation needed]
```

### Typography
```
Legacy: { fontFamily: "Inter", sizes: { sm, md, lg } }
→ New: { fontFamily: "Inter", headingSize, bodySize, ... }
[May need mapping for size scale]
```

### Sections
```
Legacy: Component tree in JSX
→ New: Array of { id, type, order, config }
[Requires parsing component props → config]
```

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|-----------|
| Data migration | Data loss | Backup D1 before migration |
| Editor UI changes | User confusion | Documentation + training |
| Draft state workflow | Incomplete publishes | Clear UX, auto-save |
| Registry reliance | Registry missing sections | Registry tests, validation |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Schema setup (1B) | 2 days | Database access |
| Registry creation (2A) | 3 days | Current theme analysis |
| Migration script (5A) | 2 days | Schema + registry ready |
| Testing (5B) | 3 days | Migration script |
| Rollout (5C) | 2-5 days | All tests passing |

**Total: ~2 weeks** (with parallel work)

---

## Next Steps

1. ✅ Phase 1A: Analyze legacy (DONE)
2. ✅ Phase 1B: New architecture (DONE)
3. ✅ Phase 1C: Comparison (DONE)
4. → Phase 2A: Editor component mapping
5. → Phase 2B: Data transformation
6. → Phase 2C: GrapesJS integration

---

## Questions for Product/Design

- [ ] Should we support theme switching during draft?
- [ ] Should old templates be read-only or fully migrated?
- [ ] Timeline for deprecating legacy system?
- [ ] Rollback plan if migration fails?

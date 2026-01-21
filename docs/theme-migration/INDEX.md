# Theme System Migration — Documentation Index

**Status:** In Progress | **Last Updated:** Jan 2025

Guides migrating legacy themes to new template system. Infrastructure exists: `SECTION_REGISTRY`, `SectionRenderer`, draft/publish tables in D1.

## 📋 Documentation Structure

### Phase 1: Analysis
- [1A: Legacy Theme System](THEME_MIGRATION_1A_LEGACY_ANALYSIS.md) — Current system structure
- [1B: New System Architecture](THEME_MIGRATION_1B_NEW_SYSTEM.md) — Section-based templates
- [1C: System Comparison](THEME_MIGRATION_1C_COMPARISON.md) — Mapping & changes

### Phase 2: Editor & Data
- [2A: Editor Mapping](THEME_MIGRATION_2A_EDITOR_MAPPING.md) — Component → section conversion
- [2B: Data Transform](THEME_MIGRATION_2B_DATA_TRANSFORM.md) — Schema & migration rules

### Phase 3: Draft/Publish
- [3A: Draft System](THEME_MIGRATION_3A_DRAFT_SYSTEM.md) — Draft storage in D1
- [3B: Publish Pipeline](THEME_MIGRATION_3B_PUBLISH.md) — Publishing & KV cache
- [3C: Versioning](THEME_MIGRATION_3C_VERSIONING.md) — Version tracking (future)

### Phase 4: Validation
- [4A: Validation](THEME_MIGRATION_4A_VALIDATION.md) — Zod schemas
- [4B: Checks](THEME_MIGRATION_4B_CHECKS.md) — Pre-migration verification
- [4C: Rollback](THEME_MIGRATION_4C_ROLLBACK.md) — Rollback strategy

### Phase 5: Migration
- [5A: Script](THEME_MIGRATION_5A_SCRIPT.md) — Migration implementation
- [5B: Testing](THEME_MIGRATION_5B_TESTING.md) — Test plan
- [5C: Deployment](THEME_MIGRATION_5C_DEPLOYMENT.md) — Deployment checklist

---

## ✅ Quick Start

1. Review **Phase 1A–1C** for system understanding
2. Work **Phase 2** for data mapping
3. Execute **Phase 3–5** for migration & deployment

**Key Files:** `app/db/schema.ts`, `app/lib/section-registry.ts`, `app/components/SectionRenderer.tsx`

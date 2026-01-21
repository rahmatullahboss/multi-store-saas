# Theme System Migration — Documentation Index

**Status:** Planning Phase | **Last Updated:** Jan 2025

This index organizes the migration from legacy theme system to new template system into focused, modular documents.

## 📋 Documentation Structure

### Phase 1: Foundation & Architecture
- [1A: Legacy Theme System Analysis](THEME_MIGRATION_1A_LEGACY_ANALYSIS.md)
- [1B: New Template System Architecture](THEME_MIGRATION_1B_NEW_SYSTEM.md)
- [1C: System Comparison & Mapping](THEME_MIGRATION_1C_COMPARISON.md)

### Phase 2: Editor & Data Mapping
- [2A: Editor Component Mapping](THEME_MIGRATION_2A_EDITOR_MAPPING.md)
- [2B: Data Structure Transformation](THEME_MIGRATION_2B_DATA_TRANSFORM.md)
- [2C: GrapesJS Integration](THEME_MIGRATION_2C_GRAPESJS.md)

### Phase 3: Draft/Publish Pipeline
- [3A: Draft System Design](THEME_MIGRATION_3A_DRAFT_SYSTEM.md)
- [3B: Publish Pipeline](THEME_MIGRATION_3B_PUBLISH.md)
- [3C: Versioning & Rollback](THEME_MIGRATION_3C_VERSIONING.md)

### Phase 4: Validation & Safety
- [4A: Validation Schema](THEME_MIGRATION_4A_VALIDATION.md)
- [4B: Migration Checks](THEME_MIGRATION_4B_CHECKS.md)
- [4C: Rollback Strategy](THEME_MIGRATION_4C_ROLLBACK.md)

### Phase 5: Migration Execution
- [5A: Migration Script](THEME_MIGRATION_5A_SCRIPT.md)
- [5B: Testing Plan](THEME_MIGRATION_5B_TESTING.md)
- [5C: Deployment Checklist](THEME_MIGRATION_5C_DEPLOYMENT.md)

---

## ✅ Tracking Checklist

### Phase 1: Foundation
- [ ] Document legacy theme system (inheritance, overrides, config)
- [ ] Document new template system (sections, components, hierarchy)
- [ ] Create mapping matrix (legacy → new)
- [ ] Identify breaking changes & compatibility issues

### Phase 2: Editor & Data
- [ ] Map editor components to new system
- [ ] Define data transformation rules
- [ ] Document GrapesJS JSON structure
- [ ] Create sample migrations

### Phase 3: Pipeline
- [ ] Design draft storage mechanism
- [ ] Define publish workflow
- [ ] Create version tracking system
- [ ] Document KV cache invalidation

### Phase 4: Validation
- [ ] Create Zod schemas for validation
- [ ] Define pre-migration checks
- [ ] Document error handling
- [ ] Create rollback procedures

### Phase 5: Execution
- [ ] Write migration scripts
- [ ] Create test suite
- [ ] Prepare deployment runbook
- [ ] Schedule rollout phases

---

## 🔄 Quick Links

- **Main App:** `wrangler.toml`, `package.json`
- **Builder App:** `apps/page-builder/`
- **Theme Templates:** `app/components/store-templates/`
- **Page Templates:** `app/components/templates/`
- **Database Rules:** Multi-tenant scoping by `store_id`

---

## 📝 Next Steps

1. Start with **Phase 1A** to analyze legacy system
2. Review **Phase 1B** for new architecture
3. Work through phases sequentially (dependencies noted in each doc)
4. Use checklist to track progress

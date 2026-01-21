# Phase 4B: Pre-Migration Checks

**Purpose:** Validate themeConfig → draft tables migration safety and data integrity.

---

## 1. Section Registry Validation

Ensure all sections in migrating templates exist in `UNIFIED_SECTION_REGISTRY`.

```typescript
import { UNIFIED_SECTION_REGISTRY, isValidUnifiedSectionType } from '~/lib/unified-sections/registry';

async function validateSectionRegistry(themeConfig: any) {
  const issues: string[] = [];
  
  for (const section of themeConfig.sections || []) {
    if (!isValidUnifiedSectionType(section.type)) {
      issues.push(`❌ Unknown section type: ${section.type}`);
    } else {
      const def = UNIFIED_SECTION_REGISTRY[section.type];
      if (!def?.schema) {
        issues.push(`❌ Section ${section.type} missing schema`);
      }
    }
  }
  
  return { valid: issues.length === 0, issues };
}
```

---

## 2. Settings Structure Validation

Verify settings match draft table schema before insertion.

```typescript
import { TemplateSettingsSchema } from '~/lib/schemas';

async function validateSettingsStructure(settings: any) {
  const issues: string[] = [];
  
  // Required fields
  const required = ['store_id', 'type', 'name', 'theme'];
  for (const field of required) {
    if (!settings[field]) {
      issues.push(`❌ Missing required field: ${field}`);
    }
  }
  
  // Validate schema
  const validation = TemplateSettingsSchema.safeParse(settings);
  if (!validation.success) {
    for (const error of validation.error.errors) {
      issues.push(`❌ ${error.path.join('.')}: ${error.message}`);
    }
  }
  
  return { valid: issues.length === 0, issues };
}
```

---

## 3. Orphan Data Detection

Find data with no corresponding registry entries or missing relationships.

```typescript
async function detectOrphanData(db: D1Database, storeId: string) {
  const issues: string[] = [];
  
  // Check for sections referencing missing types
  const orphanSections = await db.prepare(`
    SELECT id, type FROM template_sections 
    WHERE store_id = ? AND type NOT IN (
      SELECT key FROM (VALUES ${ 
        Object.keys(UNIFIED_SECTION_REGISTRY)
          .map(k => `('${k}')`)
          .join(',')
      })
    )
  `).bind(storeId).all();
  
  if (orphanSections.results?.length > 0) {
    for (const s of orphanSections.results) {
      issues.push(`❌ Orphan section ${s.id}: type '${s.type}' not in registry`);
    }
  }
  
  // Check for draft templates missing sections
  const draftsWithoutSections = await db.prepare(`
    SELECT id, name FROM template_drafts 
    WHERE store_id = ? AND id NOT IN (
      SELECT template_id FROM template_sections WHERE store_id = ?
    )
  `).bind(storeId, storeId).all();
  
  if (draftsWithoutSections.results?.length > 0) {
    for (const d of draftsWithoutSections.results) {
      issues.push(`⚠️  Draft template '${d.name}' has no sections`);
    }
  }
  
  return { hasOrphans: issues.length > 0, issues };
}
```

---

## Pre-Migration Checklist

- [ ] All section types in `UNIFIED_SECTION_REGISTRY`
- [ ] Settings structure matches `TemplateSettingsSchema`
- [ ] No orphan sections or missing relationships
- [ ] Database backup created
- [ ] Staging environment ready

Run all three checks before proceeding:
```bash
npm run validate:migration-checks
```

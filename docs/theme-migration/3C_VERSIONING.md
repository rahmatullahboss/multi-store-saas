# Phase 3C: Versioning & Rollback [FUTURE/OPTIONAL]

**Status:** ⚠️ **NOT YET IMPLEMENTED** — Version history tables do not exist. Current system uses Draft → Published workflow.

**Purpose:** This document outlines a future versioning strategy when needed.

---

## Current State

### Draft → Published Model
```
Current flow:
- User edits in DRAFT mode
- User clicks PUBLISH → copies draft to published
- No version history stored
- No automatic rollback capability
```

### When Versioning Becomes Needed
- Multiple edits per template
- Audit/compliance requirements
- User requests to see edit history
- Rollback capability required

---

## Future Implementation: Add Versioning

### Step 1: Create `templateSectionVersions` Table
```sql
CREATE TABLE template_section_versions (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  config JSONB NOT NULL,
  sections JSONB NOT NULL,
  published_at TIMESTAMP NOT NULL,
  published_by TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (template_id) REFERENCES templates(id),
  UNIQUE(template_id, version_number)
);
```

### Step 2: Store Version on Publish
```typescript
async function publishTemplate(templateId: string, storeId: string, userId: string) {
  const draft = await db.templates.findOne({
    id: templateId,
    store_id: storeId,
    status: 'draft'
  });

  // Get next version number
  const lastVersion = await db.template_section_versions.findOne(
    { template_id: templateId },
    { orderBy: { version_number: 'desc' } }
  );
  const nextVersion = (lastVersion?.version_number ?? 0) + 1;

  // Store this version
  await db.template_section_versions.insert({
    id: generateId(),
    store_id: storeId,
    template_id: templateId,
    version_number: nextVersion,
    config: draft.config,
    sections: draft.sections,
    published_at: new Date(),
    published_by: userId
  });

  // Update published template
  await db.templates.update(
    { id: templateId, store_id: storeId },
    { status: 'published', version: nextVersion, updated_by: userId }
  );

  // Clear cache
  await kv.delete(`template:${storeId}:published`);
}
```

### Step 3: Enable Rollback
```typescript
async function rollbackToVersion(
  templateId: string,
  targetVersion: number,
  storeId: string,
  userId: string
) {
  // Get target version
  const version = await db.template_section_versions.findOne({
    template_id: templateId,
    version_number: targetVersion,
    store_id: storeId
  });

  if (!version) throw new Error('Version not found');

  // Copy to draft
  await db.templates.update(
    { id: templateId, store_id: storeId },
    {
      status: 'draft',
      config: version.config,
      sections: version.sections,
      updated_by: userId,
      updated_at: new Date()
    }
  );

  // When user publishes, new version is created
}
```

---

## Roadmap

| Phase | Action |
|-------|--------|
| **Now** | Monitor template changes; use manual backups |
| **Q2** | Add `templateSectionVersions` table & store versions on publish |
| **Q3** | Add rollback UI in admin dashboard |
| **Q4** | Add audit logs; implement retention policy |

---

## Next Steps

See [Phase 4A: Validation Schema](../THEME_MIGRATION_4A_VALIDATION.md) for pre-publish validation.

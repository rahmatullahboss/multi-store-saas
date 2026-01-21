# Phase 3A: Draft System (Actual Implementation)

**Document Purpose:** Explain the existing draft/publish workflow for theme templates and settings.

---

## Database Schema (Existing Tables)

### Template Sections: Draft & Published
```typescript
// DRAFT: Editable working copy
templateSectionsDraft {
  id: text (PK)
  shopId: integer (FK stores)
  templateId: text (FK themeTemplates)
  type: string                    // Section type
  enabled: integer (default: 1)
  sortOrder: integer
  propsJson: string (default: '{}')
  blocksJson: string (default: '[]')
  version: integer (default: 1)
  updatedAt: timestamp
}

// PUBLISHED: Immutable snapshot
templateSectionsPublished {
  id: text (PK)
  shopId: integer (FK stores)
  templateId: text (FK themeTemplates)
  type: string
  enabled: integer
  sortOrder: integer
  propsJson: string
  blocksJson: string
  publishedAt: timestamp
}
```

### Theme Settings: Draft & Published
```typescript
// DRAFT: Editable global settings
themeSettingsDraft {
  id: text (PK)
  shopId: integer (FK stores)
  themeId: text (FK themes)
  settingsJson: string (default: '{}')
  version: integer (default: 1)
  updatedAt: timestamp
  UNIQUE constraint on (themeId)
}

// PUBLISHED: Immutable snapshot
themeSettingsPublished {
  id: text (PK)
  shopId: integer (FK stores)
  themeId: text (FK themes)
  settingsJson: string
  publishedAt: timestamp
  UNIQUE constraint on (themeId)
}
```

---

## Draft → Publish Workflow

### Editor Save Flow
1. User edits sections or settings in theme editor
2. **Auto-save** or explicit **"Save Draft"** triggers:
   - Insert/update row in `templateSectionsDraft` or `themeSettingsDraft`
   - `version` increments (optional, for tracking)
   - `updatedAt` timestamp updated

### Publish Flow
1. User clicks **"Publish"**
2. Backend action:
   - Delete all rows in `templateSectionsPublished` for that `templateId`
   - Copy all rows from `templateSectionsDraft` → `templateSectionsPublished` (with `publishedAt` timestamp)
   - Copy row from `themeSettingsDraft` → `themeSettingsPublished` (with `publishedAt` timestamp)
   - **Invalidate KV cache** key: `template:storeId:templateId:published`
3. Published sections/settings now live for storefront

### Read Patterns
```typescript
// Draft (editing)
const draft = await db.query(templateSectionsDraft)
  .where({ templateId, shopId })
  .orderBy('sortOrder')

// Published (storefront)
const published = await db.query(templateSectionsPublished)
  .where({ templateId, shopId })
  .orderBy('sortOrder')
```

---

## Multi-Tenant Safety
- All queries include `shopId` filter (required)
- Draft and Published tables share same `shopId` column
- No cross-tenant data leaks between draft/publish cycles

---

## Key Design Decisions
- **Separate tables** (not status column): Immutable published snapshots, mutable drafts
- **One-to-one settings** per theme (UNIQUE constraint on themeId per table)
- **One-to-many sections** per template (multiple sortOrder entries)
- **KV cache invalidation** on publish (not on save)

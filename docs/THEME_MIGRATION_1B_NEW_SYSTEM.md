# Phase 1B: New Template System Architecture

**Document Purpose:** Define target architecture for new template system.

## High-Level Design

### Pillars
1. **Section Registry** — Centralized list of available sections
2. **Template Definitions** — Store theme + section layout as JSON
3. **Draft/Published States** — Versions tracked in D1
4. **Validation Schema** — Zod schemas for all data structures
5. **Editor Interface** — GrapesJS-based visual editor

---

## New Database Schema

### Templates Table
```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT, -- 'store' | 'campaign'
  config JSON NOT NULL,        -- Theme colors, fonts, spacing
  sections JSON NOT NULL,      -- Array of section configs
  status TEXT,                 -- 'draft' | 'published'
  version INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP,
  created_by TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  version INTEGER,
  config JSON,
  sections JSON,
  created_by TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id)
);
```

### Multi-Tenant Safety
```typescript
// All queries MUST include:
WHERE store_id = $1
```

---

## Section Registry Design

### Central Registry
```typescript
// app/lib/section-registry.ts

type SectionDefinition = {
  id: string;              // 'hero', 'product-grid', etc
  name: string;
  category: string;        // 'header', 'content', 'footer'
  component: React.Component;
  defaultConfig: object;
  schema: ZodSchema;      // Validation schema
};

export const SECTION_REGISTRY: Record<string, SectionDefinition> = {
  'hero': { /* ... */ },
  'product-grid': { /* ... */ },
  // ...
};
```

### Benefits
- ✅ No code changes to add/remove sections
- ✅ Registry-driven UI in editor
- ✅ Self-documenting schema
- ✅ Built-in validation

---

## New Config Format

### Template Structure (JSON)
```json
{
  "id": "template_abc123",
  "store_id": "store_xyz",
  "name": "Summer Sale 2025",
  "type": "campaign",
  "theme": {
    "colors": {
      "primary": "#FF6B35",
      "secondary": "#004E89",
      "accent": "#FFD166"
    },
    "typography": {
      "fontFamily": "Inter",
      "headingSize": "2rem",
      "bodySize": "1rem"
    },
    "spacing": {
      "unit": "8px"
    }
  },
  "sections": [
    {
      "id": "hero_1",
      "type": "hero",
      "order": 1,
      "enabled": true,
      "config": {
        "headline": "Summer Sale",
        "image": "s3://...",
        "ctaText": "Shop Now",
        "ctaLink": "/products"
      }
    },
    {
      "id": "grid_1",
      "type": "product-grid",
      "order": 2,
      "config": {
        "columns": 3,
        "limit": 12
      }
    }
  ],
  "status": "draft",
  "version": 3,
  "created_at": "2025-01-20T...",
  "updated_at": "2025-01-21T..."
}
```

---

## State Transitions

```
DRAFT → (preview) → PUBLISHED
         ↓
      (save as version)
         ↓
      Can revert to previous version
```

### Publish Workflow
1. Editor saves to draft
2. Store owner previews
3. Click "Publish"
4. System creates version record
5. Invalidate KV cache
6. Live immediately

---

## Editor Data Flow

### Save Draft
```
Editor UI (GrapesJS) 
  → POST /api/templates/:id/save
    → Update templates table (status = draft)
    → Update KV cache (draft key)
    → Return success
```

### Publish
```
Editor UI
  → POST /api/templates/:id/publish
    → Validate against schema
    → Create version record
    → Update templates (status = published)
    → Invalidate KV (published key)
    → Return success
```

---

## KV Cache Structure (New)

```
template:{storeId}:draft         -- Latest draft (expires 24h)
template:{storeId}:published     -- Current published version
template:{storeId}:v{version}    -- Historical version (immutable)
```

---

## Component Layer

### Old → New Mapping
```
Store Theme (hard-coded)
  → ✅ Template record + registry

Sections in component files
  → ✅ Registry-driven sections

Editor modifies theme directly
  → ✅ Draft record + version history
```

---

## Key Principles

1. **Registry-Driven** — All sections in one source
2. **Version-Tracked** — Every publish creates version
3. **Validated** — Zod schemas on save & publish
4. **Multi-Tenant** — All queries scoped by store_id
5. **Cache-Aware** — KV invalidation on publish
6. **Immutable Versions** — Can always revert

---

## Next Steps

See [System Comparison & Mapping](THEME_MIGRATION_1C_COMPARISON.md) for detailed legacy → new mappings.

# Phase 3A: Draft System Design

**Document Purpose:** Design draft storage, state management, and user workflows.

---

## Draft System Overview

### Key Concepts
- **Draft:** Unpublished template (in edit mode)
- **Published:** Live, version-tracked template
- **Auto-save:** Periodic save to draft (every 1-2 seconds)
- **Explicit Save:** User clicks "Save Draft"
- **Publish:** User clicks "Publish" (creates version + goes live)

---

## Database Schema for Drafts

### Templates Table
```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,                    -- 'store' | 'campaign'
  config JSON NOT NULL,         -- Theme config
  sections JSON NOT NULL,       -- Section array
  status TEXT,                  -- 'draft' | 'published'
  version INTEGER,              -- Current version number
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP,
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (store_id) REFERENCES stores(id),
  INDEX idx_store_status (store_id, status)
);
```

### Multi-Tenant Query Pattern
```sql
-- Get draft
SELECT * FROM templates
WHERE store_id = $1 AND id = $2 AND status = 'draft'

-- Get published
SELECT * FROM templates
WHERE store_id = $1 AND id = $2 AND status = 'published'

-- List all templates for store
SELECT * FROM templates
WHERE store_id = $1
ORDER BY updated_at DESC
```

---

## Draft Workflow States

```
┌─────────────┐
│   EMPTY     │  (No template yet)
└──────┬──────┘
       │ "Create New"
       ↓
┌─────────────────────┐
│  DRAFT (EDITING)    │  (User editing)
│  status='draft'     │
└──────┬──────────────┘
       │ Auto-save every 1s
       │ (POST /api/templates/:id/save)
       │
       ├─ "Preview" → View draft in browser
       │
       └─ "Publish" → Create version, go live
           │
           ↓
       ┌──────────────────────┐
       │  PUBLISHED           │
       │  status='published'  │
       │  version=N           │
       └──────┬───────────────┘
             │ Published live
             │ Cache key: template:store_id:published
             │
             └─ User edits again
                 │
                 ↓
             NEW DRAFT CREATED
```

---

## API Endpoints for Drafts

### Create Draft
```typescript
// POST /api/templates
export async function POST(req: Request) {
  const { storeId, name, type, baseTemplateId } = await req.json();
  
  // Create new template in draft status
  const template = {
    id: generateId(),
    store_id: storeId,
    name,
    type,
    config: {}, // Start with defaults
    sections: [],
    status: 'draft',
    version: 0,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: req.user.id
  };
  
  await db.templates.create(template);
  return json(template);
}
```

### Load Draft
```typescript
// GET /api/templates/:id?status=draft
export async function GET(req: Request) {
  const { id } = req.params;
  const { status = 'draft' } = req.query;
  const storeId = req.user.storeId;
  
  const template = await db.templates.findOne({
    id,
    store_id: storeId,
    status
  });
  
  if (!template) {
    return json({ error: 'Not found' }, { status: 404 });
  }
  
  return json(template);
}
```

### Save Draft (Auto-save)
```typescript
// POST /api/templates/:id/save
export async function POST(req: Request) {
  const { id } = req.params;
  const { config, sections } = await req.json();
  const storeId = req.user.storeId;
  
  // Validate schema
  try {
    TemplateSchema.parse({ config, sections });
  } catch (error) {
    return json({ errors: error.errors }, { status: 400 });
  }
  
  // Update draft
  const updated = await db.templates.update(
    { id, store_id: storeId, status: 'draft' },
    {
      config,
      sections,
      updated_at: new Date(),
      updated_by: req.user.id
    }
  );
  
  return json(updated);
}
```

---

## Draft/Published State Transitions

### Cannot Publish Invalid Draft
```typescript
async function validateBeforePublish(template) {
  const errors = [];
  
  // Check required fields
  if (!template.config.colors?.primary) {
    errors.push('Primary color required');
  }
  
  if (!template.sections || template.sections.length === 0) {
    errors.push('At least one section required');
  }
  
  // Validate each section
  template.sections.forEach(section => {
    const def = SECTION_REGISTRY[section.type];
    if (!def) {
      errors.push(`Unknown section type: ${section.type}`);
    }
    
    try {
      def.schema.parse(section.config);
    } catch (e) {
      errors.push(`Invalid config for section ${section.id}: ${e.message}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}
```

### Publish Endpoint
```typescript
// POST /api/templates/:id/publish
export async function POST(req: Request) {
  const { id } = req.params;
  const storeId = req.user.storeId;
  
  // Load current draft
  const draft = await db.templates.findOne({
    id,
    store_id: storeId,
    status: 'draft'
  });
  
  if (!draft) {
    return json({ error: 'Draft not found' }, { status: 404 });
  }
  
  // Validate
  const { valid, errors } = await validateBeforePublish(draft);
  if (!valid) {
    return json({ errors }, { status: 400 });
  }
  
  // Create version record
  const version = {
    id: generateId(),
    template_id: id,
    version: draft.version + 1,
    config: draft.config,
    sections: draft.sections,
    created_by: req.user.id,
    created_at: new Date()
  };
  
  await db.template_versions.create(version);
  
  // Update template to published
  const published = await db.templates.update(
    { id, store_id: storeId },
    {
      status: 'published',
      version: version.version,
      published_at: new Date(),
      updated_by: req.user.id
    }
  );
  
  // Invalidate cache
  await kv.delete(`template:${storeId}:draft`);
  await kv.delete(`template:${storeId}:published`);
  
  return json(published);
}
```

---

## Auto-Save Implementation

### Client-Side (Editor)
```typescript
export function useAutoSave(templateId: string) {
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const triggerAutoSave = useCallback(() => {
    setIsDirty(true);
    
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const template = getEditorState();
      
      try {
        const res = await fetch(`/api/templates/${templateId}/save`, {
          method: 'POST',
          body: JSON.stringify({
            config: template.config,
            sections: template.sections
          })
        });
        
        if (res.ok) {
          setIsDirty(false);
          showNotification('Saved', 'quiet');
        } else {
          showNotification('Save failed', 'error');
        }
      } catch (error) {
        showNotification('Save error', 'error');
      }
    }, 1500); // Wait 1.5s after last change
  }, [templateId]);
  
  return { isDirty, triggerAutoSave };
}
```

### Server-Side Rate Limiting
```typescript
// Middleware: prevent save spam
const saveRateLimiter = rateLimit({
  key: (req) => `save:${req.user.storeId}:${req.params.id}`,
  limit: 20,  // 20 saves
  window: 60  // per 60 seconds
});

app.post('/api/templates/:id/save', saveRateLimiter, POST);
```

---

## Discard Changes

### Revert to Published
```typescript
// POST /api/templates/:id/discard
export async function POST(req: Request) {
  const { id } = req.params;
  const storeId = req.user.storeId;
  
  // Delete draft
  await db.templates.delete({
    id,
    store_id: storeId,
    status: 'draft'
  });
  
  return json({ success: true });
}
```

### Client-Side Confirmation
```typescript
async function discardDraft() {
  const confirmed = window.confirm(
    'Discard unsaved changes? This cannot be undone.'
  );
  
  if (!confirmed) return;
  
  await fetch(`/api/templates/${templateId}/discard`, { method: 'POST' });
  
  // Reload from published version
  location.reload();
}
```

---

## Draft Notification UI

```typescript
export function DraftNotification({ isDirty, lastSaved }) {
  return (
    <div className="draft-notification">
      {isDirty ? (
        <>
          <Icon name="circle-notch" className="spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Icon name="check-circle" />
          <span>Saved {formatTime(lastSaved)}</span>
        </>
      )}
    </div>
  );
}
```

---

## Edge Cases & Handling

| Case | Behavior |
|------|----------|
| User loses connection | Queue saves, retry on reconnect |
| User closes browser | Draft persists, resume on return |
| Network timeout | Show error, allow manual save |
| Validation fails | Show errors, prevent publish |
| Concurrent edits | Last save wins (optimistic updates) |
| Storage quota exceeded | Archive old versions |

---

## Metrics to Track

- [ ] Auto-save frequency (saves per minute)
- [ ] Average draft size (KB)
- [ ] Time from first edit to publish
- [ ] Save failure rate
- [ ] Discard rate (unsaved changes ratio)

---

## Next Steps

See [Phase 3B: Publish Pipeline](THEME_MIGRATION_3B_PUBLISH.md) for versioning and cache invalidation.

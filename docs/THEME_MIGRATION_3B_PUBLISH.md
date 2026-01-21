# Phase 3B: Publish Pipeline

**Document Purpose:** Define publish workflow, versioning, and cache invalidation.

---

## Publish Pipeline Overview

```
Draft Ready
    ↓
User clicks "Publish"
    ↓
Validate Template
    ↓
Create Version Record
    ↓
Update Template Status → published
    ↓
Invalidate KV Cache
    ↓
Trigger Webhooks (optional)
    ↓
Live ✅
```

---

## Version Record Storage

### Template Versions Table
```sql
CREATE TABLE template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  config JSON NOT NULL,
  sections JSON NOT NULL,
  changelog TEXT,              -- User-provided notes
  created_by TEXT,
  created_at TIMESTAMP,
  
  FOREIGN KEY (template_id) REFERENCES templates(id),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  UNIQUE KEY (template_id, version),
  INDEX idx_store_version (store_id, template_id, version)
);
```

### Immutable Version Design
```typescript
// Versions are NEVER updated, only created
// This allows safe rollback at any time

interface TemplateVersion {
  id: string;                    // Unique ID
  template_id: string;           // Points to template
  store_id: string;              // Multi-tenant isolation
  version: number;               // Incremental (1, 2, 3, ...)
  config: ThemeConfig;           // Snapshot of theme
  sections: Section[];           // Snapshot of sections
  changelog?: string;            // "Added hero section"
  created_by: string;
  created_at: Date;              // Never changes
}
```

---

## Publish Endpoint (Full Implementation)

```typescript
// POST /api/templates/:id/publish
export async function publish(req: Request) {
  const { id } = req.params;
  const { changelog } = await req.json();
  const storeId = req.user.storeId;
  const userId = req.user.id;
  
  // 1. Load draft
  const draft = await db.templates.findOne({
    id,
    store_id: storeId,
    status: 'draft'
  });
  
  if (!draft) {
    return json({ error: 'Draft not found' }, { status: 404 });
  }
  
  // 2. Validate
  const validation = validateTemplate(draft);
  if (!validation.valid) {
    return json({
      error: 'Validation failed',
      errors: validation.errors
    }, { status: 400 });
  }
  
  // 3. Transaction: Create version + Update template
  const trx = db.transaction();
  try {
    // Get next version number
    const lastVersion = await trx.template_versions
      .where({ template_id: id })
      .orderBy('version', 'desc')
      .first();
    
    const nextVersion = (lastVersion?.version || 0) + 1;
    
    // Create version record
    const version = {
      id: generateId(),
      template_id: id,
      store_id: storeId,
      version: nextVersion,
      config: draft.config,
      sections: draft.sections,
      changelog: changelog || null,
      created_by: userId,
      created_at: new Date()
    };
    
    await trx.template_versions.insert(version);
    
    // Update template
    const updated = await trx.templates.update(
      { id, store_id: storeId },
      {
        status: 'published',
        version: nextVersion,
        published_at: new Date(),
        updated_by: userId,
        updated_at: new Date()
      }
    );
    
    await trx.commit();
    
    // 4. Invalidate cache (outside transaction)
    await invalidateTemplateCache(storeId, id);
    
    // 5. Trigger webhooks
    await triggerPublishWebhooks({
      template_id: id,
      store_id: storeId,
      version: nextVersion
    });
    
    return json({
      success: true,
      template: updated,
      version: version
    });
    
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
```

---

## Cache Invalidation Strategy

### KV Cache Keys
```
template:{storeId}:published        → Latest published template (TTL: ∞)
template:{storeId}:draft            → Latest draft (TTL: 24h)
template:{storeId}:v{version}       → Specific version (TTL: ∞)
template:list:{storeId}             → List of templates (TTL: 1h)
```

### Invalidation Function
```typescript
async function invalidateTemplateCache(
  storeId: string,
  templateId?: string
) {
  const keys = [];
  
  if (templateId) {
    // Invalidate specific template
    keys.push(`template:${storeId}:draft`);
    keys.push(`template:${storeId}:published`);
    // Version keys are immutable, don't invalidate
  } else {
    // Invalidate entire store
    keys.push(`template:${storeId}:*`);
  }
  
  for (const key of keys) {
    await kv.delete(key);
  }
  
  // Also invalidate list cache
  await kv.delete(`template:list:${storeId}`);
}
```

### Cache Read Pattern (Server)
```typescript
async function getPublishedTemplate(
  storeId: string,
  templateId: string
): Promise<Template> {
  const cacheKey = `template:${storeId}:published`;
  
  // 1. Try cache
  const cached = await kv.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. Query database
  const template = await db.templates.findOne({
    id: templateId,
    store_id: storeId,
    status: 'published'
  });
  
  if (!template) {
    throw new Error('Template not found');
  }
  
  // 3. Cache for future reads (no TTL = permanent)
  await kv.put(cacheKey, JSON.stringify(template));
  
  return template;
}
```

---

## Version History Endpoints

### List Versions
```typescript
// GET /api/templates/:id/versions
export async function GET(req: Request) {
  const { id } = req.params;
  const storeId = req.user.storeId;
  
  const versions = await db.template_versions.findAll({
    template_id: id,
    store_id: storeId
  }).orderBy('version', 'desc');
  
  return json(versions);
}
```

### Get Specific Version
```typescript
// GET /api/templates/:id/versions/:version
export async function GET(req: Request) {
  const { id, version } = req.params;
  const storeId = req.user.storeId;
  
  const versionRecord = await db.template_versions.findOne({
    template_id: id,
    store_id: storeId,
    version: parseInt(version)
  });
  
  if (!versionRecord) {
    return json({ error: 'Version not found' }, { status: 404 });
  }
  
  return json(versionRecord);
}
```

---

## Rollback to Previous Version

### Rollback Endpoint
```typescript
// POST /api/templates/:id/rollback/:version
export async function POST(req: Request) {
  const { id, version } = req.params;
  const storeId = req.user.storeId;
  
  // 1. Get target version
  const targetVersion = await db.template_versions.findOne({
    template_id: id,
    store_id: storeId,
    version: parseInt(version)
  });
  
  if (!targetVersion) {
    return json({ error: 'Version not found' }, { status: 404 });
  }
  
  // 2. Create new version (copy from old)
  const currentTemplate = await db.templates.findOne({
    id,
    store_id: storeId
  });
  
  const newVersion = {
    id: generateId(),
    template_id: id,
    store_id: storeId,
    version: currentTemplate.version + 1,
    config: targetVersion.config,
    sections: targetVersion.sections,
    changelog: `Rolled back from v${targetVersion.version}`,
    created_by: req.user.id,
    created_at: new Date()
  };
  
  await db.template_versions.insert(newVersion);
  
  // 3. Update template
  await db.templates.update(
    { id, store_id: storeId },
    {
      version: newVersion.version,
      config: targetVersion.config,
      sections: targetVersion.sections,
      updated_at: new Date()
    }
  );
  
  // 4. Invalidate cache
  await invalidateTemplateCache(storeId, id);
  
  return json({
    success: true,
    newVersion: newVersion
  });
}
```

---

## Version Comparison UI

### Endpoint: Compare Two Versions
```typescript
// GET /api/templates/:id/versions/compare?from=v1&to=v2
export async function GET(req: Request) {
  const { id } = req.params;
  const { from, to } = req.query;
  const storeId = req.user.storeId;
  
  const fromVersion = await getVersion(id, storeId, parseInt(from));
  const toVersion = await getVersion(id, storeId, parseInt(to));
  
  const diff = {
    config: diffObjects(fromVersion.config, toVersion.config),
    sections: diffArrays(fromVersion.sections, toVersion.sections)
  };
  
  return json(diff);
}
```

---

## Publishing Workflow UI

### Component
```typescript
export function PublishModal({ template, onSuccess }) {
  const [changelog, setChangelog] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState([]);
  
  async function handlePublish() {
    setIsPublishing(true);
    
    try {
      const res = await fetch(`/api/templates/${template.id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ changelog })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setErrors(data.errors || []);
        return;
      }
      
      showNotification('Published successfully', 'success');
      onSuccess();
      
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setIsPublishing(false);
    }
  }
  
  return (
    <Modal>
      <h2>Publish Template</h2>
      
      {errors.length > 0 && (
        <ErrorAlert errors={errors} />
      )}
      
      <textarea
        placeholder="What changed? (optional)"
        value={changelog}
        onChange={(e) => setChangelog(e.target.value)}
      />
      
      <button
        onClick={handlePublish}
        disabled={isPublishing}
      >
        {isPublishing ? 'Publishing...' : 'Publish Now'}
      </button>
    </Modal>
  );
}
```

---

## Webhook Events (Optional Future Feature)

```typescript
// Possible webhook triggers
const WEBHOOK_EVENTS = {
  'template.published': {
    trigger: 'After template published',
    payload: { template_id, version, store_id }
  },
  'template.rollback': {
    trigger: 'After rollback',
    payload: { template_id, from_version, to_version, store_id }
  }
};
```

---

## Checklist: Publish Pipeline

- [ ] Version table schema created
- [ ] Version creation on publish
- [ ] Cache invalidation working
- [ ] Rollback endpoint implemented
- [ ] Version history UI built
- [ ] Changelog capture working
- [ ] Error handling for invalid templates
- [ ] Transaction handling (atomicity)

---

## Next Steps

See [Phase 3C: Versioning & Rollback](THEME_MIGRATION_3C_VERSIONING.md) for detailed rollback strategy.

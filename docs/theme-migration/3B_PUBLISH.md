# Phase 3B: Publish Pipeline

**Document Purpose:** Define the publish workflow: copy draft to published tables + KV cache invalidation.

---

## Publish Workflow

```
1. Validate draft data
   ↓
2. Copy templateSectionsDraft → templateSectionsPublished
   ↓
3. Copy themeSettingsDraft → themeSettingsPublished
   ↓
4. Invalidate KV cache keys
   ↓
5. Return success
```

---

## Database Tables

**Existing tables used:**
- `templateSectionsDraft` — Draft sections being edited
- `templateSectionsPublished` — Published sections (live)
- `themeSettingsDraft` — Draft theme configuration
- `themeSettingsPublished` — Published theme configuration

All queries scoped by `store_id` (multi-tenant safety).

---

## Publish Endpoint

```typescript
// POST /api/templates/:id/publish
export async function publish(req: Request) {
  const { id } = req.params;
  const storeId = req.user.storeId;

  // 1. Validate draft data
  const draftSections = await db.query(
    `SELECT * FROM templateSectionsDraft WHERE template_id = ? AND store_id = ?`,
    [id, storeId]
  );
  
  if (!draftSections || draftSections.length === 0) {
    return json({ error: 'No draft to publish' }, { status: 404 });
  }

  const validation = validateSections(draftSections);
  if (!validation.valid) {
    return json({ error: 'Validation failed', errors: validation.errors }, { status: 400 });
  }

  try {
    // 2. Copy draft sections to published
    await db.query(
      `INSERT INTO templateSectionsPublished 
       SELECT * FROM templateSectionsDraft 
       WHERE template_id = ? AND store_id = ?`,
      [id, storeId]
    );

    // 3. Copy draft theme settings to published
    await db.query(
      `INSERT INTO themeSettingsPublished 
       SELECT * FROM themeSettingsDraft 
       WHERE template_id = ? AND store_id = ?`,
      [id, storeId]
    );

    // 4. Invalidate KV cache
    await kv.delete(`store:${storeId}:template:published`);

    // 5. Return success
    return json({ success: true, message: 'Template published' });
  } catch (error) {
    return json({ error: 'Publish failed', details: error.message }, { status: 500 });
  }
}
```

---

## KV Cache Pattern

```
Key: store:{storeId}:template:published
Value: Cached published template data
TTL: None (persistent)
```

**Invalidation:** Delete key when publish completes.

---

## Checklist

- [ ] Draft/Published tables exist
- [ ] Publish endpoint validates draft
- [ ] Copy query executes atomically
- [ ] KV cache invalidation works
- [ ] All queries scoped by `store_id`

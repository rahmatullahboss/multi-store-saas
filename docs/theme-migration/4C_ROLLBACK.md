# Phase 4C: Rollback Strategy

**Document Purpose:** Simple rollback procedure if migration fails.

---

## Strategy Overview

Rollback is straightforward because we never delete `themeConfig`:

1. **Phase 1:** New system reads draft tables, falls back to `themeConfig` if empty
2. **Phase 2:** Once verified stable, stop reading `themeConfig`
3. **If issues arise:** Can always read `themeConfig` as fallback

**Backup:** Before migration, export current `themeConfig` for each store to a file.

---

## Pre-Migration Backup

```typescript
// Backup script: runs before migration starts
async function backupThemeConfigBeforeMigration(db: D1Database, storeId: string) {
  const themeConfig = await db.prepare(
    'SELECT themeConfig FROM stores WHERE id = ?'
  ).bind(storeId).first();
  
  if (themeConfig) {
    // Save to file with timestamp
    const backup = {
      storeId,
      timestamp: new Date().toISOString(),
      themeConfig: themeConfig.themeConfig
    };
    
    console.log(`✅ Backup created for store ${storeId}`);
    return backup;
  }
}
```

---

## Rollback Procedure

If migration fails or issues detected:

### Step 1: Stop the new system from reading draft tables
```typescript
// Disable draft table reads temporarily
const USE_DRAFT_TABLES = false; // Set to false
```

### Step 2: System falls back to themeConfig
```typescript
async function getThemeConfig(storeId: string) {
  // If draft tables disabled, always use themeConfig
  if (!USE_DRAFT_TABLES) {
    const store = await db.prepare(
      'SELECT themeConfig FROM stores WHERE id = ?'
    ).bind(storeId).first();
    
    return JSON.parse(store.themeConfig);
  }
  
  // Otherwise try draft tables with fallback
  // ... (normal logic)
}
```

### Step 3: Investigate and fix
- Review migration logs
- Identify what went wrong
- Fix the issue
- Re-run migration on fresh data

---

## Verification Before Proceeding

After Phase 1 migration completes:

- [ ] Draft tables populated for all stores
- [ ] Fallback logic working (test by disabling draft reads)
- [ ] themeConfig unchanged and still readable
- [ ] All templates render correctly
- [ ] No errors in logs

Only after verification passes, proceed to Phase 2 (remove themeConfig reads).

---

## Next Steps

See [Phase 5A: Migration Script](../THEME_MIGRATION_5A_SCRIPT.md) for executing the migration.

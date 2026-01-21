# Phase 5C: Deployment — Phased & Low-Risk

**Low-risk deployment with `themeConfig` fallback ensures zero downtime and instant rollback capability.**

---

## Overview

| Item | Details |
|------|---------|
| **Risk Level** | Low — `themeConfig` remains as fallback |
| **Downtime** | None required |
| **Rollback** | Instant (remove fallback flag) |
| **Timeline** | 3 phases over 1 week |
| **Success Metric** | Stores render correctly; no errors |

---

## Phase 1: Deploy Code with Fallback (T-0)

**Objective:** Deploy new code that reads draft tables but falls back to `themeConfig` if needed.

```bash
#!/bin/bash
# 1-deploy-code.sh

npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

npm run deploy
echo "✅ Code deployed with themeConfig fallback active"
```

**Code Pattern:**
```typescript
// Load theme: try draft tables first, fallback to themeConfig
export async function loadTheme(storeId: string) {
  try {
    const draftTheme = await db.draft_theme_config.findFirst({
      where: { store_id: storeId }
    });
    if (draftTheme && draftTheme.data) return draftTheme.data;
  } catch (e) {
    console.warn('Draft table error, using fallback:', e);
  }
  
  // Fallback: use themeConfig
  return await db.stores.findFirst({
    where: { id: storeId },
    select: { themeConfig: true }
  }).then(s => s?.themeConfig);
}
```

**Checklist:**
- [ ] Code builds successfully
- [ ] Fallback code deployed
- [ ] Tests pass (includes fallback tests)
- [ ] Monitor for any errors

---

## Phase 2: Run Migration (T+1 Day)

**Objective:** Migrate data from `themeConfig` to draft tables.

```bash
#!/bin/bash
# 2-run-migration.sh

export NODE_ENV=production

# Backup first
echo "Creating backup..."
wrangler d1 backup create --database=prod-db

# Run migration
npm run migrate:prod

if [ $? -ne 0 ]; then
  echo "❌ Migration failed — system still on themeConfig fallback"
  exit 1
fi

echo "✅ Migration complete"
```

**During Migration:**
- Stores continue using `themeConfig` fallback
- No downtime
- If migration fails, stores automatically use fallback

---

## Phase 3: Verify & Monitor (T+1 to T+7 Days)

**Objective:** Ensure all stores render correctly and draft system works.

```typescript
// Verify stores are working
async function verifyStores() {
  const stores = await db.stores.findMany();
  
  for (const store of stores) {
    try {
      const theme = await loadTheme(store.id);
      console.log(`✅ Store ${store.id}: theme loaded`);
      
      // Verify draft table has data
      const draft = await db.draft_theme_config.findFirst({
        where: { store_id: store.id }
      });
      if (!draft) {
        console.warn(`⚠️ Store ${store.id}: no draft data (OK if using fallback)`);
      }
    } catch (e) {
      console.error(`❌ Store ${store.id}: ERROR`, e);
    }
  }
}
```

**Monitoring Checklist:**
- [ ] No 500 errors in logs
- [ ] All stores load templates without errors
- [ ] Editor works for all stores
- [ ] Published pages render correctly
- [ ] Performance is normal (< 500ms response time)

---

## Phase 4: Remove Fallback (T+7 Days)

**Objective:** After 1 week of successful operation, remove fallback code.

```bash
#!/bin/bash
# 3-remove-fallback.sh

# Remove fallback from code
# Delete: themeConfig read logic from loadTheme()

# Build without fallback
npm run build
npm run deploy

echo "✅ Fallback removed — fully using draft tables"
```

---

## Deployment Checklist

**Before Phase 1:**
- [ ] Deploy new code (reads draft tables with `themeConfig` fallback)
- [ ] Monitoring alerts active
- [ ] Team aware of deployment

**Before Phase 2:**
- [ ] Phase 1 stable for 24 hours
- [ ] No errors in logs
- [ ] D1 backup created
- [ ] Migration script tested on staging

**After Migration (Phase 2):**
- [ ] All stores render correctly
- [ ] No 500 errors
- [ ] Verify 5–10 sample stores manually

**Week 1 (Phase 3):**
- [ ] Monitor error rates (target: < 1%)
- [ ] Monitor response times (target: < 500ms)
- [ ] No customer complaints

**After 1 Week (Phase 4):**
- [ ] Remove fallback code
- [ ] Confirm all systems still working
- [ ] Update documentation

---

## Quick Commands

```bash
# Phase 1: Deploy
npm run build && npm run deploy

# Phase 2: Migrate
wrangler d1 backup create --database=prod-db
npm run migrate:prod

# Phase 3: Verify
npm run verify:deployment

# Phase 4: Cleanup
# Edit code to remove themeConfig fallback
npm run build && npm run deploy
```

---

## Rollback (If Needed)

**Before Phase 2 (code removed):**
- Redeploy previous version: `git revert HEAD && npm run deploy`

**Before Phase 4 (after 1 week):**
- Set flag: `FALLBACK_ENABLED=true` in `wrangler.toml`
- Redeploy: `npm run deploy`
- No database changes needed

---

## Success Criteria

✅ **Deployment is successful if:**
1. All stores can load and edit templates
2. Error rate stays < 1%
3. Response time stays < 500ms
4. No data loss in migration
5. Published pages render correctly
6. Multi-tenant isolation maintained

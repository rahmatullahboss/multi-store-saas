# SYSTEM CLEANUP PLAN (CORRECTED)

## Focus: Update Imports, Not Delete Files

**Boss:** Boss  
**Plan Created:** March 8, 2026  
**Approach:** Update routes to use unified-settings, verify system works  
**Timeline:** 4 Weeks (20 working days)

---

## 🎯 CORE PRINCIPLE

### Don't Delete Files - Update Imports!

The adversarial review found:

- Files we thought were "legacy" are actually IN USE
- Deleting them would BREAK PRODUCTION
- The real fix: UPDATE IMPORTS to use unified-settings

---

## 📊 WHAT THE REVIEW FOUND

### Files That Are ACTUALLY In Use:

| File                        | Used By           | Action                           |
| --------------------------- | ----------------- | -------------------------------- |
| `store-config.server.ts`    | 3 routes          | UPDATE import → unified-settings |
| `store-config-do.server.ts` | tenant middleware | UPDATE import → unified-settings |
| `template-configs.ts`       | page-builder      | DON'T TOUCH                      |

### What Already Works:

| System                                  | Status      | Action                     |
| --------------------------------------- | ----------- | -------------------------- |
| `unified-storefront-settings.server.ts` | ✅ WORKING  | This is our single source! |
| Theme Registry (19 themes)              | ✅ COMPLETE | Don't need to fix          |
| Design Schema                           | ✅ EXISTS   | Don't need to add          |

---

## 📅 4-WEEK IMPLEMENTATION PLAN

### Week 1: Map & Update Routes

**Goal:** Find all places using old settings, update to unified-settings

**Day 1: Find All Imports**

```bash
# Find all files importing store-config
grep -r "store-config" apps/web/app --include="*.ts" --include="*.tsx" -l
```

**Expected Results:**

- apps/web/app/routes/products.\_index.tsx
- apps/web/app/routes/products.$handle.tsx
- apps/web/app/routes/app.store.settings.tsx
- apps/web/app/server/middleware/tenant.ts

**Day 2-3: Update products.\_index.tsx**

```typescript
// BEFORE
import { getStoreConfig } from '~/services/store-config.server';

// AFTER
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

// Change all references:
const config = await getStoreConfig(db, storeId);
// →
const settings = await getUnifiedStorefrontSettings(db, storeId);
const config = settings.theme; // or appropriate field
```

**Day 4: Update products.$handle.tsx**

Same pattern as above.

**Day 5: Update app.store.settings.tsx**

```typescript
// BEFORE
import { invalidateStoreConfig } from '~/services/store-config.server';

// AFTER
import { saveUnifiedStorefrontSettingsWithCacheInvalidation } from '~/services/unified-storefront-settings.server';
```

**Deliverable:** `WEEK1_IMPORT_UPDATES.md` - List of all changes made

---

### Week 2: Update Middleware

**Goal:** Update tenant middleware to use unified-settings

**Day 1: Find middleware usage**

```bash
grep -r "store-config" apps/web/app/server --include="*.ts" -l
```

**Day 2-3: Update tenant.ts**

```typescript
// BEFORE
import { getStoreConfig } from '~/services/store-config.server';

// AFTER
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
```

**Day 4-5: Test middleware**

```bash
# Test that tenant isolation still works
npm run test:middleware
```

**Deliverable:** `WEEK2_MIDDLEWARE_UPDATES.md`

---

### Week 3: Testing & Verification

**Goal:** Verify all routes work with unified-settings

**Day 1: Test Homepage**

```bash
# Visit homepage, check no errors
curl -I https://staging.ozzyl.com/
```

**Day 2: Test Product Pages**

```bash
# Visit product pages, check no errors
curl -I https://staging.ozzyl.com/products/1
```

**Day 3: Test Settings Pages**

```bash
# Visit admin settings, check no errors
# Test saving settings
```

**Day 4: Test Tenant Isolation**

```bash
# Verify store A can't see store B's data
npm run test:tenant-isolation
```

**Day 5: Full Test Suite**

```bash
# Run all tests
npm run test:all
```

**Deliverable:** `WEEK3_TEST_REPORT.md` - All test results

---

### Week 4: Documentation & Cleanup

**Goal:** Document the single source of truth, mark legacy files as deprecated

**Day 1: Document Single Source**

Create `docs/SINGLE_SOURCE_OF_TRUTH.md`:

```markdown
# Single Source of Truth

## Use This File:

import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

## This is the ONLY settings file to use:

- ✅ unified-storefront-settings.server.ts

## Deprecated (Don't Use):

- ❌ store-config.server.ts (will be removed in v3)
- ❌ store-config-do.server.ts (will be removed in v3)

## Migration:

All routes now use unified-settings.
```

**Day 2-3: Add Deprecation Comments**

```typescript
// store-config.server.ts
/**
 * @deprecated Use unified-storefront-settings.server.ts instead
 * Will be removed in v3.0
 */
export async function getStoreConfig(...) { ... }
```

**Day 4: Final Verification**

```bash
# Verify no production errors
wrangler tail
```

**Day 5: Report**

**Deliverable:** `FINAL_REPORT.md`

---

## 📊 METRICS

### Before vs After

| Metric                        | Before   | After          |
| ----------------------------- | -------- | -------------- |
| Settings files used           | 2+       | **1**          |
| Routes using unified-settings | ~10      | **All**        |
| Settings locations            | Multiple | **Single**     |
| Legacy files                  | Active   | **Deprecated** |

---

## ✅ ACCEPTANCE CRITERIA

### Week 1 (Must Pass)

- [ ] All imports of store-config found
- [ ] products.\_index.tsx updated
- [ ] products.$handle.tsx updated
- [ ] app.store.settings.tsx updated
- [ ] Tests pass

### Week 2 (Must Pass)

- [ ] tenant.ts middleware updated
- [ ] Tenant isolation still works
- [ ] No errors in logs

### Week 3 (Must Pass)

- [ ] Homepage works
- [ ] All product pages work
- [ ] Settings pages work
- [ ] No regressions

### Week 4 (Must Pass)

- [ ] Documentation complete
- [ ] Legacy files marked deprecated
- [ ] Production deployment successful
- [ ] No critical errors

---

## 🛠️ FILES TO UPDATE

### Routes to Update:

```
apps/web/app/routes/products._index.tsx
apps/web/app/routes/products.$handle.tsx
apps/web/app/routes/app.store.settings.tsx
```

### Middleware to Update:

```
apps/web/app/server/middleware/tenant.ts
```

### Files to DEPRECATE (Not Delete):

```
apps/web/app/services/store-config.server.ts      ← Add @deprecated comment
apps/web/app/services/store-config-do.server.ts  ← Add @deprecated comment
```

### Files to KEEP:

```
apps/web/app/services/unified-storefront-settings.server.ts  ← SINGLE SOURCE
apps/web/app/services/storefront-settings.schema.ts
apps/web/app/lib/grapesjs/template-configs.ts  ← DON'T TOUCH (page-builder)
```

---

## ⚠️ WHAT NOT TO DO

| Don't Do                        | Why                         |
| ------------------------------- | --------------------------- |
| Don't delete store-config files | Still used, will break      |
| Don't touch template-configs.ts | Used by page-builder        |
| Don't add design schema         | Already exists              |
| Don't fix theme registry        | Already complete            |
| Don't consolidate headers       | Not needed for this cleanup |

---

## 🎉 OUTCOME

After 4 weeks, you will have:

✅ **Single source of truth** - All routes use unified-settings  
✅ **Working system** - No breaking changes  
✅ **Deprecated legacy** - Old files marked for removal  
✅ **Documentation** - Clear single source documented  
✅ **Tested** - All routes verified

**System is CLEAN and ROBUST!** ✨

---

## 🚀 NEXT STEPS

1. **Approve This Plan** - Boss signs off
2. **Week 1** - Find and update imports
3. **Week 2** - Update middleware
4. **Week 3** - Test everything
5. **Week 4** - Document and deploy

---

**Let's update imports, not delete files.** 🚀

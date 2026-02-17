# Unified Storefront Settings - Implementation Tracking

**Date:** 2026-02-16  
**Status:** ✅ Phase 1 Complete

---

## Summary

Implemented single source of truth for storefront settings to eliminate:

- Page-wise color inconsistency
- Settings read path fragmentation
- Cache invalidation issues

---

## Completed Work

### 1. Schema Changes

| File                                                                    | Change                                                               |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `packages/database/src/schema.ts`                                       | Added `storefront_settings` column + `store_settings_archives` table |
| `packages/database/src/migrations/0091_unified_storefront_settings.sql` | Migration file                                                       |

### 2. New Service Files Created

| File                                                          | Purpose                    |
| ------------------------------------------------------------- | -------------------------- |
| `apps/web/app/services/storefront-settings.schema.ts`         | Zod schemas for validation |
| `apps/web/app/services/unified-storefront-settings.server.ts` | Core service (700+ lines)  |

**Key Functions:**

- `getUnifiedStorefrontSettings()` - Read with auto-backfill
- `saveUnifiedStorefrontSettings()` - Write settings
- `saveUnifiedStorefrontSettingsWithCacheInvalidation()` - Save + invalidate
- `invalidateUnifiedSettingsCache()` - D1 + KV + DO cache clearing
- `migrateStoreToUnifiedSettings()` - Migration helper

### 3. Modified Routes (Phase A - Critical Storefront)

| Route                  | Change                                            |
| ---------------------- | ------------------------------------------------- |
| `store.home.tsx`       | Uses `resolveUnifiedStorefrontSettings()` wrapper |
| `products._index.tsx`  | Uses `resolveUnifiedStorefrontSettings()` wrapper |
| `products.$handle.tsx` | Uses `resolveUnifiedStorefrontSettings()` wrapper |
| `_index.tsx`           | Direct `getUnifiedStorefrontSettings()` call      |

### 4. Modified Admin Routes (Phase C)

| Route                    | Change                              |
| ------------------------ | ----------------------------------- |
| `app.store.settings.tsx` | Dual-write to both legacy + unified |

### 5. Backward Compatibility

- Created wrapper in `storefront-settings.server.ts` that uses new unified service
- Routes don't need changes - automatic via wrapper
- Auto-backfill on first read

---

## Verification

| Check           | Status                    |
| --------------- | ------------------------- |
| Build           | ✅ Pass                   |
| Lint            | ⚠️ 1 warning (acceptable) |
| Local Migration | ✅ Applied                |
| Git Commit      | ✅ `453a65d8`, `9f4df323` |

---

## Data Flow

```
Read Path:
┌─────────────────────────────┐
│  getUnifiedStorefrontSettings()  │
└──────────────┬──────────────┘
               │
        ┌──────▼──────┐
        │ canonical    │
        │ column       │
        └──────┬──────┘
               │ (missing?)
        ┌──────▼──────┐
        │ fallback to  │
        │ legacy       │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ auto-backfill│
        └──────────────┘

Write Path:
┌─────────────────────────────┐
│  saveUnifiedStorefrontSettings()  │
└──────────────┬──────────────┘
               │
        ┌──────▼──────┐
        │ canonical    │
        │ column       │
        └──────────────┘
               │
        ┌──────▼──────┐
        │ invalidate   │
        │ D1+KV+DO    │
        └──────────────┘
```

---

## Remaining Tasks

### Post-Deploy (Pending)

1. Deploy to staging
2. Run data migration for existing stores
3. Deploy to production
4. Monitor for 48 hours
5. Disable fallback after 2 releases

### Cleanup (Future)

1. Remove legacy read code after N+2 release
2. Delete unused `store_mvp_settings` table
3. Prune `themeConfig` column (frozen)

---

## Rollout Commands

```bash
# Local dev
npm run db:migrate:local

# Deploy staging
cd apps/web && npm run deploy:staging

# Deploy production
cd apps/web && npm run deploy:prod

# Verify route parity
/?_data=routes/_index
/products?_data=routes/products._index
/products/1?_data=routes/products.$handle
```

---

## Monitoring Metrics

Track these metrics post-deploy:

- `settings_mismatch_detected` - page A vs page B hash
- `legacy_fallback_used` - fallback usage
- `settings_read_error` - read failures
- `settings_write_error` - write failures

---

## Related Files

- Plan: `docs/UNIFIED_STOREFRONT_SETTINGS_MIGRATION_PLAN_2026-02-16.md`
- Archive Checklist: `docs/MVP_DUAL_SYSTEM_ARCHIVE_UNIFY_CHECKLIST_2026-02-16.md`
- This File: `docs/UNIFIED_STOREFRONT_SETTINGS_IMPLEMENTATION_TRACKING.md`

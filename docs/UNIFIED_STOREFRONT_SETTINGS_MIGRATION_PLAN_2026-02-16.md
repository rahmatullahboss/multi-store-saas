# Unified Storefront Settings Migration Plan (MVP)
Date: 2026-02-16  
Owner: Storefront Platform  
Scope: Store mode (e-commerce storefront) only

## 1. Summary
Goal হল storefront settings-এর জন্য **একটা single source of truth** করা, যাতে MVP settings বনাম legacy Shopify 2.0/themeConfig conflict না করে।

এই plan-এর outcome:
1. সব storefront route একই unified settings service থেকে read করবে।
2. legacy settings sources archive করা হবে, immediate hard delete করা হবে না।
3. 2 release stable থাকার পর legacy code/data drop করা হবে।
4. store name/theme mismatch, cross-page color inconsistency, cache stale mismatch systematically বন্ধ হবে।

## 2. Current Problems (Confirmed)
1. Settings read path fragmented:
- কিছু route `stores.themeConfig`
- কিছু route `store_mvp_settings`
- কিছু route direct `stores` columns (`name`, `logo`, `favicon`, `socialLinks`, `businessInfo`)
2. Cache invalidation inconsistent:
- D1 cache key `store:{id}:config` + KV + DO cache সবসময় একসাথে invalidate হয় না।
3. Legacy + MVP precedence deterministic না হওয়ায় page-wise mismatch হয়।
4. Type safety degraded in non-storefront page-builder routes (TS errors), যা future deploy confidence কমায়।

## 3. Target Architecture
Canonical source: `stores.storefront_settings` (JSON, versioned, store-scoped)

Read flow:
1. `getUnifiedStorefrontSettings(storeId)` reads `stores.storefront_settings`
2. missing হলে compatibility fallback layer only (temporary)
3. fallback resolved হলে auto-backfill করে canonical column update
4. সব storefront routes একই returned object use করবে

Write flow:
1. সব storefront-impacting admin settings canonical object update করবে
2. compatibility mirror (legacy columns) optional and temporary (2 releases)
3. save success হলে unified cache invalidation চালু হবে (D1 + KV + DO)

## 4. Public Interfaces / Types (New)
## 4.1 DB Schema
Add column in `stores`:
- `storefront_settings TEXT NULL` (JSON)

Add archive table:
- `store_settings_archives`
- columns:
  - `id INTEGER PK`
  - `store_id INTEGER NOT NULL`
  - `source TEXT NOT NULL` (`theme_config`, `mvp_settings`, `social_links`, etc.)
  - `snapshot_json TEXT NOT NULL`
  - `schema_version INTEGER NOT NULL`
  - `release_tag TEXT NOT NULL`
  - `created_at TIMESTAMP`

## 4.2 Canonical Type
Create `apps/web/app/services/storefront-settings.schema.ts`:
- `UnifiedStorefrontSettingsV1`
- top-level keys:
  - `version: 1`
  - `theme: { templateId, primary, accent, background, text, muted, cardBg, headerBg, footerBg, footerText }`
  - `branding: { storeName, logo, favicon, tagline, description }`
  - `business: { phone, email, address }`
  - `social: { facebook, instagram, whatsapp, twitter }`
  - `navigation` (if storefront needed)
  - `announcement`
  - `seo`
  - `checkout: { shippingSummaryText, ...storefront-required subset }`
  - `flags: { sourceLocked, legacyFallbackUsed }`
  - `updatedAt`

Validation: Zod schema + strict defaults.

## 4.3 Service API
Create `apps/web/app/services/unified-storefront-settings.server.ts`:
- `getUnifiedStorefrontSettings(db, storeId, opts?)`
- `saveUnifiedStorefrontSettings(db, storeId, patch, actor)`
- `migrateLegacyToUnifiedSettings(db, storeId, options)`
- `archiveLegacySettingsSnapshot(db, storeId, releaseTag)`
- `invalidateUnifiedSettingsCache(env, storeId, context?)`

## 5. Data Mapping Rules (Decision Complete)
Precedence during migration (one-time):
1. `store_mvp_settings.settings_json` for `storeName/logo/favicon/primary/accent/announcement`
2. `stores.themeConfig` for templateId + theme extras + seo + floating/contact UI
3. `stores.socialLinks`
4. `stores.businessInfo`
5. direct `stores` columns fallback (`name/logo/favicon/tagline/description`)

Conflict rules:
1. Empty string = unset
2. Null = unset
3. invalid JSON = archive + skip + fallback
4. templateId allowlist = `luxe-boutique | nova-lux | starter-store`, otherwise fallback `starter-store`
5. color must be valid hex; invalid হলে template defaults

## 6. Route Cutover Plan (Phased)
Phase A (critical storefront parity):
1. `/` -> `apps/web/app/routes/_index.tsx`
2. `/store.home` -> `apps/web/app/routes/store.home.tsx`
3. `/products` -> `apps/web/app/routes/products._index.tsx`
4. `/products/$handle` -> `apps/web/app/routes/products.$handle.tsx`
5. `/categories` -> `apps/web/app/routes/categories.tsx`
6. `/pages/$slug` -> `apps/web/app/routes/pages.$slug.tsx`

Phase B (supporting storefront paths):
1. `cart.tsx`
2. `checkout.tsx`
3. policy/thank-you/order pages যেখানে branding/theme render হয়
4. `api.store-context.ts`

Phase C (admin write-path unification):
1. `app.store.settings.tsx`
2. `app.settings._index.tsx`
3. `app.store-design.tsx`
4. theme/courier settings যেগুলো এখন `themeConfig` mutate করে

## 7. Cache Strategy (Must Implement)
On any canonical settings write:
1. D1 cache delete:
- `store:{storeId}:config`
- `store:{storeId}:*`
2. KV cache delete:
- tenant subdomain/domain keys
- store config keys
3. DO cache invalidate:
- `STORE_CONFIG_SERVICE /invalidate`
4. Product KV cache version bump:
- include `settingsVersion` or canonical hash in product/cache keys

Consistency guard:
- D1 Session bookmark ব্যবহার করো settings write → immediate read path এ read-after-write consistency রাখতে।

## 8. Legacy Archive and Retirement
Release N:
1. archive snapshots for all stores
2. enable canonical read with fallback
3. dual-write (canonical + legacy critical fields)

Release N+1:
1. disable fallback reads by feature flag for 10% → 50% → 100%
2. monitor mismatch/error metrics

Release N+2:
1. stop dual-write
2. keep read-only archive table
3. delete legacy storefront read code
4. optional: prune unused `themeConfig` keys used only by frozen system

## 9. Feature Flags
Add env flags:
1. `UNIFIED_STOREFRONT_SETTINGS_READ=true|false`
2. `UNIFIED_STOREFRONT_SETTINGS_WRITE=true|false`
3. `UNIFIED_STOREFRONT_SETTINGS_FALLBACK=true|false`
4. `UNIFIED_STOREFRONT_SETTINGS_STRICT_TEMPLATE_ALLOWLIST=true|false`

Default rollout:
- staging: all true
- production: read=true, write=true, fallback=true প্রথমে

## 10. Test Plan
## 10.1 Unit
1. mapping precedence tests
2. invalid JSON fallback tests
3. invalid color/template fallback tests
4. default value hydration tests
5. archive snapshot integrity tests

## 10.2 Integration
1. admin save -> storefront reflects same `storeName/theme` on:
- home
- products
- product detail
- collection
2. cache invalidation test:
- save settings
- immediate reload should return new values
3. tenant isolation:
- store A settings never leak to store B

## 10.3 E2E (Playwright)
1. merchant changes name/color/logo
2. customer opens multiple pages
3. values remain identical across all pages
4. customer login state on/off both paths consistent

## 10.4 Type/Build Gates
Before merge:
1. `npm run -w apps/web typecheck`
2. `npm run -w apps/web build`
3. selected E2E storefront suite pass

Note:
- Existing page-builder TS errors (non-storefront) must be resolved or isolated via explicit tsconfig/project split before final gate.

## 11. Implementation Task Breakdown
1. Add schema migration (`storefront_settings` + archive table)
2. Add canonical type + validation schema
3. Build unified read/write/migrate/archive service
4. Add deterministic cache invalidation helper
5. Cutover Phase A routes
6. Run staging data migration dry-run + apply
7. Validate staging route parity via `_data` checks
8. Cutover Phase B routes
9. Cutover admin write paths (Phase C)
10. Enable production with feature flags
11. Monitor 2 releases
12. Remove fallback and legacy read code

## 12. Rollout Checklist
1. DB backup snapshot complete
2. migration dry-run report reviewed
3. staging smoke passed
4. staging load + cache test passed
5. production canary enabled
6. dashboards clean for 48h
7. expand to 100%
8. mark legacy code deprecated
9. release N+2 cleanup PR

## 13. Monitoring and Alerts
Track:
1. `settings_mismatch_detected` (page A vs page B hash)
2. `legacy_fallback_used`
3. `settings_read_error`
4. `settings_write_error`
5. cache hit/miss ratio by store
6. post-save propagation latency p95

Alert thresholds:
1. mismatch > 0.5% requests
2. fallback usage > 5% after full migration
3. write failure > 0.2%

## 14. Assumptions and Defaults
1. MVP active theme allowlist fixed: `luxe-boutique`, `nova-lux`, `starter-store`
2. Shopify 2.0 complex/frozen system এখন archive mode-এ থাকবে, runtime source হবে না
3. release cadence allows 2 releases before deletion
4. canonical schema version starts at `1`
5. immediate hard delete করা হবে না

## 15. Commands (Execution Reference)
1. Migration generate/apply:
- `npm run db:migrate:local`
- `npm run db:migrate:prod`
2. Checks:
- `npm run -w apps/web typecheck`
- `npm run -w apps/web build`
3. Deploy staging:
- `npm run -w apps/web deploy:staging`
4. Route parity verify:
- `/?_data=routes/_index`
- `/products?_data=routes/products._index`
- `/products/1?_data=routes/products.$handle`

## 16. Documentation Updates Required
1. Update `docs/MVP_THEME_SYSTEM.md` with canonical storage and fallback policy
2. Update `docs/SYSTEM_STATUS.md` with “single source of truth” architecture
3. Create runbook:
- `docs/UNIFIED_STOREFRONT_SETTINGS_ROLLOUT_RUNBOOK.md`
4. Add regression checklist to `docs/STAGING_WORKFLOW.md`

## 17. External Docs Used (Research)
1. Cloudflare D1 read replication/session consistency: https://developers.cloudflare.com/d1/best-practices/read-replication/
2. Cloudflare KV consistency model: https://developers.cloudflare.com/kv/concepts/how-kv-works/
3. Remix v2 data loading patterns: https://v2.remix.run/docs/guides/data-loading/
4. Drizzle migration workflow: https://orm.drizzle.team/docs/migrations
5. Shopify theme settings architecture reference: https://shopify.dev/docs/storefronts/themes/architecture/settings

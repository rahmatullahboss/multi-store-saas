## Theme Isolation Cutover Plan (Storefront / Landing / Builder)

### Summary
Goal: **৩টা scope-এর theme/source আলাদা থাকবে, কিন্তু কোন scope-এ cross-mix হবে না**.

Locked scopes:
1. **Storefront**: home/cart/checkout/products/search/auth/account
2. **Landing**: campaign/landing-template routes (`landingConfig`-based)
3. **Builder**: page-builder/live-editor preview scope

Success criteria:
- যেটা যে scope-এ select হবে, শুধু সেই scope-এ apply হবে
- Storefront routes সবসময় একই template/theme source পড়বে
- Landing routes storefront theme accidentally inherit করবে না
- Builder preview storefront/landing theme accidentally inherit করবে না
- No theme drift across pages in same scope

---

## Public API / Interface Changes

### 1) Unified settings schema (canonical split)
`/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/services/storefront-settings.schema.ts`

Add/lock explicit scoped fields:
- `theme.templateId` => storefront-only
- `landing.templateId` (new) => landing-only
- `builder.previewTemplateId` (new) => builder preview/editor-only

Backward compatibility:
- read fallback during migration:
  - landing from `stores.landingConfig.templateId`
  - builder from existing builder/page defaults
- write path: new scoped fields only

### 2) Route contract semantics
- `/app/store/settings` = storefront theme editor only
- `/app/design` = landing theme editor only (rename labels/text accordingly)
- builder UI = builder theme only

No dual meaning in UI labels (remove generic “theme/template” ambiguity).

---

## Implementation Plan

### Workstream A: Canonical scoped source-of-truth
Files:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/services/storefront-settings.schema.ts`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/services/unified-storefront-settings.server.ts`

Tasks:
1. Extend schema with `landing` and `builder` scoped blocks.
2. Add strict validators for each scope template id.
3. Update save/read helpers to patch only scoped branch.
4. Keep `stores.theme` sync with **storefront** template only (already partially done).
5. Add helper APIs:
   - `getStorefrontTemplateId(settings)`
   - `getLandingTemplateId(settings)`
   - `getBuilderTemplateId(settings)`

### Workstream B: Storefront routes hard-unify
Files:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/_index.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/store.home.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/cart.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/checkout.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/products._index.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/products.$handle.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/search.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/store.auth.login.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/account.tsx`

Tasks:
1. Ensure all storefront routes read only `settings.theme.templateId`.
2. Remove leftover fallback branches that may read other template sources in storefront routes.
3. Normalize helper usage: one shared resolver for storefront template id.

### Workstream C: Remove legacy fallback in template resolver
File:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/lib/store.server.ts`

Tasks:
1. Delete/disable `buildTemplateFromThemeConfig` fallback path.
2. Ensure missing template case resolves from scoped canonical defaults, not legacy columns.
3. Keep store mode guard behavior unchanged.

### Workstream D: Landing isolation
File:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/app.design.tsx`

Tasks:
1. Stop treating landing selector as generic store theme selector.
2. Read/write `settings.landing.templateId` (via unified service), not raw `stores.landingConfig`.
3. UI copy update:
   - “Landing Template”
   - “Affects landing pages only”
4. Optional compatibility write: keep old `landingConfig` mirrored for one release window.

### Workstream E: Builder isolation
Likely files:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/lib/store-live-editor.server.ts`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/store-preview-frame.tsx`
- builder-related routes/components under `app.new-builder*`

Tasks:
1. Builder preview reads only `settings.builder.previewTemplateId` (or explicit builder theme state).
2. Save path updates only builder scoped branch.
3. Add clear precedence rule: explicit builder override > builder scoped default > storefront scoped fallback (read-only fallback, no implicit write).

### Workstream F: Admin settings clarity
Files:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/app.store.settings.tsx`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/app.settings._index.tsx`

Tasks:
1. Relabel tabs/sections to explicit scope:
   - Storefront Theme
   - Landing Theme
   - Builder Preview Theme
2. Add inline warning badges when merchant is in a different scope editor.
3. Add one-time migration notice banner: “Themes are now scope-isolated (no mixing).”

### Workstream G: Data migration and normalization
1. Create idempotent migration script (service-level job):
   - populate missing `landing.templateId` from `landingConfig`
   - populate missing `builder.previewTemplateId` from builder defaults
   - ensure `theme.templateId` stays storefront canonical
2. Cache invalidation after migration:
   - `STORE_CACHE` tenant/store keys
   - `STORE_CONFIG_SERVICE` invalidation endpoint
3. Keep migration safe (dry-run + apply modes).

---

## Testing & Acceptance Criteria

### Unit tests
- scoped resolver tests:
  - storefront returns storefront id only
  - landing returns landing id only
  - builder returns builder id only
- patch merge tests:
  - changing landing does not mutate storefront/builder
  - changing storefront does not mutate landing/builder
- migration tests:
  - missing scopes backfilled correctly
  - idempotent repeated runs

### Integration tests
1. Set storefront=`starter-store`, landing=`luxe-boutique`, builder=`daraz`
   - `/cart` and `/checkout` show starter styles
   - landing routes show luxe
   - builder preview shows daraz
2. Change only landing template:
   - storefront routes unchanged
3. Change only storefront template:
   - landing routes unchanged
4. Refresh and cross-device verification with cache warm/cold.

### Regression tests
- auth/store pages still render correct storefront theme
- no read from deprecated legacy theme columns in runtime path
- no page-level template drift inside storefront scope

---

## Rollout & Monitoring

### Rollout steps
1. Ship code with scoped reads/writes + compatibility mirrors.
2. Run migration dry-run, inspect counts.
3. Run migration apply.
4. Purge/invalidate caches.
5. Run smoke tests on 3 real stores (including `surjo-bazaar`).

### Monitoring
- log metric: `theme_scope_source_used` (storefront/landing/builder)
- alert on mixed-source detection in same request
- track template mismatch incidents (target: zero)

### Rollback
- feature flag: scoped-theme read toggle
- fallback to previous resolver temporarily (without DB rollback)
- keep compatibility mirrors for one release window

---

## Assumptions & Defaults Chosen
- Chosen model: **Separate Themes** with strict isolation.
- Three scopes locked: **Storefront / Landing / Builder**.
- Soft-transition UX applied: clearer labels + notices, no silent mixed behavior.
- Storefront remains the only source for cart/checkout/products/home/auth/account template rendering.

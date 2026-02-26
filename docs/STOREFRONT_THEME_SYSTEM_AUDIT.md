# Storefront Theme System Audit

Date: 2026-02-26  
Scope: Active templates only (`starter-store`, `luxe-boutique`, `nova-lux`)

## 1) Current Rendering Flow (As-Is)

1. Store setup UI writes banner/theme/content to `stores.storefront_settings` via `saveUnifiedStorefrontSettingsWithCacheInvalidation(...)`.
2. Storefront homepage is rendered from `apps/web/app/routes/_index.tsx` in `mode === 'store'`.
3. `_index.tsx` resolves active template from unified settings: `unifiedSettings.theme.templateId`.
4. Template receives `config` object. Hero image/text are read in templates from:
   - `config.heroBanner.slides` (preferred through `getHeroBehavior`)
   - fallback `config.bannerUrl` / `config.bannerText`

## 2) Root Causes Found

### Issue A (Critical): Saved banner not showing on storefront

- File: `apps/web/app/routes/_index.tsx`
- Problem: `themeConfig` built for templates did not include `heroBanner` from unified settings.
- Effect: templates fell back to defaults (`DEFAULT_HERO_IMAGE`/static fallback) instead of merchant-saved banner.

### Issue B (Critical UX): Banner cross button did not delete from R2

- File: `apps/web/app/routes/app.store.settings.tsx` (`BannerSlide`)
- Problem: cross button only cleared local React state (`imageUrl: null`) and never called `/api/delete-image`.
- Effect: object stayed in R2; reload could restore old state if user did not re-save immediately.

## 3) Fixes Applied

### Fix A

- Added `heroBanner: unifiedSettings.heroBanner` into `_index.tsx` store-mode `themeConfig`.
- Result: active templates now receive the unified hero slides and render saved banner.

### Fix B

- Added `handleRemoveImage()` in `BannerSlide`:
  - clears local slide image state
  - calls `POST /api/delete-image` with `imageUrl`
  - keeps save flow compatible with unified settings patching
- Result: cross button now triggers real R2 delete attempt instead of local-only UI change.

## 4) Single Source of Truth Status

Primary source is now:

- `stores.storefront_settings` (unified JSON schema)

Still-present parallel entry points (technical debt):

1. `apps/web/app/routes/_index.tsx` (main storefront router)
2. `apps/web/app/routes/store.home.tsx` (alternate homepage route)

Both already read unified settings, but maintaining two homepage routes increases drift risk.

## 5) Remaining Risks / Next Steps (One-by-One)

1. Route consolidation: pick one storefront homepage route as canonical and retire/redirect the other.
2. Add integration tests for banner persistence:
   - save banner in setup
   - verify `_index.tsx` response contains `heroBanner`
   - verify rendered template uses updated image URL
3. Add test for banner delete flow:
   - click/remove triggers `/api/delete-image`
   - save persists `slide.imageUrl = null`
4. Add observability logs around hero config payload in `_index.tsx` (debug level) for production incident diagnosis.


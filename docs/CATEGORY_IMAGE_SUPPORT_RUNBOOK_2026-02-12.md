# Category Image Support Runbook (MVP Themes)

Date: 2026-02-12
Owner: Storefront Team

## Goal
এক জায়গায় clear reference রাখা যাতে বারবার কোড খুঁজতে না হয়:
- কোন theme category image দেখায়
- data কোথা থেকে আসে
- নতুন theme যোগ করলে কী check করতে হবে

## Source of Truth (MVP 3 Themes)
- `starter-store`
- `luxe-boutique`
- `nova-lux`

Reference: `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/templates/store-registry.ts`

## Current Data Flow
1. Homepage loader category list আনে `collections` table থেকে (title + image_url), fallback product categories.
2. Loader `themeConfig.categoryImageMap` inject করে.
3. Theme component category UI render করার সময় `categoryImageMap[categoryTitle]` থেকে image নেয়.

Primary implementation: `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/_index.tsx`

## Support Matrix
| Theme | Category Image Support | Status |
|---|---|---|
| `starter-store` | Category card image supported (`categoryImageMap` fallback) | ✅ Supported |
| `nova-lux` | `category-list`/`shop-by-category` section image supported via shared `CategorySection` + injected map | ✅ Supported |
| `luxe-boutique` | Category UI is text pills only (no image UI in current design) | ⚠️ Not supported by design |

## Extra Theme Notes (Non-MVP but common)
| Theme | Category Image Support | Status |
|---|---|---|
| `daraz` | Category grid now supports image + icon fallback | ✅ Supported |
| `bdshop` | Shared `CategorySection` image supported via injected map | ✅ Supported |

## Quick Verification Checklist (Before Release)
1. Store-এ active categories আছে এবং `collections.image_url` filled আছে কিনা check করুন.
2. Homepage-এ category section/card-এ real image উঠছে কিনা দেখুন.
3. Missing image হলে icon/text fallback expected কিনা confirm করুন.
4. Theme switch করে একই store-এ verify করুন (starter-store, nova-lux, luxe-boutique).

## DB Quick Checks
```sql
-- active collections with image
SELECT store_id, title, slug, image_url
FROM collections
WHERE is_active = 1
ORDER BY store_id, sort_order;

-- count of image coverage per store
SELECT store_id,
       COUNT(*) AS total_categories,
       SUM(CASE WHEN image_url IS NOT NULL AND TRIM(image_url) <> '' THEN 1 ELSE 0 END) AS with_image
FROM collections
WHERE is_active = 1
GROUP BY store_id;
```

## Code Locations to Check When Broken
- Loader map creation:
  - `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/routes/_index.tsx`
- Starter Store category card:
  - `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/components/store-templates/starter-store/index.tsx`
- Shared section category renderer:
  - `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/components/store-sections/CategorySection.tsx`
- Nova Lux section injection:
  - `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/components/store-templates/nova-lux/index.tsx`
- Daraz category grid:
  - `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/components/store-templates/daraz/sections/CategoryGrid.tsx`
- BDShop section injection:
  - `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/app/components/store-templates/bdshop/index.tsx`

## Rule for New Themes
যদি theme category image support করে, তাহলে অবশ্যই:
1. category title -> image URL mapping source define করতে হবে (`categoryImageMap` বা object categories).
2. image missing হলে graceful fallback রাখতে হবে (icon/text).
3. theme checklist-এ "Category Image: Supported/Not Supported" লিখতে হবে.


# 🎨 Starter Store Theme Redesign — Tracking

> **Project**: Starter Store UI Improvement  
> **Stitch Project ID**: `projects/6678685127439949020`  
> **Model Used**: Gemini 3 Pro  
> **Date Started**: 2026-02-22  
> **Status**: ✅ Complete

---

## 📱 Mobile Screens (Gemini 3 Pro)

| # | Screen Name | Stitch Screen | Status | Notes |
|---|-------------|---------------|--------|-------|
| 1 | Homepage | ✅ Generated | ✅ Applied | Hero, categories, products, newsletter |
| 2 | Product Details Page | ✅ Generated | ✅ Applied | Gallery, variants, reviews, related |
| 3 | Shopping Cart | ✅ Generated | ✅ Applied | Items, summary, promo code |
| 4 | Empty Cart State | ✅ Generated | ✅ Applied | Illustration, CTA |
| 5 | Collection / Products List | ✅ Generated | ⏳ Pending | Filter, grid, pagination |
| 6 | Checkout Page | ⏳ Pending | ⏳ Pending | Address, payment, summary |

---

## 🖥️ Desktop Screens (Gemini 3 Pro)

| # | Screen Name | Stitch Screen | Status | Notes |
|---|-------------|---------------|--------|-------|
| 1 | Homepage | ✅ Generated | ✅ Applied | 2-col hero, 4-col products |
| 2 | Product Details Page | ✅ Generated | ✅ Applied | Split layout, sticky panel |
| 3 | Cart Page | ✅ Generated | ✅ Applied | 2-col, order summary |
| 4 | Collection / Products List | ⏳ Pending | ⏳ Pending | Sidebar filter |
| 5 | Checkout Page | ⏳ Pending | ⏳ Pending | Multi-step form |

---

## 📁 Files Modified

| File | Change | Status |
|------|--------|--------|
| `apps/web/app/components/store-templates/starter-store/index.tsx` | Full redesign — 7 sections | ✅ Done |
| `apps/web/app/components/store-templates/starter-store/pages/ProductPage.tsx` | Full redesign — gallery, tabs, reviews | ✅ Done |
| `apps/web/app/components/store-templates/starter-store/pages/CartPage.tsx` | Full redesign — 2-col desktop, progress bar | ✅ Done |
| `apps/web/app/components/store-templates/starter-store/sections/Header.tsx` | Modern sticky nav, search bar | ✅ Done |
| `apps/web/app/components/store-templates/starter-store/sections/Footer.tsx` | 4-col responsive, newsletter | ✅ Done |
| `apps/web/app/components/store-templates/starter-store/sections/ProductCard.tsx` | Image hover, discount badge, rating | ✅ Done |
| `apps/web/app/components/store-templates/starter-store/theme.ts` | Color tokens updated | ✅ Done |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#4F46E5` (Indigo) | Buttons, links, active states |
| Accent | `#F59E0B` (Amber) | Badges, CTAs, highlights |
| Background | `#FFFFFF` / `#F9FAFB` | Page bg |
| Text | `#111827` / `#6B7280` | Headings / body |
| Border Radius | `rounded-xl` | Cards, buttons |
| Currency | ৳ (BDT) | All prices |

---

## 🏗️ Homepage Sections (index.tsx)

| Section | Mobile | Desktop | Status |
|---------|--------|---------|--------|
| Hero Banner | ✅ Stacked | ✅ Side-by-side | ✅ Done |
| Trust Bar (4 badges) | ✅ Horizontal scroll | ✅ Flex row | ✅ Done |
| Featured Categories | ✅ Horizontal scroll | ✅ 4-col grid | ✅ Done |
| Featured Products | ✅ 2-col grid | ✅ 4-col grid | ✅ Done |
| Promo Banners | ✅ Stacked | ✅ 2-col | ✅ Done |
| Best Sellers / New Arrivals (Tabs) | ✅ 2-col | ✅ 4-col | ✅ Done |
| Newsletter | ✅ Stacked | ✅ Centered | ✅ Done |

---

## ⏳ Next Steps (Pending)

- [ ] **Collection/Products List Page** — filter sidebar (desktop), filter sheet (mobile), sort dropdown
- [ ] **Checkout Page** — multi-step (shipping → payment → confirmation)
- [ ] **Desktop Collection Screen** — generate from Stitch
- [ ] **Mobile Collection Screen** — generate from Stitch  
- [ ] **TypeScript typecheck** — final full run `npm run typecheck`
- [ ] **Visual QA** — test all pages in dev server

---

## 🔗 Links

- **Stitch Project**: https://stitch.withgoogle.com/project/6678685127439949020
- **Template Path**: `apps/web/app/components/store-templates/starter-store/`
- **Theme Registry**: `apps/web/app/templates/store-registry.ts`

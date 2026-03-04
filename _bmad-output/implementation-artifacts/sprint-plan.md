---
workflowType: sprint-plan
project_name: Multi Store SaaS — P&L Tracking
date: 2026-03-03
status: active
currentSprint: 1
totalSprints: 3
---

# Sprint Plan
## Feature: Profit & Loss (P&L) Tracking System

**Project:** Multi Store SaaS (Ozzyl)
**Date:** 2026-03-03
**Total Sprints:** 3
**Stories:** 17

---

## Sprint 1 — Foundation
**Goal:** All backend infrastructure ready. Schema migrated, cost snapshot logic working, P&L service built and tested.
**Status:** ✅ Complete

| # | Story | Epic | Priority | Status |
|---|-------|------|----------|--------|
| 1 | E1-S1: DB Migration — Add P&L Columns | E1 | P0 | ✅ Done |
| 2 | E1-S2: Drizzle Schema Types Update | E1 | P0 | ✅ Done |
| 3 | E3-S1: Cost Snapshot on Order Create | E3 | P0 | ✅ Done |
| 4 | E3-S2: Create P&L Server Service | E3 | P0 | ✅ Done |

**Definition of Done for Sprint 1:**
- [ ] Migration SQL runs on local D1 without error
- [ ] `npm run typecheck` passes with zero new errors
- [ ] New order created with product that has cost_price → `order_items.cost_price_snapshot` is populated
- [ ] New order created with product that has NO cost_price → `cost_price_snapshot = NULL` (no error)
- [ ] `getPLSummary()` returns correct P&L numbers for test data
- [ ] `getProductMargins()` returns correct per-product data
- [ ] KV cache hit/miss works correctly

---

## Sprint 2 — Data Entry UI
**Goal:** Merchants can enter cost prices on products/variants and courier charges on orders.
**Status:** ⬜ Pending Sprint 1

| # | Story | Epic | Priority | Status |
|---|-------|------|----------|--------|
| 5 | E2-S1: Cost Price Field on Product Create & Edit | E2 | P1 | ⬜ Not Started |
| 6 | E2-S2: Variant-Level Cost Override | E2 | P1 | ⬜ Not Started |
| 7 | E2-S3: Products List — Cost Column & Filter | E2 | P1 | ⬜ Not Started |
| 8 | E7-S1: Courier Charge Input on Order Detail | E7 | P2 | ⬜ Not Started |
| 9 | E7-S2: Courier Charge on Orders List | E7 | P2 | ⬜ Not Started |

**Definition of Done for Sprint 2:**
- [ ] Merchant can enter ৳280 cost on a product and save it
- [ ] Variant XL can have ৳240 cost, variant S has ৳200 — both saved correctly
- [ ] Products list shows "—" for products with no cost, value for products with cost
- [ ] "Missing cost price" filter shows only products with NULL cost_price
- [ ] Live margin % shown correctly: (650-280)/650 = 56.9%
- [ ] Warning shown when cost > selling price
- [ ] Merchant can enter ৳75 courier charge on order detail, saves as 7500 paisa
- [ ] Orders list shows courier charge column

---

## Sprint 3 — Reports & Dashboard
**Goal:** Full P&L visibility. Reports tab complete, dashboard cards working, CSV exports functional.
**Status:** ⬜ Pending Sprint 2

| # | Story | Epic | Priority | Status |
|---|-------|------|----------|--------|
| 10 | E4-S1: P&L Tab — Date Picker & Loader | E4 | P1 | ⬜ Not Started |
| 11 | E4-S2: P&L Waterfall Summary Cards | E4 | P1 | ⬜ Not Started |
| 12 | E4-S3: Return Impact Card | E4 | P1 | ⬜ Not Started |
| 13 | E4-S4: P&L CSV Export | E4 | P1 | ⬜ Not Started |
| 14 | E5-S1: Product Margin Table UI | E5 | P1 | ⬜ Not Started |
| 15 | E5-S2: Product Margin Table CSV Export | E5 | P1 | ⬜ Not Started |
| 16 | E6-S1: Gross Profit & Net Profit Dashboard Cards | E6 | P2 | ⬜ Not Started |
| 17 | E6-S2: Dashboard P&L Empty State & Onboarding | E6 | P2 | ⬜ Not Started |

**Definition of Done for Sprint 3:**
- [ ] P&L tab appears in /app/reports with date picker
- [ ] Waterfall cards show correct: Revenue, COGS, Gross Profit, Net Profit
- [ ] Period comparison shows ↑/↓ % vs previous period
- [ ] Warning shown when products have no cost_price (cogsCompleteness < 100%)
- [ ] Return Impact card shows correct return count, COGS loss, courier loss, return rate %
- [ ] P&L CSV export downloads with correct data
- [ ] Product Margin Table sortable by all columns, paginated 20/page
- [ ] Product Margin Table CSV exports all pages
- [ ] Dashboard shows 2 P&L cards (Gross Profit + Net Profit) for current month
- [ ] Dashboard empty state shown when no cost prices set
- [ ] All mobile responsive (320px+)
- [ ] KV cache working (P&L summary cached 5 min)

---

## Key Files Reference

| File | Sprint | Action |
|------|--------|--------|
| `packages/database/src/migrations/XXXX_add_pl_tracking_fields.sql` | S1 | CREATE |
| `packages/database/src/schema.ts` | S1 | MODIFY |
| `apps/web/app/services/pl-report.server.ts` | S1 | CREATE |
| `apps/web/app/routes/api.create-order.ts` | S1 | MODIFY |
| `apps/web/app/routes/app.products.new.tsx` | S2 | MODIFY |
| `apps/web/app/routes/app.products.$id.tsx` | S2 | MODIFY |
| `apps/web/app/routes/app.products._index.tsx` | S2 | MODIFY |
| `apps/web/app/components/VariantManager.tsx` | S2 | MODIFY |
| `apps/web/app/routes/app.orders.$id.tsx` | S2 | MODIFY |
| `apps/web/app/routes/app.orders._index.tsx` | S2 | MODIFY |
| `apps/web/app/routes/app.reports.tsx` | S3 | MODIFY |
| `apps/web/app/routes/app.dashboard.tsx` | S3 | MODIFY |
| `apps/web/app/components/dashboard/PLSummaryCards.tsx` | S3 | CREATE |
| `apps/web/app/components/dashboard/ReturnImpactCard.tsx` | S3 | CREATE |
| `apps/web/app/components/dashboard/ProductMarginTable.tsx` | S3 | CREATE |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| D1 ALTER TABLE fails on production | Low | High | Test on staging first; use wrangler d1 execute |
| Cost snapshot missing from legacy orders | Certain | Low | Already handled — NULL default, excluded from COGS |
| P&L query timeout for large stores | Medium | Medium | KV cache + pagination prevents full table scans |
| `api.create-order.ts` regression | Medium | High | Write unit test for cost resolution before modifying |
| Courier charge paisa/BDT conversion bug | Medium | Medium | Clear conversion util function, unit tested |

---

## Next Action

**Start with Story E1-S1** → DB Migration.

Tell me: `DS E1-S1` to begin implementing the first story.

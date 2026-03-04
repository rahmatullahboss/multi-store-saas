---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: epics-and-stories
project_name: Multi Store SaaS — P&L Tracking
date: 2026-03-03
---

# Epics & Stories
## Feature: Profit & Loss (P&L) Tracking System

**Project:** Multi Store SaaS (Ozzyl)
**Date:** 2026-03-03
**Status:** ✅ Complete — Ready for Sprint Planning

---

## Epic Overview

| Epic | Title | Priority | Stories | Dependencies |
|------|-------|----------|---------|--------------|
| E1 | Schema Migration & DB Setup | P0 — Critical | 2 | None — must be first |
| E2 | Cost Price UI on Products | P1 — High | 3 | E1 |
| E3 | Cost Snapshot on Order Creation | P0 — Critical | 2 | E1 |
| E4 | P&L Report Tab | P1 — High | 4 | E1, E3 |
| E5 | Product Margin Table | P1 — High | 2 | E1, E3 |
| E6 | Dashboard P&L KPI Cards | P2 — Medium | 2 | E1, E3 |
| E7 | Courier Charge Tracking | P2 — Medium | 2 | E1 |

**Implementation Order:** E1 → E3 → E2 → E4 → E5 → E6 → E7

---

## E1: Schema Migration & DB Setup

**Goal:** Add all required DB columns and create migration. This unblocks all other epics.

**Acceptance Criteria (Epic Level):**
- All 4 new columns exist in D1 schema
- Migration runs cleanly on local and production
- Drizzle ORM types are updated and TypeScript compiles
- No existing data broken (NULL defaults on all new columns)

---

### Story E1-S1: DB Migration — Add P&L Columns

**As a** developer,
**I want** to add `cost_price`, `cost_price_snapshot`, and `courier_charge` columns to the database,
**So that** the system can store and calculate P&L data.

**Acceptance Criteria:**
- [ ] `products.cost_price REAL` added (DEFAULT NULL)
- [ ] `product_variants.cost_price REAL` added (DEFAULT NULL)
- [ ] `order_items.cost_price_snapshot REAL` added (DEFAULT NULL)
- [ ] `orders.courier_charge INTEGER NOT NULL DEFAULT 0` added
- [ ] Migration file created at `packages/database/src/migrations/XXXX_add_pl_tracking_fields.sql`
- [ ] Migration runs via `npm run db:migrate:local` without error
- [ ] All existing rows unaffected (NULL / 0 defaults verified)

**Technical Notes:**
```sql
ALTER TABLE products ADD COLUMN cost_price REAL;
ALTER TABLE product_variants ADD COLUMN cost_price REAL;
ALTER TABLE order_items ADD COLUMN cost_price_snapshot REAL;
ALTER TABLE orders ADD COLUMN courier_charge INTEGER NOT NULL DEFAULT 0;
```

**Files to create/modify:**
- `packages/database/src/migrations/XXXX_add_pl_tracking_fields.sql` ← create
- `packages/database/src/schema.ts` ← add columns to Drizzle table definitions

---

### Story E1-S2: Drizzle Schema Types Update

**As a** developer,
**I want** the Drizzle ORM schema to reflect the new columns with proper TypeScript types,
**So that** all queries are type-safe and autocomplete works.

**Acceptance Criteria:**
- [ ] `products` table definition includes `costPrice: real('cost_price')`
- [ ] `product_variants` table definition includes `costPrice: real('cost_price')`
- [ ] `order_items` table definition includes `costPriceSnapshot: real('cost_price_snapshot')`
- [ ] `orders` table definition includes `courierCharge: integer('courier_charge').default(0)`
- [ ] `npm run typecheck` passes with zero new errors
- [ ] Drizzle Studio shows new columns when running `npm run db:studio`

**Files to modify:**
- `packages/database/src/schema.ts`

---

## E2: Cost Price UI on Products

**Goal:** Merchants can enter cost price per product and per variant, with live margin preview.

**Acceptance Criteria (Epic Level):**
- Cost price field visible on product create and edit pages
- Variant-level cost override works correctly
- Live margin % shown inline
- Warning shown if cost > selling price

---

### Story E2-S1: Cost Price Field on Product Create & Edit

**As a** merchant,
**I want** to enter a cost price when creating or editing a product,
**So that** the system can calculate my profit margin.

**Acceptance Criteria:**
- [ ] "Cost Price (৳)" field added below "Selling Price" on `/app/products/new`
- [ ] "Cost Price (৳)" field added below "Selling Price" on `/app/products/:id`
- [ ] Field is optional — empty = NULL saved to DB
- [ ] Field accepts decimal values (e.g., 28.50)
- [ ] `costPrice` saved via existing product create/update action
- [ ] Field displays saved value correctly on edit page load
- [ ] Label shows: "Cost Price (৳)" with subtitle: "Your purchase/manufacturing cost — never shown to customers"

**Live Margin Preview (same card as price):**
- [ ] When both selling price and cost price are filled: show "Margin: 56.9%" in green text below cost field
- [ ] When cost > selling price: show "⚠️ Negative margin — cost exceeds selling price" in red
- [ ] When only one field filled: no margin shown
- [ ] Margin calculation: `((sellingPrice - costPrice) / sellingPrice * 100).toFixed(1)`

**Files to modify:**
- `apps/web/app/routes/app.products.new.tsx`
- `apps/web/app/routes/app.products.$id.tsx`

---

### Story E2-S2: Variant-Level Cost Override

**As a** merchant with product variants (e.g., sizes, colors),
**I want** to set a different cost price per variant,
**So that** my P&L accurately reflects different sourcing costs per variant.

**Acceptance Criteria:**
- [ ] Each variant row in `VariantManager` shows "Cost Override (৳)" input field
- [ ] Field is optional — empty = NULL (will inherit parent product cost)
- [ ] Below each variant cost field: show "Effective cost: ৳XXX" resolved value (variant ?? product ?? "Not set")
- [ ] Variant cost saved to `product_variants.cost_price` via existing variant save action
- [ ] If product has no cost_price and variant has no cost_price: show "Effective cost: Not set" in gray

**Files to modify:**
- `apps/web/app/components/VariantManager.tsx`
- `apps/web/app/routes/app.products.$id.tsx` (action to save variant cost)

---

### Story E2-S3: Products List — Cost Column & Missing Cost Filter

**As a** merchant,
**I want** to see cost prices in my products list and filter for products missing cost data,
**So that** I can quickly identify and fill in missing cost information.

**Acceptance Criteria:**
- [ ] Products list at `/app/products` shows a "Cost" column with cost price or "—" if not set
- [ ] "—" shown in muted gray color
- [ ] Filter option added: "Missing cost price" — shows only products where `cost_price IS NULL`
- [ ] Filter works with existing search/status filters
- [ ] Column is not sortable (to keep UI simple)

**Files to modify:**
- `apps/web/app/routes/app.products._index.tsx`

---

## E3: Cost Snapshot on Order Creation

**Goal:** Every new order automatically captures the cost price at time of sale — immutable.

**Acceptance Criteria (Epic Level):**
- New orders have `cost_price_snapshot` set on every line item where cost data exists
- NULL stored gracefully when product has no cost
- Existing orders (pre-feature) are unaffected

---

### Story E3-S1: Cost Resolution & Snapshot on Order Create

**As a** system,
**I want** to resolve and store the cost price snapshot for each order item when an order is created,
**So that** historical P&L calculations are accurate even if product costs change later.

**Acceptance Criteria:**
- [ ] In `api.create-order.ts`, for each order item: resolve cost price using cascade:
  - If variant exists → fetch `product_variants.cost_price`
  - If variant cost is NULL → fetch `products.cost_price`
  - If both NULL → store NULL
- [ ] `cost_price_snapshot` inserted into `order_items` row at order creation time
- [ ] Resolution happens inside existing D1 batch transaction (atomic with order item insert)
- [ ] No separate API call needed — product/variant fetched in same batch as order creation
- [ ] Verified: changing product cost after order creation does NOT change existing `cost_price_snapshot`

**Implementation pattern:**
```typescript
// In api.create-order.ts — per line item
const variantCost = variantId
  ? (await db.select({ cost: productVariants.costPrice })
      .from(productVariants).where(eq(productVariants.id, variantId)).get())?.cost
  : null;

const productCost = await db.select({ cost: products.costPrice })
  .from(products).where(eq(products.id, productId)).get();

const costSnapshot = variantCost ?? productCost?.cost ?? null;
// Insert into order_items.cost_price_snapshot = costSnapshot
```

**Files to modify:**
- `apps/web/app/routes/api.create-order.ts`

---

### Story E3-S2: Create P&L Server Service

**As a** developer,
**I want** a reusable server-side service for P&L calculations,
**So that** both the reports tab and dashboard cards share the same query logic.

**Acceptance Criteria:**
- [ ] New file `apps/web/app/services/pl-report.server.ts` created
- [ ] `getPLSummary(db, storeId, env, periodStart, periodEnd)` function exported:
  - Returns: `{ grossRevenue, ordersCount, totalCOGS, courierCost, grossProfit, grossMargin, netProfit, netMargin, returnedCount, returnCOGSLoss, returnCourierLoss, cogsCompleteness }`
  - Uses D1 batch API for two queries (delivered + returned)
  - Checks KV cache first with key `pl:summary:{storeId}:{periodKey}`
  - Caches result for 300 seconds
- [ ] `getProductMargins(db, storeId, periodStart, periodEnd, page, limit)` function exported:
  - Returns paginated product margin data
  - Columns: productId, name, unitsSold, revenue, cogs, grossProfit, marginPct
  - Sorted by grossProfit DESC by default
  - NOT cached (user-driven, real-time)
- [ ] All monetary values correctly typed as `number`
- [ ] NULL cost items excluded from margin % (but included in revenue totals)

**Files to create:**
- `apps/web/app/services/pl-report.server.ts`

---

## E4: P&L Report Tab

**Goal:** A dedicated P&L tab on the reports page showing full financial waterfall and analytics.

---

### Story E4-S1: P&L Tab — Date Picker & Loader

**As a** merchant,
**I want** to select a date range for my P&L report,
**So that** I can analyze profitability for any time period.

**Acceptance Criteria:**
- [ ] New "Profit & Loss" tab added to `/app/reports` tab row (last tab, after Tax)
- [ ] Tab is active when `?report=pl` query param set
- [ ] Date range presets: Today | This Week | This Month | Last Month | Custom Range
- [ ] Custom range shows two date pickers (start, end)
- [ ] Loader fetches P&L data via `getPLSummary()` for selected period
- [ ] Loader also fetches "previous period" data for comparison (same duration, previous window)
- [ ] Loading skeleton shown while data fetches

**Files to modify:**
- `apps/web/app/routes/app.reports.tsx`

---

### Story E4-S2: P&L Waterfall Summary Cards

**As a** merchant,
**I want** to see my revenue, COGS, gross profit, and net profit in a clear waterfall layout,
**So that** I can understand where my money goes.

**Acceptance Criteria:**
- [ ] 4 KPI cards displayed: Gross Revenue | COGS | Gross Profit | Net Profit (after courier)
- [ ] Each card shows: value in BDT (৳ formatted), % change vs previous period (↑/↓)
- [ ] Gross Profit card shows margin %: "56.9% margin"
- [ ] Net Profit card shows margin %: "50.2% margin"
- [ ] ↑ green, ↓ red color coding for period comparison
- [ ] Cards responsive: 2×2 grid on mobile, 4×1 on desktop
- [ ] Warning banner: "⚠️ X products have no cost price — COGS may be understated. [Set Cost Prices →]" (shown when `cogsCompleteness < 100%`)
- [ ] COGS completeness badge: "COGS coverage: 78%" shown below warning

**New component:**
- `apps/web/app/components/dashboard/PLSummaryCards.tsx`

---

### Story E4-S3: Return Impact Card

**As a** merchant,
**I want** to see how much my returns cost me this period,
**So that** I can make informed decisions about courier partners and return policies.

**Acceptance Criteria:**
- [ ] "Return Impact" card displayed below waterfall cards
- [ ] Shows: returned order count, COGS lost, courier cost lost, total return loss
- [ ] Return rate % shown: "Return Rate: 8.4%"
- [ ] Color coding: green < 10%, yellow 10–20%, red > 20%
- [ ] If 0 returns in period: card shows "No returns this period 🎉" in green
- [ ] Card title: "🔴 Return Impact" (or 🟢 if no returns)

**New component:**
- `apps/web/app/components/dashboard/ReturnImpactCard.tsx`

---

### Story E4-S4: P&L CSV Export

**As a** merchant,
**I want** to export my P&L summary to CSV,
**So that** I can share it with my accountant or do further analysis.

**Acceptance Criteria:**
- [ ] "Export CSV" button on P&L tab (top right, near date picker)
- [ ] CSV includes: Period, Gross Revenue, COGS, Gross Profit, Gross Margin %, Courier Cost, Net Profit, Net Margin %, Return Count, Return COGS Loss, Return Courier Loss
- [ ] Filename: `pl-report-{storeName}-{periodKey}.csv`
- [ ] Uses existing CSV export pattern from the Sales report tab
- [ ] BDT values exported as plain numbers (no ৳ symbol) for spreadsheet compatibility

**Files to modify:**
- `apps/web/app/routes/app.reports.tsx`

---

## E5: Product Margin Table

**Goal:** Sortable table showing per-product profitability — the most actionable P&L insight.

---

### Story E5-S1: Product Margin Table UI

**As a** merchant,
**I want** to see a table of all my products with their profit margins,
**So that** I can identify my most and least profitable products.

**Acceptance Criteria:**
- [ ] Table displayed below Return Impact card on P&L tab
- [ ] Columns: Product Name | Units Sold | Revenue | COGS | Gross Profit | Margin %
- [ ] Default sort: Gross Profit descending
- [ ] Click column header to sort (ascending/descending toggle)
- [ ] Products with no cost data shown with "—" in COGS/Profit/Margin columns
- [ ] Pagination: 20 rows per page with page controls
- [ ] BDT values formatted with ৳ symbol
- [ ] Margin % color coded: green ≥ 40%, yellow 20–39%, red < 20%
- [ ] Table header sticky on scroll (desktop)
- [ ] Responsive: horizontal scroll on mobile

**New component:**
- `apps/web/app/components/dashboard/ProductMarginTable.tsx`

---

### Story E5-S2: Product Margin Table CSV Export

**As a** merchant,
**I want** to export my product margin table to CSV,
**So that** I can analyze product performance in a spreadsheet.

**Acceptance Criteria:**
- [ ] "Export CSV" button above product margin table
- [ ] CSV includes all columns: Product Name, Units Sold, Revenue (BDT), COGS (BDT), Gross Profit (BDT), Margin %
- [ ] All pages exported (not just current page) — fetches full dataset
- [ ] Filename: `product-margins-{storeName}-{periodKey}.csv`
- [ ] Products with no cost data exported with empty COGS/Profit/Margin cells

**Files to modify:**
- `apps/web/app/routes/app.reports.tsx` (loader action for full CSV export)
- `apps/web/app/components/dashboard/ProductMarginTable.tsx`

---

## E6: Dashboard P&L KPI Cards

**Goal:** Merchants see their P&L at a glance on the main dashboard.

---

### Story E6-S1: Gross Profit & Net Profit Dashboard Cards

**As a** merchant,
**I want** to see my gross profit and net profit on my main dashboard,
**So that** I know my financial health without going to the reports page.

**Acceptance Criteria:**
- [ ] 2 new KPI cards added to `/app/dashboard` — "Gross Profit" and "Net Profit"
- [ ] Cards placed after existing revenue/orders cards
- [ ] Each card shows: BDT amount, margin %, trend vs last month (↑/↓ %)
- [ ] Data fetched in dashboard loader using `getPLSummary()` for current month (uses KV cache)
- [ ] **Empty state:** If no products have cost_price set → show single card: "💡 Track Your Profit — Add cost prices to products to unlock P&L insights" with [Add Cost Prices →] button
- [ ] Mobile: cards stack vertically, full width
- [ ] Uses existing `MetricCard` component

**Files to modify:**
- `apps/web/app/routes/app.dashboard.tsx`

---

### Story E6-S2: Dashboard P&L Empty State & Onboarding

**As a** new merchant,
**I want** to be guided to set up cost prices when I first see the dashboard,
**So that** I understand how to unlock P&L tracking.

**Acceptance Criteria:**
- [ ] When `cogsCompleteness = 0%` (no products have cost): show onboarding prompt card
- [ ] Card copy: "📊 Unlock Profit Tracking — Enter your product cost prices to see real profit numbers"
- [ ] CTA button: "Set Cost Prices" → links to `/app/products`
- [ ] Card shown only once per session (dismissed with X button, stored in localStorage)
- [ ] When some products have cost (partial): show partial P&L cards with "⚠️ Incomplete data" badge

**Files to modify:**
- `apps/web/app/routes/app.dashboard.tsx`

---

## E7: Courier Charge Tracking

**Goal:** Merchants can record what they actually paid couriers per order.

---

### Story E7-S1: Courier Charge Input on Order Detail

**As a** merchant,
**I want** to enter the courier charge I paid for each order,
**So that** my net profit calculation is accurate.

**Acceptance Criteria:**
- [ ] "Courier Charge Paid (৳)" input field added to `/app/orders/:id` Fulfillment section
- [ ] Positioned: below courier status, above tracking number
- [ ] Placeholder: "e.g., 75 (what you paid Pathao/Redx/Steadfast)"
- [ ] Accepts decimal input, stored as integer paisa (× 100) in DB
- [ ] Save button (or auto-save on blur) updates `orders.courier_charge`
- [ ] Displays existing value on page load (converted from paisa: ÷ 100)
- [ ] Validation: must be ≥ 0, max 9999 BDT (= 999900 paisa)
- [ ] Success toast on save: "Courier charge saved"

**Files to modify:**
- `apps/web/app/routes/app.orders.$id.tsx`

---

### Story E7-S2: Courier Charge Display on Orders List

**As a** merchant,
**I want** to see courier charges at a glance in my orders list,
**So that** I can quickly spot orders where I haven't entered the charge yet.

**Acceptance Criteria:**
- [ ] "Courier" column added to orders list at `/app/orders` (optional, can be hidden on mobile)
- [ ] Shows ৳75 if set, "—" if 0/not set
- [ ] "—" in muted color to indicate missing data
- [ ] No filtering by courier charge needed (out of scope for this story)
- [ ] Column not sortable (keep UI simple)

**Files to modify:**
- `apps/web/app/routes/app.orders._index.tsx`

---

## Story Dependency Map

```
E1-S1 (Migration SQL)
  └── E1-S2 (Drizzle Types)
        ├── E2-S1 (Cost Price on Products)
        ├── E2-S2 (Variant Cost Override)
        ├── E2-S3 (Products List Cost Column)
        ├── E3-S1 (Snapshot on Order Create)
        │     └── E3-S2 (PL Report Service)
        │           ├── E4-S1 (PL Tab Date Picker)
        │           │     ├── E4-S2 (Waterfall Cards)
        │           │     ├── E4-S3 (Return Impact Card)
        │           │     └── E4-S4 (PL CSV Export)
        │           ├── E5-S1 (Product Margin Table)
        │           │     └── E5-S2 (Margin Table CSV)
        │           └── E6-S1 (Dashboard PL Cards)
        │                 └── E6-S2 (Dashboard Empty State)
        └── E7-S1 (Courier Charge Input)
              └── E7-S2 (Courier on Orders List)
```

---

## Sprint Recommendations

### Sprint 1 — Foundation (E1 + E3)
- E1-S1: DB Migration
- E1-S2: Drizzle Types
- E3-S1: Cost Snapshot on Order Create
- E3-S2: PL Report Service
- **Goal:** All backend infrastructure ready. P&L queries work. Tests pass.

### Sprint 2 — Data Entry (E2 + E7)
- E2-S1: Cost Price on Products
- E2-S2: Variant Cost Override
- E2-S3: Products List Cost Column
- E7-S1: Courier Charge Input on Order Detail
- E7-S2: Courier on Orders List
- **Goal:** Merchants can enter all cost data.

### Sprint 3 — Reports & Dashboard (E4 + E5 + E6)
- E4-S1: P&L Tab Date Picker
- E4-S2: Waterfall Summary Cards
- E4-S3: Return Impact Card
- E4-S4: P&L CSV Export
- E5-S1: Product Margin Table
- E5-S2: Margin Table CSV
- E6-S1: Dashboard P&L Cards
- E6-S2: Dashboard Empty State
- **Goal:** Full P&L visibility for merchants.

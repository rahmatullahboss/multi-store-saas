---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-02-25.md
  - _bmad-output/brainstorming/brainstorming-session-2026-02-24.md
  - gap-analysis (conversation context — 2026-03-03)
  - research-report (P&L best practices — Shopify, WooCommerce, BeProfit, BD market)
workflowType: prd
classification:
  projectType: feature-addition-to-saas
  domain: ecommerce-fintech-reporting
  complexity: medium-high
  projectContext: brownfield
documentCounts:
  briefs: 0
  research: 1
  brainstorming: 2
  projectDocs: 1
---

# Product Requirements Document
## Feature: Profit & Loss (P&L) Tracking System

**Project:** Multi Store SaaS (Ozzyl)
**Author:** Boss
**Date:** 2026-03-03
**Status:** ✅ Complete — Ready for Architecture
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas & Journeys](#4-user-personas--journeys)
5. [Domain & Technical Context](#5-domain--technical-context)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Out of Scope](#8-out-of-scope)
9. [Phased Implementation Plan](#9-phased-implementation-plan)
10. [Data Model Changes](#10-data-model-changes)

---

## 1. Executive Summary

Ozzyl merchants currently have no way to know their **actual profit**. They can see revenue (via `/app/reports`) but have no concept of Cost of Goods Sold (COGS), net profit, or per-product margins. This is a critical gap for Bangladesh e-commerce merchants who operate in a COD-heavy (85–90% of orders), high-return-rate (15–35%) environment where tracking real profitability is the difference between a growing business and an unknowingly loss-making one.

This PRD defines a **Profit & Loss Tracking System** — a phased feature that adds cost price tracking at the product/variant level, captures cost snapshots on order items at time of sale, and surfaces actionable P&L insights through a new reports dashboard tab and KPI cards.

The system is inspired by best-in-class implementations from **Shopify Analytics**, **BeProfit**, and **WooCommerce Cost of Goods** — adapted specifically for Bangladesh SME reality (COD-only revenue recognition, courier return loss calculation, BDT currency).

---

## 2. Problem Statement

### Current State
- Merchants can see **total revenue** on the reports page
- Merchants can see **order counts** and **customer data**
- There is **no cost price field** anywhere in the product schema
- There is **no COGS calculation** in any report
- There is **no profit/loss figure** anywhere in the admin
- The `orders.shipping` field stores what the customer paid — **not what the merchant paid the courier** — making real cost calculation impossible

### Business Impact of the Gap
1. **Merchants are flying blind** — a product priced at ৳500 with a ৳450 sourcing cost + ৳80 courier is losing ৳30 per sale
2. **Returns are invisible losses** — in BD, a returned COD order loses: COGS + outbound courier + return courier + COD fee (~৳90–125 on a ৳1,000 order)
3. **No product-level decisions** — merchants cannot identify which products are profitable vs loss-making
4. **Competitor SaaS platforms** (local BD competitors) are starting to offer this — it's becoming table stakes

### Root Cause
The Ozzyl database schema has no `cost_price` field on `products` or `product_variants`, no `cost_price_snapshot` on `order_items`, and no `courier_charge` (merchant-paid) field on `orders`.

---

## 3. Goals & Success Metrics

### Goals
1. Allow merchants to enter cost price per product (and per variant)
2. Automatically snapshot cost price on every order item at time of sale
3. Surface a P&L report showing: Revenue → COGS → Gross Profit → Net Profit
4. Show return impact (courier loss + COGS loss) separately
5. Show per-product profit margins in a sortable table
6. Show P&L KPI cards on the main dashboard

### Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| % of active stores with ≥1 product having cost_price set | >60% | 60 days post-launch |
| Average time to enter cost prices for 10 products | <3 minutes | UX target |
| P&L report page views per merchant per month | >8 sessions | Engagement target |
| Support tickets about "profit" confusion | -80% vs baseline | 90 days |
| Merchant retention (stores with P&L set vs without) | +15% | 90 days |

---

## 4. User Personas & Journeys

### Persona 1: Karim — Solo COD Merchant (Primary)
- Runs a clothing store on Ozzyl, 50–200 orders/month
- Sources products from Gausia Market, Dhaka
- 80% COD, ~20% return rate
- Checks admin on phone mostly, desktop occasionally
- Pain: "I sell ৳80,000/month but I don't know if I'm actually making money"

**Journey:**
1. Opens product page → sees new "Cost Price" field → enters ৳280 for a shirt that sells at ৳650
2. Next order comes in → system auto-saves cost snapshot on order item
3. Opens Reports → P&L tab → sees: Revenue ৳65,000 | COGS ৳28,000 | Gross Profit ৳37,000 | After courier ৳31,000
4. Sees "Return Impact: ৳4,200 lost this month" card → realizes 20% return rate is hurting badly
5. Clicks product margin table → sees Product A has 58% margin, Product B has only 8% → decides to stop promoting Product B

### Persona 2: Fatema — Growing Multi-Product Store (Secondary)
- 300–500 orders/month, 15 products with multiple variants (sizes, colors)
- Different sourcing cost per variant (L/XL costs more fabric)
- Pain: "I have 3 colors of the same shirt — red costs me ৳200, black costs ৳230 but I sell all at ৳550"

**Journey:**
1. Opens product → enters default cost ৳200 → clicks variant override → sets Black variant cost to ৳230
2. P&L report correctly uses variant cost at order time
3. Per-product report shows blended margin — she discovers black products are 6% less profitable
4. Adjusts black product price to ৳580 to normalize margin

### Persona 3: Rahim — Store Owner with Staff (Tertiary)
- 500+ orders/month, has a manager who does fulfillment
- Wants to track ad spend vs profit to know ROAS
- Phase 2 user — will use expense tracking when it launches

---

## 5. Domain & Technical Context

### Stack Context (Brownfield)
- **Runtime:** Cloudflare Pages + Workers (edge)
- **Database:** D1 (SQLite) via Drizzle ORM
- **Framework:** Remix v2 SSR
- **Auth:** Multi-tenant — every query **must** be scoped by `store_id`
- **Existing relevant routes:** `app.reports.tsx`, `app.products.$id.tsx`, `app.products.new.tsx`, `app.dashboard.tsx`
- **Existing relevant schema tables:** `products`, `product_variants`, `order_items`, `orders`, `stores`

### Critical Domain Rules
1. **COD Revenue Recognition:** Only `status = 'delivered'` orders count as real revenue. Pending/shipped/processing orders are NOT revenue yet — they may be returned.
2. **Cost Snapshot is immutable:** Once an order is placed, `order_items.cost_price_snapshot` must never be updated even if the product cost changes later (same as Shopify's approach).
3. **Courier Charge ≠ Shipping Revenue:** `orders.shipping` is what the customer paid. `orders.courier_charge` (new field) is what the merchant paid the courier. They are different and currently conflated.
4. **Return Loss Formula (BD-specific):**
   ```
   Return Loss = COGS of items + outbound_courier_charge + return_courier_charge
   (where return_courier_charge ≈ outbound × 0.5 as estimate if not tracked separately)
   ```
5. **Multi-tenancy:** Every new table and query must filter by `store_id`. No exceptions.

### Existing Schema Gaps (to be filled)
| Gap | Location | Fix |
|-----|----------|-----|
| No cost price | `products` table | Add `cost_price REAL` |
| No variant cost override | `product_variants` table | Add `cost_price REAL` |
| No cost snapshot | `order_items` table | Add `cost_price_snapshot REAL` |
| No merchant courier cost | `orders` table | Add `courier_charge INTEGER` (paisa) |
| No expense tracking | (no table) | New `store_expenses` table |

---

## 6. Functional Requirements

### FR-1: Cost Price Entry on Products

**FR-1.1** — The product create form (`/app/products/new`) MUST include an optional "Cost Price (৳)" field below the selling price.

**FR-1.2** — The product edit form (`/app/products/:id`) MUST display and allow editing of `cost_price`.

**FR-1.3** — Cost price field MUST show margin % dynamically:
```
Selling Price: ৳650  |  Cost Price: ৳280  →  Margin: 56.9%  (shown inline)
```

**FR-1.4** — Cost price is optional. Products without a cost price are excluded from COGS calculations (shown as "incomplete" in P&L).

**FR-1.5** — Cost price MUST accept decimal values (e.g., ৳28.50) and be stored as `REAL` in D1.

### FR-2: Variant-Level Cost Override

**FR-2.1** — On product edit page, each variant row in the variant manager MUST show an optional "Cost Override (৳)" field.

**FR-2.2** — If a variant has `cost_price` set → use variant cost. If NULL → inherit parent product `cost_price`.

**FR-2.3** — Resolved cost (variant ?? product) MUST be shown in variant row: "Effective cost: ৳280"

### FR-3: Cost Snapshot on Order Creation

**FR-3.1** — When an order is created (via `api.create-order.ts`), for each order item the system MUST resolve and store `cost_price_snapshot`:
```
cost_price_snapshot = variant.cost_price ?? product.cost_price ?? NULL
```

**FR-3.2** — `cost_price_snapshot` is written once and NEVER updated thereafter, even if product cost changes.

**FR-3.3** — If cost price is NULL (not set), `cost_price_snapshot` is stored as NULL — this order item will be excluded from COGS.

### FR-4: Courier Charge Tracking

**FR-4.1** — Add `courier_charge` field (integer, paisa) to the `orders` table.

**FR-4.2** — On the order detail page (`/app/orders/:id`), merchants MUST be able to enter/edit the courier charge they paid.

**FR-4.3** — Courier charge input should appear in the "Fulfillment" section of order detail, not the payment section.

**FR-4.4** — Default value: `0` (not required). Show placeholder: "e.g., 75 (what you paid Pathao/Redx)"

**FR-4.5** — When courier API integration is active (Pathao/Redx/Steadfast), courier charge SHOULD be auto-populated from the courier API response when a consignment is created.

### FR-5: P&L Report Tab

**FR-5.1** — Add a "Profit & Loss" tab to the existing `/app/reports` page.

**FR-5.2** — The P&L tab MUST include a date range picker: Today | This Week | This Month | Last Month | Custom Range.

**FR-5.3** — The P&L summary section MUST show the following waterfall metrics in order:

```
Gross Revenue          ৳XX,XXX   (delivered orders only)
  ↳ Orders Count       XX orders
Returns Impact        -৳X,XXX    (returned orders)
  ↳ COGS Lost          ৳X,XXX
  ↳ Courier Lost       ৳X,XXX
Net Revenue            ৳XX,XXX
Cost of Goods (COGS)  -৳XX,XXX   (sum of cost_price_snapshot × qty, delivered only)
──────────────────────────────
Gross Profit           ৳XX,XXX   (XX% margin)
Courier Charges       -৳X,XXX    (sum of courier_charge, delivered orders)
──────────────────────────────
Net Profit             ৳XX,XXX   (XX% margin)
```

**FR-5.4** — A warning banner MUST show if any products have no cost price set:
"⚠️ X products have no cost price — COGS may be understated. [Set Cost Prices →]"

**FR-5.5** — Period comparison MUST show: "vs last period: ↑৳X,XXX (+12%)" next to each key metric.

**FR-5.6** — The P&L tab MUST include a **Product Margin Table** with columns:
- Product Name
- Units Sold
- Revenue
- COGS
- Gross Profit
- Margin %
- Sortable by any column
- Paginated (20 per page)

**FR-5.7** — CSV export button MUST be available for the product margin table.

**FR-5.8** — Return Rate KPI: Show "Return Rate: X%" with color coding (green <10%, yellow 10-20%, red >20%).

### FR-6: Dashboard P&L Summary Cards

**FR-6.1** — Add 2 new KPI cards to the main dashboard (`/app/dashboard`):
1. **Gross Profit** (this month) — with margin %
2. **Net Profit** (this month, after courier) — with trend vs last month

**FR-6.2** — Cards MUST show "Set cost prices to unlock" state if no products have cost prices set — with a CTA link to `/app/products`.

**FR-6.3** — Cards MUST only count `status = 'delivered'` orders (COD revenue recognition rule).

### FR-7: Incomplete Data Indicators

**FR-7.1** — On `/app/products/_index`, add a "Cost" column showing cost price or "—" if not set.

**FR-7.2** — Products list MUST support filtering: "Missing cost price" to let merchants bulk-fill costs.

**FR-7.3** — On `/app/reports` P&L tab, show a completeness badge: "COGS coverage: 78% of revenue has cost data"

---

## 7. Non-Functional Requirements

### NFR-1: Performance
- P&L report query MUST complete in <500ms for stores with up to 10,000 orders
- Use D1 Sessions API with `first-unconstrained` for read-heavy P&L queries
- Product margin table query MUST be paginated — never fetch all rows at once
- KV cache P&L summary for 5 minutes (invalidate on new delivered order)

### NFR-2: Multi-Tenancy Security
- Every DB query MUST include `WHERE store_id = ?` — no exceptions
- Cost price data is merchant-confidential — never exposed in storefront APIs
- `cost_price_snapshot` on `order_items` MUST NOT be returned in public-facing `api.v1.orders` endpoints

### NFR-3: Data Integrity
- `cost_price_snapshot` is write-once — no UPDATE permitted after creation
- DB migration MUST use `ALTER TABLE ... ADD COLUMN` with `DEFAULT NULL` to avoid breaking existing rows
- All monetary values stored as `REAL` (BDT, decimal) — NOT paisa integers for simplicity (courier_charge exception: integer paisa)

### NFR-4: Backward Compatibility
- All existing orders (before this feature) will have `cost_price_snapshot = NULL` — they MUST be gracefully excluded from COGS, not cause errors
- Reports must handle NULL cost prices gracefully: `COALESCE(cost_price_snapshot, 0)` only for counting, not for margin % calculation

### NFR-5: Accessibility & Mobile
- P&L report page MUST be usable on mobile (320px+ width)
- KPI cards on dashboard MUST stack vertically on mobile
- All monetary amounts display with ৳ symbol and comma formatting (৳1,23,456 BD format)

### NFR-6: Cloudflare Edge Constraints
- No long-running computations — P&L aggregation must complete within Cloudflare Worker 30s CPU limit
- For large stores (>50k orders), use date-range chunking and pagination
- Drizzle ORM batch API for any multi-table writes (e.g., saving cost snapshots for order items)

---

## 8. Out of Scope (for this PRD)

The following are explicitly NOT in scope for Phase 1:

| Feature | Rationale | Future Phase |
|---------|-----------|--------------|
| Ad spend / expense tracking (`store_expenses` table) | Complex, Phase 2 | Phase 2 |
| Facebook/Google Ads API auto-sync | External API complexity | Phase 3 |
| Inventory valuation (FIFO/weighted avg) | Accounting complexity | Phase 3 |
| Tax calculation on profit | Regulatory complexity | Phase 3 |
| Net profit (after ad spend) | Needs expense table | Phase 2 |
| Courier charge auto-sync from Pathao/Redx APIs | API integration work | Phase 2 |
| Bulk CSV import of cost prices | Nice-to-have | Phase 2 |
| Profit alerts / notifications | Nice-to-have | Phase 2 |

---

## 9. Phased Implementation Plan

### Phase 1 — MVP (This PRD)
**Goal:** Give merchants their first real profit number.

| Epic | Stories | Effort |
|------|---------|--------|
| E1: Schema Migration | Add cost_price to products/variants, cost_price_snapshot to order_items, courier_charge to orders | S |
| E2: Cost Price UI | Cost field on product create/edit, variant override, margin % preview | M |
| E3: Order Snapshot | Auto-capture cost_price_snapshot on order creation | S |
| E4: P&L Report Tab | Waterfall summary, date picker, comparison, missing data warning | L |
| E5: Product Margin Table | Sortable table, CSV export | M |
| E6: Dashboard Cards | Gross Profit + Net Profit KPI cards | S |
| E7: Courier Charge UI | Input on order detail page | S |

**Estimated Total:** 2–3 sprints (4–6 weeks with 1 developer)

### Phase 2 — Growth (Future PRD)
- `store_expenses` table + manual expense entry UI
- Net Profit = Gross Profit − Expenses
- Courier charge auto-sync from Pathao/Steadfast/Redx APIs
- Monthly P&L comparison chart
- Bulk cost price import via CSV

### Phase 3 — Advanced (Future PRD)
- Facebook Ads API cost sync
- Per-campaign ROAS tracking
- Inventory valuation (FIFO)
- Accountant export (Excel with full P&L statement)

---

## 10. Data Model Changes

### 10.1 Schema Changes (Drizzle ORM)

```typescript
// ── packages/database/src/schema.ts changes ──

// 1. products table — add:
costPrice: real('cost_price'),  // Purchase/manufacturing cost in BDT. Optional.

// 2. product_variants table — add:
costPrice: real('cost_price'),  // Override product cost per variant. NULL = inherit from product.

// 3. order_items table — add:
costPriceSnapshot: real('cost_price_snapshot'),  // Resolved cost at order time. Write-once.

// 4. orders table — add:
courierCharge: integer('courier_charge').default(0),  // What merchant paid courier, in paisa (BDT×100)
```

### 10.2 SQL Migration

```sql
-- Migration: add_pl_tracking_fields
ALTER TABLE products ADD COLUMN cost_price REAL;
ALTER TABLE product_variants ADD COLUMN cost_price REAL;
ALTER TABLE order_items ADD COLUMN cost_price_snapshot REAL;
ALTER TABLE orders ADD COLUMN courier_charge INTEGER NOT NULL DEFAULT 0;
```

### 10.3 P&L Query (Reference Implementation)

```typescript
// Delivered orders P&L summary
const plSummary = await db
  .select({
    grossRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
    ordersCount: sql<number>`COUNT(${orders.id})`,
    totalCOGS: sql<number>`COALESCE(SUM(${orderItems.costPriceSnapshot} * ${orderItems.quantity}), 0)`,
    courierCost: sql<number>`COALESCE(SUM(${orders.courierCharge}), 0) / 100.0`,
  })
  .from(orders)
  .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orders.storeId, storeId),
    eq(orders.status, 'delivered'),
    gte(orders.createdAt, periodStart),
    lte(orders.createdAt, periodEnd)
  ));

// Return impact query
const returnImpact = await db
  .select({
    returnedOrdersCount: sql<number>`COUNT(${orders.id})`,
    returnCOGSLoss: sql<number>`COALESCE(SUM(${orderItems.costPriceSnapshot} * ${orderItems.quantity}), 0)`,
    returnCourierLoss: sql<number>`COALESCE(SUM(${orders.courierCharge}), 0) / 100.0`,
  })
  .from(orders)
  .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orders.storeId, storeId),
    eq(orders.status, 'returned'),
    gte(orders.createdAt, periodStart),
    lte(orders.createdAt, periodEnd)
  ));

// Derived values
const grossProfit = plSummary.grossRevenue - plSummary.totalCOGS;
const grossMargin = plSummary.grossRevenue > 0
  ? (grossProfit / plSummary.grossRevenue) * 100
  : 0;
const netProfit = grossProfit - plSummary.courierCost;
const netMargin = plSummary.grossRevenue > 0
  ? (netProfit / plSummary.grossRevenue) * 100
  : 0;
```

### 10.4 Cost Snapshot Resolution (on order creation)

```typescript
// In api.create-order.ts — for each order item:
async function resolveCostPrice(
  db: DrizzleD1Database,
  productId: number,
  variantId: number | null
): Promise<number | null> {
  if (variantId) {
    const variant = await db
      .select({ costPrice: productVariants.costPrice })
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .get();
    if (variant?.costPrice != null) return variant.costPrice;
  }
  const product = await db
    .select({ costPrice: products.costPrice })
    .from(products)
    .where(eq(products.id, productId))
    .get();
  return product?.costPrice ?? null;
}
```

---

## Appendix: UI Wireframe (Text)

### P&L Report Tab Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Reports                                                          │
│ [Sales] [Inventory] [Customers] [Tax] [Profit & Loss ●]         │
├─────────────────────────────────────────────────────────────────┤
│ 📅 This Month ▾   [Jan 1 — Jan 31]   vs Last Month ▾           │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️ 3 products have no cost price — COGS understated [Fix →]     │
├────────────────┬────────────────┬────────────────┬──────────────┤
│ 💰 Gross Rev   │ 📦 COGS        │ 📊 Gross Profit│ 🚚 Courier   │
│ ৳65,200        │ ৳28,400        │ ৳36,800 (56%) │ ৳4,200       │
│ ↑12% vs last  │ ↑8% vs last   │ ↑15% vs last  │              │
├────────────────┴────────────────┴────────────────┴──────────────┤
│                      ✅ NET PROFIT                               │
│                      ৳32,600  (50% margin)                      │
│                      ↑18% vs last month                         │
├─────────────────────────────────────────────────────────────────┤
│ 🔴 Return Impact This Month                                      │
│ 12 returned orders  |  COGS Lost: ৳3,200  |  Courier: ৳960     │
│ Return Rate: 8.4%  (🟢 Good — industry avg is 15-20%)           │
├─────────────────────────────────────────────────────────────────┤
│ Product Margin Table                        [↓ Export CSV]       │
│ ─────────────────────────────────────────────────────────────── │
│ Product Name       Units  Revenue  COGS    Profit  Margin  Sort│
│ Classic White Shirt  42   ৳27,300  ৳11,760 ৳15,540  57%   ↓  │
│ Black Oversized Tee  28   ৳19,600  ৳9,800  ৳9,800   50%      │
│ Cargo Pants          15   ৳18,300  ৳12,750 ৳5,550   30%      │
│ [1] [2] [3] ...                                 20 per page     │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard P&L Cards (new)

```
┌──────────────────────┐  ┌──────────────────────┐
│ 📊 Gross Profit      │  │ ✅ Net Profit         │
│ ৳36,800              │  │ ৳32,600              │
│ 56% margin           │  │ 50% margin           │
│ ↑15% vs last month   │  │ ↑18% vs last month   │
└──────────────────────┘  └──────────────────────┘
```

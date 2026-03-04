---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
workflowType: architecture
project_name: Multi Store SaaS
user_name: Boss
date: 2026-03-03
---

# Architecture Decision Document
## Feature: Profit & Loss (P&L) Tracking System

**Project:** Multi Store SaaS (Ozzyl)
**Author:** Boss
**Date:** 2026-03-03
**Status:** ✅ Complete — Ready for Epics & Stories

---

## 1. Project Context Analysis

### Project Classification
- **Type:** Brownfield feature addition to existing multi-tenant SaaS
- **Domain:** E-commerce financial reporting (fintech-adjacent)
- **Complexity:** Medium-High
- **Stack:** Cloudflare Pages + Workers, Remix v2, D1 (SQLite), Drizzle ORM, KV, Tailwind CSS

### Requirements Summary (from PRD)
| Category | Count | Description |
|----------|-------|-------------|
| FR-1 | 5 stories | Cost price entry on products |
| FR-2 | 3 stories | Variant-level cost override |
| FR-3 | 3 stories | Cost snapshot on order creation |
| FR-4 | 5 stories | Courier charge tracking |
| FR-5 | 8 stories | P&L report tab |
| FR-6 | 3 stories | Dashboard KPI cards |
| FR-7 | 3 stories | Incomplete data indicators |
| **Total** | **30** | **7 epics** |

### Key Architectural Constraints
1. **Multi-tenancy is non-negotiable** — every query must filter by `store_id`
2. **COD Revenue Recognition** — only `status = 'delivered'` orders = revenue
3. **Cost snapshot is immutable** — write-once, never updated
4. **Cloudflare edge runtime** — no long-running processes, 30s CPU limit
5. **D1 SQLite** — no stored procedures, no triggers, application-level logic only
6. **Brownfield** — must not break existing order creation, product edit, reports flows

---

## 2. Architectural Decisions

### AD-1: Database Migration Strategy

**Decision:** Use `ALTER TABLE ... ADD COLUMN` with `DEFAULT NULL` for all new columns.

**Rationale:**
- D1 SQLite supports `ALTER TABLE ADD COLUMN` safely
- `DEFAULT NULL` ensures all existing rows are unaffected (no backfill needed)
- Existing orders get `cost_price_snapshot = NULL` → excluded from COGS gracefully
- No downtime required — additive-only migration

**Migration file location:** `packages/database/src/migrations/`

**SQL:**
```sql
-- Migration: 0XXX_add_pl_tracking_fields.sql
ALTER TABLE products ADD COLUMN cost_price REAL;
ALTER TABLE product_variants ADD COLUMN cost_price REAL;
ALTER TABLE order_items ADD COLUMN cost_price_snapshot REAL;
ALTER TABLE orders ADD COLUMN courier_charge INTEGER NOT NULL DEFAULT 0;
```

**Anti-pattern rejected:** Separate `product_costs` table — adds join complexity with no benefit for this scale.

---

### AD-2: Cost Price Resolution Logic

**Decision:** Resolve cost at order creation time using a cascading fallback, stored as a snapshot.

**Resolution chain:**
```
order_items.cost_price_snapshot =
  product_variants.cost_price    (if variant exists AND cost set)
  ?? products.cost_price          (fallback to parent product)
  ?? NULL                         (no cost data — excluded from COGS)
```

**Where:** `apps/web/app/routes/api.create-order.ts` — resolves cost for each line item before inserting.

**Snapshot immutability rule:** `cost_price_snapshot` is set once on `INSERT`. No `UPDATE` is ever permitted on this column. Enforced at application layer (no DB trigger needed in SQLite).

**Rationale:** Same pattern as Shopify. Historical P&L accuracy requires cost-at-time-of-sale, not current cost.

---

### AD-3: P&L Query Architecture

**Decision:** Server-side aggregation via Drizzle ORM queries in a Remix loader, with KV caching.

**Query structure — two separate D1 queries (batch API):**

```typescript
// Query 1: Delivered orders P&L
SELECT
  COALESCE(SUM(o.total), 0)                          AS gross_revenue,
  COUNT(DISTINCT o.id)                                AS orders_count,
  COALESCE(SUM(oi.cost_price_snapshot * oi.quantity), 0) AS total_cogs,
  COALESCE(SUM(o.courier_charge), 0) / 100.0         AS courier_cost
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.store_id = ? AND o.status = 'delivered'
  AND o.created_at BETWEEN ? AND ?

// Query 2: Returned orders impact
SELECT
  COUNT(DISTINCT o.id)                                AS returned_count,
  COALESCE(SUM(oi.cost_price_snapshot * oi.quantity), 0) AS return_cogs_loss,
  COALESCE(SUM(o.courier_charge), 0) / 100.0         AS return_courier_loss
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.store_id = ? AND o.status = 'returned'
  AND o.created_at BETWEEN ? AND ?
```

**D1 Batch API** used to run both queries simultaneously:
```typescript
const [delivered, returned] = await db.batch([deliveredQuery, returnedQuery]);
```

**Anti-pattern rejected:** Single large query with CASE WHEN — harder to maintain and debug.

---

### AD-4: KV Caching Strategy

**Decision:** Cache P&L summary in KV with 5-minute TTL. Invalidate on new delivered/returned order.

**Cache key pattern:**
```
pl:summary:{storeId}:{periodKey}
// e.g. pl:summary:42:2026-03
```

**TTL:** 300 seconds (5 minutes)

**Invalidation:** In `api.create-order.ts`, after order status update to `delivered`, delete relevant KV keys:
```typescript
await env.KV.delete(`pl:summary:${storeId}:${currentMonthKey}`);
```

**Product margin table:** NOT cached — paginated query, user-driven, small result set.

**Rationale:** P&L summary is read-heavy (dashboard cards + report tab). 5-min staleness is acceptable for financial summaries. Product margin table needs real-time accuracy for merchant decisions.

---

### AD-5: P&L Report UI Architecture

**Decision:** Add P&L as a new tab within the existing `/app/reports` route. No new top-level route.

**Rationale:**
- Consistent with existing reports UX pattern (Sales, Inventory, Customer, Tax tabs already exist)
- Reuses existing date picker, export, and layout components
- Single route = single loader = efficient — no extra network request

**Tab order:** Sales | Inventory | Customers | Tax | **Profit & Loss** ← new, last

**Component structure:**
```
app/routes/app.reports.tsx          ← existing, add pl case to switch
app/components/dashboard/
  PLSummaryCards.tsx                ← new: 4 KPI waterfall cards
  ProductMarginTable.tsx            ← new: sortable paginated table
  ReturnImpactCard.tsx              ← new: returns P&L breakdown
```

---

### AD-6: Dashboard KPI Card Architecture

**Decision:** Add 2 new KPI cards to existing dashboard using the existing `MetricCard` component.

**Location:** `app/routes/app.dashboard.tsx` loader — add P&L summary query (uses same KV cache as reports).

**Empty state:** If no products have cost_price set → show "Set cost prices to unlock" CTA card instead of metrics.

**Data source:** Reuse `getPLSummary(db, storeId, env, currentMonth)` server function — same function used by reports tab.

**Anti-pattern rejected:** Separate API endpoint for dashboard P&L — unnecessary extra request when loader can fetch directly.

---

### AD-7: Product Cost Price UI Architecture

**Decision:** Add cost price field to existing product create/edit forms. Show live margin % calculation.

**Files to modify:**
- `app/routes/app.products.new.tsx` — add `costPrice` field
- `app/routes/app.products.$id.tsx` — add `costPrice` field + display
- `app/components/VariantManager.tsx` — add per-variant cost override field

**Live margin calculation:** Client-side only using `useEffect`/`onChange`:
```typescript
const margin = sellingPrice > 0 && costPrice > 0
  ? ((sellingPrice - costPrice) / sellingPrice * 100).toFixed(1)
  : null;
```

**Validation:** Cost price must be ≥ 0. No upper limit enforced (merchant may enter wrong value — not our concern). Warning shown if cost > selling price: "⚠️ Cost exceeds selling price — negative margin".

---

### AD-8: Courier Charge UI Architecture

**Decision:** Add `courierCharge` input to existing order detail page in the Fulfillment section.

**File to modify:** `app/routes/app.orders.$id.tsx`

**UX placement:** Below courier status, above tracking number. Label: "Courier Charge Paid (৳)" with placeholder "e.g., 75".

**Storage:** Integer (paisa = BDT × 100) in DB for precision. Display as BDT (÷ 100) in UI.

**Future auto-fill:** When Pathao/Steadfast/Redx dispatch API is called, auto-populate `courier_charge` from API response. Architecture supports this — field is already in schema.

---

## 3. Implementation Patterns (Agent Consistency Rules)

### Pattern 1: Multi-Tenancy (CRITICAL)
Every DB query touching P&L data MUST include `store_id` filter:
```typescript
// ✅ CORRECT
.where(and(eq(orders.storeId, storeId), eq(orders.status, 'delivered')))

// ❌ WRONG — data leak
.where(eq(orders.status, 'delivered'))
```

### Pattern 2: Cost Price NULL Handling
Never assume cost_price exists. Always use COALESCE in aggregations:
```typescript
// ✅ CORRECT — NULL items excluded from margin %
const cogsItems = items.filter(i => i.costPriceSnapshot != null);
const cogs = cogsItems.reduce((sum, i) => sum + i.costPriceSnapshot! * i.quantity, 0);

// ❌ WRONG — NaN pollution
const cogs = items.reduce((sum, i) => sum + i.costPriceSnapshot * i.quantity, 0);
```

### Pattern 3: COD Revenue Recognition
P&L queries MUST filter `status = 'delivered'` only. Never use `status IN ('processing', 'shipped')` for revenue:
```typescript
// ✅ CORRECT
eq(orders.status, 'delivered')

// ❌ WRONG — counts unconfirmed revenue
inArray(orders.status, ['processing', 'shipped', 'delivered'])
```

### Pattern 4: Monetary Display (BDT)
All BDT amounts displayed with ৳ symbol and comma formatting:
```typescript
// ✅ CORRECT
formatPrice(amount, 'BDT') // → "৳1,23,456"

// ❌ WRONG
`${amount} BDT`
```

### Pattern 5: KV Cache Key Format
P&L cache keys always follow: `pl:{type}:{storeId}:{periodKey}`
```typescript
// ✅ CORRECT
const key = `pl:summary:${storeId}:${format(date, 'yyyy-MM')}`;

// ❌ WRONG
const key = `store_${storeId}_pl`;
```

### Pattern 6: Courier Charge Storage vs Display
`courier_charge` stored as integer paisa (BDT × 100). Always convert on read:
```typescript
// Storage (DB): 7500 (paisa)
// Display (UI): ৳75.00

const displayAmount = courierChargeDb / 100;
const dbAmount = Math.round(displayBDT * 100);
```

### Pattern 7: Error Handling in Loader
P&L loader must handle missing/partial data gracefully:
```typescript
// ✅ CORRECT — safe defaults
return json({
  grossRevenue: plData?.grossRevenue ?? 0,
  totalCOGS: plData?.totalCOGS ?? 0,
  hasIncompleteData: productsWithNoCost > 0,
  cogsCompleteness: Math.round((revenueWithCost / totalRevenue) * 100),
});
```

---

## 4. Project Structure (Files to Create/Modify)

### New Files
```
packages/database/src/migrations/
  XXXX_add_pl_tracking_fields.sql          ← DB migration

apps/web/app/
  services/
    pl-report.server.ts                    ← P&L query functions (getPLSummary, getProductMargins)
  components/
    dashboard/
      PLSummaryCards.tsx                   ← Waterfall KPI cards (Gross Rev → COGS → Gross Profit → Net)
      ProductMarginTable.tsx               ← Sortable paginated product margin table
      ReturnImpactCard.tsx                 ← Return loss breakdown card
```

### Modified Files
```
packages/database/src/schema.ts
  → Add costPrice to products
  → Add costPrice to product_variants
  → Add costPriceSnapshot to order_items
  → Add courierCharge to orders

apps/web/app/routes/
  app.products.new.tsx                     ← Add costPrice field + margin preview
  app.products.$id.tsx                     ← Add costPrice field + margin preview
  app.orders.$id.tsx                       ← Add courierCharge input (Fulfillment section)
  api.create-order.ts                      ← Resolve + snapshot cost price per line item
  app.reports.tsx                          ← Add P&L tab case + loader query
  app.dashboard.tsx                        ← Add 2 P&L KPI cards

apps/web/app/components/
  VariantManager.tsx                       ← Add per-variant costPrice field
  dashboard/MetricCard.tsx                 ← Reused (no change needed)
```

### No New Routes Needed
The architecture deliberately avoids new routes — all P&L surfaces are integrated into existing routes. This reduces complexity and maintains navigation consistency.

---

## 5. Architecture Validation

### ✅ Coherence Check
| Decision | Compatible With | Status |
|----------|----------------|--------|
| ADD COLUMN migration | Existing D1 schema | ✅ |
| Cost snapshot in create-order | Existing order creation flow | ✅ |
| P&L tab in /app/reports | Existing tab pattern | ✅ |
| KV caching | Existing KV patterns in codebase | ✅ |
| Batch D1 queries | Existing Drizzle batch usage | ✅ |
| MetricCard reuse | Existing dashboard component | ✅ |

### ✅ Requirements Coverage
| FR | Architectural Support | Coverage |
|----|----------------------|----------|
| FR-1: Cost on products | schema + products.$id.tsx | ✅ |
| FR-2: Variant cost | schema + VariantManager.tsx | ✅ |
| FR-3: Snapshot on order | api.create-order.ts | ✅ |
| FR-4: Courier charge | schema + orders.$id.tsx | ✅ |
| FR-5: P&L report tab | app.reports.tsx + pl-report.server.ts | ✅ |
| FR-6: Dashboard cards | app.dashboard.tsx + PLSummaryCards.tsx | ✅ |
| FR-7: Incomplete indicators | pl-report.server.ts completeness calc | ✅ |

### ✅ NFR Coverage
| NFR | Solution | Status |
|-----|----------|--------|
| <500ms P&L query | KV cache + D1 batch API | ✅ |
| Multi-tenancy security | store_id in every query | ✅ |
| Immutable cost snapshot | App-level write-once enforcement | ✅ |
| Backward compat | DEFAULT NULL migration | ✅ |
| Mobile responsive | Existing Tailwind responsive patterns | ✅ |
| CF edge constraints | Paginated queries, no long computation | ✅ |

### ✅ Implementation Readiness
- **Overall Status:** READY FOR EPICS & STORIES
- **Confidence Level:** High
- **Key Strengths:** Minimal new files, reuses existing patterns, no new routes, KV cache for performance
- **Risk Areas:** Cost snapshot logic in `api.create-order.ts` must be carefully tested (order items loop)

---

## 6. Implementation Handoff Notes for AI Agents

1. **Start with migration** — schema changes must be applied first before any other work
2. **`pl-report.server.ts` is the single source of truth** for all P&L calculations — do not duplicate query logic in routes
3. **`api.create-order.ts` is the most critical file** — cost snapshot insertion must be atomic with order item insertion using D1 batch
4. **Never expose `cost_price_snapshot` via `api.v1.orders.*`** public endpoints — it's merchant-confidential
5. **Test with NULL cost prices** — most existing products will have NULL; P&L must work gracefully
6. **First implementation priority:** E1 (Schema Migration) → E3 (Order Snapshot) → E2 (Cost Price UI) → E4 (P&L Report) → E5 (Product Margin Table) → E6 (Dashboard Cards) → E7 (Courier Charge UI)

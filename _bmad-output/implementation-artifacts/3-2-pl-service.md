# Story 3.2: Create P&L Server Service

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a reusable server-side service for P&L calculations,
So that both the reports tab and dashboard cards share the same query logic.

## Acceptance Criteria

1. [x] New file `apps/web/app/services/pl-report.server.ts` created
2. [x] `getPLSummary(db, storeId, env, periodStart, periodEnd)` function exported:
  - Returns: `{ grossRevenue, ordersCount, totalCOGS, courierCost, grossProfit, grossMargin, netProfit, netMargin, returnedCount, returnCOGSLoss, returnCourierLoss, cogsCompleteness }`
  - Uses D1 batch API for two queries (delivered + returned)
  - Checks KV cache first with key `pl:summary:{storeId}:{periodKey}`
  - Caches result for 300 seconds
3. [x] `getProductMargins(db, storeId, periodStart, periodEnd, page, limit)` function exported:
  - Returns paginated product margin data
  - Columns: productId, name, unitsSold, revenue, cogs, grossProfit, marginPct
  - Sorted by grossProfit DESC by default
  - NOT cached (user-driven, real-time)
4. [x] All monetary values correctly typed as `number`
5. [x] NULL cost items excluded from margin % (but included in revenue totals)

## Tasks / Subtasks

- [x] Task 1: Create the PL Report service file (AC: 1-5)
  - [x] Implement `getPLSummary` with D1 batch API and KV caching
  - [x] Implement `getProductMargins` with proper SQL aggregation

## Dev Notes

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story E3-S2]

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro

### Debug Log References
- Code verified in `apps/web/app/services/pl-report.server.ts`. All functions, caching mechanisms, and null handling are properly implemented.

### Completion Notes List
- Ultimate context engine analysis completed - comprehensive developer guide created
- Reviewed code and found PL Report Service is fully and correctly implemented.

### File List
- `apps/web/app/services/pl-report.server.ts`

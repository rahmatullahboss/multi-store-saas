# Story 2.3: Products List — Cost Column & Filter

Status: done

## Story

As a merchant,
I want to see cost prices in my products list and filter for products missing cost data,
So that I can quickly identify and fill in missing cost information.

## Acceptance Criteria

1. [x] Products list at `/app/products` shows a "Cost" column with cost price or "—" if not set
2. [x] Filter option added: "Missing cost price" — shows only products where `cost_price IS NULL`
3. [x] Filter works with existing search/status filters

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro

### Completion Notes List
- Verified "Missing Cost" filter added to tabs
- Verified Cost & Margin columns added for desktop and mobile views

### File List
- `apps/web/app/routes/app.products._index.tsx`
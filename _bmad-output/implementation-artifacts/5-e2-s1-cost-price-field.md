# Story 2.1: Cost Price Field on Product Create & Edit

Status: done

## Story

As a merchant,
I want to enter a cost price when creating or editing a product,
So that the system can calculate my profit margin.

## Acceptance Criteria

1. [x] "Cost Price (৳)" field added below "Selling Price" on `/app/products/new`
2. [x] "Cost Price (৳)" field added below "Selling Price" on `/app/products/:id`
3. [x] Field is optional — empty = NULL saved to DB
4. [x] Field accepts decimal values
5. [x] `costPrice` saved via existing product create/update action
6. [x] Field displays saved value correctly on edit page load
7. [x] Live margin % shown inline

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro

### Completion Notes List
- Verified UI fields added to `app.products.new.tsx` and `app.products.$id.tsx`
- Margin calculation verified

### File List
- `apps/web/app/routes/app.products.new.tsx`
- `apps/web/app/routes/app.products.$id.tsx`
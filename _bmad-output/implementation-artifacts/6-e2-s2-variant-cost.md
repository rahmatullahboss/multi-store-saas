# Story 2.2: Variant-Level Cost Override

Status: done

## Story

As a merchant with product variants,
I want to set a different cost price per variant,
So that my P&L accurately reflects different sourcing costs per variant.

## Acceptance Criteria

1. [x] Each variant row in `VariantManager` shows "Cost Override (৳)" input field
2. [x] Field is optional — empty = NULL (will inherit parent product cost)
3. [x] Variant cost saved to `product_variants.cost_price` via existing variant save action

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro

### Completion Notes List
- Verified `VariantManager.tsx` UI changes
- Verified server action saves `costPrice` to variants in `app.products.$id.tsx`

### File List
- `apps/web/app/components/VariantManager.tsx`
- `apps/web/app/routes/app.products.$id.tsx`
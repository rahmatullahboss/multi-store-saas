# Story 7.1: Courier Charge Input on Order Detail

Status: done

## Story

As a merchant,
I want to enter the courier charge I paid for each order,
So that my net profit calculation is accurate.

## Acceptance Criteria

1. [x] "Courier Charge Paid (৳)" input field added to `/app/orders/:id` Fulfillment section
2. [x] Accepts decimal input, stored as integer paisa (× 100) in DB
3. [x] Save button updates `orders.courier_charge`
4. [x] Displays existing value on page load

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro

### Completion Notes List
- Verified form addition in order details page
- Verified server action parses and saves courier charge (multiplying by 100)

### File List
- `apps/web/app/routes/app.orders.$id.tsx`
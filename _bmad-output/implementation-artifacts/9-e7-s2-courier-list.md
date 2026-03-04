# Story 7.2: Courier Charge Display on Orders List

Status: done

## Story

As a merchant,
I want to see courier charges at a glance in my orders list,
So that I can quickly spot orders where I haven't entered the charge yet.

## Acceptance Criteria

1. [x] "Courier" column added to orders list at `/app/orders`
2. [x] Shows value if set, "—" if 0/not set

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro

### Completion Notes List
- Verified Courier column added to the orders list table

### File List
- `apps/web/app/routes/app.orders._index.tsx`
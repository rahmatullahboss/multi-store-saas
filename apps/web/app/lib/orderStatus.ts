export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

const STATUS_SET: ReadonlySet<string> = new Set<OrderStatus>([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]);

/**
 * Centralized order status validation + transition rules.
 *
 * Why: Order status touches real inventory + real customer comms. We can't allow arbitrary
 * transitions from the UI, or a single admin click can create data inconsistencies.
 */
export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && STATUS_SET.has(value);
}

/**
 * Minimal, practical state machine for MVP.
 * - `cancelled` and `returned` are terminal for fulfillment, but we allow re-activation
 *   to `confirmed` / `processing` to support "mistaken cancellation" flows (guarded by
 *   inventory re-deduction elsewhere).
 */
export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;

  // Re-activation from cancelled/returned (must pass inventory checks in caller).
  if (from === 'cancelled' || from === 'returned') {
    return to === 'confirmed' || to === 'processing';
  }

  if (from === 'pending') return to === 'confirmed' || to === 'cancelled';
  if (from === 'confirmed') return to === 'processing' || to === 'cancelled';
  if (from === 'processing') return to === 'shipped' || to === 'cancelled';
  if (from === 'shipped') return to === 'delivered' || to === 'returned';
  if (from === 'delivered') return to === 'returned';

  return false;
}

export function assertOrderStatusTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrderStatus(from, to)) {
    throw new Error(`Invalid order status transition: ${from} -> ${to}`);
  }
}


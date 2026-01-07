/**
 * Activity Utilities (Client-safe)
 * 
 * Client-side helper functions for activity logs display.
 * These are safe to use in both client and server code.
 */

/**
 * Get human-readable action label
 */
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    staff_invited: 'Invited team member',
    staff_removed: 'Removed team member',
    invite_accepted: 'Joined team',
    invite_revoked: 'Revoked invitation',
    order_created: 'New order placed',
    order_updated: 'Updated order',
    order_cancelled: 'Cancelled order',
    order_status_update: 'Status changed',
    order_note_added: 'Note added',
    payment_update: 'Payment updated',
    product_created: 'Created product',
    product_updated: 'Updated product',
    product_deleted: 'Deleted product',
    stock_change: 'Stock adjusted',
    settings_updated: 'Updated settings',
    discount_created: 'Created discount',
    discount_updated: 'Updated discount',
    discount_deleted: 'Deleted discount',
  };
  return labels[action] || action;
}

/**
 * Get action badge color class
 */
export function getActionColor(action: string): string {
  if (action.includes('created') || action.includes('accepted')) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (action.includes('deleted') || action.includes('removed') || action.includes('cancelled')) {
    return 'bg-red-100 text-red-700';
  }
  if (action.includes('invited') || action.includes('updated') || action.includes('status_update')) {
    return 'bg-blue-100 text-blue-700';
  }
  if (action.includes('revoked')) {
    return 'bg-amber-100 text-amber-700';
  }
  if (action.includes('note_added')) {
    return 'bg-yellow-100 text-yellow-700';
  }
  if (action.includes('stock_change')) {
    return 'bg-purple-100 text-purple-700';
  }
  if (action.includes('payment')) {
    return 'bg-indigo-100 text-indigo-700';
  }
  return 'bg-gray-100 text-gray-700';
}

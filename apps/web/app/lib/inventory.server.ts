/**
 * Inventory Reserve System
 * 
 * Prevents overselling during checkout by tracking available vs reserved quantities.
 * 
 * Flow:
 * 1. Checkout start → reserveInventory() → available -= qty, reserved += qty
 * 2. Order complete → commitReservation() → reserved -= qty (already sold)
 * 3. Order cancel/expire → releaseReservation() → available += qty, reserved -= qty
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql } from 'drizzle-orm';
import { productVariants } from '@db/schema';

// ============================================================================
// RESERVE INVENTORY
// ============================================================================

/**
 * Reserve inventory for checkout.
 * Returns true if successful, false if insufficient stock.
 */
export async function reserveInventory(
  db: D1Database,
  items: Array<{ variantId: number; quantity: number }>
): Promise<{ success: boolean; error?: string }> {
  const drizzleDb = drizzle(db);
  
  // Check availability first
  for (const item of items) {
    const [variant] = await drizzleDb
      .select({ available: productVariants.available })
      .from(productVariants)
      .where(eq(productVariants.id, item.variantId));
    
    if (!variant) {
      return { success: false, error: `Variant ${item.variantId} not found` };
    }
    
    if ((variant.available ?? 0) < item.quantity) {
      return { success: false, error: `Insufficient stock for variant ${item.variantId}` };
    }
  }
  
  // Reserve all items
  try {
    for (const item of items) {
      await drizzleDb
        .update(productVariants)
        .set({
          available: sql`${productVariants.available} - ${item.quantity}`,
          reserved: sql`${productVariants.reserved} + ${item.quantity}`,
        })
        .where(eq(productVariants.id, item.variantId));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Reserve inventory failed:', error);
    return { success: false, error: 'Failed to reserve inventory' };
  }
}

// ============================================================================
// COMMIT RESERVATION (Order Completed)
// ============================================================================

/**
 * Commit reservation when order is paid.
 * Moves reserved quantity to sold (just decrements reserved).
 */
export async function commitReservation(
  db: D1Database,
  items: Array<{ variantId: number; quantity: number }>
): Promise<{ success: boolean }> {
  const drizzleDb = drizzle(db);
  
  try {
    for (const item of items) {
      await drizzleDb
        .update(productVariants)
        .set({
          reserved: sql`${productVariants.reserved} - ${item.quantity}`,
          // Also decrement the main inventory counter for reporting
          inventory: sql`${productVariants.inventory} - ${item.quantity}`,
        })
        .where(eq(productVariants.id, item.variantId));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Commit reservation failed:', error);
    return { success: false };
  }
}

// ============================================================================
// RELEASE RESERVATION (Order Cancelled/Expired)
// ============================================================================

/**
 * Release reservation when order is cancelled or checkout expires.
 * Returns reserved inventory back to available.
 */
export async function releaseReservation(
  db: D1Database,
  items: Array<{ variantId: number; quantity: number }>
): Promise<{ success: boolean }> {
  const drizzleDb = drizzle(db);
  
  try {
    for (const item of items) {
      await drizzleDb
        .update(productVariants)
        .set({
          available: sql`${productVariants.available} + ${item.quantity}`,
          reserved: sql`${productVariants.reserved} - ${item.quantity}`,
        })
        .where(eq(productVariants.id, item.variantId));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Release reservation failed:', error);
    return { success: false };
  }
}

// ============================================================================
// CHECK AVAILABILITY
// ============================================================================

/**
 * Check if items are available for purchase.
 */
export async function checkAvailability(
  db: D1Database,
  items: Array<{ variantId: number; quantity: number }>
): Promise<{ available: boolean; unavailable: number[] }> {
  const drizzleDb = drizzle(db);
  const unavailable: number[] = [];
  
  for (const item of items) {
    const [variant] = await drizzleDb
      .select({ available: productVariants.available })
      .from(productVariants)
      .where(eq(productVariants.id, item.variantId));
    
    if (!variant || (variant.available ?? 0) < item.quantity) {
      unavailable.push(item.variantId);
    }
  }
  
  return {
    available: unavailable.length === 0,
    unavailable,
  };
}

// ============================================================================
// SYNC INVENTORY (Admin tool)
// ============================================================================

/**
 * Sync available with inventory (for initial setup or after manual edits).
 */
export async function syncInventoryAvailable(
  db: D1Database,
  variantId: number
): Promise<void> {
  const drizzleDb = drizzle(db);
  
  const [variant] = await drizzleDb
    .select({ inventory: productVariants.inventory, reserved: productVariants.reserved })
    .from(productVariants)
    .where(eq(productVariants.id, variantId));
  
  if (variant) {
    const available = (variant.inventory ?? 0) - (variant.reserved ?? 0);
    await drizzleDb
      .update(productVariants)
      .set({ available: Math.max(0, available) })
      .where(eq(productVariants.id, variantId));
  }
}

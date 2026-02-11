/**
 * Customer Account Service
 * 
 * Handles data fetching and updates for the customer dashboard.
 * Includes stats, profile updates, address management, and order history.
 */

import { eq, desc, and } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '@db/schema';
import { customers, orders, customerAddresses } from '@db/schema';


// ============================================================================
// TYPES
// ============================================================================


export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyTier: string;
}

// Matching the schema definition for customer_addresses
export interface CustomerAddress {
  id: number;
  customerId: number;
  type?: 'shipping' | 'billing' | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country?: string | null;
  phone?: string | null;
  isDefault: boolean | null;
}

type StoreDB = DrizzleD1Database<typeof schema>;

// ============================================================================
// STATS & DASHBOARD
// ============================================================================

export async function getCustomerStats(
  customerId: number,
  storeId: number,
  db: StoreDB
): Promise<CustomerStats> {
  // Get customer for points/tier - STRICTLY filter by storeId
  const customerResult = await db
    .select({
      totalOrders: customers.totalOrders,
      totalSpent: customers.totalSpent,
      loyaltyPoints: customers.loyaltyPoints,
      loyaltyTier: customers.loyaltyTier,
    })
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
    .limit(1);

  // Stats are specific to this customer in this store.
  // Using `customers.totalOrders` is safe because `customers` table is per-store user record.
  // But verifying storeId matches ensures no cross-tenant leakage.

  const stats = customerResult[0] || {
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
  };

  return {
    totalOrders: stats.totalOrders || 0,
    totalSpent: stats.totalSpent || 0,
    loyaltyPoints: stats.loyaltyPoints || 0,
    loyaltyTier: stats.loyaltyTier || 'bronze',
  };
}

export async function getCustomerProfile(
  customerId: number,
  storeId: number,
  db: StoreDB
) {
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
    .limit(1);
    
  return result[0] || null;
}

// ============================================================================
// ORDERS
// ============================================================================

export async function getCustomerOrders(
  customerId: number,
  storeId: number,
  db: StoreDB,
  limit: number = 5,
  offset: number = 0
) {
  const customerOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.customerId, customerId), eq(orders.storeId, storeId)))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  return customerOrders;
}

export async function getCustomerOrderById(
  orderId: number,
  customerId: number,
  storeId: number,
  db: StoreDB
) {
  const order = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId), 
        eq(orders.customerId, customerId),
        eq(orders.storeId, storeId)
      )
    )
    .limit(1);

  return order[0] || null;
}

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

export async function updateCustomerProfile(
  customerId: number,
  storeId: number,
  data: { name?: string; phone?: string; email?: string },
  db: StoreDB
) {
  try {
    const updated = await db
      .update(customers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
      .returning();

    return { success: true, customer: updated[0] };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ============================================================================
// ADDRESS MANAGEMENT
// ============================================================================

export async function getCustomerAddresses(
  customerId: number,
  db: StoreDB
) {
  return db
    .select()
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, customerId))
    .orderBy(desc(customerAddresses.isDefault));
}

export async function createCustomerAddress(
  customerId: number,
  data: Omit<CustomerAddress, 'id' | 'isDefault' | 'customerId'> & { isDefault?: boolean },
  db: StoreDB
) {
  // If setting as default, unset others first
  if (data.isDefault) {
    await db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.customerId, customerId));
  }

  const newAddress = await db
    .insert(customerAddresses)
    .values({
      customerId: customerId,
      ...data,
      isDefault: data.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newAddress[0];
}

export async function updateCustomerAddress(
  addressId: number,
  customerId: number,
  data: Partial<CustomerAddress>,
  db: StoreDB
) {
  // If setting as default, unset others first
  if (data.isDefault) {
    await db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.customerId, customerId));
  }

  const updated = await db
    .update(customerAddresses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(customerAddresses.id, addressId), eq(customerAddresses.customerId, customerId)))
    .returning();

  return updated[0];
}

export async function deleteCustomerAddress(
  addressId: number,
  customerId: number,
  db: StoreDB
) {
  await db
    .delete(customerAddresses)
    .where(and(eq(customerAddresses.id, addressId), eq(customerAddresses.customerId, customerId)));
    
  return { success: true };
}

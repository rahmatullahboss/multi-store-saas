/**
 * Customer Account Service
 *
 * Handles data fetching and updates for the customer dashboard.
 * Includes stats, profile updates, address management, and order history.
 */

import { eq, desc, and, count, like } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '@db/schema';
import { customers, orders, customerAddresses, wishlists, wishlistItems, products, discounts, shipments, orderItems } from '@db/schema';

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

export async function getCustomerProfile(customerId: number, storeId: number, db: StoreDB) {
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

export async function getCustomerOrdersWithItems(
  customerId: number,
  storeId: number,
  db: StoreDB,
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string
) {
  const offset = (page - 1) * limit;
  const normalizedSearch = search?.trim();

  // Filter conditions
  const whereClause = and(
    eq(orders.customerId, customerId),
    eq(orders.storeId, storeId),
    status && status !== 'all' ? eq(orders.status, status as 'pending') : undefined,
    normalizedSearch ? like(orders.orderNumber, `%${normalizedSearch}%`) : undefined
  );

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(whereClause);
  
  const total = totalResult?.count || 0;
  const totalPages = Math.ceil(total / limit);

  // Get orders
  const customerOrders = await db
    .select()
    .from(orders)
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  // Attach items to orders
  const ordersWithItems = await Promise.all(
    customerOrders.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          title: orderItems.title,
          quantity: orderItems.quantity,
          variantTitle: orderItems.variantTitle,
          price: orderItems.price,
          productId: orderItems.productId,
          image: products.imageUrl,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        items,
      };
    })
  );

  return {
    orders: ordersWithItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    }
  };
}

export type OrderWithItems = Awaited<ReturnType<typeof getCustomerOrdersWithItems>>['orders'][number];

export async function getCustomerRecentOrdersWithImages(
  customerId: number,
  storeId: number,
  db: StoreDB,
  limit: number = 5
) {
  // Get orders first
  const recentOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.customerId, customerId), eq(orders.storeId, storeId)))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  if (recentOrders.length === 0) return [];

  // For each order, get the first item's product image
  const ordersWithImages = await Promise.all(
    recentOrders.map(async (order) => {
      const firstItem = await db
        .select({
          imageUrl: products.imageUrl,
          title: products.title
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id))
        .limit(1);

      return {
        ...order,
        firstItem: firstItem[0] || null,
      };
    })
  );

  return ordersWithImages;
}

export type OrderWithImage = Awaited<ReturnType<typeof getCustomerRecentOrdersWithImages>>[number];

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
      and(eq(orders.id, orderId), eq(orders.customerId, customerId), eq(orders.storeId, storeId))
    )
    .limit(1);

  return order[0] || null;
}

export async function getCustomerOrderWithDetails(
  orderId: number,
  customerId: number,
  storeId: number,
  db: StoreDB
) {
  // 1. Get the order
  const order = await getCustomerOrderById(orderId, customerId, storeId, db);
  if (!order) return null;

  // 2. Get order items with product details
  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      price: orderItems.price,
      total: orderItems.total,
      title: orderItems.title,
      variantTitle: orderItems.variantTitle,
      productTitle: products.title,
      productImage: products.imageUrl,
      productId: products.id,
      variantId: orderItems.variantId,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  // 3. Get shipment/tracking info
  const shipment = await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, orderId))
    .limit(1);

  return {
    order,
    items,
    shipment: shipment[0] || null,
  };
}

// ============================================================================
// WISHLIST
// ============================================================================

export async function getCustomerWishlist(customerId: number, storeId: number, db: StoreDB) {
  // Check if wishlist exists, if not create one
  let wishlist = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, customerId), eq(wishlists.storeId, storeId)))
    .limit(1);

  if (wishlist.length === 0) {
    wishlist = await db
      .insert(wishlists)
      .values({
        customerId,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }

  const wishlistId = wishlist[0].id;

  // Get items with product details
  const items = await db
    .select({
      id: wishlistItems.id,
      addedAt: wishlistItems.addedAt,
      productId: products.id,
      title: products.title,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      inventory: products.inventory,
      isPublished: products.isPublished,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.wishlistId, wishlistId))
    .orderBy(desc(wishlistItems.addedAt));

  return items;
}

export async function addToWishlist(
  customerId: number,
  storeId: number,
  productId: number,
  db: StoreDB
) {
  // Check/Create wishlist
  const wishlistArr = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, customerId), eq(wishlists.storeId, storeId)))
    .limit(1);

  let wishlistId: number;

  if (wishlistArr.length === 0) {
    const newWishlist = await db
      .insert(wishlists)
      .values({
        customerId,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    wishlistId = newWishlist[0].id;
  } else {
    wishlistId = wishlistArr[0].id;
  }

  // Check if item exists
  const existing = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.wishlistId, wishlistId), eq(wishlistItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    return { success: true, message: 'Already in wishlist' };
  }

  await db.insert(wishlistItems).values({
    wishlistId,
    productId,
    addedAt: new Date(),
  });

  return { success: true };
}

export async function removeFromWishlist(
  customerId: number,
  storeId: number,
  itemId: number,
  db: StoreDB
) {
  // Verify ownership via join
  // But easier: get wishlist id first
  const wishlist = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, customerId), eq(wishlists.storeId, storeId)))
    .limit(1);

  if (wishlist.length === 0) return { success: false, error: 'Wishlist not found' };

  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.wishlistId, wishlist[0].id)));

  return { success: true };
}

// ============================================================================
// COUPONS
// ============================================================================

export async function getAvailableCoupons(storeId: number, db: StoreDB) {
  return db
    .select()
    .from(discounts)
    .where(
      and(
        eq(discounts.storeId, storeId),
        eq(discounts.isActive, true),
      )
    )
    .orderBy(desc(discounts.createdAt));
}

/**
 * Lightweight count query for sidebar badges.
 * Avoids fetching full product details just for a count.
 */
export async function getWishlistCount(customerId: number, storeId: number, db: StoreDB): Promise<number> {
  const wishlist = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.customerId, customerId), eq(wishlists.storeId, storeId)))
    .limit(1);

  if (wishlist.length === 0) return 0;

  const result = await db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(eq(wishlistItems.wishlistId, wishlist[0].id));

  return result.length;
}

/**
 * Lightweight count query for available coupons badge.
 */
export async function getAvailableCouponsCount(storeId: number, db: StoreDB): Promise<number> {
  const result = await db
    .select({ id: discounts.id })
    .from(discounts)
    .where(
      and(
        eq(discounts.storeId, storeId),
        eq(discounts.isActive, true),
      )
    );

  return result.length;
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

export async function getCustomerAddresses(customerId: number, db: StoreDB) {
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
  // Check if address already exists with same details
  const existingAddresses = await db
    .select()
    .from(customerAddresses)
    .where(
      and(
        eq(customerAddresses.customerId, customerId),
        eq(customerAddresses.address1, data.address1 || ''),
        eq(customerAddresses.city, data.city || ''),
        eq(customerAddresses.province, data.province || '')
      )
    )
    .limit(1);

  // If address already exists, update it instead of creating new
  if (existingAddresses.length > 0) {
    const existingAddress = existingAddresses[0];

    // If setting as default, unset others first
    if (data.isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    // Update the existing address
    const updated = await db
      .update(customerAddresses)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        isDefault: data.isDefault ?? existingAddress.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(customerAddresses.id, existingAddress.id))
      .returning();

    return updated[0];
  }

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

export async function deleteCustomerAddress(addressId: number, customerId: number, db: StoreDB) {
  await db
    .delete(customerAddresses)
    .where(and(eq(customerAddresses.id, addressId), eq(customerAddresses.customerId, customerId)));

  return { success: true };
}

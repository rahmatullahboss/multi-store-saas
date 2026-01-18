/**
 * Cart Service
 *
 * Server-side cart management with database persistence.
 * Supports both authenticated customers and anonymous visitors.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { carts, cartItems, products, productVariants, type Cart, type CartItem } from '@db/schema';

// ============================================================================
// TYPES
// ============================================================================
export interface CartItemInput {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface CartWithItems extends Cart {
  items: (CartItem & {
    product?: {
      id: number;
      title: string;
      price: number;
      imageUrl: string | null;
      inventory: number | null;
    };
    variant?: {
      id: number;
      price: number | null;
      inventory: number | null;
      option1Value: string | null;
      option2Value: string | null;
    } | null;
  })[];
}

// ============================================================================
// GET OR CREATE CART
// ============================================================================
export async function getOrCreateCart(
  db: D1Database,
  storeId: number,
  options: {
    customerId?: number;
    visitorId?: string;
    sessionId?: string;
  }
): Promise<Cart> {
  const drizzleDb = drizzle(db);

  // Try to find existing cart
  let existingCart: Cart | undefined;

  if (options.customerId) {
    const result = await drizzleDb
      .select()
      .from(carts)
      .where(
        and(
          eq(carts.storeId, storeId),
          eq(carts.customerId, options.customerId),
          eq(carts.status, 'active')
        )
      )
      .limit(1);
    existingCart = result[0];
  } else if (options.visitorId) {
    const result = await drizzleDb
      .select()
      .from(carts)
      .where(
        and(
          eq(carts.storeId, storeId),
          eq(carts.visitorId, options.visitorId),
          eq(carts.status, 'active')
        )
      )
      .limit(1);
    existingCart = result[0];
  }

  if (existingCart) {
    return existingCart;
  }

  // Create new cart
  const cartId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await drizzleDb.insert(carts).values({
    id: cartId,
    storeId,
    customerId: options.customerId || null,
    visitorId: options.visitorId || null,
    sessionId: options.sessionId || null,
    status: 'active',
    expiresAt,
    createdAt: now,
    updatedAt: now,
  });

  const [newCart] = await drizzleDb
    .select()
    .from(carts)
    .where(eq(carts.id, cartId))
    .limit(1);

  return newCart;
}

// ============================================================================
// GET CART WITH ITEMS
// ============================================================================
export async function getCartWithItems(
  db: D1Database,
  cartId: string
): Promise<CartWithItems | null> {
  const drizzleDb = drizzle(db);

  const [cart] = await drizzleDb
    .select()
    .from(carts)
    .where(eq(carts.id, cartId))
    .limit(1);

  if (!cart) return null;

  // Get cart items with product/variant data
  const items = await drizzleDb
    .select({
      item: cartItems,
      product: {
        id: products.id,
        title: products.title,
        price: products.price,
        imageUrl: products.imageUrl,
        inventory: products.inventory,
      },
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  // Fetch variants separately for items that have them
  const variantIds = items
    .filter((i) => i.item.variantId)
    .map((i) => i.item.variantId as number);

  let variantsMap: Map<number, any> = new Map();
  if (variantIds.length > 0) {
    const variants = await drizzleDb
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantIds[0])); // Simplified for now

    variants.forEach((v) => variantsMap.set(v.id, v));
  }

  return {
    ...cart,
    items: items.map((i) => ({
      ...i.item,
      product: i.product || undefined,
      variant: i.item.variantId ? variantsMap.get(i.item.variantId) : null,
    })),
  };
}

// ============================================================================
// ADD ITEM TO CART
// ============================================================================
export async function addToCart(
  db: D1Database,
  cartId: string,
  storeId: number,
  input: CartItemInput
): Promise<CartItem> {
  const drizzleDb = drizzle(db);

  // Check if item already exists
  const existingItems = await drizzleDb
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, input.productId),
        input.variantId
          ? eq(cartItems.variantId, input.variantId)
          : eq(cartItems.variantId, null as any)
      )
    )
    .limit(1);

  if (existingItems.length > 0) {
    // Update quantity
    const existing = existingItems[0];
    const newQuantity = existing.quantity + input.quantity;

    await drizzleDb
      .update(cartItems)
      .set({ quantity: newQuantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id));

    return { ...existing, quantity: newQuantity };
  }

  // Get product info for snapshot
  const [product] = await drizzleDb
    .select()
    .from(products)
    .where(eq(products.id, input.productId))
    .limit(1);

  if (!product) {
    throw new Error('Product not found');
  }

  let variantInfo: any = null;
  let price = product.price;

  if (input.variantId) {
    const [variant] = await drizzleDb
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, input.variantId))
      .limit(1);

    if (variant) {
      variantInfo = variant;
      price = variant.price || product.price;
    }
  }

  // Insert new item
  const itemId = crypto.randomUUID();
  const now = new Date();

  await drizzleDb.insert(cartItems).values({
    id: itemId,
    cartId,
    storeId,
    productId: input.productId,
    variantId: input.variantId || null,
    quantity: input.quantity,
    unitPriceSnapshot: price,
    titleSnapshot: product.title,
    imageSnapshot: product.imageUrl,
    variantTitleSnapshot: variantInfo
      ? [variantInfo.option1Value, variantInfo.option2Value].filter(Boolean).join(' / ')
      : null,
    addedAt: now,
    updatedAt: now,
  });

  // Update cart timestamp
  await drizzleDb
    .update(carts)
    .set({ updatedAt: now })
    .where(eq(carts.id, cartId));

  const [newItem] = await drizzleDb
    .select()
    .from(cartItems)
    .where(eq(cartItems.id, itemId))
    .limit(1);

  return newItem;
}

// ============================================================================
// UPDATE ITEM QUANTITY
// ============================================================================
export async function updateCartItemQuantity(
  db: D1Database,
  itemId: string,
  quantity: number
): Promise<CartItem | null> {
  const drizzleDb = drizzle(db);

  if (quantity <= 0) {
    // Remove item
    await drizzleDb.delete(cartItems).where(eq(cartItems.id, itemId));
    return null;
  }

  await drizzleDb
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItems.id, itemId));

  const [updated] = await drizzleDb
    .select()
    .from(cartItems)
    .where(eq(cartItems.id, itemId))
    .limit(1);

  return updated || null;
}

// ============================================================================
// REMOVE ITEM
// ============================================================================
export async function removeFromCart(
  db: D1Database,
  itemId: string
): Promise<void> {
  const drizzleDb = drizzle(db);
  await drizzleDb.delete(cartItems).where(eq(cartItems.id, itemId));
}

// ============================================================================
// CLEAR CART
// ============================================================================
export async function clearCart(db: D1Database, cartId: string): Promise<void> {
  const drizzleDb = drizzle(db);
  await drizzleDb.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

// ============================================================================
// SYNC FROM LOCALSTORAGE
// ============================================================================
export async function syncCartFromLocalStorage(
  db: D1Database,
  cartId: string,
  storeId: number,
  localItems: CartItemInput[]
): Promise<CartWithItems | null> {
  // Add all items from localStorage
  for (const item of localItems) {
    try {
      await addToCart(db, cartId, storeId, item);
    } catch (e) {
      console.error('[Cart Sync] Failed to add item:', e);
    }
  }

  return getCartWithItems(db, cartId);
}

// ============================================================================
// MARK CART AS CONVERTED
// ============================================================================
export async function markCartConverted(
  db: D1Database,
  cartId: string
): Promise<void> {
  const drizzleDb = drizzle(db);
  await drizzleDb
    .update(carts)
    .set({ status: 'converted', updatedAt: new Date() })
    .where(eq(carts.id, cartId));
}

// ============================================================================
// MERGE CARTS (visitor → customer)
// ============================================================================
export async function mergeCarts(
  db: D1Database,
  visitorCartId: string,
  customerCartId: string
): Promise<void> {
  const drizzleDb = drizzle(db);

  // Move items from visitor cart to customer cart
  await drizzleDb
    .update(cartItems)
    .set({ cartId: customerCartId, updatedAt: new Date() })
    .where(eq(cartItems.cartId, visitorCartId));

  // Mark visitor cart as merged
  await drizzleDb
    .update(carts)
    .set({ status: 'merged', updatedAt: new Date() })
    .where(eq(carts.id, visitorCartId));
}

/**
 * Cart API Route
 *
 * GET /api/cart - Get current cart with items
 * POST /api/cart - Add item to cart
 * PUT /api/cart - Update item quantity
 * DELETE /api/cart - Remove item from cart
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import {
  getOrCreateCart,
  getCartWithItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  syncCartFromLocalStorage,
  type CartItemInput,
} from '~/services/cart.server';
import { getCustomer } from '~/services/customer-auth.server';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const AddItemSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
});

const UpdateItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(0).max(99),
});

const RemoveItemSchema = z.object({
  itemId: z.string().uuid(),
});

const SyncCartSchema = z.object({
  items: z.array(AddItemSchema),
});

// ============================================================================
// GET CART
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { store, storeId, cloudflare } = context;

  if (!store || !storeId) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const db = cloudflare.env.DB;

  // Get customer or visitor ID
  const customer = await getCustomer(request, cloudflare.env, db);
  const visitorId = getVisitorId(request);

  // Get or create cart
  const cart = await getOrCreateCart(db, storeId as number, {
    customerId: customer?.id,
    visitorId: customer ? undefined : visitorId,
  });

  // Get cart with items
  const cartWithItems = await getCartWithItems(db, cart.id);

  return json({
    success: true,
    cart: cartWithItems,
  });
}

// ============================================================================
// CART ACTIONS
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { store, storeId, cloudflare } = context;

  if (!store || !storeId) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const db = cloudflare.env.DB;
  const method = request.method;

  // Get customer or visitor ID
  const customer = await getCustomer(request, cloudflare.env, db);
  const visitorId = getVisitorId(request);

  // Get or create cart
  const cart = await getOrCreateCart(db, storeId as number, {
    customerId: customer?.id,
    visitorId: customer ? undefined : visitorId,
  });

  try {
    const body = await request.json() as Record<string, unknown>;

    // ========================================================================
    // ADD ITEM (POST)
    // ========================================================================
    if (method === 'POST') {
      // Check if it's a sync request
      if (body.intent === 'sync') {
        const parseResult = SyncCartSchema.safeParse(body);
        if (!parseResult.success) {
          return json({ error: 'Invalid sync data' }, { status: 400 });
        }

        const cartWithItems = await syncCartFromLocalStorage(
          db,
          cart.id,
          storeId as number,
          parseResult.data.items
        );

        return json({
          success: true,
          cart: cartWithItems,
          message: 'Cart synced',
        });
      }

      // Normal add item
      const parseResult = AddItemSchema.safeParse(body);
      if (!parseResult.success) {
        return json(
          { error: 'Invalid input', details: parseResult.error.flatten() },
          { status: 400 }
        );
      }

      const item = await addToCart(db, cart.id, storeId as number, parseResult.data);

      // Return updated cart
      const cartWithItems = await getCartWithItems(db, cart.id);

      return json({
        success: true,
        item,
        cart: cartWithItems,
      });
    }

    // ========================================================================
    // UPDATE QUANTITY (PUT)
    // ========================================================================
    if (method === 'PUT') {
      const parseResult = UpdateItemSchema.safeParse(body);
      if (!parseResult.success) {
        return json(
          { error: 'Invalid input', details: parseResult.error.flatten() },
          { status: 400 }
        );
      }

      const item = await updateCartItemQuantity(
        db,
        parseResult.data.itemId,
        parseResult.data.quantity
      );

      const cartWithItems = await getCartWithItems(db, cart.id);

      return json({
        success: true,
        item,
        cart: cartWithItems,
      });
    }

    // ========================================================================
    // REMOVE ITEM (DELETE)
    // ========================================================================
    if (method === 'DELETE') {
      const parseResult = RemoveItemSchema.safeParse(body);
      if (!parseResult.success) {
        return json(
          { error: 'Invalid input', details: parseResult.error.flatten() },
          { status: 400 }
        );
      }

      await removeFromCart(db, parseResult.data.itemId);

      const cartWithItems = await getCartWithItems(db, cart.id);

      return json({
        success: true,
        cart: cartWithItems,
      });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('[Cart API] Error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER: Get visitor ID from cookie
// ============================================================================
function getVisitorId(request: Request): string {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/visitor_id=([^;]+)/);

  if (match) {
    return match[1];
  }

  // Generate new visitor ID
  return crypto.randomUUID();
}

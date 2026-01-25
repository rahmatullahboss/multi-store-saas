/**
 * Cart API Route - DO-Backed Implementation
 *
 * GET /api/cart - Get current cart with items
 * POST /api/cart - Add item to cart
 * PUT /api/cart - Update item quantity
 * DELETE /api/cart - Remove item from cart
 * 
 * Uses Durable Objects for:
 * - Race-condition free cart operations
 * - Multi-tab synchronization
 * - Real-time state management
 * 
 * Falls back to D1 for persistence when customer is authenticated.
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import {
  getOrCreateCart,
  getCartWithItems,
  addToCart as addToCartDB,
  updateCartItemQuantity as updateCartItemQuantityDB,
  removeFromCart as removeFromCartDB,
  syncCartFromLocalStorage,
  type CartItemInput,
} from '~/services/cart.server';
import {
  getCart as getCartDO,
  addToCart as addToCartDO,
  updateCartItemQuantity as updateCartItemQuantityDO,
  removeFromCart as removeFromCartDO,
  clearCart as clearCartDO,
  getCartSessionId,
  generateSessionId,
  createCartSessionCookie,
} from '~/services/cart-do.server';
import { getCustomer } from '~/services/customer-auth.server';
import { resolveStore } from '~/lib/store.server';

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
// GET CART - Uses DO for real-time state
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  // Use resolveStore for proper store resolution
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const db = env.DB;

  // Get cart session ID (from cookie or generate new)
  let sessionId = getCartSessionId(request);
  const isNewSession = !request.headers.get('Cookie')?.includes('cart_session');
  
  if (isNewSession) {
    sessionId = generateSessionId();
  }

  // Check if CART_SERVICE is available (DO workers deployed)
  const hasCartService = 'CART_SERVICE' in env;
  
  if (hasCartService) {
    // Use Durable Object for cart (race-condition free!)
    const doResult = await getCartDO(env as any, sessionId);
    
    if (doResult.success && doResult.cart) {
      const headers = new Headers();
      if (isNewSession) {
        headers.set('Set-Cookie', createCartSessionCookie(sessionId));
      }
      
      return json({
        success: true,
        cart: doResult.cart,
        source: 'do',
      }, { headers });
    }
  }

  // Fallback to D1 database
  const customer = await getCustomer(request, env, db);
  const visitorId = getVisitorId(request);

  const cart = await getOrCreateCart(db, storeId, {
    customerId: customer?.id,
    visitorId: customer ? undefined : visitorId,
  });

  const cartWithItems = await getCartWithItems(db, cart.id);

  return json({
    success: true,
    cart: cartWithItems,
    source: 'db',
  });
}

// ============================================================================
// CART ACTIONS - Uses DO for race-condition free operations
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  // Use resolveStore for proper store resolution
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const db = env.DB;
  const method = request.method;

  // Get cart session ID
  let sessionId = getCartSessionId(request);
  const isNewSession = !request.headers.get('Cookie')?.includes('cart_session');
  
  if (isNewSession) {
    sessionId = generateSessionId();
  }

  // Check if CART_SERVICE is available
  const hasCartService = 'CART_SERVICE' in env;

  try {
    const body = await request.json() as Record<string, unknown>;
    const headers = new Headers();
    
    if (isNewSession) {
      headers.set('Set-Cookie', createCartSessionCookie(sessionId));
    }

    // ========================================================================
    // ADD ITEM (POST) - Uses DO for race-condition free add
    // ========================================================================
    if (method === 'POST') {
      // Check if it's a sync request (still uses D1 for full sync)
      if (body.intent === 'sync') {
        const parseResult = SyncCartSchema.safeParse(body);
        if (!parseResult.success) {
          return json({ error: 'Invalid sync data' }, { status: 400 });
        }

        // For sync, get D1 cart first
        const customer = await getCustomer(request, env, db);
        const visitorId = getVisitorId(request);
        const cart = await getOrCreateCart(db, storeId, {
          customerId: customer?.id,
          visitorId: customer ? undefined : visitorId,
        });

        const cartWithItems = await syncCartFromLocalStorage(
          db,
          cart.id,
          storeId,
          parseResult.data.items
        );

        return json({
          success: true,
          cart: cartWithItems,
          message: 'Cart synced',
          source: 'db',
        }, { headers });
      }

      // Normal add item - Use DO
      const parseResult = AddItemSchema.safeParse(body);
      if (!parseResult.success) {
        return json(
          { error: 'Invalid input', details: parseResult.error.flatten() },
          { status: 400 }
        );
      }

      if (hasCartService) {
        // Fetch product details for DO cart
        const product = await db.prepare(
          `SELECT id, title, price, image_url FROM products WHERE id = ? AND store_id = ?`
        ).bind(parseResult.data.productId, storeId).first<{
          id: number;
          title: string;
          price: number;
          image_url: string | null;
        }>();

        if (!product) {
          return json({ error: 'Product not found' }, { status: 404 });
        }

        const doResult = await addToCartDO(env as any, sessionId, {
          productId: parseResult.data.productId,
          variantId: parseResult.data.variantId,
          quantity: parseResult.data.quantity,
          price: product.price,
          name: product.title,
          image: product.image_url || undefined,
          storeId,
        });

        if (doResult.success) {
          return json({
            success: true,
            cart: doResult.cart,
            source: 'do',
          }, { headers });
        }
      }

      // Fallback to D1
      const customer = await getCustomer(request, env, db);
      const visitorId = getVisitorId(request);
      const cart = await getOrCreateCart(db, storeId, {
        customerId: customer?.id,
        visitorId: customer ? undefined : visitorId,
      });

      const item = await addToCartDB(db, cart.id, storeId, parseResult.data);
      const cartWithItems = await getCartWithItems(db, cart.id);

      return json({
        success: true,
        item,
        cart: cartWithItems,
        source: 'db',
      }, { headers });
    }

    // ========================================================================
    // UPDATE QUANTITY (PUT) - Uses DO
    // ========================================================================
    if (method === 'PUT') {
      // DO uses productId, D1 uses itemId - support both
      const productId = body.productId as number | undefined;
      const variantId = body.variantId as number | undefined;
      const quantity = body.quantity as number;

      if (hasCartService && productId !== undefined) {
        const doResult = await updateCartItemQuantityDO(
          env as any,
          sessionId,
          productId,
          quantity,
          variantId
        );

        if (doResult.success) {
          return json({
            success: true,
            cart: doResult.cart,
            source: 'do',
          }, { headers });
        }
      }

      // Fallback to D1 with itemId
      const parseResult = UpdateItemSchema.safeParse(body);
      if (!parseResult.success) {
        return json(
          { error: 'Invalid input', details: parseResult.error.flatten() },
          { status: 400 }
        );
      }

      const customer = await getCustomer(request, env, db);
      const visitorId = getVisitorId(request);
      const cart = await getOrCreateCart(db, storeId, {
        customerId: customer?.id,
        visitorId: customer ? undefined : visitorId,
      });

      const item = await updateCartItemQuantityDB(
        db,
        parseResult.data.itemId,
        parseResult.data.quantity
      );

      const cartWithItems = await getCartWithItems(db, cart.id);

      return json({
        success: true,
        item,
        cart: cartWithItems,
        source: 'db',
      }, { headers });
    }

    // ========================================================================
    // REMOVE ITEM (DELETE) - Uses DO
    // ========================================================================
    if (method === 'DELETE') {
      const productId = body.productId as number | undefined;
      const variantId = body.variantId as number | undefined;

      if (hasCartService && productId !== undefined) {
        const doResult = await removeFromCartDO(
          env as any,
          sessionId,
          productId,
          variantId
        );

        if (doResult.success) {
          return json({
            success: true,
            cart: doResult.cart,
            source: 'do',
          }, { headers });
        }
      }

      // Fallback to D1 with itemId
      const parseResult = RemoveItemSchema.safeParse(body);
      if (!parseResult.success) {
        return json(
          { error: 'Invalid input', details: parseResult.error.flatten() },
          { status: 400 }
        );
      }

      const customer = await getCustomer(request, env, db);
      const visitorId = getVisitorId(request);
      const cart = await getOrCreateCart(db, storeId, {
        customerId: customer?.id,
        visitorId: customer ? undefined : visitorId,
      });

      await removeFromCartDB(db, parseResult.data.itemId);
      const cartWithItems = await getCartWithItems(db, cart.id);

      return json({
        success: true,
        cart: cartWithItems,
        source: 'db',
      }, { headers });
    }

    // ========================================================================
    // CLEAR CART (POST with intent=clear)
    // ========================================================================
    if (body.intent === 'clear') {
      if (hasCartService) {
        const doResult = await clearCartDO(env as any, sessionId);
        if (doResult.success) {
          return json({
            success: true,
            cart: doResult.cart,
            source: 'do',
          }, { headers });
        }
      }
      
      return json({ success: true, message: 'Cart cleared' }, { headers });
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

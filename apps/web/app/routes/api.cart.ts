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
  clearCart as clearCartDB,
  syncCartFromLocalStorage,
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
  productId: z.coerce.number().int().positive(),
  variantId: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

const UpdateItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(99),
});

const UpdateItemByProductSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
  quantity: z.coerce.number().int().min(0).max(99),
});

const RemoveItemSchema = z.object({
  itemId: z.string().uuid(),
});

const RemoveItemByProductSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
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

  // Authenticated storefront customers should always use DB-backed carts
  // so cart state can persist across devices/sessions.
  const customer = await getCustomer(request, env, db);
  if (customer) {
    const cart = await getOrCreateCart(db, storeId, {
      customerId: customer.id,
    });
    const cartWithItems = await getCartWithItems(db, cart.id);
    const headers = new Headers();
    if (isNewSession) {
      headers.set('Set-Cookie', createCartSessionCookie(sessionId));
    }

    return json(
      {
        success: true,
        cart: cartWithItems,
        source: 'db-auth',
      },
      { headers }
    );
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
  const visitorId = getVisitorId(request);

  const cart = await getOrCreateCart(db, storeId, {
    visitorId,
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
    const body = await parseRequestBody(request);
    const headers = new Headers();
    const customer = await getCustomer(request, env, db);
    
    if (isNewSession) {
      headers.set('Set-Cookie', createCartSessionCookie(sessionId));
    }

    // Authenticated customers use DB-backed carts as source of truth.
    if (customer) {
      const cart = await getOrCreateCart(db, storeId, { customerId: customer.id });

      if (method === 'POST') {
        if (body.intent === 'clear') {
          await clearCartDB(db, cart.id);
          const cartWithItems = await getCartWithItems(db, cart.id);
          return json(
            {
              success: true,
              cart: cartWithItems,
              source: 'db-auth',
            },
            { headers }
          );
        }

        if (body.intent === 'sync') {
          const parseResult = SyncCartSchema.safeParse(body);
          if (!parseResult.success) {
            return json({ error: 'Invalid sync data' }, { status: 400 });
          }

          const cartWithItems = await syncCartFromLocalStorage(
            db,
            cart.id,
            storeId,
            parseResult.data.items
          );

          return json(
            {
              success: true,
              cart: cartWithItems,
              message: 'Cart synced',
              source: 'db-auth',
            },
            { headers }
          );
        }

        const parseResult = AddItemSchema.safeParse(body);
        if (!parseResult.success) {
          return json(
            { error: 'Invalid input', details: parseResult.error.flatten() },
            { status: 400 }
          );
        }

        const item = await addToCartDB(db, cart.id, storeId, parseResult.data);
        const cartWithItems = await getCartWithItems(db, cart.id);

        return json(
          {
            success: true,
            item,
            cart: cartWithItems,
            source: 'db-auth',
          },
          { headers }
        );
      }

      if (method === 'PUT') {
        const byProductResult = UpdateItemByProductSchema.safeParse(body);

        if (byProductResult.success) {
          const { productId, variantId, quantity } = byProductResult.data;
          const cartWithItems = await getCartWithItems(db, cart.id);
          const existingItem = cartWithItems?.items.find(
            (item) =>
              item.productId === productId &&
              normalizeVariantId(item.variantId) === normalizeVariantId(variantId)
          );

          if (existingItem) {
            await updateCartItemQuantityDB(db, existingItem.id, quantity);
          } else if (quantity > 0) {
            await addToCartDB(db, cart.id, storeId, {
              productId,
              variantId,
              quantity,
            });
          }

          const updatedCart = await getCartWithItems(db, cart.id);
          return json(
            {
              success: true,
              cart: updatedCart,
              source: 'db-auth',
            },
            { headers }
          );
        }

        const parseResult = UpdateItemSchema.safeParse(body);
        if (!parseResult.success) {
          return json(
            { error: 'Invalid input', details: parseResult.error.flatten() },
            { status: 400 }
          );
        }

        const item = await updateCartItemQuantityDB(
          db,
          parseResult.data.itemId,
          parseResult.data.quantity
        );
        const updatedCart = await getCartWithItems(db, cart.id);

        return json(
          {
            success: true,
            item,
            cart: updatedCart,
            source: 'db-auth',
          },
          { headers }
        );
      }

      if (method === 'DELETE') {
        const byProductResult = RemoveItemByProductSchema.safeParse(body);
        if (byProductResult.success) {
          const { productId, variantId } = byProductResult.data;
          const cartWithItems = await getCartWithItems(db, cart.id);
          const existingItem = cartWithItems?.items.find(
            (item) =>
              item.productId === productId &&
              normalizeVariantId(item.variantId) === normalizeVariantId(variantId)
          );

          if (existingItem) {
            await removeFromCartDB(db, existingItem.id);
          }

          const updatedCart = await getCartWithItems(db, cart.id);
          return json(
            {
              success: true,
              cart: updatedCart,
              source: 'db-auth',
            },
            { headers }
          );
        }

        const parseResult = RemoveItemSchema.safeParse(body);
        if (!parseResult.success) {
          return json(
            { error: 'Invalid input', details: parseResult.error.flatten() },
            { status: 400 }
          );
        }

        await removeFromCartDB(db, parseResult.data.itemId);
        const updatedCart = await getCartWithItems(db, cart.id);
        return json(
          {
            success: true,
            cart: updatedCart,
            source: 'db-auth',
          },
          { headers }
        );
      }

      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Handle clear for guest carts before add-item validation (POST only).
    if (method === 'POST' && body.intent === 'clear') {
      if (hasCartService) {
        const doResult = await clearCartDO(env as any, sessionId);
        if (doResult.success) {
          return json(
            {
              success: true,
              cart: doResult.cart,
              source: 'do',
            },
            { headers }
          );
        }
      }

      return json({ success: true, message: 'Cart cleared' }, { headers });
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

        // For guests, sync into visitor cart in D1.
        const visitorId = getVisitorId(request);
        const cart = await getOrCreateCart(db, storeId, {
          visitorId,
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
      const visitorId = getVisitorId(request);
      const cart = await getOrCreateCart(db, storeId, {
        visitorId,
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

      const visitorId = getVisitorId(request);
      const cart = await getOrCreateCart(db, storeId, {
        visitorId,
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

      const visitorId = getVisitorId(request);
      const cart = await getOrCreateCart(db, storeId, {
        visitorId,
      });

      await removeFromCartDB(db, parseResult.data.itemId);
      const cartWithItems = await getCartWithItems(db, cart.id);

      return json({
        success: true,
        cart: cartWithItems,
        source: 'db',
      }, { headers });
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

function normalizeVariantId(variantId: number | null | undefined): number | null {
  if (variantId === undefined || variantId === null) return null;
  return variantId;
}

async function parseRequestBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>;
  }

  const formData = await request.formData();
  const body: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    body[key] = typeof value === 'string' ? value : value.name;
  }

  return body;
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

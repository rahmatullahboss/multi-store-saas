/**
 * Cart DO Service - Helper functions to interact with Cart Durable Object
 * 
 * Usage:
 * ```ts
 * import { addToCart, getCart, removeFromCart } from '~/services/cart-do.server';
 * 
 * // In loader/action
 * const cart = await getCart(env, sessionId);
 * await addToCart(env, sessionId, { productId: 1, quantity: 2, price: 99.99, name: 'Product', storeId: 1 });
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CartItem {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  addedAt: number;
  updatedAt: number;
}

export interface CartState {
  items: CartItem[];
  storeId: number;
  total: number;
  itemCount: number;
  updatedAt: number;
}

export interface AddToCartParams {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  storeId: number;
}

export interface CartResponse {
  success: boolean;
  cart?: CartState;
  error?: string;
}

interface Env {
  CART_SERVICE: Fetcher;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get cart contents for a session
 */
export async function getCart(env: Env, sessionId: string): Promise<CartResponse> {
  try {
    const response = await env.CART_SERVICE.fetch(`http://internal/do/${sessionId}/get`, {
      method: 'GET',
    });
    
    return await response.json() as CartResponse;
  } catch (error) {
    console.error('getCart error:', error);
    return { success: false, error: 'Failed to get cart' };
  }
}

/**
 * Add item to cart
 */
export async function addToCart(env: Env, sessionId: string, params: AddToCartParams): Promise<CartResponse> {
  try {
    const response = await env.CART_SERVICE.fetch(`http://internal/do/${sessionId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    return await response.json() as CartResponse;
  } catch (error) {
    console.error('addToCart error:', error);
    return { success: false, error: 'Failed to add to cart' };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  env: Env, 
  sessionId: string, 
  productId: number, 
  variantId?: number
): Promise<CartResponse> {
  try {
    const response = await env.CART_SERVICE.fetch(`http://internal/do/${sessionId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId }),
    });
    
    return await response.json() as CartResponse;
  } catch (error) {
    console.error('removeFromCart error:', error);
    return { success: false, error: 'Failed to remove from cart' };
  }
}

/**
 * Update item quantity
 */
export async function updateCartItemQuantity(
  env: Env, 
  sessionId: string, 
  productId: number, 
  quantity: number,
  variantId?: number
): Promise<CartResponse> {
  try {
    const response = await env.CART_SERVICE.fetch(`http://internal/do/${sessionId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    
    return await response.json() as CartResponse;
  } catch (error) {
    console.error('updateCartItemQuantity error:', error);
    return { success: false, error: 'Failed to update cart' };
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(env: Env, sessionId: string): Promise<CartResponse> {
  try {
    const response = await env.CART_SERVICE.fetch(`http://internal/do/${sessionId}/clear`, {
      method: 'POST',
    });
    
    return await response.json() as CartResponse;
  } catch (error) {
    console.error('clearCart error:', error);
    return { success: false, error: 'Failed to clear cart' };
  }
}

/**
 * Get or create cart session ID from cookies
 */
export function getCartSessionId(request: Request): string {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...value] = c.trim().split('=');
      return [key, value.join('=')];
    })
  );
  
  return cookies['cart_session'] || generateSessionId();
}

/**
 * Generate a new cart session ID
 */
export function generateSessionId(): string {
  return `cs_${crypto.randomUUID()}`;
}

/**
 * Create Set-Cookie header for cart session
 */
export function createCartSessionCookie(sessionId: string, maxAge = 86400 * 30): string {
  return `cart_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

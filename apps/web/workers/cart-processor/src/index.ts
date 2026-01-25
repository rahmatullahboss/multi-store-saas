/**
 * Cart Processor Worker - Durable Objects for Race-Condition Free Cart Management
 * 
 * Solves the multi-tab cart synchronization problem:
 * Tab 1: Add item ──┐
 * Tab 2: Add item ──┼── All serialized through DO! No race conditions!
 * Tab 3: Remove ────┘
 * 
 * ============================================================================
 * ARCHITECTURE
 * ============================================================================
 * 
 * DO ID Pattern: cart-{sessionId}
 * - One DO per shopping session
 * - Survives page refresh
 * - Real-time sync across tabs
 * 
 * FREE TIER COMPATIBLE:
 * - Uses SQLite backend (no extra cost)
 * - Efficient batch operations
 * - Lazy initialization
 */

import { DurableObject } from "cloudflare:workers";

// ============================================================================
// CONSTANTS
// ============================================================================

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

const CONFIG = {
  // Cart expiry (24 hours of inactivity)
  CART_EXPIRY_MS: 24 * HOURS,
  
  // Max items per cart
  MAX_CART_ITEMS: 100,
  
  // Max quantity per item
  MAX_QUANTITY: 99,
  
  // Cleanup interval
  CLEANUP_INTERVAL_MS: 1 * HOURS,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface CartItem {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  addedAt: number;
  updatedAt: number;
}

interface CartState {
  items: CartItem[];
  storeId: number;
  total: number;
  itemCount: number;
  updatedAt: number;
}

interface AddItemRequest {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  storeId: number;
}

interface UpdateQuantityRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

interface RemoveItemRequest {
  productId: number;
  variantId?: number;
}

interface Env {
  CART_PROCESSOR: DurableObjectNamespace;
}

// ============================================================================
// CART PROCESSOR DURABLE OBJECT
// ============================================================================

export class CartProcessor extends DurableObject<Env> {
  private sql!: SqlStorage;
  private initialized = false;
  
  // In-memory cache for fast reads
  private itemsCache: Map<string, CartItem> = new Map();
  private storeId: number = 0;
  private lastAccess: number = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
  }

  /**
   * Lazy initialization - only create tables when first item is added
   */
  private ensureInitialized() {
    if (this.initialized) return;
    
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        product_id INTEGER NOT NULL,
        variant_id INTEGER DEFAULT 0,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        name TEXT NOT NULL,
        image TEXT,
        added_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (product_id, variant_id)
      )
    `);
    
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS cart_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    
    // Load existing items into memory cache
    this.loadFromStorage();
    
    this.initialized = true;
  }

  /**
   * Load cart items from SQLite into memory
   */
  private loadFromStorage() {
    const rows = this.sql.exec(`
      SELECT product_id, variant_id, quantity, price, name, image, added_at, updated_at
      FROM cart_items
    `).toArray() as unknown as Array<{
      product_id: number;
      variant_id: number;
      quantity: number;
      price: number;
      name: string;
      image: string | null;
      added_at: number;
      updated_at: number;
    }>;
    
    this.itemsCache.clear();
    for (const row of rows) {
      const key = this.getItemKey(row.product_id, row.variant_id);
      this.itemsCache.set(key, {
        productId: row.product_id,
        variantId: row.variant_id || undefined,
        quantity: row.quantity,
        price: row.price,
        name: row.name,
        image: row.image || undefined,
        addedAt: row.added_at,
        updatedAt: row.updated_at,
      });
    }
    
    // Load store ID
    const metaRows = this.sql.exec(`SELECT value FROM cart_meta WHERE key = 'store_id'`).toArray() as Array<{ value: string }>;
    if (metaRows.length > 0) {
      this.storeId = parseInt(metaRows[0].value, 10);
    }
  }

  /**
   * Generate unique key for cart item
   */
  private getItemKey(productId: number, variantId?: number): string {
    return `${productId}:${variantId || 0}`;
  }

  /**
   * Calculate cart totals
   */
  private calculateTotals(): { total: number; itemCount: number } {
    let total = 0;
    let itemCount = 0;
    
    for (const item of this.itemsCache.values()) {
      total += item.price * item.quantity;
      itemCount += item.quantity;
    }
    
    return { total: Math.round(total * 100) / 100, itemCount };
  }

  /**
   * Get current cart state
   */
  private getCartState(): CartState {
    const { total, itemCount } = this.calculateTotals();
    
    return {
      items: Array.from(this.itemsCache.values()).sort((a, b) => a.addedAt - b.addedAt),
      storeId: this.storeId,
      total,
      itemCount,
      updatedAt: this.lastAccess,
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    this.lastAccess = Date.now();

    try {
      switch (path) {
        case '/add':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.addItem(await request.json() as AddItemRequest);
          
        case '/remove':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.removeItem(await request.json() as RemoveItemRequest);
          
        case '/update':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.updateQuantity(await request.json() as UpdateQuantityRequest);
          
        case '/get':
          return this.getCart();
          
        case '/clear':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.clearCart();
          
        case '/health':
          return Response.json({ 
            status: 'ok', 
            initialized: this.initialized,
            itemCount: this.itemsCache.size,
          });
          
        default:
          return Response.json({ error: 'Not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('CartProcessor error:', error);
      return Response.json({ 
        error: 'Internal error', 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
  }

  /**
   * Add item to cart (or update quantity if exists)
   * ✅ No race condition - serialized execution in DO
   */
  private async addItem(data: AddItemRequest): Promise<Response> {
    // Validate input
    if (!data.productId || !data.quantity || data.quantity < 1) {
      return Response.json({ 
        success: false, 
        error: 'Invalid request: productId and quantity required' 
      }, { status: 400 });
    }
    
    if (data.quantity > CONFIG.MAX_QUANTITY) {
      return Response.json({ 
        success: false, 
        error: `Maximum quantity is ${CONFIG.MAX_QUANTITY}` 
      }, { status: 400 });
    }
    
    this.ensureInitialized();
    
    // Check max items limit
    if (this.itemsCache.size >= CONFIG.MAX_CART_ITEMS) {
      return Response.json({ 
        success: false, 
        error: `Cart is full. Maximum ${CONFIG.MAX_CART_ITEMS} items allowed.` 
      }, { status: 400 });
    }
    
    const key = this.getItemKey(data.productId, data.variantId);
    const now = Date.now();
    const existing = this.itemsCache.get(key);
    
    if (existing) {
      // Update quantity
      const newQuantity = Math.min(existing.quantity + data.quantity, CONFIG.MAX_QUANTITY);
      existing.quantity = newQuantity;
      existing.updatedAt = now;
      existing.price = data.price; // Update price in case it changed
      
      this.sql.exec(`
        UPDATE cart_items 
        SET quantity = ?, price = ?, updated_at = ?
        WHERE product_id = ? AND variant_id = ?
      `, newQuantity, data.price, now, data.productId, data.variantId || 0);
    } else {
      // Add new item
      const item: CartItem = {
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        price: data.price,
        name: data.name,
        image: data.image,
        addedAt: now,
        updatedAt: now,
      };
      
      this.itemsCache.set(key, item);
      
      this.sql.exec(`
        INSERT INTO cart_items (product_id, variant_id, quantity, price, name, image, added_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, data.productId, data.variantId || 0, data.quantity, data.price, data.name, data.image || null, now, now);
      
      // Store the store ID if this is the first item
      if (data.storeId && !this.storeId) {
        this.storeId = data.storeId;
        this.sql.exec(`
          INSERT OR REPLACE INTO cart_meta (key, value) VALUES ('store_id', ?)
        `, String(data.storeId));
      }
    }
    
    // Schedule cleanup alarm
    await this.scheduleCleanup();
    
    return Response.json({ 
      success: true, 
      cart: this.getCartState(),
    });
  }

  /**
   * Remove item from cart
   */
  private async removeItem(data: RemoveItemRequest): Promise<Response> {
    if (!data.productId) {
      return Response.json({ 
        success: false, 
        error: 'productId required' 
      }, { status: 400 });
    }
    
    this.ensureInitialized();
    
    const key = this.getItemKey(data.productId, data.variantId);
    
    if (!this.itemsCache.has(key)) {
      return Response.json({ 
        success: false, 
        error: 'Item not in cart' 
      }, { status: 404 });
    }
    
    this.itemsCache.delete(key);
    
    this.sql.exec(`
      DELETE FROM cart_items 
      WHERE product_id = ? AND variant_id = ?
    `, data.productId, data.variantId || 0);
    
    return Response.json({ 
      success: true, 
      cart: this.getCartState(),
    });
  }

  /**
   * Update item quantity
   */
  private async updateQuantity(data: UpdateQuantityRequest): Promise<Response> {
    if (!data.productId || data.quantity === undefined) {
      return Response.json({ 
        success: false, 
        error: 'productId and quantity required' 
      }, { status: 400 });
    }
    
    this.ensureInitialized();
    
    const key = this.getItemKey(data.productId, data.variantId);
    const item = this.itemsCache.get(key);
    
    if (!item) {
      return Response.json({ 
        success: false, 
        error: 'Item not in cart' 
      }, { status: 404 });
    }
    
    // If quantity is 0 or less, remove the item
    if (data.quantity <= 0) {
      return this.removeItem({ productId: data.productId, variantId: data.variantId });
    }
    
    // Cap at max quantity
    const newQuantity = Math.min(data.quantity, CONFIG.MAX_QUANTITY);
    const now = Date.now();
    
    item.quantity = newQuantity;
    item.updatedAt = now;
    
    this.sql.exec(`
      UPDATE cart_items 
      SET quantity = ?, updated_at = ?
      WHERE product_id = ? AND variant_id = ?
    `, newQuantity, now, data.productId, data.variantId || 0);
    
    return Response.json({ 
      success: true, 
      cart: this.getCartState(),
    });
  }

  /**
   * Get cart contents
   */
  private getCart(): Response {
    this.ensureInitialized();
    
    return Response.json({ 
      success: true, 
      cart: this.getCartState(),
    });
  }

  /**
   * Clear entire cart
   */
  private async clearCart(): Promise<Response> {
    this.ensureInitialized();
    
    this.itemsCache.clear();
    this.sql.exec(`DELETE FROM cart_items`);
    
    return Response.json({ 
      success: true, 
      cart: this.getCartState(),
    });
  }

  /**
   * Schedule cleanup alarm for expired carts
   */
  private async scheduleCleanup() {
    const existingAlarm = await this.ctx.storage.getAlarm();
    if (!existingAlarm) {
      await this.ctx.storage.setAlarm(Date.now() + CONFIG.CART_EXPIRY_MS);
    }
  }

  /**
   * Alarm handler - cleanup expired cart
   */
  async alarm(): Promise<void> {
    const now = Date.now();
    
    // If cart hasn't been accessed in 24 hours, clear it
    if (this.lastAccess && now - this.lastAccess > CONFIG.CART_EXPIRY_MS) {
      console.log('Cart expired, clearing...');
      this.itemsCache.clear();
      this.sql.exec(`DELETE FROM cart_items`);
      this.sql.exec(`DELETE FROM cart_meta`);
      this.initialized = false;
    }
  }
}

// ============================================================================
// WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Route: /do/:sessionId/* - Forward to Durable Object
    const match = url.pathname.match(/^\/do\/([a-zA-Z0-9_-]+)(\/.*)$/);
    if (match) {
      const sessionId = match[1];
      const doPath = match[2] || '/';
      
      const id = env.CART_PROCESSOR.idFromName(`cart-${sessionId}`);
      const stub = env.CART_PROCESSOR.get(id);
      
      // Forward request to DO with modified URL
      const doUrl = new URL(request.url);
      doUrl.pathname = doPath;
      
      return stub.fetch(new Request(doUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }));
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'cart-processor' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};

/**
 * Checkout Lock Worker - Durable Objects for Atomic Checkout Locking
 * 
 * Solves the double-payment problem:
 * User clicks "Pay" twice ──► Only ONE order is created! ✅
 * 
 * ============================================================================
 * ARCHITECTURE
 * ============================================================================
 * 
 * DO ID Pattern: checkout-{cartId} or checkout-{orderId}
 * - One DO per checkout session
 * - Atomic lock acquisition (no race conditions)
 * - Auto-unlock after 5 minutes (timeout protection)
 * - No SQLite needed (in-memory state only)
 * 
 * FREE TIER COMPATIBLE:
 * - Minimal storage usage
 * - Uses alarms for auto-unlock
 */

import { DurableObject } from "cloudflare:workers";

// ============================================================================
// CONSTANTS
// ============================================================================

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const CONFIG = {
  // Lock timeout (5 minutes)
  LOCK_TIMEOUT_MS: 5 * MINUTES,
  
  // Max lock duration (prevent abuse)
  MAX_LOCK_DURATION_MS: 10 * MINUTES,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface LockState {
  locked: boolean;
  orderId: string | null;
  lockedAt: number | null;
  lockedBy: string | null;
  expiresAt: number | null;
}

interface LockRequest {
  orderId: string;
  lockedBy?: string;  // User ID or session ID
  ttlMs?: number;     // Custom TTL (capped at MAX_LOCK_DURATION_MS)
}

interface Env {
  CHECKOUT_LOCK: DurableObjectNamespace;
}

// ============================================================================
// CHECKOUT LOCK DURABLE OBJECT
// ============================================================================

export class CheckoutLock extends DurableObject<Env> {
  private locked = false;
  private orderId: string | null = null;
  private lockedAt: number | null = null;
  private lockedBy: string | null = null;
  private expiresAt: number | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    
    // Restore state from storage (in case of DO restart)
    this.ctx.blockConcurrencyWhile(async () => {
      const state = await this.ctx.storage.get<LockState>('lockState');
      if (state) {
        // Check if lock has expired
        if (state.expiresAt && Date.now() > state.expiresAt) {
          // Lock expired, clear it
          await this.ctx.storage.delete('lockState');
        } else {
          this.locked = state.locked;
          this.orderId = state.orderId;
          this.lockedAt = state.lockedAt;
          this.lockedBy = state.lockedBy;
          this.expiresAt = state.expiresAt;
        }
      }
    });
  }

  /**
   * Persist lock state to storage
   */
  private async persistState(): Promise<void> {
    const state: LockState = {
      locked: this.locked,
      orderId: this.orderId,
      lockedAt: this.lockedAt,
      lockedBy: this.lockedBy,
      expiresAt: this.expiresAt,
    };
    await this.ctx.storage.put('lockState', state);
  }

  /**
   * Clear lock state
   */
  private async clearState(): Promise<void> {
    this.locked = false;
    this.orderId = null;
    this.lockedAt = null;
    this.lockedBy = null;
    this.expiresAt = null;
    await this.ctx.storage.delete('lockState');
    await this.ctx.storage.deleteAlarm();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/lock':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.acquireLock(await request.json() as LockRequest);
          
        case '/unlock':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.releaseLock(await request.json() as { orderId?: string; force?: boolean });
          
        case '/status':
          return this.getLockStatus();
          
        case '/extend':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.extendLock(await request.json() as { orderId: string; ttlMs?: number });
          
        case '/health':
          return Response.json({ 
            status: 'ok', 
            locked: this.locked,
          });
          
        default:
          return Response.json({ error: 'Not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('CheckoutLock error:', error);
      return Response.json({ 
        error: 'Internal error', 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
  }

  /**
   * Acquire checkout lock
   * ✅ Atomic - no race condition possible in DO
   */
  private async acquireLock(data: LockRequest): Promise<Response> {
    const now = Date.now();
    
    // Validate input
    if (!data.orderId) {
      return Response.json({ 
        success: false, 
        error: 'orderId required' 
      }, { status: 400 });
    }
    
    // Check if already locked
    if (this.locked) {
      // Check if lock has expired
      if (this.expiresAt && now > this.expiresAt) {
        // Lock expired, we can acquire it
        console.log(`Previous lock expired for order ${this.orderId}, acquiring new lock`);
      } else {
        // Lock is active
        return Response.json({ 
          success: false, 
          error: 'Checkout already in progress',
          existingOrderId: this.orderId,
          lockedBy: this.lockedBy,
          lockedAt: this.lockedAt,
          expiresAt: this.expiresAt,
        }, { status: 409 });
      }
    }
    
    // Calculate TTL (default 5 minutes, max 10 minutes)
    const ttlMs = Math.min(data.ttlMs || CONFIG.LOCK_TIMEOUT_MS, CONFIG.MAX_LOCK_DURATION_MS);
    
    // Acquire lock
    this.locked = true;
    this.orderId = data.orderId;
    this.lockedAt = now;
    this.lockedBy = data.lockedBy || null;
    this.expiresAt = now + ttlMs;
    
    // Persist state
    await this.persistState();
    
    // Set alarm for auto-unlock
    await this.ctx.storage.setAlarm(this.expiresAt);
    
    console.log(`Lock acquired for order ${data.orderId}, expires at ${new Date(this.expiresAt).toISOString()}`);
    
    return Response.json({ 
      success: true, 
      locked: true,
      orderId: this.orderId,
      lockedAt: this.lockedAt,
      expiresAt: this.expiresAt,
      ttlMs,
    });
  }

  /**
   * Release checkout lock
   */
  private async releaseLock(data: { orderId?: string; force?: boolean }): Promise<Response> {
    // If not locked, nothing to do
    if (!this.locked) {
      return Response.json({ 
        success: true, 
        message: 'Lock was not held',
      });
    }
    
    // If orderId provided, verify it matches (unless force=true)
    if (data.orderId && data.orderId !== this.orderId && !data.force) {
      return Response.json({ 
        success: false, 
        error: 'Order ID mismatch',
        expectedOrderId: this.orderId,
        providedOrderId: data.orderId,
      }, { status: 403 });
    }
    
    const previousOrderId = this.orderId;
    
    // Release lock
    await this.clearState();
    
    console.log(`Lock released for order ${previousOrderId}`);
    
    return Response.json({ 
      success: true, 
      message: 'Lock released',
      previousOrderId,
    });
  }

  /**
   * Get current lock status
   */
  private getLockStatus(): Response {
    const now = Date.now();
    
    // Check if lock has expired
    const isExpired = this.expiresAt ? now > this.expiresAt : false;
    const effectiveLocked = this.locked && !isExpired;
    
    return Response.json({
      locked: effectiveLocked,
      orderId: effectiveLocked ? this.orderId : null,
      lockedAt: effectiveLocked ? this.lockedAt : null,
      lockedBy: effectiveLocked ? this.lockedBy : null,
      expiresAt: effectiveLocked ? this.expiresAt : null,
      remainingMs: effectiveLocked && this.expiresAt ? Math.max(0, this.expiresAt - now) : 0,
      isExpired,
    });
  }

  /**
   * Extend lock duration
   */
  private async extendLock(data: { orderId: string; ttlMs?: number }): Promise<Response> {
    const now = Date.now();
    
    // Validate input
    if (!data.orderId) {
      return Response.json({ 
        success: false, 
        error: 'orderId required' 
      }, { status: 400 });
    }
    
    // Check if locked
    if (!this.locked) {
      return Response.json({ 
        success: false, 
        error: 'No active lock to extend' 
      }, { status: 404 });
    }
    
    // Check if lock has expired
    if (this.expiresAt && now > this.expiresAt) {
      return Response.json({ 
        success: false, 
        error: 'Lock has expired' 
      }, { status: 410 });
    }
    
    // Verify order ID matches
    if (data.orderId !== this.orderId) {
      return Response.json({ 
        success: false, 
        error: 'Order ID mismatch' 
      }, { status: 403 });
    }
    
    // Calculate new expiry
    const ttlMs = Math.min(data.ttlMs || CONFIG.LOCK_TIMEOUT_MS, CONFIG.MAX_LOCK_DURATION_MS);
    this.expiresAt = now + ttlMs;
    
    // Persist and update alarm
    await this.persistState();
    await this.ctx.storage.setAlarm(this.expiresAt);
    
    return Response.json({ 
      success: true, 
      message: 'Lock extended',
      expiresAt: this.expiresAt,
      ttlMs,
    });
  }

  /**
   * Alarm handler - auto-unlock on timeout
   */
  async alarm(): Promise<void> {
    if (this.locked) {
      console.log(`Auto-unlock triggered for order ${this.orderId} (timeout)`);
      await this.clearState();
    }
  }
}

// ============================================================================
// WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Route: /do/:cartId/* - Forward to Durable Object
    const match = url.pathname.match(/^\/do\/([a-zA-Z0-9_-]+)(\/.*)$/);
    if (match) {
      const cartId = match[1];
      const doPath = match[2] || '/';
      
      const id = env.CHECKOUT_LOCK.idFromName(`checkout-${cartId}`);
      const stub = env.CHECKOUT_LOCK.get(id);
      
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
      return Response.json({ status: 'ok', service: 'checkout-lock' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};

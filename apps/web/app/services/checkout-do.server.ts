/**
 * Checkout Lock DO Service - Helper functions for atomic checkout locking
 * 
 * Prevents double-payment problem:
 * User clicks "Pay" twice ──► Only ONE order is created! ✅
 * 
 * Usage:
 * ```ts
 * import { acquireCheckoutLock, releaseCheckoutLock } from '~/services/checkout-do.server';
 * 
 * // In checkout action
 * const lock = await acquireCheckoutLock(env, cartId, orderId);
 * if (!lock.success) {
 *   return json({ error: 'Payment already processing' }, { status: 409 });
 * }
 * 
 * try {
 *   await processPayment();
 * } finally {
 *   await releaseCheckoutLock(env, cartId, orderId);
 * }
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LockResult {
  success: boolean;
  locked?: boolean;
  orderId?: string;
  lockedAt?: number;
  expiresAt?: number;
  ttlMs?: number;
  error?: string;
  existingOrderId?: string;
  lockedBy?: string;
}

export interface LockStatus {
  locked: boolean;
  orderId: string | null;
  lockedAt: number | null;
  lockedBy: string | null;
  expiresAt: number | null;
  remainingMs: number;
  isExpired: boolean;
}

export interface AcquireLockParams {
  orderId: string;
  lockedBy?: string;
  ttlMs?: number;
}

interface Env {
  CHECKOUT_SERVICE: Fetcher;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Acquire checkout lock
 * Returns success: false if lock is already held
 */
export async function acquireCheckoutLock(
  env: Env, 
  cartId: string, 
  params: AcquireLockParams
): Promise<LockResult> {
  try {
    const response = await env.CHECKOUT_SERVICE.fetch(`http://internal/do/${cartId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    return await response.json() as LockResult;
  } catch (error) {
    console.error('acquireCheckoutLock error:', error);
    return { success: false, error: 'Failed to acquire lock' };
  }
}

/**
 * Release checkout lock
 */
export async function releaseCheckoutLock(
  env: Env, 
  cartId: string, 
  orderId?: string,
  force = false
): Promise<LockResult> {
  try {
    const response = await env.CHECKOUT_SERVICE.fetch(`http://internal/do/${cartId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, force }),
    });
    
    return await response.json() as LockResult;
  } catch (error) {
    console.error('releaseCheckoutLock error:', error);
    return { success: false, error: 'Failed to release lock' };
  }
}

/**
 * Check lock status without acquiring
 */
export async function checkLockStatus(env: Env, cartId: string): Promise<LockStatus> {
  try {
    const response = await env.CHECKOUT_SERVICE.fetch(`http://internal/do/${cartId}/status`, {
      method: 'GET',
    });
    
    return await response.json() as LockStatus;
  } catch (error) {
    console.error('checkLockStatus error:', error);
    return {
      locked: false,
      orderId: null,
      lockedAt: null,
      lockedBy: null,
      expiresAt: null,
      remainingMs: 0,
      isExpired: true,
    };
  }
}

/**
 * Extend lock duration (if payment is taking longer than expected)
 */
export async function extendCheckoutLock(
  env: Env, 
  cartId: string, 
  orderId: string,
  ttlMs?: number
): Promise<LockResult> {
  try {
    const response = await env.CHECKOUT_SERVICE.fetch(`http://internal/do/${cartId}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ttlMs }),
    });
    
    return await response.json() as LockResult;
  } catch (error) {
    console.error('extendCheckoutLock error:', error);
    return { success: false, error: 'Failed to extend lock' };
  }
}

/**
 * Higher-order function for safe checkout processing
 * Automatically acquires lock, executes callback, and releases lock
 */
export async function withCheckoutLock<T>(
  env: Env,
  cartId: string,
  orderId: string,
  userId: string,
  callback: () => Promise<T>
): Promise<{ success: true; result: T } | { success: false; error: string }> {
  // Acquire lock
  const lock = await acquireCheckoutLock(env, cartId, {
    orderId,
    lockedBy: userId,
    ttlMs: 5 * 60 * 1000, // 5 minutes
  });
  
  if (!lock.success) {
    return { 
      success: false, 
      error: lock.error || 'Checkout already in progress' 
    };
  }
  
  try {
    const result = await callback();
    return { success: true, result };
  } catch (error) {
    throw error;
  } finally {
    // Always release lock
    await releaseCheckoutLock(env, cartId, orderId);
  }
}

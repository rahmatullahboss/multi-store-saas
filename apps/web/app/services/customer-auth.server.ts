/**
 * Customer Authentication Service
 * 
 * Handles customer session management and Google OAuth for storefront customers.
 * Only available for Premium/Business plan stores.
 */

import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { customers, stores } from '@db/schema';

// ============================================================================
// TYPES
// ============================================================================

export type CustomerSessionData = {
  customerId: number;
  storeId: number;
};

export type CustomerSessionFlashData = {
  error: string;
  success: string;
};

export type AuthenticatedCustomer = {
  id: number;
  email: string | null;
  name: string | null;
  phone: string | null;
  storeId: number;
};

// All plans use shared platform OAuth for customer sign-in

// ============================================================================
// SESSION STORAGE
// ============================================================================

/**
 * Create customer-specific session storage
 * Uses separate cookie from merchant session
 */
export function getCustomerSessionStorage(env: Env) {
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set in your environment variables.');
  }

  return createCookieSessionStorage<CustomerSessionData, CustomerSessionFlashData>({
    cookie: {
      name: '__customer_session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [env.SESSION_SECRET],
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days for customer sessions
    },
  });
}

export async function getCustomerSession(request: Request, env: Env) {
  const storage = getCustomerSessionStorage(env);
  return storage.getSession(request.headers.get('Cookie'));
}

export async function commitCustomerSession(session: any, env: Env) {
  const storage = getCustomerSessionStorage(env);
  return storage.commitSession(session);
}

export async function destroyCustomerSession(session: any, env: Env) {
  const storage = getCustomerSessionStorage(env);
  return storage.destroySession(session);
}

// ============================================================================
// PLAN CHECK - All plans can use shared OAuth
// ============================================================================

/**
 * Check if a store can use Customer Google Sign-In
 * All plans can use shared platform OAuth
 * (Future: Premium/Business could have per-store OAuth customization)
 */
export async function canStoreUseGoogleAuth(storeId: number, db: D1Database): Promise<boolean> {
  const drizzleDb = drizzle(db);

  // Just verify the store exists and is active
  const storeResult = await drizzleDb
    .select({ id: stores.id, isActive: stores.isActive })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!storeResult || storeResult.length === 0) {
    return false;
  }

  // All plans get shared Google Sign-In
  return storeResult[0].isActive !== false;
}

// ============================================================================
// CUSTOMER SESSION MANAGEMENT
// ============================================================================

/**
 * Get the customer ID from the session
 */
export async function getCustomerId(request: Request, env: Env): Promise<number | null> {
  const session = await getCustomerSession(request, env);
  const customerId = session.get('customerId');
  return customerId ?? null;
}

/**
 * Get the store ID associated with the customer session
 */
export async function getCustomerStoreId(request: Request, env: Env): Promise<number | null> {
  const session = await getCustomerSession(request, env);
  const storeId = session.get('storeId');
  return storeId ?? null;
}

/**
 * Require customer to be logged in, otherwise redirect
 */
export async function requireCustomer(
  request: Request,
  env: Env,
  redirectTo: string = '/'
): Promise<number> {
  const customerId = await getCustomerId(request, env);
  if (!customerId) {
    throw redirect(redirectTo);
  }
  return customerId;
}

/**
 * Get the authenticated customer details
 */
export async function getCustomer(
  request: Request,
  env: Env,
  db: D1Database
): Promise<AuthenticatedCustomer | null> {
  const customerId = await getCustomerId(request, env);
  if (!customerId) return null;

  const drizzleDb = drizzle(db);
  const customerResult = await drizzleDb
    .select({
      id: customers.id,
      email: customers.email,
      name: customers.name,
      phone: customers.phone,
      storeId: customers.storeId,
    })
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  return customerResult[0] ?? null;
}

/**
 * Create a session for a customer
 */
export async function createCustomerSession(
  customerId: number,
  storeId: number,
  redirectTo: string,
  env: Env
): Promise<Response> {
  const session = await getCustomerSession(new Request('http://localhost'), env);
  session.set('customerId', customerId);
  session.set('storeId', storeId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitCustomerSession(session, env),
    },
  });
}

/**
 * Logout a customer (destroy session)
 */
export async function logoutCustomer(request: Request, storeUrl: string, env: Env): Promise<Response> {
  const session = await getCustomerSession(request, env);

  return redirect(storeUrl, {
    headers: {
      'Set-Cookie': await destroyCustomerSession(session, env),
    },
  });
}

// ============================================================================
// GOOGLE OAUTH HELPERS
// ============================================================================

/**
 * Find or create a customer by Google ID
 */
export async function findOrCreateGoogleCustomer(
  storeId: number,
  googleId: string,
  email: string,
  name: string | null,
  db: D1Database
): Promise<{ customer: typeof customers.$inferSelect; isNew: boolean }> {
  const drizzleDb = drizzle(db);
  const now = new Date();

  // First, try to find existing customer by Google ID in this store
  const existingByGoogle = await drizzleDb
    .select()
    .from(customers)
    .where(and(eq(customers.storeId, storeId), eq(customers.googleId, googleId)))
    .limit(1);

  if (existingByGoogle.length > 0) {
    // Update last login
    await drizzleDb
      .update(customers)
      .set({ lastLoginAt: now, updatedAt: now })
      .where(eq(customers.id, existingByGoogle[0].id));

    return { customer: existingByGoogle[0], isNew: false };
  }

  // Check if customer exists by email (for linking)
  const existingByEmail = await drizzleDb
    .select()
    .from(customers)
    .where(and(eq(customers.storeId, storeId), eq(customers.email, email.toLowerCase())))
    .limit(1);

  if (existingByEmail.length > 0) {
    // Link Google ID to existing email customer
    await drizzleDb
      .update(customers)
      .set({
        googleId,
        authProvider: 'google',
        lastLoginAt: now,
        updatedAt: now,
        name: existingByEmail[0].name || name, // Keep existing name if set
      })
      .where(eq(customers.id, existingByEmail[0].id));

    return { customer: { ...existingByEmail[0], googleId, authProvider: 'google' as const }, isNew: false };
  }

  // Create new customer
  const newCustomerResult = await drizzleDb
    .insert(customers)
    .values({
      storeId,
      email: email.toLowerCase(),
      name,
      googleId,
      authProvider: 'google',
      lastLoginAt: now,
      segment: 'new',
    })
    .returning();

  return { customer: newCustomerResult[0], isNew: true };
}

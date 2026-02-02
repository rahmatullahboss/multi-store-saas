/**
 * Customer Authentication Service
 * 
 * Handles customer session management and Google OAuth for storefront customers.
 * Only available for Premium/Business plan stores.
 */

import { createCookieSessionStorage, redirect, Session } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { customers, stores } from '@db/schema';
import { hashPassword, verifyPassword } from './auth.server';


interface TokenPayload {
  customerId: number;
  storeId: number;
  type: string;
  exp: number;
  iat: number;
}

// Simple signed token implementation using web crypto
async function signToken(data: Record<string, unknown>, secret: string, expiresInSeconds: number): Promise<string> {

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { ...data, exp: now + expiresInSeconds, iat: now };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureInput)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return `${signatureInput}.${encodedSignature}`;
}

async function verifyToken(token: string, secret: string): Promise<TokenPayload | null> {

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = Uint8Array.from(
      atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(signatureInput)
    );
    
    if (!isValid) return null;
    
    const payload = JSON.parse(atob(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) return null;
    
    return payload;
  } catch {
    return null;
  }
}


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
      sameSite: 'lax', // Lax is better for top-level redirects
      secrets: [env.SESSION_SECRET],
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      maxAge: 60 * 60 * 24 * 30, // 30 days for customer sessions
    },
  });
}

export async function getCustomerSession(request: Request, env: Env) {
  const storage = getCustomerSessionStorage(env);
  return storage.getSession(request.headers.get('Cookie'));
}

export async function commitCustomerSession(session: Session<CustomerSessionData, CustomerSessionFlashData>, env: Env) {

  const storage = getCustomerSessionStorage(env);
  return storage.commitSession(session);
}

export async function destroyCustomerSession(session: Session<CustomerSessionData, CustomerSessionFlashData>, env: Env) {

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

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

interface CustomerRegisterParams {
  storeId: number;
  email: string;
  password: string;
  name: string;
  db: D1Database;
}

interface CustomerLoginParams {
  storeId: number;
  email: string;
  password: string;
  db: D1Database;
}

/**
 * Register a new customer
 */
export async function registerCustomer({ storeId, email, password, name, db }: CustomerRegisterParams) {
  const drizzleDb = drizzle(db);
  const normalizedEmail = email.toLowerCase().trim();

  // Validate inputs
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'Invalid email address' };
  }

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }

  if (!name || name.trim().length < 2) {
    return { error: 'Name must be at least 2 characters long' };
  }

  // Check if customer exists in this store
  const existingCustomer = await drizzleDb
    .select()
    .from(customers)
    .where(and(eq(customers.storeId, storeId), eq(customers.email, normalizedEmail)))
    .limit(1);

  if (existingCustomer.length > 0) {
    return { error: 'This email is already registered in this store.' };
  }

  try {
    const passwordHash = await hashPassword(password);
    const now = new Date();

    const newCustomer = await drizzleDb
      .insert(customers)
      .values({
        storeId,
        email: normalizedEmail,
        name,
        passwordHash,
        authProvider: 'email',
        lastLoginAt: now,
        segment: 'new',
      })
      .returning();

    return { customer: newCustomer[0] };
  } catch (error) {
    console.error('[customer-auth] Registration error:', error);
    return { error: 'Failed to create account. Please try again.' };
  }
}

/**
 * Login a customer
 */
export async function loginCustomer({ storeId, email, password, db }: CustomerLoginParams) {
  const drizzleDb = drizzle(db);
  const normalizedEmail = email.toLowerCase().trim();

  // Find customer
  const customerResult = await drizzleDb
    .select()
    .from(customers)
    .where(and(eq(customers.storeId, storeId), eq(customers.email, normalizedEmail)))
    .limit(1);

  if (customerResult.length === 0) {
    return { error: 'Invalid email or password' };
  }

  const customer = customerResult[0];

  // Check password (only if they have a password hash)
  if (!customer.passwordHash) {
    // If they signed up via Google but trying to login with password
    if (customer.authProvider === 'google') {
      return { error: 'Please sign in with Google' };
    }
    return { error: 'Invalid email or password' };
  }

  try {
    const isValid = await verifyPassword(password, customer.passwordHash);

    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    // Update last login
    await drizzleDb
      .update(customers)
      .set({ lastLoginAt: new Date() })
      .where(eq(customers.id, customer.id));

    return { customer };
  } catch (error) {
    console.error('[customer-auth] Login verification error:', error);
    return { error: 'An error occurred. Please try again.' };
  }
}

// ============================================================================
// SESSION TRANSFER (Multi-domain support)
// ============================================================================

/**
 * Create a short-lived token to transfer session to another domain
 */
export async function createTransferToken(
  customerId: number,
  storeId: number,
  env: Env
): Promise<string> {
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET required for token generation');
  }
  
  // Create a signed token valid for 5 minutes
  return signToken(
    { customerId, storeId, type: 'session_transfer' },
    env.SESSION_SECRET,
    5 * 60 // 5 minutes
  );
}

/**
 * Validate a transfer token
 */
export async function validateTransferToken(
  token: string,
  env: Env
): Promise<{ customerId: number; storeId: number } | null> {
  if (!env.SESSION_SECRET) return null;
  
  const payload = await verifyToken(token, env.SESSION_SECRET);
  
  if (!payload || payload.type !== 'session_transfer') {
    return null;
  }
  
  return {
    customerId: payload.customerId,
    storeId: payload.storeId
  };
}

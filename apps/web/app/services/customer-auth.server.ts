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
  customerId?: number;
  storeId?: number;
  origin?: string;
  jti?: string;
  type: string;
  exp: number;
  iat: number;
}

const oneTimeTokenMemory = new Map<string, number>();
const pkceVerifierMemory = new Map<string, { verifier: string; expiresAt: number }>();

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

function normalizeOrigin(origin: string): string | null {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function parseSaasBaseDomain(rawDomain?: string): string {
  const fallback = 'localhost';
  if (!rawDomain) return fallback;

  let saasDomain = rawDomain.trim();
  if (saasDomain.includes('://')) {
    saasDomain = saasDomain.split('://')[1];
  }
  if (saasDomain.includes('/')) {
    saasDomain = saasDomain.split('/')[0];
  }
  if (saasDomain.startsWith('www.')) {
    saasDomain = saasDomain.slice(4);
  }
  // Drop port from base domain for subdomain composition.
  if (saasDomain.includes(':')) {
    saasDomain = saasDomain.split(':')[0];
  }
  return saasDomain || fallback;
}

export function getStoreAllowedOrigins(
  store: { subdomain?: string | null; customDomain?: string | null },
  env: Env
): string[] {
  const allowed = new Set<string>();

  if (store.customDomain) {
    const customOrigin = normalizeOrigin(`https://${store.customDomain}`);
    if (customOrigin) allowed.add(customOrigin);
  }

  if (store.subdomain) {
    const baseDomain = parseSaasBaseDomain(env.SAAS_DOMAIN);
    const platformOrigin = normalizeOrigin(`https://${store.subdomain}.${baseDomain}`);
    if (platformOrigin) allowed.add(platformOrigin);
  }

  // Local development convenience.
  if ((env.ENVIRONMENT || 'production') !== 'production') {
    const localOrigin = normalizeOrigin('http://localhost:5173');
    if (localOrigin) allowed.add(localOrigin);
  }

  return Array.from(allowed);
}

export function resolveSafeStoreOrigin(
  requestedOrigin: string | null,
  allowedOrigins: string[],
  fallbackOrigin: string
): string {
  const normalizedFallback = normalizeOrigin(fallbackOrigin) || fallbackOrigin;
  const requested = requestedOrigin ? normalizeOrigin(requestedOrigin) : null;
  if (!requested) return normalizedFallback;
  return allowedOrigins.includes(requested) ? requested : normalizedFallback;
}

async function consumeOneTimeTokenId(tokenId: string, env: Env, ttlSeconds: number): Promise<boolean> {
  const key = `auth:once:${tokenId}`;

  // Prefer KV for cross-worker replay protection.
  if (env.STORE_CACHE) {
    const existing = await env.STORE_CACHE.get(key);
    if (existing) return false;
    await env.STORE_CACHE.put(key, '1', { expirationTtl: ttlSeconds });
    return true;
  }

  // Dev/staging fallback when KV binding is unavailable.
  // This protects against simple replay on the same worker process.
  const now = Date.now();
  const existingExpiry = oneTimeTokenMemory.get(key);
  if (existingExpiry && existingExpiry > now) return false;

  oneTimeTokenMemory.set(key, now + ttlSeconds * 1000);

  // Opportunistic cleanup to avoid unbounded memory growth.
  if (oneTimeTokenMemory.size > 1000) {
    for (const [k, expiresAt] of oneTimeTokenMemory.entries()) {
      if (expiresAt <= now) {
        oneTimeTokenMemory.delete(k);
      }
    }
  }

  return true;
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateCodeVerifier(): string {
  // RFC 7636: code_verifier length MUST be between 43 and 128 characters.
  const random = crypto.getRandomValues(new Uint8Array(48));
  const verifier = toBase64Url(random);
  return verifier.length >= 43 ? verifier : `${verifier}${'A'.repeat(43 - verifier.length)}`;
}

async function createCodeChallengeS256(codeVerifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return toBase64Url(new Uint8Array(digest));
}

async function storePkceVerifier(
  transactionId: string,
  codeVerifier: string,
  env: Env,
  ttlSeconds: number
): Promise<void> {
  const key = `auth:pkce:${transactionId}`;
  if (env.STORE_CACHE) {
    await env.STORE_CACHE.put(key, codeVerifier, { expirationTtl: ttlSeconds });
    return;
  }
  pkceVerifierMemory.set(key, {
    verifier: codeVerifier,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function consumePkceVerifier(
  transactionId: string,
  env: Env
): Promise<string | null> {
  const key = `auth:pkce:${transactionId}`;
  if (env.STORE_CACHE) {
    const value = await env.STORE_CACHE.get(key);
    if (!value) return null;
    await env.STORE_CACHE.delete(key);
    return value;
  }

  const entry = pkceVerifierMemory.get(key);
  if (!entry) return null;
  pkceVerifierMemory.delete(key);
  if (entry.expiresAt <= Date.now()) return null;
  return entry.verifier;
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
  const envName = env.ENVIRONMENT || 'production';
  const sessionSecret = env.SESSION_SECRET;

  // Staging/dev safety:
  // Public storefront routes may call `getCustomer()` (session read) even when you haven't
  // configured secrets yet. Don't take down the whole storefront for that.
  //
  // In production, this must be configured; otherwise cookies are not protected.
  if (!sessionSecret) {
    if (envName === 'production') {
      throw new Error('SESSION_SECRET must be set in your environment variables.');
    }

    // Ephemeral fallback secret: allows read/write session APIs without crashing.
    // Sessions will be invalidated when the worker restarts or when you set a real secret.
    console.warn('[customer-auth] SESSION_SECRET missing; using ephemeral fallback (non-production)');
  }

  // Use crypto.randomUUID() for ephemeral fallback — unpredictable per-worker-instance,
  // unlike a hardcoded string which would be visible in source code.
  const ephemeralFallback = crypto.randomUUID();

  return createCookieSessionStorage<CustomerSessionData, CustomerSessionFlashData>({
    cookie: {
      name: '__customer_session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax', // Lax is better for top-level redirects
      secrets: [sessionSecret || ephemeralFallback],
      secure: envName === 'production', // Only secure in production
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
  const storeId = await getCustomerStoreId(request, env);
  if (!storeId) return null;

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
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
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
      .where(and(eq(customers.id, existingByGoogle[0].id), eq(customers.storeId, storeId)));

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
      .where(and(eq(customers.id, existingByEmail[0].id), eq(customers.storeId, storeId)));

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
      .where(and(eq(customers.id, customer.id), eq(customers.storeId, storeId)));

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
  const jti = crypto.randomUUID();
  return signToken(
    { customerId, storeId, type: 'session_transfer', jti },
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
  
  if (
    !payload ||
    payload.type !== 'session_transfer' ||
    typeof payload.customerId !== 'number' ||
    typeof payload.storeId !== 'number' ||
    typeof payload.jti !== 'string'
  ) {
    return null;
  }

  const isFresh = await consumeOneTimeTokenId(payload.jti, env, 5 * 60);
  if (!isFresh) {
    return null;
  }
  
  return {
    customerId: payload.customerId,
    storeId: payload.storeId
  };
}

export async function createOAuthStateToken(
  storeId: number,
  origin: string,
  env: Env,
  transactionId?: string
): Promise<string> {
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET required for OAuth state token');
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    throw new Error('Invalid origin for OAuth state token');
  }

  const jti = transactionId || crypto.randomUUID();

  return signToken(
    {
      storeId,
      origin: normalizedOrigin,
      type: 'oauth_state',
      jti,
    },
    env.SESSION_SECRET,
    10 * 60 // 10 minutes
  );
}

export async function validateOAuthStateToken(
  token: string,
  env: Env
): Promise<{ storeId: number; origin: string; transactionId: string } | null> {
  if (!env.SESSION_SECRET) return null;

  const payload = await verifyToken(token, env.SESSION_SECRET);
  if (
    !payload ||
    payload.type !== 'oauth_state' ||
    typeof payload.storeId !== 'number' ||
    typeof payload.origin !== 'string' ||
    typeof payload.jti !== 'string'
  ) {
    return null;
  }

  const isFresh = await consumeOneTimeTokenId(payload.jti, env, 10 * 60);
  if (!isFresh) return null;

  const origin = normalizeOrigin(payload.origin);
  if (!origin) return null;

  return {
    storeId: payload.storeId,
    origin,
    transactionId: payload.jti,
  };
}

export async function createOAuthAuthorizationRequest(
  storeId: number,
  origin: string,
  env: Env
): Promise<{ state: string; codeChallenge: string; codeChallengeMethod: 'S256' }> {
  const transactionId = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await createCodeChallengeS256(codeVerifier);

  await storePkceVerifier(transactionId, codeVerifier, env, 10 * 60);
  const state = await createOAuthStateToken(storeId, origin, env, transactionId);

  return {
    state,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

export async function consumePkceVerifierForOAuth(
  transactionId: string,
  env: Env
): Promise<string | null> {
  return consumePkceVerifier(transactionId, env);
}

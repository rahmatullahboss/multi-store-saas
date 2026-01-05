/**
 * Authentication Service
 * 
 * Handles session management, password hashing, and auth utilities
 * for the Multi-Store SaaS platform.
 * 
 * Uses Web Crypto API for password hashing (Cloudflare Workers compatible)
 */

import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users, stores } from '@db/schema';

// ============================================================================
// SESSION STORAGE
// ============================================================================

type SessionData = {
  userId: number;
  storeId: number;
};

type SessionFlashData = {
  error: string;
  success: string;
};

// Create session storage with secure defaults
export const sessionStorage = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: ['multi-store-saas-secret-key-change-in-production'],
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// ============================================================================
// PASSWORD HASHING (Web Crypto API)
// ============================================================================

/**
 * Hash a password using PBKDF2 with SHA-256
 * Compatible with Cloudflare Workers
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  
  // Combine salt and hash, then encode as base64
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    
    // Extract salt (first 16 bytes)
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const newHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    
    // Compare hashes
    const newHashArray = new Uint8Array(newHash);
    if (originalHash.length !== newHashArray.length) return false;
    
    for (let i = 0; i < originalHash.length; i++) {
      if (originalHash[i] !== newHashArray[i]) return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

interface LoginParams {
  email: string;
  password: string;
  db: D1Database;
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  storeName: string;
  subdomain?: string; // Optional custom subdomain
  db: D1Database;
}

/**
 * Login a user
 */
export async function login({ email, password, db }: LoginParams) {
  const drizzleDb = drizzle(db);
  
  // Find user by email
  const userResult = await drizzleDb
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  
  if (userResult.length === 0) {
    return { error: 'Invalid email or password' };
  }
  
  const user = userResult[0];
  
  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Invalid email or password' };
  }
  
  return { user };
}

/**
 * Register a new merchant with their store
 */
export async function register({ email, password, name, storeName, subdomain: customSubdomain, db }: RegisterParams) {
  const drizzleDb = drizzle(db);
  
  // Check if email exists
  const existingUser = await drizzleDb
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  
  if (existingUser.length > 0) {
    return { error: 'Email already registered' };
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Use custom subdomain if provided, otherwise generate from store name
  const subdomain = customSubdomain 
    ? customSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30)
    : storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);
  
  // Check subdomain uniqueness
  const existingStore = await drizzleDb
    .select()
    .from(stores)
    .where(eq(stores.subdomain, subdomain))
    .limit(1);
  
  if (existingStore.length > 0) {
    return { error: `The subdomain "${subdomain}" is already taken. Please choose a different one.` };
  }
  
  // Create store first
  const storeResult = await drizzleDb.insert(stores).values({
    name: storeName,
    subdomain,
    currency: 'BDT',
    mode: 'landing',
  }).returning({ id: stores.id });
  
  const storeId = storeResult[0].id;
  
  // Create user
  const userResult = await drizzleDb.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    name,
    storeId,
    role: 'merchant',
  }).returning();
  
  return { user: userResult[0], storeId };
}

/**
 * Create a session for a user
 */
export async function createUserSession(userId: number, storeId: number, redirectTo: string) {
  const session = await getSession();
  session.set('userId', userId);
  session.set('storeId', storeId);
  
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

/**
 * Get the user ID from the session
 */
export async function getUserId(request: Request): Promise<number | null> {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  return userId ?? null;
}

/**
 * Require a user to be logged in
 */
export async function requireUserId(request: Request, redirectTo: string = '/auth/login'): Promise<number> {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect(redirectTo);
  }
  return userId;
}

/**
 * Get the current user from the session
 */
export async function getUser(request: Request, db: D1Database) {
  const userId = await getUserId(request);
  if (!userId) return null;
  
  const drizzleDb = drizzle(db);
  const userResult = await drizzleDb
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return userResult[0] ?? null;
}

/**
 * Get the store ID from the session
 */
export async function getStoreId(request: Request): Promise<number | null> {
  const session = await getSession(request.headers.get('Cookie'));
  const storeId = session.get('storeId');
  return storeId ?? null;
}

/**
 * Logout a user
 */
export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  
  return redirect('/auth/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

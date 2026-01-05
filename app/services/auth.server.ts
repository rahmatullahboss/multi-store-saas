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
 * Returns detailed error information for debugging
 */
export async function login({ email, password, db }: LoginParams): Promise<{
  user?: typeof users.$inferSelect;
  error?: string;
  errorCode?: 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'DATABASE_ERROR' | 'STORE_NOT_FOUND' | 'ACCOUNT_DISABLED' | 'UNKNOWN_ERROR';
  errorDetails?: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  console.log('[login] Attempting login for email:', normalizedEmail);
  
  try {
    const drizzleDb = drizzle(db);
    
    // Step 1: Find user by email
    console.log('[login] Step 1: Querying database for user...');
    let userResult;
    try {
      userResult = await drizzleDb
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      console.log('[login] User query completed. Found:', userResult.length, 'user(s)');
    } catch (dbError) {
      console.error('[login] Database error during user lookup:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      return {
        error: 'Unable to connect to database. Please try again later.',
        errorCode: 'DATABASE_ERROR',
        errorDetails: `User lookup failed: ${errorMessage}`,
      };
    }
    
    // Step 2: Check if user exists
    if (!userResult || userResult.length === 0) {
      console.log('[login] User not found for email:', normalizedEmail);
      return {
        error: 'Invalid email or password',
        errorCode: 'USER_NOT_FOUND',
        errorDetails: `No user found with email: ${normalizedEmail}`,
      };
    }
    
    const user = userResult[0];
    console.log('[login] User found - ID:', user.id, ', Role:', user.role, ', StoreID:', user.storeId);
    
    // Step 3: Check if user has a store (for merchants)
    if (user.role === 'merchant' && !user.storeId) {
      console.error('[login] Merchant user has no associated store. UserID:', user.id);
      return {
        error: 'Your account is not properly configured. Please contact support.',
        errorCode: 'STORE_NOT_FOUND',
        errorDetails: `Merchant user ${user.id} has no storeId`,
      };
    }
    
    // Step 4: Verify password
    console.log('[login] Step 4: Verifying password...');
    let isValid;
    try {
      isValid = await verifyPassword(password, user.passwordHash);
      console.log('[login] Password verification result:', isValid ? 'VALID' : 'INVALID');
    } catch (cryptoError) {
      console.error('[login] Crypto error during password verification:', cryptoError);
      const errorMessage = cryptoError instanceof Error ? cryptoError.message : String(cryptoError);
      return {
        error: 'An error occurred during authentication. Please try again.',
        errorCode: 'UNKNOWN_ERROR',
        errorDetails: `Password verification failed: ${errorMessage}`,
      };
    }
    
    if (!isValid) {
      console.log('[login] Invalid password for user:', user.id);
      return {
        error: 'Invalid email or password',
        errorCode: 'INVALID_PASSWORD',
        errorDetails: `Password mismatch for user ${user.id}`,
      };
    }
    
    // Step 5: Check if user's store exists (for merchants)
    if (user.role === 'merchant' && user.storeId) {
      console.log('[login] Step 5: Verifying store exists...');
      try {
        const storeResult = await drizzleDb
          .select({ id: stores.id, name: stores.name, subdomain: stores.subdomain })
          .from(stores)
          .where(eq(stores.id, user.storeId))
          .limit(1);
        
        if (!storeResult || storeResult.length === 0) {
          console.error('[login] Store not found for user. UserID:', user.id, ', StoreID:', user.storeId);
          return {
            error: 'Your store could not be found. Please contact support.',
            errorCode: 'STORE_NOT_FOUND',
            errorDetails: `Store ${user.storeId} not found for user ${user.id}`,
          };
        }
        console.log('[login] Store verified:', storeResult[0].name, '(', storeResult[0].subdomain, ')');
      } catch (storeError) {
        console.error('[login] Database error during store lookup:', storeError);
        // Don't block login for store lookup errors, just log it
        console.warn('[login] Proceeding with login despite store lookup error');
      }
    }
    
    console.log('[login] Login successful for user:', user.id);
    return { user };
    
  } catch (error) {
    console.error('[login] Unexpected error during login:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[login] Error message:', errorMessage);
    if (errorStack) {
      console.error('[login] Error stack:', errorStack);
    }
    
    // Check for specific D1 database errors
    if (errorMessage.includes('D1_ERROR') || errorMessage.includes('database')) {
      return {
        error: 'Database connection error. Please try again later.',
        errorCode: 'DATABASE_ERROR',
        errorDetails: errorMessage,
      };
    }
    
    return {
      error: 'An unexpected error occurred. Please try again.',
      errorCode: 'UNKNOWN_ERROR',
      errorDetails: errorMessage,
    };
  }
}

/**
 * Register a new merchant with their store
 */
export async function register({ email, password, name, storeName, subdomain: customSubdomain, db }: RegisterParams) {
  try {
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
    
    if (!storeResult || storeResult.length === 0) {
      console.error('[register] Failed to create store - no result returned');
      return { error: 'Failed to create store. Please try again.' };
    }
    
    const storeId = storeResult[0].id;
    
    // Create user
    const userResult = await drizzleDb.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      storeId,
      role: 'merchant',
    }).returning();
    
    if (!userResult || userResult.length === 0) {
      console.error('[register] Failed to create user - no result returned');
      return { error: 'Failed to create account. Please try again.' };
    }
    
    return { user: userResult[0], storeId };
  } catch (error) {
    console.error('[register] Registration failed:', error);
    
    // Get error message for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[register] Error message:', errorMessage);
    
    // Check for specific error types
    if (error instanceof Error) {
      // Unique constraint violation (subdomain or email already exists)
      if (error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('subdomain')) {
          return { error: 'This subdomain is already taken. Please choose a different one.' };
        }
        if (error.message.includes('email')) {
          return { error: 'This email is already registered. Please login instead.' };
        }
        return { error: 'Account creation failed due to duplicate data. Please try again.' };
      }
      
      // D1 Database specific errors - show actual error for debugging
      if (error.message.includes('D1_ERROR') || error.message.includes('database')) {
        // TODO: Remove debug message after fixing
        return { error: `Database error: ${errorMessage.slice(0, 200)}` };
      }
    }
    
    // TODO: Remove debug message after fixing
    return { error: `Registration failed: ${errorMessage.slice(0, 200)}` };
  }
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

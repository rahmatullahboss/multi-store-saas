/**
 * Authentication Service
 *
 * Handles session management, password hashing, and auth utilities
 * for the Ozzyl platform.
 *
 * Uses Web Crypto API for password hashing (Cloudflare Workers compatible)
 */

import { createCookieSessionStorage, redirect, type Session } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users, stores, adminRoles, passwordResets } from '@db/schema';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import { sendPasswordResetEmail } from './email.server';

// Helper types for permissions
export type AdminPermission =
  | 'canSuspend'
  | 'canDelete'
  | 'canBilling'
  | 'canImpersonate'
  | 'canManageTeam';

// Helper type for authenticated user
export type AuthUser = {
  id: number;
  email: string;
  role: string;
  storeId?: number | null;
};

// ============================================================================
// SESSION STORAGE
// ============================================================================

type SessionData = {
  userId: number;
  storeId: number;
  originalAdminId?: number; // For impersonation checking
};

type SessionFlashData = {
  error: string;
  success: string;
};

// Create session storage dynamically using env secret
export function getSessionStorage(env: Env) {
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set in your environment variables.');
  }

  // Check if we're in development mode
  // SAAS_DOMAIN will be 'localhost:5173' or similar in dev, 'ozzyl.com' in prod
  const saasDomain = env.SAAS_DOMAIN || 'ozzyl.com';
  const isLocalhost = saasDomain.includes('localhost') || saasDomain.includes('127.0.0.1');

  return createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [env.SESSION_SECRET],
      // Only require HTTPS in production (localhost uses HTTP)
      secure: !isLocalhost,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      // Only set domain in production for cross-subdomain access
      // In dev mode, omitting domain allows cookies to work on localhost
      ...(isLocalhost ? {} : { domain: '.ozzyl.com' }),
    },
  });
}

/**
 * Get the session from the request
 */
export async function getSession(request: Request, env: Env) {
  const storage = getSessionStorage(env);
  return storage.getSession(request.headers.get('Cookie'));
}

export async function commitSession(session: Session, env: Env) {
  const storage = getSessionStorage(env);
  return storage.commitSession(session);
}

export async function destroySession(session: Session, env: Env) {
  const storage = getSessionStorage(env);
  return storage.destroySession(session);
}

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

  // Combine salt and hash, then encode as base64url (URL-safe base64)
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);

  // Use base64url encoding to avoid issues with special characters
  return bytesToBase64Url(combined);
}

/**
 * Convert Uint8Array to URL-safe base64 string
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);
  // Convert to URL-safe base64
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert URL-safe base64 string to Uint8Array
 */
function base64UrlToBytes(base64url: string): Uint8Array {
  // Convert from URL-safe to standard base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Verify a password against a stored hash
 * Supports both legacy base64 and new base64url formats
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();

    console.warn('[verifyPassword] Starting verification, hash length:', storedHash.length);

    // Try to decode the hash - supports both base64 and base64url formats
    let combined: Uint8Array;
    let decodeMethod: string;
    try {
      // First try the new base64url format (no padding, URL-safe chars)
      combined = base64UrlToBytes(storedHash);
      decodeMethod = 'base64url';
    } catch {
      console.warn('[verifyPassword] base64url decode failed, trying legacy base64');
      try {
        // Fall back to legacy base64 format
        combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));
        decodeMethod = 'base64';
      } catch (base64Error) {
        console.error('[verifyPassword] Both decode methods failed:', base64Error);
        throw base64Error;
      }
    }

    console.warn(
      '[verifyPassword] Decoded using:',
      decodeMethod,
      'combined length:',
      combined.length
    );

    // Extract salt (first 16 bytes)
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);

    console.warn('[verifyPassword] Salt length:', salt.length, 'Hash length:', originalHash.length);

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
    console.warn(
      '[verifyPassword] New hash length:',
      newHashArray.length,
      'Original hash length:',
      originalHash.length
    );

    if (originalHash.length !== newHashArray.length) {
      console.warn('[verifyPassword] Hash length mismatch!');
      return false;
    }

    let match = true;
    for (let i = 0; i < originalHash.length; i++) {
      if (originalHash[i] !== newHashArray[i]) {
        match = false;
        break;
      }
    }

    console.warn('[verifyPassword] Hash match result:', match);
    return match;
  } catch (error) {
    console.error('[verifyPassword] Error during verification:', error);
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
  ip?: string;
  userAgent?: string;
  env?: Env;
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  phone?: string; // Merchant mobile number
  storeName: string;
  subdomain?: string; // Optional custom subdomain
  db: D1Database;
}

/**
 * Login a user
 * Returns detailed error information for debugging
 */
export async function login({ email, password, db, ip, userAgent, env }: LoginParams): Promise<{
  user?: typeof users.$inferSelect;
  error?: string;
  errorCode?:
    | 'USER_NOT_FOUND'
    | 'INVALID_PASSWORD'
    | 'DATABASE_ERROR'
    | 'STORE_NOT_FOUND'
    | 'ACCOUNT_DISABLED'
    | 'UNKNOWN_ERROR';
  errorDetails?: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  // console.log('[login] Attempting login for email:', normalizedEmail);
  const { logSystemEvent } = await import('./logger.server');
  const { checkLoginAnomalies } = await import('./security.server');

  try {
    const drizzleDb = drizzle(db);

    // Step 1: Find user by email
    // console.log('[login] Step 1: Querying database for user...');
    let userResult;
    try {
      userResult = await drizzleDb
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      // console.log('[login] User query completed. Found:', userResult.length, 'user(s)');
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
      console.warn('[login] User not found for email:', normalizedEmail);

      // Log security event
      await logSystemEvent(db, 'warn', 'Login failed: User not found', {
        type: 'auth_failure',
        email: normalizedEmail,
        reason: 'USER_NOT_FOUND',
        ip,
        userAgent,
      });

      // Check for anomalies if env is provided
      if (env) {
        await checkLoginAnomalies(db, env, { ip, email: normalizedEmail });
      }

      return {
        error: 'Invalid email or password',
        errorCode: 'USER_NOT_FOUND',
        errorDetails: `No user found with email: ${normalizedEmail}`,
      };
    }

    const user = userResult[0];
    // console.log('[login] User found - ID:', user.id, ', Role:', user.role, ', StoreID:', user.storeId);

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
    let isValid;
    try {
      // Debug logging
      console.warn('[login] Verifying password for user:', user.id);
      console.warn('[login] Stored hash length:', user.passwordHash.length);
      console.warn('[login] Stored hash preview:', user.passwordHash.substring(0, 20) + '...');
      console.warn('[login] Input password length:', password.length);

      isValid = await verifyPassword(password, user.passwordHash);

      console.warn('[login] Password verification result:', isValid);
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
      console.warn('[login] Invalid password for user:', user.id);

      // Log security event
      await logSystemEvent(db, 'warn', 'Login failed: Invalid password', {
        type: 'auth_failure',
        email: normalizedEmail,
        userId: user.id,
        reason: 'INVALID_PASSWORD',
        ip,
        userAgent,
      });

      // Check for anomalies
      if (env) {
        await checkLoginAnomalies(db, env, { ip, email: normalizedEmail });
      }

      return {
        error: 'Invalid email or password',
        errorCode: 'INVALID_PASSWORD',
        errorDetails: `Password mismatch for user ${user.id}`,
      };
    }

    // Step 5: Check if user's store exists (for merchants)
    if (user.role === 'merchant' && user.storeId) {
      // console.log('[login] Step 5: Verifying store exists...');
      try {
        const storeResult = await drizzleDb
          .select({ id: stores.id, name: stores.name, subdomain: stores.subdomain })
          .from(stores)
          .where(eq(stores.id, user.storeId))
          .limit(1);

        if (!storeResult || storeResult.length === 0) {
          console.error(
            '[login] Store not found for user. UserID:',
            user.id,
            ', StoreID:',
            user.storeId
          );
          return {
            error: 'Your store could not be found. Please contact support.',
            errorCode: 'STORE_NOT_FOUND',
            errorDetails: `Store ${user.storeId} not found for user ${user.id}`,
          };
        }
        // console.log('[login] Store verified:', storeResult[0].name, '(', storeResult[0].subdomain, ')');
      } catch (storeError) {
        console.error('[login] Database error during store lookup:', storeError);
        // Don't block login for store lookup errors, just log it
        console.warn('[login] Proceeding with login despite store lookup error');
      }
    }

    console.warn('[login] Login successful for user:', user.id);
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
 * Request a password reset
 * Generates a token and sends an email
 */
export async function requestPasswordReset(
  email: string,
  db: D1Database,
  env: Env,
  ctx?: { waitUntil: (promise: Promise<unknown>) => void }
): Promise<{ success: boolean; error?: string }> {
  try {
    const drizzleDb = drizzle(db);

    // Check if user exists
    const userResult = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      // Security: Don't reveal if user exists. Pretend success.
      // Log for debugging/audit
      console.warn('[auth.server] Password reset requested for non-existent email:', email);
      return { success: true };
    }

    const user = userResult[0];

    // Generate secure token (random 32 bytes hex)
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Expiry: 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save to DB
    await drizzleDb.insert(passwordResets).values({
      userId: user.id,
      token,
      expiresAt,
    });

    console.info('[auth.server] Created password reset token for user:', user.id);

    // Send email
    const emailPromise = sendPasswordResetEmail(email.toLowerCase(), token, env);

    if (ctx && typeof ctx.waitUntil === 'function') {
      // Non-blocking: Send in background
      ctx.waitUntil(emailPromise);
      // console.log('[auth.server] Email sending delegated to background worker');
    } else {
      // Blocking: Wait for completion (fallback)
      const emailResult = await emailPromise;
      if (!emailResult.success) {
        console.error('[auth.server] Failed to send reset email:', emailResult.error);
        return { success: false, error: 'Failed to send email. Please try again later.' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[auth.server] Error requesting password reset:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Reset password using a valid token
 */
export async function resetPassword(
  token: string,
  newPassword: string,
  db: D1Database
): Promise<{ success: boolean; error?: string }> {
  try {
    const drizzleDb = drizzle(db);
    const now = new Date();

    // Verify token
    const resetRecord = await drizzleDb
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, token))
      .limit(1);

    if (!resetRecord || resetRecord.length === 0) {
      return { success: false, error: 'Invalid or expired password reset link.' };
    }

    const reset = resetRecord[0];

    // Check expiration
    if (reset.expiresAt < now) {
      return { success: false, error: 'This password reset link has expired.' };
    }

    // Check if already used (if we track usedAt, though implementation below deletes it)
    if (reset.usedAt) {
      return { success: false, error: 'This link has already been used.' };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await drizzleDb.update(users).set({ passwordHash }).where(eq(users.id, reset.userId));

    // Mark token as used or delete it
    // Deleting is cleaner for single-use tokens
    await drizzleDb.delete(passwordResets).where(eq(passwordResets.id, reset.id));

    console.warn('[auth.server] Password successfully reset for user:', reset.userId);

    return { success: true };
  } catch (error) {
    console.error('[auth.server] Error resetting password:', error);
    return { success: false, error: 'Failed to reset password. Please try again.' };
  }
}

/**
 * Register a new merchant with their store
 * Enhanced with comprehensive logging and validation
 */
export async function register({
  email,
  password,
  name,
  phone,
  storeName,
  subdomain: customSubdomain,
  db,
}: RegisterParams) {
  console.warn('[register] Starting registration process');
  console.warn('[register] Input validation:', {
    email: email ? 'provided' : 'missing',
    password: password ? `provided (${password.length} chars)` : 'missing',
    name: name ? 'provided' : 'missing',
    phone: phone ? 'provided' : 'missing',
    storeName: storeName ? 'provided' : 'missing',
    subdomain: customSubdomain ? 'provided' : 'auto-generated',
  });

  try {
    const drizzleDb = drizzle(db);
    console.warn('[register] Database connection established');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('[register] Invalid email format:', email);
      return { error: 'Invalid email format. Please enter a valid email address.' };
    }

    // Validate password strength
    if (!password || password.length < 6) {
      console.warn('[register] Password too short');
      return { error: 'Password must be at least 6 characters long.' };
    }

    // Validate store name
    if (!storeName || storeName.trim().length < 2) {
      console.warn('[register] Store name too short');
      return { error: 'Store name must be at least 2 characters long.' };
    }

    // Check if email exists
    console.warn('[register] Checking if email exists:', email.toLowerCase());
    const existingUser = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      console.warn('[register] Email already exists:', email.toLowerCase());
      return {
        error: 'This email is already registered. Please login instead or use a different email.',
      };
    }
    console.warn('[register] Email is available');

    // Hash password
    console.warn('[register] Hashing password...');
    const passwordHash = await hashPassword(password);
    console.warn('[register] Password hashed successfully, length:', passwordHash.length);

    // Use custom subdomain if provided, otherwise generate from store name
    const subdomain = customSubdomain
      ? customSubdomain
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '')
          .slice(0, 30)
      : storeName.toLowerCase().replace(/^-|-$/g, '').replace(/^-|-$/g, '').slice(0, 30);

    console.warn('[register] Generated subdomain:', subdomain);

    // Validate subdomain
    if (subdomain.length < 2) {
      console.warn('[register] Subdomain too short:', subdomain);
      return { error: 'Subdomain must be at least 2 characters long after cleaning.' };
    }

    // Check subdomain uniqueness
    console.warn('[register] Checking subdomain availability:', subdomain);
    const existingStore = await drizzleDb
      .select()
      .from(stores)
      .where(eq(stores.subdomain, subdomain))
      .limit(1);

    if (existingStore.length > 0) {
      console.warn('[register] Subdomain already taken:', subdomain);
      return {
        error: `The subdomain "${subdomain}" is already taken. Please choose a different one.`,
      };
    }
    console.warn('[register] Subdomain is available');

    // Create store first
    console.warn('[register] Creating store...');
    const defaultThemeConfig = {
      storeTemplateId: 'starter-store',
      primaryColor: '#6366f1',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Inter',
    };
    const storeResult = await drizzleDb
      .insert(stores)
      .values({
        name: storeName,
        subdomain,
        currency: 'BDT',
        themeConfig: JSON.stringify(defaultThemeConfig),
      })
      .returning({ id: stores.id });

    if (!storeResult || storeResult.length === 0) {
      console.error('[register] Failed to create store - no result returned');
      return { error: 'Failed to create store. Please try again.' };
    }

    const storeId = storeResult[0].id;
    console.warn('[register] Store created successfully, ID:', storeId);

    // Create user
    console.warn('[register] Creating user...');
    const userResult = await drizzleDb
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone: phone || null, // Merchant phone number
        storeId,
        role: 'merchant',
      })
      .returning();

    if (!userResult || userResult.length === 0) {
      console.error('[register] Failed to create user - no result returned');
      return { error: 'Failed to create account. Please try again.' };
    }

    console.warn('[register] User created successfully, ID:', userResult[0].id);
    console.warn('[register] Registration complete!');

    return { user: userResult[0], storeId };
  } catch (error) {
    console.error('[register] Registration failed with error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      console.error('[register] Error message:', error.message);
      console.error('[register] Error stack:', error.stack);

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

      // Foreign key constraint failure
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        console.error('[register] Foreign key constraint failed - possible schema issue');
        return { error: 'Database relationship error. Please contact support.' };
      }

      // Missing column error - schema mismatch
      if (error.message.includes('has no column named')) {
        console.error('[register] Schema mismatch detected:', error.message);
        return { error: 'Database configuration error. Please contact support.' };
      }

      // Table not found
      if (error.message.includes('no such table')) {
        console.error('[register] Table not found - migration may be missing:', error.message);
        return { error: 'Database setup incomplete. Please contact support.' };
      }

      // D1 Database specific errors
      if (error.message.includes('D1_ERROR') || error.message.includes('database')) {
        console.error('[register] D1 database error:', error.message);
        return { error: 'Database error occurred. Please try again in a moment.' };
      }

      // SQL syntax errors
      if (error.message.includes('syntax error')) {
        console.error('[register] SQL syntax error:', error.message);
        return { error: 'Database query error. Please contact support.' };
      }
    }

    return { error: 'Registration failed. Please try again.' };
  }
}

/**
 * Create a minimal user account from Google OAuth (no store yet)
 */
export async function createGoogleUser(email: string, name: string, db: D1Database) {
  try {
    const drizzleDb = drizzle(db);

    // Check if email already exists (shouldn't happen, but safety check)
    const existing = await drizzleDb
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return { error: 'Email already exists', user: null };
    }

    // Create user without store (will complete profile later)
    const result = await drizzleDb
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash: '', // Empty for OAuth users
        name,
        role: 'merchant',
        storeId: null, // No store yet - will be created in complete-profile
      })
      .returning();

    if (!result || result.length === 0) {
      return { error: 'Failed to create user', user: null };
    }

    console.warn('[createGoogleUser] Created Google user:', email);
    return { user: result[0], error: null };
  } catch (error) {
    console.error('[createGoogleUser] Error:', error);
    return { error: 'Failed to create account', user: null };
  }
}

/**
 * Complete a Google user's profile by creating their store
 */
export async function completeGoogleUserProfile({
  userId,
  phone,
  storeName,
  subdomain,
  db,
}: {
  userId: number;
  phone: string;
  storeName: string;
  subdomain: string;
  db: D1Database;
}) {
  try {
    const drizzleDb = drizzle(db);

    // Check subdomain uniqueness
    const existingStore = await drizzleDb
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.subdomain, subdomain.toLowerCase()))
      .limit(1);

    if (existingStore.length > 0) {
      return { error: 'Subdomain already taken', storeId: null };
    }

    // Check phone uniqueness
    const existingPhone = await drizzleDb
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingPhone.length > 0) {
      return { error: 'Phone number already registered', storeId: null };
    }

    // Create the store
    const storeResult = await drizzleDb
      .insert(stores)
      .values({
        name: storeName,
        subdomain: subdomain.toLowerCase(),
        currency: 'BDT',
        onboardingStatus: 'completed',
      })
      .returning({ id: stores.id });

    if (!storeResult || storeResult.length === 0) {
      return { error: 'Failed to create store', storeId: null };
    }

    const storeId = storeResult[0].id;

    // Update user with store and phone
    await drizzleDb.update(users).set({ storeId, phone }).where(eq(users.id, userId));

    console.warn(
      '[completeGoogleUserProfile] Completed profile for user:',
      userId,
      'store:',
      storeId
    );
    return { storeId, error: null };
  } catch (error) {
    console.error('[completeGoogleUserProfile] Error:', error);
    return { error: 'Failed to complete profile', storeId: null };
  }
}

/**
 * Create a session for a user
 */
export async function createUserSession(
  userId: number,
  storeId: number,
  redirectTo: string,
  env: Env
) {
  const session = await getSession(new Request('http://localhost'), env); // Create new session
  session.set('userId', userId);
  session.set('storeId', storeId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session, env),
    },
  });
}

/**
 * Get the user ID from the session
 */
export async function getUserId(request: Request, env: Env): Promise<number | null> {
  const session = await getSession(request, env);
  const userId = session.get('userId');
  return userId ?? null;
}

/**
 * Require a user to be logged in
 */
export async function requireUserId(
  request: Request,
  env: Env,
  redirectTo: string = '/auth/login'
): Promise<number> {
  const userId = await getUserId(request, env);
  if (!userId) {
    throw redirect(redirectTo);
  }
  return userId;
}

/**
 * Get the current user from the session
 */
export async function getUser(request: Request, env: Env, db: D1Database) {
  const userId = await getUserId(request, env);
  if (!userId) return null;

  const drizzleDb = drizzle(db);
  const userResult = await drizzleDb.select().from(users).where(eq(users.id, userId)).limit(1);

  return userResult[0] ?? null;
}

/**
 * Get the store ID from the session
 */
export async function getStoreId(request: Request, env: Env): Promise<number | null> {
  const session = await getSession(request, env);
  const storeId = session.get('storeId');
  return storeId ?? null;
}

/**
 * Logout a user
 */
export async function logout(request: Request, env: Env) {
  const session = await getSession(request, env);

  return redirect('/auth/login', {
    headers: {
      'Set-Cookie': await destroySession(session, env),
    },
  });
}

// ============================================================================
// SUPER ADMIN FUNCTIONS
// ============================================================================

/**
 * Check if the current user is a Super Admin
 */
export async function isSuperAdmin(request: Request, env: Env, db: D1Database): Promise<boolean> {
  const userId = await getUserId(request, env);
  if (!userId) return false;

  const drizzleDb = drizzle(db);
  const userResult = await drizzleDb
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return userResult[0]?.role === 'super_admin';
}

/**
 * Require Super Admin access
 * Redirects to /auth/login if user is not a super_admin
 */
export async function requireSuperAdmin(
  request: Request,
  env: Env,
  db: D1Database
): Promise<{
  userId: number;
  userEmail: string;
}> {
  const userId = await getUserId(request, env);
  if (!userId) {
    throw redirect('/auth/login');
  }

  const drizzleDb = drizzle(db);
  const userResult = await drizzleDb
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userResult[0];
  if (!user || user.role !== 'super_admin') {
    console.warn('[requireSuperAdmin] Unauthorized access attempt by user:', userId);
    throw redirect('/auth/login');
  }

  return { userId: user.id, userEmail: user.email };
}

/**
 * Create an impersonation session for a target user
 * CRITICAL: Only allowed for the SUPER_ADMIN_EMAIL
 */
export async function createImpersonationSession(
  request: Request,
  targetUserId: number,
  db: D1Database,
  env: Env
): Promise<Response> {
  // Step 1: Verify the current user is super_admin AND matches SUPER_ADMIN_EMAIL
  const { userId: adminId, userEmail: adminEmail } = await requireSuperAdmin(request, env, db);

  // CRITICAL SECURITY CHECK: Only the configured super admin email can impersonate
  if (!env.SUPER_ADMIN_EMAIL || adminEmail.toLowerCase() !== env.SUPER_ADMIN_EMAIL.toLowerCase()) {
    console.error(
      '[createImpersonationSession] SECURITY VIOLATION: User',
      adminEmail,
      'attempted impersonation but is not the configured SUPER_ADMIN_EMAIL'
    );
    throw new Response('Forbidden: You are not authorized to impersonate users.', { status: 403 });
  }

  // Step 2: Get target user info
  const drizzleDb = drizzle(db);
  const targetUser = await drizzleDb
    .select({ id: users.id, storeId: users.storeId, email: users.email })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!targetUser[0] || !targetUser[0].storeId) {
    throw new Response('Target user not found or has no store.', { status: 404 });
  }

  console.log(
    '[createImpersonationSession] Super Admin',
    adminEmail,
    'impersonating user',
    targetUser[0].email
  );

  // Step 3: Create session for target user (get existing session and override it)
  // Store original admin ID to allow "Exit Shadow Mode"
  const session = await getSession(request, env);
  session.set('userId', targetUser[0].id);
  session.set('storeId', targetUser[0].storeId);
  session.set('originalAdminId', adminId);

  return redirect('/app/dashboard', {
    headers: {
      'Set-Cookie': await commitSession(session, env),
    },
  });
}
/**
 * Check if the current user has a specific admin permission
 */
export async function hasAdminPermission(
  request: Request,
  env: Env,
  db: D1Database,
  permission: AdminPermission
): Promise<boolean> {
  const userId = await getUserId(request, env);
  if (!userId) return false;

  const drizzleDb = drizzle(db);

  // 1. Check users table
  const userResult = await drizzleDb
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const userRole = userResult[0]?.role;

  // 2. Check admin_roles table
  const roleEntry = await drizzleDb
    .select()
    .from(adminRoles)
    .where(eq(adminRoles.userId, userId))
    .limit(1);

  // LOGIC:
  // If user is 'super_admin' in users table AND no entry in admin_roles, likely Legacy Super Admin -> Allow EVERYTHING.
  if (userRole === 'super_admin' && roleEntry.length === 0) {
    return true;
  }

  // If entry exists in admin_roles, strictly follow permissions
  if (roleEntry.length > 0) {
    const roleData = roleEntry[0];

    // 'super_admin' role in admin_roles also gets everything (double check permission JSON just in case, but usually yes)
    if (roleData.role === 'super_admin') return true;

    try {
      const perms = JSON.parse(roleData.permissions as string);
      return !!perms[permission];
    } catch (e) {
      console.error('[hasAdminPermission] JSON parse error for user', userId, e);
      return false;
    }
  }

  // Default deny if not legacy super admin and no role entry
  return false;
}

/**
 * Require a specific admin permission
 * Throws 403 response if unauthorized
 */
export async function requireAdminPermission(
  request: Request,
  env: Env,
  db: D1Database,
  permission: AdminPermission
) {
  // First ensure they are at least logged in
  await requireUserId(request, env);

  const allowed = await hasAdminPermission(request, env, db, permission);
  if (!allowed) {
    throw new Response('Forbidden: You do not have permission to perform this action.', {
      status: 403,
    });
  }
}

/**
 * Initialize Authenticator
 * 
 * @param env - Environment variables
 * @param requestUrl - Optional request URL to determine dynamic callback URL
 *                     This allows OAuth to work across multiple domains (ozzyl.com, app.ozzyl.com, etc.)
 */
export function getAuthenticator(env: Env, requestUrl?: string) {
  const sessionStorage = getSessionStorage(env);
  const authenticator = new Authenticator<AuthUser>(sessionStorage);

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth Environment Variables missing. SSO disabled.');
  } else {
    // Determine callback URL dynamically based on request origin
    // This allows the same OAuth credentials to work across multiple domains
    let callbackURL: string;
    
    if (requestUrl) {
      // Use the request's origin to build the callback URL
      const origin = new URL(requestUrl).origin;
      callbackURL = `${origin}/auth/google/callback`;
      console.warn('[getAuthenticator] Using dynamic callback URL:', callbackURL);
      console.warn('[getAuthenticator] Request URL was:', requestUrl);
    } else {
      // Fallback to SAAS_DOMAIN if no request URL provided
      callbackURL = `${env.SAAS_DOMAIN}/auth/google/callback`;
      console.warn('[getAuthenticator] Using SAAS_DOMAIN callback URL:', callbackURL);
      console.warn('[getAuthenticator] SAAS_DOMAIN:', env.SAAS_DOMAIN);
    }

    const googleStrategy = new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async ({ profile }) => {
        // We return a minimal profile object here.
        // The database lookup/creation logic will be handled
        // in the callback route's loader function using this profile data.
        return {
          id: 0, // Placeholder, will be resolved in callback
          email: profile.emails[0].value,
          role: 'merchant', // Default assumption, resolved in callback
          storeId: null,
        };
      }
    );
    authenticator.use(googleStrategy);
  }

  return authenticator;
}

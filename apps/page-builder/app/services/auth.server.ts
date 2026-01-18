/**
 * Page Builder Auth Service
 * 
 * Verifies session cookies from the main app.
 * Uses the same session storage mechanism for cross-subdomain auth.
 */

import { createCookieSessionStorage } from '@remix-run/cloudflare';

// Session data structure (same as main app)
type SessionData = {
  userId: number;
  storeId: number;
  originalAdminId?: number;
};

type SessionFlashData = {
  error: string;
  success: string;
};

/**
 * Create session storage with the same config as main app
 */
export function getSessionStorage(sessionSecret: string) {
  return createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [sessionSecret],
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      // Enable cross-subdomain access (e.g., builder.ozzyl.com)
      domain: '.ozzyl.com',
    },
  });
}

/**
 * Get user session from request using signed cookie verification
 */
export async function getSession(request: Request, sessionSecret: string) {
  const storage = getSessionStorage(sessionSecret);
  return storage.getSession(request.headers.get('Cookie'));
}

/**
 * Get authenticated user from session
 * Returns { userId, storeId } or null if not authenticated
 */
export async function getAuthFromSession(request: Request, env: { SESSION_SECRET?: string }) {
  const sessionSecret = env.SESSION_SECRET;
  
  if (!sessionSecret) {
    console.error('[page-builder auth] SESSION_SECRET not configured');
    return null;
  }
  
  try {
    const session = await getSession(request, sessionSecret);
    const userId = session.get('userId');
    const storeId = session.get('storeId');
    
    if (!userId || !storeId) {
      return null;
    }
    
    return { id: userId, storeId };
  } catch (error) {
    console.error('[page-builder auth] Session verification failed:', error);
    return null;
  }
}

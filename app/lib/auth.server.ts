/**
 * Page Builder Auth Helper
 * 
 * Simple auth helper for page builder routes.
 */

import { redirect } from '@remix-run/cloudflare';
import type { AppLoadContext } from '@remix-run/cloudflare';
import { getSession, getUserId, getStoreId } from '~/services/auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { users, stores } from '@db/schema';

export interface AuthResult {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  store: {
    id: number;
    name: string;
    subdomain: string;
    slug: string;
    // Additional fields for page builder
    logo: string | null;
    favicon: string | null;
    facebookPixelId: string | null;
    googleAnalyticsId: string | null;
    fontFamily: string | null;
    themeConfig: string | null;
    businessInfo: string | null;
  };
}

/**
 * Require authenticated user with store access.
 * Redirects to login if not authenticated.
 */
export async function requireAuth(
  request: Request,
  context: AppLoadContext
): Promise<AuthResult> {
  const env = context.cloudflare.env;
  
  const userId = await getUserId(request, env);
  if (!userId) {
    throw redirect('/auth/login');
  }
  
  const storeId = await getStoreId(request, env);
  if (!storeId) {
    throw redirect('/auth/login');
  }
  
  const db = drizzle(env.DB);
  
  // Get user
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, userId));
  
  if (!user) {
    throw redirect('/auth/login');
  }
  
  // Get store with additional fields for page builder
  const storeIdNonNull = storeId as number;
  const [store] = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      logo: stores.logo,
      favicon: stores.favicon,
      facebookPixelId: stores.facebookPixelId,
      googleAnalyticsId: stores.googleAnalyticsId,
      fontFamily: stores.fontFamily,
      themeConfig: stores.themeConfig,
      businessInfo: stores.businessInfo,
    })
    .from(stores)
    .where(eq(stores.id, storeIdNonNull));
  
  if (!store) {
    throw redirect('/auth/login');
  }
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    store: {
      id: store.id,
      name: store.name || 'Store',
      subdomain: store.subdomain,
      slug: store.subdomain, // Use subdomain as slug
      logo: store.logo,
      favicon: store.favicon,
      facebookPixelId: store.facebookPixelId,
      googleAnalyticsId: store.googleAnalyticsId,
      fontFamily: store.fontFamily,
      themeConfig: store.themeConfig,
      businessInfo: store.businessInfo,
    },
  };
}

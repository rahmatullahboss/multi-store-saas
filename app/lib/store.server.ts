/**
 * Store Resolution Helper
 * 
 * Resolves the current store from context or database for storefront routes.
 * Used by public-facing routes like product pages, cart, checkout.
 */

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, type Store } from '@db/schema';

export interface StoreContext {
  storeId: number;
  store: Store;
}

/**
 * Get store from context or resolve from database
 * 
 * In development (localhost), defaults to first active store.
 * In production, store is resolved by tenant middleware.
 */
export async function resolveStore(
  context: { storeId?: number; store?: Store | null; cloudflare: { env: { DB: D1Database } } },
  request: Request
): Promise<StoreContext | null> {
  // If store is already resolved in context
  if (context.storeId && context.storeId > 0 && context.store) {
    return {
      storeId: context.storeId,
      store: context.store,
    };
  }

  // Otherwise, resolve from database (development fallback)
  const db = drizzle(context.cloudflare.env.DB);
  const hostname = new URL(request.url).hostname;
  
  // Check for store query param in development
  const url = new URL(request.url);
  const storeParam = url.searchParams.get('store');
  
  let store: Store | undefined;

  if (storeParam) {
    // Find by subdomain
    const result = await db
      .select()
      .from(stores)
      .where(eq(stores.subdomain, storeParam))
      .limit(1);
    store = result[0];
  }
  
  // If no store param or not found, get first active store
  if (!store) {
    const result = await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, true))
      .limit(1);
    store = result[0];
  }

  if (!store) {
    return null;
  }

  return {
    storeId: store.id,
    store,
  };
}

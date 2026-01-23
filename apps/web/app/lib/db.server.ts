/**
 * Database Client for Remix Loaders/Actions
 * 
 * Provides typed Drizzle ORM client initialized with D1 binding.
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export type Database = ReturnType<typeof createDb>;

/**
 * Create a Drizzle database client from D1 binding
 */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

/**
 * Type-safe helper for getting products by store
 */
export async function getProductsByStore(db: Database, storeId: number, options?: {
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const { category, limit = 50, offset = 0 } = options || {};
  
  const query = db.query.products.findMany({
    where: (products, { eq, and }) => 
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        category ? eq(products.category, category) : undefined
      ),
    limit,
    offset,
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
  
  return query;
}

/**
 * Get a single product by ID and store
 */
export async function getProductById(db: Database, productId: number, storeId: number) {
  return db.query.products.findFirst({
    where: (products, { eq, and }) => 
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId),
        eq(products.isPublished, true)
      ),
  });
}

/**
 * Get store by subdomain
 */
export async function getStoreBySubdomain(db: Database, subdomain: string) {
  return db.query.stores.findFirst({
    where: (stores, { eq }) => eq(stores.subdomain, subdomain),
  });
}

/**
 * Get store by custom domain
 */
export async function getStoreByCustomDomain(db: Database, customDomain: string) {
  return db.query.stores.findFirst({
    where: (stores, { eq }) => eq(stores.customDomain, customDomain),
  });
}

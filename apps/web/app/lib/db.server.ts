/**
 * Database Client for Remix Loaders/Actions
 * 
 * Provides typed Drizzle ORM client initialized with D1 binding.
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';
import { getActiveFlashSale } from '~/../server/services/discount.service';

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
  
  const products = await query;
  
  // Calculate Flash Sale Pricing
  const flashSale = await getActiveFlashSale(db, storeId);
  
  if (flashSale) {
    return products.map(p => {
      let flashPrice = p.price;
      if (flashSale.type === 'percentage') {
        const discountAmount = (p.price * flashSale.value) / 100;
        const cappedDiscount = flashSale.maxDiscountAmount 
          ? Math.min(discountAmount, flashSale.maxDiscountAmount) 
          : discountAmount;
        flashPrice = p.price - cappedDiscount;
      } else {
        flashPrice = Math.max(0, p.price - flashSale.value);
      }
      
      return {
        ...p,
        flashSalePrice: Math.floor(flashPrice),
        flashSaleLabel: flashSale.flashSaleTitle || 'Flash Sale'
      };
    });
  }

  return products.map(p => ({ ...p, flashSalePrice: null, flashSaleLabel: null }));
}

/**
 * Get a single product by ID and store
 */
export async function getProductById(db: Database, productId: number, storeId: number) {
  const product = await db.query.products.findFirst({
    where: (products, { eq, and }) => 
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId),
        eq(products.isPublished, true)
      ),
  });

  if (!product) return undefined;

  const flashSale = await getActiveFlashSale(db, storeId);
  let flashSalePrice = null;
  let flashSaleLabel = null;

  if (flashSale) {
    let flashPrice = product.price;
    if (flashSale.type === 'percentage') {
        const discountAmount = (product.price * flashSale.value) / 100;
        const cappedDiscount = flashSale.maxDiscountAmount 
          ? Math.min(discountAmount, flashSale.maxDiscountAmount) 
          : discountAmount;
        flashPrice = product.price - cappedDiscount;
    } else {
        flashPrice = Math.max(0, product.price - flashSale.value);
    }
    flashSalePrice = Math.floor(flashPrice);
    flashSaleLabel = flashSale.flashSaleTitle || 'Flash Sale';
  }

  return { ...product, flashSalePrice, flashSaleLabel };
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

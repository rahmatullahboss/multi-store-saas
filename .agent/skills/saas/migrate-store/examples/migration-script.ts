import { drizzle } from "drizzle-orm/d1";
import { stores, products } from "../../../../../db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function migrateToFree(db: D1Database, storeId: number) {
  const drizzleDb = drizzle(db);
  
  // 1. Update Plan
  await drizzleDb.update(stores)
    .set({ planType: 'free', updatedAt: new Date() })
    .where(eq(stores.id, storeId));

  // 2. Enforce Limits (Archive excess products)
  // Assuming 'free' limit is 10
  const allProducts = await drizzleDb.select().from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(products.createdAt);
    
  if (allProducts.length > 10) {
    const productsToArchive = allProducts.slice(10);
    for (const prod of productsToArchive) {
       await drizzleDb.update(products)
         .set({ isPublished: false })
         .where(eq(products.id, prod.id));
    }
  }
}

import { drizzle } from "drizzle-orm/d1";
import { products } from "../../../../../db/schema"; 

// Helper to chunk arrays
function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export async function batchInsertProducts(db: D1Database, items: any[]) {
  const drizzleDb = drizzle(db);
  
  // D1 Limit: 100 statements per batch
  const batches = chunk(items, 100);

  for (const batchItems of batches) {
    try {
      await drizzleDb.insert(products).values(batchItems).execute();
    } catch (e) {
      console.error("Batch failed", e);
      // Fallback: try one by one or queue for retry
    }
  }
}

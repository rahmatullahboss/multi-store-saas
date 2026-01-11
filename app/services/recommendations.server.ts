import type { Database } from "../lib/db.server";
import { orderItems, products, productVariants } from "../../db/schema";
import { eq, and, ne, desc, sql, inArray } from "drizzle-orm";

/**
 * RECOMMENDATION SERVICE
 * Implements "People who bought X also bought Y" logic (Item-Item Collaborative Filtering).
 */

export interface RecommendedProduct {
  id: number;
  title: string;
  price: number;
  image?: string; // Main image
  score: number; // Relevance score (co-occurrence count)
}

/**
 * Get dynamic product recommendations based on a source product ID.
 * Logic: Find orders containing sourceProductId -> Find other products in those orders -> Rank by frequency.
 */
export async function getRelatedProducts(db: Database, storeId: number, sourceProductId: number, limit = 4): Promise<RecommendedProduct[]> {
    // 1. Find Order IDs that contain the source product
    // We limit the search scope to recent orders or a max count for performance if needed, 
    // but D1 is fast enough for moderate datasets.
    
    // Subquery: Select order_id from order_items where product_id = sourceProductId
    // Note: Drizzle's sophisticated subqueries or 'semi-joins' can sometimes be verbose. 
    // We'll use a raw SQL builder pattern for this specific analytical query for efficiency.
    
    /*
      SELECT t2.product_id, COUNT(*) as frequency
      FROM order_items t1
      JOIN order_items t2 ON t1.order_id = t2.order_id
      WHERE t1.product_id = ? 
      AND t2.product_id != ?
      GROUP BY t2.product_id
      ORDER BY frequency DESC
      LIMIT ?
    */
   
    const relatedItems = await db.all<{productId: number, frequency: number}>(
        sql`
            SELECT t2.product_id as productId, COUNT(*) as frequency
            FROM order_items t1
            JOIN order_items t2 ON t1.order_id = t2.order_id
            WHERE t1.product_id = ${sourceProductId}
            AND t2.product_id != ${sourceProductId}
            GROUP BY t2.product_id
            ORDER BY frequency DESC
            LIMIT ${limit}
        `
    );

    if (relatedItems.length === 0) {
        // Fallback: Return "Best Sellers" from the same store if no sufficient co-occurrences
        return getBestSellers(db, storeId, limit, [sourceProductId]);
    }

    // 2. Hydrate product details
    const productIds = relatedItems.map(i => i.productId);
    
    const productDetails = await db.select({
        id: products.id,
        title: products.title,
        price: products.price,
        images: products.images,
    })
    .from(products)
    .where(and(
        eq(products.storeId, storeId),
        inArray(products.id, productIds),
        eq(products.isPublished, true)
    ));

    // Map back to preserve ranking and add score
    return productIds.map(id => {
        const p = productDetails.find(pd => pd.id === id);
        const rel = relatedItems.find(r => r.productId === id);
        if (!p) return null;
        
        let image = null;
        try {
            const parsedImages = JSON.parse(p.images || '[]');
            image = parsedImages[0] || null;
        } catch(e) {}

        return {
            id: p.id,
            title: p.title,
            price: p.price,
            image,
            score: rel ? rel.frequency : 0
        };
    }).filter(Boolean) as RecommendedProduct[];
}

/**
 * Fallback: Get Best Sellers
 */
async function getBestSellers(db: Database, storeId: number, limit: number, excludeIds: number[]): Promise<RecommendedProduct[]> {
    // Find top sold products
    // (This logic might ideally be cached or pre-calculated in a 'stats' table)
    
    const topItems = await db.all<{productId: number, frequency: number}>(
        sql`
            SELECT product_id as productId, COUNT(*) as frequency
            FROM order_items
            JOIN orders ON orders.id = order_items.order_id
            WHERE orders.store_id = ${storeId}
            AND product_id NOT IN ${excludeIds}
            GROUP BY product_id
            ORDER BY frequency DESC
            LIMIT ${limit}
        `
    );
    
    if (topItems.length === 0) return [];
    
    const productIds = topItems.map(i => i.productId);
    
    const productDetails = await db.select({
        id: products.id,
        title: products.title,
        price: products.price,
        images: products.images,
    })
    .from(products)
    .where(inArray(products.id, productIds));
    
    return productIds.map(id => {
        const p = productDetails.find(pd => pd.id === id);
        if(!p) return null;

        let image = null;
        try {
            const parsedImages = JSON.parse(p.images || '[]');
            image = parsedImages[0] || null;
        } catch(e) {}
        
        return {
            id: p.id,
            title: p.title,
            price: p.price,
            image,
            score: 0 // Fallback score
        };
    }).filter(Boolean) as RecommendedProduct[];
}

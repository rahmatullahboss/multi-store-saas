/**
 * Products API for Builders
 * 
 * Route: /api/products
 * 
 * Returns all products for the current store, including drafts.
 * Used by Page Builder and other editors to populate product selectors.
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products } from '@db/schema';
import { getStoreId } from '~/services/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  // Fetch all products for the store, including drafts
  const storeProducts = await db
    .select({ 
      id: products.id, 
      title: products.title, 
      imageUrl: products.imageUrl, 
      price: products.price,
      isPublished: products.isPublished
    })
    .from(products)
    .where(eq(products.storeId, storeId))
    .limit(100);

  return json({ products: storeProducts });
}


export default function() {}

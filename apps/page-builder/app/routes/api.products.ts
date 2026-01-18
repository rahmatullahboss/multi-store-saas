/**
 * Products API for Page Builder
 * 
 * Route: /api/products
 * 
 * Returns all products for the current store, including drafts.
 * Used by Page Builder components to populate product selectors:
 * - PageSettingsPanel (Featured Product dropdown)
 * - ButtonConnectorModal (Product connector)
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products } from '@db/schema';
import { getAuthFromSession } from '~/services/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context as any).cloudflare.env;
  const user = await getAuthFromSession(request, env);
  
  if (!user?.storeId) {
    // Return empty array instead of error to prevent UI breaking
    return json({ products: [], error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(env.DB);
  
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
    .where(eq(products.storeId, user.storeId))
    .limit(100);

  return json({ products: storeProducts });
}

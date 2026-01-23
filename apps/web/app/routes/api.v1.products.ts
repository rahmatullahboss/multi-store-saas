/**
 * Public API - Products
 * 
 * Route: /api/v1/products
 * 
 * Authenticated via API Key (Bearer token)
 * Allows merchants to programmatically access their products.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, like } from 'drizzle-orm';
import { products, productVariants } from '@db/schema';
import { authenticateApiKey } from '~/services/api.server';

// ============================================================================
// GET /api/v1/products - List products
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const auth = await authenticateApiKey(request, context.cloudflare.env, 'read_products');
    const db = drizzle(context.cloudflare.env.DB);
    const url = new URL(request.url);

    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Filters
    const search = url.searchParams.get('search');
    const published = url.searchParams.get('published'); // 'true' or 'false'

    // Build query conditions
    const conditions = [eq(products.storeId, auth.storeId)];
    
    if (search) {
      conditions.push(like(products.title, `%${search}%`));
    }
    if (published === 'true') {
      conditions.push(eq(products.isPublished, true));
    } else if (published === 'false') {
      conditions.push(eq(products.isPublished, false));
    }

    // Fetch products
    const productList = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        inventory: products.inventory,
        sku: products.sku,
        isPublished: products.isPublished,
        images: products.images,
        category: products.category,
        tags: products.tags,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return json({
      success: true,
      data: productList.map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images as string) : [],
        tags: p.tags ? JSON.parse(p.tags as string) : [],
      })),
      pagination: {
        page,
        limit,
        hasMore: productList.length === limit,
      },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('API Products Error:', error);
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

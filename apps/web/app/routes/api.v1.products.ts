/**
 * Public API - Products
 * 
 * Route: /api/v1/products
 * 
 * Authenticated via API Key (Bearer token)
 * Allows merchants to programmatically access their products.
 */

import { type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, like } from 'drizzle-orm';
import { products } from '@db/schema';
import { authenticateApiKey } from '~/services/api.server';

function safeJsonArrayParse(value: unknown): unknown[] {
  if (typeof value !== 'string' || value.trim() === '') {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ============================================================================
// GET /api/v1/products - List products
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const env = context.cloudflare.env;
    const hmacSecret = env.API_KEY_SECRET;
    const kv = env.STORE_CACHE ?? env.KV;
    if (!hmacSecret || !kv) {
      return json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }
    const rawKey = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
    const auth = rawKey && kv ? await authenticateApiKey(env.DB, kv, rawKey, hmacSecret) : null;
    const db = drizzle(context.cloudflare.env.DB);
    const url = new URL(request.url);

    // Pagination
    const page = Number.parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10);
    if (!Number.isInteger(page) || page < 1) {
      return json({ success: false, error: 'Invalid page. Use an integer >= 1.' }, { status: 400 });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return json(
        { success: false, error: 'Invalid limit. Use an integer between 1 and 100.' },
        { status: 400 }
      );
    }
    const offset = (page - 1) * limit;

    // Filters
    const search = url.searchParams.get('search');
    const published = url.searchParams.get('published'); // 'true' or 'false'

    // Build query conditions
    if (!auth) return json({ error: 'Unauthorized' }, { status: 401 });
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
      data: productList.map((p) => ({
        ...p,
        images: safeJsonArrayParse(p.images),
        tags: safeJsonArrayParse(p.tags),
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


export default function() {}

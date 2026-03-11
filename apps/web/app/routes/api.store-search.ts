import { json } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { products } from '@db/schema';
import { and, eq, like, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const storeIdParam = url.searchParams.get('storeId');

  if (!q || !q.trim() || !storeIdParam) {
    return json({ products: [] });
  }

  const storeId = parseInt(storeIdParam, 10);
  if (isNaN(storeId)) {
    return json({ products: [] }, { status: 400 });
  }

  const keyword = `%${q.trim()}%`;

  // Get D1 database from Cloudflare context
  if (!context.cloudflare?.env?.DB) {
     return json({ products: [] }, { status: 500 });
  }
  const db = drizzle(context.cloudflare.env.DB);

  try {
    const matchingProducts = await db
      .select({
        id: products.id,
        name: products.title,
        price: products.price,
        imageUrl: products.imageUrl,
        slug: products.id, // we map product.id as slug
      })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          or(
            like(products.title, keyword),
            like(products.description, keyword)
          )
        )
      )
      .limit(5);

    // Drizzle returns items formatted properly. Price should be raw db value (which we format in the UI).
    return json({
      products: matchingProducts.map(p => ({
        ...p,
        slug: p.id.toString(), // ensure slug is a string
      }))
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return json({ products: [] }, { status: 500 });
  }
}

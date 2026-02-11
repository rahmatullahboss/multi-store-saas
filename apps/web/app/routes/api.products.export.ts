/**
 * Products Export API
 * 
 * Route: /api/products/export
 * 
 * Exports all store products as a downloadable CSV file
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { products, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info for filename
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];

  // Fetch all products
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt));

  // Build CSV
  const headers = ['id', 'title', 'description', 'price', 'compare_at_price', 'sku', 'inventory', 'category', 'image_url', 'is_published', 'created_at'];
  
  const csvRows = [
    headers.join(','),
    ...storeProducts.map(product => {
      const values = [
        product.id,
        escapeCSV(product.title),
        escapeCSV(product.description || ''),
        product.price,
        product.compareAtPrice || '',
        escapeCSV(product.sku || ''),
        product.inventory ?? 0,
        escapeCSV(product.category || ''),
        escapeCSV(product.imageUrl || ''),
        product.isPublished ? 'true' : 'false',
        product.createdAt ? new Date(product.createdAt).toISOString() : '',
      ];
      return values.join(',');
    }),
  ];

  const csv = csvRows.join('\n');
  const filename = `${store.subdomain}_products_${new Date().toISOString().split('T')[0]}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

// Escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}


export default function() {}

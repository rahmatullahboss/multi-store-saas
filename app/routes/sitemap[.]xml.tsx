/**
 * Sitemap Route - Auto-generated XML sitemap
 * 
 * Route: /sitemap.xml
 * 
 * Generates dynamic sitemap including:
 * - Store homepage
 * - All published products
 * - Product landing pages (offers)
 */

import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products, collections, landingPages } from '@db/schema';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storeId, store, cloudflare } = context;
  
  if (!cloudflare?.env?.DB || !storeId || !store) {
    // Return empty sitemap for marketing site
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    );
  }

  const db = drizzle(cloudflare.env.DB);
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  // Fetch all published products
  const storeProducts = await db
    .select({
      id: products.id,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId as number),
        eq(products.isPublished, true)
      )
    )
    .limit(1000);

  const storeCollections = await db
    .select({
      slug: collections.slug,
      updatedAt: collections.updatedAt,
    })
    .from(collections)
    .where(and(eq(collections.storeId, storeId as number), eq(collections.isActive, true)))
    .limit(500);

  const storeLandingPages = await db
    .select({
      slug: landingPages.slug,
      updatedAt: landingPages.updatedAt,
    })
    .from(landingPages)
    .where(and(eq(landingPages.storeId, storeId as number), eq(landingPages.isPublished, true)))
    .limit(500);

  // Build sitemap XML
  const urls = [
    // Homepage
    `  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    // Products page (if store mode)
    `  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`,
    // Collections
    ...storeCollections.map(collection => `  <url>
    <loc>${baseUrl}/collections/${collection.slug}</loc>
    <lastmod>${collection.updatedAt ? new Date(collection.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`),
    // Landing pages
    ...storeLandingPages.map(page => `  <url>
    <loc>${baseUrl}/p/${page.slug}</loc>
    <lastmod>${page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`),
    // Individual products and offer pages
    ...storeProducts.flatMap(product => [
      `  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <lastmod>${product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      `  <url>
    <loc>${baseUrl}/offers/${product.id}</loc>
    <lastmod>${product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`,
    ]),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

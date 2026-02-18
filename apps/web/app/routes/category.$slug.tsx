/**
 * Category Page - Redirects to /products?category=xxx
 * Route: /category/:slug
 *
 * UNIFIED SYSTEM: This route now redirects to the unified /products page
 * with category query parameter for consistent category handling.
 */

import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { buildCategorySlugFromParam } from '~/utils/storefront-settings';

export async function loader({ params }: LoaderFunctionArgs) {
  const slug = params.slug || '';

  if (!slug) {
    throw new Response('Category slug required', { status: 400 });
  }

  // Use shared helper for consistent category slug normalization
  const categorySlug = buildCategorySlugFromParam(slug);
  return redirect(`/products?category=${categorySlug}`);
}

/**
 * Store Homepage Route
 * 
 * Displays products for the current store with caching.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products, type Product } from '@db/schema';
import { AddToCartButton } from '~/components/AddToCartButton';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.storeName || 'Store' },
    { name: 'description', content: `Shop the best products at ${data?.storeName}` },
  ];
};

/**
 * Loader - Fetch products for the current store
 * 
 * The storeId is automatically populated by the tenant middleware
 * based on the request hostname.
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storeId, store, cloudflare } = context;
  const db = drizzle(cloudflare.env.DB);
  
  // Parse query params for filtering
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  
  // Fetch products with store_id filter (multi-tenancy isolation)
  const storeProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId), // Always filter by store!
        eq(products.isPublished, true),
        category ? eq(products.category, category) : undefined
      )
    )
    .limit(50);
  
  // Get unique categories for navigation
  const allProducts = await db
    .select({ category: products.category })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true)
      )
    );
  
  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  
  return json({
    storeName: store?.name || 'Store',
    products: storeProducts,
    categories,
    currentCategory: category,
    currency: store?.currency || 'USD',
  });
}

export default function Index() {
  const { storeName, products, categories, currentCategory, currency } = useLoaderData<typeof loader>();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="store-header">
        <div className="container-store py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              {storeName}
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link to="/cart" className="relative p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="cart-badge" id="cart-count">0</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container-store text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to {storeName}
          </h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            Discover our amazing collection of products
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <nav className="bg-white border-b border-gray-100">
          <div className="container-store py-3">
            <div className="flex items-center gap-4 overflow-x-auto">
              <Link
                to="/"
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !currentCategory
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`?category=${encodeURIComponent(cat!)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    currentCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products Grid */}
      <main className="container-store py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <Link to={`/products/${product.id}`}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-image flex items-center justify-center bg-gray-100">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>
                
                <div className="product-info">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="product-title">{product.title}</h3>
                  </Link>
                  
                  <div className="flex items-center mt-1">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="product-price-compare">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  
                  <AddToCartButton productId={product.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
        <div className="container-store text-center">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Product Detail Page
 * 
 * Shows a single product with add to cart functionality.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '@db/schema';
import { AddToCartButton } from '~/components/AddToCartButton';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }];
  }
  return [
    { title: `${data.product.title} | ${data.storeName}` },
    { name: 'description', content: data.product.description || `Shop ${data.product.title}` },
  ];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { storeId, store, cloudflare } = context;
  const productId = parseInt(params.id || '', 10);
  
  if (isNaN(productId)) {
    throw new Response('Invalid product ID', { status: 400 });
  }
  
  const db = drizzle(cloudflare.env.DB);
  
  // Fetch product with store_id filter for security
  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId), // Always verify store ownership!
        eq(products.isPublished, true)
      )
    )
    .limit(1);
  
  const product = result[0];
  
  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }
  
  return json({
    product,
    storeName: store?.name || 'Store',
    currency: store?.currency || 'USD',
  });
}

export default function ProductDetail() {
  const { product, storeName, currency } = useLoaderData<typeof loader>();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  // Parse images if stored as JSON
  const images: string[] = product.images 
    ? JSON.parse(product.images) 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

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

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container-store py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </div>
      </nav>

      {/* Product Content */}
      <main className="container-store py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {images[0] ? (
                <img
                  src={images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-indigo-600">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            
            {product.description && (
              <div className="prose prose-gray mb-8">
                <p>{product.description}</p>
              </div>
            )}
            
            {/* Stock status */}
            <div className="mb-6">
              {product.inventory && product.inventory > 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  In Stock ({product.inventory} available)
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Out of Stock
                </span>
              )}
            </div>
            
            {/* Add to Cart */}
            <div className="space-y-4">
              <AddToCartButton 
                productId={product.id} 
                disabled={!product.inventory || product.inventory <= 0}
                size="large"
              />
            </div>
            
            {/* Product details */}
            {product.sku && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">SKU</dt>
                    <dd className="text-gray-900 font-medium">{product.sku}</dd>
                  </div>
                  {product.category && (
                    <div>
                      <dt className="text-gray-500">Category</dt>
                      <dd className="text-gray-900 font-medium">{product.category}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  CheckCircle,
  Share2,
  Star,
} from 'lucide-react';
import { FRESHNESS_THEME } from '../theme';
import type { SerializedProduct } from '~/templates/store-registry';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { sanitizeHtml } from '~/utils/sanitize';
import { AddToCartButton } from '~/components/AddToCartButton';
import { formatPrice } from '~/lib/formatting';

interface ProductPageProps {
  product: SerializedProduct;
  currency: string;
  relatedProducts?: SerializedProduct[];
  isPreview?: boolean;
}

export function FreshnessProductPage({
  product,
  currency,
  relatedProducts = [],
  isPreview = false,
}: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const currencySymbol = currency === 'BDT' ? '৳' : '$';
  const theme = FRESHNESS_THEME;

  const images = product.imageUrl ? [product.imageUrl] : [];
  // If product.images exists (string array or JSON), parse it here if needed.
  // For demo data, we usually just use imageUrl or images array.

  const [selectedImage, setSelectedImage] = useState(0);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: theme.fontBody }}>
      {/* Breadcrumb */}
      <div className="bg-white border-b" style={{ borderColor: theme.border }}>
        <div className="container mx-auto px-4 py-3 text-sm">
          <nav className="flex items-center gap-2 text-gray-500">
            <PreviewSafeLink to="/" className="hover:text-green-600" isPreview={isPreview}>
              Home
            </PreviewSafeLink>
            <span>/</span>
            <PreviewSafeLink to="/products" className="hover:text-green-600" isPreview={isPreview}>
              Products
            </PreviewSafeLink>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4 group">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No Image
                  </div>
                )}

                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-2">
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-green-50 text-green-700">
                  In Stock
                </span>
              </div>

              <h1
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: theme.fontHeading }}
              >
                {product.title}
              </h1>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(12 reviews)</span>
              </div>

              <div className="flex items-end gap-3 mb-8">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through mb-1">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <div 
                className="text-gray-600 mb-8 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description || 'Experience the freshness of nature with our premium quality products. Sourced directly from trusted farms to your table.') }}
              />

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <AddToCartButton
                  productId={product.id}
                  storeId={product.storeId}
                  productPrice={product.price}
                  productName={product.title}
                  isPreview={isPreview}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </AddToCartButton>

                <button className="px-4 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                  <Heart size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Free Delivery</p>
                    <p className="text-xs text-gray-500">For orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">100% Organic</p>
                    <p className="text-xs text-gray-500">Certified products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2
              className="text-2xl font-bold text-gray-900 mb-8 text-center"
              style={{ fontFamily: theme.fontHeading }}
            >
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <PreviewSafeLink
                  key={p.id}
                  to={`/products/${p.id}`}
                  isPreview={isPreview}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden border border-gray-100"
                >
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    {/* Hover Button */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <AddToCartButton
                        productId={p.id}
                        storeId={p.storeId}
                        productPrice={p.price}
                        productName={p.title}
                        isPreview={isPreview}
                        className="w-full bg-white text-green-700 font-bold py-2 rounded-lg shadow-lg hover:bg-green-50 text-sm"
                      >
                        Add
                      </AddToCartButton>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-green-700">{formatPrice(p.price)}</span>
                      {p.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(p.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </PreviewSafeLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

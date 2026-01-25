/**
 * Shared Product Page Component
 * 
 * A Shopify-standard product page that can be used by any template.
 * Features:
 * - Image gallery with thumbnails
 * - Product info (title, price, variants)
 * - Add to cart with quantity selector
 * - Buy now button
 * - Product description tabs
 * - Reviews section
 * - Related products
 */

import React, { useState } from 'react';
import { Link, useFetcher } from '@remix-run/react';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Check, 
  Truck, 
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  images?: string[];
  category?: string | null;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
    compareAtPrice?: number;
    sku?: string;
    stock?: number;
  }>;
  reviews?: {
    average: number;
    count: number;
    items?: Array<{
      id: number;
      customerName: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  };
}

interface SharedProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export default function SharedProductPage({ 
  product, 
  currency, 
  relatedProducts = [],
  theme
}: SharedProductPageProps) {
  const currencySymbol = currency === 'BDT' ? '৳' : '$';
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  
  const fetcher = useFetcher();

  // Combine main image with additional images
  const allImages = [
    product.imageUrl,
    ...(product.images || [])
  ].filter(Boolean) as string[];

  const currentPrice = selectedVariant?.price || product.price;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    fetcher.submit(
      {
        productId: String(product.id),
        variantId: selectedVariant?.id ? String(selectedVariant.id) : '',
        quantity: String(quantity),
      },
      { method: 'POST', action: '/api/cart' }
    );
    
    setTimeout(() => {
      setIsAdding(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 600);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const primaryColor = theme?.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gray-700 flex items-center">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link to="/products" className="hover:text-gray-700">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                <Link 
                  to={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-gray-700"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm group">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{discountPercent}%
                    </div>
                  )}
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              
              {/* Reviews Summary */}
              {product.reviews && product.reviews.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(product.reviews!.average)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviews.count} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                {currencySymbol}{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {currencySymbol}{comparePrice!.toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                style={!addedToCart ? { backgroundColor: primaryColor } : {}}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 px-6 border-2 rounded-lg font-semibold transition-colors hover:bg-gray-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Buy Now
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-green-500" />
                <span>Free shipping on orders over {currencySymbol}1,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Secure checkout • 100% payment protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="mt-12">
          <div className="border-b">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({product.reviews?.count || 0})
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' ? (
              <div className="prose max-w-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className="text-gray-500">No description available.</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {product.reviews?.items && product.reviews.items.length > 0 ? (
                  product.reviews.items.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{review.customerName}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relProduct) => (
                <Link
                  key={relProduct.id}
                  to={`/products/${relProduct.id}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square overflow-hidden">
                    {relProduct.imageUrl ? (
                      <img
                        src={relProduct.imageUrl}
                        alt={relProduct.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {relProduct.title}
                    </h3>
                    <p className="mt-1 font-semibold" style={{ color: primaryColor }}>
                      {currencySymbol}{relProduct.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

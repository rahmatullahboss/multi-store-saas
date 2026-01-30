/**
 * BDShop Product Detail Page Component
 *
 * Product detail page styled to match bdshop.com design.
 * Features:
 * - Main image gallery with thumbnails
 * - Product info with ID, brand, warranty
 * - Price display with discount and save badges
 * - Stock availability bar
 * - Shipping options display
 * - Description/Specifications tabs
 * - Related products section
 * - Mobile-responsive layout
 */

import { useState } from 'react';
import { Link } from '@remix-run/react';
import {
  ShoppingCart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Star,
  Copy,
  Check,
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import { BDShopPageWrapper, BDSHOP_THEME } from './BDShopPageWrapper';
import type { SocialLinks } from '@db/types';
import { formatPrice } from '~/lib/theme-engine';

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images?: string;
  category: string | null;
  sku?: string | null;
  inventory?: number | null;
  brand?: string | null;
  warranty?: string | null;
}

interface BDShopProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
  storeName: string;
  storeId: number;
  logo?: string | null;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
  avgRating?: number;
  reviewCount?: number;
}

export function BDShopProductDetail({
  product,
  relatedProducts = [],
  storeName,
  storeId,
  logo,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  categories = [],
  avgRating = 0,
  reviewCount = 0,
}: BDShopProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const [copied, setCopied] = useState(false);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const copyProductId = () => {
    navigator.clipboard.writeText(String(product.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse images if stored as JSON
  const images: string[] = product.images
    ? JSON.parse(product.images)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const saveAmount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0;

  return (
    <BDShopPageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      categories={categories}
      breadcrumb={[{ label: 'Products', href: '/' }, { label: product.title }]}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Product Main Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-contain bg-white cursor-zoom-in"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ShoppingBag className="w-24 h-24 text-gray-300" />
                  </div>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <span
                    className="absolute top-4 left-4 text-white text-sm font-bold px-3 py-1.5 rounded"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                        selectedImage === i
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Title */}
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: BDSHOP_THEME.text }}>
                {product.title}
              </h1>

              {/* Product Meta */}
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Product ID:</span>
                  <span className="font-medium">{product.id}</span>
                  <button
                    onClick={copyProductId}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
                {product.brand && (
                  <div>
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium ml-1">{product.brand}</span>
                  </div>
                )}
                {product.warranty && (
                  <div>
                    <span className="text-gray-500">Warranty:</span>
                    <span className="font-medium ml-1">{product.warranty}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= avgRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: BDSHOP_THEME.navy }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                {saveAmount > 0 && (
                  <span
                    className="inline-block text-sm font-medium px-2 py-1 rounded"
                    style={{ backgroundColor: '#DCFCE7', color: BDSHOP_THEME.green }}
                  >
                    Save {formatPrice(saveAmount)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.inventory && product.inventory > 0 ? (
                  <>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: BDSHOP_THEME.green,
                          width: `${Math.min(100, (product.inventory / 100) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: BDSHOP_THEME.green }}>
                      In stock ({product.inventory} available)
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-red-500">Out of stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium" style={{ color: BDSHOP_THEME.text }}>
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <AddToCartButton
                  productId={product.id}
                  disabled={!product.inventory || product.inventory <= 0}
                  className="flex-1 py-3 md:py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                  style={{ backgroundColor: BDSHOP_THEME.navy }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Order
                </AddToCartButton>
                <Link
                  to="/cart"
                  className="px-6 py-3 md:py-4 rounded-lg font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#1F2937' }}
                >
                  Buy Now
                </Link>
              </div>

              {/* Shipping Options */}
              <div className="border border-gray-200 rounded-lg p-4 mt-4 space-y-3">
                <h3 className="font-semibold text-sm" style={{ color: BDSHOP_THEME.text }}>
                  Shipping Options
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>Office Pickup</span>
                    </div>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>Inside Dhaka</span>
                    </div>
                    <span className="font-medium">৳60</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>Outside Dhaka</span>
                    </div>
                    <span className="font-medium">৳120</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specifications Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* Tab Headers */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 font-medium text-sm transition ${
                activeTab === 'description'
                  ? 'border-b-2 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={
                activeTab === 'description'
                  ? { borderColor: BDSHOP_THEME.navy, color: BDSHOP_THEME.navy }
                  : {}
              }
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-6 py-3 font-medium text-sm transition ${
                activeTab === 'specifications'
                  ? 'border-b-2 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={
                activeTab === 'specifications'
                  ? { borderColor: BDSHOP_THEME.navy, color: BDSHOP_THEME.navy }
                  : {}
              }
            >
              Specifications
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none" style={{ color: BDSHOP_THEME.text }}>
                {product.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.description.replace(/\n/g, '<br/>'),
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No description available.</p>
                )}
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="space-y-2">
                {product.sku && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-1/3 text-gray-500 text-sm">SKU</span>
                    <span className="text-sm font-medium">{product.sku}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-1/3 text-gray-500 text-sm">Category</span>
                    <span className="text-sm font-medium">{product.category}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-1/3 text-gray-500 text-sm">Brand</span>
                    <span className="text-sm font-medium">{product.brand}</span>
                  </div>
                )}
                {product.warranty && (
                  <div className="flex py-2">
                    <span className="w-1/3 text-gray-500 text-sm">Warranty</span>
                    <span className="text-sm font-medium">{product.warranty}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_THEME.green}15` }}
              >
                <Shield className="w-5 h-5 md:w-6 md:h-6" style={{ color: BDSHOP_THEME.green }} />
              </div>
              <div>
                <p
                  className="font-semibold text-xs md:text-sm"
                  style={{ color: BDSHOP_THEME.text }}
                >
                  100% Genuine
                </p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_THEME.textLight }}>
                  Authentic products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_THEME.navy}10` }}
              >
                <Truck className="w-5 h-5 md:w-6 md:h-6" style={{ color: BDSHOP_THEME.navy }} />
              </div>
              <div>
                <p
                  className="font-semibold text-xs md:text-sm"
                  style={{ color: BDSHOP_THEME.text }}
                >
                  Fast Delivery
                </p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_THEME.textLight }}>
                  Nationwide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_THEME.green}15` }}
              >
                <RotateCcw
                  className="w-5 h-5 md:w-6 md:h-6"
                  style={{ color: BDSHOP_THEME.green }}
                />
              </div>
              <div>
                <p
                  className="font-semibold text-xs md:text-sm"
                  style={{ color: BDSHOP_THEME.text }}
                >
                  Easy Returns
                </p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_THEME.textLight }}>
                  7-day policy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_THEME.navy}10` }}
              >
                <Shield className="w-5 h-5 md:w-6 md:h-6" style={{ color: BDSHOP_THEME.navy }} />
              </div>
              <div>
                <p
                  className="font-semibold text-xs md:text-sm"
                  style={{ color: BDSHOP_THEME.text }}
                >
                  Secure Payment
                </p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_THEME.textLight }}>
                  100% protected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: BDSHOP_THEME.text }}>
              You might also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {relatedProducts.slice(0, 6).map((item) => {
                const itemDiscount =
                  item.compareAtPrice && item.compareAtPrice > item.price
                    ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
                    : 0;

                return (
                  <Link
                    key={item.id}
                    to={`/products/${item.id}`}
                    className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition group"
                  >
                    <div className="relative aspect-square">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingBag className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      {itemDiscount > 0 && (
                        <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500">
                          {itemDiscount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs line-clamp-2 mb-1" style={{ color: BDSHOP_THEME.text }}>
                        {item.title}
                      </p>
                      <p className="font-bold text-sm" style={{ color: BDSHOP_THEME.navy }}>
                        {formatPrice(item.price)}
                      </p>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <p
                          className="text-[10px] line-through"
                          style={{ color: BDSHOP_THEME.textLight }}
                        >
                          {formatPrice(item.compareAtPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BDShopPageWrapper>
  );
}

/**
 * GhorerBazar Product Detail Page Component
 *
 * Product detail page styled to match ghorerbazar.com design.
 * Features:
 * - Main image with discount badge overlay
 * - Bilingual title support (English/Bengali)
 * - Price display with SAVE badge
 * - Quantity selector with +/- buttons
 * - COD-focused checkout buttons
 * - Expandable description accordion
 * - "You Might Also Like" related products section
 */

import { Link } from '@remix-run/react';
import { useState } from 'react';
import {
  Minus,
  Plus,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import { GhorerBazarPageWrapper, GHORER_BAZAR_THEME } from './GhorerBazarPageWrapper';
import type { SocialLinks } from '@db/types';
import { formatPrice } from '~/lib/theme-engine';

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string | null;
}

interface GhorerBazarProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  storeName: string;
  storeId: number;
  logo?: string | null;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
}

export function GhorerBazarProductDetail({
  product,
  relatedProducts,
  storeName,
  storeId,
  logo,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  categories = [],
}: GhorerBazarProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(true);

  const { primaryColor, redDiscount, cyanBadge } = GHORER_BAZAR_THEME;

  const discountAmount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <GhorerBazarPageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      categories={categories}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>›</span>
          {product.category && (
            <>
              <Link
                to={`/?category=${encodeURIComponent(product.category)}`}
                className="hover:text-gray-900"
              >
                {product.category}
              </Link>
              <span>›</span>
            </>
          )}
          <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-xl bg-white shadow-sm">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ShoppingCart className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Store Logo Badge */}
            {logo && (
              <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden">
                <img src={logo} alt="" className="w-10 h-10 object-contain" />
              </div>
            )}

            {/* Discount Badge */}
            {discountAmount > 0 && (
              <div
                className="absolute top-4 right-4 w-16 h-16 rounded-full flex flex-col items-center justify-center text-white font-bold"
                style={{ backgroundColor: redDiscount }}
              >
                <span className="text-sm">{formatPrice(discountAmount)}</span>
                <span className="text-xs">ছাড়</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.title}</h1>

            {/* Price Section */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span
                    className="px-3 py-1 rounded text-sm font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    SAVE {formatPrice(discountAmount)}
                  </span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 hover:bg-gray-100 transition"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 py-3 text-center font-medium min-w-[60px]">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 hover:bg-gray-100 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Buttons */}
            <div className="space-y-3">
              {/* Standard Add to Cart */}
              <AddToCartButton
                productId={product.id}
                productName={product.title}
                productPrice={product.price}
                currency={currency}
                className="w-full py-4 rounded-lg text-lg font-bold bg-gray-900 text-white hover:bg-gray-800 transition"
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to cart</span>
                </div>
              </AddToCartButton>

              {/* COD Order Button - Primary */}
              <Link
                to={`/checkout?product=${product.id}&qty=${quantity}`}
                className="w-full py-4 rounded-lg text-lg font-bold flex items-center justify-center gap-3 text-black transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>ক্যাশ অন ডেলিভারিতে অর্ডার করুন</span>
              </Link>
            </div>

            {/* WhatsApp Order */}
            {socialLinks?.whatsapp && (
              <a
                href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}?text=আমি এই প্রোডাক্টটি অর্ডার করতে চাই: ${product.title} (${formatPrice(product.price)})`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-green-500 text-white transition hover:bg-green-600"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp এ অর্ডার করুন</span>
              </a>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div
                  className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Truck className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <p className="text-xs text-gray-600">দ্রুত ডেলিভারি</p>
              </div>
              <div className="text-center">
                <div
                  className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Shield className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <p className="text-xs text-gray-600">১০০% অরিজিনাল</p>
              </div>
              <div className="text-center">
                <div
                  className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <RefreshCw className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <p className="text-xs text-gray-600">সহজ রিটার্ন</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Accordion */}
        {product.description && (
          <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
            >
              <span className="text-lg font-bold">Description</span>
              {showDescription ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {showDescription && (
              <div className="px-6 pb-6">
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 5).map((relatedProduct) => {
                const discount =
                  relatedProduct.compareAtPrice &&
                  relatedProduct.compareAtPrice > relatedProduct.price
                    ? relatedProduct.compareAtPrice - relatedProduct.price
                    : 0;

                return (
                  <Link
                    key={relatedProduct.id}
                    to={`/products/${relatedProduct.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {relatedProduct.imageUrl ? (
                        <img
                          src={relatedProduct.imageUrl}
                          alt={relatedProduct.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingCart className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      {discount > 0 && (
                        <div
                          className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: cyanBadge }}
                        >
                          ON SALE
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                        {relatedProduct.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        {relatedProduct.compareAtPrice &&
                          relatedProduct.compareAtPrice > relatedProduct.price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(relatedProduct.compareAtPrice)}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="px-3 pb-3">
                      <div
                        className="w-full py-2 rounded text-center text-sm font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Quick Add
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </GhorerBazarPageWrapper>
  );
}

/**
 * GhorerBazar Cart Page Component
 *
 * Cart page styled to match ghorerbazar.com design.
 * Features:
 * - Orange banner header with "Shopping Cart" title
 * - Cart items table layout
 * - Quantity selector with +/- buttons
 * - Order summary with subtotal
 * - COD checkout button (orange)
 * - Empty cart state
 * - Recently Viewed Products section
 */

import { Link } from '@remix-run/react';
import { useState } from 'react';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ShoppingBag,
  StickyNote,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { GhorerBazarPageWrapper, GHORER_BAZAR_THEME } from './GhorerBazarPageWrapper';
import type { SocialLinks } from '@db/types';
import { formatPrice } from '~/lib/theme-engine';

interface CartItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface Product {
  id: number;
  title: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
}

interface GhorerBazarCartPageProps {
  cartItems: CartItem[];
  recentlyViewed?: Product[];
  storeName: string;
  storeId: number;
  logo?: string | null;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
  onUpdateQuantity?: (itemId: number, quantity: number) => void;
  onRemoveItem?: (itemId: number) => void;
}

export function GhorerBazarCartPage({
  cartItems,
  recentlyViewed = [],
  storeName,
  storeId,
  logo,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  categories = [],
  onUpdateQuantity,
  onRemoveItem,
}: GhorerBazarCartPageProps) {
  const { primaryColor, redDiscount, cyanBadge } = GHORER_BAZAR_THEME;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = cartItems.length === 0;

  const handleQuantityChange = (itemId: number, currentQty: number, delta: number) => {
    const newQty = Math.max(1, currentQty + delta);
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, newQty);
    }
  };

  const handleRemove = (itemId: number) => {
    if (onRemoveItem) {
      onRemoveItem(itemId);
    }
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
      showBreadcrumbBanner={true}
      pageTitle="Shopping Cart"
      breadcrumb={[{ label: 'Your Shopping Cart' }]}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isEmpty ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <ShoppingCart className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is currently empty.</h2>
            <p className="text-gray-500 mb-8">আপনার কার্টে কোনো পণ্য নেই।</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <ArrowLeft className="h-5 w-5" />
              Back to shopping
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-700">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="md:col-span-6 flex items-center gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/products/${item.productId}`}
                              className="font-medium text-gray-900 hover:underline line-clamp-2"
                            >
                              {item.title}
                            </Link>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-sm text-red-500 hover:underline mt-1 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="md:col-span-2 text-center">
                          <span className="md:hidden text-sm text-gray-500 mr-2">Price:</span>
                          <span className="font-medium">{formatPrice(item.price)}</span>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2 flex justify-center">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              className="p-2 hover:bg-gray-100 transition"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-center font-medium min-w-[40px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              className="p-2 hover:bg-gray-100 transition"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="md:col-span-2 text-right">
                          <span className="md:hidden text-sm text-gray-500 mr-2">Total:</span>
                          <span className="font-bold text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="underline">Continue shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                {/* Quick Actions */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <StickyNote className="h-4 w-4" />
                    Note
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <Tag className="h-4 w-4" />
                    Coupon
                  </button>
                </div>

                {/* Subtotal */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-sm text-gray-500">Taxes and shipping calculated at checkout</p>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-3">
                  {/* COD Order Button - Primary */}
                  <Link
                    to="/checkout"
                    className="w-full py-4 rounded-lg text-lg font-bold flex items-center justify-center gap-3 text-black transition hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>ক্যাশ অন ডেলিভারিতে অর্ডার করুন</span>
                  </Link>

                  {/* Pay Online Button */}
                  <Link
                    to="/checkout?payment=online"
                    className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-gray-900 text-white transition hover:bg-gray-800"
                  >
                    Pay Online
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recently Viewed Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed.slice(0, 5).map((product) => {
                const discount =
                  product.compareAtPrice && product.compareAtPrice > product.price
                    ? product.compareAtPrice - product.price
                    : 0;

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
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
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.compareAtPrice)}
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

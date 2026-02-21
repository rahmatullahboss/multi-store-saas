/**
 * BDShop Cart Page Component
 *
 * Cart page styled to match bdshop.com design.
 * Features:
 * - Navy header banner with "Shopping Cart" title
 * - Cart items table layout
 * - Quantity selector with +/- buttons
 * - Item removal option
 * - Order summary sidebar
 * - Shipping cost calculation
 * - Proceed to checkout button
 * - Empty cart state
 * - Mobile-responsive layout
 */

import { Link } from '@remix-run/react';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Tag,
} from 'lucide-react';
import { BDShopPageWrapper, BDSHOP_THEME } from './BDShopPageWrapper';
import type { SocialLinks } from '@db/types';
import { formatPrice } from '~/lib/formatting';

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

interface BDShopCartPageProps {
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

export function BDShopCartPage({
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
}: BDShopCartPageProps) {
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

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 500 ? 0 : 60; // Free shipping over ৳500
  const total = subtotal + shippingCost;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BDShopPageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      categories={categories}
      cartCount={totalItems}
      pageTitle="Shopping Cart"
      showBreadcrumbBanner={true}
      breadcrumb={[{ label: 'Shopping Cart' }]}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Desktop Table Header */}
              <div
                className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 rounded-lg p-4 text-sm font-medium"
                style={{ color: BDSHOP_THEME.text }}
              >
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Cart Items */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition"
                          style={{ color: BDSHOP_THEME.text }}
                        >
                          {item.title}
                        </Link>
                        <p className="font-bold mt-1" style={{ color: BDSHOP_THEME.navy }}>
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-bold" style={{ color: BDSHOP_THEME.navy }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition"
                          style={{ color: BDSHOP_THEME.text }}
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-xs text-red-500 hover:underline mt-1 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div
                      className="col-span-2 text-center font-medium"
                      style={{ color: BDSHOP_THEME.navy }}
                    >
                      {formatPrice(item.price)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div
                      className="col-span-2 text-right font-bold"
                      style={{ color: BDSHOP_THEME.navy }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition"
                style={{ color: BDSHOP_THEME.navy }}
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-24">
                <h2 className="font-bold text-lg mb-4" style={{ color: BDSHOP_THEME.text }}>
                  Order Summary
                </h2>

                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: BDSHOP_THEME.textLight }}>
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: BDSHOP_THEME.textLight }}
                    >
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    {shippingCost === 0 ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      <span className="font-medium">{formatPrice(shippingCost)}</span>
                    )}
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs" style={{ color: BDSHOP_THEME.textLight }}>
                      Add {formatPrice(500 - subtotal)} more for free shipping!
                    </p>
                  )}
                </div>

                {/* Coupon Code */}
                <div className="py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" style={{ color: BDSHOP_THEME.textLight }} />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
                      style={{ backgroundColor: BDSHOP_THEME.navy }}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="py-4">
                  <div className="flex justify-between">
                    <span className="font-bold" style={{ color: BDSHOP_THEME.text }}>
                      Total
                    </span>
                    <span className="font-bold text-xl" style={{ color: BDSHOP_THEME.navy }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full py-3 md:py-4 rounded-lg font-bold text-white text-center transition hover:opacity-90"
                  style={{ backgroundColor: BDSHOP_THEME.orange }}
                >
                  Proceed to Checkout
                </Link>

                <p className="text-xs text-center mt-3" style={{ color: BDSHOP_THEME.textLight }}>
                  Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center max-w-md mx-auto">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${BDSHOP_THEME.navy}10` }}
            >
              <ShoppingCart className="w-10 h-10" style={{ color: BDSHOP_THEME.navy }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: BDSHOP_THEME.text }}>
              Your cart is empty
            </h2>
            <p className="text-sm mb-6" style={{ color: BDSHOP_THEME.textLight }}>
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: BDSHOP_THEME.navy }}
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: BDSHOP_THEME.text }}>
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="aspect-square">
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
                  </div>
                  <div className="p-2">
                    <p className="text-xs line-clamp-2 mb-1" style={{ color: BDSHOP_THEME.text }}>
                      {item.title}
                    </p>
                    <p className="font-bold text-sm" style={{ color: BDSHOP_THEME.navy }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </BDShopPageWrapper>
  );
}

/**
 * Daraz Cart Summary Section
 *
 * Shopify OS 2.0 Compatible Section
 * Order summary with Daraz-style design:
 * - Orange (#F85606) checkout button
 * - Coupon code input
 * - Order totals breakdown
 * - Payment method icons
 */

import { useState } from 'react';
import { Link, useFetcher } from '@remix-run/react';
import { Tag, ShieldCheck, CreditCard, Truck, ChevronRight } from 'lucide-react';
import type { SectionSchema, SectionComponentProps, CartItem } from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-summary',
  name: 'Cart Summary (Daraz)',
  tag: 'aside',
  class: 'daraz-cart-summary',

  enabled_on: {
    templates: ['cart'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Order Summary',
    },
    {
      type: 'checkbox',
      id: 'show_coupon_input',
      label: 'Show coupon input',
      default: true,
    },
    {
      type: 'text',
      id: 'coupon_placeholder',
      label: 'Coupon placeholder',
      default: 'Enter coupon code',
    },
    {
      type: 'text',
      id: 'apply_button',
      label: 'Apply button text',
      default: 'Apply',
    },
    {
      type: 'checkbox',
      id: 'show_shipping_estimate',
      label: 'Show shipping estimate',
      default: true,
    },
    {
      type: 'text',
      id: 'shipping_text',
      label: 'Shipping text',
      default: 'Free Delivery on orders over ৳1000',
    },
    {
      type: 'text',
      id: 'checkout_button',
      label: 'Checkout button text',
      default: 'Proceed to Checkout',
    },
    {
      type: 'checkbox',
      id: 'show_payment_icons',
      label: 'Show payment icons',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_secure_badge',
      label: 'Show secure checkout badge',
      default: true,
    },
    {
      type: 'color',
      id: 'primary_color',
      label: 'Primary color',
      default: '#F85606',
    },
    {
      type: 'color',
      id: 'price_color',
      label: 'Price color',
      default: '#F36D00',
    },
  ],

  presets: [
    {
      name: 'Daraz Cart Summary',
      category: 'Cart',
      settings: {
        heading: 'Order Summary',
        show_coupon_input: true,
        primary_color: '#F85606',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface DarazCartSummarySettings {
  heading: string;
  show_coupon_input: boolean;
  coupon_placeholder: string;
  apply_button: string;
  show_shipping_estimate: boolean;
  shipping_text: string;
  checkout_button: string;
  show_payment_icons: boolean;
  show_secure_badge: boolean;
  primary_color: string;
  price_color: string;
}

// Demo cart for preview
const DEMO_CART = {
  items: [] as CartItem[],
  itemCount: 3,
  subtotal: 1299700,
  total: 1299700,
};

export default function DarazCartSummary({ section, context, settings }: SectionComponentProps) {
  const {
    heading = 'Order Summary',
    show_coupon_input = true,
    coupon_placeholder = 'Enter coupon code',
    apply_button = 'Apply',
    show_shipping_estimate = true,
    shipping_text = 'Free Delivery on orders over ৳1000',
    checkout_button = 'Proceed to Checkout',
    show_payment_icons = true,
    show_secure_badge = true,
    primary_color = '#F85606',
    price_color = '#F36D00',
  } = settings as unknown as DarazCartSummarySettings;

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const fetcher = useFetcher();

  // Use context cart or demo cart
  const cart = context.cart || DEMO_CART;
  const subtotal = cart.subtotal || cart.total;
  const total = cart.total;
  const itemCount = cart.itemCount;

  // Free shipping threshold
  const freeShippingThreshold = 1000;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 60;
  const finalTotal = total + shippingCost;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setCouponError('');
    fetcher.submit(
      { action: 'apply_coupon', couponCode: couponCode.trim() },
      { method: 'post', action: '/cart' }
    );
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <aside
      className="bg-white rounded-lg shadow-sm p-4 md:p-6"
      data-section-id={section.id}
      data-section-type="daraz-cart-summary"
    >
      {/* Heading */}
      <h2 className="text-lg font-medium mb-4 text-gray-800">{heading}</h2>

      {/* Coupon Code */}
      {show_coupon_input && (
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={coupon_placeholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 text-sm font-medium rounded border-2 transition-colors"
              style={{ borderColor: primary_color, color: primary_color }}
            >
              {apply_button}
            </button>
          </div>
          {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
        </div>
      )}

      {/* Order Details */}
      <div className="space-y-3 py-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          {shippingCost === 0 ? (
            <span className="text-green-600 font-medium">Free</span>
          ) : (
            <span className="text-gray-800">{formatPrice(shippingCost)}</span>
          )}
        </div>

        {context.cart?.discounts && context.cart.discounts.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600 font-medium">
              -
              {formatPrice(
                context.cart.discounts.reduce(
                  (acc: number, d: { applied: number }) => acc + (d.applied ?? 0),
                  0
                )
              )}
            </span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between py-4 border-t border-gray-200">
        <span className="font-medium text-gray-800">Total</span>
        <span className="text-xl font-bold" style={{ color: price_color }}>
          {formatPrice(finalTotal)}
        </span>
      </div>

      {/* Shipping Info */}
      {show_shipping_estimate && subtotal < freeShippingThreshold && (
        <div className="flex items-center gap-2 p-3 rounded bg-orange-50 mb-4">
          <Truck size={16} style={{ color: primary_color }} />
          <span className="text-xs text-gray-700">
            Add {formatPrice(freeShippingThreshold - (subtotal ?? 0))} more for free delivery!
          </span>
        </div>
      )}

      {show_shipping_estimate && subtotal >= freeShippingThreshold && (
        <div className="flex items-center gap-2 p-3 rounded bg-green-50 mb-4">
          <Truck size={16} className="text-green-600" />
          <span className="text-xs text-green-700">{shipping_text}</span>
        </div>
      )}

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className="flex items-center justify-center gap-2 w-full py-3 rounded font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: primary_color }}
      >
        {checkout_button}
        <ChevronRight size={18} />
      </Link>

      {/* Secure Checkout Badge */}
      {show_secure_badge && (
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-500">
          <ShieldCheck size={16} />
          <span className="text-xs">Secure Checkout</span>
        </div>
      )}

      {/* Payment Icons */}
      {show_payment_icons && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">We Accept</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
              <CreditCard size={14} className="text-gray-500" />
            </div>
            <div className="px-2 py-1 bg-pink-100 rounded text-[10px] font-bold text-pink-600">
              bKash
            </div>
            <div className="px-2 py-1 bg-purple-100 rounded text-[10px] font-bold text-purple-600">
              Nagad
            </div>
            <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
              COD
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

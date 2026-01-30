/**
 * Cart Summary Section
 *
 * Shopify OS 2.0 Compatible Section
 * Displays cart totals and checkout button.
 */

import { Link, useFetcher } from '@remix-run/react';
import { CreditCard, Truck, Tag, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { SectionSchema, SectionComponentProps, CartData } from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-summary',
  name: 'Cart Summary',
  tag: 'aside',
  class: 'cart-summary',

  enabled_on: {
    templates: ['cart'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'অর্ডার সামারি',
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
      default: 'কুপন কোড লিখুন',
    },
    {
      type: 'text',
      id: 'apply_button',
      label: 'Apply button text',
      default: 'প্রয়োগ করুন',
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
      default: 'ফ্রি ডেলিভারি ১০০০৳+ অর্ডারে',
    },
    {
      type: 'text',
      id: 'checkout_button',
      label: 'Checkout button text',
      default: 'চেকআউটে যান',
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
      id: 'background_color',
      label: 'Background color',
      default: '#f9fafb',
    },
    {
      type: 'range',
      id: 'padding',
      min: 12,
      max: 48,
      step: 4,
      default: 24,
      unit: 'px',
      label: 'Padding',
    },
  ],

  presets: [
    {
      name: 'Cart Summary',
      category: 'Cart',
      settings: {
        heading: 'অর্ডার সামারি',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface CartSummarySettings {
  heading: string;
  show_coupon_input: boolean;
  coupon_placeholder: string;
  apply_button: string;
  show_shipping_estimate: boolean;
  shipping_text: string;
  checkout_button: string;
  show_payment_icons: boolean;
  show_secure_badge: boolean;
  background_color: string;
  padding: number;
}

// Demo cart data for preview
const DEMO_CART: CartData = {
  items: [
    {
      id: '1',
      productId: 1,
      title: 'Product 1',
      quantity: 2,
      price: 399900,
    },
    {
      id: '2',
      productId: 2,
      title: 'Product 2',
      quantity: 1,
      price: 499900,
    },
  ],
  itemCount: 3,
  subtotal: 1299700,
  total: 1299700,
  discounts: [],
};

export default function CartSummary({ section, context, settings }: SectionComponentProps) {
  const {
    heading = 'অর্ডার সামারি',
    show_coupon_input = true,
    coupon_placeholder = 'কুপন কোড লিখুন',
    apply_button = 'প্রয়োগ করুন',
    show_shipping_estimate = true,
    shipping_text = 'ফ্রি ডেলিভারি ১০০০৳+ অর্ডারে',
    checkout_button = 'চেকআউটে যান',
    show_payment_icons = true,
    show_secure_badge = true,
    background_color = '#f9fafb',
    padding = 24,
  } = settings as unknown as CartSummarySettings;

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const fetcher = useFetcher();

  // Use context cart or demo cart
  const cart = context.cart || DEMO_CART;
  const isEmpty = cart.items.length === 0;

  // Theme colors
  const primaryColor = context.theme?.colors?.primary || '#6366f1';
  const textColor = context.theme?.colors?.text || '#111827';
  const mutedColor = context.theme?.colors?.textMuted || '#6b7280';
  const borderColor = context.theme?.colors?.border || '#e5e7eb';
  const successColor = context.theme?.colors?.success || '#22c55e';

  // Calculate values
  const shippingThreshold = 1000;
  const isFreeShipping = cart.subtotal >= shippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 60;
  const discountTotal = cart.discounts?.reduce((sum, d) => sum + d.applied, 0) || 0;
  const total = cart.subtotal + shippingCost - discountTotal;

  // Handle coupon submission
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    fetcher.submit(
      { action: 'apply-coupon', code: couponCode },
      { method: 'post', action: '/cart' }
    );
  };

  // Handle coupon removal
  const handleRemoveCoupon = (code: string) => {
    fetcher.submit({ action: 'remove-coupon', code }, { method: 'post', action: '/cart' });
  };

  if (isEmpty) {
    return null; // Don't show summary when cart is empty
  }

  return (
    <aside
      className="rounded-xl"
      style={{
        backgroundColor: background_color,
        padding: `${padding}px`,
      }}
      data-section-id={section.id}
      data-section-type="cart-summary"
    >
      <h2 className="text-xl font-bold mb-6" style={{ color: textColor }}>
        {heading}
      </h2>

      {/* Coupon Input */}
      {show_coupon_input && (
        <div className="mb-6">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: mutedColor }}
              />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={coupon_placeholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: borderColor, color: textColor }}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor, color: 'white' }}
              disabled={fetcher.state !== 'idle'}
            >
              {apply_button}
            </button>
          </form>
          {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
        </div>
      )}

      {/* Applied Discounts */}
      {cart.discounts && cart.discounts.length > 0 && (
        <div className="mb-6 space-y-2">
          {cart.discounts.map((discount) => (
            <div
              key={discount.code}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ backgroundColor: `${successColor}15` }}
            >
              <div className="flex items-center gap-2">
                <Tag size={14} style={{ color: successColor }} />
                <span className="text-sm font-medium" style={{ color: successColor }}>
                  {discount.code}
                </span>
                <span className="text-sm" style={{ color: mutedColor }}>
                  (-{formatPrice(discount.applied)})
                </span>
              </div>
              <button
                onClick={() => handleRemoveCoupon(discount.code)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={14} style={{ color: mutedColor }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Order Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span style={{ color: mutedColor }}>সাবটোটাল ({cart.itemCount} আইটেম)</span>
          <span className="font-medium" style={{ color: textColor }}>
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between">
            <span style={{ color: successColor }}>ডিসকাউন্ট</span>
            <span className="font-medium" style={{ color: successColor }}>
              -{formatPrice(discountTotal)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span style={{ color: mutedColor }}>ডেলিভারি চার্জ</span>
          <span
            className="font-medium"
            style={{ color: isFreeShipping ? successColor : textColor }}
          >
            {isFreeShipping ? 'ফ্রি' : formatPrice(shippingCost)}
          </span>
        </div>

        <div className="border-t pt-3" style={{ borderColor: borderColor }}>
          <div className="flex justify-between">
            <span className="text-lg font-bold" style={{ color: textColor }}>
              মোট
            </span>
            <span className="text-lg font-bold" style={{ color: primaryColor }}>
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Estimate */}
      {show_shipping_estimate && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg mb-6"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <Truck size={18} style={{ color: primaryColor }} />
          <span className="text-sm" style={{ color: textColor }}>
            {isFreeShipping ? (
              shipping_text
            ) : (
              <>
                আরো {formatPrice(shippingThreshold - (cart.subtotal ?? 0))} অর্ডার করলে ফ্রি
                ডেলিভারি
              </>
            )}
          </span>
        </div>
      )}

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium text-lg text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        <CreditCard size={20} />
        {checkout_button}
      </Link>

      {/* Secure Badge */}
      {show_secure_badge && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <ShieldCheck size={16} style={{ color: successColor }} />
          <span className="text-sm" style={{ color: mutedColor }}>
            সিকিউর চেকআউট
          </span>
        </div>
      )}

      {/* Payment Icons */}
      {show_payment_icons && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-xs" style={{ color: mutedColor }}>
            পেমেন্ট মেথড:
          </span>
          <div className="flex items-center gap-2">
            {/* bKash */}
            <div className="w-10 h-6 bg-pink-500 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">bKash</span>
            </div>
            {/* Nagad */}
            <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">Nagad</span>
            </div>
            {/* Card */}
            <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">VISA</span>
            </div>
            {/* COD */}
            <div className="w-10 h-6 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">COD</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

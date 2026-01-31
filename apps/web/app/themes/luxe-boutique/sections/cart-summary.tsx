/**
 * Luxe Boutique - Cart Summary Section
 *
 * Shopify OS 2.0 Compatible Section
 * Elegant luxury cart summary with gold accents
 */

import { Link } from '@remix-run/react';
import { CreditCard, Truck, ShieldCheck, Tag } from 'lucide-react';
import { useState } from 'react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  background: '#faf9f7',
  surface: '#ffffff',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  border: '#e5e5e5',
};

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-summary',
  name: 'Cart Summary (Luxe)',
  tag: 'aside',
  class: 'luxe-cart-summary',

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
      id: 'show_coupon',
      label: 'Show coupon input',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_shipping_note',
      label: 'Show shipping note',
      default: true,
    },
    {
      type: 'text',
      id: 'shipping_note',
      label: 'Shipping note',
      default: 'Complimentary shipping on orders over $500',
    },
    {
      type: 'text',
      id: 'checkout_button',
      label: 'Checkout button text',
      default: 'Proceed to Checkout',
    },
    {
      type: 'checkbox',
      id: 'show_secure',
      label: 'Show secure checkout badge',
      default: true,
    },
  ],

  presets: [
    {
      name: 'Luxe Cart Summary',
      category: 'Cart',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LuxeCartSummary({ context, settings }: SectionComponentProps) {
  const {
    heading = 'Order Summary',
    show_coupon = true,
    show_shipping_note = true,
    shipping_note = 'Complimentary shipping on orders over $500',
    checkout_button = 'Proceed to Checkout',
    show_secure = true,
  } = settings as Record<string, unknown>;

  const cart = context.cart;
  const items = cart?.items || [];
  const subtotal = cart?.total || 0;

  const [couponCode, setCouponCode] = useState('');

  // Calculate shipping (free over 50000 cents = $500)
  const shippingThreshold = 50000;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 1500; // $15 shipping
  const total = subtotal + shippingCost;

  // Don't render if cart is empty
  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className="border p-6 lg:p-8"
      style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
    >
      {/* Heading */}
      <h2
        className="text-xl font-medium mb-6 tracking-wide"
        style={{ color: THEME.primary, fontFamily: "'Playfair Display', serif" }}
      >
        {String(heading)}
      </h2>

      {/* Coupon */}
      {show_coupon && (
        <div className="mb-6 pb-6 border-b" style={{ borderColor: THEME.border }}>
          <label className="text-sm mb-3 block" style={{ color: THEME.muted }}>
            Promo Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-4 py-3 border text-sm"
              style={{ borderColor: THEME.border }}
            />
            <button
              className="px-6 py-3 text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: THEME.primary, color: 'white' }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm" style={{ color: THEME.muted }}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, context.store?.currency)}</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: THEME.muted }}>
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4" style={{ color: THEME.accent }} />
            Shipping
          </span>
          <span>
            {shippingCost === 0
              ? 'Complimentary'
              : formatPrice(shippingCost, context.store?.currency)}
          </span>
        </div>
        {show_shipping_note && shippingCost > 0 && (
          <p className="text-xs" style={{ color: THEME.accent }}>
            {String(shipping_note)}
          </p>
        )}
        <div
          className="flex justify-between pt-4 border-t text-lg font-medium"
          style={{ borderColor: THEME.border, color: THEME.primary }}
        >
          <span>Total</span>
          <span style={{ color: THEME.accent }}>{formatPrice(total, context.store?.currency)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className="flex items-center justify-center gap-2 w-full py-4 text-white font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: THEME.accent }}
      >
        <CreditCard className="w-5 h-5" />
        {String(checkout_button)}
      </Link>

      {/* Secure Badge */}
      {show_secure && (
        <div
          className="flex items-center justify-center gap-2 mt-4 text-xs"
          style={{ color: THEME.muted }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: THEME.accent }} />
          Secure checkout guaranteed
        </div>
      )}
    </aside>
  );
}

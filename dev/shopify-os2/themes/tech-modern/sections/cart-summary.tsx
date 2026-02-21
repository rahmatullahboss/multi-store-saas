/**
 * Tech Modern - Cart Summary Section
 *
 * Shopify OS 2.0 Compatible Section
 * Modern tech cart summary with blue accents
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
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
};

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-summary',
  name: 'Cart Summary (Tech)',
  tag: 'aside',
  class: 'tech-cart-summary',

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
      default: 'Free shipping on orders over ৳3,000',
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
      name: 'Tech Cart Summary',
      category: 'Cart',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TechCartSummary({ context, settings }: SectionComponentProps) {
  const heading = String(settings.heading || 'Order Summary');
  const show_coupon = Boolean(settings.show_coupon ?? true);
  const show_shipping_note = Boolean(settings.show_shipping_note ?? true);
  const shipping_note = String(settings.shipping_note || 'Free shipping on orders over ৳3,000');
  const checkout_button = String(settings.checkout_button || 'Proceed to Checkout');
  const show_secure = Boolean(settings.show_secure ?? true);

  const cart = context.cart;
  const items = cart?.items || [];
  const subtotal = cart?.total || 0;

  const [couponCode, setCouponCode] = useState('');

  // Calculate shipping (free over 3000)
  const shippingThreshold = 3000;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 100;
  const total = subtotal + shippingCost;

  // Don't show if cart is empty
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="p-6 md:p-8 rounded-xl border bg-white" style={{ borderColor: THEME.border }}>
      {/* Heading */}
      <h2 className="text-2xl font-bold mb-6" style={{ color: THEME.primary }}>
        {heading}
      </h2>

      {/* Coupon Input */}
      {show_coupon && (
        <div className="mb-6 pb-6 border-b" style={{ borderColor: THEME.border }}>
          <label className="flex items-center gap-2 text-sm mb-3" style={{ color: THEME.muted }}>
            <Tag className="w-4 h-4" style={{ color: THEME.accent }} />
            Have a promo code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-4 py-3 rounded-lg border text-sm"
              style={{ borderColor: THEME.border }}
            />
            <button
              className="px-6 py-3 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: THEME.accent }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between" style={{ color: THEME.muted }}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, context.store?.currency)}</span>
        </div>
        <div className="flex justify-between" style={{ color: THEME.muted }}>
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4" style={{ color: THEME.accent }} />
            Shipping
          </span>
          <span>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost, context.store?.currency)}
          </span>
        </div>
        {show_shipping_note && shippingCost > 0 && (
          <p className="text-sm" style={{ color: THEME.accent }}>
            {shipping_note}
          </p>
        )}
        <div
          className="flex justify-between pt-4 border-t text-lg font-bold"
          style={{ borderColor: THEME.border, color: THEME.primary }}
        >
          <span>Total</span>
          <span style={{ color: THEME.accent }}>{formatPrice(total, context.store?.currency)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: THEME.accent }}
      >
        <CreditCard className="w-5 h-5" />
        {checkout_button}
      </Link>

      {/* Secure Badge */}
      {show_secure && (
        <div
          className="flex items-center justify-center gap-2 mt-4 text-sm"
          style={{ color: THEME.muted }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: THEME.accent }} />
          Secure checkout guaranteed
        </div>
      )}
    </aside>
  );
}

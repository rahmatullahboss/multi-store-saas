/**
 * Nova Lux - Cart Summary Section
 *
 * Luxury cart summary with elegant checkout styling
 */

import { Link } from '@remix-run/react';
import { CreditCard, Truck, ShieldCheck, Tag } from 'lucide-react';
import { useState } from 'react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';
import { NOVALUX_THEME } from '../index';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-summary',
  name: 'Cart Summary (Nova Lux)',
  tag: 'aside',
  class: 'cart-summary-nova',

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
      type: 'checkbox',
      id: 'show_shipping_estimate',
      label: 'Show shipping estimate',
      default: true,
    },
    {
      type: 'text',
      id: 'shipping_text',
      label: 'Shipping text',
      default: 'Free shipping on orders over ৳5,000',
    },
    {
      type: 'text',
      id: 'checkout_button',
      label: 'Checkout button text',
      default: 'Proceed to Checkout',
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
      default: '#ffffff',
    },
  ],

  presets: [
    {
      name: 'Nova Lux Cart Summary',
      category: 'Cart',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

interface CartItem {
  id: string;
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

interface CartData {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export default function NovaLuxCartSummary({
  context,
  settings: rawSettings,
}: SectionComponentProps) {
  const settings = rawSettings as unknown as {
    heading?: string;
    show_coupon_input?: boolean;
    show_shipping_estimate?: boolean;
    shipping_text?: string;
    checkout_button?: string;
    show_secure_badge?: boolean;
    background_color?: string;
  };

  const theme = NOVALUX_THEME.config;
  const cart = context.cart as CartData | undefined;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  const THEME_COLORS = {
    primary: theme.colors?.primary || '#1C1C1E',
    accent: theme.colors?.accent || '#C4A35A',
    text: theme.colors?.text || '#2C2C2C',
    background: settings.background_color || '#ffffff',
    fontHeading: theme.typography?.fontFamilyHeading || "'Cormorant Garamond', Georgia, serif",
  };

  const [couponCode, setCouponCode] = useState('');

  // Calculate shipping (free over 5000)
  const shippingThreshold = 5000;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 100;
  const total = subtotal + shippingCost;

  // Don't show if cart is empty
  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className="p-6 md:p-8 border"
      style={{ backgroundColor: THEME_COLORS.background, borderColor: '#e5e5e5' }}
    >
      {/* Heading */}
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ fontFamily: THEME_COLORS.fontHeading, color: THEME_COLORS.primary }}
      >
        {settings.heading || 'Order Summary'}
      </h2>

      {/* Coupon Input */}
      {settings.show_coupon_input !== false && (
        <div className="mb-6 pb-6 border-b" style={{ borderColor: '#e5e5e5' }}>
          <label
            className="flex items-center gap-2 text-sm mb-3"
            style={{ color: THEME_COLORS.text }}
          >
            <Tag className="w-4 h-4" style={{ color: THEME_COLORS.accent }} />
            Have a coupon?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-3 border text-sm"
              style={{ borderColor: '#e5e5e5' }}
            />
            <button
              className="px-6 py-3 text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: THEME_COLORS.primary }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between" style={{ color: THEME_COLORS.text }}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, context.store?.currency)}</span>
        </div>
        <div className="flex justify-between" style={{ color: THEME_COLORS.text }}>
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4" style={{ color: THEME_COLORS.accent }} />
            Shipping
          </span>
          <span>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost, context.store?.currency)}
          </span>
        </div>
        {shippingCost > 0 && settings.show_shipping_estimate !== false && (
          <p className="text-sm" style={{ color: THEME_COLORS.accent }}>
            {settings.shipping_text ||
              `Free shipping on orders over ${formatPrice(shippingThreshold, context.store?.currency)}`}
          </p>
        )}
        <div
          className="flex justify-between pt-4 border-t text-lg font-semibold"
          style={{ borderColor: '#e5e5e5', color: THEME_COLORS.primary }}
        >
          <span>Total</span>
          <span style={{ color: THEME_COLORS.accent }}>
            {formatPrice(total, context.store?.currency)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className="flex items-center justify-center gap-2 w-full py-4 text-white font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: THEME_COLORS.accent }}
      >
        <CreditCard className="w-5 h-5" />
        {settings.checkout_button || 'Proceed to Checkout'}
      </Link>

      {/* Secure Badge */}
      {settings.show_secure_badge !== false && (
        <div
          className="flex items-center justify-center gap-2 mt-4 text-sm"
          style={{ color: THEME_COLORS.text }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: THEME_COLORS.accent }} />
          Secure checkout guaranteed
        </div>
      )}
    </aside>
  );
}

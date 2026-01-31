/**
 * Tech Modern - Cart Items Section
 *
 * Shopify OS 2.0 Compatible Section
 * Modern tech cart with clean design
 */

import { Link } from '@remix-run/react';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
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
  type: 'cart-items',
  name: 'Cart Items (Tech)',
  tag: 'section',
  class: 'tech-cart-items',

  enabled_on: {
    templates: ['cart'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Your Cart',
    },
    {
      type: 'checkbox',
      id: 'show_continue_shopping',
      label: 'Show continue shopping',
      default: true,
    },
    {
      type: 'text',
      id: 'empty_cart_heading',
      label: 'Empty cart heading',
      default: 'Your cart is empty',
    },
    {
      type: 'text',
      id: 'empty_cart_text',
      label: 'Empty cart text',
      default: 'Add some tech to your life',
    },
  ],

  presets: [
    {
      name: 'Tech Cart Items',
      category: 'Cart',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TechCartItems({ context, settings }: SectionComponentProps) {
  const heading = String(settings.heading ?? 'Your Cart');
  const show_continue_shopping = Boolean(settings.show_continue_shopping ?? true);
  const empty_cart_heading = String(settings.empty_cart_heading ?? 'Your cart is empty');
  const empty_cart_text = String(settings.empty_cart_text ?? 'Add some tech to your life');

  const cart = context.cart;
  const items = cart?.items || [];

  // Empty cart state
  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24" style={{ backgroundColor: THEME.background }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-6" style={{ color: THEME.accent }} />
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: THEME.primary }}>
            {String(empty_cart_heading)}
          </h2>
          <p className="text-lg mb-8" style={{ color: THEME.muted }}>
            {String(empty_cart_text)}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: THEME.accent }}
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12" style={{ backgroundColor: THEME.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: THEME.primary }}>
            {String(heading)} ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          {show_continue_shopping && (
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: THEME.muted }}
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 md:gap-6 p-4 md:p-6 rounded-xl bg-white border"
              style={{ borderColor: THEME.border }}
            >
              {/* Product Image */}
              <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {(item as { imageUrl?: string }).imageUrl ? (
                  <img
                    src={(item as { imageUrl?: string }).imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8" style={{ color: THEME.accent }} />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1" style={{ color: THEME.primary }}>
                  {item.title}
                </h3>
                <p className="text-lg font-bold" style={{ color: THEME.accent }}>
                  {formatPrice(item.price, context.store?.currency)}
                </p>

                {/* Quantity Controls - Desktop */}
                <div className="hidden md:flex items-center gap-3 mt-4">
                  <div
                    className="flex items-center rounded-lg border"
                    style={{ borderColor: THEME.border }}
                  >
                    <button
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                      style={{ color: THEME.text }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      className="px-4 py-2 min-w-[3rem] text-center"
                      style={{ color: THEME.primary }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                      style={{ color: THEME.text }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    className="p-2 hover:bg-red-50 transition-colors"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Quantity & Remove */}
              <div className="md:hidden flex flex-col items-end gap-2">
                <p className="text-lg font-bold" style={{ color: THEME.accent }}>
                  {formatPrice(item.price * item.quantity, context.store?.currency)}
                </p>
                <button className="p-2" style={{ color: '#ef4444' }}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Continue Shopping */}
        {show_continue_shopping && (
          <Link
            to="/"
            className="md:hidden flex items-center justify-center gap-2 mt-8 py-3 rounded-xl border"
            style={{ borderColor: THEME.border, color: THEME.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        )}
      </div>
    </section>
  );
}

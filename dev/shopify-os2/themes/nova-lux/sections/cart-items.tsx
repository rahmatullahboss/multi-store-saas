/**
 * Nova Lux - Cart Items Section
 *
 * Luxury cart items display with elegant styling
 */

import { Link, useFetcher } from '@remix-run/react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';
import { NOVALUX_THEME } from '../index';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-items',
  name: 'Cart Items (Nova Lux)',
  tag: 'section',
  class: 'cart-items-nova',

  enabled_on: {
    templates: ['cart'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Shopping Cart',
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
      default: 'Discover our exclusive collection',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#faf9f7',
    },
  ],

  presets: [
    {
      name: 'Nova Lux Cart Items',
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
  image?: string;
  variant?: string;
}

interface CartData {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

interface CartItemsSettings {
  heading?: string;
  show_continue_shopping?: boolean;
  empty_cart_heading?: string;
  empty_cart_text?: string;
  background_color?: string;
}

export default function NovaLuxCartItems({
  context,
  settings: rawSettings,
}: SectionComponentProps) {
  const settings = rawSettings as unknown as CartItemsSettings;
  const theme = NOVALUX_THEME.config;
  const cart = context.cart as CartData | undefined;
  const items = cart?.items || [];

  const THEME_COLORS = {
    primary: theme.colors?.primary || '#1C1C1E',
    accent: theme.colors?.accent || '#C4A35A',
    text: theme.colors?.text || '#2C2C2C',
    background: settings.background_color || '#faf9f7',
    fontHeading: theme.typography?.fontFamilyHeading || "'Cormorant Garamond', Georgia, serif",
  };

  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== 'idle';

  // Handlers
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemove(itemId);
      return;
    }
    fetcher.submit(
      { action: 'update', itemId, quantity: String(quantity) },
      { method: 'post', action: '/cart' }
    );
  };

  const handleRemove = (itemId: string) => {
    fetcher.submit({ action: 'remove', itemId }, { method: 'post', action: '/cart' });
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24" style={{ backgroundColor: THEME_COLORS.background }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6" style={{ color: THEME_COLORS.accent }} />
          <h2
            className="text-3xl md:text-4xl font-semibold mb-4"
            style={{ fontFamily: THEME_COLORS.fontHeading, color: THEME_COLORS.primary }}
          >
            {settings.empty_cart_heading || 'Your cart is empty'}
          </h2>
          <p className="text-lg mb-8" style={{ color: THEME_COLORS.text }}>
            {settings.empty_cart_text || 'Discover our exclusive collection'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 text-white transition-all hover:opacity-90"
            style={{ backgroundColor: THEME_COLORS.primary }}
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12" style={{ backgroundColor: THEME_COLORS.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl md:text-4xl font-semibold"
            style={{ fontFamily: THEME_COLORS.fontHeading, color: THEME_COLORS.primary }}
          >
            {settings.heading || 'Shopping Cart'} ({items.length}{' '}
            {items.length === 1 ? 'item' : 'items'})
          </h1>
          {settings.show_continue_shopping !== false && (
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: THEME_COLORS.text }}
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 md:gap-6 p-4 md:p-6 bg-white border"
              style={{ borderColor: '#e5e5e5' }}
            >
              {/* Product Image */}
              <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" style={{ color: THEME_COLORS.accent }} />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg font-medium mb-1"
                  style={{ fontFamily: THEME_COLORS.fontHeading, color: THEME_COLORS.primary }}
                >
                  {item.title}
                </h3>
                {item.variant && (
                  <p className="text-sm mb-2" style={{ color: THEME_COLORS.text }}>
                    {item.variant}
                  </p>
                )}
                <p className="text-lg font-semibold" style={{ color: THEME_COLORS.accent }}>
                  {formatPrice(item.price, context.store?.currency)}
                </p>

                {/* Quantity Controls - Desktop */}
                <div
                  className={`hidden md:flex items-center gap-3 mt-4 ${isUpdating ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center border" style={{ borderColor: '#e5e5e5' }}>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                      style={{ color: THEME_COLORS.text }}
                      disabled={isUpdating}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      className="px-4 py-2 min-w-[3rem] text-center"
                      style={{ color: THEME_COLORS.primary }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                      style={{ color: THEME_COLORS.text }}
                      disabled={isUpdating}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 hover:bg-red-50 transition-colors"
                    style={{ color: '#ef4444' }}
                    disabled={isUpdating}
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Quantity & Remove */}
              <div
                className={`md:hidden flex flex-col items-end gap-2 ${isUpdating ? 'opacity-50' : ''}`}
              >
                <p className="text-lg font-semibold" style={{ color: THEME_COLORS.accent }}>
                  {formatPrice(item.price * item.quantity, context.store?.currency)}
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 hover:bg-red-50 transition-colors"
                  style={{ color: '#ef4444' }}
                  disabled={isUpdating}
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Continue Shopping */}
        {settings.show_continue_shopping !== false && (
          <Link
            to="/"
            className="md:hidden flex items-center justify-center gap-2 mt-8 py-3 border"
            style={{ borderColor: '#e5e5e5', color: THEME_COLORS.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        )}
      </div>
    </section>
  );
}

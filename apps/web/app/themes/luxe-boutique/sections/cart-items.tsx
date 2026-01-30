/**
 * Luxe Boutique - Cart Items Section
 *
 * Shopify OS 2.0 Compatible Section
 * Elegant luxury cart items display:
 * - Black (#1a1a1a) and gold (#c9a961) color scheme
 * - Clean minimalist design
 * - Portrait product images
 * - Refined typography
 */

import { useFetcher } from '@remix-run/react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { SectionSchema, SectionComponentProps, CartItem } from '~/lib/theme-engine/types';
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
  type: 'cart-items',
  name: 'Cart Items (Luxe)',
  tag: 'section',
  class: 'luxe-cart-items',

  enabled_on: {
    templates: ['cart'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Shopping Bag',
    },
    {
      type: 'checkbox',
      id: 'show_continue_shopping',
      label: 'Show continue shopping link',
      default: true,
    },
    {
      type: 'text',
      id: 'continue_shopping_label',
      label: 'Continue shopping text',
      default: 'Continue Shopping',
    },
    {
      type: 'url',
      id: 'continue_shopping_link',
      label: 'Continue shopping link',
      default: '/collections/all',
    },
    {
      type: 'header',
      id: 'header_empty',
      label: 'Empty Cart',
    },
    {
      type: 'text',
      id: 'empty_cart_heading',
      label: 'Empty cart heading',
      default: 'Your Bag is Empty',
    },
    {
      type: 'text',
      id: 'empty_cart_text',
      label: 'Empty cart text',
      default: 'Discover our curated collection of luxury pieces',
    },
    {
      type: 'text',
      id: 'empty_cart_button',
      label: 'Empty cart button',
      default: 'Explore Collection',
    },
  ],

  presets: [
    {
      name: 'Luxe Cart Items',
      category: 'Cart',
      settings: {
        heading: 'Shopping Bag',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

interface LuxeCartItemsSettings {
  heading: string;
  show_continue_shopping: boolean;
  continue_shopping_label: string;
  continue_shopping_link: string;
  empty_cart_heading: string;
  empty_cart_text: string;
  empty_cart_button: string;
}

// Demo cart items
const DEMO_CART: CartItem[] = [
  {
    id: '1',
    productId: 101,
    title: 'Silk Evening Gown',
    price: 2499900,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200&h=267&fit=crop',
    variantTitle: 'Size: M',
  },
  {
    id: '2',
    productId: 102,
    title: 'Pearl Drop Earrings',
    price: 499900,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=267&fit=crop',
  },
];

export default function LuxeCartItems({ section, context, settings }: SectionComponentProps) {
  const {
    heading = 'Shopping Bag',
    show_continue_shopping = true,
    continue_shopping_label = 'Continue Shopping',
    continue_shopping_link = '/collections/all',
    empty_cart_heading = 'Your Bag is Empty',
    empty_cart_text = 'Discover our curated collection of luxury pieces',
    empty_cart_button = 'Explore Collection',
  } = settings as unknown as LuxeCartItemsSettings;

  const cartItems = context.cart?.items || DEMO_CART;
  const currency = context.store?.currency || 'BDT';
  const fetcher = useFetcher();

  const updateQuantity = (itemId: string, newQuantity: number) => {
    fetcher.submit(
      { action: 'update', itemId: itemId, quantity: String(newQuantity) },
      { method: 'post', action: '/cart' }
    );
  };

  const removeItem = (itemId: string) => {
    fetcher.submit({ action: 'remove', itemId: itemId }, { method: 'post', action: '/cart' });
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: THEME.background }}
        data-section-id={section.id}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag
              size={48}
              strokeWidth={1}
              style={{ color: THEME.muted }}
              className="mx-auto mb-6"
            />
            <h2
              className="text-2xl md:text-3xl mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: THEME.primary,
              }}
            >
              {empty_cart_heading}
            </h2>
            <p className="text-sm mb-8" style={{ color: THEME.muted }}>
              {empty_cart_text}
            </p>
            <a
              href={continue_shopping_link}
              className="inline-block px-8 py-4 text-sm font-medium tracking-wider uppercase transition-colors"
              style={{ backgroundColor: THEME.primary, color: THEME.surface }}
            >
              {empty_cart_button}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-8 md:py-12"
      style={{ backgroundColor: THEME.background }}
      data-section-id={section.id}
      data-section-type="luxe-cart-items"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl md:text-3xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: THEME.primary,
            }}
          >
            {heading}
          </h1>
          {show_continue_shopping && (
            <a
              href={continue_shopping_link}
              className="text-sm tracking-wider hover:underline"
              style={{ color: THEME.muted }}
            >
              {continue_shopping_label}
            </a>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-0">
          {cartItems.map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 md:gap-6 py-6"
              style={{
                borderTop: index === 0 ? `1px solid ${THEME.border}` : 'none',
                borderBottom: `1px solid ${THEME.border}`,
              }}
            >
              {/* Image */}
              <a
                href={`/products/${item.productId}`}
                className="flex-shrink-0 w-24 md:w-32 aspect-[3/4] overflow-hidden"
                style={{ backgroundColor: THEME.surface }}
              >
                <img
                  src={item.image || '/placeholder-product.svg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </a>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex-1">
                  <a
                    href={`/products/${item.productId}`}
                    className="block text-sm md:text-base font-medium mb-1 hover:underline"
                    style={{ color: THEME.primary }}
                  >
                    {item.title}
                  </a>
                  {item.variantTitle && (
                    <p className="text-xs mb-2" style={{ color: THEME.muted }}>
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="text-sm font-medium" style={{ color: THEME.primary }}>
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Quantity & Remove */}
                <div className="flex items-center justify-between mt-4">
                  <div
                    className="flex items-center"
                    style={{ border: `1px solid ${THEME.border}` }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-gray-50 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-4 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:text-red-500 transition-colors"
                    style={{ color: THEME.muted }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Line Total (Desktop) */}
              <div className="hidden md:block text-right min-w-[100px]">
                <span className="text-sm font-medium" style={{ color: THEME.primary }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

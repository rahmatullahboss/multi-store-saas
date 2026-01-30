/**
 * Daraz Cart Items Section
 *
 * Shopify OS 2.0 Compatible Section
 * Cart items display with Daraz-style design:
 * - Orange (#F85606) accent color
 * - Clean white card design
 * - Quantity controls
 * - Product thumbnails
 */

import { Link, useFetcher } from '@remix-run/react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import type { SectionSchema, SectionComponentProps, CartItem } from '~/lib/theme-engine/types';
import { formatPrice, calculateDiscountPercentage } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-items',
  name: 'Cart Items (Daraz)',
  tag: 'section',
  class: 'daraz-cart-items',

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
      label: 'Show continue shopping link',
      default: true,
    },
    {
      type: 'text',
      id: 'continue_shopping_label',
      label: 'Continue shopping label',
      default: 'Continue Shopping',
    },
    {
      type: 'url',
      id: 'continue_shopping_link',
      label: 'Continue shopping link',
    },
    {
      type: 'text',
      id: 'empty_cart_heading',
      label: 'Empty cart heading',
      default: 'Your Cart is Empty',
    },
    {
      type: 'text',
      id: 'empty_cart_text',
      label: 'Empty cart text',
      default: 'Browse products to start shopping',
    },
    {
      type: 'text',
      id: 'empty_cart_button',
      label: 'Empty cart button',
      default: 'Start Shopping',
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
      name: 'Daraz Cart Items',
      category: 'Cart',
      settings: {
        heading: 'Shopping Cart',
        primary_color: '#F85606',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface DarazCartItemsSettings {
  heading: string;
  show_continue_shopping: boolean;
  continue_shopping_label: string;
  continue_shopping_link?: string;
  empty_cart_heading: string;
  empty_cart_text: string;
  empty_cart_button: string;
  primary_color: string;
  price_color: string;
}

// Demo cart items for preview
const DEMO_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    productId: 1,
    title: 'Wireless Bluetooth Headphones',
    variantTitle: 'Black',
    quantity: 2,
    price: 399900,
    compareAtPrice: 599900,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    url: '/products/1',
  },
  {
    id: '2',
    productId: 2,
    title: 'Smartwatch Fitness Tracker',
    quantity: 1,
    price: 499900,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    url: '/products/2',
  },
];

export default function DarazCartItems({ section, context, settings }: SectionComponentProps) {
  const {
    heading = 'Shopping Cart',
    show_continue_shopping = true,
    continue_shopping_label = 'Continue Shopping',
    continue_shopping_link = '/products',
    empty_cart_heading = 'Your Cart is Empty',
    empty_cart_text = 'Browse products to start shopping',
    empty_cart_button = 'Start Shopping',
    primary_color = '#F85606',
    price_color = '#F36D00',
  } = settings as unknown as DarazCartItemsSettings;

  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== 'idle';

  // Use context cart or demo items
  const cartItems = context.cart?.items || DEMO_CART_ITEMS;
  const isEmpty = cartItems.length === 0;

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

  if (isEmpty) {
    return (
      <section
        className="bg-white rounded-lg shadow-sm p-8 mb-6"
        data-section-id={section.id}
        data-section-type="daraz-cart-items"
      >
        <div className="text-center py-12">
          <ShoppingBag size={64} className="mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-medium mb-2 text-gray-800">{empty_cart_heading}</h2>
          <p className="mb-6 text-gray-500">{empty_cart_text}</p>
          <Link
            to={continue_shopping_link || '/products'}
            className="inline-flex items-center gap-2 px-8 py-3 rounded font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary_color }}
          >
            <ShoppingBag size={20} />
            {empty_cart_button}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6"
      data-section-id={section.id}
      data-section-type="daraz-cart-items"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-xl font-medium text-gray-800">
          {heading}
          <span className="ml-2 text-sm font-normal text-gray-500">({cartItems.length} items)</span>
        </h1>
        {show_continue_shopping && (
          <Link
            to={continue_shopping_link || '/products'}
            className="hidden md:flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: primary_color }}
          >
            <ArrowLeft size={16} />
            {continue_shopping_label}
          </Link>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => {
          const discount = calculateDiscountPercentage(item.price, item.compareAtPrice);

          return (
            <div
              key={item.id}
              className={`flex gap-4 py-4 border-b border-gray-100 ${isUpdating ? 'opacity-50' : ''}`}
            >
              {/* Image */}
              <Link
                to={item.url || `/products/${item.productId}`}
                className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded overflow-hidden bg-gray-100"
              >
                <img
                  src={item.image || '/placeholder-product.svg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div className="flex-1">
                    <Link
                      to={item.url || `/products/${item.productId}`}
                      className="font-medium text-sm md:text-base hover:underline line-clamp-2 text-gray-800"
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle && (
                      <p className="text-xs text-gray-500 mt-1">{item.variantTitle}</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Price & Quantity */}
                <div className="flex items-center justify-between mt-3">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm md:text-base" style={{ color: price_color }}>
                      {formatPrice(item.price)}
                    </span>
                    {item.compareAtPrice && (
                      <>
                        <span className="text-xs line-through text-gray-400">
                          {formatPrice(item.compareAtPrice)}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded text-white font-medium"
                          style={{ backgroundColor: primary_color }}
                        >
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center rounded border border-gray-300">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1.5 hover:bg-gray-100 transition-colors"
                      disabled={isUpdating}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 transition-colors"
                      disabled={isUpdating}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right mt-2">
                  <span className="text-xs text-gray-500">Total: </span>
                  <span className="font-bold text-gray-800">
                    {formatPrice((item.price ?? 0) * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Continue Shopping */}
      {show_continue_shopping && (
        <div className="mt-6 md:hidden">
          <Link
            to={continue_shopping_link || '/products'}
            className="flex items-center justify-center gap-2 text-sm font-medium"
            style={{ color: primary_color }}
          >
            <ArrowLeft size={16} />
            {continue_shopping_label}
          </Link>
        </div>
      )}
    </section>
  );
}

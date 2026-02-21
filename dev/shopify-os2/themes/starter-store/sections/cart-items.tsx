/**
 * Cart Items Section
 *
 * Shopify OS 2.0 Compatible Section
 * Displays cart items with quantity controls and remove functionality.
 */

import { Link, useFetcher } from '@remix-run/react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  CartItem,
  ThemeConfig,
} from '~/lib/theme-engine/types';
import { formatPrice, calculateDiscountPercentage } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'cart-items',
  name: 'Cart Items',
  tag: 'section',
  class: 'cart-items',

  enabled_on: {
    templates: ['cart'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'আপনার কার্ট',
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
      default: 'শপিং চালিয়ে যান',
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
      default: 'আপনার কার্ট খালি',
    },
    {
      type: 'text',
      id: 'empty_cart_text',
      label: 'Empty cart text',
      default: 'শপিং শুরু করতে প্রোডাক্ট ব্রাউজ করুন',
    },
    {
      type: 'text',
      id: 'empty_cart_button',
      label: 'Empty cart button',
      default: 'শপিং শুরু করুন',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#ffffff',
    },
    {
      type: 'range',
      id: 'padding_top',
      min: 0,
      max: 100,
      step: 4,
      default: 48,
      unit: 'px',
      label: 'Padding top',
    },
    {
      type: 'range',
      id: 'padding_bottom',
      min: 0,
      max: 100,
      step: 4,
      default: 48,
      unit: 'px',
      label: 'Padding bottom',
    },
  ],

  presets: [
    {
      name: 'Cart Items',
      category: 'Cart',
      settings: {
        heading: 'আপনার কার্ট',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface CartItemsSettings {
  heading: string;
  show_continue_shopping: boolean;
  continue_shopping_label: string;
  continue_shopping_link?: string;
  empty_cart_heading: string;
  empty_cart_text: string;
  empty_cart_button: string;
  background_color: string;
  padding_top: number;
  padding_bottom: number;
}

// Demo cart items for preview
const DEMO_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    productId: 1,
    title: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
    variantTitle: 'কালো',
    quantity: 2,
    price: 1299,
    compareAtPrice: 1999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    url: '/products/1',
  },
  {
    id: '2',
    productId: 2,
    title: 'স্মার্টওয়াচ ফিটনেস ট্র্যাকার',
    quantity: 1,
    price: 1499,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    url: '/products/2',
  },
];

// Cart Item Row Component
function CartItemRow({
  item,
  theme,
  currency,
  onUpdateQuantity,
  onRemove,
  isUpdating,
}: {
  item: CartItem;
  theme?: ThemeConfig;
  currency?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  isUpdating: boolean;
}) {
  const primaryColor = theme?.colors?.primary || '#6366f1';
  const textColor = theme?.colors?.text || '#111827';
  const mutedColor = theme?.colors?.textMuted || '#6b7280';
  const borderColor = theme?.colors?.border || '#e5e7eb';

  const discount = calculateDiscountPercentage(item.price, item.compareAtPrice);

  return (
    <div
      className={`flex gap-4 py-6 border-b ${isUpdating ? 'opacity-50' : ''}`}
      style={{ borderColor: borderColor }}
    >
      {/* Image */}
      <Link
        to={item.url || `/products/${item.productId}`}
        className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100"
      >
        <img
          src={item.image || '/placeholder-product.svg'}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              to={item.url || `/products/${item.productId}`}
              className="font-medium hover:underline line-clamp-2"
              style={{ color: textColor }}
            >
              {item.title}
            </Link>
            {item.variantTitle && (
              <p className="text-sm mt-1" style={{ color: mutedColor }}>
                {item.variantTitle}
              </p>
            )}
          </div>

          {/* Remove Button - Desktop */}
          <button
            onClick={() => onRemove(item.id)}
            className="hidden md:block p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold" style={{ color: primaryColor }}>
            {formatPrice(item.price, currency)}
          </span>
          {item.compareAtPrice && (
            <>
              <span className="text-sm line-through" style={{ color: mutedColor }}>
                {formatPrice(item.compareAtPrice, currency)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                -{discount}%
              </span>
            </>
          )}
        </div>

        {/* Quantity & Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center rounded-lg border" style={{ borderColor: borderColor }}>
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
              style={{ color: textColor }}
              disabled={isUpdating}
            >
              <Minus size={16} />
            </button>
            <span
              className="px-4 py-1 min-w-[40px] text-center text-sm font-medium"
              style={{ color: textColor }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
              style={{ color: textColor }}
              disabled={isUpdating}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Line Total */}
          <div className="text-right">
            <p className="text-sm" style={{ color: mutedColor }}>
              মোট
            </p>
            <p className="font-bold" style={{ color: textColor }}>
              {formatPrice((item.price ?? 0) * item.quantity, currency)}
            </p>
          </div>

          {/* Remove Button - Mobile */}
          <button
            onClick={() => onRemove(item.id)}
            className="md:hidden p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty Cart Component
function EmptyCart({
  heading,
  text,
  buttonLabel,
  buttonLink,
  theme,
}: {
  heading: string;
  text: string;
  buttonLabel: string;
  buttonLink: string;
  theme?: ThemeConfig;
}) {
  const primaryColor = theme?.colors?.primary || '#6366f1';
  const textColor = theme?.colors?.text || '#111827';
  const mutedColor = theme?.colors?.textMuted || '#6b7280';

  return (
    <div className="text-center py-16">
      <ShoppingBag size={64} className="mx-auto mb-6 opacity-30" style={{ color: mutedColor }} />
      <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
        {heading}
      </h2>
      <p className="mb-8" style={{ color: mutedColor }}>
        {text}
      </p>
      <Link
        to={buttonLink}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        <ShoppingBag size={20} />
        {buttonLabel}
      </Link>
    </div>
  );
}

export default function CartItems({ section, context, settings }: SectionComponentProps) {
  const {
    heading = 'আপনার কার্ট',
    show_continue_shopping = true,
    continue_shopping_label = 'শপিং চালিয়ে যান',
    continue_shopping_link = '/products',
    empty_cart_heading = 'আপনার কার্ট খালি',
    empty_cart_text = 'শপিং শুরু করতে প্রোডাক্ট ব্রাউজ করুন',
    empty_cart_button = 'শপিং শুরু করুন',
    background_color = '#ffffff',
    padding_top = 48,
    padding_bottom = 48,
  } = settings as unknown as CartItemsSettings;

  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== 'idle';

  // Use context cart or demo items
  const cartItems = context.cart?.items || DEMO_CART_ITEMS;
  const isEmpty = cartItems.length === 0;

  // Theme colors
  const textColor = context.theme?.colors?.text || '#111827';

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

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="cart-items"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: textColor }}>
            {heading}
            {!isEmpty && (
              <span className="ml-2 text-lg font-normal opacity-60">
                ({cartItems.length} আইটেম)
              </span>
            )}
          </h1>
          {show_continue_shopping && !isEmpty && (
            <Link
              to={continue_shopping_link || '/products'}
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: context.theme?.colors?.primary || '#6366f1' }}
            >
              <ArrowLeft size={16} />
              {continue_shopping_label}
            </Link>
          )}
        </div>

        {/* Cart Content */}
        {isEmpty ? (
          <EmptyCart
            heading={empty_cart_heading}
            text={empty_cart_text}
            buttonLabel={empty_cart_button}
            buttonLink={continue_shopping_link || '/products'}
            theme={context.theme}
          />
        ) : (
          <div className="space-y-0">
            {cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                theme={context.theme}
                currency={context.store?.currency}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}

        {/* Mobile Continue Shopping */}
        {show_continue_shopping && !isEmpty && (
          <div className="mt-6 md:hidden">
            <Link
              to={continue_shopping_link || '/products'}
              className="flex items-center justify-center gap-2 text-sm font-medium"
              style={{ color: context.theme?.colors?.primary || '#6366f1' }}
            >
              <ArrowLeft size={16} />
              {continue_shopping_label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

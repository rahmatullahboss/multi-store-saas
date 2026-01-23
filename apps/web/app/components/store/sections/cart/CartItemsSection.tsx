/**
 * Cart Items Section
 * 
 * Displays items in the shopping cart with quantity controls.
 */

import { Link } from '@remix-run/react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import type { CartContext } from '~/lib/template-resolver.server';

interface CartItemsSectionProps {
  sectionId: string;
  props: {
    heading?: string;
    continueShoppingText?: string;
    emptyText?: string;
  };
  context: CartContext;
}

interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export default function CartItemsSection({ sectionId, props, context }: CartItemsSectionProps) {
  const {
    heading = 'Your Cart',
    continueShoppingText = 'Continue Shopping',
    emptyText = 'Your cart is empty',
  } = props;

  const cart = context.cart;
  const items = (cart.items as CartItem[]) || [];
  const themeColors = context.theme;
  const currency = context.currency || 'BDT';

  const formatPrice = (priceInCents: number) => {
    // Values are now stored as cents, divide by 100 for display
    const displayPrice = priceInCents / 100;
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(displayPrice);
  };

  if (items.length === 0) {
    return (
      <section id={sectionId} className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: themeColors.textColor }}
          >
            {emptyText}
          </h2>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: themeColors.accentColor, color: '#fff' }}
          >
            {continueShoppingText}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: themeColors.textColor }}
          >
            {heading} ({items.length})
          </h2>
          <Link
            to="/products"
            className="text-sm font-medium hover:underline"
            style={{ color: themeColors.accentColor }}
          >
            {continueShoppingText}
          </Link>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              formatPrice={formatPrice}
              themeColors={themeColors}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CartItemRow({
  item,
  formatPrice,
  themeColors,
}: {
  item: CartItem;
  formatPrice: (price: number) => string;
  themeColors: any;
}) {
  const handleQuantityChange = (delta: number) => {
    // This would dispatch to cart context or update localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(
      (i: any) => i.productId === item.productId && i.variantId === item.variantId
    );
    
    if (index >= 0) {
      cart[index].quantity = Math.max(1, cart[index].quantity + delta);
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      window.location.reload(); // Simple reload for now
    }
  };

  const handleRemove = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const filtered = cart.filter(
      (i: any) => !(i.productId === item.productId && i.variantId === item.variantId)
    );
    localStorage.setItem('cart', JSON.stringify(filtered));
    window.dispatchEvent(new Event('cart-updated'));
    window.location.reload();
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
      {/* Image */}
      <Link 
        to={`/products/${item.productId}`}
        className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
      >
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link 
          to={`/products/${item.productId}`}
          className="font-medium hover:underline line-clamp-1"
          style={{ color: themeColors.textColor }}
        >
          {item.name}
        </Link>
        
        {item.variant && (
          <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
        )}

        <div className="mt-2 flex items-center gap-4">
          {/* Quantity */}
          <div className="inline-flex items-center border rounded">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-1.5 hover:bg-gray-100"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 min-w-[2rem] text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-1.5 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-600 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <span 
          className="font-bold"
          style={{ color: themeColors.accentColor }}
        >
          {formatPrice(item.price * item.quantity)}
        </span>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-400 mt-1">
            {formatPrice(item.price)} each
          </p>
        )}
      </div>
    </div>
  );
}

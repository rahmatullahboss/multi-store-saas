/**
 * DC Store Cart Page
 * 
 * Based on the original DC Store design with golden gradient theme.
 * Features clean cart layout with product cards and order summary.
 */

import { Link } from '@remix-run/react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { resolveDCStoreTheme } from '../theme';
import type { ThemeConfig } from '@db/types';
import { useTranslation } from 'react-i18next';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  quantity: number;
  slug?: string | null;
}

interface DCCartPageProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  isPreview?: boolean;
  config?: ThemeConfig | null;
}

export function DCCartPage({ items, onUpdateQuantity, onRemove, isPreview = false, config }: DCCartPageProps) {
  const theme = resolveDCStoreTheme(config);
  const { t } = useTranslation();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSavings = items.reduce((sum, item) => {
    const savings = item.compareAtPrice ? (item.compareAtPrice - item.price) * item.quantity : 0;
    return sum + savings;
  }, 0);

  // Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center py-16 px-4">
          <ShoppingCart className="w-24 h-24 mx-auto mb-6" style={{ color: theme.muted }} />
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text }}>
            Your cart is empty
          </h1>
          <p className="text-lg mb-8" style={{ color: theme.muted }}>
            Start shopping to add items to your cart
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 rounded-xl text-lg font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: theme.primary }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: theme.background }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8" style={{ color: theme.text }}>
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-2xl transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: theme.cardBg,
                  boxShadow: theme.shadowCard,
                }}
              >
                {/* Product Image */}
                <Link to={`/products/${item.slug || item.productId}`} className="flex-shrink-0">
                  <div 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden"
                    style={{ backgroundColor: theme.borderLight }}
                  >
                    <img
                      src={item.imageUrl || '/placeholder-product.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link 
                      to={`/products/${item.slug || item.productId}`}
                      className="font-semibold text-lg hover:underline"
                      style={{ color: theme.text }}
                    >
                      {item.name}
                    </Link>
                    {item.compareAtPrice && (
                      <p className="text-sm mt-1" style={{ color: theme.muted }}>
                        <span className="line-through">{formatPrice(item.compareAtPrice)}</span>
                        <span className="ml-2 font-bold" style={{ color: theme.accent }}>
                          Save {formatPrice((item.compareAtPrice - item.price) * item.quantity)}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                      >
                        <Minus className="w-4 h-4" style={{ color: theme.text }} />
                      </button>
                      <span className="w-12 text-center font-medium" style={{ color: theme.text }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                      >
                        <Plus className="w-4 h-4" style={{ color: theme.text }} />
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" style={{ color: theme.danger }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div 
              className="sticky top-24 p-6 rounded-2xl space-y-4"
              style={{ 
                backgroundColor: theme.cardBg,
                boxShadow: theme.shadowLg,
              }}
            >
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                Order Summary
              </h2>

              <div className="space-y-3 pt-4 border-t" style={{ borderColor: theme.border }}>
                <div className="flex justify-between text-base" style={{ color: theme.textSecondary }}>
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-base" style={{ color: theme.success }}>
                    <span>You Save</span>
                    <span className="font-semibold">-{formatPrice(totalSavings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-3 border-t" style={{ borderColor: theme.border, color: theme.text }}>
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full py-4 rounded-xl text-lg font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
                style={{ 
                  backgroundColor: theme.primary,
                  boxShadow: theme.shadowMd,
                }}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/products"
                className="block w-full py-3 rounded-xl text-center font-medium transition-colors"
                style={{ 
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="pt-4 border-t space-y-3" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary + '15' }}>
                    <ShoppingCart className="w-4 h-4" style={{ color: theme.primary }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.muted }}>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

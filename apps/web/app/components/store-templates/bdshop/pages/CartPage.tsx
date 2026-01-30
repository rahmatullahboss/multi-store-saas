/**
 * BDShop Template - Cart Page Component
 * 
 * Design based on BDShop.com:
 * - Two-column layout (items + delivery on left, summary on right)
 * - Navy blue "Proceed to Checkout" button with lock icon
 * - Red trash icons for item removal
 * - Interactive delivery method selection
 * - Clean, professional design with blue accents
 */

import { Link, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Store, 
  Lock,
  ShoppingBag,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  sku?: string;
}

interface CartPageProps {
  items: CartItem[];
  currency: string;
  onUpdateQuantity?: (itemId: number, quantity: number) => void;
  onRemoveItem?: (itemId: number) => void;
  onCheckout?: () => void;
}

// BDShop color palette
const BDSHOP_THEME = {
  primary: '#3B82F6',      // Medium Blue
  navy: '#0a2742',         // Dark Navy Blue
  background: '#f8fafc',   // Light gray-blue
  text: '#1e293b',         // Dark slate
  danger: '#ef4444',       // Red for delete
  border: '#e2e8f0',       // Light border
  success: '#22c55e',      // Green for stock
};

export function BDShopCartPage({ 
  items, 
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartPageProps) {
  const fetcher = useFetcher();
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  
  const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 80 : 0;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, newQuantity);
    } else {
      fetcher.submit(
        { intent: 'update', itemId: String(itemId), quantity: String(newQuantity) },
        { method: 'post', action: '/cart' }
      );
    }
  };

  const handleRemoveItem = (itemId: number) => {
    if (onRemoveItem) {
      onRemoveItem(itemId);
    } else {
      fetcher.submit(
        { intent: 'remove', itemId: String(itemId) },
        { method: 'post', action: '/cart' }
      );
    }
  };

  // Empty cart view
  if (items.length === 0) {
    return (
      <div 
        className="min-h-screen py-16 px-4"
        style={{ backgroundColor: BDSHOP_THEME.background }}
      >
        <div className="max-w-lg mx-auto text-center">
          <div 
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#e0e7ff' }}
          >
            <ShoppingBag className="w-12 h-12" style={{ color: BDSHOP_THEME.primary }} />
          </div>
          <h1 
            className="text-2xl font-bold mb-3"
            style={{ color: BDSHOP_THEME.navy }}
          >
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: BDSHOP_THEME.primary }}
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: BDSHOP_THEME.background }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: BDSHOP_THEME.navy }}
          >
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items & Delivery Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="px-6 py-4 border-b"
                style={{ borderColor: BDSHOP_THEME.border }}
              >
                <h2 className="font-semibold text-lg" style={{ color: BDSHOP_THEME.navy }}>
                  Cart Items
                </h2>
              </div>

              <div className="divide-y" style={{ borderColor: BDSHOP_THEME.border }}>
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-medium text-base mb-1 line-clamp-2"
                        style={{ color: BDSHOP_THEME.text }}
                      >
                        {item.title}
                      </h3>
                      {item.sku && (
                        <p className="text-sm text-gray-500 mb-2">
                          SKU: {item.sku}
                        </p>
                      )}
                      <p 
                        className="font-bold text-lg"
                        style={{ color: BDSHOP_THEME.primary }}
                      >
                        {currency}{(item.price || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Quantity */}
                      <div 
                        className="flex items-center border rounded-lg overflow-hidden"
                        style={{ borderColor: BDSHOP_THEME.border }}
                      >
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1 || fetcher.state !== 'idle'}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span 
                          className="w-12 h-10 flex items-center justify-center font-medium border-x"
                          style={{ borderColor: BDSHOP_THEME.border }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                          disabled={fetcher.state !== 'idle'}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        disabled={fetcher.state !== 'idle'}
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" style={{ color: BDSHOP_THEME.danger }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="px-6 py-4 border-b"
                style={{ borderColor: BDSHOP_THEME.border }}
              >
                <h2 className="font-semibold text-lg" style={{ color: BDSHOP_THEME.navy }}>
                  Delivery Options
                </h2>
              </div>

              <div className="p-6 grid sm:grid-cols-2 gap-4">
                {/* Home Delivery */}
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryMethod === 'delivery' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        deliveryMethod === 'delivery' ? 'bg-blue-500' : 'bg-gray-100'
                      }`}
                    >
                      <Truck className={`w-5 h-5 ${deliveryMethod === 'delivery' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: BDSHOP_THEME.navy }}>
                        Home Delivery
                      </p>
                      <p className="text-sm text-gray-500">
                        Delivery within 3-5 days
                      </p>
                      <p className="text-sm font-medium mt-1" style={{ color: BDSHOP_THEME.primary }}>
                        {currency}80
                      </p>
                    </div>
                  </div>
                </button>

                {/* Store Pickup */}
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryMethod === 'pickup' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        deliveryMethod === 'pickup' ? 'bg-blue-500' : 'bg-gray-100'
                      }`}
                    >
                      <Store className={`w-5 h-5 ${deliveryMethod === 'pickup' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: BDSHOP_THEME.navy }}>
                        Store Pickup
                      </p>
                      <p className="text-sm text-gray-500">
                        Ready within 24 hours
                      </p>
                      <p className="text-sm font-medium mt-1" style={{ color: BDSHOP_THEME.success }}>
                        Free
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm sticky top-4">
              <div 
                className="px-6 py-4 border-b"
                style={{ borderColor: BDSHOP_THEME.border }}
              >
                <h2 className="font-semibold text-lg" style={{ color: BDSHOP_THEME.navy }}>
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-medium">{currency}{(subtotal || 0).toLocaleString()}</span>
                </div>

                {/* Delivery */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {deliveryFee === 0 ? 'Free' : `${currency}${deliveryFee}`}
                  </span>
                </div>

                {/* Discount (placeholder) */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{currency}0</span>
                </div>

                {/* Divider */}
                <div 
                  className="border-t pt-4"
                  style={{ borderColor: BDSHOP_THEME.border }}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg" style={{ color: BDSHOP_THEME.navy }}>
                      Total
                    </span>
                    <span className="font-bold text-xl" style={{ color: BDSHOP_THEME.navy }}>
                      {currency}{(total || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Including all taxes
                  </p>
                </div>

                {/* Checkout Button */}
                {onCheckout ? (
                  <button
                    onClick={onCheckout}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white mt-6 transition-all hover:shadow-lg hover:opacity-90"
                    style={{ backgroundColor: BDSHOP_THEME.navy }}
                  >
                    <Lock className="w-5 h-5" />
                    Proceed to Checkout
                  </button>
                ) : (
                  <Link
                    to="/checkout"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white mt-6 transition-all hover:shadow-lg hover:opacity-90"
                    style={{ backgroundColor: BDSHOP_THEME.navy }}
                  >
                    <Lock className="w-5 h-5" />
                    Proceed to Checkout
                  </Link>
                )}

                {/* Continue Shopping */}
                <Link
                  to="/"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium border transition-all hover:bg-gray-50"
                  style={{ 
                    borderColor: BDSHOP_THEME.border,
                    color: BDSHOP_THEME.primary 
                  }}
                >
                  Continue Shopping
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout powered by SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BDShopCartPage;

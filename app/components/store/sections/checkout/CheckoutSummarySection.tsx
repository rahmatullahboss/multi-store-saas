/**
 * Checkout Summary Section
 * 
 * Order summary display during checkout.
 */

import { ShoppingBag } from 'lucide-react';
import type { CheckoutContext } from '~/lib/template-resolver.server';

interface CheckoutSummarySectionProps {
  sectionId: string;
  props: {
    showItems?: boolean;
    showShipping?: boolean;
    showDiscount?: boolean;
    showTotal?: boolean;
  };
  context: CheckoutContext;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export default function CheckoutSummarySection({ sectionId, props, context }: CheckoutSummarySectionProps) {
  const {
    showItems = true,
    showShipping = true,
    showTotal = true,
  } = props;

  const cart = context.cart;
  const items = (cart.items as CartItem[]) || [];
  const themeColors = context.theme;
  const currency = context.currency || 'BDT';

  const formatPrice = (priceInCents: number) => {
    const displayPrice = priceInCents / 100;
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(displayPrice);
  };

  const subtotal = cart.subtotal || items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0; // Would be calculated based on location
  const total = cart.total || subtotal + shipping;

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 
            className="text-lg font-bold mb-4"
            style={{ color: themeColors.textColor }}
          >
            Order Summary
          </h3>

          {/* Items */}
          {showItems && items.length > 0 && (
            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.variant && `${item.variant} · `}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            {showShipping && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-500">
                  {shipping > 0 ? formatPrice(shipping) : 'Calculated at next step'}
                </span>
              </div>
            )}
          </div>

          {showTotal && (
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold" style={{ color: themeColors.textColor }}>
                  Total
                </span>
                <span 
                  className="text-xl font-bold"
                  style={{ color: themeColors.accentColor }}
                >
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

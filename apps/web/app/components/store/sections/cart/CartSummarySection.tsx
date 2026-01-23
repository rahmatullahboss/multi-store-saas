/**
 * Cart Summary Section
 * 
 * Order summary with subtotal, shipping, and checkout button.
 */

import { Link } from '@remix-run/react';
import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import type { CartContext } from '~/lib/template-resolver.server';

interface CartSummarySectionProps {
  sectionId: string;
  props: {
    checkoutText?: string;
    trustText1?: string;
    trustText2?: string;
    trustText3?: string;
  };
  context: CartContext;
}

export default function CartSummarySection({ sectionId, props, context }: CartSummarySectionProps) {
  const {
    checkoutText = 'Proceed to Checkout',
    trustText1 = 'Secure checkout',
    trustText2 = 'Fast delivery',
    trustText3 = 'Easy returns',
  } = props;

  const cart = context.cart;
  const themeColors = context.theme;
  const currency = context.currency || 'BDT';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = cart.subtotal || 0;
  const shipping = 0; // Calculated at checkout
  const total = cart.total || subtotal;

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 md:max-w-md md:ml-auto">
          <h3 
            className="text-lg font-bold mb-4"
            style={{ color: themeColors.textColor }}
          >
            Order Summary
          </h3>

          {/* Line Items */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-500">Calculated at checkout</span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold" style={{ color: themeColors.textColor }}>
                Total
              </span>
              <span 
                className="text-2xl font-bold"
                style={{ color: themeColors.accentColor }}
              >
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            to="/checkout"
            className="mt-6 w-full flex items-center justify-center py-3 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: themeColors.accentColor }}
          >
            {checkoutText}
          </Link>

          {/* Trust Badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span>{trustText1}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-5 h-5 text-blue-500" />
              <span>{trustText2}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              <span>{trustText3}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

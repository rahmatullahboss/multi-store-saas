/**
 * Checkout Cancelled Page
 * 
 * Route: /checkout/cancelled
 * 
 * Displayed when user cancels payment
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Ban, ShoppingCart, ArrowLeft } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Payment Cancelled' }];
};

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Cancelled Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban className="w-12 h-12 text-gray-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          You cancelled the payment. Your order has not been processed.
        </p>

        {/* Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-600">
            Don't worry - no money has been charged. You can try again whenever you're ready.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/cart"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            Return to Cart
          </Link>
          
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

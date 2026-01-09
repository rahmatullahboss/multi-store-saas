/**
 * GhorerBazar Checkout Page Component
 * 
 * Checkout page styled to match ghorerbazar.com design.
 * Features:
 * - Clean checkout form layout
 * - COD-focused payment option
 * - Order summary sidebar
 * - Delivery information form
 * - Bengali language support
 */

import { Link } from '@remix-run/react';
import { useState } from 'react';
import { 
  ShoppingCart, 
  Truck, 
  CreditCard,
  MapPin,
  Phone,
  User,
  Mail,
  ChevronLeft,
  Check
} from 'lucide-react';
import { GhorerBazarPageWrapper, GHORER_BAZAR_THEME } from './GhorerBazarPageWrapper';
import type { SocialLinks } from '@db/types';

interface CartItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface GhorerBazarCheckoutPageProps {
  cartItems: CartItem[];
  storeName: string;
  storeId: number;
  logo?: string | null;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  shippingCost?: number;
  insideDhakaShipping?: number;
  outsideDhakaShipping?: number;
}

export function GhorerBazarCheckoutPage({
  cartItems,
  storeName,
  storeId,
  logo,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  shippingCost = 0,
  insideDhakaShipping = 60,
  outsideDhakaShipping = 120,
}: GhorerBazarCheckoutPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');

  const { primaryColor } = GHORER_BAZAR_THEME;

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('en-BD')}`;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = deliveryArea === 'inside' ? insideDhakaShipping : outsideDhakaShipping;
  const total = subtotal + shipping;

  return (
    <GhorerBazarPageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      showBreadcrumbBanner={true}
      pageTitle="Checkout"
      breadcrumb={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5" style={{ color: primaryColor }} />
                ডেলিভারি তথ্য
              </h2>

              <form className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    আপনার নাম *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="০১XXXXXXXXX"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ইমেইল (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Delivery Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ডেলিভারি এলাকা *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('inside')}
                      className={`p-4 rounded-lg border-2 text-center transition ${
                        deliveryArea === 'inside'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold">ঢাকার ভেতরে</p>
                      <p className="text-sm text-gray-500">{formatPrice(insideDhakaShipping)}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('outside')}
                      className={`p-4 rounded-lg border-2 text-center transition ${
                        deliveryArea === 'outside'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold">ঢাকার বাইরে</p>
                      <p className="text-sm text-gray-500">{formatPrice(outsideDhakaShipping)}</p>
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    সম্পূর্ণ ঠিকানা *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      required
                      rows={3}
                      placeholder="বাড়ি/ফ্ল্যাট নম্বর, রাস্তার নাম, এলাকা, শহর"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Order Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    অর্ডার নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5" style={{ color: primaryColor }} />
                পেমেন্ট মেথড
              </h2>

              <div className="space-y-4">
                {/* COD Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full p-4 rounded-lg border-2 text-left flex items-center gap-4 transition ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'cod' && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">ক্যাশ অন ডেলিভারি (COD)</p>
                    <p className="text-sm text-gray-500">হাতে পণ্য পেয়ে টাকা দিন</p>
                  </div>
                  <div 
                    className="px-3 py-1 rounded text-sm font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    জনপ্রিয়
                  </div>
                </button>

                {/* Online Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`w-full p-4 rounded-lg border-2 text-left flex items-center gap-4 transition ${
                    paymentMethod === 'online'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'online' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'online' && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">অনলাইন পেমেন্ট</p>
                    <p className="text-sm text-gray-500">বিকাশ, নগদ, কার্ড</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">অর্ডার সামারি</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-lg text-lg font-bold flex items-center justify-center gap-3 text-black transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>অর্ডার কনফার্ম করুন</span>
              </button>

              {/* Back to Cart */}
              <Link
                to="/cart"
                className="mt-4 w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GhorerBazarPageWrapper>
  );
}

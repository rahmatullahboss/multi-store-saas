/**
 * Shared Checkout Page Component (Theme-Aware)
 *
 * A universal checkout page that dynamically adapts to any template's theme.
 * Used as fallback for templates that don't have their own CheckoutPage.
 *
 * Features:
 * - Contact info form
 * - Shipping address form
 * - Payment method selection
 * - Order summary
 * - Place Order button
 * - Fully theme-aware
 */

import React, { useState } from 'react';
import { Link, useParams } from '@remix-run/react';
import { Shield, Truck, CreditCard, ChevronRight, Lock } from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';

interface SharedCheckoutPageProps {
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}

export default function SharedCheckoutPage({ theme, isPreview = false }: SharedCheckoutPageProps) {
  const params = useParams();
  const templateId = params.templateId;

  // Default theme if not provided
  const colors = theme || {
    primary: '#1a1a1a',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1a1a1a',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1a1a1a',
    footerText: '#ffffff',
  };

  const currencySymbol = '৳';

  // State for form
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Helper for preview-safe links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path === '/cart') return `/store-template-preview/${templateId}/cart`;
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setOrderPlaced(true);
    }, 1500);
  };

  if (orderPlaced) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="max-w-md w-full text-center p-8 rounded-2xl shadow-lg"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Order Placed Successfully!
          </h2>
          <p className="mb-8" style={{ color: colors.muted }}>
            Thank you for your order. We'll contact you shortly to confirm delivery details.
          </p>
          <div
            className="p-4 rounded-lg mb-8 text-left text-sm"
            style={{ backgroundColor: colors.background }}
          >
            <p className="font-semibold mb-1" style={{ color: colors.text }}>
              Order #12345
            </p>
            <p style={{ color: colors.muted }}>Estimated Delivery: 2-3 Days</p>
          </div>
          <Link
            to={getLink('/')}
            className="block w-full py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Simple Header */}
        <div className="flex items-center gap-2 mb-8 text-sm" style={{ color: colors.muted }}>
          <Link to={getLink('/cart')} className="hover:underline">
            Cart
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold" style={{ color: colors.text }}>
            Checkout
          </span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.muted + '40',
                      ['--tw-ring-color' as any]: colors.accent,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                Shipping Address
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.muted + '40',
                      ['--tw-ring-color' as any]: colors.accent,
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.muted + '40',
                      ['--tw-ring-color' as any]: colors.accent,
                    }}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    City
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.muted + '40',
                      ['--tw-ring-color' as any]: colors.accent,
                    }}
                  >
                    <option>Dhaka</option>
                    <option>Chittagong</option>
                    <option>Sylhet</option>
                    <option>Khulna</option>
                    <option>Rajshahi</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Area / Zone
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.muted + '40',
                      ['--tw-ring-color' as any]: colors.accent,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                Payment Method
              </h2>
              <div className="space-y-3">
                <label
                  className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors"
                  style={{
                    borderColor: paymentMethod === 'cod' ? colors.accent : colors.muted + '40',
                    backgroundColor: paymentMethod === 'cod' ? colors.accent + '10' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5"
                    style={{ color: colors.accent }}
                  />
                  <div className="flex-1">
                    <span className="font-semibold block" style={{ color: colors.text }}>
                      Cash on Delivery
                    </span>
                    <span className="text-sm" style={{ color: colors.muted }}>
                      Pay when you receive your order
                    </span>
                  </div>
                  <Truck className="w-6 h-6 opacity-50" />
                </label>

                <label
                  className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors opacity-60"
                  style={{
                    borderColor: paymentMethod === 'online' ? colors.accent : colors.muted + '40',
                  }}
                >
                  <input type="radio" name="payment" value="online" disabled className="w-5 h-5" />
                  <div className="flex-1">
                    <span className="font-semibold block" style={{ color: colors.text }}>
                      Online Payment
                    </span>
                    <span className="text-sm" style={{ color: colors.muted }}>
                      Bkash / Nagad / Card (Coming Soon)
                    </span>
                  </div>
                  <CreditCard className="w-6 h-6 opacity-50" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-xl shadow-sm sticky top-24"
              style={{ backgroundColor: colors.cardBg }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
                Order Summary
              </h2>

              {/* Mock Items */}
              <div
                className="space-y-4 mb-6 border-b pb-6"
                style={{ borderColor: colors.muted + '20' }}
              >
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={`https://source.unsplash.com/random/100x100?product&sig=${i}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                        {i === 1 ? 'Premium Headphones' : 'Smart Watch'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: colors.muted }}>
                        Qty: 1
                      </p>
                    </div>
                    <div className="font-medium text-sm" style={{ color: colors.text }}>
                      {currencySymbol}
                      {i === 1 ? '3,500' : '2,500'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm" style={{ color: colors.muted }}>
                  <span>Subtotal</span>
                  <span style={{ color: colors.text }}>{currencySymbol}6,000</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: colors.muted }}>
                  <span>Shipping</span>
                  <span style={{ color: colors.text }}>{currencySymbol}100</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6" style={{ borderColor: colors.muted + '20' }}>
                <div className="flex justify-between items-end">
                  <span className="font-medium" style={{ color: colors.text }}>
                    Total
                  </span>
                  <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                    {currencySymbol}6,100
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 text-white disabled:opacity-70"
                style={{ backgroundColor: colors.primary }}
              >
                {isProcessing ? 'Processing...' : `Place Order ${currencySymbol}6,100`}
                {!isProcessing && <Shield className="w-4 h-4" />}
              </button>

              <p
                className="text-xs text-center mt-4 flex items-center justify-center gap-1"
                style={{ color: colors.muted }}
              >
                <Lock className="w-3 h-3" />
                Encrypted and Secure
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

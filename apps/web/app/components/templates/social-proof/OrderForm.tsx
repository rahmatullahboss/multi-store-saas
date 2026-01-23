/**
 * Social Proof Order Form - Facebook/WhatsApp Style
 * 
 * UNIQUE STRUCTURE:
 * - Facebook post comment section style
 * - WhatsApp chat bubbles
 * - Reaction buttons
 * - Social media familiar UI
 */

import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, ThumbsUp, MessageCircle, Send, Star, CheckCircle } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function SocialProofOrderForm({
  config,
  product,
  storeId,
  isPreview,
  formatPrice,
  landingPageId,
}: SectionProps) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    orderNumber?: string;
    upsellUrl?: string;
  }>();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as DivisionValue,
    quantity: 1,
    selectedVariant: config.productVariants?.[0] || null,
  });

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;

  const subtotal = (formData.selectedVariant?.price || product.price) * formData.quantity;
  const shippingCost = calculateShipping(
    config.shippingConfig || DEFAULT_SHIPPING_CONFIG,
    formData.division,
    subtotal
  ).cost;
  const totalPrice = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || !storeId) return;

    const submitData = new FormData();
    submitData.set('store_id', String(storeId));
    submitData.set('product_id', String(product.id));
    submitData.set('customer_name', formData.customer_name);
    submitData.set('phone', formData.phone);
    submitData.set('address', formData.address);
    submitData.set('division', formData.division);
    submitData.set('quantity', String(formData.quantity));
    if (formData.selectedVariant) submitData.set('variant_name', formData.selectedVariant.name);
    if (landingPageId) submitData.set('landing_page_id', String(landingPageId));

    fetcher.submit(submitData, { method: 'POST', action: '/api/create-order' });
  };

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.orderId) {
      if (fetcher.data?.upsellUrl) {
        window.location.href = fetcher.data.upsellUrl;
      } else {
        window.location.href = `/thank-you/${fetcher.data.orderId}`;
      }
    }
  }, [fetcher.data]);

  // Recent orders simulation
  const recentOrders = [
    { name: 'Rahim', location: 'ঢাকা', time: '২ মিনিট আগে' },
    { name: 'Fatema', location: 'চট্টগ্রাম', time: '৫ মিনিট আগে' },
    { name: 'Karim', location: 'সিলেট', time: '১২ মিনিট আগে' },
  ];

  if (isSuccess) {
    return (
      <section className="py-16 bg-[#F0F2F5] text-center px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-[#1877F2] rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">অর্ডার সফল! 🎉</h2>
          <p className="text-gray-600">Order #{fetcher.data?.orderNumber}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className="py-8 md:py-16 bg-[#F0F2F5]">
      <div className="max-w-lg mx-auto px-4">
        
        {/* Recent orders - Like FB notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageCircle size={16} />
            সাম্প্রতিক অর্ডার
          </h3>
          <div className="space-y-2">
            {recentOrders.map((order, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                  {order.name[0]}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-800">{order.name}</span>
                  <span className="text-gray-500"> অর্ডার করেছেন ({order.location})</span>
                </div>
                <span className="text-gray-400 text-xs">{order.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Order Card - FB Post style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">অর্ডার করুন</span>
                <CheckCircle size={14} className="text-blue-500 fill-blue-500" />
              </div>
              <p className="text-gray-500 text-xs">Cash on Delivery Available</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            
            {/* Quantity - Like FB poll */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">পরিমাণ নির্বাচন করুন</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >-</button>
                  <span className="text-xl font-bold text-[#1877F2] w-8 text-center">{formData.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Variants - Like FB reaction buttons */}
            {config.productVariants && config.productVariants.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-gray-600 font-medium block mb-3">অপশন নির্বাচন করুন</span>
                <div className="flex flex-wrap gap-2">
                  {config.productVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        formData.selectedVariant?.id === variant.id
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#1877F2]'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input fields - Like FB comment input */}
            <input
              type="text"
              required
              className="w-full bg-gray-100 border-0 rounded-full px-5 py-3 focus:bg-white focus:ring-2 focus:ring-[#1877F2] outline-none transition-all"
              placeholder="আপনার নাম..."
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            />

            <input
              type="tel"
              required
              className="w-full bg-gray-100 border-0 rounded-full px-5 py-3 focus:bg-white focus:ring-2 focus:ring-[#1877F2] outline-none transition-all"
              placeholder="মোবাইল নম্বর..."
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'dhaka'})}
                className={`flex-1 py-3 rounded-full text-sm font-medium border transition-all ${
                  formData.division === 'dhaka'
                    ? 'bg-[#1877F2] text-white border-[#1877F2]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#1877F2]'
                }`}
              >
                ঢাকার ভেতরে
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'chittagong'})}
                className={`flex-1 py-3 rounded-full text-sm font-medium border transition-all ${
                  formData.division !== 'dhaka'
                    ? 'bg-[#1877F2] text-white border-[#1877F2]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#1877F2]'
                }`}
              >
                ঢাকার বাইরে
              </button>
            </div>

            <textarea
              required
              className="w-full bg-gray-100 border-0 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-[#1877F2] outline-none transition-all resize-none"
              placeholder="সম্পূর্ণ ঠিকানা লিখুন..."
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />

            {/* Price - Like FB marketplace */}
            <div className="bg-[#1877F2]/5 border border-[#1877F2]/20 rounded-xl p-4 flex justify-between items-center">
              <span className="text-[#1877F2] font-medium">মোট মূল্য</span>
              <span className="text-2xl font-bold text-[#1877F2]">{formatPrice(totalPrice)}</span>
            </div>

            {/* Submit - Like FB message send */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-lg rounded-full transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'পাঠানো হচ্ছে...' : (
                <>
                  <Send size={20} />
                  অর্ডার পাঠান
                </>
              )}
            </button>
          </form>

          {/* Reactions footer - Like FB */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <ThumbsUp size={10} className="text-white fill-white" />
                </div>
              </div>
              <span>2.4K লাইক</span>
            </div>
            <span>৩৪৭ জন অর্ডার করেছেন</span>
          </div>
        </div>

        {/* WhatsApp chat preview */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">WhatsApp Reviews</span>
          </div>
          <div className="bg-[#DCF8C6] rounded-2xl rounded-tl-none px-4 py-2 inline-block">
            <p className="text-gray-800 text-sm">ভাইয়া প্রোডাক্ট অসাধারণ! 👍🔥</p>
            <p className="text-[10px] text-gray-500 text-right">✓✓</p>
          </div>
        </div>
      </div>
    </section>
  );
}

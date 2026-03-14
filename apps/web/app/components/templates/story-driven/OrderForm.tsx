/**
 * Story-Driven Order Form - Emotional/Personal Design
 * 
 * UNIQUE STRUCTURE:
 * - Story continuation feel
 * - Handwritten-style accents
 * - Personal message from seller
 * - Warm, inviting colors
 */

import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, Heart, Gift, Sparkles } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function StoryDrivenOrderForm({
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

  if (isSuccess) {
    return (
      <section className="py-20 bg-amber-50 text-center px-4">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-xl border-2 border-amber-200">
          <Heart className="w-20 h-20 text-amber-500 mx-auto mb-6 fill-amber-500" />
          <h2 className="text-3xl font-bold text-amber-900 mb-4">ধন্যবাদ! 💛</h2>
          <p className="text-xl text-gray-600">আপনার অর্ডার নম্বর: #{fetcher.data?.orderNumber}</p>
          <p className="text-gray-500 mt-4">শীঘ্রই আমরা আপনার সাথে যোগাযোগ করবো।</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className="py-16 md:py-24 bg-gradient-to-b from-amber-50 to-orange-50 relative overflow-hidden">
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 text-amber-200 opacity-30">
        <Sparkles size={100} />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        
        {/* Personal message card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border-2 border-amber-100 relative">
          <div className="absolute -top-4 left-8 bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-serif">
            "
          </div>
          <p className="text-gray-700 text-lg leading-relaxed italic">
            আমি জানি আপনি এতক্ষণ আমার গল্প পড়েছেন। আমিও একসময় আপনার মতোই ছিলাম - সন্দিহান, দ্বিধাগ্রস্ত। 
            কিন্তু আজ আমি খুশি যে আমি সেই পদক্ষেপ নিয়েছিলাম। 
            <span className="font-bold text-amber-700"> আপনিও নিন। আমি প্রতিশ্রুতি দিচ্ছি, আপনি হতাশ হবেন না।</span>
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <p className="font-bold text-gray-800">আপনার বন্ধু,</p>
              <p className="text-amber-600 font-medium">সেলার টিম</p>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-amber-200">
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
              <Gift size={16} />
              বিশেষ অফার শুধু আপনার জন্য
            </span>
            <h2 className="text-3xl font-bold text-amber-900 mt-4">
              আপনার যাত্রা শুরু করুন
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Quantity with heart icon */}
            <div className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <span className="font-medium text-amber-800 flex items-center gap-2">
                <Heart size={16} className="fill-amber-500 text-amber-500" />
                কতটি নেবেন?
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                  className="w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center hover:bg-amber-100 font-bold text-amber-700"
                >-</button>
                <span className="text-2xl font-bold text-amber-700 w-8 text-center">{formData.quantity}</span>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                  className="w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center hover:bg-amber-100 font-bold text-amber-700"
                >+</button>
              </div>
            </div>

            {/* Variants */}
            {config.productVariants && config.productVariants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">আপনার পছন্দ</label>
                <div className="flex flex-wrap gap-2">
                  {config.productVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                      className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        formData.selectedVariant?.id === variant.id
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                required
                className="w-full bg-amber-50 border-2 border-amber-100 rounded-2xl px-5 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all text-gray-800"
                placeholder="আপনার সুন্দর নামটি লিখুন 😊"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />

              <input
                type="tel"
                required
                className="w-full bg-amber-50 border-2 border-amber-100 rounded-2xl px-5 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all text-gray-800"
                placeholder="মোবাইল নম্বর (আমরা কল করবো)"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'dhaka'})}
                className={`py-4 rounded-2xl font-medium border-2 transition-all ${
                  formData.division === 'dhaka'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500'
                    : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                }`}
              >
                ঢাকায় থাকি
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'chittagong'})}
                className={`py-4 rounded-2xl font-medium border-2 transition-all ${
                  formData.division !== 'dhaka'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500'
                    : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                }`}
              >
                ঢাকার বাইরে
              </button>
            </div>

            <textarea
              required
              className="w-full bg-amber-50 border-2 border-amber-100 rounded-2xl px-5 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all resize-none text-gray-800"
              placeholder="কোথায় পাঠাবো? (সম্পূর্ণ ঠিকানা)"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />

            {/* Price with emotional touch */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-5 text-center">
              <p className="text-amber-700 text-sm mb-1">আপনার বিনিয়োগ</p>
              <p className="text-4xl font-black text-amber-600">{formatPrice(totalPrice)}</p>
              <p className="text-amber-600/70 text-sm mt-1">ক্যাশ অন ডেলিভারি</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {isSubmitting ? 'অপেক্ষা করুন...' : (
                <span className="flex items-center justify-center gap-2">
                  <Heart className="fill-white" />
                  হ্যাঁ, আমি চাই!
                </span>
              )}
            </button>

            <p className="text-center text-amber-600/70 text-sm">
              ১০০% সন্তুষ্টি গ্যারান্টি • পছন্দ না হলে টাকা ফেরত
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

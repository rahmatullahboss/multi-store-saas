/**
 * Trust-First Order Form - Testimonial-Heavy Design
 * 
 * UNIQUE STRUCTURE:
 * - Side testimonial cards
 * - Trust badges prominently displayed
 * - Customer photo testimonials
 * - Green/White clean look
 */

import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, Star, ShieldCheck, Truck, Award, Users } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function TrustFirstOrderForm({
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
    error?: string;
  }>();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as DivisionValue,
    quantity: 1,
    selectedVariant: config.productVariants?.[0] || null,
  });

  const [selectedBumpIds, setSelectedBumpIds] = useState<number[]>([]);
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
    if (selectedBumpIds.length > 0) submitData.set('bump_ids', JSON.stringify(selectedBumpIds));
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

  // Sample testimonials
  const testimonials = [
    { name: 'রহিম আহমেদ', location: 'ঢাকা', text: 'অসাধারণ প্রোডাক্ট! দ্রুত ডেলিভারি পেয়েছি।', rating: 5 },
    { name: 'ফাতেমা বেগম', location: 'চট্টগ্রাম', text: 'খুবই সন্তুষ্ট। আবার অর্ডার করবো।', rating: 5 },
  ];

  if (isSuccess) {
    return (
      <section className="py-20 bg-emerald-50 text-center px-4">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-emerald-200">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">অর্ডার সফল হয়েছে! 🎉</h2>
          <p className="text-xl text-gray-600">অর্ডার নম্বর: #{fetcher.data?.orderNumber}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className="py-16 md:py-24 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Trust badges top bar */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {[
            { icon: Users, text: '১৫,০০০+ সন্তুষ্ট গ্রাহক' },
            { icon: Star, text: '৪.৯/৫ রেটিং' },
            { icon: ShieldCheck, text: '১০০% গ্যারান্টি' },
            { icon: Truck, text: 'ফ্রি ডেলিভারি' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100">
              <badge.icon size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">{badge.text}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left: Testimonials Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-emerald-600" />
              গ্রাহকদের মতামত
            </h3>
            
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.location}</p>
                  </div>
                </div>
                <div className="flex mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">"{t.text}"</p>
              </div>
            ))}

            {/* Stats */}
            <div className="bg-emerald-600 text-white rounded-2xl p-6 text-center">
              <p className="text-4xl font-black">৯৮%</p>
              <p className="text-emerald-100">গ্রাহক আবার কিনতে চান</p>
            </div>
          </div>

          {/* Right: Order Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">অর্ডার ফর্ম</h2>
              <p className="text-gray-500 mb-6">আপনার তথ্য দিন, আমরা শীঘ্রই যোগাযোগ করবো</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Quantity */}
                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl">
                  <span className="font-medium text-gray-700">পরিমাণ</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                      className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center hover:bg-emerald-100"
                    >-</button>
                    <span className="text-xl font-bold w-8 text-center">{formData.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                      className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center hover:bg-emerald-100"
                    >+</button>
                  </div>
                </div>

                {/* Variants */}
                {config.productVariants && config.productVariants.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পণ্য নির্বাচন</label>
                    <div className="flex flex-wrap gap-2">
                      {config.productVariants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            formData.selectedVariant?.id === variant.id
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="আপনার নাম"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                />

                <input
                  type="tel"
                  required
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="মোবাইল নম্বর"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, division: 'dhaka'})}
                    className={`py-3 rounded-xl font-medium border-2 transition-all ${
                      formData.division === 'dhaka'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    ঢাকার ভেতরে
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, division: 'chittagong'})}
                    className={`py-3 rounded-xl font-medium border-2 transition-all ${
                      formData.division !== 'dhaka'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    ঢাকার বাইরে
                  </button>
                </div>

                <textarea
                  required
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none"
                  placeholder="সম্পূর্ণ ঠিকানা"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />

                {/* Price summary */}
                <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>পণ্যের মূল্য</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-emerald-700 pt-2 border-t border-emerald-200">
                    <span>সর্বমোট</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  {isSubmitting ? 'অপেক্ষা করুন...' : 'অর্ডার কনফার্ম করুন ✓'}
                </button>

                <p className="text-center text-gray-500 text-sm">
                  ক্যাশ অন ডেলিভারি • ৭ দিন রিটার্ন গ্যারান্টি
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

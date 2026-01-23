/**
 * Urgency-Scarcity Order Form - FOMO Focused
 * 
 * UNIQUE STRUCTURE:
 * - Countdown in form
 * - Stock warning
 * - Blinking elements
 * - Dark dramatic design
 */

import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Clock, Flame, ShoppingCart, Zap, TrendingUp } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function UrgencyScarcityOrderForm({
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

  const [stockLeft] = useState(15);
  const [seconds, setSeconds] = useState(59);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev > 0 ? prev - 1 : 59);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      <section className="py-16 bg-black text-center px-4">
        <div className="max-w-md mx-auto bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border-2 border-yellow-500">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-black text-yellow-400 mb-4">সফল! 🔥</h2>
          <p className="text-gray-400">Order #{fetcher.data?.orderNumber}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className="py-12 md:py-20 bg-black relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-yellow-900/10" />

      <div className="max-w-xl mx-auto px-4 relative z-10">
        
        {/* Urgency banner */}
        <div className="bg-red-600 rounded-t-2xl py-3 px-4 flex items-center justify-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-white" />
          <span className="text-white font-bold">⚠️ মাত্র {stockLeft}টি বাকি আছে! ⚠️</span>
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>

        {/* Main form card */}
        <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-red-500/50 border-t-0 rounded-b-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
          
          {/* Countdown in form */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-900/50 px-4 py-2 rounded-full border border-red-500/50 mb-4">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-bold">এই অফার শেষ হবে</span>
            </div>
            <div className="flex justify-center gap-2">
              {['02', '45', String(seconds).padStart(2, '0')].map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="bg-black border-2 border-red-500 rounded-lg px-3 py-2">
                    <span className="text-2xl font-mono font-black text-white">{val}</span>
                  </div>
                  {i < 2 && <span className="text-red-500 text-2xl font-bold animate-pulse">:</span>}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Stock bar */}
            <div className="bg-black/50 rounded-xl p-4 border border-red-500/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <TrendingUp size={14} />
                  দ্রুত বিক্রি হচ্ছে!
                </span>
                <span className="text-gray-400">23% স্টক বাকি</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[23%] bg-gradient-to-r from-red-600 to-yellow-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Quantity */}
            <div className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-gray-800">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <Flame className="text-yellow-500" size={18} />
                পরিমাণ
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                  className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-yellow-500 hover:text-black text-white font-bold transition-colors"
                >-</button>
                <span className="text-2xl font-black text-yellow-400 w-8 text-center">{formData.quantity}</span>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                  className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-yellow-500 hover:text-black text-white font-bold transition-colors"
                >+</button>
              </div>
            </div>

            {/* Variants */}
            {config.productVariants && config.productVariants.length > 0 && (
              <div className="bg-black/50 p-4 rounded-xl border border-gray-800">
                <span className="text-gray-400 font-medium block mb-3">অপশন নির্বাচন</span>
                <div className="flex flex-wrap gap-2">
                  {config.productVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                        formData.selectedVariant?.id === variant.id
                          ? 'bg-yellow-500 text-black border-yellow-500'
                          : 'bg-black text-gray-400 border-gray-700 hover:border-yellow-500/50'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form fields */}
            <input
              type="text"
              required
              className="w-full bg-black border-2 border-gray-800 rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
              placeholder="আপনার নাম"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            />

            <input
              type="tel"
              required
              className="w-full bg-black border-2 border-gray-800 rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
              placeholder="মোবাইল নম্বর"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'dhaka'})}
                className={`py-4 rounded-xl font-bold border-2 transition-all ${
                  formData.division === 'dhaka'
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'bg-black text-gray-400 border-gray-700 hover:border-yellow-500/50'
                }`}
              >
                ঢাকার ভেতরে
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'chittagong'})}
                className={`py-4 rounded-xl font-bold border-2 transition-all ${
                  formData.division !== 'dhaka'
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'bg-black text-gray-400 border-gray-700 hover:border-yellow-500/50'
                }`}
              >
                ঢাকার বাইরে
              </button>
            </div>

            <textarea
              required
              className="w-full bg-black border-2 border-gray-800 rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none transition-all resize-none placeholder:text-gray-600"
              placeholder="সম্পূর্ণ ঠিকানা"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />

            {/* Price - Glowing */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-red-900/30 rounded-xl p-4 border border-yellow-500/30">
              <div className="flex justify-between items-center">
                <span className="text-yellow-500 font-bold">সর্বমোট</span>
                <span className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* CTA - Glowing animated */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-300 hover:to-yellow-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] active:scale-[0.98] animate-pulse"
            >
              {isSubmitting ? 'অপেক্ষা করুন...' : (
                <span className="flex items-center justify-center gap-3">
                  <ShoppingCart className="fill-black" />
                  এখনই অর্ডার করুন!
                </span>
              )}
            </button>

            <p className="text-center text-gray-500 text-xs">
              ⚡ ক্যাশ অন ডেলিভারি ⚡ দ্রুত শিপিং ⚡
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

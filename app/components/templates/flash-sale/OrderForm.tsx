import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { BD_DIVISIONS, calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function FlashSaleOrderForm({
  config,
  product,
  storeId,
  isPreview,
  formatPrice,
  theme,
  productVariants = [],
  orderBumps = [],
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


  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedBumpIds, setSelectedBumpIds] = useState<number[]>([]);

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;

  const subtotal = (formData.selectedVariant?.price || product.price) * formData.quantity;
  const shippingCost = calculateShipping(
    config.shippingConfig || DEFAULT_SHIPPING_CONFIG, 
    formData.division, 
    subtotal
  ).cost;
  
  const bumpTotal = selectedBumpIds.reduce((total, bumpId) => {
    const bump = orderBumps.find(b => b.id === bumpId);
    if (!bump) return total;
    const originalPrice = bump.bumpProduct.price;
    const discountedPrice = bump.discount > 0 
      ? originalPrice * (1 - bump.discount / 100) 
      : originalPrice;
    return total + discountedPrice;
  }, 0);
  
  const totalPrice = subtotal + bumpTotal + shippingCost;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.customer_name.trim()) errors.customer_name = 'নাম দেওয়া আবশ্যক';
    if (!formData.phone.trim()) errors.phone = 'মোবাইল নম্বর দেওয়া আবশ্যক';
    if (!formData.address.trim()) errors.address = 'শিপিং ঠিকানা দেওয়া আবশ্যক';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || !storeId) return;
    if (!validateForm()) return;
    
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
      <section className="py-20 bg-emerald-50 text-center px-4">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border-4 border-emerald-500">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">অর্ডার সফল হয়েছে! 🎉</h2>
          <p className="text-xl text-gray-600 mb-6">আপনার অর্ডার নম্বর: #<span className="font-bold text-gray-900">{fetcher.data?.orderNumber}</span></p>
          <p className="text-gray-500">শীঘ্রই আমাদের প্রতিনিধি আপনাকে কল করে অর্ডারটি কনফার্ম করবেন।</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-16 md:py-32 bg-zinc-950 overflow-hidden`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-2 shadow-2xl border-2 border-yellow-500">
          <div className="bg-gray-900 rounded-[1.4rem] p-8 lg:p-12">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase italic animate-bounce">
                  <CheckCircle2 size={14} /> Limited Stock remaining
                </div>
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">অর্ডার করুন এখনই!</h2>
                <div className="space-y-3 bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between text-gray-400 font-bold uppercase text-xs">
                    <span>পণ্যের মূল্য</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 font-bold uppercase text-xs">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-white">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-yellow-500 font-black text-xl italic uppercase">সর্বমোট</span>
                    <span className="text-3xl font-black text-white tracking-tighter animate-pulse">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-2 flex items-center justify-between">
                    <span className="text-white font-bold text-sm uppercase italic">পরিমাণ (QTY)</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                        className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white text-xl font-bold w-4 text-center">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                        className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {config.productVariants && config.productVariants.length > 0 && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-2">
                      <span className="text-white font-bold text-sm uppercase italic block mb-3">পণ্য নির্বাচন করুন</span>
                      <div className="flex flex-wrap gap-2">
                        {config.productVariants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                            className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                              formData.selectedVariant?.id === variant.id
                                ? 'bg-yellow-500 text-black border-yellow-500'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {variant.name}
                            {variant.price && variant.price !== product.price && (
                              <span className="ml-1 text-[10px] opacity-70">
                                ({formatPrice(variant.price)})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      className="w-full bg-white rounded-xl px-5 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-yellow-500/50 outline-none"
                      placeholder="NAME"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    />
                    <input
                      type="tel"
                      required
                      className="w-full bg-white rounded-xl px-5 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-yellow-500/50 outline-none"
                      placeholder="PHONE"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'dhaka'})}
                      className={`py-4 rounded-xl font-bold transition-all border-2 ${
                        formData.division === 'dhaka' 
                          ? 'bg-yellow-500 text-black border-yellow-500' 
                          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      ঢাকার ভেতরে
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'chittagong'})}
                      className={`py-4 rounded-xl font-bold transition-all border-2 ${
                        formData.division !== 'dhaka' 
                          ? 'bg-yellow-500 text-black border-yellow-500' 
                          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      ঢাকার বাইরে
                    </button>
                  </div>

                  <textarea
                    required
                    className="w-full bg-white rounded-xl px-5 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-yellow-500/50 outline-none resize-none"
                    placeholder="FULL SHIPPING ADDRESS"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-2xl rounded-xl transition-all active:scale-95 shadow-[0_10px_0_rgba(202,138,4,1)] mb-2"
                  >
                    {isSubmitting ? '...' : (
                      <div className="flex items-center justify-center gap-3">
                        <ShoppingCart className="fill-black" />
                        CONFIRM ORDER!
                      </div>
                    )}
                  </button>
                  <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-50">🔒 Secure Checkout • Cash on Delivery</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

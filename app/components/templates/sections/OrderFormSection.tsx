import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, User, Phone, MapPin, Truck, ShoppingCart, ShieldCheck } from 'lucide-react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { BD_DIVISIONS, calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import { OrderBumpsContainer } from '~/components/landing/OrderBumpCheckbox';
import type { SectionProps } from './types';

export function OrderFormSection({
  config,
  product,
  storeId,
  isPreview,
  formatPrice,
  theme,
  lang = 'bn',
  productVariants = [],
  orderBumps = [],
  templateId,
}: SectionProps & { 
  formatPrice: (price: number) => string, 
  storeId?: number,
  productVariants?: any[],
  orderBumps?: any[]
}) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    orderNumber?: string;
    upsellUrl?: string;
    error?: string;
    details?: Record<string, string[]>;
  }>();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as DivisionValue,
    quantity: 1,
  });

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    productVariants.length > 0 ? productVariants[0].id : null
  );

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedBumpIds, setSelectedBumpIds] = useState<number[]>([]);

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;

  const selectedVariant = selectedVariantId 
    ? productVariants.find(v => v.id === selectedVariantId)
    : null;
  
  const effectivePrice = selectedVariant?.price ?? product.price;
  const subtotal = effectivePrice * formData.quantity;
  const shippingCost = calculateShipping(DEFAULT_SHIPPING_CONFIG, formData.division, subtotal).cost;
  
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
    if (!formData.customer_name.trim()) errors.customer_name = 'নাম দেওয়া আবশ্যক';
    if (!formData.phone.trim()) errors.phone = 'মোবাইল নম্বর দেওয়া আবশ্যক';
    if (!formData.address.trim()) errors.address = 'শিপিং ঠিকানা দেওয়া আবশ্যক';
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
    if (selectedVariantId) submitData.set('variant_id', String(selectedVariantId));
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
          <h2 className="text-3xl font-black text-gray-900 mb-4">অর্ডার সফল হয়েছে! 🎉</h2>
          <p className="text-xl text-gray-600 mb-6">আপনার অর্ডার নম্বর: #<span className="font-bold text-gray-900">{fetcher.data?.orderNumber}</span></p>
          <p className="text-gray-500">শীঘ্রই আমাদের প্রতিনিধি আপনাকে কল করে অর্ডারটি কনফার্ম করবেন।</p>
        </div>
      </section>
    );
  }

  const renderForm = () => {
    switch (templateId) {
      case 'modern-dark':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">🛒 অর্ডার সামারি</h2>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex gap-6 mb-8 group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden ring-1 ring-white/20 group-hover:ring-orange-500/50 transition-all">
                    <OptimizedImage src={product.imageUrl} alt={product.title} width={100} height={100} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-2">{product.title}</h3>
                    <p className="text-orange-500 font-black text-2xl">{formatPrice(effectivePrice)}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-gray-400">
                    <span>পণ্যের দাম ({formData.quantity} টি)</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-white">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-orange-500 font-black text-2xl pt-4 border-t border-white/10">
                    <span>সর্বমোট</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-1">আপনার নাম</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="নাম লিখুন"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="০১৭XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-1">সম্পূর্ণ ঠিকানা</label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                  placeholder="বাসা/রোড, এলাকা, থানা, জেলা"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-tighter"
              >
                {isSubmitting ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন →'}
              </button>
            </form>
          </div>
        );

      case 'showcase':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-16 text-center">Complete Your Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="flex flex-col justify-center border-r border-white/5 pr-20 order-2 md:order-1">
                <form onSubmit={handleSubmit} className="space-y-12">
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-2xl font-light text-white focus:border-rose-500 outline-none transition-all placeholder:text-white/20"
                    placeholder="YOUR FULL NAME"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                  <input
                    type="tel"
                    required
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-2xl font-light text-white focus:border-rose-500 outline-none transition-all placeholder:text-white/20"
                    placeholder="PHONE NUMBER"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <textarea
                    required
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-2xl font-light text-white focus:border-rose-500 outline-none transition-all placeholder:text-white/20 resize-none"
                    placeholder="SHIPPING ADDRESS"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex items-center gap-6 text-2xl font-black uppercase tracking-widest text-rose-500 hover:text-white transition-colors"
                  >
                    {isSubmitting ? 'PROCESSING...' : (
                      <>
                        CONFIRM ORDER
                        <div className="w-12 h-[2px] bg-rose-500 group-hover:w-20 group-hover:bg-white transition-all" />
                      </>
                    )}
                  </button>
                </form>
              </div>
              <div className="flex flex-col justify-center order-1 md:order-2">
                <div className="aspect-square bg-white rounded-full p-12 shadow-2xl border-4 border-rose-500/10 mb-8 flex flex-col items-center justify-center text-center">
                  <h3 className="text-gray-900 font-black text-2xl mb-4 leading-tight">{product.title}</h3>
                  <div className="h-px w-20 bg-rose-500/20 mb-4" />
                  <p className="text-rose-500 text-4xl font-black tracking-tighter">{formatPrice(totalPrice)}</p>
                  <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Incl. Shipping</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'organic':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-emerald-50 rounded-[2.5rem] p-8 border-2 border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Truck size={100} className="text-emerald-900" />
                </div>
                <h2 className="text-3xl font-black text-emerald-900 mb-6 flex items-center gap-3">
                   অর্ডার সামারি 🌿
                </h2>
                <div className="flex gap-6 mb-8 bg-white/60 backdrop-blur-sm p-6 rounded-3xl">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                    <OptimizedImage src={product.imageUrl} alt={product.title} width={100} height={100} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-lg mb-2">{product.title}</h3>
                    <p className="text-emerald-600 font-black text-2xl">{formatPrice(effectivePrice)}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-emerald-200">
                  <div className="flex justify-between text-emerald-800/70 font-medium">
                    <span>পণ্যের দাম ({formData.quantity} টি)</span>
                    <span className="text-emerald-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800/70 font-medium">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-emerald-900">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-black text-2xl pt-4 border-t-2 border-dashed border-emerald-200">
                    <span>সর্বমোট</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-10 rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-900/5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-800 ml-2">আপনার শুভ নাম</label>
                <input
                  type="text"
                  required
                  className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl px-6 py-4 text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-emerald-600/30"
                  placeholder="সম্পূর্ণ নাম লিখুন"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-800 ml-2">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl px-6 py-4 text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="০১৭XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-800 ml-2">বিস্তারিত ঠিকানা</label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl px-6 py-4 text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  placeholder="গ্রাম, ডাকঘর, থানা, জেলা"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
              >
                {isSubmitting ? 'প্রসেসিং...' : (
                  <>
                    অর্ডার কনফার্ম করুন
                    <CheckCircle2 size={24} />
                  </>
                )}
              </button>
            </form>
          </div>
        );

      case 'luxury':
        return (
          <div className="max-w-5xl mx-auto border border-amber-900/20 rounded-3xl overflow-hidden bg-[#0a0a0a] shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-amber-900/10">
                <h2 className="text-3xl font-serif text-amber-500 mb-10 tracking-widest uppercase">Order Details</h2>
                <div className="flex gap-8 mb-12">
                  <div className="w-28 h-28 border border-amber-900/30 p-1">
                    <OptimizedImage src={product.imageUrl} alt={product.title} width={120} height={120} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-serif text-white text-xl mb-2">{product.title}</h3>
                    <p className="text-amber-500 font-bold text-2xl tracking-tight">{formatPrice(effectivePrice)}</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex justify-between text-gray-500 font-serif italic">
                    <span>Price for {formData.quantity} item(s)</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-serif italic">
                    <span>Shipping Handling</span>
                    <span className="text-white">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="pt-8 border-t border-amber-900/30 flex justify-between items-end">
                    <span className="text-amber-500 font-serif uppercase tracking-widest text-sm">Grand Total</span>
                    <span className="text-4xl font-serif text-white">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="p-10 lg:p-16 bg-[#0f0f0f]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent border-b border-amber-900/30 py-4 text-white font-serif text-lg focus:border-amber-500 outline-none transition-all placeholder:text-gray-700"
                      placeholder="FULL NAME"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    />
                    <User className="absolute right-0 top-4 text-amber-900/30 group-focus-within:text-amber-500 transition-colors" size={20} />
                  </div>
                  <div className="relative group">
                    <input
                      type="tel"
                      required
                      className="w-full bg-transparent border-b border-amber-900/30 py-4 text-white font-serif text-lg focus:border-amber-500 outline-none transition-all placeholder:text-gray-700"
                      placeholder="CONTACT NUMBER"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    <Phone className="absolute right-0 top-4 text-amber-900/30 group-focus-within:text-amber-500 transition-colors" size={20} />
                  </div>
                  <div className="relative group">
                    <textarea
                      required
                      rows={2}
                      className="w-full bg-transparent border-b border-amber-900/30 py-4 text-white font-serif text-lg focus:border-amber-500 outline-none transition-all placeholder:text-gray-700 resize-none"
                      placeholder="DELIVERY ADDRESS"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                    <MapPin className="absolute right-0 top-4 text-amber-900/30 group-focus-within:text-amber-500 transition-colors" size={20} />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-serif uppercase tracking-[0.2em] text-lg transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-amber-900/20"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Purchase'}
                  </button>
                  <p className="text-center text-amber-900/40 text-[10px] uppercase tracking-[0.3em] font-serif">A Legacy of Excellence • Secure Experience</p>
                </form>
              </div>
            </div>
          </div>
        );

      case 'premium-bd':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="bg-blue-600 py-6 px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                  <h2 className="text-2xl font-black text-white">অর্ডার ফরম পূরণ করুন 🛒</h2>
                  <p className="text-blue-100 font-medium">নিচে আপনার সঠিক তথ্য দিয়ে অর্ডারটি সম্পন্ন করুন</p>
                </div>
                <div className="flex items-center gap-4 bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md">
                  <ShieldCheck className="text-white" size={32} />
                  <div className="text-left">
                    <p className="text-white font-black leading-none">100% সুরক্ষিত</p>
                    <p className="text-blue-100 text-xs mt-1">ক্যাশ অন ডেলিভারি</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3 p-8 lg:p-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">আপনার নাম</label>
                        <input
                          type="text"
                          required
                          className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                          placeholder="পুরো নাম লিখুন"
                          value={formData.customer_name}
                          onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">মোবাইল নম্বর</label>
                        <input
                          type="tel"
                          required
                          className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                          placeholder="০১৭XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">শিপিং ঠিকানা</label>
                      <textarea
                        required
                        rows={3}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold resize-none"
                        placeholder="আপনার বিস্তারিত ঠিকানা দিন (বাসা নং, রোড নং, এলাকা)"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                    >
                      {isSubmitting ? 'প্রসেসিং...' : (
                        <>
                          অর্ডার কনফার্ম করুন
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <ShoppingCart size={20} />
                          </div>
                        </>
                      )}
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-gray-50/50 p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 mb-8 border-b pb-4">অর্ডার সামারি</h3>
                  <div className="flex gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-100">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <OptimizedImage src={product.imageUrl} alt={product.title} width={100} height={100} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{product.title}</h4>
                      <p className="text-blue-600 font-black text-xl">{formatPrice(effectivePrice)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-500 font-bold text-sm">
                      <span>সাব-টোটাল ({formData.quantity} টি)</span>
                      <span className="text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-bold text-sm">
                      <span>ডেলিভারি ফি</span>
                      <span className="text-gray-900">{formatPrice(shippingCost)}</span>
                    </div>
                    <div className="pt-6 border-t-2 border-blue-100 flex justify-between items-center group">
                      <span className="text-gray-900 font-black text-lg">সর্বমোট</span>
                      <div className="text-right">
                        <span className="text-3xl font-black text-blue-600 block leading-none">{formatPrice(totalPrice)}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ক্যাশ অন ডেলিভারি</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'modern-premium':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">🛒 Review Order</h2>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 border border-gray-200 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
                <div className="flex gap-8 mb-10">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-white group-hover:scale-105 transition-transform duration-500">
                    <OptimizedImage src={product.imageUrl} alt={product.title} width={150} height={150} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-xl mb-2">{product.title}</h3>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase">
                      Premium Quality
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8 border-t border-gray-100">
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Item Subtotal</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Shipping Fee</span>
                    <span className="text-gray-900">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-gray-50">
                    <span className="text-gray-900 font-black text-2xl">Total Payable</span>
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <p className="font-black text-lg">Secure Checkout</p>
                  <p className="text-blue-100 text-sm">Your information is protected by 256-bit SSL encryption</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-2xl space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
              <div className="space-y-6">
                <div className="group">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block ml-1 group-focus-within:text-blue-600 transition-colors">Customer Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-5 text-gray-900 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                    placeholder="Enter your full name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div className="group">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block ml-1 group-focus-within:text-blue-600 transition-colors">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-5 text-gray-900 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="group">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block ml-1 group-focus-within:text-blue-600 transition-colors">Delivery Address</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-5 text-gray-900 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm resize-none"
                    placeholder="House, Road, Area, City"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-2xl rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Finalizing...' : 'Confirm Order & Pay'}
              </button>
            </form>
          </div>
        );

      case 'minimal-light':
        return (
          <div className="max-w-2xl mx-auto py-12">
            <h2 className="text-3xl font-light text-gray-900 text-center mb-16 tracking-tight">Checkout</h2>
            <div className="space-y-16">
              <div className="border-b border-gray-100 pb-16">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-sm">
                      <OptimizedImage src={product.imageUrl} alt={product.title} width={80} height={80} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium">{product.title}</h3>
                      <p className="text-gray-400 text-sm">{formData.quantity} × {formatPrice(effectivePrice)}</p>
                    </div>
                  </div>
                  <span className="text-gray-900 font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-gray-900 font-medium">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-4 border-t border-gray-50">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-gray-900 font-black">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input
                      type="text"
                      required
                      className="w-full border-b border-gray-200 py-3 text-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    />
                    <input
                      type="tel"
                      required
                      className="w-full border-b border-gray-200 py-3 text-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full border-b border-gray-200 py-3 text-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-300"
                    placeholder="Shipping Address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-gray-900 hover:bg-black text-white text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'One moment...' : 'Confirm Order'}
                </button>
              </form>
            </div>
          </div>
        );


      default:
        // Default (Original)
        return (
          <div className={`${theme.cardBg} rounded-[2rem] shadow-2xl overflow-hidden border ${theme.cardBorder}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100">
                <h2 className={`text-3xl font-black ${theme.textPrimary} mb-8`}>🛒 অর্ডার সামারি</h2>
                <div className="flex gap-6 mb-8 bg-black/5 p-6 rounded-2xl">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                    <OptimizedImage src={product.imageUrl} alt={product.title} width={100} height={100} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${theme.textPrimary} text-lg mb-2`}>{product.title}</h3>
                    <p className="text-emerald-600 font-black text-2xl">{formatPrice(effectivePrice)}</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>পণ্যের দাম ({formData.quantity} টি)</span>
                    <span className={theme.textPrimary}>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>ডেলিভারি চার্জ</span>
                    <span className={theme.textPrimary}>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between">
                    <span className={`text-xl font-bold ${theme.textPrimary}`}>সর্বমোট</span>
                    <span className="text-2xl font-black text-emerald-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      required
                      className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 transition shadow-sm ${validationErrors.customer_name ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="আপনার নাম"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 transition shadow-sm ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="মোবাইল নম্বর"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      rows={3}
                      className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 transition shadow-sm ${validationErrors.address ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="শিপিং ঠিকানা"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-black rounded-2xl transition transform active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section id="order-form" className={`py-16 md:py-32 ${theme.bgSecondary} overflow-hidden`}>
      <div className="max-w-6xl mx-auto px-4">
        {renderForm()}
      </div>
    </section>
  );
}


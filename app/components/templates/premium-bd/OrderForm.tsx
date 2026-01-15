import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function PremiumBDOrderForm({
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
    if (!formData.customer_name.trim()) errors.customer_name = 'নাম প্রয়োজন';
    if (!formData.phone.trim()) errors.phone = 'ফোন নাম্বার প্রয়োজন';
    if (!formData.address.trim()) errors.address = 'ঠিকানা প্রয়োজন';
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
      <section className="py-24 bg-gray-50 text-center px-4">
        <div className="max-w-2xl mx-auto bg-white p-16 rounded-[3rem] border border-orange-200 shadow-xl shadow-orange-100">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-gray-950 mb-4">অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! 🎉</h2>
          <p className="text-xl text-gray-600 mb-8 font-bold">অর্ডার আইডি: #<span className="text-orange-600">{fetcher.data?.orderNumber}</span></p>
          <p className="text-gray-400 text-sm font-medium">অল্প সময়ের মধ্যেই আমাদের একজন প্রতিনিধি আপনাকে ফোন করবেন।</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-16 bg-white relative`}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-gray-50 rounded-[3rem] border border-gray-100 p-8 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-950 leading-tight">
                অর্ডার করতে ফর্মটি <br /><span className="text-orange-600 underline decoration-gray-950/5 underline-offset-8 italic">সঠিকভাবে পূরণ করুন</span>
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">মোট টাকার পরিমাণ</span>
                  <span className="text-3xl font-black text-gray-950">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold border border-green-100">
                    <ShieldCheck size={16} /> ১০০% নিরাপদ পেমেন্ট
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100">
                    <MapPin size={16} /> সারা বাংলাদেশে ক্যাশ অন ডেলিভারি
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 text-gray-950 font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="আপনার নাম"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
              <input
                type="tel"
                required
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 text-gray-950 font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="ফোন নম্বর"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <textarea
                required
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 text-gray-950 font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 resize-none"
                placeholder="পূর্ণ ঠিকানা"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full py-6 bg-gray-950 hover:bg-black text-white font-black text-2xl rounded-2xl transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-4 border-b-4 border-orange-500"
              >
                {isSubmitting ? 'প্রসেসিং হচ্ছে...' : (
                  <>
                    অর্ডার কনফার্ম করুন
                    <ArrowRight size={26} className="group-hover:translate-x-3 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

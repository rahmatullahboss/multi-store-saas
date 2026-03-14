import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function MobileFirstOrderForm({
  config,
  product,
  storeId,
  isPreview,
  formatPrice,
  theme,
  productVariants = [],
  orderBumps = [],
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
    if (!formData.customer_name.trim()) errors.customer_name = 'নাম প্রয়োজন';
    if (!formData.phone.trim()) errors.phone = 'ফোন নম্বর প্রয়োজন';
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

  if (isSuccess) {
    return (
      <section className="py-12 bg-white text-center px-4">
        <div className="max-w-xl mx-auto bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-950 mb-2">ধন্যবাদ! অর্ডারটি পাওয়া গেছে। ✨</h2>
          <p className="text-lg text-gray-600 mb-6 font-bold">অর্ডার নম্বর: #<span className="text-indigo-600">{fetcher.data?.orderNumber}</span></p>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">শীঘ্রই আমাদের ডেলিভারি টিম আপনার সাথে যোগাযোগ করবে।</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-12 bg-white px-4`}>
      <div className="max-w-xl mx-auto">
        <div className="bg-indigo-50 rounded-[2.5rem] border border-indigo-50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] pointer-events-none" />

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
              <h2 className="text-3xl font-black text-gray-950 leading-tight">
                অর্ডার করতে <br /><span className="text-indigo-600">নিচের ফর্মটি পূরণ করুন</span>
              </h2>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl mb-2">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                  {config.orderFormText?.quantityLabel || 'পরিমাণ'}
                </span>
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                    className="w-10 h-10 rounded-xl bg-white border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center active:scale-90 transition-transform"
                  >
                    -
                  </button>
                  <span className="text-gray-950 text-xl font-black w-4 text-center">{formData.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                    className="w-10 h-10 rounded-xl bg-white border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center active:scale-90 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>

              {config.productVariants && config.productVariants.length > 0 && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl mb-2">
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest block mb-3">
                     {config.orderFormText?.variantLabel || 'পণ্য নির্বাচন'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {config.productVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${formData.selectedVariant?.id === variant.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-gray-400 border-indigo-50 hover:border-indigo-100'
                          }`}
                      >
                        {variant.name}
                        {variant.price && variant.price !== product.price && (
                          <span className="ml-1 opacity-60 text-[10px]">
                            • {formatPrice(variant.price)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-widest pt-2">
                <span>{config.orderFormText?.totalLabel || 'মোট বিল'}</span>
                <span className="text-2xl font-black text-gray-950">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] border-t border-gray-50 pt-4">
                <Truck size={14} /> {config.orderFormText?.codLabel || 'নিরাপদ হোম ডেলিভারি'}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                required
                className="w-full bg-white border-2 border-indigo-50 rounded-2xl px-6 py-5 text-gray-950 font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
                placeholder={config.orderFormText?.namePlaceholder || "আপনার নাম"}
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
              <input
                type="tel"
                required
                className="w-full bg-white border-2 border-indigo-50 rounded-2xl px-6 py-5 text-gray-950 font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
                placeholder={config.orderFormText?.phonePlaceholder || "ফোন নম্বর"}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, division: 'dhaka' })}
                  className={`py-4 rounded-2xl font-black text-xs transition-all border-2 ${formData.division === 'dhaka'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-gray-400 border-indigo-50 hover:border-indigo-200'
                    }`}
                >
                  {config.orderFormText?.insideDhakaLabel || 'ঢাকার ভেতরে'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, division: 'chittagong' })}
                  className={`py-4 rounded-2xl font-black text-xs transition-all border-2 ${formData.division !== 'dhaka'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-gray-400 border-indigo-50 hover:border-indigo-200'
                    }`}
                >
                  {config.orderFormText?.outsideDhakaLabel || 'ঢাকার বাইরে'}
                </button>
              </div>

              <textarea
                required
                className="w-full bg-white border-2 border-indigo-50 rounded-2xl px-6 py-5 text-gray-950 font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 resize-none"
                placeholder={config.orderFormText?.addressPlaceholder || "পূর্ণ ঠিকানা"}
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-2xl transition-all active:scale-[0.97] shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (config.orderFormText?.processingButtonText || 'প্রসেসিং হচ্ছে...') : (
                  <>
                    {config.orderFormText?.submitButtonText || 'অর্ডার কনফার্ম করুন'}
                    <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
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

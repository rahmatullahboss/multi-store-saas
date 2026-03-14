import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function OrganicOrderForm({
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
    if (!formData.customer_name.trim()) errors.customer_name = 'Required';
    if (!formData.phone.trim()) errors.phone = 'Required';
    if (!formData.address.trim()) errors.address = 'Required';
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
      <section className="py-24 bg-green-50 text-center px-4">
        <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] border border-green-200 shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pure Success! 🌿</h2>
          <p className="text-xl text-gray-600 mb-8">Order ID: #<span className="text-green-600 font-bold">{fetcher.data?.orderNumber}</span></p>
          <p className="text-gray-400 text-sm italic">Fresh products coming your way soon.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-20 bg-white relative`}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-green-50/50 rounded-[3rem] border border-green-100 p-8 lg:p-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-green-200">
                <Leaf size={14} /> 100% Eco-Friendly Packaging
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Embrace the <br /><span className="text-green-600 italic">Organic Lifestyle</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Final Investment</span>
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center gap-3 text-green-700 font-bold text-sm">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                    <span>{config.orderFormText?.quantityLabel || 'পরিমাণ'}</span>
                    <div className="flex items-center gap-4 bg-white rounded-lg p-1 shadow-sm border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                        className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-700 transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-lg text-gray-900">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                        className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-700 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {config.productVariants && config.productVariants.length > 0 && (
                    <div>
                      <span className="text-sm font-bold text-gray-600 block mb-2">
                        {config.orderFormText?.variantLabel || 'পণ্য নির্বাচন'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {config.productVariants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                              formData.selectedVariant?.id === variant.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-gray-500 border-stone-200 hover:border-emerald-300'
                            }`}
                          >
                            {variant.name}
                            {variant.price && variant.price !== product.price && (
                              <span className="ml-1 opacity-70">
                                ({formatPrice(variant.price)})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                    <span className="text-lg font-bold text-emerald-800">
                       {config.orderFormText?.totalLabel || 'সর্বমোট'}
                    </span>
                    <span className="text-3xl font-black text-emerald-600">{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 bg-emerald-50 py-2 rounded-lg">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>{config.orderFormText?.codLabel || 'ক্যাশ অন ডেলিভারি এভেলেবল'}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                className="w-full bg-white border-2 border-stone-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                placeholder={config.orderFormText?.namePlaceholder || "আপনার নাম"}
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
              <input
                type="tel"
                required
                className="w-full bg-white border-2 border-stone-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                placeholder={config.orderFormText?.phonePlaceholder || "ফোন নম্বর"}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'dhaka'})}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    formData.division === 'dhaka' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                      : 'bg-white text-gray-400 border-stone-200 hover:border-emerald-200'
                  }`}
                >
                  {config.orderFormText?.insideDhakaLabel || 'ঢাকার ভেতরে'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'chittagong'})}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    formData.division !== 'dhaka' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                      : 'bg-white text-gray-400 border-stone-200 hover:border-emerald-200'
                  }`}
                >
                  {config.orderFormText?.outsideDhakaLabel || 'ঢাকার বাইরে'}
                </button>
              </div>

              <textarea
                required
                className="w-full bg-white border-2 border-stone-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 resize-none"
                placeholder={config.orderFormText?.addressPlaceholder || "পূর্ণ ঠিকানা"}
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-xl transition-all shadow-lg hover:shadow-xl shadow-emerald-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (config.orderFormText?.processingButtonText || 'অপেক্ষা করুন...') : (
                  <>
                    <span>{config.orderFormText?.submitButtonText || 'অর্ডার কনফার্ম করুন'}</span>
                    <ArrowRight size={20} />
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

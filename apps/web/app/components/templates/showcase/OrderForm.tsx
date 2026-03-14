import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function ShowcaseOrderForm({
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
      <section className="py-24 bg-black text-center px-4 border-t border-rose-500/10">
        <div className="max-w-2xl mx-auto bg-zinc-900/50 backdrop-blur-3xl p-16 rounded-[4rem] border border-rose-500/30">
          <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(244,63,94,0.5)]">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tighter italic">Acquisition Complete</h2>
          <p className="text-xl text-zinc-400 mb-8 font-medium">Your sequence: #<span className="text-rose-500">{fetcher.data?.orderNumber}</span></p>
          <p className="text-zinc-600 text-sm uppercase tracking-widest font-bold">Preparation in progress...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-24 bg-black relative`}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-zinc-900/40 rounded-[3rem] border border-white/5 p-8 lg:p-20 overflow-hidden relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-600/10 blur-[120px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-rose-500/20">
                <Zap size={14} className="fill-rose-500" /> Instant Processing
              </div>
              <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter leading-[0.9]">
                Own the <br /><span className="text-rose-600 italic">Experience</span>
              </h2>
              
              <div className="space-y-6">
                <div className="bg-zinc-950/50 p-8 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Value</span>
                    <span className="text-5xl font-bold text-white tracking-tighter">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} /> 100% Secure Checkout
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                       {config.orderFormText?.quantityLabel || 'Qty'}
                    </span>
                    <div className="flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold w-8 text-center">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {config.productVariants && config.productVariants.length > 0 && (
                    <div className="pb-6 border-b border-gray-100">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wide block mb-3">
                         {config.orderFormText?.variantLabel || 'Select Model'}
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {config.productVariants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                              formData.selectedVariant?.id === variant.id
                                ? 'border-blue-600 text-blue-600 bg-blue-50'
                                : 'border-gray-200 text-gray-400 hover:border-gray-300'
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

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                       {config.orderFormText?.totalLabel || 'Total Value'}
                    </span>
                    <span className="text-3xl font-black text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                      placeholder={config.orderFormText?.namePlaceholder || "Name"}
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    />
                    <input
                      type="tel"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                      placeholder={config.orderFormText?.phonePlaceholder || "Phone"}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'dhaka'})}
                      className={`py-3 rounded-lg text-sm font-bold transition-all border-2 ${
                        formData.division === 'dhaka' 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {config.orderFormText?.insideDhakaLabel || 'Inside Dhaka'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'chittagong'})}
                      className={`py-3 rounded-lg text-sm font-bold transition-all border-2 ${
                        formData.division !== 'dhaka' 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {config.orderFormText?.outsideDhakaLabel || 'Outside Dhaka'}
                    </button>
                  </div>

                  <textarea
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                    placeholder={config.orderFormText?.addressPlaceholder || "Address"}
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-lg transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (config.orderFormText?.processingButtonText || 'Processing...') : (
                      <>
                        <span>{config.orderFormText?.submitButtonText || 'ORDER NOW'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                     {config.orderFormText?.codLabel || 'Secure Shipping & Payment Info'}
                  </p>
                </form>
          </div>
        </div>
      </div>
    </section>
  );
}

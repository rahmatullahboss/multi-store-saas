import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function VideoFocusOrderForm({
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
      <section className="py-24 bg-black text-center px-4">
        <div className="max-w-xl mx-auto bg-[#0A0A0A] p-16 rounded-[3rem] border border-red-600/50 shadow-2xl shadow-red-900/40">
          <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase italic">ORDER SECURED! 🎬</h2>
          <p className="text-xl text-gray-400 mb-8 font-bold tracking-tight">Access Code: #<span className="text-red-600 underline underline-offset-4">{fetcher.data?.orderNumber}</span></p>
          <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.5em] opacity-60">Transmission Complete</div>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-20 bg-black relative`}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-[#0A0A0A] rounded-[3.5rem] border border-white/5 p-8 lg:p-20 relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-600/10 blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20">
                <Zap size={14} className="fill-white" /> Limited Production
              </div>
              <h2 className="text-4xl lg:text-7xl font-black text-white leading-tight italic tracking-tighter">
                UNLEASH THE <br /><span className="text-red-600 underline underline-offset-8 decoration-4">EXPERIENCE</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-black/50 p-8 rounded-3xl border border-white/5 shadow-inner">
                  <span className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Premium Access</span>
                  <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2.5 bg-white/5 text-gray-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                    <ShieldCheck size={16} className="text-red-600" /> Secure Protocol
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                    <span>{config.orderFormText?.quantityLabel || 'QUANTITY'}</span>
                    <div className="flex items-center gap-4 bg-gray-800 rounded p-1">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                        className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center hover:bg-blue-600 text-white transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-lg text-white">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                        className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center hover:bg-blue-600 text-white transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {config.productVariants && config.productVariants.length > 0 && (
                    <div>
                      <span className="text-sm font-bold text-gray-400 block mb-2">
                         {config.orderFormText?.variantLabel || 'SELECT VARIANT'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {config.productVariants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                            className={`px-3 py-2 rounded text-xs font-bold border transition-all ${
                              formData.selectedVariant?.id === variant.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
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

                  <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                    <span className="text-lg font-bold text-white">
                       {config.orderFormText?.totalLabel || 'TOTAL'}
                    </span>
                    <span className="text-3xl font-black text-blue-500">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                      placeholder={config.orderFormText?.namePlaceholder || "YOUR NAME"}
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    />
                    <input
                      type="tel"
                      required
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                      placeholder={config.orderFormText?.phonePlaceholder || "PHONE NUMBER"}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'dhaka'})}
                      className={`py-3 rounded-lg font-bold text-sm border transition-all ${
                        formData.division === 'dhaka' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {config.orderFormText?.insideDhakaLabel || 'INSIDE DHAKA'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'chittagong'})}
                      className={`py-3 rounded-lg font-bold text-sm border transition-all ${
                        formData.division !== 'dhaka' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {config.orderFormText?.outsideDhakaLabel || 'OUTSIDE DHAKA'}
                    </button>
                  </div>

                  <textarea
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 resize-none"
                    placeholder={config.orderFormText?.addressPlaceholder || "FULL ADDRESS"}
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-lg transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (config.orderFormText?.processingButtonText || 'PROCESSING...') : (
                      <>
                        <span>{config.orderFormText?.submitButtonText || 'CONFIRM ORDER'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    <ShieldCheck size={12} className="text-blue-500" />
                    <span>{config.orderFormText?.codLabel || 'Verified Safe Checkout'}</span>
                  </div>
                </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

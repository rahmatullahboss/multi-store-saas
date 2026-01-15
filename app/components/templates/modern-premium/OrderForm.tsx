import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function ModernPremiumOrderForm({
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
      <section className="py-32 bg-white text-center px-4">
        <div className="max-w-3xl mx-auto py-24 px-12 border-[16px] border-gray-50 rounded-[4rem]">
          <div className="w-24 h-24 bg-black text-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-950 mb-6 uppercase italic tracking-tighter">SUCCESS ACQUIRED</h2>
          <p className="text-2xl text-gray-400 mb-10 font-bold tracking-tight">Access Token: #<span className="text-gray-950">{fetcher.data?.orderNumber}</span></p>
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">Protocol Finalized</div>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-32 bg-[#FAFAFA]`}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center max-w-6xl mx-auto">
          <div className="space-y-16">
            <h2 className="text-5xl lg:text-8xl font-black text-gray-950 leading-[0.85] tracking-tighter uppercase italic">
              ACQUIRE <br /><span className="text-gray-300">PREMIUM</span>
            </h2>
            
            <div className="space-y-12">
              <div className="flex justify-between items-end border-b-2 border-gray-200 pb-8">
                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.5em]">Total Investment</span>
                <span className="text-6xl font-black text-gray-950 tracking-tighter">{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-gray-100 shadow-sm">
                  <ShieldCheck size={18} className="text-gray-950" /> Secure Encryption
                </div>
                <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-gray-100 shadow-sm">
                  <CreditCard size={18} className="text-gray-950" /> Priority Shipping
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                       {config.orderFormText?.quantityLabel || 'Quantity'}
                    </span>
                    <div className="flex items-center gap-4 bg-black/20 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                        className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-white text-gray-400 transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-lg font-bold text-white">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                        className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-white text-gray-400 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {config.productVariants && config.productVariants.length > 0 && (
                    <div className="pb-4 border-b border-white/10">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-3">
                         {config.orderFormText?.variantLabel || 'Select Option'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {config.productVariants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                              formData.selectedVariant?.id === variant.id
                                ? 'bg-amber-500 text-white border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'bg-black/20 text-gray-400 border-white/10 hover:border-white/30'
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

                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                       {config.orderFormText?.totalLabel || 'Total Amount'}
                    </span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">
                         {config.orderFormText?.nameLabel || 'FULL NAME'}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-amber-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-gray-600"
                        placeholder={config.orderFormText?.namePlaceholder || "Full Name"}
                        value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">
                         {config.orderFormText?.phoneLabel || 'PHONE'}
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-amber-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-gray-600"
                        placeholder={config.orderFormText?.phonePlaceholder || "Phone Number"}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'dhaka'})}
                      className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                        formData.division === 'dhaka' 
                          ? 'bg-amber-500 text-white border-amber-500' 
                          : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {config.orderFormText?.insideDhakaLabel || 'Inside Dhaka'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, division: 'chittagong'})}
                      className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                        formData.division !== 'dhaka' 
                          ? 'bg-amber-500 text-white border-amber-500' 
                          : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {config.orderFormText?.outsideDhakaLabel || 'Outside Dhaka'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">
                       {config.orderFormText?.addressLabel || 'ADDRESS'}
                    </label>
                    <textarea
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-amber-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-gray-600 resize-none"
                      placeholder={config.orderFormText?.addressPlaceholder || "Delivery Address"}
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xl rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10"
                  >
                    {isSubmitting ? (config.orderFormText?.processingButtonText || 'Processing...') : (
                      <>
                        <span>{config.orderFormText?.submitButtonText || 'CONFIRM ORDER'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <ShieldCheck size={12} className="text-amber-500" />
                    <span>{config.orderFormText?.codLabel || 'Secure Checkout'}</span>
                  </div>
                </form>
        </div>
      </div>
    </section>
  );
}

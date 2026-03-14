import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function ModernDarkOrderForm({
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
      <section className="py-24 bg-zinc-950 text-center px-4 border-t border-zinc-800">
        <div className="max-w-xl mx-auto bg-zinc-900 p-12 rounded-[3rem] border border-orange-500/20 shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-orange-500 mx-auto mb-8 animate-bounce" />
          <h2 className="text-4xl font-black text-white mb-4 uppercase">Success! ⚡</h2>
          <p className="text-xl text-zinc-400 mb-8 font-bold">Registration: #<span className="text-orange-500">{fetcher.data?.orderNumber}</span></p>
          <p className="text-zinc-500 uppercase tracking-widest text-xs">Our team will contact you within 24 hours.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-24 bg-zinc-950 relative overflow-hidden`}>
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 p-8 lg:p-16 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ring-1 ring-orange-500/20">
                <Truck size={14} /> Global Priority Shipping
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-white italic uppercase leading-[0.85] tracking-tighter">
                Ready for the <span className="text-orange-500 block">Upgrade?</span>
              </h2>
              
              <div className="space-y-4">
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                      {config.orderFormText?.quantityLabel || 'Select Quantity'}
                    </span>
                    <div className="flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                        className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all active:scale-90"
                      >
                        -
                      </button>
                      <span className="text-white text-2xl font-black w-4 text-center">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                        className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {config.productVariants && config.productVariants.length > 0 && (
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] block mb-3">
                         {config.orderFormText?.variantLabel || 'Choose Option'}
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {config.productVariants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                            className={`px-5 py-3 rounded-xl text-sm font-bold border transition-all ${
                              formData.selectedVariant?.id === variant.id
                                ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
                                : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {variant.name}
                            {variant.price && variant.price !== product.price && (
                              <span className="ml-2 text-[10px] opacity-60">
                                ({formatPrice(variant.price)})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                       {config.orderFormText?.totalLabel || 'Total Amount'}
                    </span>
                    <span className="text-3xl font-black text-white tracking-tight">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-zinc-950/30 p-4 rounded-xl border border-white/5 flex items-center justify-center gap-3">
                    <ShieldCheck className="text-orange-500" size={20} />
                    <span className="text-white font-bold text-xs uppercase">
                       {config.orderFormText?.secureCheckoutLabel || 'Secure Checkout'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-orange-500 outline-none transition-all placeholder:text-zinc-700"
                placeholder={config.orderFormText?.namePlaceholder || "YOUR FULL NAME"}
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
              <input
                type="tel"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-orange-500 outline-none transition-all placeholder:text-zinc-700"
                placeholder={config.orderFormText?.phonePlaceholder || "YOUR PHONE NUMBER"}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'dhaka'})}
                  className={`py-4 rounded-2xl font-bold border transition-all ${
                    formData.division === 'dhaka' 
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                      : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {config.orderFormText?.insideDhakaLabel || 'Inside Dhaka'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'chittagong'})}
                  className={`py-4 rounded-2xl font-bold border transition-all ${
                    formData.division !== 'dhaka' 
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                      : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {config.orderFormText?.outsideDhakaLabel || 'Outside Dhaka'}
                </button>
              </div>

              <textarea
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-white font-bold focus:border-orange-500 outline-none transition-all placeholder:text-zinc-700 resize-none"
                placeholder={config.orderFormText?.addressPlaceholder || "YOUR FULL SHIPPING ADDRESS"}
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full py-6 bg-orange-500 hover:bg-orange-400 text-white font-black text-2xl rounded-[1.5rem] transition-all active:scale-[0.97] shadow-[0_15px_40px_rgba(249,115,22,0.3)] flex items-center justify-center gap-4 italic"
              >
                {isSubmitting ? (config.orderFormText?.processingButtonText || 'PROCESSING...') : (
                  <>
                    {config.orderFormText?.submitButtonText || 'COMPLETE ORDER'}
                    <ArrowRight size={24} className="group-hover:translate-x-3 transition-all" />
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

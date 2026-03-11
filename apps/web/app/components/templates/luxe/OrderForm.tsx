import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';
import { sanitizeHtml } from "~/utils/sanitize";

export function LuxeOrderForm({
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
      <section className="py-24 bg-black text-center px-4 border-t border-amber-500/10">
        <div className="max-w-2xl mx-auto bg-zinc-950 p-16 rounded-3xl border border-amber-500/30">
          <CheckCircle2 className="w-20 h-20 text-amber-500 mx-auto mb-8 font-light" />
          <h2 className="text-3xl font-serif-display text-white mb-6 tracking-widest uppercase">Order Confirmed</h2>
          <p className="text-xl text-zinc-500 mb-8 font-light italic">Your acquisition number: #<span className="text-white">{fetcher.data?.orderNumber}</span></p>
          <p className="text-zinc-600 text-sm">Our concierge will contact you shortly to finalize the delivery details.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-24 bg-[#050505] relative`}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-12">
            <div>
              <span className="text-amber-500 text-xs uppercase tracking-[0.4em] mb-4 block">
                {config.orderFormText?.subheadline || 'Reservation'}
              </span>
              <h2 className="text-4xl lg:text-6xl font-serif-display text-white tracking-widest uppercase leading-none">
                {config.orderFormText?.headline ? (
                   <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.orderFormText.headline) }} />
                ) : (
                  <>Secure Your <span className="text-amber-200 block italic font-light mt-2">Selection</span></>
                )}
              </h2>
            </div>

            <div className="space-y-6 bg-zinc-900/50 p-10 rounded-2xl border border-white/5 backdrop-blur-md">
              <div className="flex justify-between items-center text-zinc-500 text-[10px] uppercase tracking-widest">
                <span>{config.orderFormText?.productPriceLabel || 'Value'}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 text-[10px] uppercase tracking-widest">
                <span>{config.orderFormText?.deliveryChargeLabel || 'Concierge Delivery'}</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="h-px bg-white/5 my-6" />
              <div className="flex justify-between items-end">
                <span className="text-amber-500 text-xs uppercase tracking-[0.3em]">{config.orderFormText?.totalLabel || 'Total Endowment'}</span>
                <span className="text-4xl font-light text-white tracking-tight">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-950/80 p-12 lg:p-16 rounded-[2.5rem] border border-white/5 relative shadow-3xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <span className="text-amber-200/50 text-[10px] uppercase tracking-widest">{config.orderFormText?.quantityLabel || 'Quantity Selection'}</span>
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                    className="w-12 h-12 rounded-full border border-white/10 text-white font-light flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-all"
                  >
                    -
                  </button>
                  <span className="text-white text-2xl font-light w-6 text-center">{formData.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                    className="w-12 h-12 rounded-full border border-white/10 text-white font-light flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {config.productVariants && config.productVariants.length > 0 && (
                <div className="border-b border-white/5 pb-6">
                  <span className="text-amber-200/50 text-[10px] uppercase tracking-widest block mb-4">{config.orderFormText?.variantLabel || 'Choice Selection'}</span>
                  <div className="flex flex-wrap gap-3">
                    {config.productVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                        className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all border ${
                          formData.selectedVariant?.id === variant.id
                            ? 'bg-amber-500 text-black border-amber-500 font-bold'
                            : 'bg-transparent text-zinc-500 border-white/10 hover:border-amber-500/50'
                        }`}
                      >
                        {variant.name}
                        {variant.price && variant.price !== product.price && (
                          <span className="ml-2 opacity-50 font-light">
                             • {formatPrice(variant.price)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-amber-200/50 text-[10px] uppercase tracking-widest ml-1">
                    {config.orderFormText?.nameLabel || 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black border-b border-white/10 px-0 py-4 text-white font-light focus:border-amber-500 outline-none transition-colors text-lg"
                    placeholder="Enter your name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-200/50 text-[10px] uppercase tracking-widest ml-1">
                     {config.orderFormText?.phoneLabel || 'Contact Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-black border-b border-white/10 px-0 py-4 text-white font-light focus:border-amber-500 outline-none transition-colors text-lg"
                    placeholder="Enter your phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'dhaka'})}
                  className={`py-5 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all border ${
                    formData.division === 'dhaka' 
                      ? 'bg-amber-500 text-black border-amber-500 font-bold' 
                      : 'bg-black text-zinc-500 border-white/10 hover:border-amber-500/50'
                  }`}
                >
                  {config.orderFormText?.insideDhakaLabel || 'Inside Dhaka'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'chittagong'})}
                  className={`py-5 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all border ${
                    formData.division !== 'dhaka' 
                      ? 'bg-amber-500 text-black border-amber-500 font-bold' 
                      : 'bg-black text-zinc-500 border-white/10 hover:border-amber-500/50'
                  }`}
                >
                   {config.orderFormText?.outsideDhakaLabel || 'Outside Dhaka'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-amber-200/50 text-[10px] uppercase tracking-widest ml-1">
                   {config.orderFormText?.addressLabel || 'Acquisition Address'}
                </label>
                <textarea
                  required
                  className="w-full bg-black border-b border-white/10 px-0 py-4 text-white font-light focus:border-amber-500 outline-none transition-colors text-lg resize-none"
                  placeholder="Enter full address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-6 rounded-xl font-bold uppercase tracking-[0.3em] text-sm transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-4 group"
              >
                {isSubmitting ? 'Finalizing...' : (
                  <>
                     {config.orderFormText?.submitButtonText || 'Confirm Selection'}
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
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

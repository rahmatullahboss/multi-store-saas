import { useFetcher } from '@remix-run/react';
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold focus:border-rose-500/50 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="Full Name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                />
                <input
                  type="tel"
                  required
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold focus:border-rose-500/50 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <textarea
                  required
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold focus:border-rose-500/50 outline-none transition-all placeholder:text-zinc-700 resize-none"
                  placeholder="Shipping Address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full py-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xl rounded-2xl transition-all active:scale-[0.98] shadow-[0_20px_60px_rgba(244,63,94,0.3)] flex items-center justify-center gap-4 italic"
              >
                {isSubmitting ? 'SECURELY SAVING...' : (
                  <>
                    SECURE ORDER
                    <ArrowRight size={22} className="group-hover:translate-x-3 transition-all" />
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

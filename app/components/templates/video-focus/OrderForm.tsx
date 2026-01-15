import { useFetcher } from '@remix-run/react';
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
              <input
                type="text"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-7 text-white font-bold focus:border-red-600/50 outline-none transition-all placeholder:text-gray-700 text-lg shadow-inner"
                placeholder="YOUR FULL NAME"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
              <input
                type="tel"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-7 text-white font-bold focus:border-red-600/50 outline-none transition-all placeholder:text-gray-700 text-lg shadow-inner"
                placeholder="ACTIVE PHONE NUMBER"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <textarea
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-7 text-white font-bold focus:border-red-600/50 outline-none transition-all placeholder:text-gray-700 text-lg shadow-inner resize-none"
                placeholder="SHIPPING LOCATION"
                rows={4}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full py-8 bg-red-600 hover:bg-red-700 text-white font-black text-2xl rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-red-900/40 flex items-center justify-center gap-5 uppercase tracking-[0.1em]"
              >
                {isSubmitting ? 'TRANSMITTING...' : (
                  <>
                    CONFIRM ACCESS
                    <ArrowRight size={28} className="group-hover:translate-x-4 transition-transform" />
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

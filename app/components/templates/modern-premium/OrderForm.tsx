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

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              required
              className="w-full bg-white border-2 border-gray-100 rounded-[2rem] px-10 py-8 text-gray-950 font-bold focus:border-black outline-none transition-all placeholder:text-gray-300 text-xl shadow-sm"
              placeholder="YOUR FULL NAME"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            />
            <input
              type="tel"
              required
              className="w-full bg-white border-2 border-gray-100 rounded-[2rem] px-10 py-8 text-gray-950 font-bold focus:border-black outline-none transition-all placeholder:text-gray-300 text-xl shadow-sm"
              placeholder="CONTACT PROTOCOL"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <textarea
              required
              className="w-full bg-white border-2 border-gray-100 rounded-[2rem] px-10 py-8 text-gray-950 font-bold focus:border-black outline-none transition-all placeholder:text-gray-300 text-xl shadow-sm resize-none"
              placeholder="DISTRIBUTION ADDRESS"
              rows={4}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full py-10 bg-black hover:bg-zinc-900 text-white font-black text-3xl rounded-[2.5rem] transition-all active:scale-[0.98] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-6 uppercase tracking-[0.1em] italic"
            >
              {isSubmitting ? 'SECURELY SAVING...' : (
                <>
                  CONFIRM NOW
                  <ArrowRight size={32} className="group-hover:translate-x-6 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

import { useFetcher } from '@remix-run/react';
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
                  <ShieldCheck size={20} /> Honest Pricing • Secure Connection
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-lg border border-green-100">
              <input
                type="text"
                required
                className="w-full bg-green-50/30 border border-green-100 rounded-2xl px-6 py-5 text-gray-900 font-medium focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Your Full Name"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
              <input
                type="tel"
                required
                className="w-full bg-green-50/30 border border-green-100 rounded-2xl px-6 py-5 text-gray-900 font-medium focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Active Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <textarea
                required
                className="w-full bg-green-50/30 border border-green-100 rounded-2xl px-6 py-5 text-gray-900 font-medium focus:border-green-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                placeholder="Shipping Address"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-green-200 flex items-center justify-center gap-4"
              >
                {isSubmitting ? 'SECURELY SAVING...' : (
                  <>
                    CONFIRM ORDER
                    <ArrowRight size={22} />
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

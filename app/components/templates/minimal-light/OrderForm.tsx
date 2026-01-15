import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function MinimalLightOrderForm({
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
    if (!formData.customer_name.trim()) errors.customer_name = 'বক্সটি পূর্ণ করুন';
    if (!formData.phone.trim()) errors.phone = 'বক্সটি পূর্ণ করুন';
    if (!formData.address.trim()) errors.address = 'বক্সটি পূর্ণ করুন';
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
      <section className="py-24 bg-white text-center px-4">
        <div className="max-w-2xl mx-auto py-20 px-10 border border-gray-100">
          <CheckCircle2 className="w-16 h-16 text-gray-900 mx-auto mb-8 stroke-1" />
          <h2 className="text-2xl font-bold text-gray-950 mb-4 tracking-tight uppercase">Order Confirmed</h2>
          <p className="text-gray-500 mb-8 font-medium">Your reference: #<span className="text-gray-900">{fetcher.data?.orderNumber}</span></p>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Processing Sequence Active</div>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-24 bg-gray-50`}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start max-w-6xl mx-auto">
          <div className="space-y-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tighter uppercase italic">
              Simple <br /> Acquisition
            </h2>
            
              <div className="space-y-10">
                <div className="space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {config.orderFormText?.quantityLabel || 'Quantity'}
                </span>
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-900 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-light w-8 text-center">{formData.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-900 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {config.productVariants && config.productVariants.length > 0 && (
                <div className="pb-6 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide block mb-3">
                      {config.orderFormText?.variantLabel || 'Option'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                    {config.productVariants.map((variant) => (
                        <button
                        key={variant.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                        className={`px-4 py-2 rounded-full text-sm transition-all border ${
                            formData.selectedVariant?.id === variant.id
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
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
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {config.orderFormText?.totalLabel || 'Total'}
                </span>
                <span className="text-3xl font-light text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
            </div>
              </div>
              </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 transition-all font-light"
                  placeholder={config.orderFormText?.namePlaceholder || "Full Name"}
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                />
                <input
                  type="tel"
                  required
                  className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 transition-all font-light"
                  placeholder={config.orderFormText?.phonePlaceholder || "Phone Number"}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'dhaka'})}
                  className={`py-3 rounded-lg text-sm font-medium transition-all border ${
                    formData.division === 'dhaka' 
                      ? 'border-gray-900 bg-gray-900 text-white' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {config.orderFormText?.insideDhakaLabel || 'Inside Dhaka'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, division: 'chittagong'})}
                  className={`py-3 rounded-lg text-sm font-medium transition-all border ${
                    formData.division !== 'dhaka' 
                      ? 'border-gray-900 bg-gray-900 text-white' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {config.orderFormText?.outsideDhakaLabel || 'Outside Dhaka'}
                </button>
              </div>

              <textarea
                required
                className="w-full bg-gray-50 border-0 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 transition-all resize-none font-light"
                placeholder={config.orderFormText?.addressPlaceholder || "Detailed Address"}
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gray-900 text-white font-medium text-lg rounded-lg hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (config.orderFormText?.processingButtonText || 'Processing') : (
                  <>
                    <span>{config.orderFormText?.submitButtonText || 'Place Order'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 uppercase tracking-widest">
                  {config.orderFormText?.codLabel || 'Cash on Delivery Available'}
              </p>
            </form>
        </div>
      </div>
    </section>
  );
}

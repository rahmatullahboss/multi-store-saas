/**
 * Minimal Clean Order Form - Apple-like Simplicity
 * 
 * UNIQUE STRUCTURE:
 * - Ultra minimal design
 * - Lots of whitespace
 * - Black/White only
 * - Single column focus
 */

import { useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import type { SectionProps } from '../_core/types';

export function MinimalCleanOrderForm({
  config,
  product,
  storeId,
  isPreview,
  formatPrice,
  landingPageId,
}: SectionProps) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    orderNumber?: string;
    upsellUrl?: string;
  }>();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as DivisionValue,
    quantity: 1,
    selectedVariant: config.productVariants?.[0] || null,
  });

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;

  const subtotal = (formData.selectedVariant?.price || product.price) * formData.quantity;
  const shippingCost = calculateShipping(
    config.shippingConfig || DEFAULT_SHIPPING_CONFIG,
    formData.division,
    subtotal
  ).cost;
  const totalPrice = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || !storeId) return;

    const submitData = new FormData();
    submitData.set('store_id', String(storeId));
    submitData.set('product_id', String(product.id));
    submitData.set('customer_name', formData.customer_name);
    submitData.set('phone', formData.phone);
    submitData.set('address', formData.address);
    submitData.set('division', formData.division);
    submitData.set('quantity', String(formData.quantity));
    if (formData.selectedVariant) submitData.set('variant_name', formData.selectedVariant.name);
    if (landingPageId) submitData.set('landing_page_id', String(landingPageId));

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
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-black mb-4">Done.</h2>
          <p className="text-gray-400 text-lg">Order #{fetcher.data?.orderNumber}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className="py-24 md:py-32 bg-white">
      <div className="max-w-md mx-auto px-4">
        
        {/* Simple heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-4">
            Order
          </h2>
          <p className="text-gray-400">
            Fill in your details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Quantity - Minimal */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <span className="text-gray-400 text-sm uppercase tracking-wider">Quantity</span>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-black transition-colors"
              >-</button>
              <span className="text-xl font-medium w-6 text-center">{formData.quantity}</span>
              <button
                type="button"
                onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-black transition-colors"
              >+</button>
            </div>
          </div>

          {/* Variants - Minimal */}
          {config.productVariants && config.productVariants.length > 0 && (
            <div className="py-4 border-b border-gray-100">
              <span className="text-gray-400 text-sm uppercase tracking-wider block mb-4">Option</span>
              <div className="flex flex-wrap gap-2">
                {config.productVariants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedVariant: variant })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.selectedVariant?.id === variant.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form fields - Ultra minimal */}
          <div className="space-y-4 pt-4">
            <input
              type="text"
              required
              className="w-full bg-transparent border-b border-gray-200 px-0 py-4 focus:border-black outline-none transition-colors text-black placeholder:text-gray-300"
              placeholder="Name"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            />

            <input
              type="tel"
              required
              className="w-full bg-transparent border-b border-gray-200 px-0 py-4 focus:border-black outline-none transition-colors text-black placeholder:text-gray-300"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <div className="flex gap-4 py-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'dhaka'})}
                className={`flex-1 py-3 rounded-full text-sm font-medium border transition-all ${
                  formData.division === 'dhaka'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-black'
                }`}
              >
                Dhaka
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, division: 'chittagong'})}
                className={`flex-1 py-3 rounded-full text-sm font-medium border transition-all ${
                  formData.division !== 'dhaka'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-black'
                }`}
              >
                Outside
              </button>
            </div>

            <textarea
              required
              className="w-full bg-transparent border-b border-gray-200 px-0 py-4 focus:border-black outline-none transition-colors resize-none text-black placeholder:text-gray-300"
              placeholder="Address"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          {/* Price - Minimal */}
          <div className="flex justify-between items-center py-6 border-t border-b border-gray-100 mt-8">
            <span className="text-gray-400 text-sm uppercase tracking-wider">Total</span>
            <span className="text-3xl font-bold text-black">{formatPrice(totalPrice)}</span>
          </div>

          {/* CTA - Black minimal */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full py-5 bg-black hover:bg-gray-900 text-white font-medium text-lg rounded-full transition-all flex items-center justify-center gap-3 mt-8"
          >
            {isSubmitting ? 'Processing...' : (
              <>
                Confirm Order
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>

          <p className="text-center text-gray-300 text-xs mt-6 tracking-wide">
            Cash on Delivery · Free Shipping
          </p>
        </form>
      </div>
    </section>
  );
}

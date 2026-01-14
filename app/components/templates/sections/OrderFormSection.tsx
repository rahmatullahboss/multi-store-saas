import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, User, Phone, MapPin, Truck, ShoppingCart, ShieldCheck } from 'lucide-react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { BD_DIVISIONS, calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import { OrderBumpsContainer } from '~/components/landing/OrderBumpCheckbox';
import type { SectionProps } from './types';

export function OrderFormSection({
  config,
  product,
  storeId,
  isPreview,
  formatPrice,
  theme,
  lang = 'bn',
  productVariants = [],
  orderBumps = [],
}: SectionProps & { 
  formatPrice: (price: number) => string, 
  storeId?: number,
  productVariants?: any[],
  orderBumps?: any[]
}) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    orderNumber?: string;
    upsellUrl?: string;
    error?: string;
    details?: Record<string, string[]>;
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
    if (!formData.customer_name.trim()) errors.customer_name = 'নাম দেওয়া আবশ্যক';
    if (!formData.phone.trim()) errors.phone = 'মোবাইল নম্বর দেওয়া আবশ্যক';
    if (!formData.address.trim()) errors.address = 'শিপিং ঠিকানা দেওয়া আবশ্যক';
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
      <section className="py-20 bg-emerald-50 text-center px-4">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border-4 border-emerald-500">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">অর্ডার সফল হয়েছে! 🎉</h2>
          <p className="text-xl text-gray-600 mb-6">আপনার অর্ডার নম্বর: #<span className="font-bold text-gray-900">{fetcher.data?.orderNumber}</span></p>
          <p className="text-gray-500">শীঘ্রই আমাদের প্রতিনিধি আপনাকে কল করে অর্ডারটি কনফার্ম করবেন।</p>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className={`py-16 ${theme.bgSecondary}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`${theme.cardBg} rounded-[2rem] shadow-2xl overflow-hidden border ${theme.cardBorder}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Product Info */}
            <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100">
              <h2 className={`text-3xl font-black ${theme.textPrimary} mb-8`}>🛒 অর্ডার সামারি</h2>
              
              <div className="flex gap-6 mb-8 bg-gray-50 p-6 rounded-2xl">
                <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                  <OptimizedImage src={product.imageUrl} alt={product.title} width={100} height={100} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className={`font-bold ${theme.textPrimary} text-lg mb-2`}>{product.title}</h3>
                  <p className="text-emerald-600 font-black text-2xl">{formatPrice(effectivePrice)}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>পণ্যের দাম ({formData.quantity} টি)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {selectedBumpIds.length > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>অর্ডার বাম্প এড-অনস</span>
                    <span>{formatPrice(bumpTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between">
                  <span className={`text-xl font-bold ${theme.textPrimary}`}>সর্বমোট</span>
                  <span className="text-2xl font-black text-emerald-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} /> আপনার নাম
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 transition shadow-sm ${validationErrors.customer_name ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="নাম লিখুন"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={16} /> মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    required
                    className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 transition shadow-sm ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="০১৭XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> সম্পূর্ণ ঠিকানা
                  </label>
                  <textarea
                    required
                    rows={3}
                    className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 transition shadow-sm ${validationErrors.address ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="বাসা/রোড, এলাকা, থানা, জেলা"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-black rounded-2xl shadow-xl hover:shadow-emerald-200 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-8"
                >
                  {isSubmitting ? 'প্রসেসিং হচ্ছে...' : (
                    <>
                      <ShoppingCart size={28} />
                      অর্ডার কনফার্ম করুন
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

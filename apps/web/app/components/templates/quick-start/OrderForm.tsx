import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { CheckCircle, Truck, ShoppingCart, Loader2, ShieldCheck, PhoneCall } from 'lucide-react';
import type { SectionProps } from '../_core/types';
import { calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import { toast } from 'sonner';

export function OrderForm({ config, product, theme, formatPrice, productVariants, orderBumps }: SectionProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    division: 'dhaka' as string,
    quantity: 1,
    selectedVariant: (productVariants && productVariants.length > 0) ? productVariants[0] : null,
  });

  const [shippingCost, setShippingCost] = useState(0);

  // Update shipping cost when division changes
  useEffect(() => {
    const calculation = calculateShipping(
      config.shippingConfig || DEFAULT_SHIPPING_CONFIG,
      formData.division,
      (formData.selectedVariant?.price || product.price) * formData.quantity
    );
    setShippingCost(calculation.cost);
  }, [formData.division, formData.quantity, formData.selectedVariant, config.shippingConfig, product.price]);

  // Price calculations
  const productPrice = formData.selectedVariant?.price || product.price;
  const subtotal = productPrice * formData.quantity;
  const total = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('অনুগ্রহ করে সব তথ্য দিন');
      return;
    }
  
    const form = new FormData();
    form.append('action', 'create_order');
    form.append('customerName', formData.name);
    form.append('customerPhone', formData.phone);
    form.append('shippingAddress', formData.address);
    form.append('division', formData.division);
    form.append('quantity', formData.quantity.toString());
    form.append('productId', product.id.toString());
    
    if (formData.selectedVariant) {
      form.append('variantId', formData.selectedVariant.id.toString());
      if(formData.selectedVariant.option1Name) form.append('variantName', `${formData.selectedVariant.option1Name}: ${formData.selectedVariant.option1Value}`);
    }

    // Submit via fetcher
    fetcher.submit(form, { method: 'post' });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#1D3557] to-[#0D1B2A]" id="order-form">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12 text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">📦 অর্ডার কনফার্ম করুন</h2>
          <p className="opacity-90 text-lg">অর্ডার করতে নিচের ফর্মে আপনার নাম, ঠিকানা ও মোবাইল নাম্বার লিখুন</p>
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-0">
            
            {/* Left Column: Product Info & Summary */}
            <div className="lg:col-span-5 bg-[#F8F9FA] p-8 md:p-10 border-r border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1D3557] mb-6 flex items-center gap-2">
                  <ShoppingCart className="text-[#E63946]" /> আপনার অর্ডার
                </h3>

                {/* Product Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                     <img src={product.imageUrl || "https://via.placeholder.com/100"} alt={product.title} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                     <h4 className="font-bold text-[#1D3557] line-clamp-2 text-lg leading-tight">{product.title}</h4>
                     {formData.selectedVariant && (
                        <p className="text-sm text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">
                          {formData.selectedVariant.option1Value} 
                          {formData.selectedVariant.option2Value && ` / ${formData.selectedVariant.option2Value}`}
                        </p>
                     )}
                     <p className="text-[#E63946] font-bold text-xl mt-1">{formatPrice(productPrice)}</p>
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="space-y-3 border-t border-gray-200 pt-6">
                   <div className="flex justify-between text-gray-600 text-lg">
                      <span>{config.orderFormText?.productPriceLabel || `প্রোডাক্ট প্রাইস (${formData.quantity}টি)`}</span>
                      <span className="font-bold text-[#1D3557]">{formatPrice(subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 text-lg">
                      <span>{config.orderFormText?.deliveryChargeLabel || 'ডেলিভারি চার্জ'}</span>
                      <span className="font-bold text-[#1D3557]">{shippingCost === 0 ? (config.orderFormText?.freeShippingText || 'ফ্রি') : formatPrice(shippingCost)}</span>
                   </div>
                   <div className="flex justify-between text-xl font-bold text-[#E63946] border-t-2 border-dashed border-gray-300 pt-3 mt-3">
                      <span>{config.orderFormText?.totalLabel || 'সর্বমোট'}</span>
                      <span>{formatPrice(total)}</span>
                   </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 space-y-4">
                 <div className="flex items-center gap-3 text-gray-700 font-medium p-3 bg-white rounded-lg border border-gray-100">
                    <ShieldCheck className="text-green-600 shrink-0" size={24} />
                    <span>{config.orderFormText?.authenticProductGuarantee || '১০০% অথেনটিক প্রোডাক্ট গ্যারান্টি'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700 font-medium p-3 bg-white rounded-lg border border-gray-100">
                    <Truck className="text-blue-600 shrink-0" size={24} />
                    <span>{config.orderFormText?.fastDelivery || 'দ্রুত সারা বাংলাদেশে ডেলিভারি'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700 font-medium p-3 bg-white rounded-lg border border-gray-100">
                    <PhoneCall className="text-[#E63946] shrink-0" size={24} />
                    <span>{config.orderFormText?.callForSupport || 'প্রয়োজনে কল করুন'}: {config.callNumber}</span>
                 </div>
              </div>
            </div>

            {/* Right Column: Input Form */}
            <div className="lg:col-span-7 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <h3 className="text-2xl font-bold text-[#1D3557] mb-6">{config.orderFormText?.billingInfoTitle || 'বিলিং তথ্য দিন'}</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1D3557]">{config.orderFormText?.nameLabel || 'আপনার নাম'} <span className="text-[#E63946]">*</span></label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 rounded-xl border-2 border-[#E5E5E5] focus:border-[#1D3557] focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder={config.orderFormText?.namePlaceholder || 'আপনার নাম'}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1D3557]">{config.orderFormText?.phoneLabel || 'মোবাইল নম্বর'} <span className="text-[#E63946]">*</span></label>
                    <input 
                      type="tel" 
                      required
                      className="w-full p-4 rounded-xl border-2 border-[#E5E5E5] focus:border-[#1D3557] focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder={config.orderFormText?.phonePlaceholder || '০১XXXXXXXXX'}
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D3557]">{config.orderFormText?.addressLabel || 'সম্পূর্ণ ঠিকানা'} <span className="text-[#E63946]">*</span></label>
                  <input 
                    type="text"
                    required
                    className="w-full p-4 rounded-xl border-2 border-[#E5E5E5] focus:border-[#1D3557] focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    placeholder={config.orderFormText?.addressPlaceholder || 'বাসা নং, রোড, এলাকা, থানা, জেলা'}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                
                {/* Delivery & Quantity Row */}
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                   <div className="space-y-2">
                     <label className="block text-sm font-bold text-[#1D3557]">{config.orderFormText?.deliveryAreaLabel || 'ডেলিভারি এলাকা'}</label>
                     <div className="flex flex-col gap-3">
                        <label className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-3 font-bold transition-all ${formData.division === 'dhaka' ? 'border-[#1D3557] bg-[#EAF2FF] text-[#1D3557]' : 'border-[#E5E5E5] bg-white text-gray-500'}`}>
                            <input 
                              type="radio" 
                              name="division" 
                              value="dhaka" 
                              checked={formData.division === 'dhaka'} 
                              onChange={() => setFormData({...formData, division: 'dhaka'})}
                              className="accent-[#1D3557] w-5 h-5" 
                            />
                            {config.orderFormText?.insideDhakaLabel || 'ঢাকার ভিতরে'}
                        </label>
                        <label className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-3 font-bold transition-all ${formData.division === 'other' ? 'border-[#1D3557] bg-[#EAF2FF] text-[#1D3557]' : 'border-[#E5E5E5] bg-white text-gray-500'}`}>
                            <input 
                              type="radio" 
                              name="division" 
                              value="other" 
                              checked={formData.division === 'other'} 
                              onChange={() => setFormData({...formData, division: 'other'})}
                              className="accent-[#1D3557] w-5 h-5" 
                            />
                            {config.orderFormText?.outsideDhakaLabel || 'ঢাকার বাইরে'}
                        </label>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="block text-sm font-bold text-[#1D3557]">{config.orderFormText?.quantityLabel || 'পরিমাণ'}</label>
                     <div className="flex items-center gap-0 h-[104px]">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                          className="w-16 h-full flex items-center justify-center bg-gray-100 border-y-2 border-l-2 border-gray-200 rounded-l-xl text-2xl font-bold hover:bg-gray-200 transition-colors"
                        >-</button>
                        <input 
                          type="number" 
                          value={formData.quantity}
                          readOnly
                          className="w-full h-full text-center text-3xl font-bold border-2 border-gray-200 text-[#1D3557]"
                        />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                          className="w-16 h-full flex items-center justify-center bg-gray-100 border-y-2 border-r-2 border-gray-200 rounded-r-xl text-2xl font-bold hover:bg-gray-200 transition-colors"
                        >+</button>
                     </div>
                   </div>
                </div>

                {/* Variant Selector */}
                {productVariants && productVariants.length > 0 && (
                  <div className="pt-2">
                     <label className="block text-sm font-bold text-[#1D3557] mb-3">ভ্যারিয়েন্ট:</label>
                     <div className="flex flex-wrap gap-3">
                        {productVariants.map(variant => (
                           <button
                             type="button"
                             key={variant.id}
                             onClick={() => setFormData({...formData, selectedVariant: variant})}
                             className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${formData.selectedVariant?.id === variant.id ? 'border-[#1D3557] bg-[#1D3557] text-white shadow-md transform scale-105' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                           >
                              {variant.option1Value}
                              {variant.option2Value && ` - ${variant.option2Value}`} 
                           </button>
                        ))}
                     </div>
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 text-xl font-bold rounded-xl text-white transition-all transform hover:-translate-y-1 hover:shadow-2xl shadow-lg bg-gradient-to-r from-[#E63946] to-[#C1121F] shadow-[#E63946]/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={28} />}
                    {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
                  </button>
                  <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> আপনার ইনফরমেশন ১০০% নিরাপদ থাকবে
                  </p>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

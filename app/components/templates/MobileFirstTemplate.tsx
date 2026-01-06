import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { DEFAULT_SHIPPING_CONFIG, calculateShipping, type DivisionValue } from '~/utils/shipping';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronDown, ChevronUp, ShoppingCart, 
  MapPin, Phone, User, Star, ArrowRight, Truck, ShieldCheck
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';

export function MobileFirstTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  isEditMode = false,
  onConfigChange,
}: TemplateProps) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    error?: string;
  }>();

  // Local config state for Magic Editor
  const [editableConfig, setEditableConfig] = useState(config);

  // Update when parent config changes
  useEffect(() => {
    setEditableConfig(config);
  }, [config]);

  // Magic Editor Update Handler
  const handleSectionUpdate = (sectionId: string, newData: unknown) => {
    const newConfig = { ...editableConfig, [sectionId]: newData };
    setEditableConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  
  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as DivisionValue,
    quantity: 1,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Checkout Logic
  const subtotal = product.price * formData.quantity;
  const shippingCost = calculateShipping(DEFAULT_SHIPPING_CONFIG, formData.division, subtotal).cost;
  const totalPrice = subtotal + shippingCost;
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.customer_name.trim()) errors.customer_name = 'আপনার নাম লিখুন';
    
    const bdPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    if (!formData.phone.trim()) errors.phone = 'মোবাইল নম্বর লিখুন';
    else if (!bdPhoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) errors.phone = 'সঠিক নম্বর দিন (১১ ডিজিট)';

    if (!formData.address.trim()) errors.address = 'সম্পূর্ণ ঠিকানা লিখুন';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || !storeId) return;
    if (!validateForm()) {
      document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    fetcher.submit(
      {
        store_id: storeId,
        product_id: product.id,
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        division: formData.division,
        quantity: formData.quantity,
      },
      { method: 'POST', action: '/api/create-order', encType: 'application/json' }
    );
  };

  // Redirect on Success
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.orderId) {
      window.location.href = `/thank-you/${fetcher.data.orderId}`;
    }
  }, [fetcher.data]);

  // Accordion State
  const [isDescOpen, setIsDescOpen] = useState(true);

  // Sticky Footer Logic (Show when form is NOT visible)
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const orderFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide footer when order form comes into view
        setIsFooterVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (orderFormRef.current) {
      observer.observe(orderFormRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-gray-900 bg-white pb-24 md:max-w-md md:mx-auto md:border-x md:border-gray-200 md:shadow-xl md:min-h-screen">
      
      {/* 1. PRODUCT CAROUSEL (Snap-x) */}
      <section className="relative w-full aspect-square bg-gray-50 overflow-hidden">
         {/* Discount Badge */}
         {discount > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
               -{discount}% OFF
            </div>
         )}
         
         <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            <div className="w-full h-full flex-shrink-0 snap-center">
              {product.imageUrl ? (
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-300">
                  <ShoppingCart size={64} />
                </div>
              )}
            </div>
            {/* Future: Map through product.images here if available */}
         </div>
      </section>

      <div className="px-5 pt-6">
        {/* 2. HEADLINE & PRICE */}
        <MagicSectionWrapper
            sectionId="hero"
            sectionLabel="Headline & Price"
            data={{ headline: editableConfig.headline, subheadline: editableConfig.subheadline }}
            onUpdate={(data) => handleSectionUpdate('hero', data)}
            isEditable={isEditMode}
        >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                {editableConfig.headline}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                 <Star size={16} className="text-amber-400 fill-amber-400" />
                 <span>4.9/5 রেটিং</span>
                 <span className="text-gray-300">|</span>
                 <span className="text-green-600">ইন স্টর্ক</span>
              </div>
            </div>
        </MagicSectionWrapper>

        {/* 3. PRODUCT DESCRIPTION ACCORDION */}
        <section className="mb-8 border-t border-b border-gray-100 py-4">
           <button 
             onClick={() => setIsDescOpen(!isDescOpen)}
             className="w-full flex items-center justify-between text-lg font-bold text-gray-900 mb-2"
           >
             <span>পণ্যের বিবরণ</span>
             {isDescOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </button>
           
           <AnimatePresence>
             {isDescOpen && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="text-base text-gray-600 leading-relaxed space-y-3 pb-2">
                    {editableConfig.subheadline && <p>{editableConfig.subheadline}</p>}
                    <p>{product.description}</p>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </section>

        {/* 4. TRUST BADGES (Compact) */}
        <section className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
               <Truck className="text-emerald-600 shrink-0" size={20} />
               <div className="text-xs">
                  <p className="font-bold text-gray-800">দ্রুত ডেলিভারি</p>
                  <p className="text-gray-500">২-৩ দিন</p>
               </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
               <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
               <div className="text-xs">
                  <p className="font-bold text-gray-800">গ্যারান্টিযুক্ত</p>
                  <p className="text-gray-500">১০০% আসল</p>
               </div>
            </div>
        </section>

        {/* 5. ORDER FORM */}
        <div id="order-form" ref={orderFormRef} className="bg-emerald-50 -mx-5 px-5 py-8 rounded-t-3xl shadow-inner">
           <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">অর্ডার কনফার্ম করুন</h2>
              <p className="text-sm text-gray-500 mt-1">আপনার নাম এবং ঠিকানা দিয়ে অর্ডার করুন</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                 <label className="text-sm font-semibold text-gray-700">আপনার নাম</label>
                 <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    placeholder="নাম লিখুন"
                    className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-base"
                 />
                 {validationErrors.customer_name && <p className="text-red-500 text-xs">{validationErrors.customer_name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                 <label className="text-sm font-semibold text-gray-700">মোবাইল নম্বর</label>
                 <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="017XXXXXXXX"
                    className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-base"
                 />
                 {validationErrors.phone && <p className="text-red-500 text-xs">{validationErrors.phone}</p>}
              </div>

              {/* Address */}
              <div className="space-y-1">
                 <label className="text-sm font-semibold text-gray-700">ঠিকানা</label>
                 <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="থানা, জেলা"
                    rows={2}
                    className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-base resize-none"
                 />
                 {validationErrors.address && <p className="text-red-500 text-xs">{validationErrors.address}</p>}
              </div>
              
              {/* Delivery Area */}
              <div className="space-y-2 pt-2">
                 <p className="text-sm font-semibold text-gray-700">ডেলিভারি এরিয়া নির্বাচন করুন</p>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'dhaka', label: 'ঢাকার ভিতরে', cost: DEFAULT_SHIPPING_CONFIG.insideDhaka },
                      { id: 'outside', label: 'ঢাকার বাইরে', cost: DEFAULT_SHIPPING_CONFIG.outsideDhaka }
                    ].map((option) => (
                       <button
                         key={option.id}
                         type="button"
                         onClick={() => setFormData({...formData, division: option.id as DivisionValue})}
                         className={`p-3 rounded-lg border text-left transition ${
                            formData.division === option.id 
                            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-700' 
                            : 'bg-white border-gray-200 text-gray-600'
                         }`}
                       >
                          <div className="font-bold text-sm">{option.label}</div>
                          <div className="text-xs mt-0.5">চার্জ: ৳{option.cost}</div>
                       </button>
                    ))}
                 </div>
              </div>

              {/* Summary */}
              <div className="bg-white p-4 rounded-xl border border-dashed border-emerald-200 space-y-2 mt-4">
                 <div className="flex justify-between text-sm text-gray-600">
                    <span>পণ্যের মূল্য</span>
                    <span>{formatPrice(subtotal)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span>{formatPrice(shippingCost)}</span>
                 </div>
                 <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-lg text-gray-900">
                    <span>সর্বমোট</span>
                    <span className="text-emerald-600">{formatPrice(totalPrice)}</span>
                 </div>
              </div>

              {/* Submit Button (In Form) */}
              <button
                type="submit"
                disabled={fetcher.state === 'submitting'}
                className="w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                 {fetcher.state === 'submitting' ? 'অর্ডার হচ্ছে...' : (
                    <>
                       <span>অর্ডার কনফার্ম করুন</span>
                       <ArrowRight size={20} />
                    </>
                 )}
              </button>
           </form>
        </div>
      </div>

      {/* STICKY FOOTER (Mobile Only Action) */}
      <AnimatePresence>
        {isFooterVisible && (
           <motion.div 
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             exit={{ y: 100 }}
             className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden"
           >
              <div className="flex gap-3">
                 <button 
                    onClick={scrollToOrder}
                    className="flex-1 bg-emerald-600 text-white font-bold text-lg h-[50px] rounded-xl flex items-center justify-center gap-2 shadow-emerald-500/30 shadow-lg active:scale-95 transition-transform"
                 >
                    <span>অর্ডার করুন</span>
                    <span className="bg-emerald-700 px-2 py-0.5 rounded text-sm min-w-[60px]">
                      {formatPrice(totalPrice)}
                    </span>
                 </button>
                 <a 
                    href={`tel:017XXXXXXXX`} // Replace with real phone
                    className="h-[50px] w-[50px] bg-red-100 text-red-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                 >
                    <Phone size={24} />
                 </a>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

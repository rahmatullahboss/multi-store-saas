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

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

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
    <div className="font-sans text-gray-900 bg-white pb-24 md:pb-8 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* HERO SECTION - Product Image + Details Side by Side on Desktop */}
      <div className="md:max-w-6xl md:mx-auto md:px-6 md:py-8">
        <div className="md:flex md:gap-8 md:items-start">
          
          {/* Product Image - Full width mobile, half width desktop */}
          <section className="relative w-full md:w-1/2 aspect-square bg-gray-50 overflow-hidden md:rounded-2xl md:shadow-lg md:sticky md:top-8">
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
             </div>
          </section>

          {/* Product Details - Desktop Right Column */}
          <div className="md:w-1/2 px-5 pt-6 md:px-0 md:pt-0">
            
            {/* HEADLINE & PRICE */}
            <MagicSectionWrapper
                sectionId="hero"
                sectionLabel="Headline & Price"
                data={{ headline: editableConfig.headline, subheadline: editableConfig.subheadline }}
                onUpdate={(data) => handleSectionUpdate('hero', data)}
                isEditable={isEditMode}
            >
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                    {editableConfig.headline}
                  </h1>
                  
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-emerald-600">
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
                     <span className="text-green-600">ইন স্টক</span>
                  </div>
                </div>
            </MagicSectionWrapper>

            {/* PRODUCT DESCRIPTION ACCORDION */}
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

            {/* TRUST BADGES (Compact) */}
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

            {/* ORDER FORM */}
            <div id="order-form" ref={orderFormRef} className="bg-emerald-50 -mx-5 px-5 py-8 rounded-t-3xl shadow-inner md:mx-0 md:rounded-2xl md:shadow-lg">
               <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">অর্ডার কনফার্ম করুন</h2>
                  <p className="text-sm text-gray-500 mt-1">আপনার নাম এবং ঠিকানা দিয়ে অর্ডার করুন</p>
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
                     <p className="text-sm font-semibold text-gray-700">ডেলিভারি এরিয়া নির্বাচন করুন</p>
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
                    className="w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-emerald-700"
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
        </div>
      </div>

      {/* TESTIMONIALS - Horizontal Scroll Screenshots for Mobile */}
      {isSectionVisible('testimonials', editableConfig.hiddenSections) && editableConfig.testimonials && editableConfig.testimonials.length > 0 && (
        <section className="py-8 px-4 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">গ্রাহকদের রিভিউ</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {editableConfig.testimonials.slice(0, 3).map((testimonial, idx) => (
              <div key={idx} className="flex-shrink-0 w-48 snap-center">
                {(testimonial.imageUrl || testimonial.avatar) && (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img 
                      src={testimonial.imageUrl || testimonial.avatar} 
                      alt={`Review ${idx + 1}`} 
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ - Accordion for Mobile */}
      {isSectionVisible('faq', editableConfig.hiddenSections) && editableConfig.faq && editableConfig.faq.length > 0 && (
        <section className="py-8 px-5 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">সচরাচর জিজ্ঞাসা</h3>
          <div className="space-y-3">
            {editableConfig.faq.map((item, idx) => (
              <details key={idx} className="group bg-gray-50 rounded-xl overflow-hidden">
                <summary className="p-4 cursor-pointer flex items-center justify-between text-gray-800 text-sm font-medium">
                  <span className="pr-4">{item.question}</span>
                  <span className="text-emerald-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* GUARANTEE - Compact */}
      {isSectionVisible('guarantee', editableConfig.hiddenSections) && editableConfig.guaranteeText && (
        <section className="py-6 px-5 bg-emerald-50 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-2">
            <ShieldCheck size={20} />
            <span>আমাদের গ্যারান্টি</span>
          </div>
          <p className="text-emerald-600 text-sm">{editableConfig.guaranteeText}</p>
        </section>
      )}

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
                    href={`tel:017XXXXXXXX`}
                    className="h-[50px] w-[50px] bg-red-100 text-red-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                 >
                    <Phone size={24} />
                 </a>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      {editableConfig.whatsappEnabled && editableConfig.whatsappNumber && (
        <a
          href={`https://wa.me/${editableConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(editableConfig.whatsappMessage || `Hi, I'm interested in ${product.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}
      
    </div>
  );
}

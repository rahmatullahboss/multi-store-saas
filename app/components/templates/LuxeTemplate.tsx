import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { DEFAULT_SHIPPING_CONFIG, calculateShipping, type DivisionValue } from '~/utils/shipping';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Star, ArrowRight, ShieldCheck, Award, CreditCard, RefreshCw
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';

export function LuxeTemplate({
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

  return (
    <div className="font-sans text-white bg-black min-h-screen selection:bg-amber-500 selection:text-black">
      {/* 
        NOTE: Ideally we would load the font via a Link in the root, 
        but for dynamic templates we might need to inject it or assume it's global.
        For now, let's use a standard serif stack that looks decent, 
        or inject Google Fonts via style tag.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .font-serif-display { font-family: 'Playfair Display', serif; }
      `}</style>
      
      {/* 1. HERO SECTION (Ken Burns) */}
      <MagicSectionWrapper
        sectionId="hero"
        sectionLabel="Hero Section"
        data={{ headline: editableConfig.headline, subheadline: editableConfig.subheadline }}
        onUpdate={(data) => handleSectionUpdate('hero', data)}
        isEditable={isEditMode}
      >
        <section className="relative h-[80vh] min-h-[600px] overflow-hidden flex items-center justify-center">
            {/* Background Image with Ken Burns Effect */}
            <div className="absolute inset-0 z-0">
               {product.imageUrl ? (
                   <motion.div
                     initial={{ scale: 1 }}
                     animate={{ scale: 1.1 }}
                     transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                     className="w-full h-full"
                   >
                     <img 
                       src={product.imageUrl} 
                       alt="Background" 
                       className="w-full h-full object-cover opacity-60"
                     />
                   </motion.div>
               ) : (
                   <div className="w-full h-full bg-zinc-900" />
               )}
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
               <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
               >
                   <span className="inline-block text-amber-400 tracking-[0.3em] uppercase text-sm font-medium mb-6 border-b border-amber-400 pb-2">
                     Official Premium Collection
                   </span>
                   <h1 className="font-serif-display text-5xl md:text-7xl lg:text-8xl leading-none mb-6 text-white drop-shadow-2xl">
                     {editableConfig.headline}
                   </h1>
                   <p className="font-light text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 tracking-wide leading-relaxed">
                     {editableConfig.subheadline}
                   </p>
                   
                   <a 
                     href="#order-form"
                     className="group inline-flex items-center gap-4 px-10 py-4 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300"
                   >
                     <span>Secure Your Order</span>
                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </a>
               </motion.div>
            </div>
        </section>
      </MagicSectionWrapper>

      {/* 2. PRODUCT SHOWCASE (Minimal) */}
      <section className="py-24 bg-black text-center">
         <div className="container mx-auto px-6 max-w-4xl">
             <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                 <div className="flex-1 text-right">
                     <h3 className="font-serif-display text-4xl text-amber-500 mb-2">{formatPrice(product.price)}</h3>
                     <p className="text-zinc-500 uppercase tracking-widest text-sm">Exclusive Price</p>
                 </div>
                 
                 <div className="w-px h-24 bg-zinc-800 hidden md:block"></div>
                 
                 <div className="flex-1 text-left">
                     <div className="flex items-center gap-2 mb-2">
                        {[1,2,3,4,5].map(i => <Star key={i} size={20} className="text-amber-500 fill-amber-500" />)}
                     </div>
                     <p className="text-zinc-500 uppercase tracking-widest text-sm">5-Star Build Quality</p>
                 </div>
             </div>
             
             <div className="mt-20">
                <p className="text-xl md:text-2xl font-serif-display leading-relaxed text-zinc-300 italic">
                  "{product.description}"
                </p>
             </div>
         </div>
      </section>

      {/* 3. TRUST FACTORS (Gold Bordered Cards) */}
      <section className="py-20 bg-zinc-950">
         <div className="container mx-auto px-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { icon: <Award className="w-8 h-8" />, title: "Official Warranty", text: "Guaranteed authenticity" },
                   { icon: <RefreshCw className="w-8 h-8" />, title: "Easy Returns", text: "7-day seamless policy" },
                   { icon: <CreditCard className="w-8 h-8" />, title: "Cash On Delivery", text: "Pay after inspection" },
                 ].map((item, i) => (
                    <div key={i} className="p-8 border border-zinc-800 hover:border-amber-500/50 transition-colors duration-500 group">
                        <div className="text-zinc-500 group-hover:text-amber-500 transition-colors mb-6">
                           {item.icon}
                        </div>
                        <h4 className="font-serif-display text-xl mb-2 text-white">{item.title}</h4>
                        <p className="text-zinc-500 text-sm tracking-wide uppercase">{item.text}</p>
                    </div>
                 ))}
             </div>
         </div>
      </section>

      {/* 4. ORDER FORM (Elegant) */}
      <section id="order-form" className="py-24 bg-black relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-amber-500"></div>

          <div className="container mx-auto px-6 max-w-xl relative w-full">
              <div className="text-center mb-16">
                  <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Limited Availability</span>
                  <h2 className="font-serif-display text-4xl md:text-5xl mt-4 mb-6 text-white">Complete Purchase</h2>
                  <p className="text-zinc-500 font-light">Please provide your details below for priority processing.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name */}
                  <div className="group">
                     <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-amber-500 transition-colors">Full Name</label>
                     <input 
                       type="text" 
                       value={formData.customer_name}
                       onChange={e => setFormData({...formData, customer_name: e.target.value})}
                       className="w-full bg-transparent border-b border-zinc-700 py-3 text-xl text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-800"
                       placeholder="Enter your name"
                     />
                     {validationErrors.customer_name && <span className="text-red-500 text-xs mt-1 block">{validationErrors.customer_name}</span>}
                  </div>

                  {/* Phone */}
                  <div className="group">
                     <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-amber-500 transition-colors">Phone Number</label>
                     <input 
                       type="tel" 
                       value={formData.phone}
                       onChange={e => setFormData({...formData, phone: e.target.value})}
                       className="w-full bg-transparent border-b border-zinc-700 py-3 text-xl text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-800"
                       placeholder="017XXXXXXXX"
                     />
                     {validationErrors.phone && <span className="text-red-500 text-xs mt-1 block">{validationErrors.phone}</span>}
                  </div>

                  {/* Address */}
                  <div className="group">
                     <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-amber-500 transition-colors">Delivery Address</label>
                     <textarea 
                       value={formData.address}
                       onChange={e => setFormData({...formData, address: e.target.value})}
                       rows={2}
                       className="w-full bg-transparent border-b border-zinc-700 py-3 text-xl text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-800 resize-none"
                       placeholder="Full address details"
                     />
                     {validationErrors.address && <span className="text-red-500 text-xs mt-1 block">{validationErrors.address}</span>}
                  </div>

                  {/* Delivery Selection - Minimal Tabs */}
                  <div className="pt-4">
                     <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-4">Shipping Method</label>
                     <div className="flex border-b border-zinc-800">
                        {[
                           { id: 'dhaka', label: 'Inside Dhaka', price: DEFAULT_SHIPPING_CONFIG.insideDhaka },
                           { id: 'outside', label: 'Outside Dhaka', price: DEFAULT_SHIPPING_CONFIG.outsideDhaka }
                        ].map(opt => (
                           <button
                             key={opt.id}
                             type="button"
                             onClick={() => setFormData({...formData, division: opt.id as DivisionValue})}
                             className={`flex-1 pb-4 text-sm uppercase tracking-wider transition-colors relative ${
                                formData.division === opt.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                             }`}
                           >
                              {opt.label} — {formatPrice(opt.price)}
                              {formData.division === opt.id && (
                                <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                              )}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-baseline pt-8 pb-4 border-b border-zinc-800">
                      <span className="text-sm uppercase tracking-widest text-zinc-500">Total Payable</span>
                      <span className="text-3xl font-serif-display text-white">{formatPrice(totalPrice)}</span>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={fetcher.state === 'submitting'}
                    className="w-full bg-white text-black font-medium uppercase tracking-[0.2em] py-5 hover:bg-amber-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetcher.state === 'submitting' ? 'Processing...' : 'Confirm Order'}
                  </button>
                  
                  <p className="text-center text-zinc-600 text-xs tracking-wide">
                     <ShieldCheck size={12} className="inline mr-1" />
                     Secure encrypted checkout. Pay cash on delivery.
                  </p>
              </form>
          </div>
      </section>
    </div>
  );
}

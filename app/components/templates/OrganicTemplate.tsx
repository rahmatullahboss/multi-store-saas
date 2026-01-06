import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { DEFAULT_SHIPPING_CONFIG, calculateShipping, type DivisionValue } from '~/utils/shipping';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Leaf, Sprout, Heart, Droplets, ArrowRight, ShieldCheck, Star
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';

export function OrganicTemplate({
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
    <div className="font-sans text-stone-800 bg-stone-50 min-h-screen relative overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Background Pattern (Subtle Leaves) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 22.485l.828.83-1.415 1.415-.828-.828-.828.828L-2.24 22.485l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 54.627l.828.83-1.415 1.415-.828-.828-.828.828L-2.24 54.627l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM54.627 32.142l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 32.142l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM32.142 54.627l.828.83-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM32.142 22.485l.828.83-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM54.627 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828z' fill='%23059669' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }} />

      {/* 1. HERO SECTION */}
      <MagicSectionWrapper
        sectionId="hero"
        sectionLabel="Hero Section"
        data={{ headline: editableConfig.headline, subheadline: editableConfig.subheadline }}
        onUpdate={(data) => handleSectionUpdate('hero', data)}
        isEditable={isEditMode}
      >
        <section className="relative px-4 pt-8 pb-16 md:py-20">
           <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                 {/* Text Content */}
                 <div className="relative z-10 order-2 md:order-1 text-center md:text-left">
                     <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6">
                        <Leaf size={14} />
                        100% Natural & Eco-friendly
                     </span>
                     <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-950 leading-tight mb-6">
                       {editableConfig.headline}
                     </h1>
                     <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                       {editableConfig.subheadline}
                     </p>
                     
                     <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                        <span className="text-4xl font-bold text-emerald-700">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xl text-stone-400 line-through decoration-stone-400">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                        <a 
                          href="#order-form"
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-emerald-700/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          Shop Naturally <ArrowRight size={18} />
                        </a>
                     </div>
                 </div>

                 {/* Image */}
                 <div className="relative order-1 md:order-2">
                    {/* Organic Blob Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-200/30 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] z-0 animate-blob mix-blend-multiply filter blur-2xl"></div>
                    
                    <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white">
                       {product.imageUrl ? (
                         <OptimizedImage
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-auto object-cover"
                         />
                       ) : (
                         <div className="w-full aspect-square bg-stone-200 flex items-center justify-center">
                           <Leaf size={64} className="text-stone-400" />
                         </div>
                       )}
                       
                       {/* Stamp Overlay */}
                       <div className="absolute bottom-6 right-6 w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-emerald-600 shadow-lg rotate-12">
                          <div className="text-center">
                             <span className="block text-[10px] uppercase font-bold text-emerald-800 tracking-wider"> Pure &</span>
                             <span className="block text-sm font-black text-emerald-600">Natural</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </MagicSectionWrapper>

      {/* 2. NATURAL BENEFITS GRID */}
      <section className="py-16 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] border-t border-stone-100">
         <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-emerald-950 mb-4">Why It's Good For You</h2>
               <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: <Leaf />, title: "Eco Friendly", desc: "Sustainably sourced" },
                  { icon: <Heart />, title: "Healthy", desc: "Zero harmful properties" },
                  { icon: <Droplets />, title: "Pure", desc: "No artificial mixtures" },
                  { icon: <Sprout />, title: "Fresh", desc: "Direct from nature" },
                ].map((item, i) => (
                   <div key={i} className="text-center p-6 bg-stone-50 rounded-3xl hover:bg-emerald-50 transition-colors duration-300 group">
                      <div className="w-14 h-14 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform border border-emerald-100/50">
                         <div className="text-emerald-600">{item.icon}</div>
                      </div>
                      <h3 className="font-bold text-emerald-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-stone-500">{item.desc}</p>
                   </div>
                ))}
            </div>
         </div>
      </section>

      {/* 3. ORDER FORM (Soft & Rounded) */}
      <section id="order-form" className="py-20 px-4 bg-emerald-900/5">
        <div className="container mx-auto max-w-xl">
           <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-emerald-100/50 relative overflow-hidden">
               {/* Decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-[100%] -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

               <div className="text-center mb-10 relative z-10">
                   <h2 className="text-3xl font-bold text-emerald-950">Place Your Order</h2>
                   <p className="text-stone-500 mt-2">Experience nature's best, delivered to you.</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                   {/* Name */}
                   <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name</label>
                      <input 
                        type="text"
                        value={formData.customer_name}
                        onChange={e => setFormData({...formData, customer_name: e.target.value})}
                        className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Your name"
                      />
                      {validationErrors.customer_name && <p className="text-red-500 text-xs mt-1">{validationErrors.customer_name}</p>}
                   </div>

                   {/* Phone */}
                   <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Phone Number</label>
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="017XXXXXXXX"
                      />
                      {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
                   </div>

                   {/* Address */}
                   <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Address</label>
                      <textarea 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        rows={3}
                        className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                        placeholder="Delivery address"
                      />
                      {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}
                   </div>

                   {/* Shipping */}
                   <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-sm font-semibold text-emerald-900 mb-3">Shipping Area</p>
                      <div className="flex gap-4">
                         {[
                           { id: 'dhaka', label: 'Inside Dhaka', cost: DEFAULT_SHIPPING_CONFIG.insideDhaka },
                           { id: 'outside', label: 'Outside Dhaka', cost: DEFAULT_SHIPPING_CONFIG.outsideDhaka }
                         ].map(opt => (
                            <label key={opt.id} className="flex-1 cursor-pointer">
                               <input 
                                 type="radio" 
                                 name="division" 
                                 value={opt.id} 
                                 checked={formData.division === opt.id}
                                 onChange={() => setFormData({...formData, division: opt.id as DivisionValue})}
                                 className="sr-only peer"
                               />
                               <div className="text-center p-3 rounded-xl border border-transparent bg-white shadow-sm peer-checked:border-emerald-500 peer-checked:ring-1 peer-checked:ring-emerald-500 peer-checked:bg-emerald-50 transition-all">
                                  <div className="font-semibold text-sm text-stone-800">{opt.label}</div>
                                  <div className="text-xs text-emerald-600 font-bold mt-1">৳{opt.cost}</div>
                               </div>
                            </label>
                         ))}
                      </div>
                   </div>

                   {/* Total */}
                   <div className="flex justify-between items-center py-4 border-t border-stone-100">
                      <span className="text-stone-600 font-medium">Total Amount</span>
                      <span className="text-2xl font-bold text-emerald-700">{formatPrice(totalPrice)}</span>
                   </div>

                   {/* Submit */}
                   <button
                     type="submit"
                     disabled={fetcher.state === 'submitting'}
                     className="w-full bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 hover:shadow-emerald-800/20 active:scale-[0.98] transition-all"
                   >
                     {fetcher.state === 'submitting' ? 'Processing...' : 'Confirm Order Now'}
                   </button>
               </form>
           </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(-50%, -50%) rotate(0deg); }
          33% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(-50%, -50%) rotate(120deg); }
          66% { border-radius: 30% 70% 60% 40% / 50% 60% 30% 60%; transform: translate(-50%, -50%) rotate(240deg); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-blob {
          animation: blob 20s infinite linear;
        }
      `}</style>
    </div>
  );
}

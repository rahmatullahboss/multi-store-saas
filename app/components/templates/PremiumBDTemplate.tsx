import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { BD_DIVISIONS, calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import { CountdownTimer } from '~/components/landing';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Truck, ShieldCheck, RefreshCw, Banknote, 
  MapPin, Phone, User, ShoppingBag, Star, ChevronRight
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { repeat: Infinity, duration: 1.5 }
};

export function PremiumBDTemplate({
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

  // Sticky Footer Visibility
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const orderFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (orderFormRef.current) {
      observer.observe(orderFormRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans text-gray-900 bg-gray-50 pb-24 md:pb-0 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. HERO SECTION */}
      <MagicSectionWrapper
        sectionId="hero"
        sectionLabel="Hero Section"
        data={{ headline: editableConfig.headline, subheadline: editableConfig.subheadline }}
        onUpdate={(data) => handleSectionUpdate('hero', data)}
        isEditable={isEditMode}
      >
        <section className="relative pt-6 pb-12 overflow-hidden bg-white rounded-b-[3rem] shadow-sm md:pt-12">
          <div className="container max-w-4xl mx-auto px-4">
            
            {/* Urgent Badge */}
            {editableConfig.urgencyText && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-medium text-sm animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  {editableConfig.urgencyText}
                </div>
              </motion.div>
            )}

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-black text-center mb-4 leading-tight text-gray-900">
              {editableConfig.headline}
            </h1>
            
            {editableConfig.subheadline && (
              <p className="text-lg md:text-xl text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                {editableConfig.subheadline}
              </p>
            )}

            {/* Rating Snippet */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <span className="text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4">
                (১,৫০০+ কাস্টমার রিভিউ)
              </span>
            </div>

            {/* Product Image */}
            <div className="relative mx-auto mt-8 max-w-[500px]">
              {discount > 0 && (
                <div className="absolute -top-4 -right-4 z-10 bg-red-600 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold shadow-lg rotate-12">
                  <span className="text-xs">ছাড়</span>
                  <span className="text-lg leading-none">{discount}%</span>
                </div>
              )}
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-100 border-4 border-white">
                {product.imageUrl ? (
                  <OptimizedImage
                    src={product.imageUrl}
                    alt={product.title}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-300">
                    <ShoppingBag size={80} />
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button (Desktop) */}
            <div className="mt-10 text-center hidden md:block">
              <a href="#order-form" className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full font-bold text-xl shadow-xl shadow-emerald-200 hover:shadow-2xl hover:scale-105 transition transform">
                <span>অর্ডার করতে ক্লিক করুন</span>
                <ChevronRight />
              </a>
              <p className="mt-3 text-sm text-gray-500">স্টক সীমিত! দ্রুত অর্ডার করুন</p>
            </div>
          </div>
        </section>
      </MagicSectionWrapper>

      {/* 2. TRUST FACTORS (Glassmorphism) */}
      <section className="py-10 container max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck size={24} />, title: "দ্রুত ডেলিভারি", sub: "সারা বাংলাদেশে" },
            { icon: <Banknote size={24} />, title: "ক্যাশ অন ডেলিভারি", sub: "পণ্য হাতে পেয়ে পেমেন্ট" },
            { icon: <ShieldCheck size={24} />, title: "১০০% অরিজিনাল", sub: "গ্যারান্টিযুক্ত পণ্য" },
            { icon: <RefreshCw size={24} />, title: "৭ দিনের গ্যারান্টি", sub: "সহজ রিটার্ন পলিসি" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/70 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-2 hover:bg-white transition duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-1">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. VIDEO SECTION */}
      {editableConfig.videoUrl && (
        <MagicSectionWrapper 
          sectionId="video" 
          sectionLabel="Video" 
          data={{ videoUrl: editableConfig.videoUrl }}
          onUpdate={(newData: unknown) => handleSectionUpdate('video', newData)}
          isEditable={isEditMode}
        >
          <section className="py-12 bg-white">
            <div className="container max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">ভিডিওতে বিস্তারিত দেখুন</h2>
              <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-gray-100 bg-black">
                 {/* Simplified embed logic - reusing existing helper logic is better but inline for brevity */}
                 <iframe 
                   src={editableConfig.videoUrl.replace('youtu.be/', 'youtube.com/embed/').replace('watch?v=', 'embed/')} 
                   className="w-full h-full" 
                   allowFullScreen 
                   title="Product Video"
                 />
              </div>
            </div>
          </section>
        </MagicSectionWrapper>
      )}

      {/* 4. WHY YOU NEED THIS (Before/After) */}
      <section className="py-16 bg-gradient-to-br from-emerald-900 to-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">কেন এই পণ্যটি আপনার প্রয়োজন?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Pain Points */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold mb-6 text-red-300 flex items-center gap-2">
                <X className="bg-red-500/20 p-1 rounded-full" />
                সাধারণ সমস্যা
              </h3>
              <ul className="space-y-4">
                {[
                  "নিম্নমানের নকল পণ্য",
                  "ব্যবহার করা কঠিন ও জটিল",
                  "টাকা দিয়ে প্রতারিত হওয়ার ভয়",
                  "কোনো ওয়ারেন্টি নেই"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <X size={20} className="text-red-400 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="bg-emerald-500/20 backdrop-blur-sm p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                আমাদের সমাধান
              </div>
              <h3 className="text-xl font-bold mb-6 text-emerald-300 flex items-center gap-2">
                <Check className="bg-emerald-500/20 p-1 rounded-full" />
                {storeName} এর স্পেশালিটি
              </h3>
              <ul className="space-y-4">
                {[
                  "১০০% অরিজিনাল এবং প্রিমিয়াম",
                  "ব্যবহার করা অত্যন্ত সহজ",
                  "ক্যাশ অন ডেলিভারি সুবিধা",
                  "৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white font-medium">
                    <Check size={20} className="text-emerald-400 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ORDER FORM SECTION (Focus) */}
      <section id="order-form" ref={orderFormRef} className="py-16 bg-emerald-50/50">
        <div className="container max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
              <h2 className="text-2xl font-bold">অর্ডার কনফার্ম করতে<br/>নিচের ফর্মটি পূরণ করুন</h2>
              <p className="text-emerald-100 text-sm mt-2">কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করুন</p>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">আপনার নাম *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      placeholder="এখানে আপনার নাম লিখুন"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${validationErrors.customer_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-200'} focus:border-emerald-500 focus:ring-4 transition outline-none`}
                    />
                  </div>
                  {validationErrors.customer_name && <p className="text-red-500 text-xs mt-1">{validationErrors.customer_name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">মোবাইল নম্বর *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${validationErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-200'} focus:border-emerald-500 focus:ring-4 transition outline-none`}
                    />
                  </div>
                  {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">সম্পূর্ণ ঠিকানা *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="বাসা নং, রোড নং, থানা, জেলা"
                      rows={2}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${validationErrors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-200'} focus:border-emerald-500 focus:ring-4 transition outline-none resize-none`}
                    />
                  </div>
                  {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}
                </div>

                {/* Location select */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">ডেলিভারি এলাকা *</label>
                    <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'dhaka', label: 'ঢাকা সিটির ভিতরে', cost: DEFAULT_SHIPPING_CONFIG.insideDhaka },
                      { id: 'outside', label: 'ঢাকা সিটির বাইরে', cost: DEFAULT_SHIPPING_CONFIG.outsideDhaka }
                    ].map((option) => (
                      <div 
                        key={option.id}
                        onClick={() => setFormData({...formData, division: option.id as DivisionValue})}
                        className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center text-center transition ${formData.division === option.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                         <span className="font-bold text-sm">{option.label}</span>
                         <span className="text-xs text-gray-500 mt-1">চার্জ: ৳{option.cost}</span>
                      </div>
                    ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-dashed border-gray-300">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-600">পণ্যের মূল্য</span>
                      <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ডেলিভারি চার্জ</span>
                      <span className="font-semibold text-gray-900">{formatPrice(shippingCost)}</span>
                   </div>
                   <div className="border-t border-gray-200 pt-2 flex justify-between items-center mt-2">
                      <span className="font-bold text-gray-900">সর্বমোট</span>
                      <span className="font-bold text-xl text-emerald-600">{formatPrice(totalPrice)}</span>
                   </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={fetcher.state === 'submitting'}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xl py-4 rounded-xl shadow-lg shadow-orange-500/30 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {fetcher.state === 'submitting' ? 'অর্ডার প্রসেসিং হচ্ছে...' : (
                        <>
                         <span>অর্ডার কনফার্ম করুন</span>
                         <ChevronRight size={24} />
                        </>
                    )}
                  </span>
                  {/* Shimmer Effect */}
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MOBILE STICKY FOOTER */}
      <AnimatePresence>
        {isFooterVisible && (
          <motion.div 
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             exit={{ y: 100 }}
             className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-2xl z-50 md:hidden flex items-center gap-3 px-4"
          >
             <div className="flex-1">
               <p className="text-xs text-gray-500">সর্বমোট মূল্য</p>
               <p className="text-xl font-bold text-emerald-600 leading-none">{formatPrice(product.price)}</p>
             </div>
             <div>
               <a 
                 href="#order-form"
                 className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 animate-pulse"
               >
                 অর্ডার করুন
               </a>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Social Proof Toast */}
      {editableConfig.socialProof && (
          <SocialProofToast storeName={storeName} />
      )}

      <style>{`
        @keyframes shimmer {
          100% { left: 100% }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

// Separate component for Social Proof to manage its own state
function SocialProofToast({ storeName }: { storeName: string }) {
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState({ name: 'করিম সাহেব', location: 'ঢাকা' });

  useEffect(() => {
    // Show after 5 seconds
    const timer = setTimeout(() => setVisible(true), 5000);
    // Hide after showing for 4 seconds
    const hideTimer = setTimeout(() => setVisible(false), 9000);
    
    // Loop every 15 seconds
    const interval = setInterval(() => {
       const names = ['করিম', 'রহিম', 'সাদিয়া', 'তানভীর', 'আরিফ'];
       const locs = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা'];
       setInfo({
         name: names[Math.floor(Math.random() * names.length)],
         location: locs[Math.floor(Math.random() * locs.length)]
       });
       setVisible(true);
       setTimeout(() => setVisible(false), 4000);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, x: -50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-4 z-40 bg-white rounded-lg shadow-xl shadow-black/5 p-3 flex items-center gap-3 border border-gray-100 max-w-[280px]"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
            🛍️
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{info.name} অর্ডার করেছেন</p>
            <p className="text-xs text-gray-500">{info.location} থেকে • এইমাত্র</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

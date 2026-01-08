import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { BD_DIVISIONS, calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import { CountdownTimer } from '~/components/landing';
import { OrderBumpsContainer } from '~/components/landing/OrderBumpCheckbox';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Truck, ShieldCheck, RefreshCw, Banknote, 
  MapPin, Phone, User, ShoppingBag, Star, ChevronRight
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';
import { useCartTracking } from '~/hooks/useCartTracking';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

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
  
  // Cart tracking for abandoned cart recovery
  const { trackCart } = useCartTracking(storeId, product.id);
  
  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as DivisionValue,
    quantity: 1,
  });

  // Track cart when form data changes (for abandoned cart recovery)
  useEffect(() => {
    if (formData.phone || formData.customer_name) {
      trackCart({
        customer_name: formData.customer_name,
        customer_phone: formData.phone,
        quantity: formData.quantity,
      });
    }
  }, [formData.customer_name, formData.phone, formData.quantity, trackCart]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Selected order bump IDs
  const [selectedBumpIds, setSelectedBumpIds] = useState<number[]>([]);
  
  // Checkout Logic
  const subtotal = product.price * formData.quantity;
  const shippingCost = calculateShipping(DEFAULT_SHIPPING_CONFIG, formData.division, subtotal).cost;
  
  // Calculate bump products total
  const orderBumps = (config as any).orderBumps || [];
  const bumpTotal = selectedBumpIds.reduce((total, bumpId) => {
    const bump = orderBumps.find((b: any) => b.id === bumpId);
    if (!bump) return total;
    const originalPrice = bump.bumpProduct.price;
    const discountedPrice = bump.discount > 0 
      ? originalPrice * (1 - bump.discount / 100) 
      : originalPrice;
    return total + discountedPrice;
  }, 0);
  
  const totalPrice = subtotal + bumpTotal + shippingCost;
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
        bump_ids: selectedBumpIds.length > 0 ? selectedBumpIds : undefined,
      },
      { method: 'POST', action: '/api/create-order', encType: 'application/json' }
    );
  };

  // Redirect on Success - Check for upsell URL first
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.orderId) {
      if (fetcher.data?.upsellUrl) {
        window.location.href = fetcher.data.upsellUrl;
      } else {
        window.location.href = `/thank-you/${fetcher.data.orderId}`;
      }
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
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-center mb-4 leading-tight text-gray-900 px-2 tracking-tight">
              {editableConfig.headline}
            </h1>
            
            {editableConfig.subheadline && (
              <p className="text-base sm:text-lg md:text-xl text-center text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[
            { icon: <Truck size={24} />, title: "দ্রুত ডেলিভারি", sub: "সারা বাংলাদেশে" },
            { icon: <Banknote size={24} />, title: "ক্যাশ অন ডেলিভারি", sub: "পণ্য হাতে পেয়ে পেমেন্ট" },
            { icon: <ShieldCheck size={24} />, title: "১০০% অরিজিনাল", sub: "গ্যারান্টিযুক্ত পণ্য" },
            { icon: <RefreshCw size={24} />, title: "৭ দিনের গ্যারান্টি", sub: "সহজ রিটার্ন পলিসি" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/70 backdrop-blur-md border border-white/50 p-3 sm:p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-1 sm:gap-2 hover:bg-white transition duration-300 min-w-0 overflow-hidden">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-[11px] sm:text-base leading-tight break-words w-full">{item.title}</h3>
              <p className="text-[9px] sm:text-sm text-gray-500 leading-tight break-words w-full">{item.sub}</p>
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

      {/* GALLERY SECTION */}
      {isSectionVisible('gallery', editableConfig.hiddenSections) && editableConfig.galleryImages && editableConfig.galleryImages.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">পণ্যের ছবি গ্যালারি</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {editableConfig.galleryImages.map((url, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                  <OptimizedImage 
                    src={url} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS SECTION */}
      {isSectionVisible('benefits', editableConfig.hiddenSections) && editableConfig.benefits && editableConfig.benefits.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">কেন আমাদের থেকে কিনবেন?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editableConfig.benefits.map((benefit, idx) => (
                <div key={idx} className="bg-emerald-50 p-6 rounded-2xl text-center hover:shadow-lg transition">
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON SECTION */}
      {isSectionVisible('comparison', editableConfig.hiddenSections) && editableConfig.comparison && (editableConfig.comparison.beforeImage || editableConfig.comparison.afterImage) && (
        <section className="py-12 bg-gray-900">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-4">🔄 দেখুন পার্থক্য</h2>
            {editableConfig.comparison.description && (
              <p className="text-gray-400 text-center mb-8">{editableConfig.comparison.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editableConfig.comparison.beforeImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-red-500/50 shadow-lg mb-4">
                    <OptimizedImage 
                      src={editableConfig.comparison.beforeImage} 
                      alt="Before" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-red-500 text-white font-bold rounded-full shadow">
                    ❌ {editableConfig.comparison.beforeLabel || 'আগে'}
                  </span>
                </div>
              )}
              {editableConfig.comparison.afterImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-emerald-500/50 shadow-lg mb-4">
                    <OptimizedImage 
                      src={editableConfig.comparison.afterImage} 
                      alt="After" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-emerald-500 text-white font-bold rounded-full shadow">
                    ✅ {editableConfig.comparison.afterLabel || 'পরে'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL PROOF SECTION */}
      {isSectionVisible('social', editableConfig.hiddenSections) && editableConfig.socialProof && (editableConfig.socialProof.count > 0 || editableConfig.socialProof.text) && (
        <section className="py-8 bg-emerald-600">
          <div className="container max-w-4xl mx-auto px-4 text-center text-white">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl md:text-5xl font-bold">{editableConfig.socialProof.count}+</span>
              <span className="text-xl md:text-2xl">{editableConfig.socialProof.text}</span>
            </div>
          </div>
        </section>
      )}

      {/* 4. WHY YOU NEED THIS (Before/After) */}
      <section className="py-16 bg-gradient-to-br from-emerald-900 to-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">কেন এই পণ্যটি আপনার প্রয়োজন?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Pain Points */}
            <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10">
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
            <div className="bg-emerald-500/20 backdrop-blur-sm p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-emerald-500/30 shadow-2xl relative">
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

      {/* TESTIMONIALS - Screenshot Gallery Premium Style */}
      {isSectionVisible('testimonials', editableConfig.hiddenSections) && editableConfig.testimonials && editableConfig.testimonials.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">গ্রাহকদের রিভিউ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {editableConfig.testimonials.slice(0, 3).map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  {(testimonial.imageUrl || testimonial.avatar) && (
                    <img 
                      src={testimonial.imageUrl || testimonial.avatar} 
                      alt={`Customer review ${idx + 1}`} 
                      className="w-full aspect-[2/3] object-cover"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {isSectionVisible('faq', editableConfig.hiddenSections) && editableConfig.faq && editableConfig.faq.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">সচরাচর জিজ্ঞাসা</h2>
            <div className="space-y-4">
              {editableConfig.faq.map((item, idx) => (
                <details key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <summary className="p-5 cursor-pointer flex items-center justify-between text-gray-800 font-medium">
                    <span className="pr-4">{item.question}</span>
                    <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION - Premium BD Style */}
      {isSectionVisible('features', editableConfig.hiddenSections) && editableConfig.features && editableConfig.features.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">পণ্যের বৈশিষ্ট্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editableConfig.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{feature.title}</h3>
                  {feature.description && (
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY SECTION - Premium BD Style */}
      {isSectionVisible('delivery', editableConfig.hiddenSections) && (
        <section className="py-12 bg-gray-50">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">ডেলিভারি তথ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🏙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">ঢাকা সিটির ভিতরে</h3>
                    <p className="text-emerald-600 font-medium">২৪-৪৮ ঘণ্টায় ডেলিভারি</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> ডেলিভারি চার্জ: ৳৬০</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> সেম-ডে ডেলিভারি উপলব্ধ</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> ক্যাশ অন ডেলিভারি</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">ঢাকা সিটির বাইরে</h3>
                    <p className="text-blue-600 font-medium">২-৩ দিনে ডেলিভারি</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> ডেলিভারি চার্জ: ৳১২০</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> সারা বাংলাদেশে ডেলিভারি</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> কুরিয়ার সার্ভিস</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GUARANTEE SECTION - Premium BD Style */}
      {isSectionVisible('guarantee', editableConfig.hiddenSections) && editableConfig.guaranteeText && (
        <section className="py-12 bg-gradient-to-r from-emerald-50 to-teal-50 border-y border-emerald-100">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg border border-emerald-200">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">আমাদের গ্যারান্টি</h3>
            <p className="text-gray-600 text-lg">{editableConfig.guaranteeText}</p>
          </div>
        </section>
      )}

      {/* ORDER FORM SECTION - Full Width 2-Column (Last Section) */}
      <section id="order-form" ref={orderFormRef} className="py-16 bg-emerald-50/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">📝 অর্ডার কনফার্ম করুন</h2>
            <p className="text-xl text-gray-600">নিচের ফর্মটি পূরণ করুন, আমরা আপনাকে কল করব</p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Product Info */}
              <div className="space-y-6">
                {/* Product Summary */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      {product.imageUrl ? (
                        <OptimizedImage
                          src={product.imageUrl}
                          alt={product.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-xl">{product.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-emerald-600 font-black text-3xl">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-gray-400 line-through text-lg">{formatPrice(product.compareAtPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <label className="block text-sm font-bold text-gray-900 mb-3">পরিমাণ নির্বাচন করুন</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                      className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-50"
                    >-</button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">{formData.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                      className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-50"
                    >+</button>
                  </div>
                </div>

                {/* Order Bumps - Add-on Offers */}
                {orderBumps.length > 0 && (
                  <OrderBumpsContainer
                    bumps={orderBumps}
                    currency={currency}
                    selectedBumpIds={selectedBumpIds}
                    onSelectionChange={setSelectedBumpIds}
                  />
                )}

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 border border-gray-100">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">দ্রুত ডেলিভারি</p>
                      <p className="text-xs text-gray-500">২-৩ দিনে</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 border border-gray-100">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">ক্যাশ অন ডেলিভারি</p>
                      <p className="text-xs text-gray-500">পণ্য হাতে পেয়ে পেমেন্ট</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 border border-gray-100">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">সহজ রিটার্ন</p>
                      <p className="text-xs text-gray-500">৭ দিনের মধ্যে</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 border border-gray-100">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">১০০% অরিজিনাল</p>
                      <p className="text-xs text-gray-500">গ্যারান্টিযুক্ত</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Form */}
              <div>
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


      {/* WhatsApp Floating Button */}
      {editableConfig.whatsappEnabled && editableConfig.whatsappNumber && (
        <a
          href={`https://wa.me/${editableConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(editableConfig.whatsappMessage || `Hi, I'm interested in ${product.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Call Floating Button */}
      {editableConfig.callEnabled && editableConfig.callNumber && (
        <a
          href={`tel:${editableConfig.callNumber}`}
          className="fixed bottom-24 md:bottom-8 left-4 z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 animate-bounce"
          title="কল করুন"
        >
          <Phone className="w-7 h-7 text-white" />
        </a>
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

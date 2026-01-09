import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { DEFAULT_SHIPPING_CONFIG, calculateShipping, type DivisionValue } from '~/utils/shipping';
import { OrderBumpsContainer } from '~/components/landing/OrderBumpCheckbox';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Star, ArrowRight, ShieldCheck, Award, CreditCard, RefreshCw, Phone
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';
import { useCartTracking } from '~/hooks/useCartTracking';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

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
  
  // Checkout Logic - With Order Bumps
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
        <section className="relative h-[70vh] md:h-[80vh] min-h-[500px] md:min-h-[600px] overflow-hidden flex items-center justify-center">
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

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
               <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
               >
                   <span className="inline-block text-amber-400 tracking-[0.3em] uppercase text-sm font-medium mb-6 border-b border-amber-400 pb-2">
                     Official Premium Collection
                   </span>
                   <h1 className="font-serif-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-tight md:leading-none mb-4 md:mb-6 text-white drop-shadow-2xl">
                     {editableConfig.headline}
                   </h1>
                   <p className="font-light text-zinc-300 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 md:mb-10 tracking-wide leading-relaxed px-2 md:px-0">
                     {editableConfig.subheadline}
                   </p>
                   
                   <a 
                     href="#order-form"
                     className="group inline-flex items-center gap-3 md:gap-4 px-6 md:px-10 py-3 md:py-4 border border-white text-white uppercase tracking-wider md:tracking-widest text-xs md:text-sm hover:bg-white hover:text-black transition-all duration-300"
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
         <div className="container mx-auto px-4 md:px-6 max-w-4xl">
             <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24">
                 <div className="flex-1 text-right">
                     <h3 className="font-serif-display text-3xl md:text-4xl text-amber-500 mb-2">{formatPrice(product.price)}</h3>
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
      {isSectionVisible('trust', editableConfig.hiddenSections) && (
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
      )}

      {/* FEATURES SECTION - Luxe Style */}
      {isSectionVisible('features', editableConfig.hiddenSections) && editableConfig.features && editableConfig.features.length > 0 && (
        <section className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Features</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-4 text-white">Premium Qualities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {editableConfig.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 border border-zinc-800 hover:border-amber-500/50 transition-colors group text-center"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h4 className="font-serif-display text-xl mb-2 text-white">{feature.title}</h4>
                  {feature.description && (
                    <p className="text-zinc-500 text-sm">{feature.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEO SECTION - Luxe Style */}
      {isSectionVisible('video', editableConfig.hiddenSections) && editableConfig.videoUrl && (
        <section className="py-20 bg-zinc-950">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Preview</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-4 text-white">Watch In Detail</h2>
            </div>
            <div className="aspect-video rounded-sm overflow-hidden border border-zinc-800 shadow-2xl">
              {editableConfig.videoUrl.includes('youtube.com') || editableConfig.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={editableConfig.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title="Product Video"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={editableConfig.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL PROOF SECTION - Luxe Style */}
      {isSectionVisible('social', editableConfig.hiddenSections) && editableConfig.socialProof && (editableConfig.socialProof.count > 0 || editableConfig.socialProof.text) && (
        <section className="py-12 bg-black border-y border-zinc-800">
          <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-4 text-white">
              <Star size={20} className="text-amber-500 fill-amber-500" />
              <span className="text-4xl md:text-5xl font-serif-display">{editableConfig.socialProof.count}+</span>
              <span className="text-lg md:text-xl text-zinc-400 uppercase tracking-widest">{editableConfig.socialProof.text}</span>
              <Star size={20} className="text-amber-500 fill-amber-500" />
            </div>
          </div>
        </section>
      )}

      {/* 4. TESTIMONIALS (Screenshot Gallery - Elegant) */}
      {isSectionVisible('testimonials', editableConfig.hiddenSections) && editableConfig.testimonials && editableConfig.testimonials.length > 0 && (
        <section className="py-20 bg-zinc-950">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Real Reviews</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-4 text-white">What Our Customers Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {editableConfig.testimonials.slice(0, 3).map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black border border-zinc-800 rounded-lg overflow-hidden"
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

      {/* GALLERY SECTION (Elegant Grid) */}
      {isSectionVisible('gallery', editableConfig.hiddenSections) && editableConfig.galleryImages && editableConfig.galleryImages.length > 0 && (
        <section className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Gallery</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-4 text-white">Product Showcase</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {editableConfig.galleryImages.slice(0, 8).map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="aspect-square rounded-lg overflow-hidden border border-zinc-800 hover:border-amber-500/50 transition-colors"
                >
                  <OptimizedImage 
                    src={url} 
                    alt={`Product photo ${idx + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    width={300}
                    height={300}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS SECTION (Elegant Cards) */}
      {isSectionVisible('benefits', editableConfig.hiddenSections) && editableConfig.benefits && editableConfig.benefits.length > 0 && (
        <section className="py-20 bg-zinc-950">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Why Choose Us</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-4 text-white">Premium Benefits</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {editableConfig.benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 border border-zinc-800 hover:border-amber-500/50 transition-colors group"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                  <h4 className="font-serif-display text-xl mb-2 text-white">{benefit.title}</h4>
                  {benefit.description && (
                    <p className="text-zinc-500 text-sm">{benefit.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON SECTION (Elegant Before/After) */}
      {isSectionVisible('comparison', editableConfig.hiddenSections) && editableConfig.comparison && (editableConfig.comparison.beforeImage || editableConfig.comparison.afterImage) && (
        <section className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Comparison</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-4 text-white">See The Difference</h2>
              {editableConfig.comparison.description && (
                <p className="text-zinc-500 mt-4">{editableConfig.comparison.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {editableConfig.comparison.beforeImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-red-500/30 mb-4">
                    <OptimizedImage 
                      src={editableConfig.comparison.beforeImage} 
                      alt="Before" 
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-medium uppercase tracking-wider text-sm rounded">
                    {editableConfig.comparison.beforeLabel || 'Before'}
                  </span>
                </div>
              )}
              {editableConfig.comparison.afterImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-amber-500/50 mb-4">
                    <OptimizedImage 
                      src={editableConfig.comparison.afterImage} 
                      alt="After" 
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 font-medium uppercase tracking-wider text-sm rounded">
                    {editableConfig.comparison.afterLabel || 'After'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. DELIVERY INFO (Minimal) */}
      {isSectionVisible('delivery', editableConfig.hiddenSections) && (
      <section className="py-16 bg-black border-y border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-center">
            <div className="p-6">
              <div className="text-3xl mb-3">🏙️</div>
              <h4 className="font-serif-display text-xl text-white mb-2">Inside Dhaka</h4>
              <p className="text-zinc-500 text-sm">24-48 হাওয়ার মধ্যে ডেলিভারি</p>
              <p className="text-amber-500 font-bold mt-2">{formatPrice(DEFAULT_SHIPPING_CONFIG.insideDhaka)}</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-3">🌍</div>
              <h4 className="font-serif-display text-xl text-white mb-2">Outside Dhaka</h4>
              <p className="text-zinc-500 text-sm">২-৩ দিনের মধ্যে ডেলিভারি</p>
              <p className="text-amber-500 font-bold mt-2">{formatPrice(DEFAULT_SHIPPING_CONFIG.outsideDhaka)}</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 6. FAQ SECTION (Accordion Style) */}
      {isSectionVisible('faq', editableConfig.hiddenSections) && editableConfig.faq && editableConfig.faq.length > 0 && (
        <section className="py-20 bg-zinc-950">
          <div className="container mx-auto px-6 max-w-2xl">
            <div className="text-center mb-12">
              <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Questions</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-4 text-white">Frequently Asked</h2>
            </div>
            <div className="space-y-4">
              {editableConfig.faq.map((item, idx) => (
                <details key={idx} className="group border border-zinc-800 bg-black">
                  <summary className="p-6 cursor-pointer flex items-center justify-between text-white hover:text-amber-500 transition-colors">
                    <span className="font-medium">{item.question}</span>
                    <span className="text-amber-500 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-zinc-400 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. GUARANTEE SECTION */}
      {isSectionVisible('guarantee', editableConfig.hiddenSections) && editableConfig.guaranteeText && (
        <section className="py-16 bg-black">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
              <ShieldCheck className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="font-serif-display text-2xl md:text-3xl text-white mb-4">Our Guarantee</h3>
            <p className="text-amber-500 text-lg max-w-xl mx-auto">{editableConfig.guaranteeText}</p>
          </div>
        </section>
      )}

      {/* 8. ORDER FORM (Elegant - Full Width) */}
      <section id="order-form" className="py-24 bg-black relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-amber-500"></div>

          <div className="container mx-auto px-6 max-w-6xl relative w-full">
              <div className="text-center mb-16">
                  <span className="text-amber-500 tracking-[0.2em] uppercase text-xs font-bold">Limited Availability</span>
                  <h2 className="font-serif-display text-3xl md:text-4xl lg:text-5xl mt-4 mb-4 md:mb-6 text-white">Complete Purchase</h2>
                  <p className="text-zinc-500 font-light">Please provide your details below for priority processing.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Left Column - Product Info */}
                <div className="space-y-6">
                  {/* Product Summary */}
                  <div className="border border-zinc-800 rounded-sm p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-28 h-28 bg-zinc-900 rounded-sm overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <OptimizedImage
                            src={product.imageUrl}
                            alt={product.title}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-700">📦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-serif-display text-xl text-white">{product.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-amber-500 font-serif-display text-3xl">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-zinc-600 line-through text-lg">{formatPrice(product.compareAtPrice)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-zinc-500 text-sm">{product.description}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="border border-zinc-800 rounded-sm p-6">
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-4">Quantity</label>
                    <div className="flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                        className="w-12 h-12 border border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-amber-500 transition-colors text-xl"
                      >−</button>
                      <span className="text-2xl font-serif-display text-white w-12 text-center">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                        className="w-12 h-12 border border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-amber-500 transition-colors text-xl"
                      >+</button>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-zinc-800 rounded-sm p-4 flex items-center gap-3">
                      <span className="text-2xl text-amber-500">🚚</span>
                      <div>
                        <p className="text-white text-sm font-medium">Express Delivery</p>
                        <p className="text-xs text-zinc-600">2-3 Business Days</p>
                      </div>
                    </div>
                    <div className="border border-zinc-800 rounded-sm p-4 flex items-center gap-3">
                      <span className="text-2xl text-amber-500">💳</span>
                      <div>
                        <p className="text-white text-sm font-medium">Cash on Delivery</p>
                        <p className="text-xs text-zinc-600">Pay when received</p>
                      </div>
                    </div>
                    <div className="border border-zinc-800 rounded-sm p-4 flex items-center gap-3">
                      <span className="text-2xl text-amber-500">🔄</span>
                      <div>
                        <p className="text-white text-sm font-medium">Easy Returns</p>
                        <p className="text-xs text-zinc-600">7 Days Policy</p>
                      </div>
                    </div>
                    <div className="border border-zinc-800 rounded-sm p-4 flex items-center gap-3">
                      <span className="text-2xl text-amber-500">✅</span>
                      <div>
                        <p className="text-white text-sm font-medium">Authentic</p>
                        <p className="text-xs text-zinc-600">100% Genuine</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Form */}
                <div>
              <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name */}
                  <div className="group">
                     <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-amber-500 transition-colors">Full Name</label>
                     <input 
                       type="text" 
                       value={formData.customer_name}
                       onChange={e => setFormData({...formData, customer_name: e.target.value})}
                       className="w-full bg-transparent border-b border-zinc-700 py-3 text-base md:text-xl text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-800"
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
                       className="w-full bg-transparent border-b border-zinc-700 py-3 text-base md:text-xl text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-800"
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
                       className="w-full bg-transparent border-b border-zinc-700 py-3 text-base md:text-xl text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-800 resize-none"
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
                             className={`flex-1 pb-3 sm:pb-4 text-sm sm:text-base uppercase tracking-wide sm:tracking-wider transition-colors relative ${
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
            </div>
          </div>
      </section>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-zinc-800 p-4 shadow-2xl safe-area-pb">
        <a
          href="#order-form"
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-2 transition-colors"
        >
          Order Now — {formatPrice(product.price)}
        </a>
      </div>

      {/* Footer Spacer for Mobile */}
      <div className="md:hidden h-20" />

      {/* Footer */}
      <footer className="bg-black text-zinc-500 py-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-serif-display text-white mb-2">{storeName}</p>
          <p className="text-sm mb-4">© {new Date().getFullYear()} {t('allRightsReserved')}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs uppercase tracking-wider">
            <a href="/policies/privacy" className="hover:text-amber-500 transition">{t('privacyPolicy')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/terms" className="hover:text-amber-500 transition">{t('termsOfService')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/refund" className="hover:text-amber-500 transition">{t('refundPolicy')}</a>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      {editableConfig.whatsappEnabled && editableConfig.whatsappNumber && (
        <a
          href={`https://wa.me/${editableConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(editableConfig.whatsappMessage || `Hi, I'm interested in ${product.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 md:bottom-8 right-4 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
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
          className="fixed bottom-24 md:bottom-8 left-4 z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 animate-bounce"
          title="Call us"
        >
          <Phone className="w-7 h-7 text-white" />
        </a>
      )}
    </div>
  );
}

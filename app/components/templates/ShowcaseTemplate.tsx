
import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { DEFAULT_SHIPPING_CONFIG, calculateShipping, type DivisionValue } from '~/utils/shipping';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Star, ArrowRight, ShieldCheck, ShoppingBag, Truck, BadgeCheck, Clock, Camera, Phone
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';
import { useCartTracking } from '~/hooks/useCartTracking';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

export function ShowcaseTemplate({
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
  const [activeImage, setActiveImage] = useState(product.imageUrl);

  // Update when parent config changes
  useEffect(() => {
    setEditableConfig(config);
    if (product.imageUrl) setActiveImage(product.imageUrl);
  }, [config, product.imageUrl]);

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

  // Gallery Images - Fallback to product image if no extra images
  const galleryImages = [
    product.imageUrl,
    ...(editableConfig.productImages || []),
    ...(editableConfig.features?.map(f => f.icon).filter(i => i?.startsWith('http')) || []) // Fallback to feature icons if they are URLs
  ].filter(Boolean).slice(0, 4);

  return (
    <div className="font-sans text-white bg-[#0a0a0a] min-h-screen selection:bg-rose-500 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Manrope:wght@300;400;600;800&display=swap');
        .font-heading { font-family: 'Cinzel', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-rose-900/20 border-b border-rose-900/30 text-center py-2 px-4 backdrop-blur-sm">
        <p className="text-rose-200 text-xs md:text-sm tracking-widest uppercase font-medium">
          {editableConfig.urgencyText || "Premium Collection • Limited Stock Available"}
        </p>
      </div>

      {/* 2. MAIN HERO SECTION */}
      <MagicSectionWrapper
        sectionId="hero"
        sectionLabel="Hero Section"
        data={{ headline: editableConfig.headline, subheadline: editableConfig.subheadline }}
        onUpdate={(data) => handleSectionUpdate('hero', data)}
        isEditable={isEditMode}
      >
        <header className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20 px-4">
           {/* Background Elements */}
           <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.15)_0%,transparent_50%)] z-0" />
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt="Hero Background" 
                  className="w-full h-full object-cover opacity-20 blur-sm scale-105"
                />
              )}
           </div>

           <div className="relative z-20 container mx-auto text-center max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                  <div className="inline-flex items-center gap-2 border border-rose-500/30 rounded-full px-4 py-1 mb-8 bg-rose-950/30 backdrop-blur-md">
                    <Star size={12} className="text-rose-400 fill-rose-400" />
                    <span className="text-xs uppercase tracking-[0.2em] text-rose-200">New Arrival</span>
                    <Star size={12} className="text-rose-400 fill-rose-400" />
                  </div>

                  <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-rose-50 to-rose-200 drop-shadow-2xl">
                    {editableConfig.headline}
                  </h1>
                  
                  <p className="font-body text-zinc-400 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                    {editableConfig.subheadline}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <a 
                      href="#order-form"
                      className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold tracking-widest uppercase text-sm transition-all duration-300 shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:shadow-[0_0_50px_rgba(225,29,72,0.5)] flex items-center justify-center gap-3"
                    >
                      <span>Order Now</span>
                      <ArrowRight size={16} />
                    </a>
                    <span className="text-lg font-heading text-rose-400">
                       {formatPrice(product.price)}
                    </span>
                  </div>
              </motion.div>
           </div>
        </header>
      </MagicSectionWrapper>

      {/* 3. GALLERY SHOWCASE GRID */}
      <section className="py-20 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-4 md:px-6">
           <div className="text-center mb-16">
              <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Visual Perspective</span>
              <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">In Detail</h2>
           </div>

           {/* Featured Image Display */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px] mb-12">
              <div className="md:col-span-8 relative group overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={activeImage || product.imageUrl || ''}
                      alt="Product Detail"
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-8 left-8 right-8">
                     <h3 className="text-2xl font-heading text-white mb-2">{product.title}</h3>
                     <p className="text-zinc-400 line-clamp-2">{product.description}</p>
                  </div>
              </div>

              {/* Thumbnails / Grid */}
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 h-full">
                 {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative rounded-lg overflow-hidden border transition-all duration-300 h-full min-h-[150px] group ${
                        activeImage === img ? 'border-rose-500 opacity-100 ring-2 ring-rose-500/20' : 'border-zinc-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                       <img src={img || ''} alt={`View ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                       {activeImage === img && (
                         <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
                            <BadgeCheck className="text-rose-500 drop-shadow-md" size={32} />
                         </div>
                       )}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 4. FEATURES & DETAILS (Modern Cards) */}
      {isSectionVisible('features', editableConfig.hiddenSections) && editableConfig.features && (
         <section className="py-24 bg-[#0a0a0a]">
            <div className="container mx-auto px-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {editableConfig.features.map((feature, idx) => (
                     <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-8 hover:bg-zinc-900 transition-all duration-300 hover:border-rose-900/50 group">
                        <div className="w-12 h-12 bg-rose-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                           <Check className="text-rose-500" />
                        </div>
                        <h3 className="font-heading text-xl text-white mb-3">{feature.title}</h3>
                        <p className="font-body text-zinc-400 font-light leading-relaxed">{feature.description}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>
      )}

      {/* GALLERY SECTION - Showcase Style */}
      {isSectionVisible('gallery', editableConfig.hiddenSections) && editableConfig.galleryImages && editableConfig.galleryImages.length > 0 && (
        <section className="py-20 bg-[#0f0f0f]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Gallery</span>
              <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">More Views</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {editableConfig.galleryImages.slice(0, 8).map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="aspect-square rounded-lg overflow-hidden border border-zinc-800 hover:border-rose-500/50 transition-all duration-300 group"
                >
                  <img 
                    src={url} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS SECTION - Showcase Style */}
      {isSectionVisible('benefits', editableConfig.hiddenSections) && editableConfig.benefits && editableConfig.benefits.length > 0 && (
        <section className="py-20 bg-[#0a0a0a]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Benefits</span>
              <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">Why Choose This</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {editableConfig.benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-rose-500/50 transition-colors"
                >
                  <div className="w-14 h-14 bg-rose-900/20 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-heading text-xl text-white mb-2">{benefit.title}</h4>
                    {benefit.description && (
                      <p className="text-zinc-400 font-light">{benefit.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON SECTION - Showcase Style */}
      {isSectionVisible('comparison', editableConfig.hiddenSections) && editableConfig.comparison && (editableConfig.comparison.beforeImage || editableConfig.comparison.afterImage) && (
        <section className="py-20 bg-zinc-950">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="text-center mb-12">
              <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Transformation</span>
              <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">See The Difference</h2>
              {editableConfig.comparison.description && (
                <p className="text-zinc-400 mt-4">{editableConfig.comparison.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {editableConfig.comparison.beforeImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-red-500/50 mb-4 shadow-lg shadow-red-500/10">
                    <img 
                      src={editableConfig.comparison.beforeImage} 
                      alt="Before" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-red-600 text-white font-bold uppercase tracking-wider text-sm rounded">
                    ❌ {editableConfig.comparison.beforeLabel || 'Before'}
                  </span>
                </div>
              )}
              {editableConfig.comparison.afterImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-rose-500/50 mb-4 shadow-lg shadow-rose-500/10">
                    <img 
                      src={editableConfig.comparison.afterImage} 
                      alt="After" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-rose-600 text-white font-bold uppercase tracking-wider text-sm rounded">
                    ✅ {editableConfig.comparison.afterLabel || 'After'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TRUST BADGES SECTION - Showcase Style */}
      {isSectionVisible('trust', editableConfig.hiddenSections) && (
        <section className="py-16 bg-[#0a0a0a] border-y border-zinc-800/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-rose-500/30 transition-colors">
                <div className="text-3xl mb-3">🚚</div>
                <h4 className="text-white font-medium mb-1">Free Delivery</h4>
                <p className="text-zinc-500 text-sm">Inside Dhaka City</p>
              </div>
              <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-rose-500/30 transition-colors">
                <div className="text-3xl mb-3">💯</div>
                <h4 className="text-white font-medium mb-1">100% Original</h4>
                <p className="text-zinc-500 text-sm">Quality Guaranteed</p>
              </div>
              <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-rose-500/30 transition-colors">
                <div className="text-3xl mb-3">💵</div>
                <h4 className="text-white font-medium mb-1">Cash on Delivery</h4>
                <p className="text-zinc-500 text-sm">Pay when received</p>
              </div>
              <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-rose-500/30 transition-colors">
                <div className="text-3xl mb-3">🔄</div>
                <h4 className="text-white font-medium mb-1">Easy Returns</h4>
                <p className="text-zinc-500 text-sm">7 Days Policy</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL PROOF SECTION - Showcase Style */}
      {isSectionVisible('social', editableConfig.hiddenSections) && editableConfig.socialProof && (editableConfig.socialProof.count > 0 || editableConfig.socialProof.text) && (
        <section className="py-8 bg-gradient-to-r from-rose-900/30 via-rose-800/20 to-rose-900/30 border-y border-rose-500/20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 text-white">
              <Star size={20} className="text-rose-400 fill-rose-400" />
              <span className="text-3xl md:text-4xl font-heading font-bold">{editableConfig.socialProof.count}+</span>
              <span className="text-lg md:text-xl text-zinc-300">{editableConfig.socialProof.text}</span>
              <Star size={20} className="text-rose-400 fill-rose-400" />
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS SECTION - Showcase Style */}
      {isSectionVisible('testimonials', editableConfig.hiddenSections) && editableConfig.testimonials && editableConfig.testimonials.length > 0 && (
        <section className="py-20 bg-[#0f0f0f]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Reviews</span>
              <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">Customer Testimonials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {editableConfig.testimonials.slice(0, 3).map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-rose-500/30 transition-all duration-300"
                >
                  {(testimonial.imageUrl || testimonial.avatar) && (
                    <div className="aspect-[2/3] overflow-hidden">
                      <img 
                        src={testimonial.imageUrl || testimonial.avatar} 
                        alt={`Review from ${testimonial.name}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-rose-400 mb-2">
                      {'★'.repeat(5)}
                    </div>
                    {testimonial.text && (
                      <p className="text-zinc-400 text-sm mb-3 line-clamp-2">"{testimonial.text}"</p>
                    )}
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY SECTION - Showcase Style */}
      {isSectionVisible('delivery', editableConfig.hiddenSections) && (
        <section className="py-20 bg-[#0a0a0a]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Shipping</span>
              <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">Delivery Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-rose-900/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading text-white">Inside Dhaka</h3>
                    <p className="text-rose-400 font-medium">24-48 Hours</p>
                  </div>
                </div>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  <li className="flex items-center gap-2"><Check size={14} className="text-rose-400" /> Delivery: ৳60</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-rose-400" /> Same-day Available</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-rose-400" /> Cash on Delivery</li>
                </ul>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-rose-900/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading text-white">Outside Dhaka</h3>
                    <p className="text-rose-400 font-medium">2-3 Days</p>
                  </div>
                </div>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  <li className="flex items-center gap-2"><Check size={14} className="text-rose-400" /> Delivery: ৳120</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-rose-400" /> All Districts</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-rose-400" /> Courier Service</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION - Showcase Style */}
      {isSectionVisible('faq', editableConfig.hiddenSections) && editableConfig.faq && editableConfig.faq.length > 0 && (
        <section className="py-20 bg-[#0f0f0f]">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Support</span>
              <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {editableConfig.faq.map((item, idx) => (
                <details key={idx} className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-rose-500/30 transition-colors">
                  <summary className="p-5 cursor-pointer flex items-center justify-between text-white font-medium">
                    <span className="pr-4">{item.question}</span>
                    <span className="text-rose-400 group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-zinc-400 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GUARANTEE SECTION - Showcase Style */}
      {isSectionVisible('guarantee', editableConfig.hiddenSections) && editableConfig.guaranteeText && (
        <section className="py-16 bg-gradient-to-r from-rose-950/20 via-rose-900/10 to-rose-950/20 border-y border-rose-500/10">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-900/20 rounded-full mb-6 border border-rose-500/30">
              <ShieldCheck className="w-10 h-10 text-rose-400" />
            </div>
            <h3 className="font-heading text-2xl text-white mb-4">Our Promise</h3>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">{editableConfig.guaranteeText}</p>
          </div>
        </section>
      )}

      {/* 5. ORDER FORM SECTION (Distinctive) */}
      <section id="order-form" className="py-24 relative overflow-hidden bg-zinc-950">
         {/* Side Accent */}
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-900/5 to-transparent pointer-events-none" />

         <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
               {/* Left Column: Summary & Trust */}
               <div>
                  <h2 className="font-heading text-4xl md:text-5xl text-white mb-6 leading-tight">
                    Secure Your <br/>
                    <span className="text-rose-500">Order Today</span>
                  </h2>
                  <p className="font-body text-zinc-400 text-lg mb-10 font-light">
                    Complete the form to receive express delivery. Payment is required only upon receipt of your items.
                  </p>

                  <div className="space-y-6">
                     <div className="flex items-start gap-4 p-4 border border-zinc-800 bg-zinc-900/30 rounded-lg">
                        <Truck className="text-rose-500 shrink-0 mt-1" />
                        <div>
                           <h4 className="text-white font-medium mb-1">Fast Delivery</h4>
                           <p className="text-zinc-500 text-sm">24-48 hours inside Dhaka, 2-3 days outside.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-4 border border-zinc-800 bg-zinc-900/30 rounded-lg">
                        <ShieldCheck className="text-rose-500 shrink-0 mt-1" />
                        <div>
                           <h4 className="text-white font-medium mb-1">Cash on Delivery</h4>
                           <p className="text-zinc-500 text-sm">Pay securely after you receive and inspect your item.</p>
                        </div>
                     </div>
                  </div>

                  {/* Price Summary */}
                  <div className="mt-12 pt-8 border-t border-zinc-800">
                     <div className="flex justify-between items-center text-xl text-white mb-2">
                        <span>Product Price</span>
                        <span>{formatPrice(subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-zinc-400 mb-6">
                        <span>Shipping</span>
                        <span>{shippingCost === 0 ? 'Evaluating...' : formatPrice(shippingCost)}</span>
                     </div>
                     <div className="flex justify-between items-center text-3xl font-heading text-rose-500 font-bold">
                        <span>Total</span>
                        <span>{formatPrice(totalPrice)}</span>
                     </div>
                  </div>
               </div>

               {/* Right Column: The Form */}
               <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-2xl shadow-2xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Name */}
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
                        <input 
                           type="text" 
                           value={formData.customer_name}
                           onChange={e => setFormData({...formData, customer_name: e.target.value})}
                           className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-rose-500 rounded px-4 py-3 text-white outline-none transition-colors text-base"
                           placeholder="Your full name"
                        />
                        {validationErrors.customer_name && <span className="text-rose-500 text-xs mt-1 block">{validationErrors.customer_name}</span>}
                     </div>

                     {/* Phone */}
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Phone Number</label>
                        <input 
                           type="tel" 
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                           className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-rose-500 rounded px-4 py-3 text-white outline-none transition-colors text-base"
                           placeholder="017XXXXXXXX"
                        />
                        {validationErrors.phone && <span className="text-rose-500 text-xs mt-1 block">{validationErrors.phone}</span>}
                     </div>

                     {/* Address */}
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Delivery Address</label>
                        <textarea 
                           value={formData.address}
                           onChange={e => setFormData({...formData, address: e.target.value})}
                           rows={3}
                           className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-rose-500 rounded px-4 py-3 text-white outline-none transition-colors resize-none text-base"
                           placeholder="House, Road, Area, City..."
                        />
                        {validationErrors.address && <span className="text-rose-500 text-xs mt-1 block">{validationErrors.address}</span>}
                     </div>

                     {/* Delivery Options */}
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Delivery Zone</label>
                        <div className="grid grid-cols-2 gap-3">
                           {[
                              { id: 'dhaka', label: 'Inside Dhaka', price: DEFAULT_SHIPPING_CONFIG.insideDhaka },
                              { id: 'outside', label: 'Outside Dhaka', price: DEFAULT_SHIPPING_CONFIG.outsideDhaka }
                           ].map(opt => (
                              <button
                                 key={opt.id}
                                 type="button"
                                 onClick={() => setFormData({...formData, division: opt.id as DivisionValue})}
                                 className={`border rounded p-3 text-left transition-all relative ${
                                    formData.division === opt.id 
                                    ? 'border-rose-500 bg-rose-500/10 text-white' 
                                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                 }`}
                              >
                                 <div className="text-sm font-bold">{opt.label}</div>
                                 <div className="text-xs opacity-70">{formatPrice(opt.price)}</div>
                                 {formData.division === opt.id && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                                 )}
                              </button>
                           ))}
                        </div>
                     </div>

                     <button
                        type="submit"
                        disabled={fetcher.state === 'submitting'}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest py-4 rounded mt-4 transition-all duration-300 shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {fetcher.state === 'submitting' ? 'Processing...' : `Confirm Order - ${formatPrice(totalPrice)}`}
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>

      {/* 6. BRAND FOOTER */}
      <footer className="bg-black border-t border-zinc-900 py-12 text-center">
         <div className="container mx-auto px-6">
            <h3 className="font-heading text-2xl text-white mb-4">{storeName}</h3>
            <p className="text-zinc-600 text-sm max-w-md mx-auto mb-8">
               Experience premium quality and exceptional service. 
               We are dedicated to providing you with the best.
            </p>
            
            {/* Social / Contact Links would go here */}
            {editableConfig.whatsappEnabled && editableConfig.whatsappNumber && (
               <a 
                  href={`https://wa.me/${editableConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
               >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight size={14} />
               </a>
            )}
            
            <p className="text-zinc-800 text-xs mt-12">
               &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
         </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 p-4 pb-safe">
        <a
          href="#order-form"
          className="block w-full bg-rose-600 text-white text-center font-bold py-3 rounded uppercase tracking-wider"
        >
          Order Now
        </a>
      </div>
      <div className="md:hidden h-20" />

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

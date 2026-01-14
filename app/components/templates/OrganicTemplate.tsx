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
  Check, Leaf, Sprout, Heart, Droplets, ArrowRight, ShieldCheck, Star, Phone
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';
import { useCartTracking } from '~/hooks/useCartTracking';
import { getButtonStyles } from './theme-utils';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

export function OrganicTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  isEditMode = false,
  onConfigChange,
  planType = 'free',
}: TemplateProps) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    upsellUrl?: string;
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

    const submitData = new FormData();
    submitData.set('store_id', String(storeId));
    submitData.set('product_id', String(product.id));
    submitData.set('customer_name', formData.customer_name);
    submitData.set('phone', formData.phone);
    submitData.set('address', formData.address);
    submitData.set('division', formData.division);
    submitData.set('quantity', String(formData.quantity));
    if (selectedBumpIds.length > 0) {
      submitData.set('bump_ids', JSON.stringify(selectedBumpIds));
    }

    fetcher.submit(
      submitData,
      { method: 'POST', action: '/api/create-order' }
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
                     <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-emerald-950 leading-tight mb-4 md:mb-6">
                       {editableConfig.headline}
                     </h1>
                     <p className="text-base md:text-lg text-stone-600 mb-6 md:mb-8 leading-relaxed">
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
                          className="text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-sm md:text-base shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                          style={getButtonStyles(editableConfig.primaryColor)}
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

      {/* TRUST BADGES SECTION - Organic Style */}
      {isSectionVisible('trust', editableConfig.hiddenSections) && (
        <section className="py-12 bg-emerald-50/30 border-y border-emerald-100/50">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center p-4 md:p-6 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🚚</div>
                <h4 className="font-bold text-emerald-900 text-sm md:text-base">{t('freeDelivery')}</h4>
                <p className="text-xs text-stone-500 mt-1">{t('freeDeliveryInDhaka')}</p>
              </div>
              <div className="text-center p-4 md:p-6 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">💯</div>
                <h4 className="font-bold text-emerald-900 text-sm md:text-base">{t('originalProduct')}</h4>
                <p className="text-xs text-stone-500 mt-1">{t('originalGuarantee')}</p>
              </div>
              <div className="text-center p-4 md:p-6 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">💵</div>
                <h4 className="font-bold text-emerald-900 text-sm md:text-base">{t('cashOnDelivery')}</h4>
                <p className="text-xs text-stone-500 mt-1">{t('payOnReceive')}</p>
              </div>
              <div className="text-center p-4 md:p-6 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🔄</div>
                <h4 className="font-bold text-emerald-900 text-sm md:text-base">{t('easyReturn')}</h4>
                <p className="text-xs text-stone-500 mt-1">{t('returnPolicy')}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION - Organic Style */}
      {isSectionVisible('features', editableConfig.hiddenSections) && editableConfig.features && editableConfig.features.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-950 mb-4">{t('productFeatures')}</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editableConfig.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-emerald-100 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 mb-1">{feature.title}</h4>
                    {feature.description && (
                      <p className="text-stone-600 text-sm">{feature.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEO SECTION - Organic Style */}
      {isSectionVisible('video', editableConfig.hiddenSections) && editableConfig.videoUrl && (
        <section className="py-16 bg-emerald-900">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">🎬 {t('watchInVideo')}</h2>
              <p className="text-emerald-200">{t('watchVideoDetails')}</p>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-700">
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

      {/* SOCIAL PROOF SECTION - Organic Style */}
      {isSectionVisible('social', editableConfig.hiddenSections) && editableConfig.socialProof && (editableConfig.socialProof.count > 0 || editableConfig.socialProof.text) && (
        <section className="py-8 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 text-white">
              <Star size={20} className="text-yellow-300 fill-yellow-300" />
              <span className="text-3xl md:text-4xl font-bold">{editableConfig.socialProof.count}+</span>
              <span className="text-lg md:text-xl">{editableConfig.socialProof.text}</span>
              <Star size={20} className="text-yellow-300 fill-yellow-300" />
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY SECTION - Organic Style */}
      {isSectionVisible('delivery', editableConfig.hiddenSections) && (
        <section className="py-16 bg-stone-50">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-950 mb-4">{t('deliveryInfo')}</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900">{t('insideDhaka')}</h3>
                    <p className="text-emerald-600 font-medium">{t('within24Hours')}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-stone-600 text-sm">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {t('deliveryCharge')}: ৳60</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {t('onTimeDelivery')}</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {t('cashOnDelivery')}</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">{t('outsideDhaka')}</h3>
                    <p className="text-blue-600 font-medium">{t('twoToThreeDays')}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-stone-600 text-sm">
                  <li className="flex items-center gap-2"><Check size={14} className="text-blue-500" /> {t('deliveryCharge')}: ৳120</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-blue-500" /> {t('nationwideDelivery')}</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-blue-500" /> {t('courierService')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. TESTIMONIALS (Screenshot Gallery - Organic Style) */}
      {isSectionVisible('testimonials', editableConfig.hiddenSections) && editableConfig.testimonials && editableConfig.testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-950 mb-4">গ্রাহকদের মতামত</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editableConfig.testimonials.slice(0, 3).map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-stone-50 rounded-3xl overflow-hidden border border-stone-100 shadow-sm"
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

      {/* GALLERY SECTION (Organic Style) */}
      {isSectionVisible('gallery', editableConfig.hiddenSections) && editableConfig.galleryImages && editableConfig.galleryImages.length > 0 && (
        <section className="py-16 bg-stone-50">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-950 mb-4">📸 Product Gallery</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {editableConfig.galleryImages.slice(0, 8).map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <OptimizedImage 
                    src={url} 
                    alt={`Product photo ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS SECTION (Organic Cards) */}
      {isSectionVisible('benefits', editableConfig.hiddenSections) && editableConfig.benefits && editableConfig.benefits.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-950 mb-4">✅ Why Choose This?</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editableConfig.benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl flex-shrink-0 border border-emerald-100">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 mb-1">{benefit.title}</h4>
                    {benefit.description && (
                      <p className="text-stone-600 text-sm">{benefit.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON SECTION (Organic Before/After) */}
      {isSectionVisible('comparison', editableConfig.hiddenSections) && editableConfig.comparison && (editableConfig.comparison.beforeImage || editableConfig.comparison.afterImage) && (
        <section className="py-16 bg-emerald-900">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">🔄 See The Difference</h2>
              {editableConfig.comparison.description && (
                <p className="text-emerald-200">{editableConfig.comparison.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {editableConfig.comparison.beforeImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-red-400/50 shadow-lg mb-4">
                    <OptimizedImage 
                      src={editableConfig.comparison.beforeImage} 
                      alt="Before" 
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-red-500 text-white font-bold rounded-full shadow-md">
                    ❌ {editableConfig.comparison.beforeLabel || 'Before'}
                  </span>
                </div>
              )}
              {editableConfig.comparison.afterImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-emerald-400/50 shadow-lg mb-4">
                    <OptimizedImage 
                      src={editableConfig.comparison.afterImage} 
                      alt="After" 
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                    />
                  </div>
                  <span className="inline-block px-4 py-2 bg-emerald-500 text-white font-bold rounded-full shadow-md">
                    ✅ {editableConfig.comparison.afterLabel || 'After'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. FAQ SECTION */}
      {isSectionVisible('faq', editableConfig.hiddenSections) && editableConfig.faq && editableConfig.faq.length > 0 && (
        <section className="py-16 bg-emerald-50/50">
          <div className="container mx-auto px-6 max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-950 mb-4">Frequently Asked Questions</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="space-y-4">
              {editableConfig.faq.map((item, idx) => (
                <details key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm">
                  <summary className="p-5 cursor-pointer flex items-center justify-between text-stone-800 hover:text-emerald-700 transition-colors">
                    <span className="font-medium pr-4">{item.question}</span>
                    <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-stone-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. GUARANTEE */}
      {isSectionVisible('guarantee', editableConfig.hiddenSections) && editableConfig.guaranteeText && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-950 mb-4">Our Promise to You</h3>
            <p className="text-emerald-700 text-lg max-w-xl mx-auto">{editableConfig.guaranteeText}</p>
          </div>
        </section>
      )}

      {/* 6. ORDER FORM (Soft & Rounded - Full Width) */}
      <section id="order-form" className="py-20 px-4 bg-emerald-900/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-emerald-950">📝 Place Your Order</h2>
            <p className="text-stone-500 mt-2 text-lg">Experience nature's best, delivered to you.</p>
          </div>

          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl p-5 sm:p-8 md:p-12 border border-emerald-100/50 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-[100%] -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
              {/* Left Column - Product Info */}
              <div className="space-y-6">
                {/* Product Summary */}
                <div className="bg-gradient-to-br from-emerald-50 to-stone-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                      {product.imageUrl ? (
                        <OptimizedImage
                          src={product.imageUrl}
                          alt={product.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-emerald-100">🌿</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-emerald-950 text-xl">{product.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-emerald-600 font-black text-3xl">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-stone-400 line-through text-lg">{formatPrice(product.compareAtPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-stone-600 text-sm">{product.description}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200">
                  <label className="block text-sm font-semibold text-stone-700 mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                      className="w-12 h-12 rounded-2xl border border-stone-300 flex items-center justify-center text-xl font-bold text-stone-600 hover:bg-emerald-50 hover:border-emerald-300"
                    >−</button>
                    <span className="text-2xl font-bold text-emerald-950 w-12 text-center">{formData.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                      className="w-12 h-12 rounded-2xl border border-stone-300 flex items-center justify-center text-xl font-bold text-stone-600 hover:bg-emerald-50 hover:border-emerald-300"
                    >+</button>
                  </div>
                </div>

                {/* Trust Badges - Organic Style */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100">
                    <span className="text-2xl">🌿</span>
                    <div>
                      <p className="font-semibold text-emerald-900 text-sm">100% Natural</p>
                      <p className="text-xs text-stone-500">Pure & Organic</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <p className="font-semibold text-emerald-900 text-sm">Fast Delivery</p>
                      <p className="text-xs text-stone-500">2-3 Days</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100">
                    <span className="text-2xl">💚</span>
                    <div>
                      <p className="font-semibold text-emerald-900 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-stone-500">Pay when received</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className="font-semibold text-emerald-900 text-sm">Easy Returns</p>
                      <p className="text-xs text-stone-500">7 Days Policy</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Form */}
              <div>
               <form onSubmit={handleSubmit} className="space-y-6">
                   {/* Name */}
                   <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name</label>
                      <input 
                        type="text"
                        value={formData.customer_name}
                        onChange={e => setFormData({...formData, customer_name: e.target.value})}
                        className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-base"
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
                        className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-base"
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
                        className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-base"
                        placeholder="Delivery address"
                      />
                      {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}
                   </div>

                   {/* Shipping */}
                   <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-sm font-semibold text-emerald-900 mb-3">Shipping Area</p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                     className="w-full text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
                     style={getButtonStyles(editableConfig.primaryColor)}
                   >
                     {fetcher.state === 'submitting' ? 'Processing...' : 'Confirm Order Now'}
                   </button>
               </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 p-4 shadow-2xl safe-area-pb">
        <a
          href="#order-form"
          className="w-full py-4 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg"
          style={getButtonStyles(editableConfig.primaryColor)}
        >
          <Leaf size={18} /> Order Now — {formatPrice(product.price)}
        </a>
      </div>

      {/* Footer Spacer for Mobile */}
      <div className="md:hidden h-20" />

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

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 py-8 border-t border-emerald-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-semibold text-white mb-2">{storeName}</p>
          <p className="text-sm mb-4">© {new Date().getFullYear()} {t('allRightsReserved')}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a href="/policies/privacy" className="hover:text-white transition">{t('privacyPolicy')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/terms" className="hover:text-white transition">{t('termsOfService')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/refund" className="hover:text-white transition">{t('refundPolicy')}</a>
          </div>

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-6 border-t border-emerald-900 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=organic-campaign-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-emerald-400/60 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-emerald-100">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

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


import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { DEFAULT_SHIPPING_CONFIG, calculateShipping, type DivisionValue } from '~/utils/shipping';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Star, ArrowRight, ShieldCheck, ShoppingBag, Truck, BadgeCheck, Clock, Camera
} from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';

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
                           className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-rose-500 rounded px-4 py-3 text-white outline-none transition-colors"
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
                           className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-rose-500 rounded px-4 py-3 text-white outline-none transition-colors"
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
                           className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-rose-500 rounded px-4 py-3 text-white outline-none transition-colors resize-none"
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
    </div>
  );
}

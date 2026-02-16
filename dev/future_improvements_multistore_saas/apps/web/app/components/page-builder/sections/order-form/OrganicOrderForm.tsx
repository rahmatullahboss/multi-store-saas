import { motion } from 'framer-motion';
import { formatPrice } from '~/lib/theme-engine';
import type { OrderFormComponentProps } from './types';

import { OrderFormFields } from './OrderFormFields';
import { useOrderForm } from './useOrderForm';
import { MultiProductSelector, useMultiProductSelection } from './MultiProductSelector';

export function OrganicOrderForm({ 
  props, 
  theme, 
  storeId, 
  productId, 
  product, 
  selectedProducts = [], 
}: OrderFormComponentProps) {
  const typedProps = props as Record<string, unknown>;
  const enableComboDiscount = (typedProps.enableComboDiscount as boolean) ?? true;
  const comboDiscount2Products = (typedProps.comboDiscount2Products as number) ?? 10;
  const comboDiscount3Products = (typedProps.comboDiscount3Products as number) ?? 15;

  const multiProduct = useMultiProductSelection(selectedProducts, {
    enableComboDiscount,
    comboDiscount2Products,
    comboDiscount3Products,
  });

  const {
    isMultiProduct,
    selectedProductsData,
    comboDiscount,
    comboSavings,
    comboTotal,
    finalTotal: multiProductTotal,
    primaryProduct,
  } = multiProduct;

  // Use combo total if multiple selected
  const basePrice = isMultiProduct ? multiProductTotal : (primaryProduct?.price || product?.price || 1490);
  
  const effectiveProduct = primaryProduct ? {
    id: primaryProduct.id,
    title: selectedProductsData.length > 1 
      ? `${selectedProductsData.length}টি প্রোডাক্ট` 
      : primaryProduct.title,
    price: basePrice,
    compareAtPrice: selectedProductsData.reduce((sum, p) => sum + (p.compareAtPrice || p.price), 0),
    images: primaryProduct.imageUrl ? [primaryProduct.imageUrl] : [],
  } : product;

  const { fetcher, state, actions, calculations, props: orderProps } = useOrderForm(props, effectiveProduct);

  const cartItems = isMultiProduct
    ? selectedProductsData.map((p) => ({ product_id: p.id, quantity: state.quantity }))
    : undefined;

  const comboSummary = comboSavings > 0
    ? { savings: comboSavings, rate: Math.round(comboDiscount.rate * 100), discountedSubtotal: comboTotal }
    : undefined;

  const {
    headline = 'অর্ডার করুন',
    subheadline = 'আপনার তথ্য দিয়ে ফর্মটি পূরণ করুন',
  } = orderProps;

  // Theme-based styling
  const primaryColor = theme?.primaryColor || '#3f6212';
  const textColor = '#3f6212';
  const mutedColor = 'rgba(63, 98, 18, 0.7)';
  const inputBg = 'rgba(255, 255, 255, 0.6)';
  const inputBorder = 'rgba(63, 98, 18, 0.2)';

  return (
    <section id="order-form" className="relative py-24 bg-[#fefce8] overflow-hidden">
      {/* Background Leaves */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#3f6212]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#a3e635]/10 rounded-full blur-3xl" />

      {/* Decorative top wave/divider if coming from white section */}
      
      <div className="container-fluid mx-auto px-4 md:px-8 relative z-10 w-full max-w-[1600px]">
        <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[3rem] shadow-2xl shadow-[#3f6212]/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[800px]">
            
            {/* Left Side: Sticky Product Showcase */}
            <div className="relative bg-[#f7fee7] p-12 lg:p-20 flex flex-col justify-center overflow-hidden">
               {/* Pattern Overlay */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-multiply"></div>
               {/* Organic Gradient Blob */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d9f99d] rounded-full blur-[120px] opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

               <div className="relative z-10 sticky top-10">
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="mb-8"
                 >
                   <span className="px-5 py-2 bg-[#fefce8] text-[#d97706] text-sm font-black rounded-full uppercase tracking-[0.25em] shadow-sm border border-[#d97706]/10 inline-block mb-6">
                     Premium Selection
                   </span>
                   <h2 className="font-serif text-5xl lg:text-7xl font-bold text-[#3f6212] mb-6 leading-[1.1]">
                     {headline}
                   </h2>
                   <p className="text-[#3f6212]/80 text-xl lg:text-2xl leading-relaxed max-w-lg">
                     {subheadline}
                   </p>
                 </motion.div>

                 {/* Mega Product Card */}
                 {(product || primaryProduct) && (
                   <motion.div 
                     whileHover={{ scale: 1.02 }}
                     transition={{ duration: 0.5 }}
                     className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-[#3f6212]/5 border border-white/50 relative group"
                   >
                     <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#f5f5f4] mb-8">
                       {(primaryProduct?.imageUrl || product?.images?.[0]) ? (
                         <img 
                           src={primaryProduct?.imageUrl || product?.images?.[0]} 
                           alt={primaryProduct?.title || product?.title} 
                           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[#3f6212]/20">
                            <span className="text-6xl">🌿</span>
                         </div>
                       )}
                       
                       {/* Floating Price Tag */}
                       <div className="absolute top-6 right-6 bg-[#3f6212] text-white px-6 py-3 rounded-full shadow-lg shadow-[#3f6212]/30 backdrop-blur-md bg-opacity-90">
                         <span className="text-sm font-medium uppercase tracking-wider opacity-80 block text-[10px] mb-0.5">Price</span>
                         <span className="text-2xl font-bold">Tk {basePrice}</span>
                       </div>
                     </div>

                     <div className="space-y-4">
                       <h3 className="font-serif text-3xl font-bold text-[#1c1917]">
                         {primaryProduct?.title || product?.title}
                       </h3>
                       
                       <div className="flex flex-wrap gap-4 pt-4 border-t border-dashed border-[#3f6212]/20">
                         <div className="flex items-center gap-2 text-sm font-bold text-[#65a30d]">
                           <div className="w-6 h-6 rounded-full bg-[#ecfccb] flex items-center justify-center">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           </div>
                           সার্টিফাইড অর্গানিক
                         </div>
                         <div className="flex items-center gap-2 text-sm font-bold text-[#65a30d]">
                           <div className="w-6 h-6 rounded-full bg-[#ecfccb] flex items-center justify-center">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           </div>
                           ফ্রি ডেলিভারি
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </div>
            </div>

            {/* Right Side: Spacious Form */}
            <div className="relative bg-white/40 p-12 lg:p-20 flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full">
                {selectedProducts.length > 1 && (
                  <div className="mb-12">
                    <label className="flex items-center gap-3 text-sm font-black text-[#3f6212]/40 mb-6 uppercase tracking-[0.2em]">
                      <span className="w-8 h-[1px] bg-[#3f6212]/20"></span>
                      প্যাকেজ নির্বাচন করুন
                      <span className="flex-1 h-[1px] bg-[#3f6212]/20"></span>
                    </label>
                    <div className="transform scale-105 origin-left">
                      <MultiProductSelector 
                        selectedProducts={selectedProducts}
                        primaryColor={primaryColor}
                        textColor={textColor}
                        mutedColor={mutedColor}
                        inputBg={inputBg}
                        inputBorder={inputBorder}
                        enableComboDiscount={enableComboDiscount}
                        comboDiscount2Products={comboDiscount2Products}
                        comboDiscount3Products={comboDiscount3Products}
                      />
                    </div>
                  </div>
                )}
                
                <div className="bg-white/50 p-8 rounded-3xl border border-white shadow-xl shadow-[#3f6212]/5">
                   <div className="mb-8 text-center">
                     <h3 className="text-2xl font-bold text-[#3f6212] mb-2">শিপিং ডিটেইলস</h3>
                     <p className="text-sm text-[#3f6212]/60">আপনার সঠিক ঠিকানা এবং ফোন নাম্বার দিন</p>
                   </div>
                   
                    <OrderFormFields 
                      state={state}
                      actions={actions}
                      calculations={calculations}
                      props={orderProps}
                      fetcher={fetcher}
                      storeId={storeId}
                      productId={productId}
                      cartItems={cartItems}
                      comboSummary={comboSummary}
                      inputBg="#ffffff"
                      inputBorder="rgba(63, 98, 18, 0.15)"
                      inputText="#1c1917"
                      primaryColor={primaryColor}
                      mutedColor="#78716c"
                      textColor="#1c1917"
                      cardBorder="rgba(63, 98, 18, 0.1)"
                      isDark={false}
                      buttonBg="#3f6212"
                      buttonTextColor="#ffffff"
                    />
                </div>

                <div className="mt-10 flex justify-center items-center gap-8 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                   {/* Payment Logos / Trust Badges could go here */}
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3f6212]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Secure Payment
                   </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


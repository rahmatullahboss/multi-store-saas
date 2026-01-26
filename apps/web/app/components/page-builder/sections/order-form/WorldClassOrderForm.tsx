import { motion } from 'framer-motion';
import type { OrderFormComponentProps } from './types';
import { OrderFormFields } from './OrderFormFields';
import { useOrderForm } from './useOrderForm';

export function WorldClassOrderForm(props: OrderFormComponentProps) {
  const { product, storeId, selectedProducts } = props;
  
  // Initialize order form logic
  const orderForm = useOrderForm({
    storeId,
    productId: props.productId,
    product,
    selectedProducts
  });

  // Use product image or placeholder
  const productImage = product?.images?.[0] || 'https://placehold.co/600x600/f5f5f4/a8a29e?text=Product+Image';
  const productTitle = product?.title || 'Premium Product';
  const productPrice = product?.price || 0;
  const comparePrice = product?.compareAtPrice;

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Product Showcase */}
          <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="sticky top-10"
          >
            <div className="relative group">
               {/* Image Container with premium shadow */}
               <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-stone-100 aspect-square">
                  <img 
                    src={productImage} 
                    alt={productTitle}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  />
               </div>
               
               {/* Decorative elements behind image */}
               <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-amber-50 rounded-3xl -rotate-6 transition duration-500 group-hover:-rotate-3"></div>
               <div className="absolute -z-20 top-20 -left-20 w-full h-full bg-stone-50 rounded-3xl -rotate-12 transition duration-500 group-hover:-rotate-6"></div>
            </div>

            <div className="mt-10 text-center lg:text-left">
              <h2 className="text-4xl font-bold text-stone-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                {productTitle}
              </h2>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                 <span className="text-3xl font-bold text-amber-700">
                   {props.storeId ? `৳${productPrice}` : `$${productPrice}`}
                 </span>
                 {comparePrice && (
                   <span className="text-xl text-stone-400 line-through decoration-amber-300">
                     {props.storeId ? `৳${comparePrice}` : `$${comparePrice}`}
                   </span>
                 )}
                 {comparePrice && (
                   <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full">
                     Save {Math.round(((comparePrice - productPrice) / comparePrice) * 100)}%
                   </span>
                 )}
              </div>

              <div className="space-y-4 text-stone-600 max-w-lg">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  <p>Premium Quality Guarantee</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  <p>Fast & Secure Delivery</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  <p>24/7 Customer Support</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Order Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100 p-8 md:p-10"
          >
             <div className="mb-8 border-b border-stone-100 pb-6">
               <h3 className="text-2xl font-bold text-stone-800" style={{ fontFamily: '"Playfair Display", serif' }}>
                 Checkout Details
               </h3>
               <p className="text-stone-500 mt-2">Complete your order to start your journey.</p>
             </div>

             <OrderFormFields 
               {...props} 
               {...orderForm}
               // Premium Theme Styling Props
               inputBg="#FAFAF9" // stone-50
               inputBorder="#E7E5E4" // stone-200
               inputText="#1C1917" // stone-900
               primaryColor="#451a03" // amber-950
               mutedColor="#78716C" // stone-500
               textColor="#1C1917" // stone-900
               cardBorder="#E7E5E4" // stone-200
               isDark={false}
               buttonBg="linear-gradient(to right, #451a03, #d97706)" // amber-950 to amber-600
               buttonTextColor="#FFFFFF"
             />
             
             <div className="mt-8 flex items-center justify-center gap-2 text-stone-400 text-sm">
                <span className="w-4 h-4 bg-stone-200 rounded-full animate-pulse"></span>
                <span>Secure SSL Encrypted Transaction</span>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

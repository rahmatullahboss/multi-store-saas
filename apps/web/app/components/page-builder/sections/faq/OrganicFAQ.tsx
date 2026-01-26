import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FAQVariantProps } from './types';

export function OrganicFAQ({ title, items, badgeText }: FAQVariantProps & { badgeText?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-32 bg-[#fefce8] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-10 left-[-100px] w-[600px] h-[600px] bg-[#d9f99d]/20 rounded-full blur-[120px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
             <span className="inline-block px-4 py-1.5 rounded-full bg-[#ecfccb] text-[#3f6212] text-xs font-black uppercase tracking-[0.2em] mb-6">
               {badgeText || 'Support'}
             </span>
             <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3f6212] leading-tight">
               {title}
             </h2>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {items.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left p-6 md:p-8 rounded-[2rem] transition-all duration-300 flex items-start gap-4 ${
                  openIndex === index 
                    ? 'bg-[#3f6212] text-white shadow-xl shadow-[#3f6212]/20' 
                    : 'bg-white text-[#3f6212] hover:bg-[#f7fee7] border border-[#fefce8]'
                }`}
              >
                <div className={`mt-1 w-6 h-6 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-90' : 'rotate-0'}`}>
                  {openIndex === index ? (
                     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                  ) : (
                     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  )}
                </div>
                <div>
                   <span className={`text-lg md:text-xl font-bold font-serif block ${openIndex === index ? 'text-white' : 'text-[#3f6212]'}`}>
                     {faq.question}
                   </span>
                   <AnimatePresence>
                     {openIndex === index && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                         <p className="mt-4 text-white/80 leading-relaxed font-medium">
                           {faq.answer}
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Bottom Wave - Transition to next section (Cream) */}
       <div className="absolute bottom-[-2px] left-0 w-full overflow-hidden leading-[0] z-20">
         <svg className="relative block w-[calc(100%+1.3px)] h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
             {/* Wave color set to #fefce8 (Cream) - Next Section */}
             <rect width="100%" height="100%" fill="#fefce8" />
             {/* Path color set to #fefce8 (Cream) - Current Section */}
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#fefce8"></path>
         </svg>
       </div>
    </section>
  );
}

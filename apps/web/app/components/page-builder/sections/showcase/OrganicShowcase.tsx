import { motion } from 'framer-motion';
import { ShowcaseVariantProps } from './types';

export function OrganicShowcase({ title, features }: ShowcaseVariantProps) {
  return (
    <section className="relative py-32 bg-[#f7fee7] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d9f99d]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ecfccb]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Container */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
             <span className="text-[#3f6212] font-black uppercase tracking-[0.2em] text-xs mb-4 block">Why we are unique</span>
             <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3f6212] leading-tight max-w-2xl mx-auto">
               {title}
             </h2>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 text-center hover:bg-white/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
            >
              <div className="w-16 h-16 mx-auto bg-[#ecfccb] rounded-2xl flex items-center justify-center text-[#3f6212] mb-6 group-hover:scale-110 transition-transform duration-300">
                {/* Dynamically render icon based on index or title if needed, for now using generic premium icons */}
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#3f6212] mb-3 font-serif">{feature.title}</h3>
              <p className="text-[#3f6212]/70 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Bottom Wave - Transition to next section (Cream -> White) */}
      {/* Assuming next section (Testimonials) could be White or Cream. Let's make it White. */}
       <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-[calc(100%+1.3px)] h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
       </div>
    </section>
  );
}

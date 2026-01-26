import { motion } from 'framer-motion';
import { TestimonialsVariantProps } from './types';

export function OrganicTestimonials({ title, testimonials }: TestimonialsVariantProps) {
  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#f7fee7] to-white opacity-50"></div>
      <div className="absolute top-1/2 right-[-100px] w-96 h-96 bg-[#ecfccb]/30 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
             <span className="inline-block px-4 py-1.5 rounded-full bg-[#fefce8] text-[#d97706] text-xs font-black uppercase tracking-[0.2em] mb-6 border border-[#fefce8]">
               Customer Love
             </span>
             <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3f6212] leading-tight">
               {title}
             </h2>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#fefce8] p-10 rounded-[2.5rem] relative group hover:-translate-y-2 transition-transform duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-10 right-10 text-[#d97706]/10 text-6xl font-serif leading-none group-hover:text-[#d97706]/20 transition-colors">
                &rdquo;
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#d97706]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>

              <p className="text-[#3f6212]/80 text-lg leading-relaxed mb-8 relative z-10 font-medium">
                {testimonial.content}
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#d9f99d] rounded-full flex items-center justify-center text-[#3f6212] font-bold text-xl uppercase">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-[#3f6212] text-lg">{testimonial.name}</h4>
                  <p className="text-[#3f6212]/50 text-xs uppercase tracking-wider font-bold">Verified Purchase</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Bottom Wave - Transition to next section (White -> White) */}
      {/* Assuming next section is FAQ which uses White bg. No wave needed or use a separator line/wave. */}
       <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-20">
         <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
             <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" opacity=".3"></path>
         </svg>
       </div>
    </section>
  );
}

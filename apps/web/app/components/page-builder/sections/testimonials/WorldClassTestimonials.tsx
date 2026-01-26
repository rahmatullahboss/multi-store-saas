import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { TestimonialsProps } from './types';

// Extend base props if needed
interface WorldClassTestimonialsProps extends TestimonialsProps {
  // Add any specific props here if needed, or just use base
}

export function WorldClassTestimonials({ title, testimonials }: WorldClassTestimonialsProps) {
  return (
    <section className="py-24 bg-stone-50 overflow-hidden relative">
      {/* Decorative large quote mark background */}
      <div className="absolute top-10 left-10 opacity-[0.03] pointer-events-none">
         <span className="text-[300px] font-serif leading-none">"</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
                {title}
            </h2>
            <div className="w-20 h-1 bg-amber-400 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-stone-100 hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                    <div className="flex gap-1 text-amber-500 mb-4">
                        {[...Array(testimonial.rating || 5)].map((_, r) => (
                            <Star key={r} size={18} fill="currentColor" />
                        ))}
                    </div>

                    <p className="text-stone-600 text-lg italic mb-6 leading-relaxed flex-grow" style={{ fontFamily: '"Lato", sans-serif' }}>
                        "{testimonial.text}"
                    </p>

                    <div className="flex items-center gap-4 mt-auto">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                            {testimonial.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-stone-800">{testimonial.name}</h4>
                            <p className="text-xs text-stone-400 uppercase tracking-widest">Verified Customer</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}

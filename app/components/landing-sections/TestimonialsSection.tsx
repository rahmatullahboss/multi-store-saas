/**
 * Testimonials Section Component
 * 
 * Customer review screenshots
 */

import { motion } from 'framer-motion';
import type { BaseSectionProps } from './types';

export function TestimonialsSection({ config }: BaseSectionProps) {
  if (!config.testimonials || config.testimonials.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">গ্রাহকদের রিভিউ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.testimonials.slice(0, 3).map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
            >
              {(testimonial.imageUrl || (testimonial as any).avatar) && (
                <img 
                  src={testimonial.imageUrl || (testimonial as any).avatar} 
                  alt={`Customer review ${idx + 1}`} 
                  className="w-full aspect-[2/3] object-cover"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

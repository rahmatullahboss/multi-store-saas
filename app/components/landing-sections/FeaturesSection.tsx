/**
 * Features Section Component
 * 
 * Product features grid
 */

import { motion } from 'framer-motion';
import type { BaseSectionProps } from './types';

export function FeaturesSection({ config }: BaseSectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">পণ্যের বৈশিষ্ট্য</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{feature.title}</h3>
              {feature.description && (
                <p className="text-gray-600 text-sm">{feature.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

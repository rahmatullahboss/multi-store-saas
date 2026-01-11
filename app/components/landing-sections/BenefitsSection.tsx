/**
 * Benefits Section Component
 * 
 * Why buy from us section
 */

import type { BaseSectionProps } from './types';

export function BenefitsSection({ config }: BaseSectionProps) {
  if (!config.benefits || config.benefits.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">কেন আমাদের থেকে কিনবেন?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.benefits.map((benefit, idx) => (
            <div key={idx} className="bg-emerald-50 p-6 rounded-2xl text-center hover:shadow-lg transition">
              <div className="text-4xl mb-3">{benefit.icon}</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

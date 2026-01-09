/**
 * FAQ Section Component
 * 
 * Frequently Asked Questions accordion
 */

import type { BaseSectionProps } from './types';

export function FaqSection({ config }: BaseSectionProps) {
  if (!config.faq || config.faq.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">সচরাচর জিজ্ঞাসা</h2>
        <div className="space-y-4">
          {config.faq.map((item, idx) => (
            <details key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <summary className="p-5 cursor-pointer flex items-center justify-between text-gray-800 font-medium">
                <span className="pr-4">{item.question}</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

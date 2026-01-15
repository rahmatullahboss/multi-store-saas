import { Leaf } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function OrganicFAQ({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!config.faq || config.faq.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="faq"
      sectionLabel="FAQ"
      data={{ faq: config.faq }}
      onUpdate={(data) => onUpdate?.('faq', data)}
      isEditable={isEditMode}
    >
      <section className={`py-20 bg-green-50/50`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <Leaf className="text-green-600 mx-auto mb-4" size={32} />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Naturally Curious?</h2>
          </div>

          <div className="space-y-4">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-gray-800 text-lg group-hover:text-green-600 transition-colors">
                    {item.question}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${openIndex === i ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'}`}>
                    {openIndex === i ? '-' : '+'}
                  </div>
                </button>
                
                {openIndex === i && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}

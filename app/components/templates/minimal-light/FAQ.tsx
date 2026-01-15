import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function MinimalLightFAQ({
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
      sectionLabel="সচরাচর জিজ্ঞাসা"
      data={{ faq: config.faq }}
      onUpdate={(data) => onUpdate?.('faq', data)}
      isEditable={isEditMode}
    >
      <section className={`py-20 bg-white`}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16 tracking-tight">সাধারণ কিছু প্রশ্ন</h2>

          <div className="space-y-px bg-gray-100 border-y border-gray-100">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-white overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full py-8 flex items-center justify-between text-left group"
                >
                  <span className={`text-lg font-bold transition-all ${openIndex === i ? 'text-gray-950' : 'text-gray-500 hover:text-gray-900'}`}>
                    {item.question}
                  </span>
                  <div className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                    {openIndex === i ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
                
                {openIndex === i && (
                  <div className="pb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-gray-500 leading-relaxed font-medium">
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

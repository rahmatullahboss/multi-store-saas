import { Plus } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ModernPremiumFAQ({
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
      sectionLabel="সাধারণ জিজ্ঞাসা"
      data={{ faq: config.faq }}
      onUpdate={(data) => onUpdate?.('faq', data)}
      isEditable={isEditMode}
    >
      <section className={`py-24 bg-white`}>
        <div className="max-w-4xl mx-auto px-4">
           <h2 className="text-4xl md:text-6xl font-black text-gray-950 italic tracking-tighter uppercase leading-[0.9] text-center mb-24">
            FREQUENT <br /><span className="text-gray-400">QUERIES</span>
          </h2>

          <div className="space-y-6">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden transition-all hover:bg-gray-50">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-10 flex items-center justify-between text-left group"
                >
                  <span className={`font-black text-xl md:text-2xl transition-all uppercase italic tracking-tight ${openIndex === i ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-700'}`}>
                    {item.question}
                  </span>
                  <div className={`w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center transition-all ${openIndex === i ? 'rotate-45 bg-black border-black text-white' : 'text-gray-400'}`}>
                    <Plus size={24} />
                  </div>
                </button>
                
                {openIndex === i && (
                  <div className="px-10 pb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
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

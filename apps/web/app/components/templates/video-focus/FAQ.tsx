import { MessageCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function VideoFocusFAQ({
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
      <section className={`py-20 bg-black`}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-black text-white italic">FREQUENTLY ASKED</h2>
            <div className="h-px flex-1 bg-red-600/30" />
          </div>

          <div className="space-y-4">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-[#0A0A0A] rounded-[1.5rem] border border-white/5 overflow-hidden transition-colors hover:border-red-600/30">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-white text-lg group-hover:text-red-500 transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={`w-6 h-6 text-gray-600 transition-transform duration-500 ${openIndex === i ? 'rotate-180 text-red-600' : ''}`} 
                  />
                </button>
                
                {openIndex === i && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-gray-400 leading-relaxed font-medium">
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

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function FlashSaleFAQ({
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
      <section className={`py-16 md:py-24 ${theme.bgSecondary}`}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} text-center mb-12 uppercase italic tracking-tighter`}>
            ❓ সাধারণ জিজ্ঞাসা
          </h2>

          <div className="space-y-3">
            {config.faq.map((item, i) => (
              <div 
                key={i} 
                className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180 text-red-500' : ''}`} 
                  />
                </button>
                
                {openIndex === i && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-600 leading-relaxed">
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

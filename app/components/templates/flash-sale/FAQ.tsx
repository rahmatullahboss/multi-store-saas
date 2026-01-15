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

  if (!config.faqs || config.faqs.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="faq"
      sectionLabel="FAQ"
      data={{ faqs: config.faqs }}
      onUpdate={(data) => onUpdate?.('faq', data)}
      isEditable={isEditMode}
    >
      <section className={`py-16 md:py-24 ${theme.bgSecondary}`}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} text-center mb-12 uppercase italic tracking-tighter`}>
            ❓ সাধারণ জিজ্ঞাসা
          </h2>

          <div className="space-y-3">
            {config.faqs.map((faq, i) => (
              <div 
                key={i} 
                className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} overflow-hidden`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className={`w-full p-6 flex items-center justify-between text-left ${theme.textPrimary} font-bold text-lg hover:bg-white/5 transition-colors`}
                >
                  <span>{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {openIndex === i && (
                  <div className={`px-6 pb-6 ${theme.textSecondary} leading-relaxed`}>
                    {faq.answer}
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

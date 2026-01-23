import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function PremiumBDFAQ({
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
      <section className={`py-16 bg-gray-50`}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-950">যেকোনো প্রশ্ন ও উত্তর</h2>
          </div>

          <div className="space-y-3">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180 text-orange-500' : ''}`} 
                  />
                </button>
                
                {openIndex === i && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-50 pt-4">
                    <p className="text-gray-600 leading-relaxed font-medium">
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

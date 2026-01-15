import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function MobileFirstFAQ({
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
      <section className={`py-12 bg-gray-50`}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-950 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-indigo-600 rounded-full" />
            সচারচর জিজ্ঞাসা
          </h2>

          <div className="space-y-3">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-indigo-50 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-gray-800 text-base group-hover:text-indigo-600 transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180 text-indigo-600' : ''}`} 
                  />
                </button>
                
                {openIndex === i && (
                  <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-600 leading-relaxed font-medium text-sm">
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

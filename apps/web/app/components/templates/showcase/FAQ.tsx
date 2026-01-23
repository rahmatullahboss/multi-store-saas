import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ShowcaseFAQ({
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
      sectionLabel="Questions"
      data={{ faq: config.faq }}
      onUpdate={(data) => onUpdate?.('faq', data)}
      isEditable={isEditMode}
    >
      <section className={`py-24 bg-black`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-block bg-rose-500/10 text-rose-500 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            FAQ Center
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-16 tracking-tighter">
            Common <br /><span className="text-rose-600 italic">Queries</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {config.faq.map((item, i) => (
              <div key={i} className="group">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full py-8 border-b border-white/10 flex items-center justify-between text-left transition-all"
                >
                  <span className={`text-xl font-bold transition-all ${openIndex === i ? 'text-rose-500 pl-4' : 'text-white pl-0'}`}>
                    {item.question}
                  </span>
                  <ChevronRight 
                    className={`w-6 h-6 text-rose-500 transition-transform duration-500 ${openIndex === i ? 'rotate-90' : 'group-hover:translate-x-2'}`} 
                  />
                </button>
                
                {openIndex === i && (
                  <div className="py-8 px-4 bg-zinc-900/30 rounded-b-3xl animate-in slide-in-from-top-4 duration-500">
                    <p className="text-zinc-500 font-medium leading-relaxed text-lg max-w-3xl">
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

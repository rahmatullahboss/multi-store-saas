import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function LuxeFAQ({
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
      sectionLabel="Concierge FAQ"
      data={{ faq: config.faq }}
      onUpdate={(data) => onUpdate?.('faq', data)}
      isEditable={isEditMode}
    >
      <section className={`py-24 bg-black`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-serif-display text-white tracking-widest uppercase">
              Concierge Service
            </h2>
            <p className="text-amber-500/60 uppercase tracking-[0.3em] text-[10px] mt-4">Frequently Asked Questions</p>
          </div>

          <div className="space-y-px bg-white/5 border border-white/5">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-zinc-950/40 backdrop-blur-sm">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left group"
                >
                  <span className="text-white font-serif-display tracking-widest uppercase text-sm group-hover:text-amber-200 transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-amber-500/40 transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {openIndex === i && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-700">
                    <p className="text-zinc-500 font-light leading-relaxed text-sm max-w-2xl">
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

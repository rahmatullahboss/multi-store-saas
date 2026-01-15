import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ModernDarkFAQ({
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
      <section className={`py-24 bg-zinc-900`}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl lg:text-5xl font-black text-white text-center mb-16 uppercase italic underline decoration-orange-500 decoration-8 underline-offset-8">
            Got Questions?
          </h2>

          <div className="space-y-4">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left group"
                >
                  <span className="text-white font-bold text-lg group-hover:text-orange-500 transition-colors">
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === i ? 'bg-orange-500 text-white rotate-180' : 'bg-zinc-800 text-zinc-500'}`}>
                    {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                
                {openIndex === i && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-zinc-400 leading-relaxed text-lg">
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

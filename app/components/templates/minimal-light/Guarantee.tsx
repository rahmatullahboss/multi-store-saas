import type { SectionProps } from '../_core/types';

export function MinimalLightGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto border border-stone-100 p-16 rounded-[2rem] bg-stone-50/20">
          <div className="w-16 h-16 bg-white border border-stone-200 rounded-full flex items-center justify-center text-2xl mx-auto mb-10 shadow-sm">
            ✨
          </div>
          <h2 className="text-2xl md:text-3xl font-serif italic text-stone-800 leading-relaxed mb-8">
            "{guaranteeText}"
          </h2>
          <div className="h-px w-8 bg-stone-200 mx-auto mb-8"></div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 italic">
            Quality Assurance Standard
          </p>
        </div>
      </div>
    </section>
  );
}

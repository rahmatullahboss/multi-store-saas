import type { SectionProps } from '../_core/types';

export function LuxeGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-32 bg-stone-950 text-white border-t border-stone-800">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto relative px-10 py-20 border border-amber-500/10">
          <div className="absolute -top-1 px-8 bg-stone-950 left-1/2 -translate-x-1/2 text-amber-500 font-serif italic text-xl">
             Legacy
          </div>
          
          <div className="w-20 h-20 bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-center text-3xl mx-auto mb-12 transform rotate-45">
             <div className="-rotate-45">💎</div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-serif italic text-white leading-relaxed mb-12 tracking-tight">
            "{guaranteeText}"
          </h2>
          
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-8"></div>
          
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-stone-600">
            Artisanal Integrity Confirmed
          </p>

          <div className="absolute -bottom-1 px-8 bg-stone-950 left-1/2 -translate-x-1/2 text-stone-800 font-serif italic text-sm">
             Est. 2024
          </div>
        </div>
      </div>
    </section>
  );
}

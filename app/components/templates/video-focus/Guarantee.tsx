import type { SectionProps } from '../_core/types';

export function VideoFocusGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-24 bg-black overflow-hidden relative">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto bg-zinc-950 p-16 md:p-24 rounded-[3rem] border border-zinc-900 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl rotate-12">
             ⚔️
          </div>
          
          <h2 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-10">
            "{guaranteeText}"
          </h2>
          
          <div className="h-0.5 w-16 bg-red-600 mx-auto mb-10"></div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">
             {config.guaranteeBadgeLabel || 'সিনেমেটিক বিশুদ্ধতা নিশ্চিত'}
          </p>

          <div className="mt-12 flex justify-center gap-2">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-600/30"></div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
